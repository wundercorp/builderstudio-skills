#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const commandLineArguments = parseCommandLineArguments(process.argv.slice(2));
const repositoryRootDirectoryPath = path.resolve(getArgumentValue(commandLineArguments, "root", process.cwd()));
const shouldWriteFiles = hasFlag(commandLineArguments, "write");
const shouldUpdateChangelog = hasFlag(commandLineArguments, "update-changelog") || shouldWriteFiles === true;
const shouldCreateReleaseNote = hasFlag(commandLineArguments, "release-note") || hasFlag(commandLineArguments, "create-release-note");
const shouldCreateAdr = hasFlag(commandLineArguments, "adr") || hasFlag(commandLineArguments, "decision");
const shouldCreateMigrationNote = hasFlag(commandLineArguments, "migration");
const shouldCreateApiNote = hasFlag(commandLineArguments, "api-change") || hasFlag(commandLineArguments, "api");
const shouldCreateDeploymentNote = hasFlag(commandLineArguments, "deployment") || hasFlag(commandLineArguments, "deploy");
const shouldInstallGithubTemplates = hasFlag(commandLineArguments, "install-github-templates");

const title = getArgumentValue(commandLineArguments, "title", "").trim();
const changeType = getArgumentValue(commandLineArguments, "type", "maintenance").trim() || "maintenance";
const summary = getArgumentValue(commandLineArguments, "summary", "Not recorded").trim() || "Not recorded";
const reason = getArgumentValue(commandLineArguments, "reason", "Not recorded").trim() || "Not recorded";
const impact = getArgumentValue(commandLineArguments, "impact", "Not recorded").trim() || "Not recorded";
const risk = getArgumentValue(commandLineArguments, "risk", "Not recorded").trim() || "Not recorded";
const verification = getArgumentValue(commandLineArguments, "verification", "Not recorded").trim() || "Not recorded";
const followUp = getArgumentValue(commandLineArguments, "follow-up", "Not recorded").trim() || "Not recorded";
const author = getArgumentValue(commandLineArguments, "author", readGitUserName(repositoryRootDirectoryPath)).trim() || "Not recorded";
const releaseIdentifier = getArgumentValue(commandLineArguments, "release", getDateStamp()).trim() || getDateStamp();
const providedDate = getArgumentValue(commandLineArguments, "date", "").trim();
const recordDate = providedDate.length > 0 ? providedDate : new Date().toISOString();
const slug = slugify(title || changeType);

if (title.length === 0) {
  failWithMessage("Missing required --title value.");
}

if (fs.existsSync(repositoryRootDirectoryPath) === false) {
  failWithMessage(`Repository root does not exist: ${repositoryRootDirectoryPath}`);
}

const gitStatusText = runGitCommand(repositoryRootDirectoryPath, ["status", "--short"]);
const gitDiffStatText = runGitCommand(repositoryRootDirectoryPath, ["diff", "--stat"]);
const lastCommitText = runGitCommand(repositoryRootDirectoryPath, ["log", "-1", "--oneline"]);
const recordFilePath = buildHistoryRecordPath(repositoryRootDirectoryPath, recordDate, slug);
const filesToWrite = [];

filesToWrite.push({
  filePath: recordFilePath,
  content: buildChangeRecordMarkdown({
    title,
    recordDate,
    author,
    changeType,
    summary,
    reason,
    impact,
    risk,
    verification,
    followUp,
    gitStatusText,
    gitDiffStatText,
    lastCommitText,
  }),
  mode: "create",
});

filesToWrite.push({
  filePath: path.join(repositoryRootDirectoryPath, "docs", "history", "README.md"),
  content: buildHistoryReadmeMarkdown(),
  mode: "create-if-missing",
});

if (shouldUpdateChangelog === true) {
  const changelogFilePath = path.join(repositoryRootDirectoryPath, "CHANGELOG.md");
  const changelogText = buildUpdatedChangelog(changelogFilePath, title, changeType, recordFilePath);
  filesToWrite.push({ filePath: changelogFilePath, content: changelogText, mode: "write" });
}

if (shouldCreateReleaseNote === true) {
  const releaseFilePath = path.join(repositoryRootDirectoryPath, "docs", "releases", `${slugify(releaseIdentifier)}.md`);
  filesToWrite.push({ filePath: releaseFilePath, content: buildReleaseNoteMarkdown(releaseIdentifier, recordDate, title, summary, verification, risk), mode: "create" });
  filesToWrite.push({ filePath: path.join(repositoryRootDirectoryPath, "docs", "releases", "README.md"), content: buildSimpleIndexReadme("Release Notes", "Release notes record public artifacts, deployable builds, upgrade notes, verification, and rollback guidance."), mode: "create-if-missing" });
}

if (shouldCreateAdr === true) {
  const adrNumber = readNextAdrNumber(path.join(repositoryRootDirectoryPath, "docs", "decisions"));
  const adrFileName = `ADR-${String(adrNumber).padStart(4, "0")}-${slug}.md`;
  filesToWrite.push({ filePath: path.join(repositoryRootDirectoryPath, "docs", "decisions", adrFileName), content: buildAdrMarkdown(adrNumber, title, recordDate, summary, reason, impact), mode: "create" });
  filesToWrite.push({ filePath: path.join(repositoryRootDirectoryPath, "docs", "decisions", "README.md"), content: buildSimpleIndexReadme("Architecture Decision Records", "Architecture decision records explain meaningful technical choices, alternatives, and consequences."), mode: "create-if-missing" });
}

if (shouldCreateMigrationNote === true) {
  const migrationFilePath = path.join(repositoryRootDirectoryPath, "docs", "migrations", `${getDateStamp(recordDate)}-${slug}.md`);
  filesToWrite.push({ filePath: migrationFilePath, content: buildMigrationNoteMarkdown(title, recordDate, summary, verification, risk), mode: "create" });
  filesToWrite.push({ filePath: path.join(repositoryRootDirectoryPath, "docs", "migrations", "README.md"), content: buildSimpleIndexReadme("Migration Notes", "Migration notes record database, runtime, configuration, dependency, data, and file-layout migrations."), mode: "create-if-missing" });
}

if (shouldCreateApiNote === true) {
  const apiFilePath = path.join(repositoryRootDirectoryPath, "docs", "api", `${getDateStamp(recordDate)}-${slug}.md`);
  filesToWrite.push({ filePath: apiFilePath, content: buildApiChangeNoteMarkdown(title, recordDate, summary, verification), mode: "create" });
  filesToWrite.push({ filePath: path.join(repositoryRootDirectoryPath, "docs", "api", "README.md"), content: buildSimpleIndexReadme("API Change Notes", "API change notes record public contracts, endpoints, request and response shapes, auth rules, and compatibility notes."), mode: "create-if-missing" });
}

if (shouldCreateDeploymentNote === true) {
  const deploymentFilePath = path.join(repositoryRootDirectoryPath, "docs", "deployments", `${getDateStamp(recordDate)}-${slug}.md`);
  filesToWrite.push({ filePath: deploymentFilePath, content: buildDeploymentNoteMarkdown(title, recordDate, summary, verification, risk), mode: "create" });
  filesToWrite.push({ filePath: path.join(repositoryRootDirectoryPath, "docs", "deployments", "README.md"), content: buildSimpleIndexReadme("Deployment Notes", "Deployment notes record build, hosting, environment, health check, smoke test, and rollback details."), mode: "create-if-missing" });
}

if (shouldInstallGithubTemplates === true) {
  filesToWrite.push({ filePath: path.join(repositoryRootDirectoryPath, ".github", "PULL_REQUEST_TEMPLATE.md"), content: buildPullRequestTemplateMarkdown(), mode: "create-if-missing" });
  filesToWrite.push({ filePath: path.join(repositoryRootDirectoryPath, ".github", "ISSUE_TEMPLATE", "change-record.md"), content: buildChangeRecordIssueTemplateMarkdown(), mode: "create-if-missing" });
}

printPlannedWrites(filesToWrite, shouldWriteFiles);

if (shouldWriteFiles === true) {
  writePlannedFiles(filesToWrite);
  console.log("Archivist records updated.");
} else {
  console.log("Dry run only. Re-run with --write to create or update these files.");
}

function buildHistoryRecordPath(rootDirectoryPath, dateValue, titleSlug) {
  const dateObject = new Date(dateValue);
  let yearText = String(dateObject.getUTCFullYear());
  let monthText = String(dateObject.getUTCMonth() + 1).padStart(2, "0");
  let dayText = String(dateObject.getUTCDate()).padStart(2, "0");
  let hourText = String(dateObject.getUTCHours()).padStart(2, "0");
  let minuteText = String(dateObject.getUTCMinutes()).padStart(2, "0");

  if (Number.isNaN(dateObject.getTime()) === true) {
    const fallbackDateParts = getDateStamp().split("-");
    yearText = fallbackDateParts[0];
    monthText = fallbackDateParts[1];
    dayText = fallbackDateParts[2];
    hourText = "0000";
    minuteText = "";
  }

  const fileName = `${yearText}-${monthText}-${dayText}-${hourText}${minuteText}-${titleSlug}.md`;
  return path.join(rootDirectoryPath, "docs", "history", yearText, monthText, fileName);
}

function buildChangeRecordMarkdown(changeRecord) {
  const relativeRecordSections = [
    `# Change Record: ${changeRecord.title}`,
    "",
    `- Date: ${changeRecord.recordDate}`,
    `- Author: ${changeRecord.author}`,
    `- Type: ${changeRecord.changeType}`,
    "- Status: Recorded",
    "- Related PRs: Not recorded",
    "- Related commits: Not recorded",
    "- Related issues: Not recorded",
    "",
    "## Summary",
    "",
    changeRecord.summary,
    "",
    "## Reason",
    "",
    changeRecord.reason,
    "",
    "## Scope",
    "",
    changeRecord.impact,
    "",
    "## Files and systems touched",
    "",
    textOrNotRecorded(changeRecord.gitDiffStatText),
    "",
    "## Current Git status",
    "",
    fencedTextOrNotRecorded(changeRecord.gitStatusText),
    "",
    "## Last known commit",
    "",
    textOrNotRecorded(changeRecord.lastCommitText),
    "",
    "## User-visible behavior",
    "",
    "Not recorded",
    "",
    "## Developer-visible behavior",
    "",
    "Not recorded",
    "",
    "## Configuration changes",
    "",
    "Not recorded",
    "",
    "## Data and migration notes",
    "",
    "Not recorded",
    "",
    "## Deployment impact",
    "",
    "Not recorded",
    "",
    "## Risk and rollback",
    "",
    changeRecord.risk,
    "",
    "## Verification",
    "",
    changeRecord.verification,
    "",
    "## Follow-up",
    "",
    changeRecord.followUp,
    "",
  ];

  return relativeRecordSections.join("\n");
}

function buildHistoryReadmeMarkdown() {
  return [
    "# Change History",
    "",
    "This directory is the repository system of record for meaningful codebase updates.",
    "",
    "Each record should explain what changed, why it changed, how it was verified, what risks remain, and what future maintainers need to know.",
    "",
    "## Conventions",
    "",
    "- Store records by year and month.",
    "- Keep `CHANGELOG.md` as the short release-facing summary.",
    "- Use specialized notes in `docs/decisions`, `docs/migrations`, `docs/api`, `docs/releases`, and `docs/deployments` when a change needs extra context.",
    "- Do not record secret values or private customer data.",
    "",
  ].join("\n");
}

function buildUpdatedChangelog(changelogFilePath, currentTitle, currentChangeType, historyRecordFilePath) {
  let changelogText = "";
  if (fs.existsSync(changelogFilePath) === true) {
    changelogText = fs.readFileSync(changelogFilePath, "utf8");
  }

  if (changelogText.trim().length === 0) {
    changelogText = [
      "# Changelog",
      "",
      "All notable changes to this project are documented in this file.",
      "",
      "## Unreleased",
      "",
      "### Added",
      "",
      "### Changed",
      "",
      "### Fixed",
      "",
      "### Security",
      "",
    ].join("\n");
  }

  if (changelogText.includes("## Unreleased") === false) {
    changelogText = changelogText.trimEnd() + "\n\n## Unreleased\n\n";
  }

  const heading = chooseChangelogHeading(currentChangeType);
  if (changelogText.includes(`### ${heading}`) === false) {
    changelogText = changelogText.replace("## Unreleased", `## Unreleased\n\n### ${heading}\n`);
  }

  const relativeHistoryPath = path.relative(path.dirname(changelogFilePath), historyRecordFilePath).split(path.sep).join("/");
  const newEntry = `- ${currentTitle} ([history](${relativeHistoryPath})).`;

  if (changelogText.includes(newEntry) === true) {
    return changelogText.trimEnd() + "\n";
  }

  const headingPattern = new RegExp(`(### ${escapeRegExp(heading)}\\n)([\\s\\S]*?)(?=\\n### |\\n## |$)`);
  if (headingPattern.test(changelogText) === true) {
    return changelogText.replace(headingPattern, function replaceHeading(matchText, headingText, bodyText) {
      let normalizedBodyText = bodyText.trimEnd();
      if (normalizedBodyText.length > 0) {
        normalizedBodyText = normalizedBodyText + "\n";
      }
      return `${headingText}${normalizedBodyText}${newEntry}\n`;
    }).trimEnd() + "\n";
  }

  return changelogText.trimEnd() + `\n\n### ${heading}\n${newEntry}\n`;
}

function chooseChangelogHeading(currentChangeType) {
  const normalizedChangeType = currentChangeType.toLowerCase();

  if (normalizedChangeType === "feature" || normalizedChangeType === "added" || normalizedChangeType === "add") {
    return "Added";
  }

  if (normalizedChangeType === "fix" || normalizedChangeType === "bugfix" || normalizedChangeType === "bug") {
    return "Fixed";
  }

  if (normalizedChangeType === "security") {
    return "Security";
  }

  if (normalizedChangeType === "migration") {
    return "Migration";
  }

  if (normalizedChangeType === "deploy" || normalizedChangeType === "deployment") {
    return "Deployment";
  }

  if (normalizedChangeType === "docs" || normalizedChangeType === "documentation") {
    return "Documentation";
  }

  return "Changed";
}

function buildReleaseNoteMarkdown(currentReleaseIdentifier, currentRecordDate, currentTitle, currentSummary, currentVerification, currentRisk) {
  return [
    `# Release Notes: ${currentReleaseIdentifier}`,
    "",
    `- Date: ${currentRecordDate}`,
    "- Status: Draft",
    "- Artifact: Not recorded",
    "- Deployment: Not recorded",
    "",
    "## Summary",
    "",
    currentSummary,
    "",
    "## Highlights",
    "",
    `- ${currentTitle}`,
    "",
    "## Changes",
    "",
    "### Added",
    "",
    "### Changed",
    "",
    "### Fixed",
    "",
    "### Security",
    "",
    "## Upgrade notes",
    "",
    "Not recorded",
    "",
    "## Migration notes",
    "",
    "Not recorded",
    "",
    "## Known issues",
    "",
    currentRisk,
    "",
    "## Verification",
    "",
    currentVerification,
    "",
    "## Rollback",
    "",
    "Not recorded",
    "",
  ].join("\n");
}

function buildAdrMarkdown(adrNumber, currentTitle, currentRecordDate, currentSummary, currentReason, currentImpact) {
  return [
    `# ADR-${String(adrNumber).padStart(4, "0")}: ${currentTitle}`,
    "",
    "- Status: Proposed",
    `- Date: ${currentRecordDate}`,
    "- Deciders: Not recorded",
    "",
    "## Context",
    "",
    currentReason,
    "",
    "## Decision",
    "",
    currentSummary,
    "",
    "## Consequences",
    "",
    currentImpact,
    "",
    "## Alternatives considered",
    "",
    "Not recorded",
    "",
    "## Follow-up",
    "",
    "Not recorded",
    "",
  ].join("\n");
}

function buildMigrationNoteMarkdown(currentTitle, currentRecordDate, currentSummary, currentVerification, currentRisk) {
  return [
    `# Migration Note: ${currentTitle}`,
    "",
    `- Date: ${currentRecordDate}`,
    "- Status: Draft",
    "- Type: Not recorded",
    "",
    "## Summary",
    "",
    currentSummary,
    "",
    "## Previous state",
    "",
    "Not recorded",
    "",
    "## New state",
    "",
    "Not recorded",
    "",
    "## Migration steps",
    "",
    "Not recorded",
    "",
    "## Rollback steps",
    "",
    currentRisk,
    "",
    "## Data safety notes",
    "",
    "Not recorded",
    "",
    "## Commands",
    "",
    "Not recorded",
    "",
    "## Verification",
    "",
    currentVerification,
    "",
  ].join("\n");
}

function buildApiChangeNoteMarkdown(currentTitle, currentRecordDate, currentSummary, currentVerification) {
  return [
    `# API Change Note: ${currentTitle}`,
    "",
    `- Date: ${currentRecordDate}`,
    "- Status: Draft",
    "- Compatibility: Not recorded",
    "",
    "## Summary",
    "",
    currentSummary,
    "",
    "## Endpoint or contract",
    "",
    "Not recorded",
    "",
    "## Request changes",
    "",
    "Not recorded",
    "",
    "## Response changes",
    "",
    "Not recorded",
    "",
    "## Authentication and authorization changes",
    "",
    "Not recorded",
    "",
    "## Client update requirements",
    "",
    "Not recorded",
    "",
    "## Verification",
    "",
    currentVerification,
    "",
  ].join("\n");
}

function buildDeploymentNoteMarkdown(currentTitle, currentRecordDate, currentSummary, currentVerification, currentRisk) {
  return [
    `# Deployment Note: ${currentTitle}`,
    "",
    `- Date: ${currentRecordDate}`,
    "- Environment: Not recorded",
    "- Status: Draft",
    "",
    "## Summary",
    "",
    currentSummary,
    "",
    "## Build command",
    "",
    "Not recorded",
    "",
    "## Start command",
    "",
    "Not recorded",
    "",
    "## Required configuration",
    "",
    "Record variable names only. Do not record values.",
    "",
    "## Health check",
    "",
    "Not recorded",
    "",
    "## Smoke tests",
    "",
    currentVerification,
    "",
    "## Rollback plan",
    "",
    currentRisk,
    "",
  ].join("\n");
}

function buildSimpleIndexReadme(currentTitle, description) {
  return [
    `# ${currentTitle}`,
    "",
    description,
    "",
    "Do not record secret values or private customer data in this directory.",
    "",
  ].join("\n");
}

function buildPullRequestTemplateMarkdown() {
  return [
    "# Pull Request",
    "",
    "## Summary",
    "",
    "Describe what changed and why.",
    "",
    "## Change type",
    "",
    "- [ ] Feature",
    "- [ ] Fix",
    "- [ ] Refactor",
    "- [ ] Documentation",
    "- [ ] Migration",
    "- [ ] API change",
    "- [ ] Deployment change",
    "- [ ] Security",
    "- [ ] Maintenance",
    "",
    "## Records updated",
    "",
    "- [ ] `CHANGELOG.md` updated or intentionally not needed",
    "- [ ] `docs/history` record created or intentionally not needed",
    "- [ ] ADR created when an architecture decision was made",
    "- [ ] Migration note created when data, runtime, configuration, or package structure changed",
    "- [ ] API note created when public contracts changed",
    "- [ ] Deployment note created when build, hosting, or environment behavior changed",
    "- [ ] Release notes created when this prepares a public artifact or deploy",
    "",
    "## Verification",
    "",
    "List commands, manual checks, screenshots, logs, or review steps.",
    "",
    "## Risk and rollback",
    "",
    "Explain risk, rollback path, and follow-up work.",
    "",
  ].join("\n");
}

function buildChangeRecordIssueTemplateMarkdown() {
  return [
    "---",
    "name: Change record",
    "about: Request or track repository history documentation for a meaningful change",
    "title: \"Change record: \"",
    "labels: documentation, changelog",
    "assignees: \"\"",
    "---",
    "",
    "## Requested change",
    "",
    "## Reason",
    "",
    "## Affected files or systems",
    "",
    "## Required records",
    "",
    "- [ ] Changelog entry",
    "- [ ] History record",
    "- [ ] ADR",
    "- [ ] Migration note",
    "- [ ] API note",
    "- [ ] Deployment note",
    "- [ ] Release notes",
    "",
    "## Verification expectation",
    "",
    "## Release or deployment impact",
    "",
  ].join("\n");
}

function readNextAdrNumber(decisionsDirectoryPath) {
  if (fs.existsSync(decisionsDirectoryPath) === false) {
    return 1;
  }

  const existingNumbers = fs.readdirSync(decisionsDirectoryPath)
    .map(function mapFileName(fileName) {
      const matchResult = fileName.match(/^ADR-(\d{4})-/i);
      if (matchResult === null) {
        return 0;
      }
      return Number.parseInt(matchResult[1], 10);
    })
    .filter(function filterValidNumber(value) {
      return Number.isFinite(value) === true && value > 0;
    });

  if (existingNumbers.length === 0) {
    return 1;
  }

  return Math.max(...existingNumbers) + 1;
}

function printPlannedWrites(plannedFiles, writingEnabled) {
  if (writingEnabled === true) {
    console.log("Files to write:");
  } else {
    console.log("Files that would be written:");
  }

  for (const plannedFile of plannedFiles) {
    const relativeFilePath = path.relative(repositoryRootDirectoryPath, plannedFile.filePath).split(path.sep).join("/");
    console.log(`- ${relativeFilePath} (${plannedFile.mode})`);
  }
}

function writePlannedFiles(plannedFiles) {
  for (const plannedFile of plannedFiles) {
    if (plannedFile.mode === "create-if-missing" && fs.existsSync(plannedFile.filePath) === true) {
      continue;
    }

    if (plannedFile.mode === "create" && fs.existsSync(plannedFile.filePath) === true) {
      failWithMessage(`Refusing to overwrite existing file: ${plannedFile.filePath}`);
    }

    fs.mkdirSync(path.dirname(plannedFile.filePath), { recursive: true });
    fs.writeFileSync(plannedFile.filePath, plannedFile.content);
  }
}

function readGitUserName(rootDirectoryPath) {
  const gitUserName = runGitCommand(rootDirectoryPath, ["config", "user.name"]);
  if (gitUserName.trim().length > 0) {
    return gitUserName.trim();
  }
  return "Not recorded";
}

function runGitCommand(rootDirectoryPath, gitArguments) {
  const commandResult = spawnSync("git", gitArguments, {
    cwd: rootDirectoryPath,
    encoding: "utf8",
  });

  if (commandResult.status !== 0) {
    return "";
  }

  return commandResult.stdout.trim();
}

function textOrNotRecorded(textValue) {
  if (textValue.trim().length === 0) {
    return "Not recorded";
  }
  return textValue.trim();
}

function fencedTextOrNotRecorded(textValue) {
  if (textValue.trim().length === 0) {
    return "Not recorded";
  }
  return "```text\n" + textValue.trim() + "\n```";
}

function slugify(value) {
  const slugText = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

  if (slugText.length === 0) {
    return "change";
  }

  return slugText.slice(0, 80);
}

function getDateStamp(dateValue = "") {
  let dateObject = new Date();
  if (dateValue.length > 0) {
    dateObject = new Date(dateValue);
  }

  if (Number.isNaN(dateObject.getTime()) === true) {
    dateObject = new Date();
  }

  const yearText = String(dateObject.getUTCFullYear());
  const monthText = String(dateObject.getUTCMonth() + 1).padStart(2, "0");
  const dayText = String(dateObject.getUTCDate()).padStart(2, "0");
  return `${yearText}-${monthText}-${dayText}`;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
