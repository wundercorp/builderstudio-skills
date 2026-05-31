# Wiring Skill

Builder Studio: https://builderstudio.dev

A BuilderStudio-compatible skill for checking and fixing application wiring problems that can stop an app from running, building, rendering, styling, routing, importing, deploying, or loading its runtime dependencies correctly. It includes a dependency-free static checker at `scripts/check-wiring.mjs` for repeatable wiring audits.

Use this skill when an app appears complete but may fail because files are not connected correctly: entry points, package scripts, dependency declarations, CSS imports, asset references, routes, aliases, environment variables, framework configuration, build tools, backend routes, database clients, monorepo workspace links, Docker/deployment files, or other glue code.

## Install

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/wiring-skill --skill wiring
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/wiring-skill --skill wiring
```

## Best for

- Making sure the intended app start command is actually wired correctly
- Fixing missing or incorrect CSS, font, image, and asset references
- Repairing broken imports, exports, path aliases, and filename casing
- Checking package scripts, package manager lockfiles, dependency declarations, and runtime versions
- Verifying frontend route registration, provider setup, global styles, and app bootstrap files
- Verifying backend route mounting, middleware order, controllers, services, and server entry points
- Checking monorepo workspace wiring, package exports, TypeScript references, and build order
- Checking Docker, deployment, serverless, and static-hosting wiring before handoff
- Diagnosing runtime healthcheck, Docker port binding, preview proxy, and `/runtime/start` fallback issues

## Included checker

```bash
node scripts/check-wiring.mjs --root /path/to/app
node scripts/check-wiring.mjs --root /path/to/app --fix
node scripts/check-wiring.mjs --root /path/to/app --strict
```

The checker reports missing local imports, CSS asset references, HTML entry references, suspicious package script paths, undeclared imported packages, package entry fields, Docker COPY sources, and common deployment-output mismatches. `--fix` only applies safe mechanical specifier/reference updates when a likely existing target is unambiguous.
