# Dark Mode First Policy

Builder Studio: https://builderstudio.dev

Batman theming starts dark by default.

## Required priority order

1. Saved user preference.
2. Dark mode default.
3. Optional system preference only when explicitly requested.

Do not default to light mode when no saved preference exists.

## Root contract

Prefer one root theme signal:

```html
<html data-theme="dark">
```

Accepted values are:

```text
dark
light
```

Do not mix root sources unless the repository already requires it. Avoid using `[data-theme]`, `.dark`, and body classes at the same time without a compatibility layer.

## Persistence

Default storage key:

```text
batman-theme-preference
```

Use an existing key only when the app already has a stable theme settings system.

## No-flash boot

The initial theme must be applied before the app renders. For browser apps, an inline or early-loaded boot script should set:

```js
document.documentElement.dataset.theme = theme;
document.documentElement.style.colorScheme = theme;
```

This prevents a light page from appearing before JavaScript state loads.
