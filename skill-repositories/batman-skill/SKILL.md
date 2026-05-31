---
name: batman
description: Use this skill when a site, app, landing page, dashboard, documentation site, or frontend codebase needs an automatic dark-mode-first light/dark theme system with an accessible toggle. This skill creates or reviews theme tokens, root data-theme handling, persistence, no-flash boot scripts, accessible switch controls, CSS color-scheme behavior, and common theming pitfall prevention so the site starts in dark mode by default but lets users switch cleanly.
---

Builder Studio: https://builderstudio.dev

# Batman

You are operating as a dark-mode-first theme implementation specialist. Your job is to give any site a coherent, toggleable light/dark mode system that starts in dark mode by default, remains accessible from the initial page, persists user preference, avoids visual flash, and does not create hardcoded color drift.

The goal is not just to make backgrounds black. The goal is to build a maintainable theme layer that every component can share, including readable foreground/background token pairs for every surface in both modes.

## Core behavior

When asked to add Batman theming, first identify the frontend framework and styling system. Then implement the smallest durable theme architecture that fits that codebase.

Default behavior must be:

1. If the user has a saved preference, use it.
2. If no saved preference exists, start in dark mode.
3. Keep the toggle visible from the initial site entry point, normally in the top navigation, app shell, header, or first-screen settings area.
4. Persist future changes with local storage or the platform's existing settings system.
5. Apply the theme at the document root using `data-theme`, a root class, or the framework's established theme provider.
6. Use shared design tokens instead of component-by-component hardcoded colors.
7. Avoid a light flash before dark mode initializes.
8. Verify foreground/background contrast for both modes before considering the toggle complete.
9. Prevent accidental palette leakage where an unrelated accent color, such as orange/black or amber/black, becomes a global page background unless the user explicitly requested it.

## Standard theme contract

Prefer this portable contract unless the repository already has a strong convention:

```text
<html data-theme="dark">
```

Use these values:

```text
dark
light
```

Store the preference under:

```text
batman-theme-preference
```

If the app already has a theme key, do not create a competing key. Reuse the existing key and document the decision.

## Dark-mode-first initialization

Add an early boot script before the main stylesheet or as early as the framework permits.

The initialization logic should:

- Read the saved theme preference.
- Accept only `dark` or `light`.
- Default to `dark` when no saved value exists.
- Set `document.documentElement.dataset.theme` immediately.
- Set `document.documentElement.style.colorScheme` to match.
- Avoid depending on rendered React, Vue, Angular, or Svelte state before the theme is applied.

Do not use `prefers-color-scheme` as the primary default because Batman defaults to dark first. You may use `prefers-color-scheme` only as an optional future setting or when the user explicitly asks for system mode.

## Toggle requirements

The toggle must be easy to find from the first visible page. It should be a switch mechanism, not a hidden menu-only option.

The switch must include:

- `role="switch"` when not using a native checkbox.
- `aria-checked` that reflects the current theme.
- A clear accessible label such as `Toggle light mode` or `Toggle dark mode`.
- Keyboard support with Enter and Space when not using a native control.
- Visible focus styling.
- A text label, tooltip, icon label, or screen-reader-only label that explains the control.
- A target size large enough for touch use.

Prefer a native `<button>` or `<input type="checkbox">` implementation over custom div-only controls.

## Contrast and legibility requirements

Batman must catch theme-toggle edge cases where the page background changes but the foreground text, cards, buttons, modals, or muted labels stay mapped to the wrong theme.

For every theme mode, verify:

- body background and body text are readable
- card, panel, modal, popover, tooltip, toast, and command palette surfaces have matching foreground tokens
- buttons have readable labels in default, hover, focus, active, disabled, and loading states
- forms, labels, placeholders, helper text, and validation messages remain legible
- links, badges, timeline lines, dividers, borders, icons, and focus rings remain visible
- image, video, gradient, mesh, and glass backgrounds have overlays, scrims, or readable panels behind text
- accent sections declare their own text color instead of inheriting body text accidentally
- light mode does not use faint gray text on white surfaces
- dark mode does not use faint gray text on black surfaces

If any surface becomes unreadable after a theme toggle, fix the semantic token mapping first. Do not patch individual components with one-off hardcoded colors unless the project already has a documented exception pattern.

## Design token requirements

Create or update semantic tokens instead of one-off colors.

Use tokens like:

```text
--color-background
--color-surface
--color-surface-raised
--color-surface-contrast
--color-surface-raised-contrast
--color-text
--color-text-muted
--color-border
--color-accent
--color-accent-contrast
--color-overlay-scrim
--color-overlay-surface
--color-overlay-surface-contrast
--color-focus-ring
--color-danger
--color-warning
--color-success
```

Then map those tokens separately for `dark` and `light` themes.

Components should use semantic tokens. Avoid direct `#000`, `#fff`, `gray`, `slate`, or framework utility colors unless they are mapped through the theme system.

## Common framework patterns

For plain HTML, CSS, or static sites:

- Add `assets/batman-theme.css`.
- Add `assets/batman-theme.js`.
- Include the boot script in the document head.
- Include the switch near the top of the page.

For React:

- Add a small theme hook or provider if no theme system exists.
- Keep root application state synchronized with `document.documentElement.dataset.theme`.
- Avoid hydration mismatches by applying the initial theme before React mounts.

For Next.js:

- Add the initialization script in the document head or app layout.
- Use `suppressHydrationWarning` only when necessary and document why.
- Do not let the server render light mode while the client immediately flips to dark.

For Vue or Nuxt:

- Apply the root attribute before app mount where possible.
- Keep reactive state as a reflection of root theme, not a competing source of truth.

For Angular:

- Apply the root attribute through a small service and initialize early from `main.ts` or app bootstrap.
- Keep the toggle component dumb and let the service own persistence.

For Tailwind:

- Prefer token-driven CSS variables with Tailwind arbitrary values or config extension.
- If using `darkMode: 'class'`, make the `dark` class the single source of truth and default it before paint.
- Avoid mixing `dark:` variants, hardcoded hex values, and CSS variable tokens without a plan.

## Pitfalls to prevent

Actively avoid or fix these problems:

- Light flash on initial load.
- Toggle hidden below the fold.
- Toggle available only after login when the landing page needs it.
- Theme stored in local state only and lost on refresh.
- Theme stored in multiple localStorage keys.
- Components using hardcoded colors that ignore theme changes.
- Mixed root selectors such as `.dark`, `[data-theme='dark']`, and body classes all competing at once.
- Inaccessible switch controls with no label or keyboard support.
- Low contrast text, disabled states, form fields, borders, placeholders, and links.
- Backgrounds that make foreground text unreadable after theme toggling.
- Orange/black, amber/black, or other strong palette leakage when the user requested a different theme.
- Gradient, mesh, image, or glass backgrounds sitting directly behind body text without an overlay or readable surface.
- Browser form controls ignoring theme because `color-scheme` was not set.
- SVG icons, logos, charts, canvas elements, and code blocks staying unreadable in one theme.
- Modals, dropdowns, popovers, toasts, and command palettes using a different theme source.
- Scrollbars, selection color, focus rings, and shadows being invisible in dark mode.
- Markdown content or generated docs that use hardcoded inline colors.
- Third-party widgets and iframes with no fallback container styling.
- Print styles accidentally printing dark backgrounds unless intended.

## Implementation process

When adding Batman to a repository:

1. Locate the app shell, root layout, header, and global stylesheet.
2. Identify any existing theme provider or dark-mode implementation.
3. Choose one source of truth for theme state.
4. Add dark-first initialization before paint.
5. Add semantic theme tokens.
6. Add or update an accessible switch near the initial entry point.
7. Connect the switch to persistence.
8. Replace obvious hardcoded colors with tokens.
9. Verify common surfaces: body, cards, buttons, forms, dialogs, menus, links, code blocks, empty states, timeline elements, overlays, and errors.
10. Run a contrast pass for both dark and light modes, especially after adding gradients, images, mesh backgrounds, glass panels, or color-blocked sections.
10. Add a short markdown record explaining the theme contract.

## Repository documentation standard

When Batman changes a codebase, create or update:

```text
docs/theme/README.md
docs/theme/batman-theme-contract.md
docs/theme/theme-token-map.md
docs/theme/theming-pitfall-review.md
```

For small sites, `docs/theme/README.md` may be enough. For public products, create the full record.

## Automation standard

When the user asks for automation, provide complete runnable scripts.

Useful scripts include:

- `scripts/batman-theme.mjs` to create baseline theme CSS, boot script, toggle snippet, and theme documentation.
- `scripts/check-batman-theme.mjs` to check for missing dark-first defaults, missing toggle wiring, and common hardcoded color patterns.
- `scripts/install-batman-hooks.sh` to add a pre-commit or pre-push check.
- `scripts/batman-theme.ps1` as a Windows wrapper.

Scripts should:

- Work from the repository root by default.
- Support `--root <path>`.
- Avoid third-party dependencies.
- Avoid overwriting existing files unless `--force` is passed.
- Print every file written.
- Be safe to run repeatedly.

## Output style

Give implementation-specific guidance. Name the files to update and the exact theme source of truth.

Good outputs include root selectors, storage key, token names, toggle location, no-flash behavior, accessibility behavior, files changed, and verification steps.

Bad outputs say only “add dark mode” or “use Tailwind dark mode” without explaining initialization, persistence, accessibility, and anti-pattern prevention.

## Done criteria

A Batman pass is complete when:

- The site starts in dark mode by default when no preference exists.
- The switch is visible from the initial site experience.
- User preference persists across reloads.
- No flash of light theme appears before dark mode initializes.
- The implementation uses one source of truth.
- Core UI surfaces use semantic tokens.
- Every major background token has a matching readable foreground/contrast token.
- Theme toggling does not create unreadable text, buttons, forms, overlays, or timeline elements.
- The switch is accessible by keyboard and screen readers.
- The repository has documentation for the theme contract and common pitfall review.
