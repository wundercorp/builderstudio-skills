# Agent loop patterns

## Repair loop

Use when command output identifies a concrete failure.

1. Run the failing command.
2. Summarize the failure.
3. Patch the smallest relevant scope.
4. Re-run the command.
5. Stop when it passes or the iteration limit is reached.

## Review loop

Use when a feature, page, document, or design needs critique and revision.

1. Define acceptance criteria.
2. Review the current artifact.
3. Apply a focused revision.
4. Re-check against criteria.
5. Stop when criteria are satisfied, a reviewer emits `STOP_LOOP`, or the iteration limit is reached.

## Multi-skill loop

Use when several BuilderStudio skills should run as lanes.

1. Aurelius chooses the sequence.
2. Each skill gets a bounded task.
3. Hermes executes implementation work.
4. Aurelius reconciles outputs.
5. The loop exits with one coherent handoff.

## Deployment-prep loop

Use when the result needs to be shipped.

1. Verify install and build.
2. Check wiring, dependencies, and public assets.
3. Confirm deployment scripts or handoff bundle.
4. Produce final deployment commands.
5. Require approval before publishing.
