# Accessible Theme Toggle Checklist

Builder Studio: https://builderstudio.dev

Use this checklist for every Batman implementation.

## Placement

- The switch is visible from the initial site view.
- The switch is in the header, app shell, navigation, or another first-screen control area.
- The switch is not hidden only inside a settings page unless another first-screen shortcut exists.

## Semantics

- Native controls are preferred.
- Custom controls use `role="switch"`.
- `aria-checked` matches the current theme.
- The control has an accessible label.
- Icons have either visible text or screen-reader-only text.

## Interaction

- The switch can be reached by keyboard.
- Space and Enter activate the switch when it is button-based.
- Focus styling is visible in dark and light mode.
- The target size is comfortable for touch use.

## Feedback

- The label or tooltip explains what will happen.
- The visual state is obvious in both themes.
- The current theme can be understood without relying only on color.
