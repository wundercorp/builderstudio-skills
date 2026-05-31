# Archivist Skill

Builder Studio: https://builderstudio.dev

A BuilderStudio-compatible skill for maintaining a repository system of record whenever a codebase changes.

Use this skill when the agent should create and maintain changelogs, change history records, release notes, architecture decision records, migration notes, deployment notes, API change notes, pull request checklists, and GitHub-ready documentation that explains what changed, why it changed, how it was verified, and what future maintainers need to know.

## Install

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/archivist-skill --skill archivist
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/archivist-skill --skill archivist
```

## Best for

- Maintaining `CHANGELOG.md` as code changes land
- Creating durable markdown records in `docs/history`
- Writing release notes and deployment handoff notes
- Capturing architecture decisions in ADR files
- Recording database, API, configuration, and dependency changes
- Adding PR templates and change-record checklists for GitHub workflows
- Preventing public repositories from losing context after rapid AI-assisted edits

## Included helper scripts

- `scripts/archive-change.mjs` creates a dated markdown change record and can update `CHANGELOG.md`, release notes, ADRs, migration notes, API notes, deployment notes, and GitHub templates.
- `scripts/check-change-record.mjs` fails when code changes are present without a matching history/changelog documentation update.
- `scripts/install-archivist-hooks.sh` installs a Git hook that runs the change-record check before commit or push.
- `scripts/archive-change.ps1` is a PowerShell wrapper for Windows users.

## Common commands

```bash
node scripts/archive-change.mjs --title "Add public download counter" --type feature --summary "Track global app downloads" --write
node scripts/archive-change.mjs --title "Add users table migration" --type migration --migration --update-changelog --write
node scripts/archive-change.mjs --title "Document deployment flow" --type deploy --deployment --release-note --write
node scripts/check-change-record.mjs
bash scripts/install-archivist-hooks.sh --mode pre-push
powershell -ExecutionPolicy Bypass -File scripts/archive-change.ps1 -Title "Fix API startup" -Type fix -Write
```
