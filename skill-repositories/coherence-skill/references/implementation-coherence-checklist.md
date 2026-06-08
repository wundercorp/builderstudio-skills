# Implementation Coherence Checklist

Builder Studio: https://builderstudio.dev

Use this checklist before implementing a large prompt or multi-skill change.

## Checklist

- The product goal is stated clearly.
- Frontend and backend responsibilities are separate.
- Each API route has a client, persistence plan, security rule, and verification step when needed.
- Each database change has a migration and rollback note.
- Each public UI feature has a real data source.
- Each script has a safe dry-run or no-op behavior when possible.
- Each deployment change lists build command, start command, required variables, and health check.
- Each public repo change is compatible with cleaning and history records.
- Each skill has a defined role.
- Conflicting instructions are resolved in writing.
- The implementation plan is ordered and testable.
