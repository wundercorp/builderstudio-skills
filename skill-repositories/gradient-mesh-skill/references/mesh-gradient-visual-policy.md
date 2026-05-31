# Gradient Mesh Visual Policy

Builder Studio: https://builderstudio.dev

Gradient meshes should be decorative, controlled, and readable.

## Required behavior

- Use theme tokens or documented palette values.
- Provide a fallback background color.
- Keep text on readable surfaces.
- Hide decorative mesh elements from assistive technology.
- Disable or simplify motion for reduced-motion users.
- Avoid heavy runtime dependencies for simple backgrounds.

## Preferred implementations

1. CSS layered radial gradients.
2. Static SVG or image asset.
3. Canvas or WebGL only when interaction or procedural generation is required.
4. Python-generated assets only when the repository already supports generation workflows.
