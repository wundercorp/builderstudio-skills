#!/usr/bin/env bash
set -euo pipefail

repository_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
hooks_directory="$repository_root/.git/hooks"
pre_push_hook_path="$hooks_directory/pre-push"
cleaner_script_path="$repository_root/scripts/clean-repo.mjs"

if [ ! -f "$cleaner_script_path" ]; then
  echo "Missing cleaner script: $cleaner_script_path" >&2
  exit 1
fi

mkdir -p "$hooks_directory"

if [ -f "$pre_push_hook_path" ]; then
  backup_path="$pre_push_hook_path.backup.$(date +%Y%m%d%H%M%S)"
  cp "$pre_push_hook_path" "$backup_path"
  echo "Existing pre-push hook backed up to $backup_path"
fi

cat > "$pre_push_hook_path" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail

repository_root="$(git rev-parse --show-toplevel)"
cd "$repository_root"

node scripts/clean-repo.mjs --write --fail-on-secret
node scripts/clean-repo.mjs --fail-on-match --fail-on-secret
HOOK

chmod +x "$pre_push_hook_path"
echo "Cleaner pre-push hook installed at $pre_push_hook_path"
