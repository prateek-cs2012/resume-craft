import { Router } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireAuth, signToken, type AuthenticatedRequest } from "../middlewares/requireAuth";
import type { Request } from "express";

const router = Router();
const SALT_ROUNDS = 10;

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/register
 * Creates a new account and returns a signed JWT.
 */
router.post("/auth/register", async (req, res): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !emailRx.test(email)) {
    res.status(400).json({ error: "A valid email address is required." });
    return;
  }
  if (!password || password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters." });
    return;
  }

  const [existing] = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (existing) {
    res.status(409).json({ error: "An account with this email already exists." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [user] = await db
    .insert(usersTable)
    .values({ email: email.toLowerCase(), passwordHash, tier: "free", aiCredits: 5 })
    .returning();

  req.log.info({ userId: user.id }, "New user registered");

  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, tier: user.tier, aiCredits: user.aiCredits },
  });
});

/**
 * POST /api/auth/login
 * Verifies credentials and returns a signed JWT.
 */
router.post("/auth/login", async (req, res): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase()));

  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password." });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.json({
    token,
    user: { id: user.id, email: user.email, tier: user.tier, aiCredits: user.aiCredits },
  });
});

/**
 * POST /api/auth/google
 * Verifies a Google ID token and returns a signed JWT.
 * Creates the user account automatically on first sign-in.
 */
router.post("/auth/google", async (req, res): Promise<void> => {
  const { credential } = req.body as { credential?: string };

  if (!credential) {
    res.status(400).json({ error: "Missing Google credential." });
    return;
  }

  const clientId = process.env["GOOGLE_CLIENT_ID"];
  if (!clientId) {
    res.status(503).json({ error: "Google sign-in is not configured on this server." });
    return;
  }

  let email: string;
  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      res.status(400).json({ error: "Could not retrieve email from Google account." });
      return;
    }
    email = payload.email.toLowerCase();
  } catch {
    res.status(401).json({ error: "Invalid Google credential." });
    return;
  }

  let [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    [user] = await db
      .insert(usersTable)
      .values({ email, passwordHash: null, tier: "free", aiCredits: 5 })
      .returning();
    req.log.info({ userId: user.id }, "New user registered via Google");
  }

  const token = signToken({ userId: user.id, email: user.email });
  res.json({
    token,
    user: { id: user.id, email: user.email, tier: user.tier, aiCredits: user.aiCredits },
  });
});

/**
 * GET /api/auth/me
 * Returns the current user's profile (requires Bearer token).
 */
router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthenticatedRequest).userId;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  res.json({ id: user.id, email: user.email, tier: user.tier, aiCredits: user.aiCredits });
});

export default router;
