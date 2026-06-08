#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { builtinModules } from "node:module";

const commandLineArguments = process.argv.slice(2);
const rootDirectoryPath = path.resolve(readArgumentValue("--root", "."));
const shouldApplyFixes = commandLineArguments.includes("--fix");
const shouldPrintJson = commandLineArguments.includes("--json");
const shouldUseStrictExit = commandLineArguments.includes("--strict");

const builtinModuleNames = new Set([
  ...builtinModules,
  ...builtinModules.map((builtinModuleName) => `node:${builtinModuleName}`),
]);

const ignoredDirectoryNames = new Set([
  ".git",
  ".hg",
  ".svn",
  "node_modules",
  ".next",
  ".nuxt",
  ".svelte-kit",
  ".astro",
  ".vite",
  ".turbo",
  ".cache",
  ".parcel-cache",
  "dist",
  "build",
  "out",
  "coverage",
  ".vercel",
  ".netlify",
]);

const sourceFileExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".html",
  ".json",
]);

const resolvableExtensions = [
  "",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".json",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".svg",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".ico",
  ".avif",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
];

const indexFileNames = [
  "index.js",
  "index.jsx",
  "index.ts",
  "index.tsx",
  "index.mjs",
  "index.cjs",
  "index.json",
  "index.css",
  "index.scss",
  "index.sass",
  "index.less",
];

const commonBinaryPackageNames = new Map([
  ["vite", "vite"],
  ["next", "next"],
  ["nuxt", "nuxt"],
  ["astro", "astro"],
  ["svelte-kit", "@sveltejs/kit"],
  ["remix", "@remix-run/dev"],
  ["webpack", "webpack"],
  ["webpack-dev-server", "webpack-dev-server"],
  ["rollup", "rollup"],
  ["parcel", "parcel"],
  ["tsc", "typescript"],
  ["tsx", "tsx"],
  ["ts-node", "ts-node"],
  ["eslint", "eslint"],
  ["prettier", "prettier"],
  ["jest", "jest"],
  ["vitest", "vitest"],
  ["mocha", "mocha"],
  ["cypress", "cypress"],
  ["playwright", "@playwright/test"],
  ["tailwindcss", "tailwindcss"],
  ["postcss", "postcss"],
  ["prisma", "prisma"],
  ["drizzle-kit", "drizzle-kit"],
]);

const shellBuiltinsAndCommonCommands = new Set([
  "cd",
  "pwd",
  "echo",
  "printf",
  "test",
  "true",
  "false",
  "exit",
  "export",
  "set",
  "unset",
  "rm",
  "cp",
  "mv",
  "mkdir",
  "rmdir",
  "find",
  "grep",
  "sed",
  "awk",
  "cat",
  "touch",
  "chmod",
  "chown",
  "ln",
  "kill",
  "sleep",
  "wait",
  "open",
  "start",
  "git",
  "gh",
  "docker",
  "docker-compose",
  "make",
  "node",
  "npm",
  "npx",
  "pnpm",
  "yarn",
  "bun",
  "python",
  "python3",
  "pip",
  "pip3",
  "go",
  "cargo",
  "rustc",
  "dotnet",
  "mvn",
  "gradle",
  "java",
]);

const findings = [];
const fixes = [];
const fileWriteMap = new Map();

if (fs.existsSync(rootDirectoryPath) === false) {
  addFinding("error", "root", "The requested root directory does not exist.", rootDirectoryPath);
  finish();
}

const allFilePaths = collectFilePaths(rootDirectoryPath);
const packageManifestRecords = collectPackageManifestRecords(allFilePaths);
const rootPackageManifestRecord = packageManifestRecords.find((packageManifestRecord) => packageManifestRecord.directoryPath === rootDirectoryPath) || packageManifestRecords[0] || null;
const packageManagerName = detectPackageManagerName(rootDirectoryPath);

checkRootRunPath();
checkPackageScripts();
checkSourceFileReferences();
checkHtmlEntryReferences();
checkCssAssetReferences();
checkDockerReferences();
checkDeploymentConfiguration();
applyQueuedFixes();
finish();

function readArgumentValue(argumentName, fallbackValue) {
  const argumentIndex = commandLineArguments.indexOf(argumentName);
  if (argumentIndex === -1) {
    return fallbackValue;
  }

  const nextValue = commandLineArguments[argumentIndex + 1];
  if (!nextValue || nextValue.startsWith("--")) {
    return fallbackValue;
  }

  return nextValue;
}

function collectFilePaths(directoryPath) {
  const collectedFilePaths = [];
  const directoryEntries = safeReadDirectory(directoryPath);

  for (const directoryEntry of directoryEntries) {
    const entryPath = path.join(directoryPath, directoryEntry.name);

    if (directoryEntry.isDirectory()) {
      if (ignoredDirectoryNames.has(directoryEntry.name)) {
        continue;
      }

      collectedFilePaths.push(...collectFilePaths(entryPath));
      continue;
    }

    if (directoryEntry.isFile()) {
      collectedFilePaths.push(entryPath);
    }
  }

  return collectedFilePaths;
}

function safeReadDirectory(directoryPath) {
  try {
    return fs.readdirSync(directoryPath, { withFileTypes: true });
  } catch {
    return [];
  }
}

function collectPackageManifestRecords(filePaths) {
  const packageJsonFilePaths = filePaths.filter((filePath) => path.basename(filePath) === "package.json");
  return packageJsonFilePaths.map((packageJsonFilePath) => {
    const packageJsonObject = readJsonFile(packageJsonFilePath, {});
    const dependencyMap = {
      ...readObject(packageJsonObject.dependencies),
      ...readObject(packageJsonObject.devDependencies),
      ...readObject(packageJsonObject.peerDependencies),
      ...readObject(packageJsonObject.optionalDependencies),
    };

    return {
      filePath: packageJsonFilePath,
      directoryPath: path.dirname(packageJsonFilePath),
      packageJsonObject,
      dependencyMap,
    };
  });
}

function readJsonFile(filePath, fallbackValue) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    addFinding("error", "json", "JSON file could not be parsed.", formatRelativePath(filePath));
    return fallbackValue;
  }
}

function readObject(value) {
  if (value && typeof value === "object" && Array.isArray(value) === false) {
    return value;
  }

  return {};
}

function detectPackageManagerName(directoryPath) {
  if (fs.existsSync(path.join(directoryPath, "pnpm-lock.yaml"))) {
    return "pnpm";
  }

  if (fs.existsSync(path.join(directoryPath, "yarn.lock"))) {
    return "yarn";
  }

  if (fs.existsSync(path.join(directoryPath, "bun.lock")) || fs.existsSync(path.join(directoryPath, "bun.lockb"))) {
    return "bun";
  }

  if (fs.existsSync(path.join(directoryPath, "package-lock.json")) || fs.existsSync(path.join(directoryPath, "npm-shrinkwrap.json"))) {
    return "npm";
  }

  return "unknown";
}

function checkRootRunPath() {
  if (!rootPackageManifestRecord) {
    addFinding("warning", "run-path", "No package.json was found, so Node app run scripts could not be checked.", formatRelativePath(rootDirectoryPath));
    return;
  }

  const packageJsonObject = rootPackageManifestRecord.packageJsonObject;
  const scriptObject = readObject(packageJsonObject.scripts);
  const availableScriptNames = Object.keys(scriptObject);

  if (availableScriptNames.length === 0) {
    addFinding("warning", "run-path", "package.json does not define any scripts, so the intended run command is unclear.", formatRelativePath(rootPackageManifestRecord.filePath));
  }

  const preferredRunScriptName = ["dev", "start", "preview", "serve"].find((scriptName) => Object.prototype.hasOwnProperty.call(scriptObject, scriptName));
  if (preferredRunScriptName) {
    addFinding("info", "run-path", `Detected intended local run script: ${packageManagerName === "unknown" ? "npm" : packageManagerName} run ${preferredRunScriptName}.`, formatRelativePath(rootPackageManifestRecord.filePath));
  }

  checkPackageFieldPath(packageJsonObject, "main", rootPackageManifestRecord.directoryPath, rootPackageManifestRecord.filePath);
  checkPackageFieldPath(packageJsonObject, "module", rootPackageManifestRecord.directoryPath, rootPackageManifestRecord.filePath);
  checkPackageFieldPath(packageJsonObject, "types", rootPackageManifestRecord.directoryPath, rootPackageManifestRecord.filePath);
  checkPackageExports(packageJsonObject, rootPackageManifestRecord.directoryPath, rootPackageManifestRecord.filePath);
}

function checkPackageFieldPath(packageJsonObject, fieldName, packageDirectoryPath, packageJsonFilePath) {
  const fieldValue = packageJsonObject[fieldName];
  if (typeof fieldValue !== "string" || fieldValue.trim().length === 0) {
    return;
  }

  const resolvedFilePath = path.resolve(packageDirectoryPath, fieldValue);
  if (pathExistsWithResolvableExtension(resolvedFilePath) === false) {
    addFinding("error", "package-field", `package.json field ${fieldName} points to a missing file: ${fieldValue}.`, formatRelativePath(packageJsonFilePath));
  }
}

function checkPackageExports(packageJsonObject, packageDirectoryPath, packageJsonFilePath) {
  const exportsValue = packageJsonObject.exports;
  if (!exportsValue) {
    return;
  }

  const exportTargetValues = collectExportTargetValues(exportsValue);
  for (const exportTargetValue of exportTargetValues) {
    if (typeof exportTargetValue !== "string") {
      continue;
    }

    if (!exportTargetValue.startsWith("./")) {
      continue;
    }

    const resolvedExportPath = path.resolve(packageDirectoryPath, exportTargetValue);
    if (pathExistsWithResolvableExtension(resolvedExportPath) === false) {
      addFinding("error", "package-exports", `package.json exports target is missing: ${exportTargetValue}.`, formatRelativePath(packageJsonFilePath));
    }
  }
}

function collectExportTargetValues(value) {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap((entryValue) => collectExportTargetValues(entryValue));
  }

  if (value && typeof value === "object") {
    return Object.values(value).flatMap((entryValue) => collectExportTargetValues(entryValue));
  }

  return [];
}

function checkPackageScripts() {
  for (const packageManifestRecord of packageManifestRecords) {
    const scriptObject = readObject(packageManifestRecord.packageJsonObject.scripts);
    for (const [scriptName, scriptCommand] of Object.entries(scriptObject)) {
      if (typeof scriptCommand !== "string") {
        continue;
      }

      checkScriptCommand(packageManifestRecord, scriptName, scriptCommand);
    }
  }
}

function checkScriptCommand(packageManifestRecord, scriptName, scriptCommand) {
  const commandSegments = splitScriptIntoCommandSegments(scriptCommand);
  for (const commandSegment of commandSegments) {
    const tokens = splitShellLike(commandSegment);
    if (tokens.length === 0) {
      continue;
    }

    const commandName = readCommandNameFromTokens(tokens);
    if (!commandName) {
      continue;
    }

    checkScriptBinary(packageManifestRecord, scriptName, commandName);
    checkScriptReferencedFiles(packageManifestRecord, scriptName, tokens);
  }
}

function splitScriptIntoCommandSegments(scriptCommand) {
  return scriptCommand.split(/\s+(?:&&|\|\||;)\s+/g).map((commandSegment) => commandSegment.trim()).filter(Boolean);
}

function splitShellLike(commandSegment) {
  const tokens = [];
  const tokenPattern = /"([^"]*)"|'([^']*)'|([^\s]+)/g;
  let tokenMatch;
  while ((tokenMatch = tokenPattern.exec(commandSegment)) !== null) {
    tokens.push(tokenMatch[1] || tokenMatch[2] || tokenMatch[3] || "");
  }

  return tokens;
}

function readCommandNameFromTokens(tokens) {
  let tokenIndex = 0;
  while (tokenIndex < tokens.length) {
    const token = tokens[tokenIndex];
    if (token.includes("=") && token.startsWith("-") === false && token.indexOf("=") > 0) {
      tokenIndex += 1;
      continue;
    }

    if (token === "cross-env" || token === "env") {
      tokenIndex += 1;
      continue;
    }

    return token;
  }

  return "";
}

function checkScriptBinary(packageManifestRecord, scriptName, commandName) {
  if (commandName.startsWith("./") || commandName.startsWith("../") || commandName.startsWith("/")) {
    const resolvedCommandPath = path.resolve(packageManifestRecord.directoryPath, commandName);
    if (pathExistsWithResolvableExtension(resolvedCommandPath) === false) {
      addFinding("error", "script", `Script ${scriptName} calls a missing local command: ${commandName}.`, formatRelativePath(packageManifestRecord.filePath));
    }
    return;
  }

  if (shellBuiltinsAndCommonCommands.has(commandName)) {
    return;
  }

  const expectedPackageName = commonBinaryPackageNames.get(commandName) || commandName;
  if (isPackageDeclared(packageManifestRecord, expectedPackageName) === false) {
    addFinding("warning", "dependency", `Script ${scriptName} uses binary ${commandName}, but ${expectedPackageName} is not declared in this package manifest.`, formatRelativePath(packageManifestRecord.filePath));
  }
}

function checkScriptReferencedFiles(packageManifestRecord, scriptName, tokens) {
  for (const token of tokens) {
    if (token.startsWith("-") || token.includes("=")) {
      continue;
    }

    if (looksLikeLocalFileReference(token) === false) {
      continue;
    }

    const cleanedToken = token.replace(/^['"]|['"]$/g, "");
    const resolvedTokenPath = path.resolve(packageManifestRecord.directoryPath, cleanedToken);
    if (pathExistsWithResolvableExtension(resolvedTokenPath) === false) {
      addFinding("error", "script", `Script ${scriptName} references a missing file or directory: ${cleanedToken}.`, formatRelativePath(packageManifestRecord.filePath));
    }
  }
}

function looksLikeLocalFileReference(token) {
  if (token.startsWith("./") || token.startsWith("../")) {
    return true;
  }

  if (/^[\w./-]+\.(?:js|jsx|ts|tsx|mjs|cjs|json|css|scss|sass|less|html|yml|yaml)$/i.test(token)) {
    return true;
  }

  return false;
}

function checkSourceFileReferences() {
  const sourceCodeFilePaths = allFilePaths.filter((filePath) => {
    const fileExtension = path.extname(filePath).toLowerCase();
    return [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"].includes(fileExtension);
  });

  for (const sourceCodeFilePath of sourceCodeFilePaths) {
    const sourceText = fs.readFileSync(sourceCodeFilePath, "utf8");
    const importSpecifiers = collectImportSpecifiers(sourceText);
    const packageManifestRecord = findNearestPackageManifestRecord(sourceCodeFilePath);

    for (const importSpecifier of importSpecifiers) {
      if (isLocalSpecifier(importSpecifier.value)) {
        checkLocalSpecifier(sourceCodeFilePath, sourceText, importSpecifier);
      } else {
        checkExternalSpecifier(sourceCodeFilePath, importSpecifier.value, packageManifestRecord);
      }
    }
  }
}

function collectImportSpecifiers(sourceText) {
  const importSpecifiers = [];
  const importPatterns = [
    /(?:import|export)\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?["']([^"']+)["']/g,
    /import\s*\(\s*["']([^"']+)["']\s*\)/g,
    /require\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const importPattern of importPatterns) {
    let importMatch;
    while ((importMatch = importPattern.exec(sourceText)) !== null) {
      importSpecifiers.push({ value: importMatch[1], startIndex: importMatch.index, endIndex: importPattern.lastIndex });
    }
  }

  return importSpecifiers;
}

function isLocalSpecifier(importSpecifier) {
  return importSpecifier.startsWith("./") || importSpecifier.startsWith("../") || importSpecifier.startsWith("/");
}

function checkLocalSpecifier(sourceCodeFilePath, sourceText, importSpecifier) {
  const sourceDirectoryPath = path.dirname(sourceCodeFilePath);
  const unresolvedPath = importSpecifier.value.startsWith("/") ? path.resolve(rootDirectoryPath, `.${importSpecifier.value}`) : path.resolve(sourceDirectoryPath, importSpecifier.value);
  const resolvedPath = resolveExistingPath(unresolvedPath);

  if (resolvedPath) {
    const casingMismatchPath = findPathWithCorrectCasing(unresolvedPath);
    if (casingMismatchPath && normalizePath(casingMismatchPath) !== normalizePath(unresolvedPath) && resolveExistingPath(casingMismatchPath)) {
      const correctedSpecifier = buildReplacementSpecifier(sourceCodeFilePath, importSpecifier.value, casingMismatchPath);
      addFinding("warning", "import-casing", `Import path casing differs from the filesystem: ${importSpecifier.value} should be ${correctedSpecifier}.`, formatRelativePath(sourceCodeFilePath));
      queueSpecifierFix(sourceCodeFilePath, sourceText, importSpecifier.value, correctedSpecifier);
    }
    return;
  }

  const suggestedExistingPath = findLikelyExistingPath(unresolvedPath);
  if (suggestedExistingPath) {
    const correctedSpecifier = buildReplacementSpecifier(sourceCodeFilePath, importSpecifier.value, suggestedExistingPath);
    addFinding("error", "import", `Missing local import ${importSpecifier.value}; likely intended path is ${correctedSpecifier}.`, formatRelativePath(sourceCodeFilePath));
    queueSpecifierFix(sourceCodeFilePath, sourceText, importSpecifier.value, correctedSpecifier);
    return;
  }

  addFinding("error", "import", `Missing local import: ${importSpecifier.value}.`, formatRelativePath(sourceCodeFilePath));
}

function queueSpecifierFix(filePath, sourceText, currentSpecifier, correctedSpecifier) {
  if (shouldApplyFixes === false || currentSpecifier === correctedSpecifier) {
    return;
  }

  let nextSourceText = fileWriteMap.get(filePath) || sourceText;
  const escapedCurrentSpecifier = escapeRegExp(currentSpecifier);
  const replacementPattern = new RegExp(`(["'])${escapedCurrentSpecifier}\\1`, "g");
  nextSourceText = nextSourceText.replace(replacementPattern, (fullMatch, quoteCharacter) => `${quoteCharacter}${correctedSpecifier}${quoteCharacter}`);
  fileWriteMap.set(filePath, nextSourceText);
  fixes.push({ file: formatRelativePath(filePath), message: `Updated import specifier ${currentSpecifier} to ${correctedSpecifier}.` });
}

function checkExternalSpecifier(sourceCodeFilePath, importSpecifier, packageManifestRecord) {
  if (importSpecifier.startsWith("node:")) {
    return;
  }

  const packageName = readPackageNameFromSpecifier(importSpecifier);
  if (builtinModuleNames.has(packageName) || builtinModuleNames.has(importSpecifier)) {
    return;
  }

  if (!packageManifestRecord) {
    return;
  }

  if (isPackageDeclared(packageManifestRecord, packageName) === false) {
    addFinding("warning", "dependency", `Imported package ${packageName} is not declared in the nearest package manifest.`, formatRelativePath(sourceCodeFilePath));
  }
}

function readPackageNameFromSpecifier(importSpecifier) {
  if (importSpecifier.startsWith("@")) {
    const [scopeName, packageName] = importSpecifier.split("/");
    return `${scopeName}/${packageName || ""}`;
  }

  return importSpecifier.split("/")[0];
}

function isPackageDeclared(packageManifestRecord, packageName) {
  if (!packageManifestRecord) {
    return false;
  }

  if (Object.prototype.hasOwnProperty.call(packageManifestRecord.dependencyMap, packageName)) {
    return true;
  }

  const rootManifest = rootPackageManifestRecord;
  if (rootManifest && Object.prototype.hasOwnProperty.call(rootManifest.dependencyMap, packageName)) {
    return true;
  }

  const workspacePackageManifest = packageManifestRecords.find((candidatePackageManifestRecord) => candidatePackageManifestRecord.packageJsonObject.name === packageName);
  return Boolean(workspacePackageManifest);
}

function findNearestPackageManifestRecord(filePath) {
  let currentDirectoryPath = path.dirname(filePath);
  while (currentDirectoryPath.startsWith(rootDirectoryPath)) {
    const packageManifestRecord = packageManifestRecords.find((candidatePackageManifestRecord) => candidatePackageManifestRecord.directoryPath === currentDirectoryPath);
    if (packageManifestRecord) {
      return packageManifestRecord;
    }

    const nextDirectoryPath = path.dirname(currentDirectoryPath);
    if (nextDirectoryPath === currentDirectoryPath) {
      break;
    }
    currentDirectoryPath = nextDirectoryPath;
  }

  return rootPackageManifestRecord;
}

function checkHtmlEntryReferences() {
  const htmlFilePaths = allFilePaths.filter((filePath) => path.extname(filePath).toLowerCase() === ".html");
  for (const htmlFilePath of htmlFilePaths) {
    const htmlText = fs.readFileSync(htmlFilePath, "utf8");
    const scriptSourcePattern = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
    const stylesheetSourcePattern = /<link\b[^>]*\b(?:href)=["']([^"']+)["'][^>]*>/gi;
    checkHtmlReferences(htmlFilePath, htmlText, scriptSourcePattern, "script");
    checkHtmlReferences(htmlFilePath, htmlText, stylesheetSourcePattern, "asset");
  }
}

function checkHtmlReferences(htmlFilePath, htmlText, referencePattern, referenceKind) {
  let referenceMatch;
  while ((referenceMatch = referencePattern.exec(htmlText)) !== null) {
    const referenceValue = referenceMatch[1];
    if (shouldSkipUrl(referenceValue)) {
      continue;
    }

    const resolvedReferencePath = resolveHtmlReferencePath(htmlFilePath, referenceValue);
    if (pathExistsWithResolvableExtension(resolvedReferencePath) === false) {
      addFinding("error", referenceKind, `HTML references a missing ${referenceKind}: ${referenceValue}.`, formatRelativePath(htmlFilePath));
    }
  }
}

function resolveHtmlReferencePath(htmlFilePath, referenceValue) {
  if (referenceValue.startsWith("/")) {
    const publicPath = path.resolve(rootDirectoryPath, "public", referenceValue.slice(1));
    if (fs.existsSync(publicPath)) {
      return publicPath;
    }

    return path.resolve(rootDirectoryPath, `.${referenceValue}`);
  }

  return path.resolve(path.dirname(htmlFilePath), referenceValue);
}

function checkCssAssetReferences() {
  const cssFilePaths = allFilePaths.filter((filePath) => [".css", ".scss", ".sass", ".less"].includes(path.extname(filePath).toLowerCase()));
  for (const cssFilePath of cssFilePaths) {
    const cssText = fs.readFileSync(cssFilePath, "utf8");
    const cssUrlPattern = /url\(\s*['"]?([^'")]+)['"]?\s*\)/g;
    let cssUrlMatch;
    while ((cssUrlMatch = cssUrlPattern.exec(cssText)) !== null) {
      const assetReference = cssUrlMatch[1].trim();
      if (shouldSkipUrl(assetReference)) {
        continue;
      }

      const resolvedAssetPath = resolveCssAssetPath(cssFilePath, assetReference);
      if (pathExistsWithResolvableExtension(resolvedAssetPath) === false) {
        const suggestedExistingPath = findLikelyExistingPath(resolvedAssetPath);
        if (suggestedExistingPath) {
          const correctedReference = buildCssReplacementReference(cssFilePath, assetReference, suggestedExistingPath);
          addFinding("error", "css-asset", `CSS asset reference is missing: ${assetReference}; likely intended path is ${correctedReference}.`, formatRelativePath(cssFilePath));
          queueCssUrlFix(cssFilePath, cssText, assetReference, correctedReference);
        } else {
          addFinding("error", "css-asset", `CSS asset reference is missing: ${assetReference}.`, formatRelativePath(cssFilePath));
        }
      }
    }
  }
}

function resolveCssAssetPath(cssFilePath, assetReference) {
  if (assetReference.startsWith("/")) {
    const publicPath = path.resolve(rootDirectoryPath, "public", assetReference.slice(1));
    if (fs.existsSync(publicPath)) {
      return publicPath;
    }

    return path.resolve(rootDirectoryPath, `.${assetReference}`);
  }

  return path.resolve(path.dirname(cssFilePath), assetReference);
}

function buildCssReplacementReference(cssFilePath, currentReference, suggestedExistingPath) {
  if (currentReference.startsWith("/")) {
    const publicDirectoryPath = path.resolve(rootDirectoryPath, "public");
    if (normalizePath(suggestedExistingPath).startsWith(normalizePath(publicDirectoryPath))) {
      return `/${normalizePath(path.relative(publicDirectoryPath, suggestedExistingPath))}`;
    }
  }

  let relativePath = normalizePath(path.relative(path.dirname(cssFilePath), suggestedExistingPath));
  if (relativePath.startsWith(".") === false) {
    relativePath = `./${relativePath}`;
  }

  return relativePath;
}

function queueCssUrlFix(filePath, sourceText, currentReference, correctedReference) {
  if (shouldApplyFixes === false || currentReference === correctedReference) {
    return;
  }

  let nextSourceText = fileWriteMap.get(filePath) || sourceText;
  const escapedCurrentReference = escapeRegExp(currentReference);
  const replacementPattern = new RegExp(`url\\(\\s*(['"]?)${escapedCurrentReference}\\1\\s*\\)`, "g");
  nextSourceText = nextSourceText.replace(replacementPattern, (fullMatch, quoteCharacter) => `url(${quoteCharacter}${correctedReference}${quoteCharacter})`);
  fileWriteMap.set(filePath, nextSourceText);
  fixes.push({ file: formatRelativePath(filePath), message: `Updated CSS asset reference ${currentReference} to ${correctedReference}.` });
}

function shouldSkipUrl(urlValue) {
  return /^(?:https?:|data:|blob:|mailto:|tel:|#)/i.test(urlValue);
}

function checkDockerReferences() {
  const dockerFilePaths = allFilePaths.filter((filePath) => path.basename(filePath) === "Dockerfile" || path.basename(filePath).startsWith("Dockerfile."));
  for (const dockerFilePath of dockerFilePaths) {
    const dockerText = fs.readFileSync(dockerFilePath, "utf8");
    const dockerLines = dockerText.split(/\r?\n/);
    for (const dockerLine of dockerLines) {
      checkDockerCopyLine(dockerFilePath, dockerLine);
    }
  }
}

function checkDockerCopyLine(dockerFilePath, dockerLine) {
  const trimmedLine = dockerLine.trim();
  if (/^(COPY|ADD)\s+/i.test(trimmedLine) === false) {
    return;
  }

  if (/\s--from=/i.test(trimmedLine)) {
    return;
  }

  const instructionBody = trimmedLine.replace(/^(COPY|ADD)\s+/i, "").trim();
  let sourceValues = [];

  if (instructionBody.startsWith("[")) {
    try {
      const parsedValues = JSON.parse(instructionBody);
      if (Array.isArray(parsedValues) && parsedValues.length >= 2) {
        sourceValues = parsedValues.slice(0, -1);
      }
    } catch {
      addFinding("warning", "docker", "Docker COPY or ADD JSON syntax could not be parsed.", formatRelativePath(dockerFilePath));
    }
  } else {
    const tokens = splitShellLike(instructionBody).filter((token) => token.startsWith("--") === false);
    sourceValues = tokens.slice(0, -1);
  }

  for (const sourceValue of sourceValues) {
    if (sourceValue.startsWith("http://") || sourceValue.startsWith("https://")) {
      continue;
    }

    const resolvedSourcePath = path.resolve(rootDirectoryPath, sourceValue);
    if (globLikePathExists(sourceValue, resolvedSourcePath) === false) {
      addFinding("error", "docker", `Docker COPY or ADD source is missing: ${sourceValue}.`, formatRelativePath(dockerFilePath));
    }
  }
}

function globLikePathExists(sourceValue, resolvedSourcePath) {
  if (sourceValue.includes("*") === false) {
    return fs.existsSync(resolvedSourcePath);
  }

  const directoryBeforeGlob = sourceValue.split("*")[0].replace(/[^/]*$/, "");
  const resolvedDirectoryBeforeGlob = path.resolve(rootDirectoryPath, directoryBeforeGlob || ".");
  return fs.existsSync(resolvedDirectoryBeforeGlob);
}

function checkDeploymentConfiguration() {
  const packageJsonFilePath = path.join(rootDirectoryPath, "package.json");
  if (fs.existsSync(packageJsonFilePath) === false) {
    return;
  }

  const packageJsonObject = readJsonFile(packageJsonFilePath, {});
  const scriptsObject = readObject(packageJsonObject.scripts);
  const knownOutputDirectories = ["dist", "build", "out", ".next", ".output", "public"];

  const netlifyTomlPath = path.join(rootDirectoryPath, "netlify.toml");
  if (fs.existsSync(netlifyTomlPath)) {
    const netlifyTomlText = fs.readFileSync(netlifyTomlPath, "utf8");
    const publishMatch = netlifyTomlText.match(/publish\s*=\s*["']([^"']+)["']/);
    if (publishMatch && knownOutputDirectories.includes(publishMatch[1]) === false && fs.existsSync(path.resolve(rootDirectoryPath, publishMatch[1])) === false) {
      addFinding("warning", "deployment", `netlify.toml publish directory is not a known or existing output directory: ${publishMatch[1]}.`, formatRelativePath(netlifyTomlPath));
    }
  }

  const vercelJsonPath = path.join(rootDirectoryPath, "vercel.json");
  if (fs.existsSync(vercelJsonPath)) {
    const vercelJsonObject = readJsonFile(vercelJsonPath, {});
    if (typeof vercelJsonObject.outputDirectory === "string" && knownOutputDirectories.includes(vercelJsonObject.outputDirectory) === false && fs.existsSync(path.resolve(rootDirectoryPath, vercelJsonObject.outputDirectory)) === false) {
      addFinding("warning", "deployment", `vercel.json outputDirectory is not a known or existing output directory: ${vercelJsonObject.outputDirectory}.`, formatRelativePath(vercelJsonPath));
    }
  }

  if (scriptsObject.build && !scriptsObject.preview && !scriptsObject.start) {
    addFinding("info", "deployment", "A build script exists, but no start or preview script was found for smoke testing the build output.", formatRelativePath(packageJsonFilePath));
  }
}

function pathExistsWithResolvableExtension(candidatePath) {
  return Boolean(resolveExistingPath(candidatePath));
}

function resolveExistingPath(candidatePath) {
  if (fs.existsSync(candidatePath)) {
    return candidatePath;
  }

  for (const extension of resolvableExtensions) {
    const candidateFilePath = `${candidatePath}${extension}`;
    if (extension.length > 0 && fs.existsSync(candidateFilePath)) {
      return candidateFilePath;
    }
  }

  for (const indexFileName of indexFileNames) {
    const candidateIndexPath = path.join(candidatePath, indexFileName);
    if (fs.existsSync(candidateIndexPath)) {
      return candidateIndexPath;
    }
  }

  return "";
}

function findLikelyExistingPath(candidatePath) {
  const exactCasingPath = findPathWithCorrectCasing(candidatePath);
  if (exactCasingPath && resolveExistingPath(exactCasingPath)) {
    return resolveExistingPath(exactCasingPath);
  }

  for (const extension of resolvableExtensions.filter((extension) => extension.length > 0)) {
    const extendedCandidatePath = `${candidatePath}${extension}`;
    const correctedPath = findPathWithCorrectCasing(extendedCandidatePath);
    if (correctedPath && fs.existsSync(correctedPath)) {
      return correctedPath;
    }
  }

  const parentDirectoryPath = path.dirname(candidatePath);
  const requestedBaseName = path.basename(candidatePath).toLowerCase();
  const parentDirectoryEntries = safeReadDirectory(parentDirectoryPath);
  const matchingEntries = parentDirectoryEntries.filter((directoryEntry) => {
    const parsedName = path.parse(directoryEntry.name);
    return parsedName.name.toLowerCase() === requestedBaseName || directoryEntry.name.toLowerCase() === requestedBaseName;
  });

  if (matchingEntries.length === 1) {
    return path.join(parentDirectoryPath, matchingEntries[0].name);
  }

  return "";
}

function findPathWithCorrectCasing(candidatePath) {
  const parsedPath = path.parse(path.resolve(candidatePath));
  const relativeSegments = path.relative(parsedPath.root, path.resolve(candidatePath)).split(path.sep).filter(Boolean);
  let currentPath = parsedPath.root;

  for (const relativeSegment of relativeSegments) {
    const directoryEntries = safeReadDirectory(currentPath);
    const matchingEntry = directoryEntries.find((directoryEntry) => directoryEntry.name.toLowerCase() === relativeSegment.toLowerCase());
    if (!matchingEntry) {
      return "";
    }

    currentPath = path.join(currentPath, matchingEntry.name);
  }

  return currentPath;
}

function buildReplacementSpecifier(sourceCodeFilePath, currentSpecifier, suggestedExistingPath) {
  if (currentSpecifier.startsWith("/")) {
    let absoluteSpecifier = normalizePath(path.relative(rootDirectoryPath, suggestedExistingPath));
    if (absoluteSpecifier.startsWith("public/")) {
      absoluteSpecifier = absoluteSpecifier.slice("public".length);
    } else {
      absoluteSpecifier = `/${absoluteSpecifier}`;
    }
    return absoluteSpecifier;
  }

  let relativeSpecifier = normalizePath(path.relative(path.dirname(sourceCodeFilePath), suggestedExistingPath));
  if (relativeSpecifier.startsWith(".") === false) {
    relativeSpecifier = `./${relativeSpecifier}`;
  }

  if (path.extname(currentSpecifier).length === 0) {
    relativeSpecifier = removeResolvableExtension(relativeSpecifier);
    relativeSpecifier = removeIndexFileName(relativeSpecifier);
  }

  return relativeSpecifier;
}

function removeResolvableExtension(specifier) {
  const specifierExtension = path.extname(specifier);
  if (resolvableExtensions.includes(specifierExtension)) {
    return specifier.slice(0, -specifierExtension.length);
  }

  return specifier;
}

function removeIndexFileName(specifier) {
  for (const indexFileName of indexFileNames) {
    const suffix = `/${indexFileName}`;
    if (specifier.endsWith(suffix)) {
      return specifier.slice(0, -suffix.length);
    }
  }

  return specifier;
}

function applyQueuedFixes() {
  if (shouldApplyFixes === false) {
    return;
  }

  for (const [filePath, nextFileText] of fileWriteMap.entries()) {
    fs.writeFileSync(filePath, nextFileText);
  }
}

function addFinding(severity, category, message, file) {
  findings.push({ severity, category, file, message });
}

function formatRelativePath(filePath) {
  const relativePath = path.relative(rootDirectoryPath, filePath);
  if (!relativePath || relativePath.length === 0) {
    return ".";
  }

  return normalizePath(relativePath);
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function finish() {
  const errorCount = findings.filter((finding) => finding.severity === "error").length;
  const warningCount = findings.filter((finding) => finding.severity === "warning").length;
  const infoCount = findings.filter((finding) => finding.severity === "info").length;

  if (shouldPrintJson) {
    console.log(JSON.stringify({ root: rootDirectoryPath, packageManager: packageManagerName, summary: { errors: errorCount, warnings: warningCount, info: infoCount, fixes: fixes.length }, findings, fixes }, null, 2));
  } else {
    console.log(`Wiring check for ${rootDirectoryPath}`);
    console.log(`Package manager: ${packageManagerName}`);
    console.log(`Findings: ${errorCount} error(s), ${warningCount} warning(s), ${infoCount} info item(s)`);

    if (fixes.length > 0) {
      console.log("");
      console.log("Fixes applied:");
      for (const fix of fixes) {
        console.log(`- ${fix.file}: ${fix.message}`);
      }
    }

    if (findings.length > 0) {
      console.log("");
      console.log("Findings:");
      for (const finding of findings) {
        console.log(`- [${finding.severity}] [${finding.category}] ${finding.file}: ${finding.message}`);
      }
    }

    if (findings.length === 0) {
      console.log("No obvious wiring problems were found by the static checker.");
    }
  }

  if (errorCount > 0 || (shouldUseStrictExit && warningCount > 0)) {
    process.exit(1);
  }

  process.exit(0);
}
