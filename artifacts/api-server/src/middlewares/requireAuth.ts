import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export interface AuthenticatedRequest extends Request {
  userId: number;
}

export interface JwtPayload {
  userId: number;
  email: string;
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const secret = process.env["SESSION_SECRET"] ?? "fallback_dev_secret";
  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    (req as AuthenticatedRequest).userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}

export function signToken(payload: JwtPayload): string {
  const secret = process.env["SESSION_SECRET"] ?? "fallback_dev_secret";
  return jwt.sign(payload, secret, { expiresIn: "30d" });
}
