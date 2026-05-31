# Cloud Deployment for ShipYou Skill

Builder Studio: https://builderstudio.dev

A BuilderStudio-compatible skill for preparing generated apps for ShipYou-style deployment handoff.

The skill focuses on containerization, source bundle hygiene, health checks, environment variable contracts, and production-safe defaults.

## Install

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/cloud-deployment-shipyou-skill --skill cloud-deployment-shipyou
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/cloud-deployment-shipyou-skill --skill cloud-deployment-shipyou
```

## Best for

- Containerizing web apps and APIs
- Creating Dockerfiles and `.dockerignore` files
- Making apps listen on `0.0.0.0` and `PORT`
- Adding health checks
- Preparing clean deployable source bundles
- Avoiding secrets, build artifacts, and local-only assumptions
