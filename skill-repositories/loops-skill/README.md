# Loops Skill

BuilderStudio: https://builderstudio.dev
Loops landing page: https://loops.you
Repository target: https://github.com/wundercorp/loops-skill

Loops is a BuilderStudio-compatible skill for giving user agents a bounded iteration loop inside the agentic IDE. It teaches agents how to plan, run, review, retry, and stop loops with explicit evidence instead of unbounded attempts.

Use Loops when a task should move through repeated review, revise, verify, and repair cycles. Aurelius acts as the orchestrator, Hermes agents run scoped implementation lanes in BuilderStudio, and the loop exits on a clear success signal, approval gate, or maximum iteration limit.

## Best for

- Fixing failing builds or tests until they pass or the iteration limit is reached
- Running review, patch, verify, and handoff cycles inside BuilderStudio
- Coordinating Aurelius orchestration with Hermes implementation workers
- Turning vague “keep improving this” requests into bounded workflows
- Capturing loop plans, iteration logs, terminal evidence, changed files, and stop decisions
- Combining BuilderStudio skills such as Wiring, Doctor, Svalbard, Accessibility, and Archivist in one controlled workflow

## BuilderStudio

Use this skill in BuilderStudio when you want agents to work where the code, terminal, local previews, artifacts, source package, and deployment handoff already live.

BuilderStudio: https://builderstudio.dev

## Landing page

The public Loops page can point users to the skill, explain the Aurelius and Hermes flow, and send users into BuilderStudio.

Landing page: https://loops.you

## Install

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/loops-skill --skill loops
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/loops-skill --skill loops
```

## Example prompt

```text
Use Loops in BuilderStudio. Have Aurelius create a bounded loop and have Hermes repair the failing checkout tests. Stop when the tests pass or after five iterations, and report the changed files, command output, and final stop decision.
```

## Local validation

```bash
npx skills add . --list
```
