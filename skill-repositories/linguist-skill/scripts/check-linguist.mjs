#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const rootIndex = args.indexOf("--root");
const rootDirectory = path.resolve(rootIndex >= 0 && args[rootIndex + 1] ? args[rootIndex + 1] : process.cwd());
const requiredFiles = [
  "docs/i18n/locale-strategy.md",
  "docs/i18n/translation-keys.md",
  "docs/i18n/translation-workflow.md",
];

const problems = [];

for (const relativeFilePath of requiredFiles) {
  if (fs.existsSync(path.join(rootDirectory, relativeFilePath)) === false) {
    problems.push(`Missing ${relativeFilePath}`);
  }
}

let localeSignalFound = false;
let dictionarySignalFound = false;
let htmlLangSignalFound = false;
let hardcodedStringRisk = 0;

function walk(directoryPath) {
  if (fs.existsSync(directoryPath) === false) {
    return;
  }

  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    if (["node_modules", ".git", "dist", "build", "coverage"].includes(entry.name)) {
      continue;
    }

    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      walk(entryPath);
      continue;
    }

    const extension = path.extname(entry.name);
    if ([".json", ".ts", ".tsx", ".js", ".jsx", ".vue", ".html", ".md"].includes(extension) === false) {
      continue;
    }

    const content = fs.readFileSync(entryPath, "utf8");
    if (content.includes("supportedLocales") || content.includes("defaultLocale")) {
      localeSignalFound = true;
    }

    if (entryPath.includes(`${path.sep}i18n${path.sep}`) || content.includes("home.hero.title") || content.includes("translation")) {
      dictionarySignalFound = true;
    }

    if (content.includes("<html lang=") || content.includes("document.documentElement.lang") || content.includes("lang={")) {
      htmlLangSignalFound = true;
    }

    if ([".tsx", ".jsx", ".vue", ".html"].includes(extension)) {
      const matches = content.match(/>[A-Z][A-Za-z0-9 ,.'’!?-]{8,}</g);
      if (matches) {
        hardcodedStringRisk += matches.length;
      }
    }
  }
}

walk(rootDirectory);

if (localeSignalFound === false) {
  problems.push("No supportedLocales/defaultLocale signal found.");
}

if (dictionarySignalFound === false) {
  problems.push("No i18n dictionary or translation key signal found.");
}

if (htmlLangSignalFound === false) {
  problems.push("No HTML lang handling signal found. Confirm that the app sets the document language.");
}

if (hardcodedStringRisk > 20) {
  problems.push(`Found ${hardcodedStringRisk} likely hardcoded UI strings. Review translation extraction.`);
}

if (problems.length > 0) {
  console.error("Linguist check failed:");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log("Linguist check passed.");
