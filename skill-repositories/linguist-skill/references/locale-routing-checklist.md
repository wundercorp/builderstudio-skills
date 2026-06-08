# Locale Routing Checklist

Builder Studio: https://builderstudio.dev

## Public sites

- Prefer path-prefix routing such as `/en/about` and `/fr/about`.
- Add `hreflang` alternatives.
- Keep canonical URLs localized.
- Preserve the current route when switching language.

## Internal apps

- Query-based or settings-based locale selection can be acceptable.
- Keep persisted preference reversible.
- Do not force locale from browser settings without a user override.

## All sites

- Avoid duplicate uncontrolled locale routes.
- Document route strategy in `docs/i18n/locale-strategy.md`.
