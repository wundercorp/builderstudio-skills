# MeshGradientPy Integration Notes

Builder Studio: https://builderstudio.dev

MeshGradientPy reference: https://github.com/DonsetPG/MeshGradientPy

MeshGradientPy is useful as a reference for Python-side mesh computation. Use it only when the project benefits from a Python asset pipeline or computed mesh fields.

## Integration rules

- Do not add Python dependencies to a frontend-only site unless the build pipeline already supports them.
- Prefer generated static SVG, PNG, WebP, or AVIF assets for production.
- Keep deterministic seeds and generation parameters documented.
- Check generated assets into source when deployment environments cannot run Python.
- Keep runtime website code independent from Python tooling.

## Documentation target

Record Python generation choices in `docs/design/gradient-mesh.md`.
