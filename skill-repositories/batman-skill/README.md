# Batman Skill

Builder Studio: https://builderstudio.dev

A BuilderStudio-compatible skill for adding a dark-mode-first, toggleable light/dark theme system to websites and frontend apps.

Batman helps agents create theme tokens, root theme handling, local persistence, no-flash initialization, accessible switch controls, contrast-safe foreground/background token pairs, and documentation so sites start in dark mode by default but still give users an obvious light/dark toggle.

## Install

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/batman-skill --skill batman
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/batman-skill --skill batman
```

## Best for

- Adding dark-mode-first theming to a site
- Creating an accessible light/dark switch visible from the initial page
- Avoiding flash of light theme before dark mode applies
- Replacing hardcoded colors with semantic tokens
- Normalizing mismatched theme systems
- Documenting a repo-wide theme contract
- Checking common light/dark mode pitfalls before release
- Catching unreadable foreground/background pairings after theme toggles
- Preventing accidental palette leakage such as unwanted orange/black global backgrounds

## Included helper scripts

- `scripts/batman-theme.mjs` creates baseline CSS tokens, a boot script, a toggle snippet, and theme documentation.
- `scripts/check-batman-theme.mjs` checks for dark-first defaults, accessible toggle hints, root theme wiring, and common hardcoded color patterns.
- `scripts/install-batman-hooks.sh` installs a Git hook that runs the Batman theme check.
- `scripts/batman-theme.ps1` is a PowerShell wrapper for Windows users.

## Common commands

```bash
node scripts/batman-theme.mjs --write
node scripts/batman-theme.mjs --root ./web --write --force
node scripts/check-batman-theme.mjs
bash scripts/install-batman-hooks.sh --mode pre-push
powershell -ExecutionPolicy Bypass -File scripts/batman-theme.ps1 -Write
```
