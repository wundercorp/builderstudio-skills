#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const commandLineArguments = process.argv.slice(2);
const rootDirectoryPath = path.resolve(readArgumentValue("--root", "."));
const shouldUseStrictExit = commandLineArguments.includes("--strict");
const shouldPrintJson = commandLineArguments.includes("--json");
const shouldWriteSecurityMarkdown = commandLineArguments.includes("--write-security-md");

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
  ".py",
  ".go",
  ".rs",
  ".java",
  ".cs",
  ".php",
  ".rb",
  ".md",
  ".env",
  ".example",
]);

const findings = [];
const writtenFiles = [];

if (fs.existsSync(rootDirectoryPath) === false) {
  addFinding("critical", "root", rootDirectoryPath, "The requested root directory does not exist.", "Pass a valid --root path.");
  finish();
}

const allFilePaths = collectFilePaths(rootDirectoryPath);
const relativePathSet = new Set(allFilePaths.map((filePath) => normalizeRelativePath(filePath)));
const packageJsonFiles = allFilePaths.filter((filePath) => path.basename(filePath) === "package.json");
const dockerFiles = allFilePaths.filter((filePath) => /(^|\/)Dockerfile(\.|$)/.test(normalizeRelativePath(filePath)) || path.basename(filePath).toLowerCase() === "dockerfile");
const sourceFiles = allFilePaths.filter(shouldScanTextFile);

checkSecurityDocumentation();
checkIgnoredSecrets();
checkEnvironmentFiles();
checkPackageJsonFiles();
checkFrontendAndBackendSourceFiles();
checkDockerFiles();
checkCiFiles();
writeSecurityMarkdownIfRequested();
finish();

function checkSecurityDocumentation() {
  if (relativePathSet.has("SECURITY.md") === false && relativePathSet.has("docs/SECURITY.md") === false && relativePathSet.has("security.md") === false) {
    addFinding("moderate", "documentation", "SECURITY.md", "No SECURITY.md file was found.", "Add security reporting, environment handling, audit commands, and production checklist documentation.");
  }
}

function checkIgnoredSecrets() {
  const gitignorePath = path.join(rootDirectoryPath, ".gitignore");
  if (fs.existsSync(gitignorePath) === false) {
    addFinding("high", "secret-hygiene", ".gitignore", "No root .gitignore file was found.", "Add .env, private keys, logs, databases, and build/cache outputs to .gitignore.");
    return;
  }

  const gitignoreText = readTextFile(gitignorePath);
  const requiredPatterns = [".env", ".env.*", "*.pem", "*.key", "*.p12", "*.pfx", "*.log"];
  for (const requiredPattern of requiredPatterns) {
    if (gitignoreText.includes(requiredPattern) === false) {
      addFinding("moderate", "secret-hygiene", ".gitignore", `Missing ${requiredPattern} from .gitignore.`, `Ignore ${requiredPattern} unless it is a safe placeholder example.`);
    }
  }
}

function checkEnvironmentFiles() {
  for (const filePath of allFilePaths) {
    const relativeFilePath = normalizeRelativePath(filePath);
    const fileName = path.basename(filePath).toLowerCase();
    if (fileName === ".env.example") {
      continue;
    }
    if (fileName === ".env" || fileName.startsWith(".env.")) {
      addFinding("critical", "secret-hygiene", relativeFilePath, "A real environment file appears to be present in the repository tree.", "Remove it from source control and keep only .env.example placeholders.");
    }
  }

  const examplePath = path.join(rootDirectoryPath, ".env.example");
  if (fs.existsSync(examplePath) === false && packageJsonFiles.length > 0) {
    addFinding("low", "configuration", ".env.example", "No root .env.example file was found for this JavaScript/TypeScript app.", "Add placeholder-only environment documentation when runtime configuration is required.");
  }
}

function checkPackageJsonFiles() {
  for (const packageJsonFilePath of packageJsonFiles) {
    const relativeFilePath = normalizeRelativePath(packageJsonFilePath);
    let packageJson;
    try {
      packageJson = JSON.parse(readTextFile(packageJsonFilePath));
    } catch {
      addFinding("high", "package", relativeFilePath, "package.json could not be parsed.", "Fix package.json so package-manager and audit commands can run.");
      continue;
    }

    const dependencies = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };

    const scripts = packageJson.scripts || {};
    if (!scripts.build) {
      addFinding("low", "verification", relativeFilePath, "No build script was found.", "Add or document a production build command so security changes can be verified.");
    }
    if (!scripts.test && !scripts.typecheck && !scripts.lint) {
      addFinding("low", "verification", relativeFilePath, "No test, typecheck, or lint script was found.", "Add at least one automated verification command.");
    }

    if (dependencies.express && !dependencies.helmet) {
      addFinding("moderate", "headers", relativeFilePath, "Express is used without helmet in declared dependencies.", "Add security headers through helmet or equivalent middleware.");
    }

    if (dependencies.express && !dependencies["express-rate-limit"] && !dependencies.rate_limiter_flexible && !dependencies.bottleneck) {
      addFinding("moderate", "abuse-control", relativeFilePath, "Express is used without an obvious rate-limiting dependency.", "Add rate limits for auth, writes, uploads, search, and expensive endpoints.");
    }

    if (dependencies.cors) {
      addFinding("info", "cors", relativeFilePath, "CORS dependency is present.", "Verify origins are allowlisted and wildcard origins are not used with credentials.");
    }
  }
}

function checkFrontendAndBackendSourceFiles() {
  for (const filePath of sourceFiles) {
    const relativeFilePath = normalizeRelativePath(filePath);
    if (relativeFilePath === "scripts/check-svalbard.mjs") {
      continue;
    }

    const fileText = readTextFile(filePath);
    const lowerText = fileText.toLowerCase();

    addPatternFinding(fileText, /dangerouslySetInnerHTML\s*=/, "high", "xss", relativeFilePath, "React dangerouslySetInnerHTML is used.", "Sanitize rich text with a maintained sanitizer or remove raw HTML rendering.");
    addPatternFinding(fileText, /\.innerHTML\s*=/, "high", "xss", relativeFilePath, "innerHTML assignment is used.", "Use textContent or safe framework rendering unless sanitized HTML is required.");
    addPatternFinding(fileText, /\beval\s*\(/, "critical", "dynamic-code", relativeFilePath, "eval is used.", "Remove dynamic code execution.");
    addPatternFinding(fileText, /new\s+Function\s*\(/, "critical", "dynamic-code", relativeFilePath, "new Function is used.", "Remove dynamic code execution.");
    addPatternFinding(fileText, /localStorage\s*\.(setItem|getItem)\s*\([^\n]*(token|secret|session|jwt|auth)/i, "high", "token-storage", relativeFilePath, "Sensitive token-like data appears to use localStorage.", "Prefer HttpOnly secure cookies or short-lived in-memory tokens.");
    addPatternFinding(fileText, /sessionStorage\s*\.(setItem|getItem)\s*\([^\n]*(token|secret|session|jwt|auth)/i, "high", "token-storage", relativeFilePath, "Sensitive token-like data appears to use sessionStorage.", "Prefer HttpOnly secure cookies or short-lived in-memory tokens.");
    addPatternFinding(fileText, /Access-Control-Allow-Origin["'`\s]*[:,=]["'`\s]*\*/i, "high", "cors", relativeFilePath, "Wildcard Access-Control-Allow-Origin was found.", "Use an explicit origin allowlist.");
    addPatternFinding(fileText, /origin\s*:\s*["'`]\*["'`]/i, "high", "cors", relativeFilePath, "Wildcard CORS origin configuration was found.", "Use an explicit origin allowlist and never combine wildcard origins with credentials.");
    addPatternFinding(fileText, /credentials\s*:\s*true[\s\S]{0,120}origin\s*:\s*["'`]\*["'`]|origin\s*:\s*["'`]\*["'`][\s\S]{0,120}credentials\s*:\s*true/i, "critical", "cors", relativeFilePath, "CORS credentials appear to be combined with wildcard origins.", "Replace with a strict allowlist.");
    addPatternFinding(fileText, /res\.redirect\s*\([^\n]*(req\.query|request\.query|searchParams|get\()/i, "high", "redirect", relativeFilePath, "A redirect may use user-controlled input.", "Allow only relative paths or approved origins.");
    addPatternFinding(fileText, /child_process|exec\s*\(|spawn\s*\(/, "moderate", "command-execution", relativeFilePath, "Command execution APIs appear in source.", "Ensure all arguments are allowlisted and never shell-concatenated with user input.");
    addPatternFinding(fileText, /SELECT[\s\S]{0,80}\$\{|SELECT[\s\S]{0,80}\+|WHERE[\s\S]{0,80}\$\{|WHERE[\s\S]{0,80}\+/i, "high", "injection", relativeFilePath, "SQL-like string construction with interpolation or concatenation was found.", "Use prepared statements, ORM bindings, or typed query builders.");
    addPatternFinding(fileText, /console\.(log|warn|error)\s*\([^\n]*(password|secret|token|authorization|cookie)/i, "high", "logging", relativeFilePath, "Sensitive-looking values may be logged.", "Redact secrets, tokens, cookies, and credentials from logs.");

    if (lowerText.includes("set-cookie") && lowerText.includes("httponly") === false) {
      addFinding("high", "cookie", relativeFilePath, "Set-Cookie appears without HttpOnly in the same file.", "Use HttpOnly for session or auth cookies.");
    }

    if (lowerText.includes("set-cookie") && lowerText.includes("samesite") === false) {
      addFinding("moderate", "cookie", relativeFilePath, "Set-Cookie appears without SameSite in the same file.", "Use SameSite=Lax or SameSite=Strict unless cross-site behavior is required.");
    }

    if (lowerText.includes("set-cookie") && lowerText.includes("secure") === false) {
      addFinding("moderate", "cookie", relativeFilePath, "Set-Cookie appears without Secure in the same file.", "Use Secure for production HTTPS cookies.");
    }
  }
}

function checkDockerFiles() {
  for (const dockerFilePath of dockerFiles) {
    const relativeFilePath = normalizeRelativePath(dockerFilePath);
    const dockerText = readTextFile(dockerFilePath);
    if (/\n\s*USER\s+/i.test(`\n${dockerText}`) === false) {
      addFinding("moderate", "docker", relativeFilePath, "Dockerfile does not appear to set a non-root USER.", "Run the app as a non-root user when the runtime allows it.");
    }
    if (/COPY\s+\.\s+/i.test(dockerText) && relativePathSet.has(".dockerignore") === false) {
      addFinding("high", "docker", relativeFilePath, "Dockerfile copies the repository without a root .dockerignore.", "Add .dockerignore to exclude env files, keys, logs, node_modules, build caches, and git metadata.");
    }
    if (/ADD\s+https?:\/\//i.test(dockerText)) {
      addFinding("moderate", "docker", relativeFilePath, "Dockerfile uses ADD with a remote URL.", "Prefer pinned downloads with checksum verification or package-manager installs.");
    }
  }
}

function checkCiFiles() {
  for (const filePath of sourceFiles) {
    const relativeFilePath = normalizeRelativePath(filePath);
    if (!relativeFilePath.startsWith(".github/workflows/") && !relativeFilePath.includes("gitlab-ci") && !relativeFilePath.includes("circleci")) {
      continue;
    }

    const fileText = readTextFile(filePath);
    if (/pull_request_target\s*:/i.test(fileText)) {
      addFinding("high", "ci", relativeFilePath, "pull_request_target is used.", "Ensure untrusted pull-request code cannot access write tokens or deployment secrets.");
    }
    if (/permissions\s*:/i.test(fileText) === false) {
      addFinding("moderate", "ci", relativeFilePath, "Workflow does not declare explicit permissions.", "Set minimum required GitHub token permissions.");
    }
  }
}

function writeSecurityMarkdownIfRequested() {
  if (shouldWriteSecurityMarkdown === false) {
    return;
  }

  const securityMarkdownPath = path.join(rootDirectoryPath, "SECURITY.md");
  if (fs.existsSync(securityMarkdownPath)) {
    addFinding("info", "documentation", "SECURITY.md", "SECURITY.md already exists and was not overwritten.", "Review it against the Svalbard checklist.");
    return;
  }

  const securityMarkdown = [
    "# Security",
    "",
    "## Reporting vulnerabilities",
    "",
    "Report suspected vulnerabilities to `security-contact@example.com`. Replace this placeholder before publishing.",
    "",
    "## Environment variables",
    "",
    "Keep real environment files out of source control. Commit only placeholder values in `.env.example`.",
    "",
    "## Production checklist",
    "",
    "- Use HTTPS in production.",
    "- Keep secrets in a secret manager or hosting-platform secret store.",
    "- Verify authentication, authorization, CSRF, CORS, rate limits, and security headers before release.",
    "- Run dependency audits and the project build before deployment.",
    "- Review logs for secret and personal-data redaction.",
    "",
    "## Verification",
    "",
    "```bash",
    "node scripts/check-svalbard.mjs --root . --strict",
    "```",
    "",
  ].join("\n");

  fs.writeFileSync(securityMarkdownPath, securityMarkdown);
  writtenFiles.push("SECURITY.md");
}

function addPatternFinding(fileText, pattern, severity, category, relativeFilePath, message, recommendation) {
  if (pattern.test(fileText)) {
    addFinding(severity, category, relativeFilePath, message, recommendation);
  }
}

function addFinding(severity, category, filePath, message, recommendation) {
  findings.push({ severity, category, filePath, message, recommendation });
}

function collectFilePaths(directoryPath) {
  const collectedFilePaths = [];
  const directoryEntries = fs.readdirSync(directoryPath, { withFileTypes: true });

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

function shouldScanTextFile(filePath) {
  const fileName = path.basename(filePath);
  if (fileName === ".gitignore" || fileName === ".dockerignore") {
    return true;
  }

  const extensionName = path.extname(filePath).toLowerCase();
  if (textFileExtensions.has(extensionName) === false) {
    return false;
  }

  const fileStats = fs.statSync(filePath);
  if (fileStats.size > 1024 * 1024) {
    return false;
  }

  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.includes(0) === false;
}

function readTextFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function normalizeRelativePath(filePath) {
  return path.relative(rootDirectoryPath, filePath).split(path.sep).join("/");
}

function readArgumentValue(argumentName, defaultValue) {
  const argumentIndex = commandLineArguments.indexOf(argumentName);
  if (argumentIndex === -1) {
    return defaultValue;
  }

  const argumentValue = commandLineArguments[argumentIndex + 1];
  if (!argumentValue || argumentValue.startsWith("--")) {
    return defaultValue;
  }

  return argumentValue;
}

function severityRank(severity) {
  if (severity === "critical") {
    return 5;
  }
  if (severity === "high") {
    return 4;
  }
  if (severity === "moderate") {
    return 3;
  }
  if (severity === "low") {
    return 2;
  }
  if (severity === "info") {
    return 1;
  }
  return 0;
}

function finish() {
  findings.sort((leftFinding, rightFinding) => severityRank(rightFinding.severity) - severityRank(leftFinding.severity));

  const summary = {
    root: rootDirectoryPath,
    findingCount: findings.length,
    highestSeverity: findings[0]?.severity || "none",
    writtenFiles,
    findings,
  };

  if (shouldPrintJson) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(`Svalbard security check for ${rootDirectoryPath}`);
    console.log(`Findings: ${findings.length}`);
    if (writtenFiles.length > 0) {
      console.log(`Written files: ${writtenFiles.join(", ")}`);
    }
    for (const finding of findings) {
      console.log(`\n[${finding.severity.toUpperCase()}] ${finding.category}: ${finding.filePath}`);
      console.log(finding.message);
      console.log(`Recommendation: ${finding.recommendation}`);
    }
    if (findings.length === 0) {
      console.log("No baseline Svalbard findings detected.");
    }
  }

  const strictFailure = findings.some((finding) => severityRank(finding.severity) >= severityRank("moderate"));
  if (shouldUseStrictExit && strictFailure) {
    process.exit(1);
  }
}
