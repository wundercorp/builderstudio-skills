#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const commandLineArguments = parseCommandLineArguments(process.argv.slice(2));
const rootDirectoryPath = path.resolve(readArgumentValue(commandLineArguments, "root", process.cwd()));
const shouldWriteChanges = hasFlag(commandLineArguments, "write");
const shouldFailOnMatch = hasFlag(commandLineArguments, "fail-on-match");
const shouldFailOnSecret = hasFlag(commandLineArguments, "fail-on-secret") || shouldFailOnMatch;
const shouldIncludeBuildArtifacts = hasFlag(commandLineArguments, "include-build");
const shouldIncludeDependencyArtifacts = hasFlag(commandLineArguments, "include-deps");
const shouldIncludeArchives = hasFlag(commandLineArguments, "include-archives");
const shouldIncludeIdeState = hasFlag(commandLineArguments, "include-ide");
const shouldBeQuiet = hasFlag(commandLineArguments, "quiet");

if (fs.existsSync(rootDirectoryPath) === false) {
  failWithMessage(`Root directory does not exist: ${rootDirectoryPath}`, 2);
}

const cleanupCandidates = [];
const secretFindings = [];
scanDirectory(rootDirectoryPath);

cleanupCandidates.sort((leftCandidate, rightCandidate) => {
  return rightCandidate.absolutePath.length - leftCandidate.absolutePath.length;
});

if (cleanupCandidates.length === 0 && secretFindings.length === 0) {
  printLine("Cleaner found no removable junk or secret-like content.");
  process.exit(0);
}

if (cleanupCandidates.length > 0) {
  for (const cleanupCandidate of cleanupCandidates) {
    const relativePath = path.relative(rootDirectoryPath, cleanupCandidate.absolutePath).split(path.sep).join("/");
    const actionText = shouldWriteChanges ? "remove" : "would remove";
    printLine(`${actionText}: ${relativePath} (${cleanupCandidate.reason})`);

    if (shouldWriteChanges === true) {
      removePath(cleanupCandidate.absolutePath);
    }
  }
}

if (secretFindings.length > 0) {
  printLine("");
  printLine("Secret-like content found. Review before publishing:");
  for (const secretFinding of secretFindings) {
    printLine(`- ${secretFinding.relativePath}: ${secretFinding.reason}`);
  }

  if (shouldFailOnSecret === true) {
    failWithMessage("Cleaner blocked public release because secret-like content was found.", 2);
  }
}

if (shouldFailOnMatch === true && cleanupCandidates.length > 0) {
  failWithMessage("Cleaner found files that should not be pushed publicly.", 1);
}

if (shouldWriteChanges === true) {
  printLine(`Cleaner removed ${cleanupCandidates.length} path(s).`);
} else if (cleanupCandidates.length > 0) {
  printLine("");
  printLine("Run again with --write to remove the listed paths.");
}

function scanDirectory(directoryPath) {
  const directoryEntries = fs.readdirSync(directoryPath, { withFileTypes: true });

  for (const directoryEntry of directoryEntries) {
    const absoluteEntryPath = path.join(directoryPath, directoryEntry.name);
    const relativeEntryPath = path.relative(rootDirectoryPath, absoluteEntryPath).split(path.sep).join("/");

    if (shouldSkipTraversal(relativeEntryPath, directoryEntry.name) === true) {
      continue;
    }

    const cleanupReason = getCleanupReason(relativeEntryPath, directoryEntry.name, directoryEntry.isDirectory());
    if (cleanupReason.length > 0) {
      cleanupCandidates.push({ absolutePath: absoluteEntryPath, reason: cleanupReason });
      continue;
    }

    if (directoryEntry.isDirectory() === true) {
      scanDirectory(absoluteEntryPath);
      continue;
    }

    if (directoryEntry.isFile() === true) {
      scanFileForSecretLikeContent(absoluteEntryPath, relativeEntryPath, directoryEntry.name);
    }
  }
}

function shouldSkipTraversal(relativeEntryPath, entryName) {
  const normalizedRelativeEntryPath = relativeEntryPath.toLowerCase();
  const normalizedEntryName = entryName.toLowerCase();

  if (normalizedEntryName === ".git" || normalizedEntryName === ".hg" || normalizedEntryName === ".svn") {
    return true;
  }

  if (normalizedRelativeEntryPath.startsWith(".git/")) {
    return true;
  }

  return false;
}

function getCleanupReason(relativeEntryPath, entryName, isDirectory) {
  const normalizedRelativeEntryPath = relativeEntryPath.toLowerCase();
  const normalizedEntryName = entryName.toLowerCase();

  if (normalizedEntryName === ".ds_store") {
    return "macOS Finder metadata";
  }

  if (entryName.startsWith("._")) {
    return "AppleDouble sidecar metadata";
  }

  const alwaysRemoveExactNames = new Set([
    "thumbs.db",
    "desktop.ini",
    "ehthumbs.db",
    ".lsOverride".toLowerCase(),
  ]);

  if (alwaysRemoveExactNames.has(normalizedEntryName) === true) {
    return "operating system metadata";
  }

  const alwaysRemoveDirectoryNames = new Set([
    "__macosx",
    ".appledouble",
    ".spotlight-v100",
    ".trashes",
    ".fseventsd",
    ".temporaryitems",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    ".tox",
    ".nox",
    "__pycache__",
    ".hypothesis",
    ".eggs",
    ".cache",
    ".parcel-cache",
    ".turbo",
    ".vite",
    ".serverless",
    ".sst",
    ".firebase",
    ".now",
  ]);

  if (isDirectory === true && alwaysRemoveDirectoryNames.has(normalizedEntryName) === true) {
    return "generated cache or local metadata directory";
  }

  if (normalizedRelativeEntryPath === ".next/cache" || normalizedRelativeEntryPath.startsWith(".next/cache/")) {
    return "Next.js cache";
  }

  if (normalizedRelativeEntryPath === ".wrangler/state" || normalizedRelativeEntryPath.startsWith(".wrangler/state/")) {
    return "Wrangler local deployment state";
  }

  if (normalizedRelativeEntryPath === ".wrangler/tmp" || normalizedRelativeEntryPath.startsWith(".wrangler/tmp/")) {
    return "Wrangler temporary deployment state";
  }

  if (normalizedEntryName === ".eslintcache" || normalizedEntryName === ".stylelintcache") {
    return "linter cache";
  }

  if (normalizedEntryName === ".coverage") {
    return "coverage cache";
  }

  if (isPrivateEnvironmentFile(normalizedEntryName) === true) {
    return "private environment file";
  }

  if (isLocalCredentialOrDatabaseFile(normalizedEntryName) === true) {
    return "local credential, key, certificate, database, or dump file";
  }

  if (isLogOrTemporaryFile(normalizedEntryName) === true) {
    return "log, backup, swap, or temporary file";
  }

  if (isDirectory === true && isLocalDeploymentStateDirectory(normalizedRelativeEntryPath) === true) {
    return "local deployment provider state";
  }

  if (shouldIncludeDependencyArtifacts === true && isDirectory === true && isDependencyArtifactDirectory(normalizedEntryName, normalizedRelativeEntryPath) === true) {
    return "dependency artifact directory";
  }

  if (shouldIncludeBuildArtifacts === true && isDirectory === true && isBuildArtifactDirectory(normalizedEntryName, normalizedRelativeEntryPath) === true) {
    return "build or coverage artifact directory";
  }

  if (shouldIncludeArchives === true && isArchiveFile(normalizedEntryName) === true) {
    return "archive artifact";
  }

  if (shouldIncludeIdeState === true && isDirectory === true && isIdeStateDirectory(normalizedEntryName) === true) {
    return "IDE local state directory";
  }

  return "";
}

function isPrivateEnvironmentFile(normalizedEntryName) {
  if (normalizedEntryName === ".env") {
    return true;
  }

  if (normalizedEntryName.startsWith(".env.") === false) {
    return false;
  }

  const safeEnvironmentExamples = new Set([
    ".env.example",
    ".env.sample",
    ".env.template",
    ".env.defaults",
  ]);

  if (safeEnvironmentExamples.has(normalizedEntryName) === true) {
    return false;
  }

  return true;
}

function isLocalCredentialOrDatabaseFile(normalizedEntryName) {
  const blockedExactNames = new Set([
    ".npmrc",
    ".pypirc",
    ".netrc",
    "id_rsa",
    "id_ed25519",
    "service-account.json",
    "firebase-adminsdk.json",
  ]);

  if (blockedExactNames.has(normalizedEntryName) === true) {
    return true;
  }

  if (/\.(pem|key|p12|pfx|crt|cert|sqlite|sqlite3|db|dump)$/i.test(normalizedEntryName) === true) {
    return true;
  }

  return false;
}

function isLogOrTemporaryFile(normalizedEntryName) {
  if (/\.log$/.test(normalizedEntryName) === true) {
    return true;
  }

  if (/^(npm-debug|yarn-debug|yarn-error|pnpm-debug|lerna-debug)\.log/.test(normalizedEntryName) === true) {
    return true;
  }

  if (/^hs_err_pid\d+/.test(normalizedEntryName) === true) {
    return true;
  }

  if (/\.(swp|swo|tmp|temp|bak|orig|rej)$/.test(normalizedEntryName) === true) {
    return true;
  }

  if (normalizedEntryName.endsWith("~") === true) {
    return true;
  }

  return false;
}

function isLocalDeploymentStateDirectory(normalizedRelativeEntryPath) {
  const localDeploymentStateDirectoryPrefixes = [
    ".vercel",
    ".netlify",
    ".serverless",
    ".sst",
  ];

  for (const localDeploymentStateDirectoryPrefix of localDeploymentStateDirectoryPrefixes) {
    if (normalizedRelativeEntryPath === localDeploymentStateDirectoryPrefix || normalizedRelativeEntryPath.startsWith(`${localDeploymentStateDirectoryPrefix}/`)) {
      return true;
    }
  }

  return false;
}

function isDependencyArtifactDirectory(normalizedEntryName, normalizedRelativeEntryPath) {
  const dependencyDirectoryNames = new Set([
    "node_modules",
    ".pnpm-store",
    ".venv",
    "venv",
  ]);

  if (dependencyDirectoryNames.has(normalizedEntryName) === true) {
    return true;
  }

  if (normalizedRelativeEntryPath === ".yarn/unplugged" || normalizedRelativeEntryPath.startsWith(".yarn/unplugged/")) {
    return true;
  }

  return false;
}

function isBuildArtifactDirectory(normalizedEntryName, normalizedRelativeEntryPath) {
  const buildDirectoryNames = new Set([
    "dist",
    "build",
    "out",
    "coverage",
    ".next",
    ".nuxt",
    ".output",
    ".svelte-kit",
    "target",
  ]);

  if (buildDirectoryNames.has(normalizedEntryName) === true) {
    return true;
  }

  if (normalizedRelativeEntryPath === ".yarn/cache" || normalizedRelativeEntryPath.startsWith(".yarn/cache/")) {
    return true;
  }

  return false;
}

function isArchiveFile(normalizedEntryName) {
  return /\.(zip|tar|tgz|tar\.gz|rar|7z|gz|bz2|xz)$/i.test(normalizedEntryName);
}

function isIdeStateDirectory(normalizedEntryName) {
  return normalizedEntryName === ".idea" || normalizedEntryName === ".vscode";
}

function scanFileForSecretLikeContent(filePath, relativePath, entryName) {
  if (shouldScanFileContents(filePath, entryName) === false) {
    return;
  }

  const fileText = fs.readFileSync(filePath, "utf8");
  const secretReason = findSecretLikeContent(fileText);

  if (secretReason.length > 0) {
    secretFindings.push({ relativePath, reason: secretReason });
  }
}

function shouldScanFileContents(filePath, entryName) {
  if (entryName === "clean-repo.mjs") {
    return false;
  }

  const fileStats = fs.statSync(filePath);
  if (fileStats.size > 1024 * 1024) {
    return false;
  }

  const fileBuffer = fs.readFileSync(filePath);
  if (fileBuffer.includes(0) === true) {
    return false;
  }

  return true;
}

function findSecretLikeContent(fileText) {
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(fileText) === true) {
    return "private key block";
  }

  const tokenPatterns = [
    { pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b/, reason: "GitHub token-shaped value" },
    { pattern: /\bgithub_pat_[A-Za-z0-9_]{30,}\b/, reason: "GitHub fine-grained token-shaped value" },
    { pattern: /\bAKIA[0-9A-Z]{16}\b/, reason: "AWS access-key-shaped value" },
    { pattern: /\bsk-[A-Za-z0-9]{20,}\b/, reason: "secret-key-shaped value" },
    { pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/, reason: "Slack token-shaped value" },
    { pattern: /\brk_live_[A-Za-z0-9]{20,}\b/, reason: "Stripe restricted-key-shaped value" },
    { pattern: /\bsk_live_[A-Za-z0-9]{20,}\b/, reason: "Stripe secret-key-shaped value" },
  ];

  for (const tokenPattern of tokenPatterns) {
    if (tokenPattern.pattern.test(fileText) === true) {
      return tokenPattern.reason;
    }
  }

  const secretAssignmentPattern = /^\s*(OPENAI_API_KEY|ANTHROPIC_API_KEY|GITHUB_TOKEN|GH_TOKEN|AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|SUPABASE_SERVICE_ROLE_KEY|STRIPE_SECRET_KEY|DATABASE_URL|MONGODB_URI|POSTGRES_URL|JWT_SECRET|SESSION_SECRET|PRIVATE_KEY|CLIENT_SECRET|WEBHOOK_SECRET)\s*=\s*["']?([^"'\s]+)["']?\s*$/i;
  const fileLines = fileText.split(/\r?\n/);

  for (const fileLine of fileLines) {
    const secretAssignmentMatch = fileLine.match(secretAssignmentPattern);
    if (secretAssignmentMatch === null) {
      continue;
    }

    const assignedValue = secretAssignmentMatch[2] || "";
    if (isClearlyPlaceholderSecretValue(assignedValue) === true) {
      continue;
    }

    return `${secretAssignmentMatch[1]} assignment`;
  }

  return "";
}

function isClearlyPlaceholderSecretValue(assignedValue) {
  const normalizedAssignedValue = assignedValue.trim().toLowerCase();

  if (normalizedAssignedValue.length === 0) {
    return true;
  }

  const placeholderFragments = [
    "your_",
    "your-",
    "example",
    "placeholder",
    "changeme",
    "change_me",
    "change-me",
    "replace_me",
    "replace-me",
    "not-set",
    "dummy",
    "test_key",
    "test-token",
    "test_secret",
    "localhost",
  ];

  for (const placeholderFragment of placeholderFragments) {
    if (normalizedAssignedValue.includes(placeholderFragment) === true) {
      return true;
    }
  }

  return false;
}

function removePath(fileOrDirectoryPath) {
  fs.rmSync(fileOrDirectoryPath, { recursive: true, force: true });
}

function parseCommandLineArguments(rawArguments) {
  const parsedArguments = new Map();

  for (let argumentIndex = 0; argumentIndex < rawArguments.length; argumentIndex += 1) {
    const rawArgument = rawArguments[argumentIndex];
    if (rawArgument.startsWith("--") === false) {
      continue;
    }

    const argumentWithoutPrefix = rawArgument.slice(2);
    if (argumentWithoutPrefix.includes("=") === true) {
      const separatorIndex = argumentWithoutPrefix.indexOf("=");
      const argumentName = argumentWithoutPrefix.slice(0, separatorIndex);
      const argumentValue = argumentWithoutPrefix.slice(separatorIndex + 1);
      parsedArguments.set(argumentName, argumentValue);
      continue;
    }

    const nextArgument = rawArguments[argumentIndex + 1];
    if (nextArgument && nextArgument.startsWith("--") === false) {
      parsedArguments.set(argumentWithoutPrefix, nextArgument);
      argumentIndex += 1;
      continue;
    }

    parsedArguments.set(argumentWithoutPrefix, true);
  }

  return parsedArguments;
}

function hasFlag(parsedArguments, flagName) {
  return parsedArguments.get(flagName) === true;
}

function readArgumentValue(parsedArguments, argumentName, defaultValue) {
  if (parsedArguments.has(argumentName) === false) {
    return defaultValue;
  }

  const parsedValue = parsedArguments.get(argumentName);
  if (parsedValue === true) {
    return defaultValue;
  }

  return String(parsedValue);
}

function printLine(message) {
  if (shouldBeQuiet === false) {
    console.log(message);
  }
}

function failWithMessage(message, exitCode) {
  console.error(message);
  process.exit(exitCode);
}
