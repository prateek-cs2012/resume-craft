import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { eq, sql } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router = Router();

const CREDIT_PACKS: Record<string, { credits: number; amountPaise: number; label: string }> = {
  pack_10: { credits: 10, amountPaise: 4900, label: "10 AI Credits" },
  pack_25: { credits: 25, amountPaise: 9900, label: "25 AI Credits" },
  pack_50: { credits: 50, amountPaise: 17900, label: "50 AI Credits" },
};

function getRazorpay() {
  const keyId = process.env["RAZORPAY_KEY_ID"];
  const keySecret = process.env["RAZORPAY_KEY_SECRET"];
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/**
 * POST /api/checkout/create-order
 */
router.post(
  "/checkout/create-order",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = (req as AuthenticatedRequest).userId;
    const { packId } = req.body as { packId?: string };

    const pack = packId ? CREDIT_PACKS[packId] : undefined;
    if (!pack) {
      res.status(400).json({ error: "Invalid pack ID.", validPacks: Object.keys(CREDIT_PACKS) });
      return;
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      res.status(503).json({ error: "Payment gateway is not configured." });
      return;
    }

    const order = await razorpay.orders.create({
      amount: pack.amountPaise,
      currency: "INR",
      receipt: `rc_${userId}_${Date.now()}`,
      notes: { userId: String(userId), packId: packId!, credits: String(pack.credits) },
    });

    req.log.info({ userId, packId, orderId: order.id }, "Razorpay order created");
    res.json({ orderId: order.id, amount: pack.amountPaise, currency: "INR", pack });
  },
);

/**
 * POST /api/checkout/verify-payment
 */
router.post(
  "/checkout/verify-payment",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = (req as AuthenticatedRequest).userId;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packId } =
      req.body as {
        razorpay_order_id?: string;
        razorpay_payment_id?: string;
        razorpay_signature?: string;
        packId?: string;
      };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !packId) {
      res.status(400).json({ error: "Missing payment verification fields." });
      return;
    }

    const pack = CREDIT_PACKS[packId];
    if (!pack) {
      res.status(400).json({ error: "Invalid pack ID." });
      return;
    }

    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keySecret) {
      res.status(503).json({ error: "Payment gateway not configured." });
      return;
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      req.log.warn({ userId, razorpay_order_id }, "Invalid payment signature");
      res.status(400).json({ error: "Payment verification failed." });
      return;
    }

    const [updated] = await db
      .update(usersTable)
      .set({ aiCredits: sql`${usersTable.aiCredits} + ${pack.credits}` })
      .where(eq(usersTable.id, userId))
      .returning({ aiCredits: usersTable.aiCredits });

    req.log.info({ userId, packId, creditsAdded: pack.credits }, "Credits added after payment");
    res.json({ success: true, creditsAdded: pack.credits, newCredits: updated?.aiCredits ?? 0 });
  },
);


const PREMIUM_PLAN = {
  amountPaise: 49900,
  label: "ResumeCraft Premium (Lifetime)",
};

/**
 * POST /api/checkout/create-premium-order
 */
router.post(
  "/checkout/create-premium-order",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = (req as AuthenticatedRequest).userId;

    const [user] = await db
      .select({ tier: usersTable.tier })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (user?.tier === "premium") {
      res.status(400).json({ error: "Already a Premium member." });
      return;
    }

    const razorpay = getRazorpay();
    if (!razorpay) {
      res.status(503).json({ error: "Payment gateway is not configured." });
      return;
    }

    const order = await razorpay.orders.create({
      amount: PREMIUM_PLAN.amountPaise,
      currency: "INR",
      receipt: `premium_${userId}_${Date.now()}`,
      notes: { userId: String(userId), type: "premium_upgrade" },
    });

    req.log.info({ userId, orderId: order.id }, "Premium upgrade order created");
    res.json({ orderId: order.id, amount: PREMIUM_PLAN.amountPaise, currency: "INR", label: PREMIUM_PLAN.label });
  },
);

/**
 * POST /api/checkout/verify-premium
 */
router.post(
  "/checkout/verify-premium",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = (req as AuthenticatedRequest).userId;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body as {
        razorpay_order_id?: string;
        razorpay_payment_id?: string;
        razorpay_signature?: string;
      };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ error: "Missing payment verification fields." });
      return;
    }

    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keySecret) {
      res.status(503).json({ error: "Payment gateway not configured." });
      return;
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      req.log.warn({ userId, razorpay_order_id }, "Invalid premium payment signature");
      res.status(400).json({ error: "Payment verification failed." });
      return;
    }

    await db
      .update(usersTable)
      .set({ tier: "premium" })
      .where(eq(usersTable.id, userId));

    req.log.info({ userId }, "User upgraded to Premium");
    res.json({ success: true, tier: "premium" });
  },
);

export default router;
