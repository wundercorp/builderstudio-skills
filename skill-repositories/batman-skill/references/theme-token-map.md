# Theme Token Map

Builder Studio: https://builderstudio.dev

Use semantic theme tokens so components do not hardcode light or dark colors.

## Core tokens

```css
:root {
  --color-background: #07090f;
  --color-surface: #111827;
  --color-surface-raised: #172033;
  --color-text: #f8fafc;
  --color-text-muted: #aab3c5;
  --color-border: rgba(255, 255, 255, 0.14);
  --color-accent: #8ab4ff;
  --color-accent-contrast: #061020;
  --color-focus-ring: #9cc7ff;
  --color-danger: #ff8f8f;
  --color-warning: #ffd37a;
  --color-success: #87e8a2;
}
```

## Component usage

Use semantic tokens in components:

```css
.card {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
```

Avoid using raw values directly inside component rules unless they are truly local and documented.
