# Containerization Checklist

## Build

- The dependency install command matches the lockfile.
- The build command is documented and works without local-only state.
- The Docker build context excludes secrets and heavy generated folders.
- Multi-stage builds are used when they reduce image size and risk.

## Runtime

- The production command is not a development server.
- The app reads `PORT`.
- The app binds to `0.0.0.0` inside the container.
- Logs go to stdout and stderr.
- Required environment variables are documented.

## Verification

- `docker build` command is documented.
- `docker run` command is documented.
- Health check URL is documented.
- Expected successful response is documented.
