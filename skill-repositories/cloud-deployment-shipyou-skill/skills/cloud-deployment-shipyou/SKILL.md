---
name: cloud-deployment-shipyou
description: Use this skill when preparing an application for cloud deployment, containerization, Docker-based handoff, or ShipYou deployment readiness. This skill emphasizes portable containers, clean source bundles, health checks, environment configuration, production start commands, and safe deployment defaults.
---

Builder Studio: https://builderstudio.dev

# Cloud Deployment for ShipYou

You are preparing software for a cloud deployment handoff. The goal is a clean, portable, Docker-friendly project that can be built, started, health-checked, and inspected without hidden local assumptions.

ShipYou readiness means the source bundle should be easy for a deployment platform or deployment operator to understand, build, run, and verify. Do not assume undocumented ShipYou APIs. Prepare the application using standard container and deployment conventions unless the project explicitly contains ShipYou-specific configuration.

## Core behavior

Before adding deployment files, identify the application type, package manager, runtime, build command, production start command, required environment variables, expected port, static assets, database dependency, and health check path.

Keep the deployment layer simple. Do not change application behavior unless it is required for deployment readiness. When a runtime needs changes, make them explicit and minimal.

## Required deployment qualities

A deployment-ready project should include:

- A clear `README.md` with local, Docker, and deployment commands.
- A `.gitignore` that excludes dependencies, build output, local env files, logs, and OS files.
- A `.dockerignore` that keeps containers small and prevents secrets from entering the build context.
- A `Dockerfile` when the app can be containerized.
- A production start command.
- A build command when the app requires compilation or bundling.
- A health check route for APIs and full-stack apps.
- `PORT` environment variable support.
- Binding to `0.0.0.0` instead of `localhost` inside containers.
- Logs written to stdout and stderr.
- No committed secrets.
- No `node_modules`, build artifacts, caches, or local database files in source bundles.

## Dockerfile standards

Prefer small, understandable Dockerfiles. Use multi-stage builds when the project has a build step or heavy development dependencies.

For Node.js apps:

- Use an official Node LTS image.
- Copy package manifests before source files for better layer caching.
- Use `npm ci`, `pnpm install --frozen-lockfile`, or `yarn install --frozen-lockfile` based on the detected lockfile.
- Build in a builder stage when needed.
- Run only production dependencies in the runtime stage when practical.
- Set `NODE_ENV=production` in the runtime image.
- Expose the expected port.
- Start with the production command, not a dev server.

For Python apps:

- Use an official Python slim image.
- Install from `requirements.txt`, `pyproject.toml`, or the existing dependency file.
- Use a real production server for web apps when the framework expects one.
- Read the port from `PORT` when possible.

For static frontends:

- Build static assets first.
- Serve them with a simple production server or an nginx-style static runtime when appropriate.
- Do not ship a development server as the production command.

## Runtime configuration

Use environment variables for configuration. Document every required environment variable with a safe placeholder and purpose. Never include real secret values.

Prefer these conventions:

- `PORT` for the listening port.
- `HOST=0.0.0.0` or equivalent framework setting when needed.
- `NODE_ENV=production` for Node.js runtime images.
- `DATABASE_URL` for database connection strings when the app uses a database.
- `REDIS_URL` for Redis when needed.

## Health checks

APIs and backend services should expose a simple health endpoint such as `/health` that returns a fast, non-sensitive status response.

Health checks should not require authentication, should not expose secrets, and should not perform expensive database writes. A deeper readiness check may verify dependencies, but the basic liveness check should be cheap and reliable.

## Source bundle hygiene

Before deployment handoff, ensure the source bundle excludes:

- `.env` and `.env.*` files with real values.
- `node_modules`.
- `.next`, `dist`, `build`, `coverage`, cache directories, and generated artifacts unless the platform explicitly requires them.
- Logs.
- Local database files.
- Private keys, certificates, and tokens.
- OS files such as `.DS_Store`.

Include:

- Source code.
- Package manifests and lockfiles.
- Dockerfile and `.dockerignore`.
- README deployment instructions.
- Example environment file with safe placeholders when useful.

## ShipYou handoff checklist

When asked to prepare a project for ShipYou, produce or verify these items:

1. Confirm the app has a deterministic install command.
2. Confirm the app has a deterministic build command when needed.
3. Confirm the app has a production start command.
4. Confirm the app reads `PORT` and binds to `0.0.0.0`.
5. Confirm a health check exists or add one when the stack allows it.
6. Add Dockerfile and `.dockerignore`.
7. Document required environment variables.
8. Remove local-only assumptions.
9. Keep secrets out of the repository and source bundle.
10. Provide final verification commands.

## Output expectations

When creating deployment files, provide complete files. Do not leave placeholders for core commands that can be inferred from the project. If a required value cannot be known, use a safe placeholder and document exactly where it should be replaced.

When reviewing deployment readiness, return a checklist with pass, needs work, and missing items.

When generating a new app, design it to be deployment-ready from the beginning rather than adding containerization as an afterthought.
