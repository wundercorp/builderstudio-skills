# Dependency Upgrade Playbook

## Gather facts

For each finding, capture the package name, current version, vulnerable range, patched range, dependency path, direct parent, package manager, lockfile, runtime reachability, and verification command.

## Prefer the least disruptive patch

1. Upgrade the direct vulnerable package to the lowest fixed compatible version.
2. Upgrade the nearest direct parent when the vulnerable package is transitive.
3. Use overrides, resolutions, constraints, or dependency management only when parent packages have no fixed release or the issue is urgent.
4. Replace the dependency when no safe version exists and the vulnerable feature is reachable.
5. Remove the dependency when it is unused.

## Keep the lockfile honest

Do not edit only the manifest when a lockfile exists. Regenerate or update the lockfile with the project's package manager.

## Verify compatibility

After dependency changes, run install, audit, typecheck, lint, tests, build, and the app's smoke command. Fix breakage introduced by security upgrades.

## Avoid dangerous churn

Do not mass-upgrade unrelated packages unless scanner evidence shows the vulnerable dependency graph requires it. Do not switch package managers as part of a patch unless the project is already broken and the user approves the migration.
