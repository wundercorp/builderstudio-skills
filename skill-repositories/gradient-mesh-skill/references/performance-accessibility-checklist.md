# Mesh Performance and Accessibility Checklist

Builder Studio: https://builderstudio.dev

## Performance

- Avoid continuous animation of large blur filters.
- Prefer static assets for complex meshes.
- Compress generated raster assets.
- Test on mobile dimensions.
- Avoid many fixed full-screen gradient layers.

## Accessibility

- Decorative mesh DOM nodes use `aria-hidden="true"`.
- Foreground content has contrast-preserving surfaces.
- Reduced motion disables mesh animation.
- Fallback color is available when gradients do not render.
