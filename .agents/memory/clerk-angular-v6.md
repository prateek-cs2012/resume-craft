---
name: Clerk Angular v6 integration
description: How to use @clerk/clerk-js v6 in Angular 17 strict-TS without build errors
---

## Rule
Use dynamic import + `any`-cast for `@clerk/clerk-js` in Angular. Static import breaks `tsc --strict` because v6 exports a class+namespace merge that TypeScript rejects with TS2351 / TS2709.

```ts
const ClerkLib = (await import('@clerk/clerk-js')) as any;
const ClerkCtor = (ClerkLib.Clerk ?? ClerkLib.default) as new (k: string) => any;
this.clerk = new ClerkCtor(publishableKey);
```

**Why:** `@clerk/clerk-js` v6 merges a class and a namespace under the same `Clerk` identifier. Angular's strict TS mode (no `skipLibCheck`) treats this as "not constructable" and raises TS2351. Dynamic import with `as any` is the only clean escape.

**How to apply:** Any Angular service that wraps `@clerk/clerk-js` must use this pattern. Never add `"skipLibCheck": true` to the tsconfig as a workaround — it masks other real errors.

## Companion patterns

- `window as unknown as Record<string, unknown[]>` — needed to push to `adsbygoogle` array; Angular rejects `window as Record<string, unknown>` directly.
- `import.meta.env.BASE_URL` — NOT available in Angular's esbuild builder. Serve public config (Clerk publishable key, Razorpay key ID) from `GET /api/config` instead.
- Clerk publishable key is not secret — safe to return from a public API endpoint.
