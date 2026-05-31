# Doctor Skill

Builder Studio: https://builderstudio.dev

A BuilderStudio-compatible skill for diagnosing and auto-healing generated app runtime failures caused by missing dependencies, unresolved imports, stale installs, package.json drift, lockfile drift, Vite import-analysis errors, module-not-found errors, and dev-server startup failures.

Use Doctor when a generated app looks structurally correct but fails in runtime or preview because source imports and installed packages are out of sync.

## Install

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/doctor-skill --skill doctor
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/doctor-skill --skill doctor
```

## Best for

- Vite errors like `Failed to resolve import "motion/react" from "src/App.jsx"`
- Missing packages after a model generated valid imports
- Package.json dependency drift after generated files are written
- Stale `node_modules` after package.json changed
- Dependency reconciliation before preview
- Generated app auto-healing without broad regeneration
- Repairing wrong-package shader imports like `shaders/react` with Paper Shaders components
- Safe package manager detection from lockfiles
- Restart-and-verify loops after dependency repairs

## Included checker

```bash
node scripts/check-doctor.mjs --root /path/to/app
node scripts/check-doctor.mjs --root /path/to/app --fix
node scripts/check-doctor.mjs --root /path/to/app --from-error '[plugin:vite:import-analysis] Failed to resolve import "motion/react" from "src/App.jsx".'
```

The checker scans source imports and optional runtime error text, maps unresolved imports to package names, reports missing declarations, and can add known safe frontend dependency versions to `package.json` with `--fix`.

## Runtime false-failure classification

Doctor can classify timeout logs as recovered when the supervisor reports a timeout but later output shows Vite ready, a Local or Network URL, and a running container with ExitCode 0.
