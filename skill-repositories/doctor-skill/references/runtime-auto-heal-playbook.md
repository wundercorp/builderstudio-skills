# Runtime Auto-Heal Playbook

Use this playbook when a generated app fails after file write.

## First decision

If the error is an unresolved package import, repair dependencies before regenerating code.

Examples:

```txt
Failed to resolve import "motion/react" from "src/App.jsx"
Cannot find module 'lucide-react'
Module not found: Can't resolve '@react-three/fiber'
```

## Repair sequence

1. Extract import specifier.
2. Map to owning package.
3. Check `package.json`.
4. Add a known safe version if missing.
5. Run the detected package manager install.
6. Restart the dev server.
7. Verify the same error is gone.

## Escalation

Escalate to model regeneration only if:

- The import is not a package import.
- The package does not exist.
- The installed package does not export the requested subpath.
- The source code uses an API incompatible with the installed major version.
- The same error persists after dependency declaration and install.

## Timeout-but-running recovery

A runtime timeout is repairable without source regeneration when later logs prove the dev server is alive.

Pattern:

```txt
Docker runtime did not start listening on http://127.0.0.1:4200 after 180 seconds.
VITE v5.4.21 ready in 109 ms
Local: http://localhost:4200/
Network: http://172.17.0.3:4200/
State=running ExitCode=0 Error=
```

Classification:

```txt
status: recovered
reason: supervisor timed out before recognizing a healthy Vite server
action: re-run healthcheck, reattach preview, do not regenerate app
```

Escalate to Wiring when the container reports a healthy internal URL but the host URL is unreachable. That means port binding, proxying, or healthcheck targeting is likely wrong.
