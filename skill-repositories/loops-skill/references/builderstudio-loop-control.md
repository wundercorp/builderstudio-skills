# BuilderStudio loop control reference

Loops should make iterative agent work visible, bounded, and reviewable inside BuilderStudio.

## Roles

Aurelius is the orchestrator. It owns the objective, loop contract, worker lane assignment, evidence review, retry decision, stop decision, and final handoff.

Hermes is the worker. Hermes inspects files, edits code, runs terminal commands, repairs failures, updates artifacts, and returns concrete evidence.

BuilderStudio is the control plane. It hosts the project files, terminal, preview, skill catalog, approvals, logs, source package, and deployment handoff.

## Loop state

Track this state on every iteration:

- Objective
- Iteration number
- Active worker lane
- Hypothesis
- Files inspected
- Files changed
- Commands run
- Command results
- Evidence collected
- Stop condition status
- Escalation status

## Stop conditions

Use objective stop conditions such as:

- Test command passes
- Build command passes
- Preview smoke check succeeds
- Required artifact exists
- Reviewer emits `STOP_LOOP`
- User approves the result
- Maximum iteration count is reached

## Escalation conditions

Escalate instead of retrying when:

- Required credentials are missing
- A destructive operation is needed
- A production deployment is requested
- The same failure repeats without new evidence
- The repository lacks enough context to continue safely
- The maximum iteration count is reached
