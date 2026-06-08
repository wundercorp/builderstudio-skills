# Patcher Skill

Builder Studio: https://builderstudio.dev

A BuilderStudio-compatible skill for severity-ordered security patching across Docker containers, frontend packages, backend packages, lockfiles, CI/CD pipelines, and common vulnerable codebase patterns while keeping the project installable, compilable, runnable, and deployable.

Use this skill when the agent should remediate CVEs, scanner findings, Docker image vulnerabilities, vulnerable dependencies, zero-day mitigations, insecure frontend patterns, unsafe package-manager wiring, and supply-chain risks with practical patches rather than vague advice.

## Install

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/patcher-skill --skill patcher
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/patcher-skill --skill patcher
```

## Best for

- Patching critical and high CVEs before release
- Updating vulnerable direct and transitive dependencies with minimal compatible changes
- Hardening Dockerfiles, compose files, and container build contexts
- Fixing frontend dependency and browser security issues
- Responding to zero-days with immediate mitigations when no fixed version exists
- Preserving package-manager lockfiles and build compatibility while patching
- Adding security audit commands and repeatable verification steps
- Sorting remaining risk by severity, reachability, and production impact

## Included helper scripts

- `scripts/check-patcher.mjs` performs a local baseline vulnerability hygiene scan and can run ecosystem audit commands when tools are available.
- `scripts/check-patcher.ps1` is a PowerShell wrapper for Windows users.

## Common commands

```bash
node scripts/check-patcher.mjs --root .
node scripts/check-patcher.mjs --root . --run-audits
node scripts/check-patcher.mjs --root . --fix
node scripts/check-patcher.mjs --root . --strict
powershell -ExecutionPolicy Bypass -File scripts/check-patcher.ps1 -Root .
```
