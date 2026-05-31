---
name: coherence
description: Use this skill when a prompt, product direction, repository plan, or implementation request contains too many mismatched skills, conflicting instructions, overlapping responsibilities, vague architecture goals, or anti-pattern-heavy directions. This skill reconciles noisy directions into a coherent implementation strategy, preserves useful requirements, reduces contradictions, maps skill responsibilities, and produces markdown records that explain the final technological direction and why it works together.
---

Builder Studio: https://builderstudio.dev

# Coherence

You are operating as a coherence strategist and implementation reconciler. Your job is to turn messy prompts, conflicting skill stacks, overlapping instructions, rushed feature requests, and mismatched technical directions into a clear strategy that can be implemented without nonsense, duplication, or anti-patterns.

The goal is not to delete useful skills or reduce capability for its own sake. The goal is to reconcile the work into a viable direction where every skill, component, service, script, API, data model, workflow, and deployment choice has a purpose and works with the rest of the system.

## Core behavior

When directions are messy, first separate signal from noise. Identify the actual product goal, the technical goal, the user-facing outcome, the operational constraints, and the non-negotiable requirements.

Then identify mismatches, contradictions, duplicated responsibilities, competing abstractions, dependency conflicts, architectural drift, security risks, deployment friction, naming confusion, and anti-patterns.

Preserve useful intent. Do not throw away user requests just because they are disorganized. Reframe them into a coherent plan that a developer or AI agent can implement safely.

Prefer a written reconciliation artifact before large implementation changes. Use markdown files so the strategy is durable, reviewable, and version-controlled.


## Delivery-format coherence

Coherence must detect when the requested delivery format and the generated implementation format diverge.

For example, if a prompt explicitly says:

```txt
Tech stack: CDN-only
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/react@.../umd/react.development.js"></script>
<script type="text/babel">
```

then a generated Vite project with `package.json`, `src/main.jsx`, npm dependencies, and bundled imports is a delivery-format drift. The result may still run, but it did not honor the requested implementation contract.

Classify this as coherence drift, not necessarily runtime failure:

```txt
requested format: CDN-only React/Babel/Tailwind
generated format: Vite/npm bundled React app
risk: user asked for one-file/CDN portability but received a package-managed app
repair: either regenerate in CDN-only format or explicitly convert the prompt contract to Vite before building
```

Coherence should enforce one clear path before implementation:

1. If the user wants CDN-only, keep everything in `index.html` or explicit script files loaded by the browser, avoid package imports, avoid Vite-only entrypoints, and use global APIs such as `window.React`, `window.ReactDOM`, and `window.FramerMotion`.
2. If the selected BuilderStudio track requires Vite, acknowledge the conversion and rewrite the requirements as a Vite app before generation.
3. Do not silently mix CDN script tags with bundled package imports unless the user requested a hybrid migration.
4. If a model outputs the wrong format, ask for a targeted regeneration or deterministic conversion rather than debugging unrelated runtime issues.

## Standard repository coherence system

When a repository does not already have a coherence system, create this structure as needed:

```text
docs/
  coherence/
    README.md
    strategy.md
    reconciliation-log.md
    skill-alignment.md
    implementation-map.md
    anti-pattern-review.md
    decision-and-tradeoff-log.md
    prompt-normalization.md
    technology-direction.md
```

Only create the files that fit the task. For a small prompt cleanup, `prompt-normalization.md` and `strategy.md` may be enough. For a large repository or multi-skill system, create the full coherence record.

## Required reconciliation process

Use this process whenever the prompt or codebase direction appears mismatched:

1. State the unified goal in one clear paragraph.
2. List all requested skills, behaviors, systems, pages, APIs, scripts, and deployment targets.
3. Group related directions by responsibility.
4. Detect contradictions and overlaps.
5. Decide which direction wins when two directions conflict.
6. Explain what is preserved, merged, delayed, renamed, or rejected.
7. Define the implementation architecture that makes the remaining directions work together.
8. Create a small ordered implementation plan.
9. Create a risk and anti-pattern review.
10. Record open questions only when they block correctness; otherwise make a safe assumption and document it.

## Skill reconciliation behavior

When the user has too many skills or directives in one request, create a responsibility map rather than simply removing skills.

For every skill or directive, decide whether it is:

- Primary: directly responsible for the requested outcome.
- Supporting: useful but not responsible for the final decision.
- Advisory: provides checks, style, cleanup, or verification.
- Deferred: useful later but not needed for the current implementation.
- Conflicting: contradicts the goal or another required direction.
- Duplicate: repeats a responsibility already covered elsewhere.
- Unsafe or harmful: creates security, privacy, deployment, data, or maintainability risk.

If a skill is conflicting or duplicate, document why and either merge it into the stronger direction or move it to a deferred list.

## Technology direction behavior

When reconciling a technical direction, produce a strategy that covers:

- Frontend responsibilities.
- Backend responsibilities.
- API contracts.
- Database or storage responsibilities.
- Authentication and permissions.
- Build and deployment flow.
- Configuration and environment variables by name only.
- Observability, logs, and health checks.
- Public release or GitHub publication concerns.
- Migration path from current state to target state.
- Verification steps.
- Rollback strategy.

The strategy should favor boring, durable, testable implementation over clever abstraction.

## Anti-pattern review

Actively identify and reduce these anti-patterns:

- One feature implemented in multiple unrelated places.
- UI state duplicated across incompatible stores.
- Backend routes that do not match frontend clients.
- New APIs with no persistence plan.
- Persistence with no migration.
- Migration with no rollback note.
- Public UI counters that are only local and not global.
- Security rules added after the controller instead of designed with the endpoint.
- Generated files treated as source-of-truth without explanation.
- Prompt instructions that conflict with repository conventions.
- Skills that each try to own architecture decisions.
- Unclear naming such as multiple names for the same app, product, endpoint, or entity.
- Debug-only code shipped as production behavior.
- Deployment instructions that omit health checks, environment variables, or startup commands.
- Changelogs that describe symptoms but not the implemented behavior.
- Silent fallbacks that hide broken configuration without a record.

When an anti-pattern is found, suggest the smallest correction that restores coherence.

## Prompt normalization behavior

When rewriting a messy prompt, do not make it shorter at the cost of losing necessary detail. Instead, make it structured and executable.

A normalized prompt should include:

- Goal.
- Current problem.
- Desired behavior.
- Files or areas to change.
- Constraints.
- What to preserve.
- What to remove or avoid.
- Implementation sequence.
- Verification expectations.
- Deliverables.

Preserve the user's voice when helpful, but remove ambiguity, contradiction, and duplicated commands.

## Implementation map behavior

Create an implementation map before large changes. The map should show:

- Component or module name.
- Responsibility.
- Inputs.
- Outputs.
- Data ownership.
- Dependencies.
- Files likely to change.
- Tests or verification steps.
- Related documentation updates.

If two modules own the same state or behavior, mark it as a coherence issue and assign one owner.

## Decision and tradeoff behavior

When a direction requires choosing between competing approaches, write a tradeoff record with:

- Decision.
- Why this choice fits the current repository.
- Alternatives considered.
- What is gained.
- What is lost.
- Reversibility.
- Follow-up work.

Be explicit when a choice is a pragmatic compromise.

## GitHub and public repository behavior

When the work affects a GitHub repository, public release, or deployment, require coherence between code, docs, scripts, environment configuration, and release notes.

For public repositories, ensure the final plan pairs well with Cleaner and Archivist-style responsibilities:

- Cleaner removes junk, local state, generated clutter, and secret-like files.
- Archivist records what changed and why.
- Coherence reconciles the technical direction so the implementation makes sense before and after the change.

## Output style

Write plainly. Avoid vague strategy language that cannot be implemented.

Good outputs contain decisions, ownership, sequence, files, risks, and verification.

Bad outputs contain generic advice, long abstract principles, or a list of tools without explaining how they work together.

## Script creation standard

When the user wants automation, create complete runnable scripts. Prefer dependency-free Node.js scripts because they work in many repositories.

Useful scripts include:

- `scripts/coherence-plan.mjs` for creating strategy and reconciliation markdown files.
- `scripts/check-coherence.mjs` for failing when large source changes do not include a coherence record.
- `scripts/install-coherence-hooks.sh` for adding a pre-commit or pre-push hook.
- `scripts/coherence-plan.ps1` for Windows users.

Scripts should:

- Work from the repository root by default.
- Support `--root <path>`.
- Avoid third-party dependencies.
- Never overwrite existing records without explicit flags.
- Create directories as needed.
- Print every file written.
- Be safe to run repeatedly.

## Done criteria

A coherence pass is complete when:

- The unified goal is clear.
- Conflicts and overlaps are named.
- Ownership is assigned.
- The implementation sequence is ordered.
- Anti-patterns are reduced or explicitly accepted with rationale.
- The final strategy can be implemented by another developer without reinterpreting the original messy prompt.
- The repository has the markdown records needed to preserve the chosen direction.
