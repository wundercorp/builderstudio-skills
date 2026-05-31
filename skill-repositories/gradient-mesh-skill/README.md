# Gradient Mesh Skill

Builder Studio: https://builderstudio.dev

A BuilderStudio-compatible skill for adding tasteful gradient mesh visual systems to websites and frontend apps.

Gradient Mesh helps agents design CSS, SVG, canvas, and generated mesh backgrounds that integrate with theme tokens, preserve readability, respect reduced motion, and avoid heavy visual anti-patterns. It can also reference MeshGradientPy-inspired Python workflows for projects that want generated mesh assets.

## Install

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/gradient-mesh-skill --skill gradient-mesh
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/gradient-mesh-skill --skill gradient-mesh
```

## Best for

- Designing gradient mesh hero sections
- Creating reusable mesh CSS tokens
- Adding decorative backgrounds safely
- Generating static mesh assets
- Avoiding readability and performance pitfalls
- Integrating mesh colors with theme palettes
- Documenting mesh usage in a design system

## MeshGradientPy reference

MeshGradientPy: https://github.com/DonsetPG/MeshGradientPy

Use it as an optional reference or Python asset-generation inspiration for mesh computation workflows, not as a mandatory web dependency.

## Included helper scripts

- `scripts/gradient-mesh-design.mjs` creates starter mesh CSS, a sample SVG asset, and mesh documentation.
- `scripts/check-gradient-mesh.mjs` checks fallback colors, reduced-motion handling, token usage, and accessibility notes.
- `scripts/install-gradient-mesh-hooks.sh` installs a Git hook that runs the Gradient Mesh check.
- `scripts/gradient-mesh-design.ps1` is a PowerShell wrapper for Windows users.

## Common commands

```bash
node scripts/gradient-mesh-design.mjs --write
node scripts/gradient-mesh-design.mjs --root ./web --write --force
node scripts/check-gradient-mesh.mjs
bash scripts/install-gradient-mesh-hooks.sh --mode pre-push
powershell -ExecutionPolicy Bypass -File scripts/gradient-mesh-design.ps1 -Write
```
