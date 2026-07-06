import { Router } from "express";

const router = Router();

/**
 * GET /api/config
 * Returns public client-side configuration.
 */
router.get("/config", (_req, res): void => {
  res.json({
    razorpayKeyId: process.env["RAZORPAY_KEY_ID"] ?? "",
    adsensePublisherId: process.env["ADSENSE_PUBLISHER_ID"] ?? "",
    googleClientId: process.env["GOOGLE_CLIENT_ID"] ?? "",
  });
});

export default router;
