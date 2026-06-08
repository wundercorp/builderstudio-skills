# Bauhaus Skill

Builder Studio: https://builderstudio.dev

A BuilderStudio-compatible skill for building bold, modern, visually striking interface themes with thick typography, disciplined color systems, geometric composition, and consistent high-contrast visual storytelling.

Bauhaus is a visual design language skill. It helps agents create product pages, landing pages, dashboards, and editorial experiences that feel premium, fashion-forward, modern, and memorable without becoming chaotic. It combines geometric clarity, bold display typography, section-level color blocking, and a tight token system so a project can sustain an aggressive theme expression across the whole experience.

## Install

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/bauhaus-skill --skill bauhaus
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/bauhaus-skill --skill bauhaus
```

## Best for

- Designing bold marketing sites with strong type-led hierarchy
- Creating premium ecommerce or product-storytelling landing pages
- Building brand-heavy dashboards with controlled visual contrast
- Generating consistent neon, monochrome, or sportswear-inspired theme systems
- Establishing a reusable visual language instead of one-off styling
- Creating editorial hero sections with oversized headlines and geometric framing
- Pairing with Batman, Themable, Gradient Mesh, or Coherence for richer theme systems

## Included helper scripts

- `scripts/bauhaus-theme.mjs` creates starter theme tokens, section classes, and documentation.
- `scripts/check-bauhaus.mjs` checks for required Bauhaus documentation, token signals, and typography cues.
- `scripts/install-bauhaus-hooks.sh` installs a Git hook that runs the Bauhaus check.
- `scripts/bauhaus-theme.ps1` is a PowerShell wrapper for Windows users.

## Common commands

```bash
node scripts/bauhaus-theme.mjs --write
node scripts/bauhaus-theme.mjs --root ./web --write --force
node scripts/check-bauhaus.mjs
bash scripts/install-bauhaus-hooks.sh --mode pre-push
powershell -ExecutionPolicy Bypass -File scripts/bauhaus-theme.ps1 -Write
```
