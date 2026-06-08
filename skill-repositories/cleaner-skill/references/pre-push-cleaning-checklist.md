# Pre-Push Cleaning Checklist

Run this checklist before pushing to GitHub or another public remote.

## Scan

```bash
node scripts/clean-repo.mjs
```

## Remove safe junk

```bash
node scripts/clean-repo.mjs --write
```

## Strict public-source cleanup

```bash
node scripts/clean-repo.mjs --write --include-build --include-deps --include-archives --fail-on-secret
```

## Verify Git status

```bash
git status --short --ignored
```

## Verify no junk is tracked

```bash
git ls-files | grep -E '(^|/)(.DS_Store|__MACOSX|Thumbs.db|Desktop.ini|.env($|.)|node_modules|dist|build|coverage|.vercel|.netlify)'
```

No output is the desired result.

## Install hook

```bash
bash scripts/install-pre-push-hook.sh
```

## Emergency response for committed secrets

1. Stop pushing.
2. Rotate the credential.
3. Remove the secret from Git history.
4. Force-push only after confirming with the repository owner.
5. Tell affected collaborators to re-clone or reset safely.
