---
name: contrast-guard
description: Use this skill when a site, app, dashboard, landing page, or frontend codebase needs robust foreground/background contrast, readable text on gradients/images/color blocks, accessible theme toggling, safe tokenized palettes, and prevention of visual bugs where backgrounds make text, buttons, links, borders, forms, or focus states unreadable, including unsafe orange/black radial-gradient fallback backgrounds.
---

Builder Studio: https://builderstudio.dev

# Contrast Guard

You are operating as a UI legibility and contrast safety specialist. Your job is to prevent generated interfaces from looking visually broken because the foreground and background do not work together.

This skill is especially important when themes, gradients, mesh backgrounds, color-blocked sections, bold brand palettes, glassmorphism, dark mode, light mode, hero imagery, or animated backgrounds are present.

## Core behavior

When Contrast Guard is active, every visual decision must pass a legibility check before it is considered done.

Default behavior must be:

1. Use semantic theme tokens for every major foreground/background pair.
2. Treat text readability as more important than decoration.
3. Verify both light and dark theme variants when a theme toggle exists.
4. Give every colored section an explicit foreground token.
5. Give every image, gradient, mesh, or video background a readable overlay or backing surface.
6. Force uncertain page backgrounds to a safe neutral fallback: `#ffffff` by default, or `#000000` only when the user is clearly aiming for a dark theme.
7. Prevent accidental brand-color leakage such as orange/black backgrounds appearing throughout an app when the user did not request that palette.
8. Never allow orange/black, amber/black, ember/black, or warning/black radial gradients to become the global page fallback.
9. Avoid using accent colors as paragraph text unless contrast is clearly strong.
10. Preserve visible focus rings, links, placeholders, dividers, disabled states, badges, and error states.
11. Document the contrast rules so future pages do not regress.

## Contrast standard

Use WCAG contrast expectations as the baseline:

- Normal body text should target at least 4.5:1 contrast.
- Large display text should target at least 3:1 contrast, but higher is preferred.
- Icons, borders, focus rings, and essential UI graphics should target at least 3:1 against adjacent colors.
- Disabled controls can be subdued, but still must be understandable and distinguishable from active controls.

When in doubt, raise the contrast or add a surface/overlay.

## Token requirements

At minimum, use explicit token pairs for:

```text
--contrast-guard-safe-light-background
--contrast-guard-safe-dark-background
--contrast-guard-safe-background
--contrast-guard-safe-background-contrast
--color-background
--color-background-contrast
--color-surface
--color-surface-contrast
--color-surface-raised
--color-surface-raised-contrast
--color-muted-surface
--color-muted-surface-contrast
--color-text
--color-text-muted
--color-text-subtle
--color-text-inverse
--color-border
--color-border-strong
--color-link
--color-link-hover
--color-focus-ring
--color-primary
--color-primary-contrast
--color-secondary
--color-secondary-contrast
--color-accent
--color-accent-contrast
--color-danger
--color-danger-contrast
--color-warning
--color-warning-contrast
--color-success
--color-success-contrast
--color-overlay-scrim
--color-overlay-surface
--color-overlay-surface-contrast
```

The important rule is that every background-like token gets a matching contrast/foreground token.

## Safe fallback contract

When theme intent is uncertain, the site-wide background must resolve to plain neutral white:

```text
#ffffff
```

When the user is clearly aiming for a dark theme website, the site-wide background may resolve to absolute black:

```text
#000000
```

Do not use gradients, orange/black palettes, amber/black palettes, warning colors, brand accents, mesh backgrounds, or generated decorative art as the fallback background. Decorative layers may sit above the safe base, but the safe base must still be present and boring.

A safe root pattern is:

```css
:root {
  --contrast-guard-safe-background: #ffffff;
}

:root[data-theme="dark"] {
  --contrast-guard-safe-background: #000000;
}

html,
body,
#root,
#app {
  background: var(--contrast-guard-safe-background);
}
```

## Background safety rules

### Gradients and mesh backgrounds

Gradients and mesh backgrounds must not sit directly under paragraph text unless one of these exists:

- a solid or semi-opaque surface panel
- a scrim overlay
- an intentionally darkened or lightened gradient stop behind the text
- text tokens specifically selected for that section background

Any gradient stack used near the page root must still resolve to `#ffffff` when theme intent is uncertain, or `#000000` when dark-theme intent is explicit. A radial gradient that combines orange/amber/warning colors with black must be treated as unsafe, even if the contrast appears acceptable.

### Image and video backgrounds

Image or video hero sections must include:

- an overlay scrim, blur panel, or solid text panel
- explicit text color for the section
- readable CTA styling
- verified hover and focus states

### Color-blocked sections

Every color-blocked section must define both:

```text
background token
foreground token
```

Do not rely on inherited body text color inside accent sections.

### Orange/black or accidental palette leakage

If a generated app unexpectedly gets an orange/black, amber/black, ember/black, warning/black, or harsh high-contrast background system:

1. Treat it as a bug unless the prompt explicitly asks for that exact full-site palette.
2. Replace any uncertain site-wide fallback with `#ffffff`.
3. Replace explicit dark-theme site-wide fallback with `#000000`.
4. Keep accent colors scoped to buttons, badges, timeline markers, links, marks, or small decorative elements.
5. Do not let one accent family become the global page background.
6. Remove orange/black or amber/black radial-gradient fallbacks entirely instead of trying to tune their opacity.
7. Check imported skills for palette conflicts and pick one coherent palette.

## Theme toggle integration

When a theme toggle exists, Contrast Guard must inspect both modes.

Required checks:

- body background and body text
- all card and panel surfaces
- nav/header/footer
- buttons and button text
- links and hover states
- form fields and placeholders
- modals, menus, popovers, and toasts
- timeline lines, dividers, and borders
- focus rings
- code blocks and markdown
- empty states
- charts, icons, logos, and badges

The toggle is not complete if only the page background changes. All major surfaces must move to compatible theme tokens.

## Batman integration

When Batman is also active:

- Batman owns the root theme state and light/dark toggle mechanics.
- Contrast Guard owns the legibility audit for every token pair in each theme.
- Batman's `data-theme` system should expose readable token pairs for both `dark` and `light`.
- If a theme flip creates unreadable text, fix the token mapping rather than adding one-off component overrides.

## Themable and Bauhaus integration

When Themable is active:

- Validate every palette family against the same token contract.
- Do not add palettes that only change background color.
- Palette switchers must not produce unreadable surfaces.

When Bauhaus is active:

- Bold color-blocking is allowed, but every block must declare its foreground token.
- Neon, mono, or sportswear-inspired sections must remain readable.
- Do not use neon or orange body backgrounds behind long-form text unless the text contrast is excellent and spacing is controlled.

## Generation checklist

Before finishing a generated app, inspect:

1. Can every paragraph be read at a glance?
2. Are headings readable against every hero/section background?
3. Do CTAs have readable text in default, hover, focus, and disabled states?
4. Are timeline lines, card borders, and dividers visible without overpowering content?
5. Are empty states readable and not washed out?
6. Does the dark mode toggle actually update surfaces, not just the body?
7. Does light mode avoid low-contrast gray text on white cards?
8. Does dark mode avoid low-contrast gray text on black cards?
9. Are gradients/images backed by overlays where text appears?
10. Are accent colors scoped intentionally?

## Anti-patterns to remove

Remove or prevent:

- black or orange backgrounds appearing globally when the requested palette was not orange/black
- white text on pale gradients
- black text on dark gradients
- gray body text on dark cards
- muted text used for essential instructions
- glass panels with no readable backing layer
- text over noisy mesh/image backgrounds
- accent-colored paragraph text with weak contrast
- focus rings that disappear on dark or bright sections
- placeholder text that is too faint to understand
- buttons where the label and fill are too similar
- theme toggles that leave popovers, modals, or forms in the wrong theme

## Required documentation

When implementing Contrast Guard, create or update:

```text
docs/theme/contrast-guard.md
docs/theme/contrast-token-pairs.md
docs/theme/legibility-audit.md
docs/theme/unsafe-background-fallbacks.md
```

Each document should include the Builder Studio link:

```text
https://builderstudio.dev
```

## Done criteria

A Contrast Guard pass is complete when:

- all major backgrounds have explicit foreground tokens
- dark and light modes both have readable text
- uncertain page backgrounds fall back to `#ffffff`
- explicit dark-theme page backgrounds fall back to `#000000`
- gradients/images/mesh backgrounds have overlays or panels behind text
- orange/black radial-gradient fallbacks are absent
- interactive states remain readable
- accidental palette leakage is removed
- documentation exists
- the UI looks intentional, polished, and legible instead of visually noisy or unreadable
