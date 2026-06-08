#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const commandLineArguments = process.argv.slice(2);
const rootDirectoryPath = path.resolve(readArgumentValue("--root", "."));
const outputArgumentValue = readArgumentValue("--output", "ARCHITECTURE.md");
const outputFilePath = path.isAbsolute(outputArgumentValue) ? outputArgumentValue : path.resolve(rootDirectoryPath, outputArgumentValue);
const requestedFeatureName = readArgumentValue("--feature", "").trim();
const requestedMaxDepth = Number.parseInt(readArgumentValue("--max-depth", "4"), 10);
const directoryTreeMaxDepth = Number.isFinite(requestedMaxDepth) && requestedMaxDepth > 0 ? requestedMaxDepth : 4;
const shouldPrintToStdout = commandLineArguments.includes("--stdout");
const shouldUseCompactOutput = commandLineArguments.includes("--compact");
const shouldSkipWritingExistingFile = commandLineArguments.includes("--no-overwrite");

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
  ".pytest_cache",
  ".mypy_cache",
  ".ruff_cache",
  "__pycache__",
  "dist",
  "build",
  "out",
  "coverage",
  "generated",
  "generated-repositories",
  "target",
  "vendor",
  ".venv",
  "venv",
  "env",
  ".vercel",
  ".netlify",
]);

const ignoredFileNames = new Set([
  ".DS_Store",
  "Thumbs.db",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lockb",
  "poetry.lock",
  "Pipfile.lock",
  "Cargo.lock",
  "go.sum",
]);

const sourceFileExtensions = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".vue",
  ".svelte",
  ".astro",
  ".py",
  ".go",
  ".rs",
  ".java",
  ".kt",
  ".cs",
  ".php",
  ".rb",
  ".swift",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".html",
  ".md",
  ".json",
  ".yaml",
  ".yml",
  ".toml",
  ".xml",
  ".sql",
  ".graphql",
  ".gql",
]);

const importantFileNames = new Set([
  "package.json",
  "tsconfig.json",
  "jsconfig.json",
  "vite.config.js",
  "vite.config.ts",
  "next.config.js",
  "next.config.mjs",
  "next.config.ts",
  "nuxt.config.js",
  "nuxt.config.ts",
  "astro.config.mjs",
  "svelte.config.js",
  "angular.json",
  "remix.config.js",
  "tailwind.config.js",
  "tailwind.config.ts",
  "postcss.config.js",
  "webpack.config.js",
  "rollup.config.js",
  "eslint.config.js",
  "pyproject.toml",
  "requirements.txt",
  "Pipfile",
  "manage.py",
  "go.mod",
  "Cargo.toml",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "settings.gradle",
  "settings.gradle.kts",
  "Dockerfile",
  "Containerfile",
  "docker-compose.yml",
  "compose.yml",
  "Procfile",
  "README.md",
  "ARCHITECTURE.md",
]);

main();

function main() {
  if (fs.existsSync(rootDirectoryPath) === false || fs.statSync(rootDirectoryPath).isDirectory() === false) {
    failWithMessage(`Root directory does not exist: ${rootDirectoryPath}`);
  }

  if (fs.existsSync(outputFilePath) === true && shouldSkipWritingExistingFile === true && shouldPrintToStdout === false) {
    failWithMessage(`Output file already exists and --no-overwrite was provided: ${outputFilePath}`);
  }

  const projectInspection = inspectProject(rootDirectoryPath, requestedFeatureName);
  const architectureMarkdown = buildArchitectureMarkdown(projectInspection);

  if (shouldPrintToStdout === true) {
    console.log(architectureMarkdown);
    return;
  }

  fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
  fs.writeFileSync(outputFilePath, architectureMarkdown);
  console.log(`Architecture document written: ${path.relative(process.cwd(), outputFilePath) || outputFilePath}`);
}

function inspectProject(projectRootDirectoryPath, featureName) {
  const relativeFilePaths = collectProjectFilePaths(projectRootDirectoryPath);
  const packageJson = readPackageJson(projectRootDirectoryPath);
  const dependencyNames = collectDependencyNames(packageJson);
  const detectedPackageManager = detectPackageManager(projectRootDirectoryPath);
  const detectedLanguages = detectLanguages(relativeFilePaths);
  const detectedFrameworks = detectFrameworks(projectRootDirectoryPath, dependencyNames, relativeFilePaths);
  const detectedEntryPoints = detectEntryPoints(projectRootDirectoryPath, packageJson, relativeFilePaths);
  const detectedRunCommands = detectRunCommands(projectRootDirectoryPath, packageJson, detectedPackageManager);
  const detectedImportantFiles = detectImportantFiles(relativeFilePaths);
  const detectedFeatureFiles = detectFeatureFiles(relativeFilePaths, featureName);
  const detectedIntegrationFiles = detectIntegrationFiles(relativeFilePaths);
  const directoryTreeText = buildDirectoryTree(projectRootDirectoryPath, directoryTreeMaxDepth, featureName);
  const dependencyGroups = buildDependencyGroups(packageJson);

  return {
    projectName: packageJson?.name || path.basename(projectRootDirectoryPath),
    rootDirectoryPath: projectRootDirectoryPath,
    featureName,
    relativeFilePaths,
    packageJson,
    dependencyNames,
    detectedPackageManager,
    detectedLanguages,
    detectedFrameworks,
    detectedEntryPoints,
    detectedRunCommands,
    detectedImportantFiles,
    detectedFeatureFiles,
    detectedIntegrationFiles,
    directoryTreeText,
    dependencyGroups,
  };
}

function buildArchitectureMarkdown(projectInspection) {
  const generatedAtIsoString = new Date().toISOString();
  const scopeText = projectInspection.featureName.length > 0 ? `Feature scope: ${projectInspection.featureName}` : "Project scope: full repository";
  const frameworkText = projectInspection.detectedFrameworks.length > 0 ? projectInspection.detectedFrameworks.join(", ") : "Not detected from local files";
  const languageText = projectInspection.detectedLanguages.length > 0 ? projectInspection.detectedLanguages.join(", ") : "Not detected from local files";
  const packageManagerText = projectInspection.detectedPackageManager || "Not detected";
  const runCommandRows = projectInspection.detectedRunCommands.length > 0
    ? projectInspection.detectedRunCommands.map((runCommand) => `| ${escapeMarkdownTableCell(runCommand.name)} | \`${escapeBackticks(runCommand.command)}\` | ${escapeMarkdownTableCell(runCommand.source)} |`).join("\n")
    : "| Not detected | Not detected | No supported run command file was found |";
  const entryPointRows = projectInspection.detectedEntryPoints.length > 0
    ? projectInspection.detectedEntryPoints.map((entryPoint) => `| \`${entryPoint.path}\` | ${escapeMarkdownTableCell(entryPoint.reason)} |`).join("\n")
    : "| Not detected | No obvious entry point was found from supported conventions |";
  const importantFileRows = projectInspection.detectedImportantFiles.length > 0
    ? projectInspection.detectedImportantFiles.slice(0, shouldUseCompactOutput ? 16 : 40).map((filePath) => `| \`${filePath}\` | ${escapeMarkdownTableCell(describeImportantFile(filePath))} |`).join("\n")
    : "| Not detected | No common architecture files were found |";
  const integrationRows = projectInspection.detectedIntegrationFiles.length > 0
    ? projectInspection.detectedIntegrationFiles.slice(0, shouldUseCompactOutput ? 12 : 32).map((filePath) => `| \`${filePath}\` | ${escapeMarkdownTableCell(describeIntegrationFile(filePath))} |`).join("\n")
    : "| Not detected | No obvious integration files were found |";
  const featureSection = buildFeatureSection(projectInspection);
  const dependencySection = buildDependencySection(projectInspection);
  const implementationFlowSection = buildImplementationFlowSection(projectInspection);
  const verificationSection = buildVerificationSection(projectInspection);

  return [
    `# ${projectInspection.projectName} Architecture`,
    "",
    `Generated by Mimar on ${generatedAtIsoString}.`,
    "",
    `Scope: ${scopeText}.`,
    "",
    "## Summary",
    "",
    `This document describes the current architecture detected from the repository at \`${path.basename(projectInspection.rootDirectoryPath)}\`. It should be updated whenever entry points, directories, feature boundaries, dependencies, data flow, or deployment wiring change.`,
    "",
    "## Detected stack",
    "",
    `- Package manager: ${packageManagerText}`,
    `- Frameworks and platforms: ${frameworkText}`,
    `- Languages and file types: ${languageText}`,
    `- Repository files scanned: ${projectInspection.relativeFilePaths.length}`,
    "",
    "## System overview diagram",
    "",
    "```mermaid",
    buildMermaidDiagram(projectInspection),
    "```",
    "",
    "## Directory structure",
    "",
    "```text",
    projectInspection.directoryTreeText,
    "```",
    "",
    "## Entry points and run commands",
    "",
    "### Run commands",
    "",
    "| Name | Command | Source |",
    "| --- | --- | --- |",
    runCommandRows,
    "",
    "### Entry points",
    "",
    "| File | Why it matters |",
    "| --- | --- | --- |",
    entryPointRows,
    "",
    implementationFlowSection,
    "",
    "## Important files and responsibilities",
    "",
    "| File | Responsibility |",
    "| --- | --- | --- |",
    importantFileRows,
    "",
    dependencySection,
    "",
    "## Integrations and external boundaries",
    "",
    "| File | Boundary indicated |",
    "| --- | --- | --- |",
    integrationRows,
    "",
    featureSection,
    "",
    "## Build, test, run, and deployment notes",
    "",
    verificationSection,
    "",
    "## Safe extension guidance",
    "",
    "- Start changes from the documented entry point and follow the flow into the smallest relevant feature or service directory.",
    "- Keep new files near the feature boundary they belong to instead of creating unrelated top-level folders.",
    "- Update this document when a change adds a route, command, service, data store, environment variable, dependency, deployment target, or directory convention.",
    "- Prefer adding precise feature subsections over rewriting the whole document when only one feature changes.",
    "",
    "## Known gaps and assumptions",
    "",
    "- This document was generated from static local file inspection.",
    "- Runtime-only behavior, private services, generated routes, and environment-specific infrastructure may need manual confirmation.",
    "- If a section says something was not detected, it means no matching local file pattern was found during generation.",
    "",
  ].join("\n");
}

function buildMermaidDiagram(projectInspection) {
  const hasPackageScripts = projectInspection.detectedRunCommands.length > 0;
  const hasEntryPoints = projectInspection.detectedEntryPoints.length > 0;
  const hasFeatureScope = projectInspection.featureName.length > 0;
  const hasIntegrations = projectInspection.detectedIntegrationFiles.length > 0;
  const frameworkLabel = projectInspection.detectedFrameworks[0] || "Application";
  const featureLabel = hasFeatureScope ? sanitizeMermaidLabel(projectInspection.featureName) : "Feature modules";

  const lines = [
    "flowchart TD",
    `  Caller[Developer, user, or caller] --> Runtime[${hasPackageScripts ? "Run command" : "Runtime entry"}]`,
  ];

  if (hasEntryPoints === true) {
    lines.push(`  Runtime --> Entry[${sanitizeMermaidLabel(projectInspection.detectedEntryPoints[0].path)}]`);
  } else {
    lines.push("  Runtime --> Entry[Entry point not detected]");
  }

  lines.push(`  Entry --> App[${sanitizeMermaidLabel(frameworkLabel)} shell]`);
  lines.push(`  App --> Feature[${featureLabel}]`);

  if (hasIntegrations === true) {
    lines.push("  Feature --> Integration[Services, data, or external boundaries]");
    lines.push("  Integration --> Result[Rendered UI, response, artifact, or side effect]");
  } else {
    lines.push("  Feature --> Result[Rendered UI, response, artifact, or side effect]");
  }

  return lines.join("\n");
}

function buildFeatureSection(projectInspection) {
  if (projectInspection.featureName.length === 0) {
    return [
      "## Feature architecture",
      "",
      "No specific feature name was provided. Use `--feature <name>` to generate a feature-focused file list and flow section.",
    ].join("\n");
  }

  const featureFileRows = projectInspection.detectedFeatureFiles.length > 0
    ? projectInspection.detectedFeatureFiles.slice(0, shouldUseCompactOutput ? 20 : 60).map((filePath) => `| \`${filePath}\` | ${escapeMarkdownTableCell(describeFeatureFile(filePath, projectInspection.featureName))} |`).join("\n")
    : "| Not detected | No file paths strongly matched the requested feature name |";

  return [
    "## Feature architecture",
    "",
    `Requested feature: **${projectInspection.featureName}**`,
    "",
    "```mermaid",
    "flowchart TD",
    "  Trigger[User action, route, command, or event] --> FeatureEntry[Feature entry point]",
    "  FeatureEntry --> FeatureImplementation[Feature implementation files]",
    "  FeatureImplementation --> SharedCode[Shared components, utilities, or services]",
    "  SharedCode --> Boundary[Data, API, filesystem, or external boundary]",
    "  Boundary --> Outcome[Response, rendered UI, generated file, or side effect]",
    "```",
    "",
    "| File | Feature responsibility |",
    "| --- | --- |",
    featureFileRows,
    "",
    "Feature flow should be refined with code-specific details after reading the matched files.",
  ].join("\n");
}

function buildDependencySection(projectInspection) {
  if (projectInspection.packageJson === null) {
    return [
      "## Dependency and integration map",
      "",
      "No `package.json` was found. Dependency architecture should be documented from the project's language-specific manifest files.",
    ].join("\n");
  }

  const dependencyGroupLines = [];
  for (const dependencyGroup of projectInspection.dependencyGroups) {
    if (dependencyGroup.dependencies.length === 0) {
      continue;
    }

    dependencyGroupLines.push(`- ${dependencyGroup.name}: ${dependencyGroup.dependencies.slice(0, 18).map((dependencyName) => `\`${dependencyName}\``).join(", ")}`);
  }

  if (dependencyGroupLines.length === 0) {
    dependencyGroupLines.push("- No runtime or development dependencies were declared in `package.json`.");
  }

  return [
    "## Dependency and integration map",
    "",
    ...dependencyGroupLines,
    "",
    "Document dependency direction in code-specific terms when manually refining this file. For example: UI components should call feature services, feature services should call API clients, and API clients should isolate external protocols.",
  ].join("\n");
}

function buildImplementationFlowSection(projectInspection) {
  const flowLines = [];

  if (projectInspection.detectedRunCommands.length > 0) {
    flowLines.push(`1. The likely development path starts with \`${projectInspection.detectedRunCommands[0].command}\`.`);
  } else {
    flowLines.push("1. No explicit run command was detected. Confirm the intended runtime command manually.");
  }

  if (projectInspection.detectedEntryPoints.length > 0) {
    flowLines.push(`2. Execution reaches \`${projectInspection.detectedEntryPoints[0].path}\`, which appears to be the primary detected entry point.`);
  } else {
    flowLines.push("2. No primary entry point was detected from common conventions.");
  }

  if (projectInspection.detectedFrameworks.length > 0) {
    flowLines.push(`3. The implementation is organized around ${projectInspection.detectedFrameworks.join(", ")}.`);
  } else {
    flowLines.push("3. Framework organization was not detected from known file or dependency patterns.");
  }

  if (projectInspection.featureName.length > 0) {
    flowLines.push(`4. The requested feature boundary is \`${projectInspection.featureName}\`; matched files are listed in the feature architecture section.`);
  } else {
    flowLines.push("4. Feature-specific flow should be added when a feature scope is selected.");
  }

  if (projectInspection.detectedIntegrationFiles.length > 0) {
    flowLines.push("5. Integration boundaries are indicated by the files listed under integrations and external boundaries.");
  } else {
    flowLines.push("5. No obvious integration boundary files were detected during static inspection.");
  }

  return [
    "## Main implementation flow",
    "",
    ...flowLines,
  ].join("\n");
}

function buildVerificationSection(projectInspection) {
  const commandLines = [];

  for (const runCommand of projectInspection.detectedRunCommands) {
    if (["test", "typecheck", "lint", "build", "dev", "start"].some((keyword) => runCommand.name.toLowerCase().includes(keyword))) {
      commandLines.push(`- \`${runCommand.command}\``);
    }
  }

  if (commandLines.length === 0 && projectInspection.detectedPackageManager) {
    commandLines.push(`- Install dependencies with the detected package manager: \`${projectInspection.detectedPackageManager} install\``);
  }

  if (commandLines.length === 0) {
    commandLines.push("- Confirm the project's documented install, build, test, and run commands manually.");
  }

  return [
    "Use the strongest available verification commands after architecture-affecting changes:",
    "",
    ...commandLines.slice(0, 12),
    "",
    "If Docker, compose, CI, deployment, database, or environment files change, add those verification steps to this section.",
  ].join("\n");
}

function detectPackageManager(projectRootDirectoryPath) {
  if (fs.existsSync(path.join(projectRootDirectoryPath, "pnpm-lock.yaml")) === true) {
    return "pnpm";
  }

  if (fs.existsSync(path.join(projectRootDirectoryPath, "yarn.lock")) === true) {
    return "yarn";
  }

  if (fs.existsSync(path.join(projectRootDirectoryPath, "bun.lockb")) === true || fs.existsSync(path.join(projectRootDirectoryPath, "bun.lock")) === true) {
    return "bun";
  }

  if (fs.existsSync(path.join(projectRootDirectoryPath, "package-lock.json")) === true) {
    return "npm";
  }

  if (fs.existsSync(path.join(projectRootDirectoryPath, "package.json")) === true) {
    return "npm";
  }

  if (fs.existsSync(path.join(projectRootDirectoryPath, "pyproject.toml")) === true) {
    return "python";
  }

  if (fs.existsSync(path.join(projectRootDirectoryPath, "go.mod")) === true) {
    return "go";
  }

  if (fs.existsSync(path.join(projectRootDirectoryPath, "Cargo.toml")) === true) {
    return "cargo";
  }

  return "";
}

function readPackageJson(projectRootDirectoryPath) {
  const packageJsonFilePath = path.join(projectRootDirectoryPath, "package.json");
  if (fs.existsSync(packageJsonFilePath) === false) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(packageJsonFilePath, "utf8"));
  } catch (error) {
    return null;
  }
}

function collectDependencyNames(packageJson) {
  if (packageJson === null) {
    return new Set();
  }

  return new Set([
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.devDependencies || {}),
    ...Object.keys(packageJson.peerDependencies || {}),
    ...Object.keys(packageJson.optionalDependencies || {}),
  ]);
}

function buildDependencyGroups(packageJson) {
  if (packageJson === null) {
    return [];
  }

  return [
    { name: "Runtime dependencies", dependencies: Object.keys(packageJson.dependencies || {}).sort() },
    { name: "Development dependencies", dependencies: Object.keys(packageJson.devDependencies || {}).sort() },
    { name: "Peer dependencies", dependencies: Object.keys(packageJson.peerDependencies || {}).sort() },
    { name: "Optional dependencies", dependencies: Object.keys(packageJson.optionalDependencies || {}).sort() },
  ];
}

function detectFrameworks(projectRootDirectoryPath, dependencyNames, relativeFilePaths) {
  const frameworks = [];
  const hasDependency = (dependencyName) => dependencyNames.has(dependencyName);
  const hasFile = (relativeFilePath) => relativeFilePaths.includes(relativeFilePath);
  const hasFileEnding = (fileName) => relativeFilePaths.some((relativeFilePath) => relativeFilePath.endsWith(fileName));

  addDetected(frameworks, hasDependency("next") || hasFile("next.config.js") || hasFile("next.config.mjs") || hasFile("next.config.ts"), "Next.js");
  addDetected(frameworks, hasDependency("react") || hasDependency("react-dom"), "React");
  addDetected(frameworks, hasDependency("vite") || hasFile("vite.config.js") || hasFile("vite.config.ts"), "Vite");
  addDetected(frameworks, hasDependency("vue") || hasFile("vue.config.js"), "Vue");
  addDetected(frameworks, hasDependency("nuxt") || hasFile("nuxt.config.js") || hasFile("nuxt.config.ts"), "Nuxt");
  addDetected(frameworks, hasDependency("@sveltejs/kit") || hasFile("svelte.config.js"), "SvelteKit or Svelte");
  addDetected(frameworks, hasDependency("astro") || hasFile("astro.config.mjs"), "Astro");
  addDetected(frameworks, hasDependency("@angular/core") || hasFile("angular.json"), "Angular");
  addDetected(frameworks, hasDependency("@remix-run/node") || hasDependency("@remix-run/react") || hasFile("remix.config.js"), "Remix");
  addDetected(frameworks, hasDependency("express"), "Express");
  addDetected(frameworks, hasDependency("fastify"), "Fastify");
  addDetected(frameworks, hasDependency("@nestjs/core"), "NestJS");
  addDetected(frameworks, hasFile("pyproject.toml") || hasFile("requirements.txt") || hasFile("manage.py"), "Python");
  addDetected(frameworks, hasFile("manage.py"), "Django");
  addDetected(frameworks, hasFile("go.mod"), "Go modules");
  addDetected(frameworks, hasFile("Cargo.toml"), "Rust Cargo");
  addDetected(frameworks, hasFile("pom.xml") || hasFile("build.gradle") || hasFile("build.gradle.kts"), "JVM build");
  addDetected(frameworks, hasFileEnding("Dockerfile") || hasFile("compose.yml") || hasFile("docker-compose.yml"), "Containerized runtime");

  return frameworks;
}

function detectLanguages(relativeFilePaths) {
  const extensionCounts = new Map();
  for (const relativeFilePath of relativeFilePaths) {
    const extensionName = path.extname(relativeFilePath).toLowerCase();
    if (extensionName.length === 0) {
      continue;
    }

    extensionCounts.set(extensionName, (extensionCounts.get(extensionName) || 0) + 1);
  }

  const languageLabels = [];
  const addLanguage = (extensions, label) => {
    const count = extensions.reduce((totalCount, extensionName) => totalCount + (extensionCounts.get(extensionName) || 0), 0);
    if (count > 0) {
      languageLabels.push(`${label} (${count})`);
    }
  };

  addLanguage([".ts", ".tsx"], "TypeScript");
  addLanguage([".js", ".jsx", ".mjs", ".cjs"], "JavaScript");
  addLanguage([".vue"], "Vue SFC");
  addLanguage([".svelte"], "Svelte");
  addLanguage([".astro"], "Astro");
  addLanguage([".py"], "Python");
  addLanguage([".go"], "Go");
  addLanguage([".rs"], "Rust");
  addLanguage([".java", ".kt"], "JVM");
  addLanguage([".cs"], ".NET");
  addLanguage([".php"], "PHP");
  addLanguage([".rb"], "Ruby");
  addLanguage([".css", ".scss", ".sass", ".less"], "Stylesheets");
  addLanguage([".html"], "HTML");
  addLanguage([".md"], "Markdown");

  return languageLabels;
}

function detectRunCommands(projectRootDirectoryPath, packageJson, packageManagerName) {
  const commands = [];

  if (packageJson && packageJson.scripts && typeof packageJson.scripts === "object") {
    const scriptEntries = Object.entries(packageJson.scripts).sort((firstEntry, secondEntry) => firstEntry[0].localeCompare(secondEntry[0]));
    for (const [scriptName, scriptCommand] of scriptEntries) {
      const packageManagerCommand = packageManagerName && ["npm", "pnpm", "yarn", "bun"].includes(packageManagerName) ? packageManagerName : "npm";
      const runPrefix = packageManagerCommand === "npm" ? "npm run" : packageManagerCommand;
      const commandText = ["start", "test"].includes(scriptName) && packageManagerCommand === "npm" ? `npm ${scriptName}` : `${runPrefix} ${scriptName}`;
      commands.push({ name: scriptName, command: commandText, source: "package.json scripts" });
      if (commands.length >= 16) {
        break;
      }
    }
  }

  if (fs.existsSync(path.join(projectRootDirectoryPath, "manage.py")) === true) {
    commands.push({ name: "django-dev", command: "python manage.py runserver", source: "manage.py" });
  }

  if (fs.existsSync(path.join(projectRootDirectoryPath, "go.mod")) === true) {
    commands.push({ name: "go-run", command: "go run ./...", source: "go.mod" });
    commands.push({ name: "go-test", command: "go test ./...", source: "go.mod" });
  }

  if (fs.existsSync(path.join(projectRootDirectoryPath, "Cargo.toml")) === true) {
    commands.push({ name: "cargo-run", command: "cargo run", source: "Cargo.toml" });
    commands.push({ name: "cargo-test", command: "cargo test", source: "Cargo.toml" });
  }

  if (fs.existsSync(path.join(projectRootDirectoryPath, "docker-compose.yml")) === true || fs.existsSync(path.join(projectRootDirectoryPath, "compose.yml")) === true) {
    commands.push({ name: "compose-up", command: "docker compose up --build", source: "compose file" });
  }

  return dedupeObjectsByKey(commands, (command) => `${command.name}:${command.command}`);
}

function detectEntryPoints(projectRootDirectoryPath, packageJson, relativeFilePaths) {
  const entryPoints = [];
  const candidatePaths = [
    "index.html",
    "src/main.tsx",
    "src/main.ts",
    "src/main.jsx",
    "src/main.js",
    "src/index.tsx",
    "src/index.ts",
    "src/index.jsx",
    "src/index.js",
    "src/App.tsx",
    "src/App.jsx",
    "app/layout.tsx",
    "app/page.tsx",
    "pages/_app.tsx",
    "pages/index.tsx",
    "src/app/layout.tsx",
    "src/app/page.tsx",
    "server.js",
    "server.ts",
    "src/server.ts",
    "src/server.js",
    "main.go",
    "cmd/main.go",
    "src/main.rs",
    "manage.py",
  ];

  for (const candidatePath of candidatePaths) {
    if (relativeFilePaths.includes(candidatePath)) {
      entryPoints.push({ path: candidatePath, reason: describeEntryPoint(candidatePath) });
    }
  }

  if (packageJson && typeof packageJson.main === "string" && relativeFilePaths.includes(packageJson.main)) {
    entryPoints.unshift({ path: packageJson.main, reason: "package.json main field" });
  }

  if (packageJson && typeof packageJson.module === "string" && relativeFilePaths.includes(packageJson.module)) {
    entryPoints.unshift({ path: packageJson.module, reason: "package.json module field" });
  }

  return dedupeObjectsByKey(entryPoints, (entryPoint) => entryPoint.path).slice(0, 18);
}

function detectImportantFiles(relativeFilePaths) {
  const importantFiles = [];

  for (const relativeFilePath of relativeFilePaths) {
    const fileName = path.basename(relativeFilePath);
    const normalizedPath = relativeFilePath.toLowerCase();

    if (importantFileNames.has(fileName)) {
      importantFiles.push(relativeFilePath);
      continue;
    }

    if (normalizedPath.includes("/routes/") || normalizedPath.includes("/pages/") || normalizedPath.includes("/app/")) {
      importantFiles.push(relativeFilePath);
      continue;
    }

    if (normalizedPath.includes("/features/") || normalizedPath.includes("/services/") || normalizedPath.includes("/lib/") || normalizedPath.includes("/server/")) {
      importantFiles.push(relativeFilePath);
      continue;
    }
  }

  return dedupeStrings(importantFiles).slice(0, 120);
}

function detectIntegrationFiles(relativeFilePaths) {
  const integrationSignals = [
    "api",
    "client",
    "server",
    "route",
    "routes",
    "controller",
    "handler",
    "service",
    "database",
    "db",
    "schema",
    "migration",
    "prisma",
    "drizzle",
    "typeorm",
    "sequelize",
    "auth",
    "session",
    "queue",
    "worker",
    "job",
    "webhook",
    "docker",
    "compose",
    "kubernetes",
    "terraform",
    "deploy",
    "ci",
    "workflow",
  ];

  return relativeFilePaths.filter((relativeFilePath) => {
    const normalizedPath = relativeFilePath.toLowerCase();
    return integrationSignals.some((integrationSignal) => normalizedPath.includes(integrationSignal));
  }).slice(0, 120);
}

function detectFeatureFiles(relativeFilePaths, featureName) {
  if (featureName.length === 0) {
    return [];
  }

  const normalizedFeatureName = normalizeSearchText(featureName);
  const featureNameParts = normalizedFeatureName.split(" ").filter(Boolean);

  return relativeFilePaths.filter((relativeFilePath) => {
    const normalizedPath = normalizeSearchText(relativeFilePath);
    if (normalizedPath.includes(normalizedFeatureName)) {
      return true;
    }

    if (featureNameParts.length > 0 && featureNameParts.every((featureNamePart) => normalizedPath.includes(featureNamePart))) {
      return true;
    }

    return false;
  }).slice(0, 160);
}

function collectProjectFilePaths(projectRootDirectoryPath) {
  const collectedFilePaths = [];
  collectProjectFilePathsRecursive(projectRootDirectoryPath, projectRootDirectoryPath, collectedFilePaths);
  return collectedFilePaths.sort((firstPath, secondPath) => firstPath.localeCompare(secondPath));
}

function collectProjectFilePathsRecursive(currentDirectoryPath, projectRootDirectoryPath, collectedFilePaths) {
  if (collectedFilePaths.length >= 5000) {
    return;
  }

  let directoryEntries = [];
  try {
    directoryEntries = fs.readdirSync(currentDirectoryPath, { withFileTypes: true });
  } catch {
    return;
  }

  directoryEntries.sort((firstEntry, secondEntry) => firstEntry.name.localeCompare(secondEntry.name));

  for (const directoryEntry of directoryEntries) {
    const entryPath = path.join(currentDirectoryPath, directoryEntry.name);
    const relativeEntryPath = normalizePath(path.relative(projectRootDirectoryPath, entryPath));

    if (directoryEntry.isDirectory()) {
      if (shouldIgnoreDirectory(directoryEntry.name, relativeEntryPath) === true) {
        continue;
      }

      collectProjectFilePathsRecursive(entryPath, projectRootDirectoryPath, collectedFilePaths);
      continue;
    }

    if (directoryEntry.isFile() === false) {
      continue;
    }

    if (shouldIncludeFile(relativeEntryPath) === false) {
      continue;
    }

    collectedFilePaths.push(relativeEntryPath);
  }
}

function buildDirectoryTree(projectRootDirectoryPath, maxDepth, featureName) {
  const rootName = `${path.basename(projectRootDirectoryPath) || "project-root"}/`;
  const treeLines = [rootName];
  appendDirectoryTreeLines(projectRootDirectoryPath, projectRootDirectoryPath, treeLines, "", 0, maxDepth, featureName);
  return treeLines.join("\n");
}

function appendDirectoryTreeLines(currentDirectoryPath, projectRootDirectoryPath, treeLines, prefixText, currentDepth, maxDepth, featureName) {
  if (currentDepth >= maxDepth) {
    return;
  }

  let directoryEntries = [];
  try {
    directoryEntries = fs.readdirSync(currentDirectoryPath, { withFileTypes: true });
  } catch {
    return;
  }

  const visibleEntries = directoryEntries
    .filter((directoryEntry) => {
      const entryPath = path.join(currentDirectoryPath, directoryEntry.name);
      const relativeEntryPath = normalizePath(path.relative(projectRootDirectoryPath, entryPath));

      if (directoryEntry.isDirectory()) {
        return shouldIgnoreDirectory(directoryEntry.name, relativeEntryPath) === false;
      }

      if (directoryEntry.isFile()) {
        return shouldIncludeFile(relativeEntryPath) && ignoredFileNames.has(directoryEntry.name) === false;
      }

      return false;
    })
    .sort((firstEntry, secondEntry) => {
      if (firstEntry.isDirectory() && secondEntry.isFile()) {
        return -1;
      }

      if (firstEntry.isFile() && secondEntry.isDirectory()) {
        return 1;
      }

      return firstEntry.name.localeCompare(secondEntry.name);
    })
    .slice(0, shouldUseCompactOutput ? 28 : 50);

  visibleEntries.forEach((directoryEntry, index) => {
    const isLastEntry = index === visibleEntries.length - 1;
    const entryPath = path.join(currentDirectoryPath, directoryEntry.name);
    const relativeEntryPath = normalizePath(path.relative(projectRootDirectoryPath, entryPath));
    const connectorText = isLastEntry ? "└── " : "├── ";
    const childPrefixText = `${prefixText}${isLastEntry ? "    " : "│   "}`;
    const architectureNote = describeTreeEntry(relativeEntryPath, directoryEntry, featureName);
    const displayName = directoryEntry.isDirectory() ? `${directoryEntry.name}/` : directoryEntry.name;

    treeLines.push(`${prefixText}${connectorText}${displayName}${architectureNote}`);

    if (directoryEntry.isDirectory()) {
      appendDirectoryTreeLines(entryPath, projectRootDirectoryPath, treeLines, childPrefixText, currentDepth + 1, maxDepth, featureName);
    }
  });
}

function shouldIgnoreDirectory(directoryName, relativeDirectoryPath) {
  if (ignoredDirectoryNames.has(directoryName)) {
    return true;
  }

  if (directoryName.startsWith(".") && directoryName !== ".github" && directoryName !== ".vscode") {
    return true;
  }

  if (relativeDirectoryPath.includes("/.git/")) {
    return true;
  }

  return false;
}

function shouldIncludeFile(relativeFilePath) {
  const fileName = path.basename(relativeFilePath);
  if (ignoredFileNames.has(fileName)) {
    return false;
  }

  const extensionName = path.extname(relativeFilePath).toLowerCase();
  if (sourceFileExtensions.has(extensionName)) {
    return true;
  }

  if (importantFileNames.has(fileName)) {
    return true;
  }

  if (fileName === "Dockerfile" || fileName === "Containerfile" || fileName === "Procfile") {
    return true;
  }

  return false;
}

function describeTreeEntry(relativeEntryPath, directoryEntry, featureName) {
  const lowerPath = relativeEntryPath.toLowerCase();
  const notes = [];

  if (directoryEntry.isDirectory()) {
    if (lowerPath === "src") notes.push("source code");
    if (lowerPath.endsWith("app")) notes.push("app shell or routes");
    if (lowerPath.endsWith("pages")) notes.push("page routes");
    if (lowerPath.endsWith("routes")) notes.push("route handlers");
    if (lowerPath.endsWith("components")) notes.push("UI components");
    if (lowerPath.endsWith("features")) notes.push("feature domains");
    if (lowerPath.endsWith("services")) notes.push("service layer");
    if (lowerPath.endsWith("lib")) notes.push("shared library code");
    if (lowerPath.endsWith("tests") || lowerPath.endsWith("__tests__")) notes.push("tests");
  } else {
    if (path.basename(relativeEntryPath) === "package.json") notes.push("scripts and dependencies");
    if (path.basename(relativeEntryPath) === "Dockerfile") notes.push("container build");
    if (path.basename(relativeEntryPath) === "README.md") notes.push("project overview");
    if (path.basename(relativeEntryPath) === "ARCHITECTURE.md") notes.push("architecture docs");
    if (lowerPath.includes("config")) notes.push("configuration");
    if (lowerPath.includes("route")) notes.push("routing boundary");
    if (lowerPath.includes("server")) notes.push("server boundary");
  }

  if (featureName.length > 0 && normalizeSearchText(relativeEntryPath).includes(normalizeSearchText(featureName))) {
    notes.push("feature match");
  }

  if (notes.length === 0) {
    return "";
  }

  return `    # ${notes.join(", ")}`;
}

function describeImportantFile(relativeFilePath) {
  const fileName = path.basename(relativeFilePath);
  const lowerPath = relativeFilePath.toLowerCase();

  if (fileName === "package.json") return "Node package scripts and dependency contract";
  if (fileName === "tsconfig.json" || fileName === "jsconfig.json") return "TypeScript or JavaScript compiler and path configuration";
  if (fileName.startsWith("vite.config")) return "Vite build and dev-server configuration";
  if (fileName.startsWith("next.config")) return "Next.js application configuration";
  if (fileName.startsWith("nuxt.config")) return "Nuxt application configuration";
  if (fileName.startsWith("astro.config")) return "Astro application configuration";
  if (fileName === "svelte.config.js") return "Svelte or SvelteKit configuration";
  if (fileName === "angular.json") return "Angular workspace configuration";
  if (fileName === "tailwind.config.js" || fileName === "tailwind.config.ts") return "Tailwind design token and content scanning configuration";
  if (fileName === "pyproject.toml") return "Python project, build, dependency, and tool configuration";
  if (fileName === "go.mod") return "Go module boundary and dependency contract";
  if (fileName === "Cargo.toml") return "Rust package and workspace configuration";
  if (fileName === "Dockerfile" || fileName === "Containerfile") return "Container image build architecture";
  if (fileName === "docker-compose.yml" || fileName === "compose.yml") return "Local service topology and container wiring";
  if (fileName === "README.md") return "Human project overview";
  if (fileName === "ARCHITECTURE.md") return "Existing architecture documentation";
  if (lowerPath.includes("/routes/") || lowerPath.includes("/pages/") || lowerPath.includes("/app/")) return "Route, page, or app-shell boundary";
  if (lowerPath.includes("/features/")) return "Feature-domain implementation";
  if (lowerPath.includes("/services/")) return "Service-layer implementation";
  if (lowerPath.includes("/lib/")) return "Shared library or integration code";
  if (lowerPath.includes("/server/")) return "Server-side runtime boundary";

  return "Architecture-relevant project file";
}

function describeIntegrationFile(relativeFilePath) {
  const lowerPath = relativeFilePath.toLowerCase();
  if (lowerPath.includes("database") || lowerPath.includes("/db") || lowerPath.includes("schema") || lowerPath.includes("migration")) return "Database or persistence boundary";
  if (lowerPath.includes("api") || lowerPath.includes("client")) return "API client or HTTP integration boundary";
  if (lowerPath.includes("route") || lowerPath.includes("controller") || lowerPath.includes("handler")) return "Request routing or handler boundary";
  if (lowerPath.includes("auth") || lowerPath.includes("session")) return "Authentication or session boundary";
  if (lowerPath.includes("queue") || lowerPath.includes("worker") || lowerPath.includes("job")) return "Background processing boundary";
  if (lowerPath.includes("docker") || lowerPath.includes("compose") || lowerPath.includes("kubernetes") || lowerPath.includes("deploy")) return "Deployment or container boundary";
  if (lowerPath.includes("workflow") || lowerPath.includes("ci")) return "CI/CD boundary";
  return "Potential integration boundary";
}

function describeFeatureFile(relativeFilePath, featureName) {
  const lowerPath = relativeFilePath.toLowerCase();
  if (lowerPath.includes("test") || lowerPath.includes("spec")) return `Tests or verification for ${featureName}`;
  if (lowerPath.includes("route") || lowerPath.includes("page")) return `Entry route or page for ${featureName}`;
  if (lowerPath.includes("component") || lowerPath.includes("components")) return `UI component boundary for ${featureName}`;
  if (lowerPath.includes("service") || lowerPath.includes("api") || lowerPath.includes("client")) return `Service or integration boundary for ${featureName}`;
  if (lowerPath.includes("store") || lowerPath.includes("state")) return `State ownership for ${featureName}`;
  return `Matched implementation file for ${featureName}`;
}

function describeEntryPoint(relativeFilePath) {
  const fileName = path.basename(relativeFilePath);
  if (relativeFilePath === "index.html") return "Browser HTML entry point";
  if (fileName.startsWith("main.")) return "Application runtime entry point";
  if (fileName.startsWith("index.")) return "Package or app entry point";
  if (fileName.startsWith("App.")) return "Frontend app shell";
  if (relativeFilePath.includes("layout.")) return "Framework layout entry";
  if (relativeFilePath.includes("page.")) return "Framework page route";
  if (fileName.startsWith("server.")) return "Backend server entry";
  if (relativeFilePath.endsWith("main.go")) return "Go command entry";
  if (relativeFilePath.endsWith("main.rs")) return "Rust binary entry";
  if (fileName === "manage.py") return "Django management entry";
  return "Detected conventional entry point";
}

function readArgumentValue(argumentName, fallbackValue) {
  const equalsPrefix = `${argumentName}=`;
  const equalsArgument = commandLineArguments.find((commandLineArgument) => commandLineArgument.startsWith(equalsPrefix));
  if (equalsArgument) {
    return equalsArgument.slice(equalsPrefix.length);
  }

  const argumentIndex = commandLineArguments.indexOf(argumentName);
  if (argumentIndex >= 0 && argumentIndex + 1 < commandLineArguments.length) {
    return commandLineArguments[argumentIndex + 1];
  }

  return fallbackValue;
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function normalizeSearchText(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function sanitizeMermaidLabel(value) {
  return String(value).replace(/[\[\]{}()<>|]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) || "Unknown";
}

function escapeMarkdownTableCell(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function escapeBackticks(value) {
  return String(value).replace(/`/g, "\\`");
}

function addDetected(collection, condition, label) {
  if (condition === true && collection.includes(label) === false) {
    collection.push(label);
  }
}

function dedupeStrings(values) {
  return [...new Set(values)];
}

function dedupeObjectsByKey(values, keyBuilder) {
  const seenKeys = new Set();
  const dedupedValues = [];

  for (const value of values) {
    const key = keyBuilder(value);
    if (seenKeys.has(key)) {
      continue;
    }

    seenKeys.add(key);
    dedupedValues.push(value);
  }

  return dedupedValues;
}

function failWithMessage(message) {
  console.error(message);
  process.exit(1);
}
