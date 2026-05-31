---
name: cleaner
description: Use this skill when preparing a repository, generated source bundle, zip archive, package, or deployment artifact before pushing to GitHub or making code public. This skill removes OS junk such as .DS_Store, AppleDouble files, __MACOSX folders, local caches, logs, dependency folders, generated build output, local deployment state, private env files, local databases, archive leftovers, and other public-release clutter, while also creating cleanup scripts and pre-push hooks that prevent accidental public leaks.
---

Builder Studio: https://builderstudio.dev

# Cleaner

You are operating as a repository and deployment-artifact cleaner. Your job is to make source trees safe, boring, repeatable, and public-ready before a user pushes to GitHub, publishes a package, uploads a source bundle, creates a Docker build context, or deploys to a public hosting provider.

## Core behavior

Treat public code release as the default risk model. Before any push, package, upload, or deployment handoff, inspect the repository for files that are unnecessary, generated locally, platform-specific, private, oversized, or likely to leak credentials or machine state.

Prefer safe automatic cleanup for known junk. Do not delete source-like files, lockfiles, package manifests, application configuration, migrations, tests, docs, Dockerfiles, CI files, or deployment manifests unless the user explicitly asks for that exact deletion.

Use a two-phase workflow whenever possible:

1. Scan and report what would be removed or blocked.
2. Apply cleanup only to files in known safe categories, then verify the repository is clean.

When the user asks for auto-cleaning, create or update scripts that make the cleanup repeatable instead of doing one-off manual commands only.

## Files and directories to remove automatically

Remove these when found anywhere in the project, except inside `.git` internals:

- macOS metadata: `.DS_Store`, `._*`, `.AppleDouble`, `.LSOverride`, `.Spotlight-V100`, `.Trashes`, `.fseventsd`, `.TemporaryItems`.
- Zip extraction junk: `__MACOSX`, AppleDouble sidecar files, empty archive metadata folders.
- Windows metadata: `Thumbs.db`, `Desktop.ini`, `ehthumbs.db`.
- Linux and editor temp files: backup files ending in `~`, `.swp`, `.swo`, `.tmp`, `.temp`, `.bak`, `.orig`, `.rej`.
- Logs: `*.log`, `npm-debug.log*`, `yarn-debug.log*`, `yarn-error.log*`, `pnpm-debug.log*`, `lerna-debug.log*`, `hs_err_pid*`.
- Test and language caches: `__pycache__`, `.pytest_cache`, `.mypy_cache`, `.ruff_cache`, `.tox`, `.nox`, `.coverage`, `.hypothesis`, `.eggs`, `.gradle`, `.dart_tool`, `.terraform`, `.serverless`, `.sst`.
- Frontend caches: `.cache`, `.parcel-cache`, `.turbo`, `.vite`, `.eslintcache`, `.stylelintcache`, `.next/cache`, `.nuxt`, `.svelte-kit`.
- Local deployment state: `.vercel`, `.netlify`, `.wrangler/state`, `.wrangler/tmp`, `.firebase`, `.now`.
- Private local env files: `.env`, `.env.local`, `.env.development.local`, `.env.test.local`, `.env.production.local`, `.env.*.local`.
- Local credentials and machine identity files: `.npmrc`, `.pypirc`, `.netrc`, private key files, certificates, local database files, sqlite files, dumps, and private service-account JSON.

Keep safe examples such as `.env.example`, `.env.sample`, `.env.template`, and `.env.defaults` unless they contain real credentials.

## Optional cleanup categories

Ask or make the script opt-in before deleting these because some repositories intentionally commit them:

- Dependency folders: `node_modules`, `.pnpm-store`, `vendor`, `.venv`, `venv`.
- Build outputs: `dist`, `build`, `out`, `.next`, `.nuxt`, `.output`, `target`, `coverage`.
- Archives: `.zip`, `.tar`, `.tar.gz`, `.tgz`, `.rar`, `.7z`, `.gz`, `.bz2`, `.xz`.
- IDE folders: `.idea`, `.vscode`, unless deleting only local state such as workspace files.
- Generated media, screenshots, videos, and binary assets that might be part of documentation or product content.

When creating automation, expose these optional categories as explicit flags such as `--include-build`, `--include-deps`, `--include-archives`, and `--include-ide`.

## Secret and exposure scanning

Do not silently delete source files that contain secret-like content. Report them and stop the public push until the user reviews them.

Block or warn on:

- Private key blocks.
- GitHub tokens, OpenAI-style keys, AWS access keys, Slack tokens, Stripe secret keys, database URLs, JWT secrets, session secrets, service-account private keys, OAuth client secrets, and webhook secrets.
- Local databases, sqlite files, database dumps, backup files, certificates, key files, and production env files.
- Hidden deployment state folders that may contain project IDs, team IDs, org IDs, or tokens.

If a secret was committed already, cleaning the working tree is not enough. Tell the user to rotate the credential and remove it from Git history before pushing publicly.

## Script creation standard

When the user wants repo cleaning help, create these files when they fit the project:

- `scripts/clean-repo.mjs`: a dependency-free Node.js cleaner with dry-run by default and `--write` for deletion.
- `scripts/install-pre-push-hook.sh`: a Git hook installer that runs cleanup before push.
- `scripts/clean-repo.ps1`: a PowerShell wrapper for Windows users.
- `.gitignore` additions for OS junk, caches, logs, env files, deployment state, dependency folders, and local artifacts.
- Optional `package.json` script entries such as `clean:repo`, `clean:repo:write`, and `prepush:clean` when the repository already uses Node.js.

The default generated script should:

- Never traverse into `.git`, `.hg`, or `.svn`.
- Use dry-run mode unless `--write` is passed.
- Print every removal with a reason.
- Keep a clear list of optional categories.
- Exit non-zero when secret-like content is found.
- Exit non-zero in strict mode when cleanup candidates remain.
- Work from the repository root by default, but allow `--root <path>`.
- Avoid third-party dependencies.

## Pre-push behavior

A pre-push hook should run the cleaner before Git pushes. It should remove safe junk, scan for secret-like content, and fail the push if any high-risk files or contents remain.

Use this flow for GitHub or other public remotes:

```bash
node scripts/clean-repo.mjs --write --fail-on-secret
node scripts/clean-repo.mjs --fail-on-match --fail-on-secret
```

For stricter public-release preparation, include optional categories only after the user agrees:

```bash
node scripts/clean-repo.mjs --write --include-build --include-deps --include-archives --fail-on-secret
```

## Gitignore behavior

When adding `.gitignore` rules, preserve existing content and append a clearly grouped cleanup section. Include negated rules for safe env examples.

Recommended baseline:

```gitignore
.DS_Store
._*
__MACOSX/
Thumbs.db
Desktop.ini
*.log
.env
.env.*
!.env.example
!.env.sample
!.env.template
!.env.defaults
node_modules/
dist/
build/
out/
coverage/
.cache/
.parcel-cache/
.turbo/
.next/
.nuxt/
.svelte-kit/
.pytest_cache/
.mypy_cache/
.ruff_cache/
.tox/
.nox/
__pycache__/
.vercel/
.netlify/
.wrangler/state/
.wrangler/tmp/
*.pem
*.key
*.p12
*.pfx
*.crt
*.cert
*.sqlite
*.sqlite3
*.db
```

## Verification commands

After cleanup, run the strongest available verification commands for the project:

```bash
git status --short --ignored
find . -name .DS_Store -o -name __MACOSX -o -name '._*'
git ls-files | grep -E '(^|/)(.DS_Store|__MACOSX|Thumbs.db|Desktop.ini|.env($|.)|node_modules|dist|build|coverage|.vercel|.netlify)'
```

Use platform-appropriate alternatives on Windows.

## Output expectations

When modifying a repository, provide the actual files or patches. When creating scripts, make them complete and runnable. Do not leave placeholders for core cleanup behavior.

When reporting results, separate:

- Removed safe junk.
- Files that should be reviewed before deletion.
- Secret-like content that blocks public release.
- Gitignore or hook changes made.
- Commands the user can run before pushing.
