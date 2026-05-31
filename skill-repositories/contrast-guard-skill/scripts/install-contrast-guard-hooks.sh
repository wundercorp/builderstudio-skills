#!/usr/bin/env bash
set -euo pipefail

MODE="pre-push"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="${2:-pre-push}"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

mkdir -p .git/hooks
cat > ".git/hooks/${MODE}" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail
node scripts/check-contrast-guard.mjs
HOOK
chmod +x ".git/hooks/${MODE}"
echo "Installed Contrast Guard ${MODE} hook."
