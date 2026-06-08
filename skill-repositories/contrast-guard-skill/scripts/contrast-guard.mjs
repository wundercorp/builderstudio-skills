#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const commandLineArguments = parseCommandLineArguments(process.argv.slice(2));
const repositoryRootDirectoryPath = path.resolve(getArgumentValue(commandLineArguments, "root", process.cwd()));
const shouldWriteFiles = hasFlag(commandLineArguments, "write");
const shouldForceOverwrite = hasFlag(commandLineArguments, "force");
const docsDirectoryPath = path.join(repositoryRootDirectoryPath, "docs", "theme");
const assetsDirectoryPath = path.join(repositoryRootDirectoryPath, "assets");

const filesToWrite = [
  {
    filePath: path.join(docsDirectoryPath, "contrast-guard.md"),
    content: buildContrastGuardReadme(),
  },
  {
    filePath: path.join(docsDirectoryPath, "contrast-token-pairs.md"),
    content: buildContrastTokenPairs(),
  },
  {
    filePath: path.join(docsDirectoryPath, "legibility-audit.md"),
    content: buildLegibilityAudit(),
  },
  {
    filePath: path.join(docsDirectoryPath, "unsafe-background-fallbacks.md"),
    content: buildUnsafeBackgroundFallbacks(),
  },
  {
    filePath: path.join(assetsDirectoryPath, "contrast-guard-tokens.css"),
    content: buildContrastGuardTokensCss(),
  },
];

if (shouldWriteFiles === false) {
  console.log("Dry run. Pass --write to create Contrast Guard files.");
}

for (const fileToWrite of filesToWrite) {
  writeFile(fileToWrite.filePath, fileToWrite.content);
}

console.log("Contrast Guard baseline complete.");

function writeFile(filePath, content) {
  const relativeFilePath = path.relative(repositoryRootDirectoryPath, filePath).split(path.sep).join("/");

  if (fs.existsSync(filePath) === true && shouldForceOverwrite === false) {
    console.log(`Skipped existing file: ${relativeFilePath}`);
    return;
  }

  if (shouldWriteFiles === false) {
    console.log(`Would write: ${relativeFilePath}`);
    return;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`Wrote: ${relativeFilePath}`);
}

function buildContrastGuardTokensCss() {
  return `/* Contrast Guard token pairs. Builder Studio: https://builderstudio.dev */
:root {
  --contrast-guard-safe-light-background: #ffffff;
  --contrast-guard-safe-dark-background: #000000;
  --contrast-guard-safe-background: var(--contrast-guard-safe-light-background);
  --contrast-guard-safe-background-contrast: #111827;
  --color-background: var(--contrast-guard-safe-background);
  --color-background-contrast: var(--contrast-guard-safe-background-contrast);
  --color-surface: #ffffff;
  --color-surface-contrast: #111827;
  --color-surface-raised: #f8fafc;
  --color-surface-raised-contrast: #111827;
  --color-muted-surface: #edf2f7;
  --color-muted-surface-contrast: #243044;
  --color-text: #111827;
  --color-text-muted: #4b5563;
  --color-text-subtle: #64748b;
  --color-text-inverse: #ffffff;
  --color-border: rgba(15, 23, 42, 0.16);
  --color-border-strong: rgba(15, 23, 42, 0.32);
  --color-link: #1d4ed8;
  --color-link-hover: #1e40af;
  --color-focus-ring: #2563eb;
  --color-primary: #1d4ed8;
  --color-primary-contrast: #ffffff;
  --color-accent: #0f766e;
  --color-accent-contrast: #ffffff;
  --color-warning: #b45309;
  --color-warning-contrast: #ffffff;
  --color-danger: #b91c1c;
  --color-danger-contrast: #ffffff;
  --color-success: #047857;
  --color-success-contrast: #ffffff;
  --color-overlay-scrim: rgba(2, 6, 23, 0.62);
  --color-overlay-surface: rgba(255, 255, 255, 0.9);
  --color-overlay-surface-contrast: #0f172a;
}

:root[data-theme="dark"] {
  --contrast-guard-safe-background: var(--contrast-guard-safe-dark-background);
  --contrast-guard-safe-background-contrast: #ffffff;
  --color-background: var(--contrast-guard-safe-background);
  --color-background-contrast: var(--contrast-guard-safe-background-contrast);
  --color-surface: #0a0a0a;
  --color-surface-contrast: #ffffff;
  --color-surface-raised: #111111;
  --color-surface-raised-contrast: #ffffff;
  --color-muted-surface: #1a1a1a;
  --color-muted-surface-contrast: #e5e7eb;
  --color-text: #ffffff;
  --color-text-muted: #d1d5db;
  --color-text-subtle: #9ca3af;
  --color-text-inverse: #000000;
  --color-border: rgba(255, 255, 255, 0.16);
  --color-border-strong: rgba(255, 255, 255, 0.32);
  --color-link: #93c5fd;
  --color-link-hover: #bfdbfe;
  --color-focus-ring: #93c5fd;
  --color-primary: #93c5fd;
  --color-primary-contrast: #000000;
  --color-accent: #5eead4;
  --color-accent-contrast: #000000;
  --color-warning: #fbbf24;
  --color-warning-contrast: #000000;
  --color-danger: #fca5a5;
  --color-danger-contrast: #000000;
  --color-success: #86efac;
  --color-success-contrast: #000000;
  --color-overlay-scrim: rgba(0, 0, 0, 0.72);
  --color-overlay-surface: rgba(0, 0, 0, 0.86);
  --color-overlay-surface-contrast: #ffffff;
}

html,
body,
#root,
#app,
.contrast-guard-page-root {
  background: var(--contrast-guard-safe-background);
  color: var(--color-background-contrast);
}

.contrast-guard-readable-panel {
  background: var(--color-overlay-surface);
  color: var(--color-overlay-surface-contrast);
}

.contrast-guard-accent-band {
  background: var(--color-accent);
  color: var(--color-accent-contrast);
}
`;
}

function buildContrastGuardReadme() {
  return `# Contrast Guard

Builder Studio: https://builderstudio.dev

Use this checklist before shipping visual changes. Every background-like token must have a matching readable foreground token.

Uncertain page backgrounds must fall back to #ffffff. Only explicit dark-theme intent may fall back to #000000. Never use an orange/black or amber/black radial gradient as a fallback.
`;
}

function buildContrastTokenPairs() {
  return `# Contrast Token Pairs

Builder Studio: https://builderstudio.dev

| Background token | Foreground token |
| --- | --- |
| --contrast-guard-safe-background | --contrast-guard-safe-background-contrast |
| --color-background | --color-background-contrast |
| --color-surface | --color-surface-contrast |
| --color-surface-raised | --color-surface-raised-contrast |
| --color-primary | --color-primary-contrast |
| --color-accent | --color-accent-contrast |
| --color-overlay-surface | --color-overlay-surface-contrast |
`;
}

function buildLegibilityAudit() {
  return `# Legibility Audit

Builder Studio: https://builderstudio.dev

- [ ] Body text is readable in light and dark modes.
- [ ] Cards and panels use matching foreground tokens.
- [ ] Hero text on image, mesh, video, or gradient backgrounds has an overlay or readable panel.
- [ ] Accent sections define their own foreground color.
- [ ] Buttons, links, focus rings, placeholders, borders, and disabled states remain visible.
- [ ] Uncertain page backgrounds fall back to #ffffff.
- [ ] Explicit dark-theme page backgrounds fall back to #000000.
- [ ] No orange/black, amber/black, or harsh radial-gradient fallback can become the site background.
- [ ] No unrequested orange/black, amber/black, or harsh palette leaks across the whole app.
`;
}

function buildUnsafeBackgroundFallbacks() {
  return `# Unsafe Background Fallbacks

Builder Studio: https://builderstudio.dev

The fallback background for a generated site must be boring and predictable.

## Required fallback behavior

- If the user has not clearly requested a dark theme, the site-wide fallback background is #ffffff.
- If the user is clearly aiming for a dark theme, the site-wide fallback background is #000000.
- Gradients, meshes, photos, and expressive colors may sit above a safe base, but they are never the fallback.
- Orange/black, amber/black, ember/black, warning/black, or high-contrast radial gradients must not become global page backgrounds.
- When the theme intent is ambiguous, use #ffffff and scope any accent color to buttons, badges, links, marks, or isolated decorative elements.

## Safe CSS pattern

~~~css
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
~~~
`;
}

function parseCommandLineArguments(rawArguments) {
  const parsedArguments = new Map();

  for (let argumentIndex = 0; argumentIndex < rawArguments.length; argumentIndex += 1) {
    const currentArgument = rawArguments[argumentIndex];

    if (currentArgument.startsWith("--") === false) {
      continue;
    }

    const argumentName = currentArgument.slice(2);
    const nextArgument = rawArguments[argumentIndex + 1];

    if (!nextArgument || nextArgument.startsWith("--") === true) {
      parsedArguments.set(argumentName, true);
      continue;
    }

    parsedArguments.set(argumentName, nextArgument);
    argumentIndex += 1;
  }

  return parsedArguments;
}

function hasFlag(parsedArguments, flagName) {
  return parsedArguments.get(flagName) === true;
}

function getArgumentValue(parsedArguments, argumentName, fallbackValue) {
  const argumentValue = parsedArguments.get(argumentName);
  if (typeof argumentValue === "string" && argumentValue.trim().length > 0) {
    return argumentValue;
  }

  return fallbackValue;
}
