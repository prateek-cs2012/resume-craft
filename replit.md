# ResumeCraft

AI-powered resume builder — upload an existing resume or build from scratch, then download a polished ATS-friendly PDF.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/resume-builder run dev` — run the Angular front-end (port from `$PORT`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Angular 17 standalone + Angular Material (indigo-pink theme)
- API: Express 5 with JWT auth middleware (`jsonwebtoken` + `bcryptjs`)
- DB: PostgreSQL + Drizzle ORM
- Auth: Custom email/password — JWT (30d) signed with `SESSION_SECRET`, stored in localStorage
- Payments: Razorpay (checkout.js loaded in index.html)
- Ads: Google AdSense (free-tier users only, AdUnit component)
- AI: OpenRouter (llama-3.3-70b-instruct:free)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/resume-builder/` — Angular SPA
- `artifacts/api-server/` — Express API server
- `lib/db/src/schema/users.ts` — users table (id, email, passwordHash, tier, aiCredits)
- `artifacts/api-server/src/routes/` — config, auth, user, ai, checkout, parse-resume
- `artifacts/api-server/src/middlewares/requireAuth.ts` — JWT Bearer token middleware
- `artifacts/resume-builder/src/app/services/` — AuthService, UserService, ResumeService
- `artifacts/resume-builder/src/app/components/` — AdUnit, BuyCreditsModal
- `artifacts/resume-builder/src/app/guards/auth.guard.ts` — JWT-based route guard
- `artifacts/resume-builder/src/app/pages/sign-in/` — Angular Material email/password form
- `artifacts/resume-builder/src/app/pages/sign-up/` — Angular Material registration form

## Architecture decisions

- **Custom JWT auth** — email/password hashed with `bcryptjs`, signed into a 30-day JWT using `SESSION_SECRET`. No external auth service dependency.
- **JWT in localStorage** — token key `rc_auth_token`. `AuthService` restores state on boot, checks expiry, and provides `getAuthHeaders()` for all API calls.
- **Bearer token on every protected request** — `requireAuth` middleware in Express verifies the JWT and attaches `req.userId` (number) to the request.
- **Credit decrement is server-side atomic** — credits are decremented with `sql\`aiCredits - 1\`` only after a successful AI response, preventing double-spend.
- **Razorpay payment verified server-side** — HMAC-SHA256 signature checked before any credits are added.

## Product

- Upload PDF/DOCX → AI auto-parses into structured resume data
- Guided 8-step builder with live preview (3 templates: Modern, Executive, Creative)
- AI Optimize button on each bullet point (requires sign-in + credits)
- Free tier: 5 AI credits on sign-up, Google AdSense ads shown
- Credit packs purchasable via Razorpay: 10 for ₹49, 25 for ₹99, 50 for ₹179
- PDF export via browser print

## Required env / secrets

| Key | Notes |
|-----|-------|
| `DATABASE_URL` | Postgres connection string |
| `SESSION_SECRET` | JWT signing secret (min 32 random chars) |
| `OPENROUTER_API_KEY` | For AI parsing + bullet optimization |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret |
| `ADSENSE_PUBLISHER_ID` | Google AdSense publisher ID (served via `/api/config`) |

## User preferences

_Populate as you build._

## Gotchas

- Angular builder (`@angular-devkit/build-angular:application`) does NOT expose `VITE_*` env vars — use `/api/config` to pass public config to the frontend.
- `window as unknown as Record<string, unknown[]>` is needed to push to `adsbygoogle` — Angular's strict TS rejects the direct cast.
- `SESSION_SECRET` doubles as the JWT signing key — it must be set in production secrets or JWTs will fall back to `fallback_dev_secret` (insecure).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Clerk Auth pane in Replit workspace toolbar manages providers/branding — no external Clerk dashboard
