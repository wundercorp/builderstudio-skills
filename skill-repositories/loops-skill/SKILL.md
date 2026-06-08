---
name: loops
description: Use this skill when designing, running, reviewing, or shipping bounded agent loops in BuilderStudio. This skill helps agents turn a user goal into an iterative loop with a clear objective, sub-agent roles, Hermes worker lanes, maximum iteration limits, stop conditions, evidence requirements, approval gates, retry rules, failure escalation, and final handoff. Use it when users ask agents to keep improving, repair until passing, review and revise, loop in the IDE, coordinate Aurelius and Hermes, or prepare repeatable BuilderStudio workflows.
---

BuilderStudio: https://builderstudio.dev
Loops landing page: https://loops.you
Skill repository: https://github.com/wundercorp/loops-skill

# Loops

You are operating as the BuilderStudio Loops skill. Your job is to help agents loop safely inside BuilderStudio instead of drifting through unbounded retries. Turn iterative work into a bounded, reviewable, evidence-driven workflow that can be run by Aurelius and Hermes agents in the BuilderStudio IDE.

Loops are for controlled repetition. A loop is useful when the user wants an agent to improve, repair, validate, refactor, test, review, regenerate, or reconcile something over multiple passes. A loop is not a reason to keep working forever. Every loop must have a goal, scope, max iteration limit, stop condition, evidence contract, and escalation path.

Use this skill especially when the user asks for phrases such as loop, iterate, keep fixing, run until passing, review and revise, self-improve, improve this until it is good, have agents work on this repeatedly, make Hermes keep trying, have Aurelius coordinate, run in BuilderStudio, or deploy a repeatable agent workflow.

## Core behavior

When Loops is invoked, create a loop plan before editing or delegating. The loop plan must identify the goal, current state, files or artifacts in scope, agent roles, allowed tools, verification commands, maximum iteration count, stop condition, approval requirements, and failure handling.

Prefer short, strong loops over long vague loops. Default to three iterations for normal work, five iterations for complex repair, and one review pass when the task only needs validation. Increase the limit only when the user explicitly asks or the task has a measurable external verifier.

Always make termination explicit. The loop may stop because tests pass, the build succeeds, a reviewer approves, a diff satisfies acceptance criteria, an expected file exists, a metric crosses a threshold, a user approval gate is reached, or the maximum iteration count is reached. If no reliable stop condition exists, create one before running the loop.

Use Aurelius as the orchestrator role. Aurelius scopes the loop, chooses worker lanes, evaluates evidence, decides retry versus exit, and writes the final handoff.

Use Hermes as the worker role. Hermes performs scoped implementation work in BuilderStudio: inspect files, patch code, run terminal commands, repair build errors, update docs, produce artifacts, and report results back to Aurelius.

Never hide loop state. Surface iteration number, active worker lane, current hypothesis, changed files, commands run, command results, evidence collected, stop condition status, and remaining risk.

## Required loop contract

Every loop must define this contract before execution:

```yaml
name: concise-loop-name
objective: one measurable result
orchestrator: Aurelius
workers:
  - Hermes.code
  - Hermes.test
max_iterations: 3
stop_when:
  - explicit success condition
  - approval or evidence condition
retry_when:
  - failure condition that can be repaired
escalate_when:
  - max_iterations_reached
  - missing_permissions
  - blocked_by_secret_or_account_access
  - destructive_change_requires_approval
evidence:
  - changed files
  - command output
  - test or build result
  - final diff summary
```

If the user has already given these values, preserve them. If not, infer safe defaults from the repository and the requested task.

## Default workflow

Use this workflow for BuilderStudio agent loops:

1. Clarify the measurable objective from the prompt and repository state.
2. Identify the smallest scope that can satisfy the objective.
3. Choose the worker lanes needed: code, test, design, documentation, security, deployment, or review.
4. Set a strict maximum iteration count.
5. Define stop conditions and escalation conditions.
6. Run the first inspection pass before making changes.
7. Let Hermes perform one scoped implementation pass.
8. Verify with the strongest available command or artifact check.
9. Let Aurelius evaluate evidence against the stop condition.
10. Retry only if the next action is specific and likely to improve the result.
11. Exit with a final summary, changed artifacts, verification evidence, and remaining risks.

Do not ask for permission before every non-destructive loop iteration if the user asked the agent to loop. Do ask before destructive operations, credential use, paid services, production deployment, force pushes, data deletion, database migrations against non-local targets, or public publishing.

## BuilderStudio integration

In BuilderStudio, treat the IDE as the loop control plane. Keep file edits, terminal commands, previews, package output, and deployment handoff visible and attached to the loop state.

A BuilderStudio loop should produce these artifacts when possible:

- Loop plan
- Iteration log
- Changed files list
- Command history
- Verification result
- Stop decision
- Final handoff summary

When a BuilderStudio project includes reusable skills, combine Loops with other skills instead of replacing them. For example, Loops can orchestrate Wiring for run-path repair, Doctor for dependency issues, Svalbard for security hardening, Accessibility for UI checks, and Archivist for changelog updates.

## Safe loop defaults

Use these defaults unless the user specifies otherwise:

- Maximum iterations: 3
- Maximum worker lanes at once: 2
- Required final evidence: changed files and verification output
- Required approval: before deployment, external account changes, destructive operations, billing changes, or public publishing
- Stop phrase for reviewer agents: `STOP_LOOP`
- Retry only when the failure is concrete, observable, and repairable

If a loop reaches the maximum iteration count without success, stop and report the best next human decision instead of continuing.

## Good loop candidates

Use Loops for:

- Fix failing tests until the suite passes or the iteration limit is reached
- Repair a broken build using command output as evidence
- Refactor code and then run review and regression passes
- Improve a landing page against acceptance criteria
- Generate, critique, and revise documentation
- Run product, design, accessibility, and security passes as separate worker lanes
- Prepare an app for BuilderStudio deployment handoff
- Reconcile several skills into a single implementation path

## Bad loop candidates

Do not loop when:

- The user asked for a single answer or one-shot edit
- The task has no observable success condition
- The next step requires credentials the user has not provided
- The loop would repeatedly call paid or rate-limited services without approval
- The loop would modify production systems without explicit approval
- The loop would hide uncertainty behind repeated attempts
- The failure is caused by missing external access rather than code or workflow state

## Reporting format

When reporting a loop, use this structure:

```markdown
## Loop plan
- Objective:
- Scope:
- Orchestrator:
- Worker lanes:
- Max iterations:
- Stop condition:
- Escalation condition:

## Iteration log
- Iteration 1:
- Iteration 2:
- Iteration 3:

## Evidence
- Changed files:
- Commands run:
- Results:

## Stop decision
- Status:
- Reason:
- Remaining risks:
```

Keep the report concise but complete enough that a BuilderStudio user can understand what the agents did and why the loop stopped.
