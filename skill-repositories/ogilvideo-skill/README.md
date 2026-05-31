# Ogilvideo Skill

Builder Studio: https://builderstudio.dev

A BuilderStudio-compatible skill for directing, analyzing, planning, and improving premium motion videos through a highly capable motion director and video animator lens.

Ogilvideo helps agents turn a product, startup, app, landing page, brand, dataset, AI workflow, or screen recording into a high-conversion motion video treatment with a clear story arc, shot list, motion grammar, production requirements, visual QA, AI-video prompts, and practical build plan.

## Install

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/ogilvideo-skill --skill ogilvideo
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/ogilvideo-skill --skill ogilvideo
```

## Best for

- Motion direction for agentic AI videos
- Product launch videos and SaaS explainers
- UI animation storyboards and kinetic ad treatments
- Screen-recording transformation into polished motion systems
- Prompting Runway, Pika, Kling, Veo-style systems, image models, and animation agents
- Breaking down reference videos into reproducible creative, asset, timing, and production requirements
- Turning brand strategy into shot-by-shot video instructions
- Reviewing motion drafts like a senior creative director and animator

## Included references

- `references/source-video-analysis.md` breaks down the attached Stafftoday-style reference video.
- `references/motion-direction-rubric.md` defines the Ogilvideo grading system.
- `references/agentic-ai-video-director.md` gives prompt frameworks for AI-video systems and multi-agent production.
- `references/production-blueprint.md` lists assets, roles, deliverables, and quality gates required to make videos at this level.

## Included helper scripts

- `scripts/ogilvideo-brief.mjs` creates a starter video treatment, shot list, AI prompt pack, and QA checklist.
- `scripts/check-ogilvideo.mjs` checks whether an Ogilvideo project folder contains the expected direction documents and production gates.
- `scripts/install-ogilvideo-hooks.sh` installs a Git hook for running the Ogilvideo check.
- `scripts/ogilvideo-brief.ps1` is a PowerShell wrapper for Windows users.

## Common commands

```bash
node scripts/ogilvideo-brief.mjs --write
node scripts/ogilvideo-brief.mjs --root ./video-project --brand Stafftoday --duration 52 --write --force
node scripts/check-ogilvideo.mjs --root ./video-project
bash scripts/install-ogilvideo-hooks.sh --mode pre-push
powershell -ExecutionPolicy Bypass -File scripts/ogilvideo-brief.ps1 -Write
```
