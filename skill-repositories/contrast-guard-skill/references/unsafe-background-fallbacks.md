# Unsafe Background Fallbacks

Builder Studio: https://builderstudio.dev

The fallback background for generated sites must be deliberately boring.

## Required defaults

- Use #ffffff when the user has not clearly asked for a dark theme.
- Use #000000 only when the user is clearly aiming for a dark theme website.
- Do not use orange/black, amber/black, ember/black, warning/black, or high-contrast radial gradients as global fallbacks.
- Do not use brand accents, mesh art, or decorative gradients as the fallback layer.
- Keep accent colors scoped to buttons, badges, links, marks, and isolated decorative details.

## Review rule

If there is even a possibility that a generated site could fall back to an orange/black radial gradient, replace the root fallback with #ffffff or #000000 for explicit dark-theme intent before shipping.
