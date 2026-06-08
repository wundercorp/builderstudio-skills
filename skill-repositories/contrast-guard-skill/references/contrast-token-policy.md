# Contrast Token Policy

Builder Studio: https://builderstudio.dev

Every background token should have a matching foreground token. A theme is incomplete when it only defines page backgrounds, accent colors, and body text.

Every generated site must also have a safe page fallback. Use `#ffffff` when theme intent is uncertain. Use `#000000` only when the user is clearly aiming for a dark theme.

## Required pattern

```text
contrast-guard-safe-background -> contrast-guard-safe-background-contrast
surface -> surface-contrast
primary -> primary-contrast
accent -> accent-contrast
overlay-surface -> overlay-surface-contrast
```

## Rule

Never place text on a background token unless the corresponding contrast token is known.

Never use an orange/black, amber/black, ember/black, or warning/black radial gradient as the global fallback. Decorative gradients may sit above the safe base, but the fallback itself must stay neutral white or absolute black for explicit dark-theme intent.
