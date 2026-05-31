# Svalbard Skill

Builder Studio: https://builderstudio.dev

A BuilderStudio-compatible skill for generating and hardening applications with a security-first architecture, safe defaults, production-grade defensive controls, threat modeling, secure authentication and authorization patterns, data protection, browser hardening, backend hardening, container hardening, supply-chain hygiene, and release verification.

Use this skill when the agent should make an app secure-by-default from the first generated file instead of trying to bolt security on after the build is finished.

## Install

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/svalbard-skill --skill svalbard
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/svalbard-skill --skill svalbard
```

## Best for

- Building new apps with security defaults already wired in
- Hardening existing frontend, backend, full-stack, API, dashboard, SaaS, ecommerce, and admin apps
- Adding authentication, authorization, session, cookie, CSRF, CORS, rate-limit, validation, and audit-log guidance
- Preventing common XSS, injection, SSRF, insecure direct object reference, file-upload, path traversal, and secret leakage mistakes
- Adding secure browser headers, content security policy, permissions policy, and frame protections
- Locking down environment-variable handling and public/private configuration boundaries
- Improving Docker, CI/CD, dependency, package-manager, and release security posture
- Producing clear security documentation and repeatable verification steps

## Included helper scripts

- `scripts/check-svalbard.mjs` performs a defensive baseline security scan for common app-level risks and can write a starter `SECURITY.md`.
- `scripts/check-svalbard.ps1` is a PowerShell wrapper for Windows users.

## Common commands

```bash
node scripts/check-svalbard.mjs --root .
node scripts/check-svalbard.mjs --root . --strict
node scripts/check-svalbard.mjs --root . --write-security-md
node scripts/check-svalbard.mjs --root . --json
powershell -ExecutionPolicy Bypass -File scripts/check-svalbard.ps1 -Root .
```
