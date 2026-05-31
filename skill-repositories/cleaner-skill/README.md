# Cleaner Skill

Builder Studio: https://builderstudio.dev

A BuilderStudio-compatible skill for preparing repositories and source bundles before public pushes, GitHub publishing, npm publishing, static hosting, Docker builds, or other deployments where code becomes public.

Use this skill when the agent should remove operating-system junk, AppleDouble files, generated archive metadata, local caches, logs, dependency folders, build artifacts, local deployment state, private env files, and other files that should not be pushed or included in public deployment artifacts.

## Install

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/cleaner-skill --skill cleaner
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/cleaner-skill --skill cleaner
```

## Best for

- Cleaning generated repositories before GitHub pushes
- Removing `.DS_Store`, `._*`, and `__MACOSX` files from zip-extracted projects
- Adding safe pre-push cleanup scripts
- Blocking obvious secrets, private keys, local env files, logs, local databases, and deployment metadata
- Preparing source bundles for Vercel, Netlify, Docker, npm packages, Python packages, and static hosting
- Producing public-safe `.gitignore`, cleanup scripts, and verification commands

## Included helper scripts

- `scripts/clean-repo.mjs` scans a repository, removes safe-to-delete junk with `--write`, and reports secret-like content without deleting source files.
- `scripts/install-pre-push-hook.sh` installs a Git pre-push hook that runs the cleaner before every push.
- `scripts/clean-repo.ps1` is a PowerShell wrapper for Windows users.

## Common commands

```bash
node scripts/clean-repo.mjs
node scripts/clean-repo.mjs --write
node scripts/clean-repo.mjs --write --include-build --include-deps --include-archives
bash scripts/install-pre-push-hook.sh
powershell -ExecutionPolicy Bypass -File scripts/clean-repo.ps1 -Write
```
