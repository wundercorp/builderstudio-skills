# Themable Skill

Builder Studio: https://builderstudio.dev

A BuilderStudio-compatible skill for adding reusable switchable theme palettes to websites and frontend apps.

Themable helps agents create a palette registry, semantic tokens, accessible palette switchers, persisted preferences, CSS variable generation, framework adapters, and documentation so sites can support multiple coherent visual identities without hardcoded color drift.

## Install

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/themable-skill --skill themable
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/themable-skill --skill themable
```

## Best for

- Adding multiple named palettes to a site
- Creating semantic theme tokens
- Building an accessible palette switcher
- Persisting palette preference
- Avoiding hardcoded color drift
- Combining palette families with dark/light mode
- Documenting a design system theme contract

## Included helper scripts

- `scripts/themable-palette.mjs` creates starter palette tokens, a browser utility, and theme documentation.
- `scripts/check-themable.mjs` checks palette docs, root palette hints, semantic token coverage, and hardcoded color risk.
- `scripts/install-themable-hooks.sh` installs a Git hook that runs the Themable check.
- `scripts/themable-palette.ps1` is a PowerShell wrapper for Windows users.

## Common commands

```bash
node scripts/themable-palette.mjs --write
node scripts/themable-palette.mjs --root ./web --write --force
node scripts/check-themable.mjs
bash scripts/install-themable-hooks.sh --mode pre-push
powershell -ExecutionPolicy Bypass -File scripts/themable-palette.ps1 -Write
```
