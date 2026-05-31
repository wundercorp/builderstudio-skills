# Mimar Skill

Builder Studio: https://builderstudio.dev

A BuilderStudio-compatible skill for automatically creating and maintaining `ARCHITECTURE.md` files that explain how a codebase, feature, tool, directory structure, service, or application is designed, architected, wired, and implemented.

Use this skill when the agent should inspect a project, infer its architecture, and produce practical Markdown documentation with a clear directory map, run flow, dependency map, component/service boundaries, feature diagrams, implementation notes, and verification guidance.

## Best for

- Creating a new `ARCHITECTURE.md` for an existing codebase
- Documenting a newly built feature before handoff
- Explaining how directories, modules, routes, components, services, jobs, APIs, and data flows fit together
- Producing Markdown-native architecture diagrams that render in GitHub and developer tools
- Keeping architecture docs aligned with the actual implementation after code changes
- Helping future agents and developers understand where a feature lives and how to safely extend it

## Included generator

```bash
node scripts/generate-architecture.mjs --root /path/to/app
node scripts/generate-architecture.mjs --root /path/to/app --feature "checkout"
node scripts/generate-architecture.mjs --root /path/to/app --output docs/ARCHITECTURE.md
node scripts/generate-architecture.mjs --root /path/to/app --stdout
```

The generator performs a local repository scan, detects common frameworks, package managers, run commands, entry points, feature files, important directories, Docker and deployment files, dependency groups, and writes a usable `ARCHITECTURE.md` with a Mermaid diagram plus a Markdown directory tree.

## Install

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/mimar-skill --skill mimar
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/mimar-skill --skill mimar
```

