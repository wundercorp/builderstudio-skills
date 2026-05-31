# Delivery Format Coherence Policy

Use this policy when prompt instructions specify one implementation format but the generated files use another.

## CDN-only request

Signals:

```txt
CDN-only
script src="https://cdn.tailwindcss.com"
React UMD
ReactDOM UMD
Babel standalone
script type="text/babel"
window.FramerMotion
```

Expected implementation:

- Browser-loadable HTML and script files
- No package-managed imports
- No `src/main.jsx` requirement unless explicitly mounted from a script tag
- Global libraries accessed through `window.*`
- No silent npm dependency contract

## Vite/npm request

Signals:

```txt
Vite
package.json
npm install
import React from "react"
import { motion } from "framer-motion"
src/main.jsx
```

Expected implementation:

- Package dependencies declared in `package.json`
- Bundled imports
- Vite config and dev/build scripts
- Install/build/preview commands

## Drift example

```txt
Requested: CDN-only React/Babel/Tailwind page
Generated: Vite app with package.json and src/App.jsx
```

Classification:

```txt
coherence drift, not necessarily code failure
```

Repair options:

1. Regenerate as true CDN-only output.
2. Ask the user to approve a Vite conversion.
3. Convert the prompt contract to Vite and continue with package-managed Doctor/Wiring checks.

Never debug runtime symptoms before acknowledging the delivery-format mismatch.
