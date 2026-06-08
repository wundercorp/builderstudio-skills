# Security

## Reporting vulnerabilities

This skill repository contains defensive guidance and a local baseline checker. If you find an issue in the skill content or helper script, report it through the repository issue tracker or replace this section with your project's private reporting process after forking.

## Scope

Svalbard is designed for defensive application security, secure-by-default generation, hardening, and release verification. It must not be used to create malware, credential theft, stealth tooling, exploit automation, or unauthorized bypasses.

## Local verification

```bash
node scripts/check-svalbard.mjs --root .
```

Use `--strict` when you want moderate-or-higher findings to fail the command.

## Secret handling

Do not commit real environment files, private keys, certificates, databases, logs, tokens, or provider credentials to this repository. Keep examples placeholder-only.
