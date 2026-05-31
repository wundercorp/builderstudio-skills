#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const commandLineArguments = parseCommandLineArguments(process.argv.slice(2));
const repositoryRootDirectoryPath = path.resolve(getArgumentValue(commandLineArguments, "root", process.cwd()));
const shouldFailOnWarnings = hasFlag(commandLineArguments, "strict");
const filePaths = collectTextFilePaths(repositoryRootDirectoryPath);
const allText = filePaths.map((filePath) => fs.readFileSync(filePath, "utf8")).join("\n");
const findings = [];

checkDarkFirstDefault();
checkToggleAvailability();
checkPersistence();
checkColorScheme();
checkHardcodedColors();
checkContrastTokenPairs();
checkBackgroundLegibilityRisks();
checkDocumentation();

if (findings.length === 0) {
  console.log("Batman theme check passed.");
  process.exit(0);
}

console.log("Batman theme check findings:");
for (const finding of findings) {
  console.log(`- [${finding.level}] ${finding.message}`);
}

if (findings.some((finding) => finding.level === "error") || shouldFailOnWarnings === true) {
  process.exit(1);
}

function checkDarkFirstDefault() {
  if (/data-theme=["']dark["']/.test(allText) || /dataset\.theme\s*=\s*["']dark["']/.test(allText) || /return\s+["']dark["'];/.test(allText)) {
    return;
  }

  findings.push({ level: "error", message: "No dark-first root default was detected. Add data-theme=\"dark\" or an early script that defaults to dark." });
}

function checkToggleAvailability() {
  const hasSwitch = /role=["']switch["']/.test(allText) || /type=["']checkbox["']/.test(allText);
  const hasToggleHook = /theme-toggle|data-batman-theme-toggle|toggleTheme|setTheme/i.test(allText);

  if (hasSwitch && hasToggleHook) {
    return;
  }

  findings.push({ level: "error", message: "No accessible theme switch was detected. Add a first-screen switch with role=\"switch\" or a native checkbox and a theme toggle handler." });
}

function checkPersistence() {
  if (/localStorage/.test(allText) || /storageKey|themePreference|theme-preference/.test(allText)) {
    return;
  }

  findings.push({ level: "warning", message: "No persistent theme preference was detected. Store the selected theme so it survives reloads." });
}

function checkColorScheme() {
  if (/color-scheme/.test(allText)) {
    return;
  }

  findings.push({ level: "warning", message: "No CSS color-scheme declaration was detected. Browser form controls may not match the active theme." });
}

function checkHardcodedColors() {
  const sourceFiles = filePaths.filter((filePath) => {
    const normalizedFilePath = filePath.split(path.sep).join("/");

    if (normalizedFilePath.endsWith("assets/batman-theme.css")) {
      return false;
    }

    if (normalizedFilePath.includes("/docs/theme/") || normalizedFilePath.startsWith("docs/theme/")) {
      return false;
    }

    return /\.(css|scss|sass|less|tsx|jsx|ts|js|html|vue|svelte)$/.test(normalizedFilePath);
  });

  let hardcodedColorCount = 0;
  for (const sourceFilePath of sourceFiles) {
    const sourceFileText = fs.readFileSync(sourceFilePath, "utf8");
    const colorMatches = sourceFileText.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
    hardcodedColorCount += colorMatches.length;
  }

  if (hardcodedColorCount <= 12) {
    return;
  }

  findings.push({ level: "warning", message: `Detected ${hardcodedColorCount} hardcoded hex colors. Review whether major surfaces should use semantic theme tokens.` });
}

function checkContrastTokenPairs() {
  const hasSurfaceToken = /--color-surface\b/.test(allText) || /--surface\b/.test(allText);
  const hasContrastToken = /--color-surface-contrast|--color-accent-contrast|--color-primary-contrast|--color-overlay-surface-contrast/.test(allText);

  if (hasSurfaceToken && hasContrastToken) {
    return;
  }

  findings.push({ level: "warning", message: "No foreground/background contrast token pairs were detected. Add contrast tokens so theme toggles do not create unreadable surfaces." });
}

function checkBackgroundLegibilityRisks() {
  const hasComplexBackground = /gradient\(|background-image|mesh|glass|backdrop-filter|image hero|video/i.test(allText);
  const hasReadableOverlay = /overlay|scrim|surface-contrast|overlay-surface|readable-panel|backdrop/i.test(allText);

  if (hasComplexBackground === false || hasReadableOverlay === true) {
    return;
  }

  findings.push({ level: "warning", message: "Complex backgrounds were detected without overlay/readable-surface signals. Verify text is readable in both theme modes." });
}

function checkDocumentation() {
  if (fs.existsSync(path.join(repositoryRootDirectoryPath, "docs", "theme", "README.md")) || /Batman Theme Contract/i.test(allText)) {
    return;
  }

  findings.push({ level: "warning", message: "No theme documentation was detected. Add docs/theme/README.md or docs/theme/batman-theme-contract.md." });
}

function collectTextFilePaths(directoryPath) {
  const ignoredDirectoryNames = new Set([".git", "node_modules", "dist", "build", "coverage", ".next", ".nuxt", ".angular", "target"]);
  const collectedFilePaths = [];

  if (fs.existsSync(directoryPath) === false) {
    return collectedFilePaths;
  }

  const directoryEntries = fs.readdirSync(directoryPath, { withFileTypes: true });

  for (const directoryEntry of directoryEntries) {
    if (ignoredDirectoryNames.has(directoryEntry.name)) {
      continue;
    }

    if (directoryEntry.name === ".DS_Store" || directoryEntry.name.startsWith("._")) {
      continue;
    }

    const entryPath = path.join(directoryPath, directoryEntry.name);

    if (directoryEntry.isDirectory()) {
      collectedFilePaths.push(...collectTextFilePaths(entryPath));
      continue;
    }

    if (directoryEntry.isFile() === false) {
      continue;
    }

    if (shouldReadFile(entryPath) === true) {
      collectedFilePaths.push(entryPath);
    }
  }

  return collectedFilePaths;
}

function shouldReadFile(filePath) {
  const fileStats = fs.statSync(filePath);
  if (fileStats.size > 1024 * 512) {
    return false;
  }

  return /\.(css|scss|sass|less|tsx|jsx|ts|js|html|vue|svelte|md|json)$/.test(filePath);
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
