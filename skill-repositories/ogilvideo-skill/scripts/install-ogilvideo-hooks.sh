#!/usr/bin/env bash
set -euo pipefail
mode="pre-push"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      mode="${2:-pre-push}"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done
if [[ ! -d .git/hooks ]]; then
  echo "No .git/hooks directory found. Run this from a Git repository root."
  exit 1
fi
hook_path=".git/hooks/${mode}"
cat > "${hook_path}" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail
node scripts/check-ogilvideo.mjs
HOOK
chmod +x "${hook_path}"
echo "Installed Ogilvideo ${mode} hook."
