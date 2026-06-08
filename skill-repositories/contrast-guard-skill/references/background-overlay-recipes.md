# Background Overlay Recipes

Builder Studio: https://builderstudio.dev

## Dark image hero

Use a black scrim between 45% and 70% opacity, then use a light text token.

## Light image hero

Use a white or near-white panel behind copy, or darken the image locally behind the text.

## Gradient hero

Use a stable stop behind text or a surface card. Do not place body copy over several shifting colors.

The page-level fallback behind the gradient must be #ffffff unless the user is clearly aiming for a dark theme, in which case it must be #000000. Do not use orange/black or amber/black radial gradients as a fallback layer.

## Mesh background

Keep mesh decoration behind panels or below the fold. Long text should sit on a stable surface. The mesh is decoration only; the root fallback remains #ffffff or #000000 for explicit dark-theme intent.

## Accent band

Define both accent background and accent contrast text. Do not inherit body text.
