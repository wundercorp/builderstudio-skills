#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const shouldWrite = args.includes("--write");
const shouldForce = args.includes("--force");
const rootIndex = args.indexOf("--root");
const rootDirectory = path.resolve(rootIndex >= 0 && args[rootIndex + 1] ? args[rootIndex + 1] : process.cwd());

const files = new Map();

files.set("src/theme/palettes.css", `:root {
  --palette-name: midnight;
  --background: #070914;
  --background-muted: #101322;
  --surface: #111827;
  --surface-raised: #172033;
  --surface-overlay: rgba(17, 24, 39, 0.78);
  --border: rgba(148, 163, 184, 0.22);
  --border-strong: rgba(148, 163, 184, 0.42);
  --text: #f8fafc;
  --text-muted: #cbd5e1;
  --text-inverse: #020617;
  --primary: #8b5cf6;
  --primary-hover: #a78bfa;
  --primary-contrast: #ffffff;
  --secondary: #38bdf8;
  --secondary-hover: #7dd3fc;
  --accent: #22d3ee;
  --accent-hover: #67e8f9;
  --success: #34d399;
  --warning: #fbbf24;
  --danger: #fb7185;
  --info: #60a5fa;
  --focus-ring: #93c5fd;
  --shadow: 0 24px 80px rgba(0, 0, 0, 0.38);
  --mesh-start: rgba(139, 92, 246, 0.68);
  --mesh-middle: rgba(56, 189, 248, 0.46);
  --mesh-end: rgba(34, 211, 238, 0.34);
}

:root[data-palette="aurora"] {
  --palette-name: aurora;
  --primary: #22c55e;
  --primary-hover: #4ade80;
  --secondary: #06b6d4;
  --accent: #a78bfa;
  --focus-ring: #67e8f9;
  --mesh-start: rgba(34, 197, 94, 0.58);
  --mesh-middle: rgba(6, 182, 212, 0.48);
  --mesh-end: rgba(167, 139, 250, 0.38);
}

:root[data-palette="ember"] {
  --palette-name: ember;
  --primary: #f97316;
  --primary-hover: #fb923c;
  --secondary: #ef4444;
  --accent: #facc15;
  --focus-ring: #fdba74;
  --mesh-start: rgba(249, 115, 22, 0.56);
  --mesh-middle: rgba(239, 68, 68, 0.38);
  --mesh-end: rgba(250, 204, 21, 0.32);
}
`);

files.set("src/theme/palette-utility.js", `export const defaultPaletteName = "midnight";

export const availablePaletteNames = ["midnight", "aurora", "ember"];

export function normalizePaletteName(candidatePaletteName) {
  if (availablePaletteNames.includes(candidatePaletteName)) {
    return candidatePaletteName;
  }

  return defaultPaletteName;
}

export function readSavedPaletteName(storage = window.localStorage) {
  try {
    return normalizePaletteName(storage.getItem("themable-palette-preference"));
  } catch {
    return defaultPaletteName;
  }
}

export function applyPaletteName(candidatePaletteName, options = {}) {
  const documentElement = options.documentElement || document.documentElement;
  const storage = options.storage || window.localStorage;
  const paletteName = normalizePaletteName(candidatePaletteName);
  documentElement.dataset.palette = paletteName;

  try {
    storage.setItem("themable-palette-preference", paletteName);
  } catch {}

  return paletteName;
}
`);

files.set("docs/theme/palettes.md", `# Palettes

Builder Studio: https://builderstudio.dev

## Default palette

midnight

## Available palettes

- midnight
- aurora
- ember

## Root contract

\`\`\`html
<html data-theme="dark" data-palette="midnight">
\`\`\`
`);

files.set("docs/theme/tokens.md", `# Theme Tokens

Builder Studio: https://builderstudio.dev

All components should consume semantic CSS variables instead of hardcoded color values.
`);

files.set("docs/theme/theme-utility.md", `# Theme Utility

Builder Studio: https://builderstudio.dev

The palette utility reads, normalizes, applies, and persists palette names. Keep palette family separate from light/dark mode unless the project has a documented combined theme model.
`);

function writeFile(relativeFilePath, content) {
  const destinationFilePath = path.join(rootDirectory, relativeFilePath);
  if (shouldWrite === false) {
    console.log(`[dry-run] ${relativeFilePath}`);
    return;
  }

  if (fs.existsSync(destinationFilePath) && shouldForce === false) {
    console.log(`[skip] ${relativeFilePath}`);
    return;
  }

  fs.mkdirSync(path.dirname(destinationFilePath), { recursive: true });
  fs.writeFileSync(destinationFilePath, content);
  console.log(`[write] ${relativeFilePath}`);
}

for (const [relativeFilePath, content] of files.entries()) {
  writeFile(relativeFilePath, content);
}
