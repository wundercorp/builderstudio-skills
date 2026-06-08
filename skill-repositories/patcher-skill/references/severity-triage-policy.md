# Severity Triage Policy

Use severity as the first ordering key, then adjust by exploitability, reachability, deployment exposure, and confidence.

## Critical

Treat a finding as critical when it involves active exploitation, remote code execution, authentication bypass, exposed secrets, malicious packages, container escape, public unauthenticated exploit paths, or compromised release infrastructure.

Patch critical items immediately. If a fixed version is unavailable, mitigate the vulnerable feature, block the route, remove the package, isolate the workload, narrow permissions, or pin away from a known-bad release while monitoring the vendor advisory.

## High

Treat a finding as high when it is reachable in production, internet-facing, exploitable by normal user input, or located in authentication, upload, parsing, deserialization, SSR, request routing, database, worker, or CI execution paths.

Patch high items before routine upgrades. Prefer targeted upgrades and lockfile updates.

## Moderate

Treat a finding as moderate when exploitation requires unusual conditions, privileged access, local development exposure, or a non-default configuration, but a reasonable patch exists.

Patch moderate items after critical and high items unless scanner policy blocks release.

## Low

Treat a finding as low when it is hard to exploit, dev-only, not shipped, or primarily hygiene-related. Keep it visible, but do not destabilize the codebase for low-risk churn unless the change is safe.

## Reachability overrides

A dev-only critical finding can be lower priority than a production high finding if it is never shipped or executed in CI with secrets. A moderate finding on a public unauthenticated route can be more urgent than a high finding in an unused optional package.
