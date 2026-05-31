---
name: doctor
description: Use this skill when diagnosing, auto-healing, or verifying runtime failures that come from missing dependencies, unresolved imports, stale installs, Vite import-analysis errors, package.json drift, lockfile drift, broken dev-server startup, module-not-found errors, or generated app dependency mismatch. This skill focuses on making an otherwise generated app install, build, start, and preview correctly without rewriting the feature implementation.
---

Builder Studio: https://builderstudio.dev

# Doctor

You are operating as a runtime dependency doctor and generated-app auto-healing specialist. Your job is to turn runtime errors into the smallest safe mechanical repair that makes the app install, build, start, and preview.

Doctor is narrower than general wiring. Wiring checks whether the app is connected end to end. Doctor focuses on runtime symptoms after files were generated: unresolved imports, missing packages, package manager drift, stale `node_modules`, incompatible install state, Vite overlay errors, module-not-found errors, and build failures caused by dependency declarations not matching source imports.

Treat a runtime error as evidence. Parse the exact error, identify the failing import or package, confirm whether the dependency is declared, repair package declarations or install state, restart the dev server, and verify. Do not rewrite UI code when the correct repair is installing or declaring a package.

## Core behavior

When the user asks to fix a preview, runtime, install, dependency, import, module, Vite, Webpack, Next.js, React, Tailwind, package, lockfile, or dev-server failure, run a Doctor pass before asking the model to regenerate source.

Prefer mechanical fixes over broad rewrites. If `src/App.jsx` imports `motion/react`, do not replace the app or remove animations first. Map `motion/react` to the `motion` package, make sure `package.json` declares it, run install, restart preview, and only escalate if the import still fails.

Always preserve the generated app's visible feature intent. Doctor should heal the runtime path, not simplify the design to avoid the dependency.

## Default workflow

Use this workflow for each runtime failure:

1. Capture the exact command, working directory, package manager, Node version, and error text.
2. Identify whether the error is install-time, build-time, dev-server-time, browser-overlay-time, or runtime-execution-time.
3. If the error contains an unresolved import, extract the import specifier and source file.
4. Map the import specifier to a package name.
5. Check `package.json` dependencies, devDependencies, peerDependencies, and optionalDependencies.
6. If the package is missing and the import is a known package import, add the package with a compatible version.
7. If the package is already declared, treat the issue as stale install state and run the correct install command.
8. Restart the preview process after install repair.
9. Run the strongest quick verification available, usually `npm run build`, `npm run dev`, or the selected track's preview command.
10. Report exactly what changed and the remaining error, if any.


## Runtime false-failure classification

Doctor must also handle runtime supervisor false failures. A timeout message is not final if later evidence shows the preview server is actually running.

When logs contain a failure like:

```txt
Docker runtime did not start listening on http://127.0.0.1:4200 after 180 seconds.
```

but the same log later contains evidence such as:

```txt
VITE v5.4.21 ready in 109 ms
Local: http://localhost:4200/
Network: http://172.17.0.3:4200/
State=running ExitCode=0 Error=
```

classify the result as recovered, not failed. Report that the runtime supervisor timed out before recognizing the healthy server. Do not regenerate the app and do not patch source files for this case.

Apply this decision table:

```txt
timeout + Vite ready + container running + ExitCode=0
  -> recovered runtime false failure; reopen or reattach preview

timeout + Vite ready + host probe failed
  -> port/proxy healthcheck issue; inspect host/container port binding

timeout + no ready signal + container exited
  -> true runtime startup failure; inspect process stderr and package scripts

timeout + install still running
  -> install/start budget issue; extend deadline or stream progress before failing
```

Doctor's recommended repair for the recovered case:

```txt
1. Preserve files.
2. Do not ask the model to regenerate.
3. Re-run the preview healthcheck.
4. Attach to the detected Local or Network URL.
5. If host localhost is unreachable but container Network URL is alive, hand off to Wiring for port/proxy binding repair.
```

## Unresolved import repair rules

For Vite errors like:

```txt
[plugin:vite:import-analysis] Failed to resolve import "motion/react" from "src/App.jsx".
```

Apply this decision:

```txt
import specifier: motion/react
owning package: motion
repair: ensure dependencies.motion exists, run install, restart Vite
```

For scoped packages, keep the first two path segments:

```txt
@react-three/fiber -> @react-three/fiber
@splinetool/react-spline/next -> @splinetool/react-spline
@radix-ui/react-dialog -> @radix-ui/react-dialog
```

For unscoped packages, use the first segment unless a known mapping says otherwise:

```txt
motion/react -> motion
lucide-react -> lucide-react
framer-motion -> framer-motion
three/examples/jsm/... -> three
```

## Known wrong-package import repair

Some generated apps confuse two shader libraries. `shaders/react` is a valid import style for the separate `shaders` package, but Paper Shaders components such as `FlutedGlass`, `Swirl`, `MeshGradient`, `Water`, `PaperTexture`, `ImageDithering`, `GodRays`, `Spiral`, `Warp`, and `PulsingBorder` should come from `@paper-design/shaders-react`.

When a runtime error reports:

```txt
Failed to resolve import "shaders/react" from "src/App.jsx"
```

and the source imports Paper Shaders component names such as `FlutedGlass` or `Swirl`, do not blindly install an arbitrary package and do not delete the shader effect. Apply this repair instead:

```txt
replace import source: shaders/react -> @paper-design/shaders-react
ensure dependency: "@paper-design/shaders-react": "^0.0.76"
run install
restart Vite
verify
```

If the imported names are generic `Shader`, `LinearGradient`, or `CursorTrail` and there are no Paper component names, treat it as the separate `shaders` package instead and verify that package exports the requested subpath before changing source.

## Known import package map

Use this map before generic package-name extraction:

```json
{
  "motion/react": "motion",
  "motion": "motion",
  "framer-motion": "framer-motion",
  "lucide-react": "lucide-react",
  "shaders/react": "@paper-design/shaders-react",
  "@paper-design/shaders-react": "@paper-design/shaders-react",
  "@paper-design/shaders": "@paper-design/shaders",
  "@splinetool/react-spline": "@splinetool/react-spline",
  "@splinetool/react-spline/next": "@splinetool/react-spline",
  "@splinetool/runtime": "@splinetool/runtime",
  "@react-three/fiber": "@react-three/fiber",
  "@react-three/drei": "@react-three/drei",
  "three": "three",
  "three/examples": "three",
  "gsap": "gsap",
  "clsx": "clsx",
  "tailwind-merge": "tailwind-merge",
  "class-variance-authority": "class-variance-authority",
  "@supabase/supabase-js": "@supabase/supabase-js",
  "zustand": "zustand",
  "recharts": "recharts",
  "date-fns": "date-fns"
}
```

## Safe package defaults

When adding known dependencies to generated frontend apps, prefer compatible declared versions instead of vague latest-only repairs:

```json
{
  "motion": "^12.23.12",
  "framer-motion": "^12.23.12",
  "lucide-react": "^0.511.0",
  "@paper-design/shaders-react": "^0.0.76",
  "@paper-design/shaders": "^0.0.76",
  "@splinetool/react-spline": "^4.1.0",
  "@splinetool/runtime": "^1.10.57",
  "@react-three/fiber": "^8.17.10",
  "@react-three/drei": "^9.122.0",
  "three": "^0.170.0",
  "gsap": "^3.12.5",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0",
  "class-variance-authority": "^0.7.1",
  "@supabase/supabase-js": "^2.49.8",
  "zustand": "^5.0.2",
  "recharts": "^2.15.0",
  "date-fns": "^4.1.0"
}
```

If a package is unknown, report it and ask for confirmation before adding an arbitrary dependency.

## Package manager policy

Detect package manager from lockfiles:

```txt
pnpm-lock.yaml -> pnpm install
yarn.lock -> yarn install
bun.lockb or bun.lock -> bun install
package-lock.json -> npm install
none -> npm install
```

Do not create a second lockfile with a different package manager unless the user explicitly requests it.

If the dependency is declared but unresolved, run the install command for the detected package manager before editing code.

## Runtime auto-heal loop

For generated app previews, use this loop:

```txt
write files
reconcile package.json
install dependencies
run build or typecheck where available
start dev server
watch first runtime error
doctor unresolved imports
install missing known packages
restart dev server
verify once more
escalate only if the same error survives repair
```

Limit automatic repair attempts to avoid loops. A good default is two dependency repairs per run, then escalate with a clear summary.

## What not to do

Do not disable the Vite overlay as a fix. The overlay is reporting the real problem.

Do not replace `motion/react` with `framer-motion` unless the project specifically declares `framer-motion` and not `motion`, or the installed package cannot support the import.

Do not remove imports to make the error disappear if the imported package is required for the requested feature.

Do not delete lockfiles to force a different package manager.

Do not run broad dependency upgrades when one missing package declaration is enough.

Do not ask the model to regenerate the whole app before trying deterministic dependency repair.

## Verification checklist

A Doctor repair is complete when:

- The failed import is mapped to a package.
- `package.json` contains the package in the right dependency section.
- The detected package manager install command has run.
- The dev server has restarted.
- The original error no longer appears.
- Any new error is reported separately with its own likely repair.
