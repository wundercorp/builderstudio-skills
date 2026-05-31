#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const knownImportPackageMap = new Map([
  ["motion/react", "motion"],
  ["motion", "motion"],
  ["framer-motion", "framer-motion"],
  ["lucide-react", "lucide-react"],
  ["shaders/react", "@paper-design/shaders-react"],
  ["@paper-design/shaders-react", "@paper-design/shaders-react"],
  ["@paper-design/shaders", "@paper-design/shaders"],
  ["@splinetool/react-spline", "@splinetool/react-spline"],
  ["@splinetool/react-spline/next", "@splinetool/react-spline"],
  ["@splinetool/runtime", "@splinetool/runtime"],
  ["@react-three/fiber", "@react-three/fiber"],
  ["@react-three/drei", "@react-three/drei"],
  ["three", "three"],
  ["three/examples", "three"],
  ["gsap", "gsap"],
  ["clsx", "clsx"],
  ["tailwind-merge", "tailwind-merge"],
  ["class-variance-authority", "class-variance-authority"],
  ["@supabase/supabase-js", "@supabase/supabase-js"],
  ["zustand", "zustand"],
  ["recharts", "recharts"],
  ["date-fns", "date-fns"]
]);

const knownPackageVersions = new Map([
  ["motion", "^12.23.12"],
  ["framer-motion", "^12.23.12"],
  ["lucide-react", "^0.511.0"],
  ["@paper-design/shaders-react", "^0.0.76"],
  ["@paper-design/shaders", "^0.0.76"],
  ["@splinetool/react-spline", "^4.1.0"],
  ["@splinetool/runtime", "^1.10.57"],
  ["@react-three/fiber", "^8.17.10"],
  ["@react-three/drei", "^9.122.0"],
  ["three", "^0.170.0"],
  ["gsap", "^3.12.5"],
  ["clsx", "^2.1.1"],
  ["tailwind-merge", "^2.6.0"],
  ["class-variance-authority", "^0.7.1"],
  ["@supabase/supabase-js", "^2.49.8"],
  ["zustand", "^5.0.2"],
  ["recharts", "^2.15.0"],
  ["date-fns", "^4.1.0"]
]);


const paperShaderReactExportNames = new Set([
  "MeshGradient",
  "StaticMeshGradient",
  "StaticRadialGradient",
  "GrainGradient",
  "SmokeRing",
  "SimplexNoise",
  "NeuroNoise",
  "PerlinNoise",
  "Metaballs",
  "Voronoi",
  "Warp",
  "Swirl",
  "Spiral",
  "GodRays",
  "DotOrbit",
  "DotGrid",
  "Waves",
  "Dithering",
  "PulsingBorder",
  "ColorPanels",
  "PaperTexture",
  "FlutedGlass",
  "Water",
  "ImageDithering",
  "Heatmap",
  "LiquidMetal",
  "HalftoneDots",
  "HalftoneCmyk"
]);

const ignoredBareImports = new Set([
  "react",
  "react-dom",
  "react/jsx-runtime",
  "node:path",
  "node:fs",
  "node:url",
  "node:process"
]);

const args = parseArgs(process.argv.slice(2));
const rootDirectoryPath = path.resolve(args.root || process.cwd());
const packageJsonPath = path.join(rootDirectoryPath, "package.json");
const shouldFix = args.fix === true;
const shouldJson = args.json === true;
const fromErrorText = args.fromError || "";
const runtimeLogText = readRuntimeLogText(args);

if (!fs.existsSync(packageJsonPath)) {
  fail(`No package.json found at ${packageJsonPath}`);
}

const packageJson = readJson(packageJsonPath);
const importRewriteRecords = collectKnownImportRewriteRecords(rootDirectoryPath);
const didRewriteSourceImports = shouldFix ? applyKnownImportRewrites(importRewriteRecords) : false;
const declaredPackages = getDeclaredPackages(packageJson);
const sourceImportRecords = collectSourceImportRecords(rootDirectoryPath);
const errorImportRecords = collectErrorImportRecords(fromErrorText);
const allImportRecords = [...sourceImportRecords, ...errorImportRecords];

const missingPackageRecords = [];
const unknownPackageRecords = [];

for (const importRecord of allImportRecords) {
  if (shouldIgnoreImport(importRecord.importSpecifier)) {
    continue;
  }

  const packageName = getPackageNameFromImport(importRecord.importSpecifier);
  if (!packageName || ignoredBareImports.has(packageName)) {
    continue;
  }

  if (declaredPackages.has(packageName)) {
    continue;
  }

  const record = {
    importSpecifier: importRecord.importSpecifier,
    packageName,
    sourceFilePath: importRecord.sourceFilePath,
    version: knownPackageVersions.get(packageName) || ""
  };

  if (knownPackageVersions.has(packageName)) {
    if (!missingPackageRecords.some((candidate) => candidate.packageName === record.packageName)) {
      missingPackageRecords.push(record);
    }
  } else if (!unknownPackageRecords.some((candidate) => candidate.packageName === record.packageName)) {
    unknownPackageRecords.push(record);
  }
}

let didWritePackageJson = false;

if (shouldFix && missingPackageRecords.length > 0) {
  if (!packageJson.dependencies || typeof packageJson.dependencies !== "object") {
    packageJson.dependencies = {};
  }

  for (const missingPackageRecord of missingPackageRecords) {
    packageJson.dependencies[missingPackageRecord.packageName] = missingPackageRecord.version;
  }

  packageJson.dependencies = sortObjectByKey(packageJson.dependencies);
  fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  didWritePackageJson = true;
}

const runtimeStartClassification = classifyRuntimeStartResult(runtimeLogText || fromErrorText);

const result = {
  rootDirectoryPath,
  packageManager: detectPackageManager(rootDirectoryPath),
  missingKnownPackages: missingPackageRecords,
  unknownPackages: unknownPackageRecords,
  importRewrites: importRewriteRecords.map((record) => ({
    sourceFilePath: path.relative(rootDirectoryPath, record.sourceFilePath),
    fromImportSpecifier: record.fromImportSpecifier,
    toImportSpecifier: record.toImportSpecifier,
    importedNames: record.importedNames
  })),
  fixedSourceImports: didRewriteSourceImports,
  fixedPackageJson: didWritePackageJson,
  installCommand: detectInstallCommand(rootDirectoryPath),
  runtimeStartClassification
};

if (shouldJson) {
  console.log(JSON.stringify(result, null, 2));
} else {
  printHumanResult(result);
}

if (missingPackageRecords.length > 0 || unknownPackageRecords.length > 0) {
  process.exitCode = shouldFix && unknownPackageRecords.length === 0 ? 0 : 1;
}


function readRuntimeLogText(parsedArgs) {
  if (parsedArgs.fromLog) {
    return parsedArgs.fromLog;
  }

  if (parsedArgs.logFile) {
    const logFilePath = path.resolve(parsedArgs.logFile);
    if (fs.existsSync(logFilePath)) {
      return fs.readFileSync(logFilePath, "utf8");
    }
  }

  return "";
}

function classifyRuntimeStartResult(logText) {
  const normalizedLogText = String(logText || "");
  if (!normalizedLogText.trim()) {
    return {
      status: "none",
      message: "No runtime start log was provided.",
      shouldOpenPreview: false,
      detectedUrl: ""
    };
  }

  const timedOut = /did not start listening on\s+https?:\/\/[^\s]+?\s+after\s+\d+\s+seconds/i.test(normalizedLogText);
  const viteReady = /VITE\s+v?[\d.]+\s+ready/i.test(normalizedLogText);
  const localUrlMatch = normalizedLogText.match(/Local:\s+(https?:\/\/[^\s]+)/i);
  const networkUrlMatch = normalizedLogText.match(/Network:\s+(https?:\/\/[^\s]+)/i);
  const hasAnyReadyUrl = Boolean(localUrlMatch || networkUrlMatch);
  const containerRunning = /State=running/i.test(normalizedLogText);
  const cleanExitCode = /ExitCode=0/i.test(normalizedLogText);
  const packageInstallStillRunning = /(?:yarn|npm|pnpm|bun)\s+install/i.test(normalizedLogText) && !/(?:Done in|added \d+ packages|Already up to date|Lockfile is up to date)/i.test(normalizedLogText);

  if (timedOut && (viteReady || hasAnyReadyUrl) && containerRunning && cleanExitCode) {
    return {
      status: "recovered",
      message: "Runtime reported a timeout, but later logs show a ready dev server and a running container with ExitCode 0.",
      shouldOpenPreview: true,
      detectedUrl: localUrlMatch?.[1] || networkUrlMatch?.[1] || ""
    };
  }

  if (timedOut && (viteReady || hasAnyReadyUrl)) {
    return {
      status: "port-or-proxy-check",
      message: "The dev server appears ready, but the supervisor healthcheck timed out. Inspect host/container port binding or preview proxy wiring.",
      shouldOpenPreview: false,
      detectedUrl: localUrlMatch?.[1] || networkUrlMatch?.[1] || ""
    };
  }

  if (timedOut && packageInstallStillRunning) {
    return {
      status: "install-budget-timeout",
      message: "The runtime timed out while install activity was still in progress. Increase the install/start budget or stream progress before failing.",
      shouldOpenPreview: false,
      detectedUrl: ""
    };
  }

  if (timedOut) {
    return {
      status: "timeout",
      message: "Runtime did not become reachable before the healthcheck deadline and no later ready signal was detected.",
      shouldOpenPreview: false,
      detectedUrl: ""
    };
  }

  return {
    status: "none",
    message: "No runtime timeout pattern was detected.",
    shouldOpenPreview: false,
    detectedUrl: localUrlMatch?.[1] || networkUrlMatch?.[1] || ""
  };
}

function parseArgs(rawArgs) {
  const parsedArgs = {};
  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];
    if (arg === "--fix") {
      parsedArgs.fix = true;
    } else if (arg === "--json") {
      parsedArgs.json = true;
    } else if (arg === "--root") {
      parsedArgs.root = rawArgs[index + 1] || "";
      index += 1;
    } else if (arg === "--from-error") {
      parsedArgs.fromError = rawArgs[index + 1] || "";
      index += 1;
    } else if (arg === "--from-log") {
      parsedArgs.fromLog = rawArgs[index + 1] || "";
      index += 1;
    } else if (arg === "--log-file") {
      parsedArgs.logFile = rawArgs[index + 1] || "";
      index += 1;
    }
  }
  return parsedArgs;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function getDeclaredPackages(packageJsonValue) {
  const declaredPackageSet = new Set();
  for (const dependencySectionName of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
    const dependencySection = packageJsonValue[dependencySectionName];
    if (!dependencySection || typeof dependencySection !== "object") {
      continue;
    }

    for (const packageName of Object.keys(dependencySection)) {
      declaredPackageSet.add(packageName);
    }
  }
  return declaredPackageSet;
}

function collectSourceImportRecords(rootPath) {
  const records = [];
  const sourceFilePaths = collectSourceFilePaths(rootPath);

  for (const sourceFilePath of sourceFilePaths) {
    const sourceText = fs.readFileSync(sourceFilePath, "utf8");
    for (const importSpecifier of extractImportSpecifiers(sourceText)) {
      records.push({
        importSpecifier,
        sourceFilePath: path.relative(rootPath, sourceFilePath)
      });
    }
  }

  return records;
}

function collectSourceFilePaths(rootPath) {
  const result = [];
  const ignoredDirectoryNames = new Set(["node_modules", ".git", "dist", "build", ".next", ".nuxt", "coverage", ".vite"]);
  const allowedExtensions = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs", ".vue", ".svelte"]);

  function walk(directoryPath) {
    for (const directoryEntry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
      const entryPath = path.join(directoryPath, directoryEntry.name);
      if (directoryEntry.isDirectory()) {
        if (!ignoredDirectoryNames.has(directoryEntry.name)) {
          walk(entryPath);
        }
        continue;
      }

      if (directoryEntry.isFile() && allowedExtensions.has(path.extname(directoryEntry.name))) {
        result.push(entryPath);
      }
    }
  }

  walk(rootPath);
  return result;
}

function extractImportSpecifiers(sourceText) {
  const specifiers = new Set();
  const patterns = [
    /\bimport\s+(?:type\s+)?(?:[^"'()]*?\s+from\s+)?["']([^"']+)["']/g,
    /\bexport\s+(?:type\s+)?[^"'()]*?\s+from\s+["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g
  ];

  for (const pattern of patterns) {
    let match = pattern.exec(sourceText);
    while (match) {
      specifiers.add(match[1]);
      match = pattern.exec(sourceText);
    }
  }

  return [...specifiers];
}

function collectErrorImportRecords(errorText) {
  if (!errorText) {
    return [];
  }

  const records = [];
  const vitePattern = /Failed to resolve import "([^"]+)" from "([^"]+)"/g;
  const moduleNotFoundPattern = /Cannot find module ['"]([^'"]+)['"]/g;
  const webpackPattern = /Module not found:.*?Can't resolve ['"]([^'"]+)['"]/g;

  for (const pattern of [vitePattern, moduleNotFoundPattern, webpackPattern]) {
    let match = pattern.exec(errorText);
    while (match) {
      records.push({
        importSpecifier: match[1],
        sourceFilePath: match[2] || "runtime error"
      });
      match = pattern.exec(errorText);
    }
  }

  return records;
}


function collectKnownImportRewriteRecords(rootPath) {
  const rewriteRecords = [];
  const sourceFilePaths = collectSourceFilePaths(rootPath);

  for (const sourceFilePath of sourceFilePaths) {
    const sourceText = fs.readFileSync(sourceFilePath, "utf8");
    const importPattern = /\bimport\s+(?:type\s+)?([^;]*?)\s+from\s+(['"])shaders\/react\2/g;
    let match = importPattern.exec(sourceText);
    while (match) {
      const importClause = match[1] || "";
      const importedNames = extractNamedImportNames(importClause);
      if (importedNames.some((importedName) => paperShaderReactExportNames.has(importedName))) {
        rewriteRecords.push({
          sourceFilePath,
          fromImportSpecifier: "shaders/react",
          toImportSpecifier: "@paper-design/shaders-react",
          importedNames
        });
      }
      match = importPattern.exec(sourceText);
    }
  }

  return rewriteRecords;
}

function applyKnownImportRewrites(rewriteRecords) {
  let didRewrite = false;
  const recordsByFilePath = new Map();

  for (const rewriteRecord of rewriteRecords) {
    const currentRecords = recordsByFilePath.get(rewriteRecord.sourceFilePath) || [];
    currentRecords.push(rewriteRecord);
    recordsByFilePath.set(rewriteRecord.sourceFilePath, currentRecords);
  }

  for (const [sourceFilePath] of recordsByFilePath.entries()) {
    const originalSourceText = fs.readFileSync(sourceFilePath, "utf8");
    const nextSourceText = originalSourceText.replace(
      /\bimport\s+(?:type\s+)?([^;]*?)\s+from\s+(['"])shaders\/react\2/g,
      (matchedImportStatement, importClause) => {
        const importedNames = extractNamedImportNames(importClause || "");
        if (!importedNames.some((importedName) => paperShaderReactExportNames.has(importedName))) {
          return matchedImportStatement;
        }
        return matchedImportStatement.replace(/(['"])shaders\/react\1/, "$1@paper-design/shaders-react$1");
      },
    );

    if (nextSourceText !== originalSourceText) {
      fs.writeFileSync(sourceFilePath, nextSourceText);
      didRewrite = true;
    }
  }

  return didRewrite;
}

function extractNamedImportNames(importClause) {
  const namedImportMatch = importClause.match(/\{([\s\S]*?)\}/);
  if (!namedImportMatch) {
    return [];
  }

  return namedImportMatch[1]
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const aliasSplit = part.split(/\s+as\s+/i);
      return aliasSplit[0].trim();
    })
    .filter(Boolean);
}

function shouldIgnoreImport(importSpecifier) {
  return (
    importSpecifier.startsWith(".") ||
    importSpecifier.startsWith("/") ||
    importSpecifier.startsWith("http:") ||
    importSpecifier.startsWith("https:") ||
    importSpecifier.startsWith("data:") ||
    importSpecifier.startsWith("virtual:") ||
    importSpecifier.startsWith("vite/")
  );
}

function getPackageNameFromImport(importSpecifier) {
  if (knownImportPackageMap.has(importSpecifier)) {
    return knownImportPackageMap.get(importSpecifier);
  }

  for (const [knownPrefix, packageName] of knownImportPackageMap.entries()) {
    if (importSpecifier.startsWith(`${knownPrefix}/`)) {
      return packageName;
    }
  }

  if (importSpecifier.startsWith("@")) {
    const parts = importSpecifier.split("/");
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : importSpecifier;
  }

  return importSpecifier.split("/")[0] || "";
}

function detectPackageManager(rootPath) {
  if (fs.existsSync(path.join(rootPath, "pnpm-lock.yaml"))) {
    return "pnpm";
  }
  if (fs.existsSync(path.join(rootPath, "yarn.lock"))) {
    return "yarn";
  }
  if (fs.existsSync(path.join(rootPath, "bun.lockb")) || fs.existsSync(path.join(rootPath, "bun.lock"))) {
    return "bun";
  }
  return "npm";
}

function detectInstallCommand(rootPath) {
  const packageManager = detectPackageManager(rootPath);
  if (packageManager === "pnpm") {
    return "pnpm install";
  }
  if (packageManager === "yarn") {
    return "yarn install";
  }
  if (packageManager === "bun") {
    return "bun install";
  }
  return "npm install";
}

function sortObjectByKey(inputObject) {
  return Object.fromEntries(Object.entries(inputObject).sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey)));
}

function printHumanResult(result) {
  console.log(`Doctor checked ${result.rootDirectoryPath}`);
  console.log(`Package manager: ${result.packageManager}`);
  console.log(`Install command: ${result.installCommand}`);

  if (result.runtimeStartClassification.status !== "none") {
    console.log("\nRuntime start classification:");
    console.log(`- Status: ${result.runtimeStartClassification.status}`);
    console.log(`- Message: ${result.runtimeStartClassification.message}`);
    if (result.runtimeStartClassification.detectedUrl) {
      console.log(`- Detected URL: ${result.runtimeStartClassification.detectedUrl}`);
    }
    if (result.runtimeStartClassification.shouldOpenPreview) {
      console.log("- Action: reattach or reopen the preview instead of regenerating source.");
    }
  }

  if (result.importRewrites.length > 0) {
    console.log("\nImport rewrites:");
    for (const record of result.importRewrites) {
      console.log(`- ${record.fromImportSpecifier} -> ${record.toImportSpecifier} (${record.sourceFilePath})`);
    }
  }

  if (result.missingKnownPackages.length === 0 && result.unknownPackages.length === 0) {
    console.log(result.importRewrites.length > 0 ? "No missing package declarations beyond import rewrites detected." : "No missing package declarations detected.");
    return;
  }

  if (result.missingKnownPackages.length > 0) {
    console.log("\nMissing known packages:");
    for (const record of result.missingKnownPackages) {
      console.log(`- ${record.importSpecifier} -> ${record.packageName}@${record.version} (${record.sourceFilePath})`);
    }
  }

  if (result.unknownPackages.length > 0) {
    console.log("\nUnknown packages requiring review:");
    for (const record of result.unknownPackages) {
      console.log(`- ${record.importSpecifier} -> ${record.packageName} (${record.sourceFilePath})`);
    }
  }

  if (result.fixedSourceImports) {
    console.log("\nUpdated source imports for known wrong-package references.");
  }

  if (result.fixedPackageJson) {
    console.log("\nUpdated package.json. Run the install command above, then restart the dev server.");
  } else {
    console.log("\nRun again with --fix to add known safe dependency declarations and import rewrites.");
  }
}

function fail(message) {
  console.error(`Doctor failed: ${message}`);
  process.exit(1);
}
