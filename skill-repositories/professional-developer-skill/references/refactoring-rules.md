# Refactoring Rules

Refactor to reduce risk, not to show cleverness.

## Good reasons to refactor

- A file has multiple unrelated responsibilities.
- Logic is duplicated and likely to diverge.
- External service behavior is mixed into UI rendering.
- A component owns state that belongs lower or higher in the tree.
- A function is hard to test because it combines parsing, side effects, and rendering.
- Error handling is inconsistent or missing.

## Bad reasons to refactor

- The code is not written in a preferred personal style but is already clear.
- The abstraction only has one caller and does not reduce complexity.
- The rewrite would hide the real bug inside many unrelated changes.
- The change adds a new dependency for a small helper.

## Preferred process

1. Preserve behavior.
2. Add or identify a verification path.
3. Extract pure helpers first.
4. Move side effects behind named boundaries.
5. Rename for clarity after structure is stable.
6. Remove dead code last.
