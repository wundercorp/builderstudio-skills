#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const commandLineArguments = parseCommandLineArguments(process.argv.slice(2));
const repositoryRootDirectoryPath = path.resolve(getArgumentValue(commandLineArguments, "root", process.cwd()));
const historyDirectory = normalizePath(getArgumentValue(commandLineArguments, "history-dir", "docs/history"));
const shouldAllowDocsOnly = hasFlag(commandLineArguments, "allow-docs-only");
const shouldWarnOnly = hasFlag(commandLineArguments, "warn-only");

if (fs.existsSync(repositoryRootDirectoryPath) === false) {
  failWithMessage(`Repository root does not exist: ${repositoryRootDirectoryPath}`);
}

const changedFilePaths = readChangedFilePaths(repositoryRootDirectoryPath);
const sourceChangedFilePaths = changedFilePaths.filter(isSourceLikePath);
const recordChangedFilePaths = changedFilePaths.filter(function filterRecordPath(filePath) {
  return isRecordPath(filePath, historyDirectory);
});

if (changedFilePaths.length === 0) {
  console.log("No Git changes detected.");
  process.exit(0);
}

if (sourceChangedFilePaths.length === 0 && shouldAllowDocsOnly === true) {
  console.log("Only documentation or non-source changes detected.");
  process.exit(0);
}

if (sourceChangedFilePaths.length === 0) {
  console.log("No source-like changes detected.");
  process.exit(0);
}

if (recordChangedFilePaths.length > 0) {
  console.log("Change record detected:");
  for (const recordChangedFilePath of recordChangedFilePaths) {
    console.log(`- ${recordChangedFilePath}`);
  }
  process.exit(0);
}

const messageLines = [
  "Source-like changes were detected without a matching change-history record.",
  "",
  "Changed source-like files:",
];

for (const sourceChangedFilePath of sourceChangedFilePaths) {
  messageLines.push(`- ${sourceChangedFilePath}`);
}

messageLines.push("");
messageLines.push("Create a history record before pushing or committing:");
messageLines.push("node scripts/archive-change.mjs --title \"Describe the change\" --type maintenance --summary \"Short summary\" --write");

if (shouldWarnOnly === true) {
  console.warn(messageLines.join("\n"));
  process.exit(0);
}

failWithMessage(messageLines.join("\n"));

function readChangedFilePaths(rootDirectoryPath) {
  const commandResult = spawnSync("git", ["status", "--short"], {
    cwd: rootDirectoryPath,
    encoding: "utf8",
  });

  if (commandResult.status !== 0) {
    return [];
  }

  return commandResult.stdout
    .split(/\r?\n/)
    .map(function mapStatusLine(statusLine) {
      return parseStatusLine(statusLine);
    })
    .filter(function filterPath(filePath) {
      return filePath.length > 0;
    });
}

function parseStatusLine(statusLine) {
  if (statusLine.trim().length === 0) {
    return "";
  }

  const trimmedPathText = statusLine.slice(3).trim();
  if (trimmedPathText.includes(" -> ") === true) {
    const pathParts = trimmedPathText.split(" -> ");
    return normalizePath(pathParts[pathParts.length - 1]);
  }

  return normalizePath(trimmedPathText);
}

function isSourceLikePath(filePath) {
  const normalizedFilePath = normalizePath(filePath);

  if (normalizedFilePath.startsWith("docs/") === true) {
    return false;
  }

  if (normalizedFilePath.startsWith(".github/") === true) {
    return false;
  }

  if (normalizedFilePath === "CHANGELOG.md" || normalizedFilePath === "README.md") {
    return false;
  }

  const sourceExtensions = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".mjs",
    ".cjs",
    ".py",
    ".java",
    ".kt",
    ".go",
    ".rs",
    ".rb",
    ".php",
    ".cs",
    ".swift",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
    ".sql",
    ".graphql",
    ".proto",
    ".html",
    ".css",
    ".scss",
    ".json",
    ".yaml",
    ".yml",
    ".xml",
    ".toml",
    ".gradle",
    ".tf",
    ".dockerfile",
  ];

  const lowerCasePath = normalizedFilePath.toLowerCase();

  if (lowerCasePath === "dockerfile" || lowerCasePath.endsWith("/dockerfile") === true) {
    return true;
  }

  return sourceExtensions.some(function checkExtension(extension) {
    return lowerCasePath.endsWith(extension);
  });
}

function isRecordPath(filePath, configuredHistoryDirectory) {
  const normalizedFilePath = normalizePath(filePath);

  if (normalizedFilePath === "CHANGELOG.md") {
    return true;
  }

  if (normalizedFilePath.startsWith(configuredHistoryDirectory + "/") === true) {
    return true;
  }

  if (normalizedFilePath.startsWith("docs/releases/") === true) {
    return true;
  }

  if (normalizedFilePath.startsWith("docs/decisions/") === true) {
    return true;
  }

  if (normalizedFilePath.startsWith("docs/migrations/") === true) {
    return true;
  }

  if (normalizedFilePath.startsWith("docs/api/") === true) {
    return true;
  }

  if (normalizedFilePath.startsWith("docs/deployments/") === true) {
    return true;
  }

  return false;
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/").replace(/^\.\//, "");
}

function parseCommandLineArguments(rawArguments) {
  const parsedArguments = new Map();

  for (let argumentIndex = 0; argumentIndex < rawArguments.length; argumentIndex += 1) {
    const rawArgument = rawArguments[argumentIndex];
    if (rawArgument.startsWith("--") === false) {
      continue;
    }

    const argumentWithoutPrefix = rawArgument.slice(2);
    if (argumentWithoutPrefix.includes("=")) {
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

function getArgumentValue(parsedArguments, argumentName, defaultValue) {
  if (parsedArguments.has(argumentName) === false) {
    return defaultValue;
  }

  const parsedValue = parsedArguments.get(argumentName);
  if (parsedValue === true) {
    return defaultValue;
  }

  return String(parsedValue);
}

function failWithMessage(message) {
  console.error(message);
  process.exit(1);
}
