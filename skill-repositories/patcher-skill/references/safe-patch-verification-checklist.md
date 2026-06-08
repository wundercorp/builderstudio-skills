# Safe Patch Verification Checklist

Use this checklist after applying patches.

## Dependency verification

- The manifest and lockfile are both updated.
- The package manager did not change unexpectedly.
- The patched version satisfies the advisory's fixed range.
- Peer dependency warnings are reviewed.
- The scanner result is improved or the remaining finding is documented.

## Build verification

- Dependencies install successfully.
- Typecheck or compilation succeeds.
- Lint runs when configured.
- Tests run when configured.
- Production build succeeds.
- App startup or smoke check succeeds.

## Container verification

- Docker image builds successfully.
- The final image uses the expected base image.
- The app starts as the intended user.
- Health check passes when configured.
- Image scan is rerun after rebuild.

## Release verification

- CI still runs.
- No secrets were added.
- No scanner suppressions were added without explanation.
- Remaining risk is sorted by severity and reachability.
