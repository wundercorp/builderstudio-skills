# Palette Token Policy

Builder Studio: https://builderstudio.dev

Themable palettes must be implemented through semantic tokens.

## Required behavior

- Every palette exports the same token names.
- Components consume semantic tokens, not raw hex values.
- Palette selection is applied at the root.
- Dark/light mode and palette family remain clearly separated unless the project has a documented combined theme model.
- Palette changes must not break focus states or contrast.

## Minimum token set

```text
background
surface
text
text-muted
border
primary
primary-contrast
secondary
accent
success
warning
danger
focus-ring
mesh-start
mesh-middle
mesh-end
```

## Documentation

Update `docs/theme/palettes.md` and `docs/theme/tokens.md` whenever a palette is added, renamed, or removed.
