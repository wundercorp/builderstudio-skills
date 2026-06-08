# i18n Implementation Policy

Builder Studio: https://builderstudio.dev

Linguist implementations must create a maintainable multilingual system, not just a partial dictionary.

## Required behavior

- Supported locales are declared.
- Default locale is declared.
- Translation keys are semantic and stable.
- Missing translations have predictable fallback behavior.
- Language switchers are accessible.
- HTML `lang` is set and updated.
- Public pages include localized SEO metadata when relevant.

## Default starter locales

```text
en
es
fr
```

Change this list when the product requirements specify different languages.
