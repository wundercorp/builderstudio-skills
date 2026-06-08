#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const commandLineArguments = process.argv.slice(2);
const rootDirectoryPath = path.resolve(readArgumentValue("--root", "."));
const shouldApplyFixes = commandLineArguments.includes("--fix");
const shouldPrintJson = commandLineArguments.includes("--json");
const shouldUseStrictExit = commandLineArguments.includes("--strict");
const shouldRunAudits = commandLineArguments.includes("--run-audits");
const minimumSeverityName = readArgumentValue("--minimum-severity", "low").toLowerCase();

const severityRankByName = new Map([
  ["info", 0],
  ["low", 1],
  ["moderate", 2],
  ["medium", 2],
  ["high", 3],
  ["critical", 4],
]);

const minimumSeverityRank = severityRankByName.get(minimumSeverityName) ?? 1;

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
  "target",
  "vendor",
  ".venv",
  "venv",
  "env",
  "__pycache__",
]);

const textFileExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".html",
  ".htm",
  ".vue",
  ".svelte",
  ".astro",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".json",
  ".yml",
  ".yaml",
  ".toml",
  ".xml",
  ".gradle",
  ".kts",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".cs",
  ".php",
  ".rb",
]);

const packageManagerLockfileNames = [
  "package-lock.json",
  "npm-shrinkwrap.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
];

const riskyNodePackageNames = new Map([
  ["event-stream", { severity: "critical", message: "This package has a known supply-chain compromise history. Verify it is still required and replace it when possible." }],
  ["flatmap-stream", { severity: "critical", message: "This package is associated with a known supply-chain compromise. Remove or replace it." }],
  ["request", { severity: "moderate", message: "This package is deprecated and commonly appears in vulnerable dependency graphs. Prefer a maintained HTTP client." }],
  ["node-sass", { severity: "moderate", message: "This package is deprecated and often blocks secure dependency upgrades. Prefer sass." }],
  ["gulp-util", { severity: "moderate", message: "This package is deprecated and should be removed from maintained build chains." }],
  ["bower", { severity: "moderate", message: "This package manager is obsolete for modern frontend supply-chain security." }],
]);

const knownNodeMinimumVersions = new Map([
  ["lodash", "4.17.21"],
  ["minimist", "1.2.8"],
  ["serialize-javascript", "6.0.2"],
  ["jquery", "3.5.0"],
  ["moment", "2.29.4"],
  ["node-fetch", "2.6.7"],
  ["tar", "6.2.1"],
  ["cross-spawn", "7.0.5"],
  ["semver", "7.5.2"],
  ["word-wrap", "1.2.4"],
  ["yaml", "2.2.2"],
  ["ws", "8.17.1"],
]);

const knownPythonMinimumVersions = new Map([
  ["django", "4.2.22"],
  ["flask", "2.2.5"],
  ["jinja2", "3.1.4"],
  ["werkzeug", "3.0.3"],
  ["requests", "2.32.0"],
  ["urllib3", "2.2.2"],
  ["pyyaml", "6.0.1"],
  ["cryptography", "42.0.4"],
  ["pillow", "10.3.0"],
  ["sqlalchemy", "1.4.52"],
]);

const findings = [];
const fixes = [];
const auditResults = [];
const fileWriteMap = new Map();

if (fs.existsSync(rootDirectoryPath) === false) {
  addFinding("critical", "root", rootDirectoryPath, "The requested root directory does not exist.", "Pass a valid --root path.");
  finish();
}

const allFilePaths = collectFilePaths(rootDirectoryPath);
const relativePathSet = new Set(allFilePaths.map((filePath) => normalizeRelativePath(filePath)));

checkEnvironmentFiles();
checkPackageJsonFiles();
checkPythonRequirementFiles();
checkPythonProjectFiles();
checkGoFiles();
checkRustFiles();
checkDotnetFiles();
checkJavaFiles();
checkDockerFiles();
checkComposeFiles();
checkGitHubWorkflowFiles();
checkFrontendAndSourceFiles();

if (shouldRunAudits === true) {
  runAvailableAuditCommands();
}

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
    const absoluteEntryPath = path.join(directoryPath, directoryEntry.name);

    if (directoryEntry.isDirectory()) {
      if (ignoredDirectoryNames.has(directoryEntry.name)) {
        continue;
      }

      collectedFilePaths.push(...collectFilePaths(absoluteEntryPath));
      continue;
    }

    if (directoryEntry.isFile()) {
      collectedFilePaths.push(absoluteEntryPath);
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

function checkEnvironmentFiles() {
  for (const filePath of allFilePaths) {
    const fileName = path.basename(filePath).toLowerCase();
    if (fileName === ".env" || fileName.startsWith(".env.")) {
      if (fileName.includes("example") || fileName.includes("sample") || fileName.includes("template")) {
        continue;
      }

      addFinding(
        "critical",
        "secrets",
        normalizeRelativePath(filePath),
        "A private environment file appears to be committed in the scanned tree.",
        "Remove real environment files from the repository, rotate exposed values if they were shared, and keep only safe example files.",
      );
    }
  }
}

function checkPackageJsonFiles() {
  const packageJsonFilePaths = allFilePaths.filter((filePath) => path.basename(filePath) === "package.json");

  for (const packageJsonFilePath of packageJsonFilePaths) {
    const packageDirectoryPath = path.dirname(packageJsonFilePath);
    const packageJsonObject = readJsonFile(packageJsonFilePath, null);
    if (packageJsonObject === null) {
      addFinding("high", "node", normalizeRelativePath(packageJsonFilePath), "package.json could not be parsed.", "Fix JSON syntax before dependency patching.");
      continue;
    }

    checkNodeLockfile(packageJsonFilePath, packageDirectoryPath, packageJsonObject);
    checkNodeAuditScript(packageJsonFilePath, packageDirectoryPath, packageJsonObject);

    const dependencySections = [
      { sectionName: "dependencies", runtime: true },
      { sectionName: "devDependencies", runtime: false },
      { sectionName: "peerDependencies", runtime: true },
      { sectionName: "optionalDependencies", runtime: true },
    ];

    for (const dependencySection of dependencySections) {
      const dependencyMap = readObject(packageJsonObject[dependencySection.sectionName]);
      for (const [dependencyName, dependencyVersionSpecifier] of Object.entries(dependencyMap)) {
        checkNodeDependencySpecifier(packageJsonFilePath, dependencySection.sectionName, dependencyName, String(dependencyVersionSpecifier), dependencySection.runtime);
      }
    }
  }
}

function checkNodeLockfile(packageJsonFilePath, packageDirectoryPath, packageJsonObject) {
  const hasDependencies = Object.keys(readObject(packageJsonObject.dependencies)).length > 0 || Object.keys(readObject(packageJsonObject.devDependencies)).length > 0;
  if (hasDependencies === false) {
    return;
  }

  const lockfileName = detectNodeLockfileName(packageDirectoryPath);
  if (lockfileName.length === 0) {
    addFinding(
      "high",
      "node",
      normalizeRelativePath(packageJsonFilePath),
      "package.json declares dependencies but no package-manager lockfile was found beside it.",
      "Generate and commit the correct lockfile so patched dependency resolutions are deterministic.",
    );
  }
}

function detectNodeLockfileName(packageDirectoryPath) {
  for (const lockfileName of packageManagerLockfileNames) {
    if (fs.existsSync(path.join(packageDirectoryPath, lockfileName))) {
      return lockfileName;
    }
  }

  return "";
}

function detectNodePackageManager(packageDirectoryPath, packageJsonObject) {
  const packageManagerField = typeof packageJsonObject.packageManager === "string" ? packageJsonObject.packageManager : "";

  if (packageManagerField.startsWith("pnpm@")) {
    return "pnpm";
  }

  if (packageManagerField.startsWith("yarn@")) {
    return "yarn";
  }

  if (packageManagerField.startsWith("bun@")) {
    return "bun";
  }

  if (packageManagerField.startsWith("npm@")) {
    return "npm";
  }

  const lockfileName = detectNodeLockfileName(packageDirectoryPath);
  if (lockfileName === "pnpm-lock.yaml") {
    return "pnpm";
  }

  if (lockfileName === "yarn.lock") {
    return "yarn";
  }

  if (lockfileName === "bun.lock" || lockfileName === "bun.lockb") {
    return "bun";
  }

  return "npm";
}

function checkNodeAuditScript(packageJsonFilePath, packageDirectoryPath, packageJsonObject) {
  const scripts = readObject(packageJsonObject.scripts);
  if (typeof scripts["audit:security"] === "string" || typeof scripts.audit === "string") {
    return;
  }

  const packageManagerName = detectNodePackageManager(packageDirectoryPath, packageJsonObject);
  const auditCommand = buildNodeAuditCommand(packageManagerName);

  addFinding(
    "low",
    "node",
    normalizeRelativePath(packageJsonFilePath),
    "No npm script for a repeatable security audit was found.",
    `Add an audit script such as \"audit:security\": \"${auditCommand}\" and run it during patch verification.`,
    true,
  );

  if (shouldApplyFixes === true) {
    const nextPackageJsonObject = cloneJsonObject(packageJsonObject);
    nextPackageJsonObject.scripts = readObject(nextPackageJsonObject.scripts);
    nextPackageJsonObject.scripts["audit:security"] = auditCommand;
    queueFileWrite(packageJsonFilePath, JSON.stringify(nextPackageJsonObject, null, 2) + "\n");
    fixes.push({ file: normalizeRelativePath(packageJsonFilePath), message: `Added audit:security script using ${packageManagerName}.` });
  }
}

function buildNodeAuditCommand(packageManagerName) {
  if (packageManagerName === "pnpm") {
    return "pnpm audit --audit-level high";
  }

  if (packageManagerName === "yarn") {
    return "yarn npm audit --severity high";
  }

  if (packageManagerName === "bun") {
    return "bun audit";
  }

  return "npm audit --audit-level=high";
}

function checkNodeDependencySpecifier(packageJsonFilePath, dependencySectionName, dependencyName, dependencyVersionSpecifier, isRuntimeDependency) {
  const dependencyLocation = `${normalizeRelativePath(packageJsonFilePath)}:${dependencySectionName}.${dependencyName}`;
  const normalizedVersionSpecifier = dependencyVersionSpecifier.trim().toLowerCase();

  if (normalizedVersionSpecifier === "" || normalizedVersionSpecifier === "*" || normalizedVersionSpecifier === "latest" || normalizedVersionSpecifier === "x") {
    addFinding(
      isRuntimeDependency ? "high" : "moderate",
      "node",
      dependencyLocation,
      `Dependency ${dependencyName} uses a floating version specifier (${dependencyVersionSpecifier}).`,
      "Pin or constrain this dependency to a reviewed patched version and refresh the lockfile.",
    );
  }

  if (normalizedVersionSpecifier.startsWith("http://")) {
    addFinding(
      "high",
      "node",
      dependencyLocation,
      `Dependency ${dependencyName} is fetched over plain HTTP.`,
      "Use an HTTPS registry source or a trusted package registry release.",
    );
  }

  if (normalizedVersionSpecifier.includes("git+http://")) {
    addFinding(
      "high",
      "node",
      dependencyLocation,
      `Dependency ${dependencyName} uses a Git transport over plain HTTP.`,
      "Use HTTPS or SSH and pin to a reviewed immutable commit or release tag.",
    );
  }

  if ((normalizedVersionSpecifier.startsWith("git+") || normalizedVersionSpecifier.startsWith("github:")) && normalizedVersionSpecifier.includes("#") === false) {
    addFinding(
      isRuntimeDependency ? "high" : "moderate",
      "node",
      dependencyLocation,
      `Dependency ${dependencyName} uses an unpinned Git source.`,
      "Pin Git dependencies to a reviewed commit SHA or a signed release tag.",
    );
  }

  if (isRuntimeDependency === true && (normalizedVersionSpecifier.startsWith("file:") || normalizedVersionSpecifier.startsWith("link:"))) {
    addFinding(
      "moderate",
      "node",
      dependencyLocation,
      `Runtime dependency ${dependencyName} uses a local path specifier.`,
      "Verify this is an intentional workspace dependency and that production builds can resolve it deterministically.",
    );
  }

  const riskyPackageRecord = riskyNodePackageNames.get(dependencyName.toLowerCase());
  if (riskyPackageRecord) {
    addFinding(
      riskyPackageRecord.severity,
      "node",
      dependencyLocation,
      `${dependencyName}: ${riskyPackageRecord.message}`,
      "Replace, remove, or upgrade the dependency and re-run the scanner.",
    );
  }

  const minimumVersion = knownNodeMinimumVersions.get(dependencyName.toLowerCase());
  if (minimumVersion) {
    const detectedVersion = extractSemverFromSpecifier(dependencyVersionSpecifier);
    if (detectedVersion && compareSemver(detectedVersion, minimumVersion) < 0) {
      addFinding(
        isRuntimeDependency ? "high" : "moderate",
        "node",
        dependencyLocation,
        `${dependencyName} appears below a commonly patched baseline (${detectedVersion} < ${minimumVersion}).`,
        `Update ${dependencyName} to ${minimumVersion} or a newer version allowed by the current advisory and refresh the lockfile.`,
      );
    }
  }
}

function checkPythonRequirementFiles() {
  const requirementFilePaths = allFilePaths.filter((filePath) => {
    const fileName = path.basename(filePath).toLowerCase();
    return fileName === "requirements.txt" || fileName.endsWith("-requirements.txt") || fileName === "requirements-dev.txt";
  });

  for (const requirementFilePath of requirementFilePaths) {
    const fileText = readTextFile(requirementFilePath);
    const lines = fileText.split(/\r?\n/);

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const rawLine = lines[lineIndex];
      const trimmedLine = rawLine.trim();
      if (trimmedLine.length === 0 || trimmedLine.startsWith("#") || trimmedLine.startsWith("-") || trimmedLine.includes("//")) {
        continue;
      }

      const packageNameMatch = trimmedLine.match(/^([A-Za-z0-9_.-]+)/);
      if (!packageNameMatch) {
        continue;
      }

      const packageName = packageNameMatch[1].toLowerCase();
      const lineLocation = `${normalizeRelativePath(requirementFilePath)}:${lineIndex + 1}`;

      if (/^[A-Za-z0-9_.-]+\s*($|#)/.test(trimmedLine) || /^[A-Za-z0-9_.-]+\s*[<>=!~]{1,2}\s*\*?\s*($|#)/.test(trimmedLine)) {
        addFinding(
          "moderate",
          "python",
          lineLocation,
          `Python requirement ${packageName} is not pinned to a deterministic reviewed version.`,
          "Pin or constrain the package to a scanner-approved patched version and regenerate the lockfile if present.",
        );
      }

      const minimumVersion = knownPythonMinimumVersions.get(packageName);
      if (minimumVersion) {
        const exactVersionMatch = trimmedLine.match(/==\s*([0-9]+(?:\.[0-9A-Za-z-]+){0,3})/);
        if (exactVersionMatch && compareSemver(exactVersionMatch[1], minimumVersion) < 0) {
          addFinding(
            "high",
            "python",
            lineLocation,
            `${packageName} appears below a commonly patched baseline (${exactVersionMatch[1]} < ${minimumVersion}).`,
            `Update ${packageName} to ${minimumVersion} or a newer scanner-approved version and rerun pip-audit or the chosen scanner.`,
          );
        }
      }
    }
  }
}

function checkPythonProjectFiles() {
  const pyprojectFilePaths = allFilePaths.filter((filePath) => path.basename(filePath) === "pyproject.toml");

  for (const pyprojectFilePath of pyprojectFilePaths) {
    const pyprojectDirectoryPath = path.dirname(pyprojectFilePath);
    const lockfileExists = fs.existsSync(path.join(pyprojectDirectoryPath, "poetry.lock")) || fs.existsSync(path.join(pyprojectDirectoryPath, "uv.lock")) || fs.existsSync(path.join(pyprojectDirectoryPath, "pdm.lock"));
    if (lockfileExists === false) {
      addFinding(
        "moderate",
        "python",
        normalizeRelativePath(pyprojectFilePath),
        "pyproject.toml exists without a recognized Python lockfile beside it.",
        "Use the project's dependency manager to generate a lockfile so security patches are reproducible.",
      );
    }
  }
}

function checkGoFiles() {
  const goModFilePaths = allFilePaths.filter((filePath) => path.basename(filePath) === "go.mod");

  for (const goModFilePath of goModFilePaths) {
    const goSumFilePath = path.join(path.dirname(goModFilePath), "go.sum");
    if (fs.existsSync(goSumFilePath) === false) {
      addFinding("moderate", "go", normalizeRelativePath(goModFilePath), "go.mod exists without go.sum.", "Run go mod tidy after dependency patching and commit go.sum.");
    }

    addFinding("info", "go", normalizeRelativePath(goModFilePath), "Go module detected.", "Use govulncheck ./... and go list -m -u all during patch verification.");
  }
}

function checkRustFiles() {
  const cargoTomlFilePaths = allFilePaths.filter((filePath) => path.basename(filePath) === "Cargo.toml");

  for (const cargoTomlFilePath of cargoTomlFilePaths) {
    const cargoLockFilePath = path.join(path.dirname(cargoTomlFilePath), "Cargo.lock");
    if (fs.existsSync(cargoLockFilePath) === false) {
      addFinding("moderate", "rust", normalizeRelativePath(cargoTomlFilePath), "Cargo.toml exists without Cargo.lock.", "Commit Cargo.lock for applications and run cargo audit during patch verification.");
    }

    addFinding("info", "rust", normalizeRelativePath(cargoTomlFilePath), "Rust package detected.", "Use cargo audit and targeted cargo update -p commands during patch verification.");
  }
}

function checkDotnetFiles() {
  const dotnetProjectFilePaths = allFilePaths.filter((filePath) => filePath.endsWith(".csproj") || filePath.endsWith(".fsproj") || filePath.endsWith(".vbproj"));

  for (const dotnetProjectFilePath of dotnetProjectFilePaths) {
    addFinding("info", "dotnet", normalizeRelativePath(dotnetProjectFilePath), ".NET project detected.", "Use dotnet list package --vulnerable and targeted dotnet add package updates during patch verification.");
  }
}

function checkJavaFiles() {
  const javaBuildFilePaths = allFilePaths.filter((filePath) => {
    const fileName = path.basename(filePath);
    return fileName === "pom.xml" || fileName === "build.gradle" || fileName === "build.gradle.kts";
  });

  for (const javaBuildFilePath of javaBuildFilePaths) {
    addFinding("info", "jvm", normalizeRelativePath(javaBuildFilePath), "JVM build file detected.", "Use OWASP Dependency-Check, osv-scanner, or the organization's scanner during patch verification.");
  }
}

function checkDockerFiles() {
  const dockerFilePaths = allFilePaths.filter((filePath) => {
    const fileName = path.basename(filePath).toLowerCase();
    return fileName === "dockerfile" || fileName.startsWith("dockerfile.") || fileName === "containerfile" || fileName.startsWith("containerfile.");
  });

  for (const dockerFilePath of dockerFilePaths) {
    const dockerFileText = readTextFile(dockerFilePath);
    const relativeDockerFilePath = normalizeRelativePath(dockerFilePath);
    const dockerDirectoryPath = path.dirname(dockerFilePath);
    checkDockerIgnore(dockerFilePath, dockerDirectoryPath);
    checkDockerBaseImages(relativeDockerFilePath, dockerFileText);
    checkDockerDangerousPatterns(relativeDockerFilePath, dockerFileText);
    checkDockerPackageInstallHygiene(dockerFilePath, dockerFileText);
    checkDockerRuntimeUser(relativeDockerFilePath, dockerFileText);
  }
}

function checkDockerIgnore(dockerFilePath, dockerDirectoryPath) {
  const dockerIgnoreFilePath = path.join(dockerDirectoryPath, ".dockerignore");
  if (fs.existsSync(dockerIgnoreFilePath)) {
    return;
  }

  addFinding(
    "high",
    "docker",
    normalizeRelativePath(dockerFilePath),
    "Docker build context has no .dockerignore beside the Dockerfile.",
    "Add .dockerignore so secrets, dependencies, local databases, logs, caches, and build artifacts do not enter the image build context.",
    true,
  );

  if (shouldApplyFixes === true) {
    const dockerIgnoreText = buildDefaultDockerIgnoreText();
    queueFileWrite(dockerIgnoreFilePath, dockerIgnoreText);
    fixes.push({ file: normalizeRelativePath(dockerIgnoreFilePath), message: "Created a safe baseline .dockerignore." });
  }
}

function buildDefaultDockerIgnoreText() {
  return [
    ".git",
    ".github",
    ".env",
    ".env.*",
    "!.env.example",
    "node_modules",
    "npm-debug.log*",
    "yarn-debug.log*",
    "yarn-error.log*",
    "pnpm-debug.log*",
    "dist",
    "build",
    "coverage",
    ".next/cache",
    ".nuxt",
    ".svelte-kit",
    ".astro",
    ".vite",
    ".turbo",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    ".venv",
    "venv",
    "*.sqlite",
    "*.sqlite3",
    "*.db",
    "*.log",
    "*.pem",
    "*.key",
    ".DS_Store",
    "._*",
    "__MACOSX",
    "",
  ].join("\n");
}

function checkDockerBaseImages(relativeDockerFilePath, dockerFileText) {
  const dockerFileLines = dockerFileText.split(/\r?\n/);

  for (let lineIndex = 0; lineIndex < dockerFileLines.length; lineIndex += 1) {
    const lineText = dockerFileLines[lineIndex];
    const fromMatch = lineText.match(/^\s*FROM\s+([^\s]+)(?:\s+AS\s+\S+)?/i);
    if (!fromMatch) {
      continue;
    }

    const imageReference = fromMatch[1];
    const location = `${relativeDockerFilePath}:${lineIndex + 1}`;

    if (imageReference.includes(":") === false && imageReference.includes("@") === false) {
      addFinding("high", "docker", location, `Base image ${imageReference} has no explicit tag or digest.`, "Use a supported patched tag and consider digest pinning for release builds.");
    }

    if (/:latest(?:@|$)/i.test(imageReference)) {
      addFinding("high", "docker", location, `Base image ${imageReference} uses the floating latest tag.`, "Replace latest with a supported patched version tag and rebuild the image.");
    }

    if (imageReference.includes("@sha256:") === false) {
      addFinding("low", "docker", location, `Base image ${imageReference} is not digest pinned.`, "For high-assurance releases, pin the reviewed image digest after selecting the patched tag.");
    }

    const oldRuntimeReason = getOldRuntimeReason(imageReference);
    if (oldRuntimeReason.length > 0) {
      addFinding("high", "docker", location, oldRuntimeReason, "Move to a supported patched runtime base image and verify the application build and startup.");
    }
  }
}

function getOldRuntimeReason(imageReference) {
  const normalizedImageReference = imageReference.toLowerCase();

  const runtimeRules = [
    { pattern: /(^|\/)node:(8|10|12|14|16)(\D|$)/, message: "Node.js base image appears to use an old unsupported major version." },
    { pattern: /(^|\/)python:(2|3\.6|3\.7|3\.8)(\D|$)/, message: "Python base image appears to use an old unsupported version." },
    { pattern: /(^|\/)ruby:(2\.|3\.0)(\D|$)/, message: "Ruby base image appears to use an old runtime version." },
    { pattern: /(^|\/)php:(5\.|7\.)(\D|$)/, message: "PHP base image appears to use an old runtime version." },
    { pattern: /(^|\/)openjdk:(8|11)(\D|$)/, message: "OpenJDK base image appears to use an old runtime line. Confirm vendor support or move to a supported LTS." },
    { pattern: /(^|\/)golang:(1\.1[0-9]|1\.20)(\D|$)/, message: "Go base image appears to use an old runtime line. Move to a supported patched release if possible." },
  ];

  for (const runtimeRule of runtimeRules) {
    if (runtimeRule.pattern.test(normalizedImageReference)) {
      return runtimeRule.message;
    }
  }

  return "";
}

function checkDockerDangerousPatterns(relativeDockerFilePath, dockerFileText) {
  const dangerousPatterns = [
    { pattern: /curl\s+[^\n|;&]+\|\s*(?:sh|bash|zsh)/i, severity: "high", message: "Dockerfile pipes curl output directly into a shell." },
    { pattern: /wget\s+[^\n|;&]+\|\s*(?:sh|bash|zsh)/i, severity: "high", message: "Dockerfile pipes wget output directly into a shell." },
    { pattern: /^\s*ADD\s+https?:\/\//im, severity: "high", message: "Dockerfile uses remote ADD, which makes builds harder to verify." },
    { pattern: /chmod\s+777/i, severity: "moderate", message: "Dockerfile grants world-writable permissions." },
    { pattern: /--privileged/i, severity: "high", message: "Dockerfile or build command references privileged execution." },
  ];

  for (const dangerousPattern of dangerousPatterns) {
    if (dangerousPattern.pattern.test(dockerFileText)) {
      addFinding(dangerousPattern.severity, "docker", relativeDockerFilePath, dangerousPattern.message, "Pin, verify, remove, or replace the dangerous container build pattern.");
    }
  }
}

function checkDockerPackageInstallHygiene(dockerFilePath, dockerFileText) {
  const relativeDockerFilePath = normalizeRelativePath(dockerFilePath);
  let nextDockerFileText = dockerFileText;
  let changedDockerFileText = false;

  if (/apk\s+add\s+(?![^\n]*--no-cache)/i.test(nextDockerFileText)) {
    addFinding("low", "docker", relativeDockerFilePath, "Dockerfile uses apk add without --no-cache.", "Use apk add --no-cache to avoid retaining package index data in the image.", true);

    if (shouldApplyFixes === true) {
      nextDockerFileText = nextDockerFileText.replace(/apk\s+add\s+/gi, (matchedText) => `${matchedText}--no-cache `);
      changedDockerFileText = true;
    }
  }

  if (/apt-get\s+install\s+-y\s+(?![^\n]*--no-install-recommends)/i.test(nextDockerFileText)) {
    addFinding("low", "docker", relativeDockerFilePath, "Dockerfile uses apt-get install -y without --no-install-recommends.", "Use --no-install-recommends and clean apt lists in the same layer.", true);

    if (shouldApplyFixes === true) {
      nextDockerFileText = nextDockerFileText.replace(/apt-get\s+install\s+-y\s+/gi, (matchedText) => `${matchedText}--no-install-recommends `);
      changedDockerFileText = true;
    }
  }

  if (/apt-get\s+update/i.test(nextDockerFileText) && /rm\s+-rf\s+\/var\/lib\/apt\/lists\/\*/i.test(nextDockerFileText) === false) {
    addFinding("low", "docker", relativeDockerFilePath, "Dockerfile updates apt indexes without removing /var/lib/apt/lists in the same build stage.", "Remove apt lists in the same RUN layer after installation.");
  }

  if (changedDockerFileText === true) {
    queueFileWrite(dockerFilePath, nextDockerFileText);
    fixes.push({ file: relativeDockerFilePath, message: "Tightened simple OS package install hygiene." });
  }
}

function checkDockerRuntimeUser(relativeDockerFilePath, dockerFileText) {
  const nonCommentText = dockerFileText.split(/\r?\n/).filter((lineText) => lineText.trim().startsWith("#") === false).join("\n");
  if (/^\s*USER\s+\S+/im.test(nonCommentText) === false) {
    addFinding("moderate", "docker", relativeDockerFilePath, "Dockerfile does not set a non-root runtime USER.", "Run the final image as a non-root user when the app permits it.");
  }
}

function checkComposeFiles() {
  const composeFilePaths = allFilePaths.filter((filePath) => {
    const fileName = path.basename(filePath).toLowerCase();
    return fileName === "docker-compose.yml" || fileName === "docker-compose.yaml" || fileName === "compose.yml" || fileName === "compose.yaml";
  });

  for (const composeFilePath of composeFilePaths) {
    const composeFileText = readTextFile(composeFilePath);
    const relativeComposeFilePath = normalizeRelativePath(composeFilePath);

    if (/privileged\s*:\s*true/i.test(composeFileText)) {
      addFinding("critical", "docker", relativeComposeFilePath, "Compose file enables privileged containers.", "Remove privileged mode unless absolutely required and replace it with specific capabilities.");
    }

    if (/network_mode\s*:\s*["']?host["']?/i.test(composeFileText)) {
      addFinding("high", "docker", relativeComposeFilePath, "Compose file uses host networking.", "Use bridge networking with explicit ports unless host networking is required and documented.");
    }

    if (/\/var\/run\/docker\.sock/i.test(composeFileText)) {
      addFinding("critical", "docker", relativeComposeFilePath, "Compose file mounts the Docker socket into a container.", "Remove Docker socket mounts or isolate them behind a purpose-built, least-privilege proxy.");
    }

    if (/image\s*:\s*[^\n#]+:latest\b/i.test(composeFileText)) {
      addFinding("high", "docker", relativeComposeFilePath, "Compose file references an image with the floating latest tag.", "Pin the image to a supported patched tag and rebuild or redeploy intentionally.");
    }
  }
}

function checkGitHubWorkflowFiles() {
  const workflowFilePaths = allFilePaths.filter((filePath) => normalizeRelativePath(filePath).startsWith(".github/workflows/") && /\.ya?ml$/i.test(filePath));

  for (const workflowFilePath of workflowFilePaths) {
    const workflowFileText = readTextFile(workflowFilePath);
    const relativeWorkflowFilePath = normalizeRelativePath(workflowFilePath);
    const workflowLines = workflowFileText.split(/\r?\n/);

    for (let lineIndex = 0; lineIndex < workflowLines.length; lineIndex += 1) {
      const workflowLine = workflowLines[lineIndex];
      const actionUseMatch = workflowLine.match(/uses\s*:\s*([^\s#]+)/i);
      if (!actionUseMatch) {
        continue;
      }

      const actionReference = actionUseMatch[1].replace(/["']/g, "");
      if (actionReference.startsWith("./") || actionReference.startsWith("docker://")) {
        continue;
      }

      const actionVersion = actionReference.split("@")[1] || "";
      if (/^[a-f0-9]{40}$/i.test(actionVersion) === false) {
        addFinding(
          "moderate",
          "ci",
          `${relativeWorkflowFilePath}:${lineIndex + 1}`,
          `GitHub Action ${actionReference} is not pinned to a full commit SHA.`,
          "Pin third-party actions to reviewed commit SHAs or enforce an organization policy for trusted version tags.",
        );
      }
    }

    if (/pull_request_target\s*:/i.test(workflowFileText) && /actions\/checkout/i.test(workflowFileText)) {
      addFinding(
        "high",
        "ci",
        relativeWorkflowFilePath,
        "Workflow uses pull_request_target and checks out code, which can be dangerous for untrusted forks.",
        "Avoid executing untrusted pull request code with privileged tokens. Split labeling/commenting workflows from build workflows.",
      );
    }

    if (/curl\s+[^\n|;&]+\|\s*(?:sh|bash|zsh)/i.test(workflowFileText) || /wget\s+[^\n|;&]+\|\s*(?:sh|bash|zsh)/i.test(workflowFileText)) {
      addFinding("high", "ci", relativeWorkflowFilePath, "Workflow pipes a remote download into a shell.", "Pin and verify downloaded tools or use trusted package-manager installation methods.");
    }
  }
}

function checkFrontendAndSourceFiles() {
  for (const filePath of allFilePaths) {
    const fileExtension = path.extname(filePath).toLowerCase();
    if (textFileExtensions.has(fileExtension) === false && isExtensionlessKnownTextFile(filePath) === false) {
      continue;
    }

    const fileStats = safeStat(filePath);
    if (!fileStats || fileStats.size > 1024 * 1024) {
      continue;
    }

    const fileText = readTextFile(filePath);
    if (fileText.includes("\u0000")) {
      continue;
    }

    const relativeFilePath = normalizeRelativePath(filePath);
    checkInsecureExternalReferences(relativeFilePath, fileText);
    checkDangerousJavaScriptPatterns(relativeFilePath, fileText);
    checkCorsPatterns(relativeFilePath, fileText);
  }
}

function isExtensionlessKnownTextFile(filePath) {
  const fileName = path.basename(filePath).toLowerCase();
  return fileName === "dockerfile" || fileName === "containerfile" || fileName === "makefile" || fileName === "procfile";
}

function checkInsecureExternalReferences(relativeFilePath, fileText) {
  const insecureScriptMatches = fileText.match(/<script[^>]+src=["']http:\/\//gi) || [];
  if (insecureScriptMatches.length > 0) {
    addFinding("high", "frontend", relativeFilePath, "HTML references scripts over plain HTTP.", "Use HTTPS sources or bundle trusted dependencies through the project package manager.");
  }

  const insecureStylesheetMatches = fileText.match(/<link[^>]+href=["']http:\/\//gi) || [];
  if (insecureStylesheetMatches.length > 0) {
    addFinding("high", "frontend", relativeFilePath, "HTML references stylesheets over plain HTTP.", "Use HTTPS sources or local reviewed assets.");
  }

  const externalScriptMatches = fileText.match(/<script[^>]+src=["']https:\/\/[^"']+["'][^>]*>/gi) || [];
  for (const externalScriptMatch of externalScriptMatches) {
    if (/\sintegrity=/i.test(externalScriptMatch) === false) {
      addFinding("moderate", "frontend", relativeFilePath, "External HTTPS script is missing an integrity attribute.", "Prefer package-managed dependencies or add Subresource Integrity and crossorigin attributes for fixed CDN assets.");
      break;
    }
  }
}

function checkDangerousJavaScriptPatterns(relativeFilePath, fileText) {
  const dangerousPatternRecords = [
    { pattern: /\beval\s*\(/, severity: "high", message: "Source uses eval, which can convert injection bugs into code execution." },
    { pattern: /new\s+Function\s*\(/, severity: "high", message: "Source uses new Function, which can execute attacker-controlled strings if input reaches it." },
    { pattern: /dangerouslySetInnerHTML\s*=|v-html\s*=|innerHTML\s*=/, severity: "high", message: "Source contains direct HTML injection patterns that require strict sanitization review." },
    { pattern: /document\.write\s*\(/, severity: "moderate", message: "Source uses document.write, which can introduce injection and loading risks." },
    { pattern: /yaml\.load\s*\(/i, severity: "high", message: "Source appears to use unsafe YAML loading." },
  ];

  for (const dangerousPatternRecord of dangerousPatternRecords) {
    if (dangerousPatternRecord.pattern.test(fileText)) {
      addFinding(dangerousPatternRecord.severity, "code", relativeFilePath, dangerousPatternRecord.message, "Replace with a safer API or prove the input is trusted and sanitized.");
    }
  }
}

function checkCorsPatterns(relativeFilePath, fileText) {
  if (/Access-Control-Allow-Origin["'`]?\s*[:,]\s*["'`]\*/i.test(fileText) && /Access-Control-Allow-Credentials["'`]?\s*[:,]\s*["'`]true/i.test(fileText)) {
    addFinding("high", "backend", relativeFilePath, "CORS appears to allow wildcard origins with credentials.", "Use an explicit origin allowlist when credentials are enabled.");
  }

  if (/cors\s*\(\s*\{[^}]*origin\s*:\s*["'`]\*/is.test(fileText) && /credentials\s*:\s*true/i.test(fileText)) {
    addFinding("high", "backend", relativeFilePath, "CORS middleware appears to allow wildcard origins with credentials.", "Use an explicit origin allowlist when credentials are enabled.");
  }
}

function runAvailableAuditCommands() {
  const packageJsonFilePaths = allFilePaths.filter((filePath) => path.basename(filePath) === "package.json");
  for (const packageJsonFilePath of packageJsonFilePaths) {
    const packageDirectoryPath = path.dirname(packageJsonFilePath);
    const packageJsonObject = readJsonFile(packageJsonFilePath, {});
    const packageManagerName = detectNodePackageManager(packageDirectoryPath, packageJsonObject);
    const auditCommandParts = getNodeAuditCommandParts(packageManagerName);
    runAuditCommand(packageDirectoryPath, auditCommandParts.command, auditCommandParts.args, `Node ${packageManagerName} audit`);
  }

  const requirementsFilePaths = allFilePaths.filter((filePath) => path.basename(filePath).toLowerCase().includes("requirements") && filePath.endsWith(".txt"));
  if (requirementsFilePaths.length > 0 && commandExists("pip-audit")) {
    runAuditCommand(rootDirectoryPath, "pip-audit", ["--progress-spinner", "off"], "pip-audit");
  } else if (requirementsFilePaths.length > 0) {
    auditResults.push({ label: "pip-audit", status: "skipped", message: "pip-audit is not installed." });
  }

  if (allFilePaths.some((filePath) => path.basename(filePath) === "go.mod") && commandExists("govulncheck")) {
    runAuditCommand(rootDirectoryPath, "govulncheck", ["./..."], "govulncheck");
  } else if (allFilePaths.some((filePath) => path.basename(filePath) === "go.mod")) {
    auditResults.push({ label: "govulncheck", status: "skipped", message: "govulncheck is not installed." });
  }

  if (allFilePaths.some((filePath) => path.basename(filePath) === "Cargo.toml") && commandExists("cargo")) {
    runAuditCommand(rootDirectoryPath, "cargo", ["audit"], "cargo audit");
  }

  if (allFilePaths.some((filePath) => isDockerFileName(path.basename(filePath))) && commandExists("trivy")) {
    runAuditCommand(rootDirectoryPath, "trivy", ["fs", "."], "trivy fs");
  } else if (allFilePaths.some((filePath) => isDockerFileName(path.basename(filePath)))) {
    auditResults.push({ label: "trivy fs", status: "skipped", message: "trivy is not installed." });
  }

  if (commandExists("osv-scanner")) {
    runAuditCommand(rootDirectoryPath, "osv-scanner", ["--recursive", "."], "osv-scanner");
  }
}

function getNodeAuditCommandParts(packageManagerName) {
  if (packageManagerName === "pnpm") {
    return { command: "pnpm", args: ["audit", "--audit-level", "high"] };
  }

  if (packageManagerName === "yarn") {
    return { command: "yarn", args: ["npm", "audit", "--severity", "high"] };
  }

  if (packageManagerName === "bun") {
    return { command: "bun", args: ["audit"] };
  }

  return { command: "npm", args: ["audit", "--audit-level=high"] };
}

function runAuditCommand(workingDirectoryPath, commandName, commandArguments, label) {
  if (commandExists(commandName) === false) {
    auditResults.push({ label, status: "skipped", message: `${commandName} is not installed.` });
    return;
  }

  const commandResult = spawnSync(commandName, commandArguments, {
    cwd: workingDirectoryPath,
    encoding: "utf8",
    timeout: 120000,
    maxBuffer: 1024 * 1024 * 8,
  });

  const status = commandResult.status === 0 ? "passed" : "failed";
  const outputText = `${commandResult.stdout || ""}${commandResult.stderr || ""}`.trim();
  auditResults.push({
    label,
    status,
    directory: path.relative(rootDirectoryPath, workingDirectoryPath).split(path.sep).join("/") || ".",
    exitCode: commandResult.status,
    message: outputText.slice(0, 4000),
  });

  if (status === "failed") {
    addFinding("high", "audit", path.relative(rootDirectoryPath, workingDirectoryPath).split(path.sep).join("/") || ".", `${label} reported issues or failed.`, "Review the audit output, patch the reported components, and rerun the scanner.");
  }
}

function commandExists(commandName) {
  const commandResult = spawnSync(process.platform === "win32" ? "where" : "command", process.platform === "win32" ? [commandName] : ["-v", commandName], {
    encoding: "utf8",
    shell: process.platform !== "win32",
  });

  return commandResult.status === 0;
}

function applyQueuedFixes() {
  if (shouldApplyFixes === false) {
    return;
  }

  for (const [filePath, fileText] of fileWriteMap.entries()) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, fileText);
  }
}

function queueFileWrite(filePath, fileText) {
  fileWriteMap.set(filePath, fileText);
}

function addFinding(severityName, categoryName, location, message, recommendation, fixable = false) {
  const normalizedSeverityName = severityName === "medium" ? "moderate" : severityName;
  const severityRank = severityRankByName.get(normalizedSeverityName) ?? 0;
  if (severityRank < minimumSeverityRank) {
    return;
  }

  findings.push({
    severity: normalizedSeverityName,
    category: categoryName,
    location,
    message,
    recommendation,
    fixable,
  });
}

function finish() {
  findings.sort((leftFinding, rightFinding) => {
    const rightRank = severityRankByName.get(rightFinding.severity) ?? 0;
    const leftRank = severityRankByName.get(leftFinding.severity) ?? 0;
    if (rightRank !== leftRank) {
      return rightRank - leftRank;
    }

    return `${leftFinding.category}:${leftFinding.location}`.localeCompare(`${rightFinding.category}:${rightFinding.location}`);
  });

  if (shouldPrintJson === true) {
    console.log(JSON.stringify({ root: rootDirectoryPath, findings, fixes, audits: auditResults }, null, 2));
  } else {
    printHumanReport();
  }

  const highestSeverityRank = findings.reduce((currentHighestRank, finding) => Math.max(currentHighestRank, severityRankByName.get(finding.severity) ?? 0), 0);
  if (shouldUseStrictExit === true && highestSeverityRank >= 3) {
    process.exit(1);
  }

  process.exit(0);
}

function printHumanReport() {
  if (findings.length === 0) {
    console.log("Patcher found no baseline vulnerability hygiene findings in the scanned files.");
  } else {
    console.log(`Patcher found ${findings.length} baseline finding(s).`);
    console.log("");

    for (const finding of findings) {
      const fixableText = finding.fixable ? " fixable" : "";
      console.log(`[${finding.severity.toUpperCase()}] ${finding.category}${fixableText}: ${finding.location}`);
      console.log(`  ${finding.message}`);
      console.log(`  Recommendation: ${finding.recommendation}`);
      console.log("");
    }
  }

  if (auditResults.length > 0) {
    console.log("Audit command results:");
    for (const auditResult of auditResults) {
      const directoryText = auditResult.directory ? ` (${auditResult.directory})` : "";
      console.log(`- ${auditResult.label}${directoryText}: ${auditResult.status}`);
      if (auditResult.message) {
        const indentedMessage = auditResult.message.split(/\r?\n/).slice(0, 30).map((lineText) => `  ${lineText}`).join("\n");
        console.log(indentedMessage);
      }
    }
    console.log("");
  }

  if (shouldApplyFixes === true) {
    if (fixes.length === 0) {
      console.log("No safe mechanical fixes were applied.");
    } else {
      console.log(`Applied ${fixes.length} safe mechanical fix(es):`);
      for (const fix of fixes) {
        console.log(`- ${fix.file}: ${fix.message}`);
      }
    }
  } else {
    const fixableFindingCount = findings.filter((finding) => finding.fixable).length;
    if (fixableFindingCount > 0) {
      console.log(`Run again with --fix to apply ${fixableFindingCount} conservative mechanical fix(es).`);
    }
  }
}

function readJsonFile(filePath, fallbackValue) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallbackValue;
  }
}

function readTextFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function readObject(value) {
  if (value && typeof value === "object" && Array.isArray(value) === false) {
    return value;
  }

  return {};
}

function cloneJsonObject(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeRelativePath(filePath) {
  return path.relative(rootDirectoryPath, filePath).split(path.sep).join("/") || ".";
}

function safeStat(filePath) {
  try {
    return fs.statSync(filePath);
  } catch {
    return null;
  }
}

function extractSemverFromSpecifier(versionSpecifier) {
  const versionMatch = String(versionSpecifier).match(/([0-9]+)\.([0-9]+)\.([0-9]+)(?:[-+][0-9A-Za-z.-]+)?/);
  if (!versionMatch) {
    return null;
  }

  return `${versionMatch[1]}.${versionMatch[2]}.${versionMatch[3]}`;
}

function compareSemver(leftVersion, rightVersion) {
  const leftParts = parseSemverParts(leftVersion);
  const rightParts = parseSemverParts(rightVersion);

  for (let partIndex = 0; partIndex < 3; partIndex += 1) {
    if (leftParts[partIndex] < rightParts[partIndex]) {
      return -1;
    }

    if (leftParts[partIndex] > rightParts[partIndex]) {
      return 1;
    }
  }

  return 0;
}

function parseSemverParts(versionText) {
  const versionParts = String(versionText).split(".").map((versionPart) => {
    const parsedPart = Number.parseInt(versionPart.replace(/[^0-9].*$/, ""), 10);
    if (Number.isNaN(parsedPart)) {
      return 0;
    }

    return parsedPart;
  });

  while (versionParts.length < 3) {
    versionParts.push(0);
  }

  return versionParts.slice(0, 3);
}

function isDockerFileName(fileName) {
  const normalizedFileName = fileName.toLowerCase();
  return normalizedFileName === "dockerfile" || normalizedFileName.startsWith("dockerfile.") || normalizedFileName === "containerfile" || normalizedFileName.startsWith("containerfile.");
}
