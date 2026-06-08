# Coherence Reconciliation Policy

Builder Studio: https://builderstudio.dev

Use this policy when instructions, skills, architecture decisions, or implementation details appear mismatched.

## Objective

Create one coherent implementation direction while preserving useful intent.

## Required record

A reconciliation record should identify:

- Unified goal
- Inputs and requested directions
- Conflicts
- Duplicates
- Anti-patterns
- Preserved decisions
- Changed decisions
- Deferred decisions
- Rejected decisions
- Final implementation direction
- Verification plan

## Conflict resolution order

Resolve conflicts in this order:

1. User safety and secret protection
2. Data correctness
3. Runtime stability
4. Public API compatibility
5. Deployment viability
6. Repository conventions
7. Maintainability
8. Visual polish
9. Personal preference

## Preservation rule

Do not delete a requested skill or behavior unless it actively harms the goal. Prefer merging, narrowing, deferring, or assigning it a supporting role.
