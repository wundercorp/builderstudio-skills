#!/usr/bin/env bash
set -euo pipefail

mode="pre-push"
root="$(pwd)"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      mode="$2"
      shift 2
      ;;
    --root)
      root="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if [[ "$mode" != "pre-push" && "$mode" != "pre-commit" ]]; then
  echo "--mode must be pre-push or pre-commit" >&2
  exit 1
fi

git_directory="$(git -C "$root" rev-parse --git-dir)"
hook_path="$git_directory/hooks/$mode"
mkdir -p "$(dirname "$hook_path")"
cat > "$hook_path" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail
node scripts/check-coherence.mjs
HOOK
chmod +x "$hook_path"
echo "Installed $mode hook at $hook_path"
