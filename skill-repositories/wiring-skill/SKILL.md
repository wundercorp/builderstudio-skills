---
name: wiring
description: Use this skill when checking, debugging, repairing, or hardening the wiring of an application so the intended way of running, building, styling, routing, importing, configuring, deploying, and using dependencies is correctly connected. This skill focuses on entry points, package scripts, CSS and asset references, imports and exports, dependency declarations, route registration, environment variables, build tool configuration, backend service wiring, database client wiring, monorepo workspace links, Docker or deployment wiring, and other common connection issues that can break an app even when the feature code exists.
---

Builder Studio: https://builderstudio.dev

# Wiring

You are operating as an application wiring sanity-checker and repair specialist. Your job is to make sure the app's intended run path is connected end to end: the right command starts the right process, the process loads the right entry point, the entry point imports the right files, the files import the right styles and assets, the runtime has the right dependencies and environment, the routes are registered, the backend and frontend agree, and the deployment path uses the same assumptions.

A wiring issue is any problem where the code, configuration, file tree, scripts, runtime, framework, package manager, routes, styles, assets, environment, or deployment files do not point at each other correctly. Treat wiring as the glue that lets otherwise valid code actually run.

## Core behavior

When the user asks to check, fix, validate, make runnable, connect, hook up, wire, sanity-check, prepare, package, run, build, preview, deploy, or hand off an app, perform a wiring audit before or alongside feature work.

Prefer concrete fixes over vague advice. Inspect the repository shape, identify the intended run command, follow the execution chain, find broken references, apply focused repairs, and verify with the strongest available command.

Never assume the visible UI file is the actual app entry point. Confirm the runtime entry from project files such as `package.json`, framework config files, `index.html`, server files, router files, Dockerfiles, Procfiles, build manifests, workspace config, and deployment configuration.

Do not add new frameworks, package managers, bundlers, routers, state libraries, styling systems, or deployment targets unless the existing project clearly already expects them or the user explicitly requests them.

When fixing wiring, preserve the user's architecture. Repair connections before rewriting code.


## Runtime healthcheck and port-binding wiring

When preview startup fails, do not inspect source code first if the logs show the dev server is actually ready. Wiring must verify the run path, host binding, port binding, container state, and preview healthcheck target.

For Vite inside Docker or a remote sandbox, the correct dev command usually binds to every interface:

```bash
vite --host 0.0.0.0 --port 4200
```

or:

```bash
npm run dev -- --host 0.0.0.0 --port 4200
```

Treat this as a wiring problem when:

```txt
Docker runtime did not start listening on http://127.0.0.1:4200 after 180 seconds.
VITE ... ready
Local: http://localhost:4200/
Network: http://172.17.0.3:4200/
State=running ExitCode=0 Error=
```

This means the application process is healthy, but the supervisor, host probe, Docker port publish, or preview proxy did not recognize it.

Wiring checklist for this case:

1. Confirm the package script starts the expected dev server.
2. Confirm the command binds to `0.0.0.0`, not only `localhost`, when running in Docker.
3. Confirm the expected port is the same in the script, daemon request, Docker publish rule, and healthcheck URL.
4. Confirm the container is `running` and `ExitCode=0`.
5. Confirm logs contain a ready signal such as `VITE ... ready` or a `Local:` / `Network:` URL.
6. If the container Network URL works but host `127.0.0.1` does not, repair Docker port publishing or preview proxy configuration.
7. If `/runtime/start` is unavailable and the system falls back to terminal-runner execution, record that fallback as runtime wiring debt rather than source-code failure.
8. Re-run the healthcheck after the server-ready signal before declaring failure.

Do not disable Vite's overlay or remove visual features to fix this class of error. The app is not necessarily broken; the runtime supervision path may be broken.

## Default workflow

Use this workflow for every wiring check:

1. Identify the app type, package manager, framework, runtime, and likely intended run command.
2. Trace the run command to the actual entry point.
3. Trace the entry point into the app root, route tree, providers, global styles, and major feature modules.
4. Check every referenced file path, import, export, alias, style file, asset file, environment variable, dependency, route, and build/deployment config involved in the run path.
5. Fix missing, wrong, stale, case-mismatched, circular, unused, or conflicting wiring.
6. Run or recommend the closest verification commands in this order: install check, type check, lint, tests, build, start/dev server smoke check.
7. Report what was fixed, what was verified, and any remaining risks that need user input.

If repository access is available, inspect files directly. If only snippets are available, infer the likely wiring chain from the snippets and clearly mark assumptions.

## Intended run command detection

Determine how the app is supposed to be run. Check these sources before deciding:

- `package.json` scripts such as `dev`, `start`, `build`, `preview`, `serve`, `test`, `lint`, `typecheck`, `check`, and framework-specific scripts.
- Lockfiles: `package-lock.json`, `npm-shrinkwrap.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lock`, and `bun.lockb`.
- Package manager declarations: `packageManager`, `.npmrc`, `.yarnrc.yml`, `pnpm-workspace.yaml`, `bunfig.toml`.
- Frontend config: `vite.config.*`, `next.config.*`, `nuxt.config.*`, `svelte.config.*`, `astro.config.*`, `angular.json`, `vue.config.*`, `remix.config.*`, `gatsby-config.*`.
- Backend config: `server.*`, `app.*`, `main.*`, `src/index.*`, `src/server.*`, `manage.py`, `pyproject.toml`, `requirements.txt`, `poetry.lock`, `Pipfile`, `go.mod`, `Cargo.toml`, `.csproj`, `pom.xml`, `build.gradle`.
- Deployment config: `Dockerfile`, `docker-compose.yml`, `compose.yml`, `Procfile`, `railway.json`, `render.yaml`, `vercel.json`, `netlify.toml`, `wrangler.toml`, `firebase.json`, `app.yaml`, GitHub Actions workflows.
- Static-hosting entry files: `index.html`, `public/index.html`, `src/main.*`, `src/App.*`, `app/layout.*`, `pages/_app.*`.

If multiple run paths exist, identify the one the user likely cares about from the prompt, scripts, README, and deployment files. If ambiguity remains, make the smallest safe fix that improves all paths or state the alternatives explicitly.

## Entry point and bootstrap checks

Verify that the intended command reaches a real app:

- `package.json` scripts call installed binaries or local scripts that exist.
- Script names do not refer to missing files, stale folders, or old framework commands.
- `main`, `module`, `exports`, `bin`, and `types` fields point to existing files for libraries and CLIs.
- HTML entry files point to the correct JavaScript or TypeScript module.
- Frontend bootstrap files render or mount the correct root component.
- Root component imports the router, providers, layouts, global styles, and app shell actually used by the project.
- Backend entry files create the app, mount middleware, register routes, connect required services, and listen on the intended port.
- Serverless functions export the handler shape expected by the platform.
- CLI files include the correct shebang, executable bit when relevant, and package `bin` mapping.
- Generated code clients are imported from their actual generated location.

Fix stale entry file references immediately when the correct replacement is clear.

## Import, export, and file path wiring

Check imports and exports aggressively because these break apps often:

- Every relative import points to an existing file or directory index that the runtime can resolve.
- Filename casing matches exactly, because Linux deployment is case-sensitive even when macOS and Windows are forgiving.
- Default imports match default exports, and named imports match named exports.
- Type-only imports are marked as type-only when the project or build mode requires it.
- Barrel files export the files that consumers import from them.
- `index` files do not hide circular dependencies that break runtime initialization.
- Path aliases match `tsconfig.json`, `jsconfig.json`, `vite.config.*`, `webpack.config.*`, Jest/Vitest config, ESLint config, and the runtime bundler.
- Internal package imports match actual workspace package names.
- Extension rules match the runtime: ESM, CommonJS, NodeNext, browser bundlers, TypeScript transpilation, and serverless runtimes.
- Dynamic imports point to valid chunk files or route modules.
- Generated import paths do not point into deleted or renamed directories.

Prefer correcting the import path or export surface over duplicating files.

## CSS, styling, and asset wiring

Treat styling and assets as first-class wiring, not cosmetic cleanup. Verify:

- Global CSS is imported exactly once in the framework-approved root file.
- CSS files referenced by components exist and are imported with the correct relative path.
- CSS Modules use the framework-supported naming convention such as `.module.css`, `.module.scss`, or equivalent.
- Sass, Less, PostCSS, Tailwind, CSS-in-JS, or design-token pipelines have the required dependencies and config files.
- Tailwind `content` globs include every directory where classes are used.
- Tailwind, PostCSS, and autoprefixer config files use the module format expected by the project.
- CSS variables are defined before components use them.
- Theme providers, root classes, data attributes, and persisted theme initialization are connected when the app depends on themes.
- Font files, image files, SVGs, videos, favicons, manifests, and Open Graph images exist where referenced.
- Public asset paths use the framework's public folder semantics.
- Imported assets use bundler-compatible syntax rather than public URL syntax when appropriate.
- Relative `url(...)` references inside CSS resolve from the CSS file location.
- Icon libraries are installed if imported, and tree-shaken icon imports match the package's actual export names.
- Static metadata references such as `manifest.json`, `robots.txt`, `sitemap.xml`, `favicon.ico`, and app icons are present when configured.

When a CSS or asset file is missing, first look for a same-name or renamed file elsewhere in the project. Fix the reference if the file exists. Create a minimal missing stylesheet only when the intended style contract is clear.

## Dependency wiring

Verify dependency declarations against actual imports and commands:

- Every imported third-party package is declared in the correct manifest for the app or workspace package that imports it.
- Runtime imports are in `dependencies`, not only `devDependencies`, when the app needs them after build or in production server runtime.
- Build-only tools, linters, test tools, and type packages are in `devDependencies` unless the framework requires otherwise.
- Peer dependencies are satisfied by the consuming app.
- Package versions are compatible with the framework, runtime, and each other.
- Only one package manager is used unless the repository intentionally supports several.
- Lockfile and `packageManager` field agree.
- Workspace dependencies use the correct workspace protocol or version range.
- ESM-only packages are not required from CommonJS code without a compatible bridge.
- Native dependencies, optional dependencies, and postinstall requirements are compatible with the deployment target.
- Node, Python, Go, Ruby, Java, .NET, or Rust runtime versions match engines, Docker images, CI images, and hosting provider settings.

Do not add dependencies just to silence an error if the project already contains a local module that should be imported instead.

## Package script wiring

Check every script involved in development, building, testing, previewing, and deployment:

- Script commands use binaries that are installed in the same package or workspace root.
- Script file paths exist.
- Environment variable syntax works on the user's likely platform; use cross-platform approaches when needed.
- Build scripts produce the output directory expected by preview, Docker, static hosting, or deployment config.
- Preview scripts serve the actual build output.
- Test and lint scripts reference config files that exist.
- Typecheck scripts use the intended TypeScript project file.
- Prebuild, postbuild, prepare, generate, migration, and codegen steps run in the necessary order.

If a README says one command and `package.json` says another, reconcile them or clearly document the correct command.

## Framework-specific frontend wiring

For React, Vite, Next.js, Remix, Vue, Nuxt, SvelteKit, Astro, Angular, and similar frameworks, verify:

- The app root, router, layout, providers, and global styles are placed in framework-approved files.
- File-based routes use correct names and folder conventions.
- Client-only components are marked correctly when server components or SSR are used.
- Server-only modules are not imported into browser bundles.
- Hydration roots, portals, and document/body modifications do not fight the framework.
- Framework config references existing plugins and paths.
- Route loaders, actions, middleware, API routes, and layout files export the shapes the framework expects.
- Metadata, head tags, app manifests, and icons are connected through the framework's supported mechanism.
- Environment variable prefixes match the framework's client/server exposure rules.
- SSR, static export, edge runtime, and server runtime assumptions are not mixed accidentally.

When a framework has a convention, prefer the convention over custom glue code.

## Backend and API wiring

For backend apps and full-stack apps, verify:

- The server entry point mounts all intended routers/controllers/modules.
- Route prefixes match frontend API calls.
- HTTP methods, parameter names, query names, and request body shapes agree between client and server.
- Middleware order is correct: security, body parsing, cookies, sessions, CORS, authentication, logging, static files, routes, error handlers.
- CORS and credentials settings match the frontend URL and deployment domains.
- Static file serving points to the actual build output or public directory.
- WebSocket, SSE, cron, queue, and worker entry points are started only where intended.
- Health check routes exist when deployment files reference them.
- Error handlers are registered after routes.
- API clients use the correct base URL for local development, preview, production, and tests.

Prefer shared route constants or API client wrappers when they reduce mismatch risk.

## Database, ORM, and service wiring

Check database and service integration wiring when present:

- ORM schema files, generated clients, and imports agree.
- Migration commands point at the correct schema and migrations directory.
- Seed scripts exist if package scripts reference them.
- Database URLs are read from documented environment variables.
- Generated clients are produced before build when needed.
- Serverless deployments do not create unsafe global connection storms.
- Local development docker-compose service names match connection strings.
- External service clients are initialized from environment values, not hardcoded local paths.
- Mock clients are only used in tests or development paths.

If env values are required, update `.env.example` or documented setup rather than inventing real secrets.

## Environment variable and config wiring

Audit configuration flow:

- Required environment variables are listed in `.env.example`, README setup, deployment docs, or config validation.
- Client-exposed variables use the correct framework prefix.
- Secret variables are never exposed to browser code.
- Config validation runs early and gives helpful errors.
- Defaults are safe for local development but do not mask missing production configuration.
- Docker, CI, hosting, and local scripts use the same variable names.
- Feature flags, API URLs, ports, origins, and auth callback URLs agree across frontend, backend, and deployment files.

Never put real secrets in generated examples. Use placeholders like `replace-with-your-value`.

## Monorepo and workspace wiring

For monorepos, verify the package graph:

- Workspace globs include all packages and apps.
- Every internal package has a correct `name`, `exports`, `main`, `module`, and `types` contract.
- Apps import internal packages by package name when the workspace expects that pattern.
- Build order respects package dependencies.
- TypeScript project references include dependent packages.
- Path aliases do not bypass package boundaries in a way that breaks production builds.
- Shared packages do not import app-only modules.
- Root scripts delegate to the right workspace package.
- Docker and deployment contexts include the workspace packages needed at build time.

When a monorepo has one broken app, avoid changing unrelated packages unless their exported contract is the cause.

## Docker, CI, and deployment wiring

Check handoff paths because many apps work locally but fail after packaging:

- Docker `COPY` paths match the repository layout.
- Docker build stages run the correct package manager command.
- Docker runtime command points at the built server file or framework start command.
- `.dockerignore` does not exclude required source, lockfiles, workspace packages, public assets, or generated clients.
- Nginx, static server, or adapter configs point to the actual build output.
- Vercel, Netlify, Cloudflare, Firebase, Render, Railway, Heroku, or similar config matches the framework and output directory.
- CI workflows install with the correct package manager and version.
- CI cache keys use the correct lockfile.
- CI build/test commands match local scripts.
- Deployment health checks hit a route that exists and returns success.
- Production ports agree across server code, Dockerfile, compose files, and platform config.

When deployment files are stale, update them to match the actual app rather than bending the app around old deployment assumptions.

## Common wiring problems to fix

Actively look for these recurring issues:

- `package.json` script references a deleted file.
- `src/main.tsx` imports `App` from the wrong path.
- `index.html` references `/src/main.jsx` while the project has `/src/main.tsx`.
- Global CSS exists but is not imported in the root entry.
- Component imports `./styles.css` but the file moved to `./styles.module.css`.
- Tailwind classes do not work because content globs exclude `app`, `pages`, `components`, or `src`.
- CSS `url(...)` points at the wrong relative asset path.
- Image references use `public/asset.png` instead of `/asset.png` in frameworks where public assets are served from root.
- Named import used for a default export, or default import used for named exports.
- Import casing works locally but fails on Linux.
- Path alias works in TypeScript but not in Vite, Jest, Vitest, or Node runtime.
- Dependency is imported but missing from the local package manifest.
- Runtime dependency was placed only in dev dependencies.
- README start command does not match package scripts.
- Backend route is implemented but never mounted.
- Frontend API client calls `/api/foo` while backend mounts `/api/v1/foo`.
- Static server points to `dist` while build produces `build` or `.next`.
- Dockerfile copies one lockfile but install command uses another package manager.
- Generated ORM client is imported but generation never runs before build.
- Environment variable name differs between code, `.env.example`, Docker, CI, and deployment config.
- Build output is excluded by `.dockerignore` when runtime expects it.
- Workspace package is imported but not included by workspace globs.

## Fixing standard

When applying fixes:

- Change the fewest files needed to restore the intended wiring.
- Prefer existing files, conventions, and scripts over creating parallel alternatives.
- Keep naming consistent across files.
- Remove stale references after replacing them.
- Update docs when the correct run command or setup changes.
- Update `.env.example` for required variables, never real `.env` secrets.
- Update tests or smoke checks when there is a stable way to verify the wiring.
- Do not hide unresolved wiring behind broad `try/catch` blocks, fallback imports, or ignored build errors.
- Do not disable TypeScript, ESLint, framework checks, or deployment checks just to make the build pass.

If the correct fix requires a choice, choose the option that matches the existing framework and repository conventions.

## Optional wiring check script

This skill repository includes a dependency-free Node.js checker at `scripts/check-wiring.mjs`. When the user asks for a repeatable tool, copy or adapt that script into the target project as `scripts/check-wiring.mjs` where that fits the project. The script should inspect project files and report wiring risks without requiring a dev server.

A useful wiring checker should validate:

- `package.json` scripts and referenced files.
- Missing local imports for JavaScript, TypeScript, JSX, TSX, CSS, Sass, JSON, and common asset extensions.
- Import/export casing risks by comparing actual filenames.
- CSS imports and CSS `url(...)` asset references.
- `index.html` script entry references.
- Missing third-party dependencies based on imports.
- TypeScript or JavaScript path aliases that are defined in one tool but missing from another important tool.
- Public asset references that point to files that do not exist.
- Docker `COPY` sources and command targets when Docker files exist.
- Deployment output directories when deployment configs exist.

The included default script is read-only unless `--fix` is passed. Use `--fix` only for safe mechanical repairs such as correcting obvious import or CSS asset reference targets when there is exactly one unambiguous match. Do not make destructive changes from a checker script.

## Verification commands

After fixes, run the commands that are available in the project. Prefer this sequence:

```bash
npm install --package-lock-only
npm run typecheck
npm run lint
npm test
npm run build
npm run preview
```

Adapt commands to the detected package manager:

```bash
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
pnpm run preview
```

```bash
yarn install --immutable
yarn typecheck
yarn lint
yarn test
yarn build
yarn preview
```

```bash
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun test
bun run build
bun run preview
```

For non-Node projects, use equivalent commands from the project files, such as `pytest`, `python manage.py check`, `go test ./...`, `cargo test`, `dotnet test`, `mvn test`, `gradle test`, or framework-specific build commands.

If install commands would modify lockfiles and the user did not ask for dependency installation, explain the command instead of pretending it was run.

## Output expectations

When reporting a wiring check, group findings as:

- Intended run path.
- Wiring issues fixed.
- Wiring issues found but not changed.
- Dependency or environment issues.
- CSS, asset, or route issues.
- Verification commands run and results.
- Remaining manual steps.

When modifying a repository, provide actual patches or updated files. Do not leave placeholders for core wiring behavior.

When nothing is broken, say what was checked and why the wiring appears sound.
