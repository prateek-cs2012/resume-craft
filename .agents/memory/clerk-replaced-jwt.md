---
name: Clerk replaced with custom JWT auth
description: Why Clerk was removed and what replaced it in ResumeCraft.
---

Clerk was removed because its FAPI proxy consistently failed on Replit production deployments despite multiple fixes (proxyUrl, pk_live_ guard). The root cause was Replit-managed Clerk proxy complexity being incompatible with the Angular + custom domain setup.

**Replacement:**
- `bcryptjs` for password hashing (SALT_ROUNDS = 10)
- `jsonwebtoken` for 30-day JWTs signed with `SESSION_SECRET`
- Token stored in `localStorage` under key `rc_auth_token`
- `AuthService` in Angular: login/register/logout, `getAuthHeaders()` returns `{ Authorization: Bearer <token> }`
- `requireAuth` Express middleware: verifies JWT, sets `req.userId` (number)
- Routes: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

**Why:**
Clerk's Replit-managed proxy requires DNS/CNAME for production, and the auto-swap from pk_test_ to pk_live_ on publish interacted poorly with Angular's dynamic import + proxyUrl initialization.

**How to apply:**
All protected API routes use `requireAuth` and `(req as AuthenticatedRequest).userId`. UserService passes `authService.getAuthHeaders()` on every fetch. DB uses `eq(usersTable.id, userId)` — not a Clerk ID string.
