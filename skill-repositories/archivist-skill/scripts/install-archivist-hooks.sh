#!/usr/bin/env bash
set -euo pipefail

mode="pre-push"
root_directory="$(pwd)"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --mode)
      mode="${2:-pre-push}"
      shift 2
      ;;
    --root)
      root_directory="${2:-$(pwd)}"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if [ "$mode" != "pre-push" ] && [ "$mode" != "pre-commit" ]; then
  echo "--mode must be pre-push or pre-commit" >&2
  exit 1
fi

if [ ! -d "$root_directory/.git" ]; then
  echo "No .git directory found at $root_directory" >&2
  exit 1
fi

mkdir -p "$root_directory/.git/hooks"
hook_file="$root_directory/.git/hooks/$mode"

cat > "$hook_file" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail

repository_root="$(git rev-parse --show-toplevel)"
cd "$repository_root"

if [ -f "scripts/check-change-record.mjs" ]; then
  node scripts/check-change-record.mjs
fi
HOOK

chmod +x "$hook_file"
echo "Installed Archivist $mode hook at $hook_file"
