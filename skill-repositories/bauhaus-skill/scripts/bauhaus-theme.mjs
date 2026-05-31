#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const argumentsList = process.argv.slice(2);
const shouldWriteFiles = argumentsList.includes("--write");
const shouldForceOverwrite = argumentsList.includes("--force");
const rootArgumentIndex = argumentsList.indexOf("--root");
const rootDirectoryPath = path.resolve(rootArgumentIndex >= 0 && argumentsList[rootArgumentIndex + 1] ? argumentsList[rootArgumentIndex + 1] : process.cwd());

const generatedFiles = new Map();

generatedFiles.set("src/theme/bauhaus-theme.css", `:root {
  --bauhaus-palette-name: voltage;
  --background: #f8faf9;
  --background-muted: #eff3ef;
  --background-contrast: #050505;
  --surface: #ffffff;
  --surface-raised: #ffffff;
  --surface-inverse: #0f1010;
  --border: rgba(5, 5, 5, 0.12);
  --border-strong: rgba(5, 5, 5, 0.24);
  --text: #050505;
  --text-muted: #4b5563;
  --text-inverse: #f8faf9;
  --headline: #050505;
  --headline-inverse: #ffffff;
  --primary: #9cff28;
  --primary-hover: #74ff00;
  --primary-contrast: #050505;
  --secondary: #111111;
  --secondary-hover: #222222;
  --accent: #9cff28;
  --accent-soft: rgba(156, 255, 40, 0.16);
  --accent-strong: #74ff00;
  --focus-ring: #9cff28;
  --shadow-soft: 0 20px 60px rgba(0, 0, 0, 0.08);
  --shadow-strong: 0 28px 90px rgba(0, 0, 0, 0.16);
  --hero-ring: rgba(156, 255, 40, 0.28);
  --hero-panel: #ffffff;
  --hero-glow: rgba(156, 255, 40, 0.26);
}

:root[data-bauhaus-palette="blackout"] {
  --bauhaus-palette-name: blackout;
  --background: #050505;
  --background-muted: #0d0d0d;
  --background-contrast: #f6f7f4;
  --surface: #0f1010;
  --surface-raised: #171717;
  --surface-inverse: #f6f7f4;
  --border: rgba(246, 247, 244, 0.12);
  --border-strong: rgba(246, 247, 244, 0.24);
  --text: #f6f7f4;
  --text-muted: #c7d0c8;
  --text-inverse: #050505;
  --headline: #ffffff;
  --headline-inverse: #050505;
  --primary: #95ff1f;
  --primary-hover: #b4ff54;
  --primary-contrast: #050505;
  --secondary: #f6f7f4;
  --secondary-hover: #ffffff;
  --accent: #95ff1f;
  --accent-soft: rgba(149, 255, 31, 0.2);
  --accent-strong: #b4ff54;
  --focus-ring: #95ff1f;
  --shadow-soft: 0 20px 60px rgba(0, 0, 0, 0.34);
  --shadow-strong: 0 28px 90px rgba(0, 0, 0, 0.52);
  --hero-ring: rgba(149, 255, 31, 0.22);
  --hero-panel: #101010;
  --hero-glow: rgba(149, 255, 31, 0.3);
}

:root[data-bauhaus-palette="signal"] {
  --bauhaus-palette-name: signal;
  --background: #95ff1f;
  --background-muted: #b8ff67;
  --background-contrast: #050505;
  --surface: #ffffff;
  --surface-raised: #f7f9f7;
  --surface-inverse: #050505;
  --border: rgba(5, 5, 5, 0.14);
  --border-strong: rgba(5, 5, 5, 0.26);
  --text: #050505;
  --text-muted: #1f2937;
  --text-inverse: #ffffff;
  --headline: #050505;
  --headline-inverse: #ffffff;
  --primary: #050505;
  --primary-hover: #1a1a1a;
  --primary-contrast: #ffffff;
  --secondary: #ffffff;
  --secondary-hover: #f6f7f4;
  --accent: #ffffff;
  --accent-soft: rgba(255, 255, 255, 0.3);
  --accent-strong: #050505;
  --focus-ring: #050505;
  --shadow-soft: 0 20px 60px rgba(0, 0, 0, 0.12);
  --shadow-strong: 0 28px 90px rgba(0, 0, 0, 0.24);
  --hero-ring: rgba(255, 255, 255, 0.28);
  --hero-panel: rgba(255, 255, 255, 0.72);
  --hero-glow: rgba(255, 255, 255, 0.2);
}

.bauhaus-page {
  background: var(--background);
  color: var(--text);
}

.bauhaus-display {
  color: var(--headline);
  font-size: clamp(3rem, 8vw, 7rem);
  font-weight: 900;
  letter-spacing: -0.05em;
  line-height: 0.95;
  text-wrap: balance;
}

.bauhaus-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.bauhaus-hero-frame {
  position: relative;
  overflow: hidden;
  border-radius: 2rem;
  background: var(--hero-panel);
  box-shadow: var(--shadow-strong);
}

.bauhaus-hero-frame::before {
  content: "";
  position: absolute;
  inset: 8% auto auto 10%;
  width: min(60vw, 36rem);
  height: min(60vw, 36rem);
  border-radius: 999px;
  border: min(6vw, 5rem) solid var(--hero-ring);
  pointer-events: none;
}

.bauhaus-accent-band {
  background: var(--accent);
  color: var(--primary-contrast);
}

.bauhaus-inverse-band {
  background: var(--background-contrast);
  color: var(--text-inverse);
}

.bauhaus-button-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding: 0.75rem 1.25rem;
  border-radius: 999px;
  border: 1px solid transparent;
  background: var(--primary);
  color: var(--primary-contrast);
  font-weight: 700;
  box-shadow: var(--shadow-soft);
}

.bauhaus-button-primary:hover {
  background: var(--primary-hover);
}
`);

generatedFiles.set("src/theme/bauhaus-theme.js", `export const defaultBauhausPaletteName = "voltage";

export const availableBauhausPaletteNames = ["voltage", "blackout", "signal"];

export function normalizeBauhausPaletteName(candidatePaletteName) {
  if (availableBauhausPaletteNames.includes(candidatePaletteName)) {
    return candidatePaletteName;
  }

  return defaultBauhausPaletteName;
}

export function readSavedBauhausPaletteName(storage = window.localStorage) {
  try {
    return normalizeBauhausPaletteName(storage.getItem("bauhaus-palette-preference"));
  } catch {
    return defaultBauhausPaletteName;
  }
}

export function applyBauhausPaletteName(candidatePaletteName, options = {}) {
  const rootDocumentElement = options.documentElement || document.documentElement;
  const storage = options.storage || window.localStorage;
  const normalizedPaletteName = normalizeBauhausPaletteName(candidatePaletteName);
  rootDocumentElement.dataset.bauhausPalette = normalizedPaletteName;

  try {
    storage.setItem("bauhaus-palette-preference", normalizedPaletteName);
  } catch {}

  return normalizedPaletteName;
}
`);

generatedFiles.set("docs/design/bauhaus-language.md", `# Bauhaus Language

Builder Studio: https://builderstudio.dev

## Visual thesis

Bold, premium, minimal, geometric, and memorable.

## Primary signals

- oversized headlines
- high-contrast theme sections
- limited accent color families
- disciplined whitespace
- strong CTA visibility
- geometric framing devices
`);

generatedFiles.set("docs/design/bauhaus-palettes.md", `# Bauhaus Palettes

Builder Studio: https://builderstudio.dev

## Default palette

voltage

## Available palettes

- voltage
- blackout
- signal

## Root contract

\`\`\`html
<html data-bauhaus-palette="voltage">
\`\`\`
`);

generatedFiles.set("docs/design/bauhaus-components.md", `# Bauhaus Components

Builder Studio: https://builderstudio.dev

Components should pull from the shared Bauhaus semantic token system rather than introducing one-off colors or generic default styling.
`);

function writeGeneratedFile(relativeFilePath, content) {
  const destinationFilePath = path.join(rootDirectoryPath, relativeFilePath);
  if (shouldWriteFiles === false) {
    console.log(`[dry-run] ${relativeFilePath}`);
    return;
  }

  if (fs.existsSync(destinationFilePath) && shouldForceOverwrite === false) {
    console.log(`[skip] ${relativeFilePath}`);
    return;
  }

  fs.mkdirSync(path.dirname(destinationFilePath), { recursive: true });
  fs.writeFileSync(destinationFilePath, content);
  console.log(`[write] ${relativeFilePath}`);
}

for (const [relativeFilePath, content] of generatedFiles.entries()) {
  writeGeneratedFile(relativeFilePath, content);
}
