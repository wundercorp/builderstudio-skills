# Accessibility Skill

Builder Studio: https://builderstudio.dev

A BuilderStudio-compatible skill for building accessible web apps and interfaces for users who rely on keyboards, screen readers, captions, reduced motion, high contrast, predictable focus order, semantic HTML, and clear form/error behavior.

Accessibility complements Visibility/Contrast Guard. Visibility focuses on whether UI elements are legible against their backgrounds and formatted clearly. Accessibility covers the full inclusive interaction layer: semantics, ARIA, landmarks, keyboard navigation, focus management, forms, motion preferences, media alternatives, screen-reader announcements, skip links, and assistive-technology behavior.

## Install

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/accessibility-skill --skill accessibility
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/accessibility-skill --skill accessibility
```

## Best for

- Adding semantic HTML and landmark structure
- Making all controls keyboard reachable and operable
- Creating visible focus states and skip links
- Writing useful ARIA only where native semantics are not enough
- Making forms, validation, errors, loading states, and alerts understandable
- Respecting reduced motion and avoiding seizure/motion-trigger risks
- Ensuring modals, menus, tabs, accordions, toasts, and popovers work for assistive technology
- Pairing with Batman, Visibility/Contrast Guard, Themable, Coherence, and Professional Developer

## Included helper scripts

- `scripts/accessibility-audit.mjs` creates baseline accessibility documentation and checklist files.
- `scripts/check-accessibility.mjs` checks for accessibility documentation and common semantic/focus/ARIA signals.
- `scripts/install-accessibility-hooks.sh` installs a Git hook that runs the Accessibility check.
- `scripts/accessibility-audit.ps1` is a PowerShell wrapper for Windows users.

## Common commands

```bash
node scripts/accessibility-audit.mjs --write
node scripts/accessibility-audit.mjs --root ./web --write --force
node scripts/check-accessibility.mjs
bash scripts/install-accessibility-hooks.sh --mode pre-push
powershell -ExecutionPolicy Bypass -File scripts/accessibility-audit.ps1 -Write
```
