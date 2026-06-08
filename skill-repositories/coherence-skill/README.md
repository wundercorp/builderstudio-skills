# Coherence Skill

Builder Studio: https://builderstudio.dev

A BuilderStudio-compatible skill for turning messy prompts, conflicting skill stacks, and mismatched technical directions into a coherent implementation strategy.

Use this skill when an agent needs to reconcile too many overlapping instructions, reduce anti-patterns, decide which responsibilities belong where, and create durable markdown records that explain the final implementation direction.

## Install

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/coherence-skill --skill coherence
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/coherence-skill --skill coherence
```

## Best for

- Cleaning up messy prompts before implementation
- Reconciling overlapping or conflicting skills
- Creating a technical direction that actually works together
- Reducing architectural drift and anti-patterns
- Assigning ownership between frontend, backend, APIs, scripts, docs, deployment, and records
- Turning vague feature requests into implementable plans
- Creating `docs/coherence` records for repositories

## Included helper scripts

- `scripts/coherence-plan.mjs` creates coherence strategy, reconciliation, implementation map, anti-pattern review, and prompt-normalization markdown files.
- `scripts/check-coherence.mjs` fails when broad source changes are present without a coherence record.
- `scripts/install-coherence-hooks.sh` installs a Git hook that runs the coherence check before commit or push.
- `scripts/coherence-plan.ps1` is a PowerShell wrapper for Windows users.

## Common commands

```bash
node scripts/coherence-plan.mjs --title "Reconcile Builder Studio deploy workflow" --scope "Frontend tabs, API handoff, deployment docs" --write
node scripts/coherence-plan.mjs --title "Normalize overloaded prompt" --prompt-file prompt.txt --prompt-normalization --write
node scripts/check-coherence.mjs
bash scripts/install-coherence-hooks.sh --mode pre-push
powershell -ExecutionPolicy Bypass -File scripts/coherence-plan.ps1 -Title "Fix mismatched app direction" -Write
```

## Delivery-format drift

Coherence now covers mismatches where the user requests CDN-only/browser-native output but the generated result becomes a Vite/npm bundled app, or where a selected track forces a package-managed format without explicitly reconciling the change.
