# Professional Development Checklist

Use this checklist before finalizing code changes.

## Structure

- The project uses one clear stack and one clear package manager.
- Files are named consistently and imports match exact casing.
- Large files are split around real responsibilities.
- Shared helpers live in predictable locations.
- External services are isolated behind adapters.

## Code quality

- Names communicate intent.
- Functions are focused.
- Errors are handled intentionally.
- Dead code and unused imports are removed.
- Dependencies are necessary and used.
- Types describe the domain accurately.

## UI

- Buttons are buttons and links are links.
- Inputs have labels.
- Interactive elements have focus states.
- Loading, empty, error, and success states exist.
- Layout works on desktop, tablet, and mobile.

## Backend

- Request data is validated.
- Secrets are read from environment variables.
- Health checks exist for services.
- Logs are useful and do not expose sensitive values.
- External responses are narrowed before use.

## Verification

- Existing tests still pass.
- New important logic has tests or clear manual verification.
- Build, lint, and type-check commands are listed when available.
