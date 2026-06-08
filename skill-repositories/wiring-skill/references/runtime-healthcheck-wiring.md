# Runtime Healthcheck Wiring

Use this reference when the app appears to be running but the runtime supervisor declares preview startup failure.

## Healthy process, failed healthcheck

This pattern is a wiring issue, not a source regeneration issue:

```txt
Docker runtime did not start listening on http://127.0.0.1:4200 after 180 seconds.
VITE v5.4.21 ready in 109 ms
Local: http://localhost:4200/
Network: http://172.17.0.3:4200/
State=running ExitCode=0 Error=
```

## Required checks

1. Package script starts the expected server.
2. Dev command binds to `0.0.0.0` inside Docker.
3. Port in the dev command matches the requested preview port.
4. Docker publishes that port to the host.
5. Healthcheck probes after the ready signal, not only before.
6. Preview proxy maps the host URL to the container URL.
7. `/runtime/start` failures are separated from generated app failures.

## Repair actions

- Change `vite --host 127.0.0.1` or bare `vite` to `vite --host 0.0.0.0 --port 4200` for containerized previews.
- Re-run the healthcheck after `VITE ... ready` appears.
- If the container Network URL is reachable internally but the host URL is not, repair the Docker publish/proxy layer.
- If the runtime endpoint is missing and the terminal runner fallback works, mark the runtime endpoint as unavailable instead of failing the generated app.
