import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router = Router();

/**
 * GET /api/user/me
 * Returns the current user's profile.
 */
router.get("/user/me", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthenticatedRequest).userId;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    tier: user.tier,
    aiCredits: user.aiCredits,
  });
});

export default router;
