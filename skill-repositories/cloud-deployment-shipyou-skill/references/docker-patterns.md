# Docker Patterns

## Node package manager detection

Use the lockfile to choose the install command.

- `package-lock.json` means `npm ci`.
- `pnpm-lock.yaml` means `pnpm install --frozen-lockfile`.
- `yarn.lock` means `yarn install --frozen-lockfile`.

## Node production runtime

A production container should usually set `NODE_ENV=production`, expose the application port, and run the production start command from `package.json`.

## Server binding

Inside a container, binding to `localhost` can make the service unreachable from outside the container. Prefer `0.0.0.0` for the server host.

## Health endpoint

Use a fast response such as:

```json
{
  "status": "ok"
}
```

Do not include secrets, private hostnames, tokens, or detailed dependency credentials in health responses.
