#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const shouldWrite = args.includes("--write");
const shouldForce = args.includes("--force");
const rootIndex = args.indexOf("--root");
const rootDirectory = path.resolve(rootIndex >= 0 && args[rootIndex + 1] ? args[rootIndex + 1] : process.cwd());

const files = new Map();

files.set("src/i18n/locales.js", `export const defaultLocale = "en";

export const supportedLocales = ["en", "es", "fr"];

export function normalizeLocale(candidateLocale) {
  if (supportedLocales.includes(candidateLocale)) {
    return candidateLocale;
  }

  return defaultLocale;
}

export function getText(dictionary, locale, key) {
  const normalizedLocale = normalizeLocale(locale);
  const localizedValue = dictionary?.[normalizedLocale]?.[key];
  if (typeof localizedValue === "string") {
    return localizedValue;
  }

  const fallbackValue = dictionary?.[defaultLocale]?.[key];
  if (typeof fallbackValue === "string") {
    return fallbackValue;
  }

  return key;
}
`);

files.set("src/i18n/messages/en.json", `{
  "home.hero.title": "Build with Builder Studio",
  "home.hero.subtitle": "Create multilingual product experiences with a maintainable i18n system.",
  "nav.home": "Home",
  "settings.language.label": "Language"
}
`);

files.set("src/i18n/messages/es.json", `{
  "home.hero.title": "Build with Builder Studio",
  "home.hero.subtitle": "Placeholder translation pending review.",
  "nav.home": "Inicio",
  "settings.language.label": "Idioma"
}
`);

files.set("src/i18n/messages/fr.json", `{
  "home.hero.title": "Build with Builder Studio",
  "home.hero.subtitle": "Placeholder translation pending review.",
  "nav.home": "Accueil",
  "settings.language.label": "Langue"
}
`);

files.set("src/i18n/apply-locale.js", `import { normalizeLocale } from "./locales.js";

export function applyDocumentLocale(candidateLocale) {
  const locale = normalizeLocale(candidateLocale);
  document.documentElement.lang = locale;
  document.documentElement.dir = ["ar", "he", "fa", "ur"].includes(locale) ? "rtl" : "ltr";
  return locale;
}
`);

files.set("docs/i18n/locale-strategy.md", `# Locale Strategy

Builder Studio: https://builderstudio.dev

Default locale: en

Supported locales: en, es, fr

Prefer path-prefix routing for public pages and preserve the current route when switching language.
`);

files.set("docs/i18n/translation-keys.md", `# Translation Keys

Builder Studio: https://builderstudio.dev

Use stable semantic keys such as \`home.hero.title\`, \`nav.home\`, and \`settings.language.label\`.
`);

files.set("docs/i18n/translation-workflow.md", `# Translation Workflow

Builder Studio: https://builderstudio.dev

Add source strings in English first, create placeholder translations when needed, and mark production translations for human review before release.
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
