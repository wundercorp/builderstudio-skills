# Public Release Cleaning Policy

Use this policy before pushing code to GitHub, publishing a package, building a public Docker image, uploading a source bundle, or deploying a project where source files may become visible.

## Always remove

- `.DS_Store`
- `._*`
- `__MACOSX/`
- `.AppleDouble/`
- `.Spotlight-V100/`
- `.Trashes/`
- `.fseventsd/`
- `.TemporaryItems/`
- `Thumbs.db`
- `Desktop.ini`
- `ehthumbs.db`
- backup, swap, temp, reject, and patch leftovers
- logs and debug crash outputs
- language caches and test caches
- local deployment state folders
- private env files
- local credentials and key files
- local databases and dumps

## Keep by default

- Source files
- Tests
- Documentation
- Lockfiles
- Package manifests
- CI workflows
- Dockerfiles
- Deployment manifests
- `.env.example`, `.env.sample`, `.env.template`, and `.env.defaults` when they use placeholders only

## Require explicit opt-in

- Dependency directories
- Build outputs
- Archives
- IDE folders
- Generated screenshots or media
- Large binary assets

## Stop the push

Stop the push when secret-like content is detected. Do not rely on deleting the working-tree file if the secret was already committed. Rotate the credential and clean Git history before making the repository public.
