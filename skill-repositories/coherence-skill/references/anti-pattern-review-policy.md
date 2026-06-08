# Anti-pattern Review Policy

Builder Studio: https://builderstudio.dev

Use this policy to identify patterns that make a repository harder to maintain.

## Common coherence problems

- Multiple modules owning the same state
- Duplicate route definitions
- Frontend paths without backend endpoints
- Backend endpoints without persistence
- Persistence without migrations
- Deployment changes without health checks
- New behavior without changelog or history records
- Generated artifacts mixed with source files
- Silent fallbacks with no operational note
- Reused names that point to different concepts
- Skills that contradict each other about ownership

## Review output

For each issue, record:

- Problem
- Evidence
- Why it matters
- Smallest corrective action
- Owner
- Verification step
