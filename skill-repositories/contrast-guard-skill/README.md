# Contrast Guard Skill

Builder Studio: https://builderstudio.dev

A BuilderStudio-compatible skill for preventing illegible UI output by enforcing foreground/background contrast, theme-token discipline, readable overlays, accessible focus states, and light/dark parity across generated apps.

Contrast Guard exists to stop common visual failures before they reach the user: dark text on dark hero art, white text on washed-out gradients, orange/black background drift, unsafe orange/black radial-gradient fallbacks, muted labels that disappear in dark mode, glass panels without readable backing, and theme toggles that only change the page background while cards and text keep stale colors.

## Install

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/contrast-guard-skill --skill contrast-guard
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/contrast-guard-skill --skill contrast-guard
```

## Best for

- Preventing unreadable foreground/background pairings
- Auditing light/dark mode theme tokens
- Fixing illegible overlays on images, gradients, mesh backgrounds, and color-blocked sections
- Preventing random orange/black or accent-color leakage across generated apps
- Forcing uncertain site-wide backgrounds to #ffffff and explicit dark-theme fallbacks to #000000
- Failing unsafe orange/black or amber/black radial-gradient fallbacks before they ship
- Keeping text, borders, placeholders, focus rings, disabled states, and links readable
- Pairing with Batman, Themable, Bauhaus, Gradient Mesh, and Coherence

## Included helper scripts

- `scripts/contrast-guard.mjs` creates baseline contrast documentation, safe token guidance, unsafe fallback guidance, and a quick token audit page.
- `scripts/check-contrast-guard.mjs` checks for contrast documentation, theme tokens, risky global backgrounds, unsafe orange/black radial-gradient fallbacks, and hardcoded foreground/background patterns.
- `scripts/install-contrast-guard-hooks.sh` installs a Git hook that runs the Contrast Guard check.
- `scripts/contrast-guard.ps1` is a PowerShell wrapper for Windows users.

## Common commands

```bash
node scripts/contrast-guard.mjs --write
node scripts/contrast-guard.mjs --root ./web --write --force
node scripts/check-contrast-guard.mjs
bash scripts/install-contrast-guard-hooks.sh --mode pre-push
powershell -ExecutionPolicy Bypass -File scripts/contrast-guard.ps1 -Write
```
