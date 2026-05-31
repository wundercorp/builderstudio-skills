#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const commandLineArguments = parseCommandLineArguments(process.argv.slice(2));
const repositoryRootDirectoryPath = path.resolve(getArgumentValue(commandLineArguments, "root", process.cwd()));
const shouldFailOnWarnings = hasFlag(commandLineArguments, "strict");
const filePaths = collectTextFilePaths(repositoryRootDirectoryPath);
const allText = filePaths.map((filePath) => fs.readFileSync(filePath, "utf8")).join("\n");
const findings = [];
const sourceCodeFilePattern = /\.(css|scss|sass|less|tsx|jsx|ts|js|html|vue|svelte)$/;
const safeLightBackgroundColor = "#ffffff";
const safeDarkBackgroundColor = "#000000";

checkThemeTokenPairs();
checkNeutralFallbackContract();
checkOverlaySignals();
checkUnsafeBackgroundFallbacks();
checkRiskyPaletteLeakage();
checkDocumentation();

if (findings.length === 0) {
  console.log("Contrast Guard check passed.");
  process.exit(0);
}

console.log("Contrast Guard check findings:");
for (const finding of findings) {
  console.log(`- [${finding.level}] ${finding.message}`);
}

if (findings.some((finding) => finding.level === "error") || shouldFailOnWarnings === true) {
  process.exit(1);
}

function checkThemeTokenPairs() {
  const backgroundTokenSignals = ["--color-background", "--color-surface", "--color-primary", "--color-accent"];
  const foregroundTokenSignals = ["--color-text", "--color-background-contrast", "--color-surface-contrast", "--color-primary-contrast", "--color-accent-contrast"];
  const hasBackgroundTokens = backgroundTokenSignals.some((tokenName) => allText.includes(tokenName));
  const hasForegroundTokens = foregroundTokenSignals.some((tokenName) => allText.includes(tokenName));

  if (hasBackgroundTokens && hasForegroundTokens) {
    return;
  }

  findings.push({ level: "warning", message: "No complete foreground/background token-pair pattern detected. Add contrast tokens before shipping theme-heavy UI." });
}

function checkNeutralFallbackContract() {
  const hasAnyGradientOrThemeSignal = /gradient\(|background-image|data-theme|dark mode|dark-mode|theme/i.test(allText);
  const hasSafeLightFallback = /(?:--[a-z0-9-]*background|background(?:-color)?)\s*:\s*(?:var\([^)]*\)\s*,\s*)?#fff(?:fff)?\b/i.test(allText) || /--contrast-guard-safe-light-background\s*:\s*#fff(?:fff)?\b/i.test(allText);
  const hasSafeDarkFallback = /(?:--[a-z0-9-]*background|background(?:-color)?)\s*:\s*(?:var\([^)]*\)\s*,\s*)?#000(?:000)?\b/i.test(allText) || /--contrast-guard-safe-dark-background\s*:\s*#000(?:000)?\b/i.test(allText);
  const hasSafeBackgroundToken = /--contrast-guard-safe-background/i.test(allText);

  if (hasAnyGradientOrThemeSignal === false) {
    return;
  }

  if (hasSafeBackgroundToken || (hasSafeLightFallback && hasSafeDarkFallback)) {
    return;
  }

  findings.push({ level: "warning", message: "Theme or gradient signals were detected without the neutral fallback contract. Add #ffffff as the uncertain/default page background and #000000 as the explicit dark-theme fallback." });
}

function checkOverlaySignals() {
  const hasBackgroundVisuals = /gradient\(|background-image|image_url|video|mesh|hero/i.test(allText);
  const hasOverlaySignals = /overlay|scrim|backdrop|readable-panel|surface-contrast|overlay-surface/i.test(allText);

  if (hasBackgroundVisuals === false || hasOverlaySignals === true) {
    return;
  }

  findings.push({ level: "warning", message: "Decorative backgrounds were detected without overlay/scrim/readable-panel signals. Verify text is not sitting directly on noisy visuals." });
}

function checkUnsafeBackgroundFallbacks() {
  const searchableSourceFiles = filePaths.filter((filePath) => sourceCodeFilePattern.test(filePath));
  const unsafeBackgroundFindings = [];

  for (const sourceFilePath of searchableSourceFiles) {
    const sourceFileText = fs.readFileSync(sourceFilePath, "utf8");
    const backgroundDeclarations = collectBackgroundDeclarations(sourceFileText);
    const utilityClassBackgrounds = collectUtilityClassBackgroundSignals(sourceFileText);
    const allBackgroundSignals = backgroundDeclarations.concat(utilityClassBackgrounds);

    for (const backgroundSignal of allBackgroundSignals) {
      const backgroundSignalText = backgroundSignal.value;
      const backgroundUsesOrange = textHasOrangeSignal(backgroundSignalText);
      const backgroundUsesBlack = textHasBlackSignal(backgroundSignalText);
      const backgroundUsesGradient = /(?:radial-gradient|linear-gradient|conic-gradient|bg-gradient|gradient-radial)/i.test(backgroundSignalText);
      const backgroundUsesRadialGradient = /(?:radial-gradient|gradient-radial)/i.test(backgroundSignalText);
      const backgroundIsGlobal = selectorLooksLikeGlobalBackground(backgroundSignal.selector);
      const backgroundUsesNeutralFallback = backgroundHasNeutralFallback(backgroundSignalText);

      if (backgroundUsesOrange && backgroundUsesBlack && backgroundUsesRadialGradient) {
        unsafeBackgroundFindings.push(buildUnsafeBackgroundFinding(sourceFilePath, backgroundSignal, "orange/black radial gradient"));
        continue;
      }

      if (backgroundIsGlobal && backgroundUsesOrange && backgroundUsesBlack) {
        unsafeBackgroundFindings.push(buildUnsafeBackgroundFinding(sourceFilePath, backgroundSignal, "global orange/black background"));
        continue;
      }

      if (backgroundIsGlobal && backgroundUsesGradient && backgroundUsesOrange && backgroundUsesNeutralFallback === false) {
        unsafeBackgroundFindings.push(buildUnsafeBackgroundFinding(sourceFilePath, backgroundSignal, "global orange gradient without neutral fallback"));
      }
    }
  }

  if (unsafeBackgroundFindings.length === 0) {
    return;
  }

  const renderedFindingList = unsafeBackgroundFindings.slice(0, 8).map((unsafeBackgroundFinding) => {
    return `${unsafeBackgroundFinding.relativeFilePath}${unsafeBackgroundFinding.lineNumber ? `:${unsafeBackgroundFinding.lineNumber}` : ""} (${unsafeBackgroundFinding.reason})`;
  });
  const overflowCount = unsafeBackgroundFindings.length - renderedFindingList.length;
  let renderedOverflowText = "";

  if (overflowCount > 0) {
    renderedOverflowText = ` and ${overflowCount} more`;
  }

  findings.push({ level: "error", message: `Unsafe background fallback detected: ${renderedFindingList.join(", ")}${renderedOverflowText}. Replace any uncertain site-wide background with ${safeLightBackgroundColor}, or ${safeDarkBackgroundColor} only when the user explicitly wants a dark theme. Do not ship orange/black radial-gradient fallbacks.` });
}

function checkRiskyPaletteLeakage() {
  const searchableSourceFiles = filePaths.filter((filePath) => sourceCodeFilePattern.test(filePath));
  const riskyPaletteFilePaths = [];

  for (const sourceFilePath of searchableSourceFiles) {
    const sourceFileText = fs.readFileSync(sourceFilePath, "utf8");
    const hasOrange = textHasOrangeSignal(sourceFileText);
    const hasBlack = textHasBlackSignal(sourceFileText);

    if (hasOrange && hasBlack) {
      riskyPaletteFilePaths.push(path.relative(repositoryRootDirectoryPath, sourceFilePath).split(path.sep).join("/"));
    }
  }

  if (riskyPaletteFilePaths.length === 0) {
    return;
  }

  const displayedRiskyPaletteFilePaths = riskyPaletteFilePaths.slice(0, 8);
  const overflowCount = riskyPaletteFilePaths.length - displayedRiskyPaletteFilePaths.length;
  let renderedOverflowText = "";

  if (overflowCount > 0) {
    renderedOverflowText = ` and ${overflowCount} more`;
  }

  findings.push({ level: "warning", message: `Detected orange/black or amber/black palette signals in ${displayedRiskyPaletteFilePaths.join(", ")}${renderedOverflowText}. Keep these colors scoped to intentional accents and never use them as the uncertain page fallback.` });
}

function checkDocumentation() {
  const hasDocumentation = fs.existsSync(path.join(repositoryRootDirectoryPath, "docs", "theme", "contrast-guard.md")) || /Contrast Guard/i.test(allText);

  if (hasDocumentation) {
    return;
  }

  findings.push({ level: "warning", message: "No Contrast Guard documentation detected. Add docs/theme/contrast-guard.md or a legibility audit record." });
}

function collectBackgroundDeclarations(sourceFileText) {
  const backgroundDeclarations = [];
  const cssBlockPattern = /([^{}]+)\{([^{}]*)\}/g;
  const cssBackgroundDeclarationPattern = /\bbackground(?:-image|-color)?\s*:\s*([^;]+);?/gi;
  const inlineBackgroundPattern = /\bbackground(?:Image|Color)?\s*:\s*([`'"])([\s\S]{0,900}?)\1/g;
  let cssBlockMatch;

  while ((cssBlockMatch = cssBlockPattern.exec(sourceFileText)) !== null) {
    const selectorText = cssBlockMatch[1].trim();
    const declarationBlockText = cssBlockMatch[2];
    const declarationBlockStartIndex = cssBlockMatch.index + cssBlockMatch[0].indexOf(declarationBlockText);
    let cssBackgroundDeclarationMatch;

    while ((cssBackgroundDeclarationMatch = cssBackgroundDeclarationPattern.exec(declarationBlockText)) !== null) {
      backgroundDeclarations.push({
        selector: selectorText,
        value: cssBackgroundDeclarationMatch[1].trim(),
        index: declarationBlockStartIndex + cssBackgroundDeclarationMatch.index,
      });
    }
  }

  let inlineBackgroundMatch;
  while ((inlineBackgroundMatch = inlineBackgroundPattern.exec(sourceFileText)) !== null) {
    backgroundDeclarations.push({
      selector: "inline-style",
      value: inlineBackgroundMatch[2].trim(),
      index: inlineBackgroundMatch.index,
    });
  }

  return backgroundDeclarations;
}

function collectUtilityClassBackgroundSignals(sourceFileText) {
  const utilityClassBackgroundSignals = [];
  const sourceLines = sourceFileText.split("\n");

  for (let lineIndex = 0; lineIndex < sourceLines.length; lineIndex += 1) {
    const sourceLine = sourceLines[lineIndex];
    const lineLooksLikeCssBackgroundDeclaration = /\bbackground(?:-image|-color)?\s*:/i.test(sourceLine);

    if (lineLooksLikeCssBackgroundDeclaration) {
      continue;
    }

    const lineHasGradientUtility = /bg-gradient|gradient-radial|radial-gradient|from-orange|via-orange|to-orange|from-amber|via-amber|to-amber/i.test(sourceLine);
    const lineHasBlackUtility = /bg-black|from-black|via-black|to-black|neutral-950|zinc-950|slate-950|gray-950|#000(?:000)?\b/i.test(sourceLine);

    if (lineHasGradientUtility && lineHasBlackUtility) {
      utilityClassBackgroundSignals.push({
        selector: "utility-class",
        value: sourceLine.trim(),
        index: calculateLineStartIndex(sourceFileText, lineIndex),
      });
    }
  }

  return utilityClassBackgroundSignals;
}

function buildUnsafeBackgroundFinding(sourceFilePath, backgroundSignal, reason) {
  return {
    relativeFilePath: path.relative(repositoryRootDirectoryPath, sourceFilePath).split(path.sep).join("/"),
    lineNumber: calculateLineNumber(fs.readFileSync(sourceFilePath, "utf8"), backgroundSignal.index),
    reason,
  };
}

function selectorLooksLikeGlobalBackground(selectorText) {
  const normalizedSelectorText = String(selectorText || "").toLowerCase();

  if (normalizedSelectorText.trim().length === 0) {
    return true;
  }

  return /(^|,|\s)(:root|html|body|main|#root|#app|\.app|\.page|\.site|\.layout|\.shell|\.root|\.min-h-screen|\.min-vh-100|\.mesh-background|\.background|\.hero)\b/.test(normalizedSelectorText);
}

function backgroundHasNeutralFallback(backgroundSignalText) {
  const normalizedBackgroundSignalText = String(backgroundSignalText || "").toLowerCase();

  if (/var\(--contrast-guard-safe-background\)/i.test(normalizedBackgroundSignalText)) {
    return true;
  }

  if (/#fff(?:fff)?\b|#000(?:000)?\b/i.test(normalizedBackgroundSignalText)) {
    return true;
  }

  if (/\bbg-white\b|\bbg-black\b/i.test(normalizedBackgroundSignalText)) {
    return true;
  }

  return false;
}

function textHasOrangeSignal(textValue) {
  return /#(?:f97316|fb923c|ea580c|c2410c|ff5b00|ff6a00|f59e0b|d97706|b45309)\b|rgba?\(\s*(?:249\s*,\s*115\s*,\s*22|251\s*,\s*146\s*,\s*60|234\s*,\s*88\s*,\s*12|255\s*,\s*(?:91|106)\s*,\s*0|245\s*,\s*158\s*,\s*11|217\s*,\s*119\s*,\s*6)|\b(?:orange|amber)\b|(?:from|via|to|bg|text|border)-(?:orange|amber)-[0-9]{2,3}/i.test(String(textValue || ""));
}

function textHasBlackSignal(textValue) {
  return /#(?:000|000000|050505|070707|0a0a0a|020617|050816)\b|rgba?\(\s*0\s*,\s*0\s*,\s*0|\bblack\b|(?:from|via|to|bg|text|border)-black\b|(?:neutral|zinc|slate|gray)-950\b/i.test(String(textValue || ""));
}

function calculateLineNumber(sourceFileText, characterIndex) {
  if (typeof characterIndex !== "number" || characterIndex < 0) {
    return null;
  }

  return sourceFileText.slice(0, characterIndex).split("\n").length;
}

function calculateLineStartIndex(sourceFileText, targetLineIndex) {
  const sourceLines = sourceFileText.split("\n");
  let characterIndex = 0;

  for (let lineIndex = 0; lineIndex < targetLineIndex; lineIndex += 1) {
    characterIndex += sourceLines[lineIndex].length + 1;
  }

  return characterIndex;
}

function collectTextFilePaths(directoryPath) {
  const ignoredDirectoryNames = new Set([".git", "node_modules", "dist", "build", "coverage", ".next", ".nuxt", ".angular", "target"]);
  const collectedFilePaths = [];

  if (fs.existsSync(directoryPath) === false) {
    return collectedFilePaths;
  }

  for (const directoryEntry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    if (ignoredDirectoryNames.has(directoryEntry.name) || directoryEntry.name === ".DS_Store" || directoryEntry.name.startsWith("._")) {
      continue;
    }

    const entryPath = path.join(directoryPath, directoryEntry.name);

    if (directoryEntry.isDirectory()) {
      collectedFilePaths.push(...collectTextFilePaths(entryPath));
      continue;
    }

    if (directoryEntry.isFile() && shouldReadFile(entryPath)) {
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
