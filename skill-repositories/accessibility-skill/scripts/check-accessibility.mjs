#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const argumentsList = process.argv.slice(2);
const rootArgumentIndex = argumentsList.indexOf("--root");
const rootDirectoryPath = path.resolve(rootArgumentIndex >= 0 && argumentsList[rootArgumentIndex + 1] ? argumentsList[rootArgumentIndex + 1] : process.cwd());
const requiredDocumentationFiles = [
  "docs/accessibility/accessibility-audit.md",
  "docs/accessibility/keyboard-navigation.md",
  "docs/accessibility/aria-and-semantics.md",
  "docs/accessibility/forms-and-status.md",
];

const discoveredProblems = [];

for (const relativeFilePath of requiredDocumentationFiles) {
  const absoluteFilePath = path.join(rootDirectoryPath, relativeFilePath);
  if (fs.existsSync(absoluteFilePath) === false) {
    discoveredProblems.push(`Missing ${relativeFilePath}`);
  }
}

const searchableFileExtensions = new Set([".html", ".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte", ".astro"]);
let hasSemanticLandmarkSignal = false;
let hasAccessibilityNameSignal = false;
let hasFocusOrKeyboardSignal = false;
let hasReducedMotionSignal = false;
let clickableDivRiskCount = 0;
let positiveTabIndexCount = 0;

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

    if (/(<main\b|role=["']main["']|<nav\b|role=["']navigation["']|<header\b|<footer\b)/.test(fileContent)) {
      hasSemanticLandmarkSignal = true;
    }

    if (/(aria-label|aria-labelledby|alt=|<label\b|htmlFor=|aria-describedby)/.test(fileContent)) {
      hasAccessibilityNameSignal = true;
    }

    if (/(focus-visible|:focus|onKeyDown|onKeyUp|tabIndex=|tabindex=|skip link|skip-to-content)/i.test(fileContent)) {
      hasFocusOrKeyboardSignal = true;
    }

    if (/(prefers-reduced-motion|useReducedMotion|reducedMotion)/.test(fileContent)) {
      hasReducedMotionSignal = true;
    }

    const clickableDivMatches = fileContent.match(/<div[^>]+onClick=/g);
    if (clickableDivMatches) {
      clickableDivRiskCount += clickableDivMatches.length;
    }

    const positiveTabIndexMatches = fileContent.match(/(?:tabIndex|tabindex)=['"]?[1-9]/g);
    if (positiveTabIndexMatches) {
      positiveTabIndexCount += positiveTabIndexMatches.length;
    }
  }
}

walkDirectory(rootDirectoryPath);

if (hasSemanticLandmarkSignal === false) {
  discoveredProblems.push("No semantic landmark signal found. Add main/nav/header/footer landmarks where appropriate.");
}

if (hasAccessibilityNameSignal === false) {
  discoveredProblems.push("No accessible-name signal found. Add labels, alt text, aria-label, or aria-labelledby where needed.");
}

if (hasFocusOrKeyboardSignal === false) {
  discoveredProblems.push("No focus or keyboard support signal found. Add visible focus styles and keyboard behavior for custom controls.");
}

if (hasReducedMotionSignal === false) {
  discoveredProblems.push("No reduced-motion signal found. Respect prefers-reduced-motion when animation is present.");
}

if (clickableDivRiskCount > 0) {
  discoveredProblems.push(`Found ${clickableDivRiskCount} clickable div pattern(s). Prefer button or link elements, or add complete keyboard semantics.`);
}

if (positiveTabIndexCount > 0) {
  discoveredProblems.push(`Found ${positiveTabIndexCount} positive tabindex pattern(s). Use DOM order instead of positive tabindex.`);
}

if (discoveredProblems.length > 0) {
  console.error("Accessibility check failed:");
  for (const discoveredProblem of discoveredProblems) {
    console.error(`- ${discoveredProblem}`);
  }
  process.exit(1);
}

console.log("Accessibility check passed.");
