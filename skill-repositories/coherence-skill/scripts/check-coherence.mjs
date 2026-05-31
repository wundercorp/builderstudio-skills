#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const parsedArguments = parseCommandLineArguments(process.argv.slice(2));
const repositoryRootPath = path.resolve(getArgumentValue(parsedArguments, "root", process.cwd()));
const shouldAllowMissingGit = hasFlag(parsedArguments, "allow-missing-git");
const changedFiles = collectChangedFiles();

if (changedFiles.length === 0) {
  console.log("No changed files detected.");
  process.exit(0);
}

const sourceChanges = changedFiles.filter((filePath) => isSourceLikePath(filePath));
const coherenceChanges = changedFiles.filter((filePath) => isCoherencePath(filePath));
const docsChanges = changedFiles.filter((filePath) => isGeneralDocumentationPath(filePath));

if (sourceChanges.length === 0) {
  console.log("No source-like changes requiring coherence documentation were detected.");
  process.exit(0);
}

if (coherenceChanges.length > 0 || docsChanges.length > 0) {
  console.log("Coherence check passed. Source-like changes are paired with coherence or documentation updates.");
  process.exit(0);
}

console.error("Coherence check failed. Source-like changes were detected without docs/coherence or related documentation updates.");
console.error("");
console.error("Source-like changes:");
for (const changedFile of sourceChanges) {
  console.error(`- ${changedFile}`);
}
console.error("");
console.error("Create a coherence record with:");
console.error("node scripts/coherence-plan.mjs --title \"Describe the change\" --all --write");
process.exit(1);

function collectChangedFiles() {
  const gitResult = spawnSync("git", ["status", "--porcelain"], {
    cwd: repositoryRootPath,
    encoding: "utf8",
  });

  if (gitResult.status !== 0) {
    if (shouldAllowMissingGit === true) {
      return [];
    }

    console.error("Unable to read git status. Run inside a Git repository or pass --allow-missing-git.");
    process.exit(1);
  }

  return gitResult.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => normalizeGitStatusPath(line))
    .filter((line) => line.length > 0);
}

function normalizeGitStatusPath(statusLine) {
  const withoutStatus = statusLine.slice(2).trim();
  if (withoutStatus.includes(" -> ")) {
    return withoutStatus.split(" -> ").pop().trim();
  }

  return withoutStatus;
}

function isSourceLikePath(filePath) {
  const normalizedPath = filePath.replace(/\\/g, "/").toLowerCase();

  if (normalizedPath.startsWith("docs/") || normalizedPath.startsWith(".github/") || normalizedPath === "changelog.md" || normalizedPath === "readme.md") {
    return false;
  }

  if (normalizedPath.startsWith("node_modules/") || normalizedPath.startsWith("dist/") || normalizedPath.startsWith("build/") || normalizedPath.startsWith("coverage/")) {
    return false;
  }

  return /\.(js|jsx|ts|tsx|java|kt|go|rs|py|rb|php|cs|cpp|c|h|swift|mjs|cjs|sql|yaml|yml|json|toml|xml|html|css|scss|sass|vue|svelte|sh|ps1)$/i.test(normalizedPath);
}

function isCoherencePath(filePath) {
  return filePath.replace(/\\/g, "/").toLowerCase().startsWith("docs/coherence/");
}

function isGeneralDocumentationPath(filePath) {
  const normalizedPath = filePath.replace(/\\/g, "/").toLowerCase();
  return normalizedPath === "changelog.md" || normalizedPath.startsWith("docs/") || normalizedPath.startsWith(".github/");
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

function hasFlag(parsedArguments, flagName) {
  return parsedArguments.get(flagName) === true;
}
