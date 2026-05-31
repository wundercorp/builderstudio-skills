# Contrast Legibility Theme Toggle Policy

Builder Studio: https://builderstudio.dev

Batman owns theme toggling, so Batman must also prevent common legibility failures that appear only after a theme switch.

## Required checks

- Every background-like token has a matching foreground or contrast token.
- The light theme and dark theme both define all required pairs.
- Cards, panels, modals, popovers, dropdowns, toasts, forms, and command palettes use surface-specific foreground tokens.
- Gradients, images, mesh backgrounds, and video backgrounds use overlays or readable panels behind text.
- Accent-colored sections define their own foreground tokens and do not inherit body text accidentally.
- Focus rings, borders, timeline lines, links, placeholders, muted text, and disabled states remain visible.

## Palette leakage rule

If a strong color system such as orange/black, amber/black, neon/black, or red/black appears globally and the user did not request it, treat that as a theme drift bug. Keep strong accent colors scoped to decorative marks, badges, buttons, or isolated sections unless the prompt explicitly asks for that full palette.

## Remediation order

1. Fix semantic token mappings.
2. Add overlay/scrim/readable panels for complex backgrounds.
3. Replace inherited text colors in accent sections.
4. Remove hardcoded component colors that bypass the theme system.
5. Document the contrast decision.
