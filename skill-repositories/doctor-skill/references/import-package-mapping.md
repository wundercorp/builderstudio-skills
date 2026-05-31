# Import Package Mapping

## Direct mappings

| Import | Package |
| --- | --- |
| `motion/react` | `motion` |
| `framer-motion` | `framer-motion` |
| `lucide-react` | `lucide-react` |
| `shaders/react` with Paper component names such as `FlutedGlass` or `Swirl` | rewrite import to `@paper-design/shaders-react`, install `@paper-design/shaders-react` |
| `@paper-design/shaders-react` | `@paper-design/shaders-react` |
| `@paper-design/shaders` | `@paper-design/shaders` |
| `@splinetool/react-spline` | `@splinetool/react-spline` |
| `@splinetool/react-spline/next` | `@splinetool/react-spline` |
| `@splinetool/runtime` | `@splinetool/runtime` |
| `@react-three/fiber` | `@react-three/fiber` |
| `@react-three/drei` | `@react-three/drei` |
| `three/examples/jsm/*` | `three` |
| `gsap` | `gsap` |
| `clsx` | `clsx` |
| `tailwind-merge` | `tailwind-merge` |
| `class-variance-authority` | `class-variance-authority` |
| `@supabase/supabase-js` | `@supabase/supabase-js` |

## Generic rule

Scoped package: first two segments.

```txt
@scope/name/path -> @scope/name
```

Unscoped package: first segment.

```txt
package/path -> package
```

## Wrong-package shader repair

Do not treat every `shaders/react` failure the same way.

- If the import contains Paper Shaders component names such as `FlutedGlass`, `Swirl`, `MeshGradient`, `Water`, `PaperTexture`, `ImageDithering`, `GodRays`, `Spiral`, `Warp`, or `PulsingBorder`, rewrite the import source to `@paper-design/shaders-react` and install `@paper-design/shaders-react`.
- If the import contains generic components such as `Shader`, `LinearGradient`, or `CursorTrail`, preserve `shaders/react` and install/verify the `shaders` package instead.
