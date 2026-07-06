---
name: Angular 17 Replit host check fix
description: How to fix "Blocked request. This host is not allowed" for Angular 17 app-builder dev server on Replit.
---

## The problem
Angular 17's `@angular-devkit/build-angular:dev-server` (Vite-based application builder) ignores:
- A custom `vite.config.ts` in the project root — Angular creates its Vite instance programmatically and does NOT merge user vite configs
- The `--disable-host-check` CLI flag — only works for the legacy webpack builder, not the application builder
- `disableHostCheck: true` in angular.json — schema says "has no effect with application builder"
- `allowedHosts: ["all"]` in angular.json — Vite doesn't treat "all" as a wildcard

## The fix
In `package.json`, prefix the `dev` script with a Node.js one-liner that patches the Angular dev-server source to use `allowedHosts: true`:

```json
"dev": "node -e \"const fs=require('fs'),f='node_modules/@angular-devkit/build-angular/src/builders/dev-server/vite-server.js',c=fs.readFileSync(f,'utf8');if(!c.includes('allowedHosts: true'))fs.writeFileSync(f,c.replace('allowedHosts: serverOptions.allowedHosts','allowedHosts: true'));\" && NG_CLI_ANALYTICS=false ng serve --host 0.0.0.0 --port ${PORT:-4200}"
```

**Why:** Angular's `vite-server.js` line 362 passes `allowedHosts: serverOptions.allowedHosts` (a `string[] | undefined`) directly to Vite. Vite 7 only skips the host check when `allowedHosts === true` (boolean). The patch replaces that value with the literal `true`. The `!c.includes('allowedHosts: true')` guard makes it idempotent.

**How to apply:** Any time an Angular 17 (application builder) project is created on Replit, apply this patch to the `dev` script before the `ng serve` command.
