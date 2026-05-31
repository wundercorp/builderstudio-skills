#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const commandLineArguments = parseCommandLineArguments(process.argv.slice(2));
const repositoryRootDirectoryPath = path.resolve(getArgumentValue(commandLineArguments, "root", process.cwd()));
const shouldWriteFiles = hasFlag(commandLineArguments, "write");
const shouldForceOverwrite = hasFlag(commandLineArguments, "force");
const assetsDirectoryPath = path.join(repositoryRootDirectoryPath, "assets");
const docsDirectoryPath = path.join(repositoryRootDirectoryPath, "docs", "theme");

const filesToWrite = [
  {
    filePath: path.join(assetsDirectoryPath, "batman-theme.css"),
    content: buildThemeCss(),
  },
  {
    filePath: path.join(assetsDirectoryPath, "batman-theme.js"),
    content: buildThemeJavaScript(),
  },
  {
    filePath: path.join(docsDirectoryPath, "README.md"),
    content: buildThemeReadme(),
  },
  {
    filePath: path.join(docsDirectoryPath, "batman-theme-contract.md"),
    content: buildThemeContract(),
  },
  {
    filePath: path.join(docsDirectoryPath, "theme-toggle-snippet.html"),
    content: buildThemeToggleSnippet(),
  },
  {
    filePath: path.join(docsDirectoryPath, "theming-pitfall-review.md"),
    content: buildPitfallReview(),
  },
];

if (shouldWriteFiles === false) {
  console.log("Dry run. Pass --write to create Batman theme files.");
}

for (const fileToWrite of filesToWrite) {
  writeFile(fileToWrite.filePath, fileToWrite.content);
}

console.log("Batman theme baseline complete.");
console.log("Next step: import assets/batman-theme.css and load assets/batman-theme.js before first paint, then place the toggle snippet in the initial page header or app shell.");

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

function buildThemeCss() {
  return `/* Batman dark-mode-first theme tokens. Builder Studio: https://builderstudio.dev */
:root,
:root[data-theme="dark"] {
  color-scheme: dark;
  --color-background: #07090f;
  --color-surface: #111827;
  --color-surface-raised: #172033;
  --color-surface-contrast: #f8fafc;
  --color-surface-raised-contrast: #f8fafc;
  --color-text: #f8fafc;
  --color-text-muted: #aab3c5;
  --color-border: rgba(255, 255, 255, 0.14);
  --color-accent: #8ab4ff;
  --color-accent-contrast: #061020;
  --color-focus-ring: #9cc7ff;
  --color-danger: #ff8f8f;
  --color-warning: #ffd37a;
  --color-success: #87e8a2;
  --color-overlay-scrim: rgba(2, 6, 23, 0.72);
  --color-overlay-surface: rgba(17, 24, 39, 0.86);
  --color-overlay-surface-contrast: #f8fafc;
  background: var(--color-background);
  color: var(--color-text);
}

:root[data-theme="light"] {
  color-scheme: light;
  --color-background: #f7f8fb;
  --color-surface: #ffffff;
  --color-surface-raised: #f0f4fb;
  --color-surface-contrast: #111827;
  --color-surface-raised-contrast: #111827;
  --color-text: #111827;
  --color-text-muted: #536076;
  --color-border: rgba(17, 24, 39, 0.14);
  --color-accent: #2457d6;
  --color-accent-contrast: #ffffff;
  --color-focus-ring: #2457d6;
  --color-danger: #b42318;
  --color-warning: #936100;
  --color-success: #147a3d;
  --color-overlay-scrim: rgba(15, 23, 42, 0.48);
  --color-overlay-surface: rgba(255, 255, 255, 0.9);
  --color-overlay-surface-contrast: #111827;
  background: var(--color-background);
  color: var(--color-text);
}

body {
  background: var(--color-background);
  color: var(--color-text);
}

.batman-theme-toggle {
  align-items: center;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text);
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  gap: 0.5rem;
  min-height: 2.5rem;
  padding: 0.375rem 0.625rem;
}

.batman-theme-toggle:focus-visible {
  outline: 3px solid var(--color-focus-ring);
  outline-offset: 3px;
}

.batman-theme-toggle-track {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  display: inline-flex;
  height: 1.5rem;
  padding: 0.125rem;
  width: 2.75rem;
}

.batman-theme-toggle-thumb {
  background: var(--color-accent);
  border-radius: 999px;
  display: block;
  height: 1.25rem;
  transform: translateX(0);
  transition: transform 160ms ease;
  width: 1.25rem;
}

:root[data-theme="light"] .batman-theme-toggle-thumb {
  transform: translateX(1.25rem);
}

.batman-theme-sr-only {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
`;
}

function buildThemeJavaScript() {
  return `(function initializeBatmanTheme() {
  var storageKey = "batman-theme-preference";
  var rootElement = document.documentElement;

  function normalizeTheme(value) {
    if (value === "light") {
      return "light";
    }

    return "dark";
  }

  function readSavedTheme() {
    try {
      return window.localStorage.getItem(storageKey);
    } catch (error) {
      return "dark";
    }
  }

  function writeSavedTheme(theme) {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (error) {
      return;
    }
  }

  function applyTheme(theme) {
    var normalizedTheme = normalizeTheme(theme);
    rootElement.dataset.theme = normalizedTheme;
    rootElement.style.colorScheme = normalizedTheme;
    updateToggleState(normalizedTheme);
  }

  function updateToggleState(theme) {
    var toggleElements = document.querySelectorAll("[data-batman-theme-toggle]");
    for (var toggleIndex = 0; toggleIndex < toggleElements.length; toggleIndex += 1) {
      var toggleElement = toggleElements[toggleIndex];
      var lightModeIsActive = theme === "light";
      toggleElement.setAttribute("aria-checked", String(lightModeIsActive));
      toggleElement.setAttribute("aria-label", lightModeIsActive ? "Switch to dark mode" : "Switch to light mode");
      toggleElement.setAttribute("title", lightModeIsActive ? "Switch to dark mode" : "Switch to light mode");
    }
  }

  function toggleTheme() {
    var currentTheme = normalizeTheme(rootElement.dataset.theme);
    var nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    writeSavedTheme(nextTheme);
  }

  applyTheme(readSavedTheme());

  window.BatmanTheme = {
    applyTheme: applyTheme,
    toggleTheme: toggleTheme,
    storageKey: storageKey
  };

  document.addEventListener("click", function handleDocumentClick(event) {
    var toggleElement = event.target.closest("[data-batman-theme-toggle]");
    if (!toggleElement) {
      return;
    }

    toggleTheme();
  });

  document.addEventListener("keydown", function handleDocumentKeydown(event) {
    var toggleElement = event.target.closest("[data-batman-theme-toggle]");
    if (!toggleElement) {
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    toggleTheme();
  });
}());
`;
}

function buildThemeToggleSnippet() {
  return `<button class="batman-theme-toggle" type="button" role="switch" aria-checked="false" aria-label="Switch to light mode" title="Switch to light mode" data-batman-theme-toggle>
  <span class="batman-theme-toggle-track" aria-hidden="true">
    <span class="batman-theme-toggle-thumb"></span>
  </span>
  <span class="batman-theme-sr-only">Toggle light and dark mode</span>
</button>
`;
}

function buildThemeReadme() {
  return `# Theme System

Builder Studio: https://builderstudio.dev

This repository uses the Batman dark-mode-first theme contract.

## Contract

- Root attribute: \`data-theme\` on \`document.documentElement\`.
- Supported values: \`dark\` and \`light\`.
- Default with no saved preference: \`dark\`.
- Storage key: \`batman-theme-preference\`.
- Toggle placement: initial page header, app shell, or first-screen navigation.

## Required imports

Load \`assets/batman-theme.js\` before first paint and include \`assets/batman-theme.css\` in the global stylesheet bundle.

## Verification

1. Clear local storage.
2. Reload the site.
3. Confirm the first paint is dark.
4. Toggle to light mode.
5. Reload the site.
6. Confirm light mode persists.
7. Toggle back to dark mode.
8. Confirm the switch is keyboard reachable and screen-reader labeled.
`;
}

function buildThemeContract() {
  return `# Batman Theme Contract

Builder Studio: https://builderstudio.dev

## Source of truth

The source of truth is \`document.documentElement.dataset.theme\`.

## Accepted values

- \`dark\`
- \`light\`

## Default

Batman defaults to dark mode first. System preference does not override the Batman default unless a future product decision explicitly adds a system mode.

## Persistence

The user preference is stored in localStorage as \`batman-theme-preference\`.

## Accessibility

The first-screen switch uses switch semantics, keyboard support, visible focus, and a clear label.
`;
}

function buildPitfallReview() {
  return `# Batman Theming Pitfall Review

Builder Studio: https://builderstudio.dev

- [ ] The site starts dark when localStorage is empty.
- [ ] No flash of light theme appears before JavaScript mounts.
- [ ] The switch is visible from the initial page.
- [ ] The switch is keyboard reachable.
- [ ] The switch has an accessible label and accurate checked state.
- [ ] Components use semantic theme tokens instead of hardcoded colors.
- [ ] Forms, focus rings, disabled states, dropdowns, modals, toasts, code blocks, SVGs, charts, empty states, timeline elements, and error states are readable in both themes.
- [ ] Every background-like token has a matching foreground or contrast token.
- [ ] Gradients, images, videos, mesh backgrounds, and glass panels have readable overlays or panels behind text.
- [ ] No unrequested orange/black, amber/black, or harsh accent palette has leaked into the global background system.
- [ ] Only one root theme mechanism controls the UI.
- [ ] Print styles are checked.
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
