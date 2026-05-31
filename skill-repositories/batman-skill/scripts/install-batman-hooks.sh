#!/usr/bin/env bash
set -euo pipefail

MODE="pre-push"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if [[ "$MODE" != "pre-push" && "$MODE" != "pre-commit" ]]; then
  echo "--mode must be pre-push or pre-commit" >&2
  exit 1
fi

if [[ ! -d ".git" ]]; then
  echo "Run this script from a Git repository root." >&2
  exit 1
fi

mkdir -p .git/hooks
HOOK_PATH=".git/hooks/$MODE"
cat > "$HOOK_PATH" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail

if [[ -f "scripts/check-batman-theme.mjs" ]]; then
  node scripts/check-batman-theme.mjs
fi
HOOK

chmod +x "$HOOK_PATH"
echo "Installed Batman theme check hook: $HOOK_PATH"
