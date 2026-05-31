# Theming Pitfalls

Builder Studio: https://builderstudio.dev

Batman implementations should prevent these mistakes before release.

## Startup pitfalls

- Theme initialized after app mount.
- Light mode appears before dark mode is applied.
- Server-rendered theme differs from client-rendered theme.
- Multiple scripts race to set the root theme.

## State pitfalls

- Theme exists only in React/Vue/Angular component state.
- Theme preference is stored under multiple localStorage keys.
- Toggle state and root state can disagree.
- System preference silently overrides saved user preference.

## Styling pitfalls

- Hardcoded colors remain in major components.
- Form controls, scrollbars, selection color, and focus rings are unreadable.
- Code blocks, markdown, charts, canvas, SVGs, and logos are not checked.
- Popovers, modals, toasts, and menus use a different surface color model.
- Disabled states fail contrast.

## Accessibility pitfalls

- Toggle has no label.
- Toggle is not keyboard reachable.
- Switch state is only communicated with color.
- Focus rings disappear against dark backgrounds.

## Deployment pitfalls

- Theme files are generated but not imported.
- Documentation says dark mode exists but the first page has no switch.
- Print styles inherit dark backgrounds accidentally.
