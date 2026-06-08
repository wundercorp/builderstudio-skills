# Linguist Skill

Builder Studio: https://builderstudio.dev

A BuilderStudio-compatible skill for auto-configuring websites and frontend apps with comprehensive multilingual support.

Linguist helps agents add locale routing, translation dictionaries, key conventions, fallback behavior, formatting utilities, SEO `hreflang` metadata, accessible language switchers, extraction checks, and documentation.

## Install

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/linguist-skill --skill linguist
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/linguist-skill --skill linguist
```

## Best for

- Adding multilingual support to a site
- Creating locale route conventions
- Replacing hardcoded user-facing strings
- Adding accessible language switchers
- Handling pluralization and locale formatting
- Adding localized SEO metadata
- Documenting translation workflows

## Included helper scripts

- `scripts/linguist-i18n.mjs` creates starter locale config, dictionaries, utility helpers, and i18n documentation.
- `scripts/check-linguist.mjs` checks locale docs, translation dictionaries, HTML language handling hints, and hardcoded string risk.
- `scripts/install-linguist-hooks.sh` installs a Git hook that runs the Linguist check.
- `scripts/linguist-i18n.ps1` is a PowerShell wrapper for Windows users.

## Common commands

```bash
node scripts/linguist-i18n.mjs --write
node scripts/linguist-i18n.mjs --root ./web --write --force
node scripts/check-linguist.mjs
bash scripts/install-linguist-hooks.sh --mode pre-push
powershell -ExecutionPolicy Bypass -File scripts/linguist-i18n.ps1 -Write
```
