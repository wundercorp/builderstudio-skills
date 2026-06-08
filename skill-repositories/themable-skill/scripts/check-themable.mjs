#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const rootIndex = args.indexOf("--root");
const rootDirectory = path.resolve(rootIndex >= 0 && args[rootIndex + 1] ? args[rootIndex + 1] : process.cwd());
const requiredFiles = [
  "docs/theme/palettes.md",
  "docs/theme/tokens.md",
  "docs/theme/theme-utility.md",
];

const problems = [];

for (const relativeFilePath of requiredFiles) {
  const filePath = path.join(rootDirectory, relativeFilePath);
  if (fs.existsSync(filePath) === false) {
    problems.push(`Missing ${relativeFilePath}`);
  }
}

const searchableExtensions = new Set([".css", ".scss", ".ts", ".tsx", ".js", ".jsx", ".vue", ".html"]);
let hardcodedColorCount = 0;
let paletteSignalFound = false;

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

    if (searchableExtensions.has(path.extname(entry.name)) === false) {
      continue;
    }

    const content = fs.readFileSync(entryPath, "utf8");
    if (content.includes("data-palette") || content.includes("themable-palette-preference") || content.includes("--palette-name")) {
      paletteSignalFound = true;
    }

    const matches = content.match(/#[0-9a-fA-F]{3,8}\b/g);
    if (matches) {
      hardcodedColorCount += matches.length;
    }
  }
}

walk(rootDirectory);

if (paletteSignalFound === false) {
  problems.push("No data-palette, palette preference, or palette token signal found.");
}

if (hardcodedColorCount > 40) {
  problems.push(`Found ${hardcodedColorCount} hardcoded hex colors. Review tokenization before release.`);
}

if (problems.length > 0) {
  console.error("Themable check failed:");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log("Themable check passed.");
