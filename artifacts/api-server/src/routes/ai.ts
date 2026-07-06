import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireAuth, type AuthenticatedRequest } from "../middlewares/requireAuth";

const router = Router();
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

const OPTIMIZE_SYSTEM_PROMPT = `You are an expert resume writer. Rewrite the given resume bullet point to be more impactful, ATS-friendly, and action-oriented.

Rules:
- Start with a strong action verb
- Include quantifiable results where possible (e.g. "reduced latency by 40%")
- Keep it concise — one sentence, max 25 words
- Do NOT add fabricated numbers if none exist in the original
- Return ONLY the improved bullet point text, no explanation, no quotes, no markdown`;

/**
 * POST /api/ai/optimize-bullet
 * Auth-gated, credit-checked. Rewrites a resume bullet point using AI.
 */
router.post(
  "/ai/optimize-bullet",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = (req as AuthenticatedRequest).userId;
    const { bullet } = req.body as { bullet?: string };

    if (!bullet || typeof bullet !== "string" || bullet.trim().length < 5) {
      res.status(400).json({ error: "Bullet text is required." });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    // Premium users bypass the credit gate
    if (user.tier !== "premium" && user.aiCredits <= 0) {
      res.status(402).json({ error: "No AI credits remaining.", code: "NO_CREDITS" });
      return;
    }

    const apiKey = process.env["OPENROUTER_API_KEY"];
    if (!apiKey) {
      res.status(500).json({ error: "AI service is not configured." });
      return;
    }

    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://resume-craft--prateekcs2012.replit.app",
          "X-Title": "ResumeCraft",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.3-70b-instruct:free",
          max_tokens: 150,
          messages: [
            { role: "system", content: OPTIMIZE_SYSTEM_PROMPT },
            { role: "user", content: bullet.trim() },
          ],
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        req.log.error({ status: response.status, errBody }, "OpenRouter AI error");
        res.status(502).json({ error: "AI model returned an error. Please try again." });
        return;
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const optimized = (data.choices?.[0]?.message?.content ?? "").trim();

      if (!optimized) {
        res.status(502).json({ error: "AI returned empty response. Please try again." });
        return;
      }

      if (user.tier === "premium") {
        req.log.info({ userId }, "AI used by premium user (no credit deducted)");
        res.json({ optimized, creditsRemaining: -1 });
      } else {
        // Decrement credit atomically only on success for free users
        await db
          .update(usersTable)
          .set({ aiCredits: sql`${usersTable.aiCredits} - 1` })
          .where(eq(usersTable.id, userId));
        req.log.info({ userId, creditsLeft: user.aiCredits - 1 }, "AI credit used");
        res.json({ optimized, creditsRemaining: user.aiCredits - 1 });
      }
    } catch (err) {
      req.log.error({ err }, "ai/optimize-bullet fetch failed");
      res.status(500).json({ error: "Network error contacting AI service." });
    }
  },
);

export default router;
