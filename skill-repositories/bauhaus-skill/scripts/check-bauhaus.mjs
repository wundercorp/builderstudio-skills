#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const argumentsList = process.argv.slice(2);
const rootArgumentIndex = argumentsList.indexOf("--root");
const rootDirectoryPath = path.resolve(rootArgumentIndex >= 0 && argumentsList[rootArgumentIndex + 1] ? argumentsList[rootArgumentIndex + 1] : process.cwd());
const requiredDocumentationFiles = [
  "docs/design/bauhaus-language.md",
  "docs/design/bauhaus-palettes.md",
  "docs/design/bauhaus-components.md",
];

const discoveredProblems = [];

for (const relativeFilePath of requiredDocumentationFiles) {
  const absoluteFilePath = path.join(rootDirectoryPath, relativeFilePath);
  if (fs.existsSync(absoluteFilePath) === false) {
    discoveredProblems.push(`Missing ${relativeFilePath}`);
  }
}

const searchableFileExtensions = new Set([".css", ".scss", ".ts", ".tsx", ".js", ".jsx", ".vue", ".html"]);
let foundBauhausSignal = false;
let foundStrongTypographySignal = false;
let hardcodedHexColorCount = 0;

function walkDirectory(directoryPath) {
  if (fs.existsSync(directoryPath) === false) {
    return;
  }

  for (const directoryEntry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    if (["node_modules", ".git", "dist", "build", "coverage"].includes(directoryEntry.name)) {
      continue;
    }

    const entryPath = path.join(directoryPath, directoryEntry.name);
    if (directoryEntry.isDirectory()) {
      walkDirectory(entryPath);
      continue;
    }

    if (searchableFileExtensions.has(path.extname(directoryEntry.name)) === false) {
      continue;
    }

    const fileContent = fs.readFileSync(entryPath, "utf8");
    if (fileContent.includes("data-bauhaus-palette") || fileContent.includes("bauhaus-palette-preference") || fileContent.includes("--bauhaus-palette-name") || fileContent.includes(".bauhaus-display")) {
      foundBauhausSignal = true;
    }

    if (fileContent.includes("font-weight: 900") || fileContent.includes("font-weight: 800") || fileContent.includes("clamp(3rem") || fileContent.includes("letter-spacing: -0.05em")) {
      foundStrongTypographySignal = true;
    }

    const hardcodedHexColorMatches = fileContent.match(/#[0-9a-fA-F]{3,8}\b/g);
    if (hardcodedHexColorMatches) {
      hardcodedHexColorCount += hardcodedHexColorMatches.length;
    }
  }
}

walkDirectory(rootDirectoryPath);

if (foundBauhausSignal === false) {
  discoveredProblems.push("No Bauhaus palette, token, or class signal found.");
}

if (foundStrongTypographySignal === false) {
  discoveredProblems.push("No strong typography signal found. Add a bold display class or equivalent type treatment.");
}

if (hardcodedHexColorCount > 80) {
  discoveredProblems.push(`Found ${hardcodedHexColorCount} hardcoded hex colors. Review tokenization before release.`);
}

if (discoveredProblems.length > 0) {
  console.error("Bauhaus check failed:");
  for (const discoveredProblem of discoveredProblems) {
    console.error(`- ${discoveredProblem}`);
  }
  process.exit(1);
}

console.log("Bauhaus check passed.");
