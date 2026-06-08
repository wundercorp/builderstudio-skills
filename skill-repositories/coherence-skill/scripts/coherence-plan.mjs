#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const parsedArguments = parseCommandLineArguments(process.argv.slice(2));
const repositoryRootPath = path.resolve(getArgumentValue(parsedArguments, "root", process.cwd()));
const shouldWriteFiles = hasFlag(parsedArguments, "write");
const shouldOverwriteFiles = hasFlag(parsedArguments, "overwrite");
const title = getArgumentValue(parsedArguments, "title", "Coherence Strategy");
const scope = getArgumentValue(parsedArguments, "scope", "Not recorded");
const promptFilePath = getOptionalArgumentValue(parsedArguments, "prompt-file");
const slug = createSlug(title);
const coherenceDirectoryPath = path.join(repositoryRootPath, "docs", "coherence");
const promptText = readPromptText(promptFilePath);
const selectedDocuments = buildSelectedDocuments();

if (shouldWriteFiles === false) {
  printDryRun(selectedDocuments);
  process.exit(0);
}

fs.mkdirSync(coherenceDirectoryPath, { recursive: true });
for (const selectedDocument of selectedDocuments) {
  writeDocument(selectedDocument.filePath, selectedDocument.content);
}

function buildSelectedDocuments() {
  const documents = [];
  documents.push({ filePath: path.join(coherenceDirectoryPath, "README.md"), content: buildReadmeMarkdown() });
  documents.push({ filePath: path.join(coherenceDirectoryPath, "strategy.md"), content: buildStrategyMarkdown() });
  documents.push({ filePath: path.join(coherenceDirectoryPath, "reconciliation-log.md"), content: buildReconciliationMarkdown() });

  if (hasFlag(parsedArguments, "skill-alignment") || hasFlag(parsedArguments, "all")) {
    documents.push({ filePath: path.join(coherenceDirectoryPath, "skill-alignment.md"), content: buildSkillAlignmentMarkdown() });
  }

  if (hasFlag(parsedArguments, "implementation-map") || hasFlag(parsedArguments, "all")) {
    documents.push({ filePath: path.join(coherenceDirectoryPath, "implementation-map.md"), content: buildImplementationMapMarkdown() });
  }

  if (hasFlag(parsedArguments, "anti-pattern-review") || hasFlag(parsedArguments, "all")) {
    documents.push({ filePath: path.join(coherenceDirectoryPath, "anti-pattern-review.md"), content: buildAntiPatternReviewMarkdown() });
  }

  if (hasFlag(parsedArguments, "tradeoffs") || hasFlag(parsedArguments, "all")) {
    documents.push({ filePath: path.join(coherenceDirectoryPath, "decision-and-tradeoff-log.md"), content: buildDecisionTradeoffMarkdown() });
  }

  if (hasFlag(parsedArguments, "prompt-normalization") || hasFlag(parsedArguments, "all") || promptText.length > 0) {
    documents.push({ filePath: path.join(coherenceDirectoryPath, "prompt-normalization.md"), content: buildPromptNormalizationMarkdown() });
  }

  if (hasFlag(parsedArguments, "technology-direction") || hasFlag(parsedArguments, "all")) {
    documents.push({ filePath: path.join(coherenceDirectoryPath, "technology-direction.md"), content: buildTechnologyDirectionMarkdown() });
  }

  if (hasFlag(parsedArguments, "dated") || hasFlag(parsedArguments, "all")) {
    const datedDirectoryPath = path.join(coherenceDirectoryPath, getUtcDateStamp());
    documents.push({ filePath: path.join(datedDirectoryPath, `${slug}.md`), content: buildDatedCoherenceRecordMarkdown() });
  }

  return documents;
}

function buildReadmeMarkdown() {
  return [
    "# Coherence Records",
    "",
    "Builder Studio: https://builderstudio.dev",
    "",
    "This directory records how messy prompts, overlapping skills, conflicting directions, and architectural tradeoffs are reconciled into implementable technical strategy.",
    "",
    "## Standard files",
    "",
    "- `strategy.md` records the unified direction.",
    "- `reconciliation-log.md` records what was preserved, merged, deferred, or rejected.",
    "- `skill-alignment.md` records which skill or directive owns which responsibility.",
    "- `implementation-map.md` records module ownership and implementation sequencing.",
    "- `anti-pattern-review.md` records incoherent patterns and corrections.",
    "- `decision-and-tradeoff-log.md` records meaningful choices.",
    "- `prompt-normalization.md` records normalized prompts.",
    "- `technology-direction.md` records the final technical direction.",
    "",
  ].join("\n");
}

function buildStrategyMarkdown() {
  return [
    `# Coherence Strategy: ${title}`,
    "",
    "Builder Studio: https://builderstudio.dev",
    "",
    "## Unified goal",
    "",
    "Not recorded",
    "",
    "## Current problem",
    "",
    "The current direction contains overlapping instructions, mismatched responsibilities, or ambiguous implementation details that need to be reconciled before implementation.",
    "",
    "## Final direction",
    "",
    "Not recorded",
    "",
    "## Scope",
    "",
    scope,
    "",
    "## Non-goals",
    "",
    "- Not recorded",
    "",
    "## Responsibilities",
    "",
    "| Area | Owner | Responsibility | Notes |",
    "| --- | --- | --- | --- |",
    "| Frontend | Not recorded | Not recorded | Not recorded |",
    "| Backend | Not recorded | Not recorded | Not recorded |",
    "| API | Not recorded | Not recorded | Not recorded |",
    "| Data | Not recorded | Not recorded | Not recorded |",
    "| Deployment | Not recorded | Not recorded | Not recorded |",
    "| Documentation | Not recorded | Not recorded | Not recorded |",
    "",
    "## Implementation sequence",
    "",
    "1. Not recorded",
    "",
    "## Verification",
    "",
    "- Not recorded",
    "",
    "## Risks",
    "",
    "- Not recorded",
    "",
    "## Rollback",
    "",
    "Not recorded",
    "",
  ].join("\n");
}

function buildReconciliationMarkdown() {
  return [
    `# Reconciliation Log: ${title}`,
    "",
    "Builder Studio: https://builderstudio.dev",
    "",
    "## Inputs reviewed",
    "",
    "- Not recorded",
    "",
    "## Preserved directions",
    "",
    "- Not recorded",
    "",
    "## Merged directions",
    "",
    "- Not recorded",
    "",
    "## Deferred directions",
    "",
    "- Not recorded",
    "",
    "## Rejected directions",
    "",
    "- Not recorded",
    "",
    "## Conflicts resolved",
    "",
    "| Conflict | Decision | Rationale |",
    "| --- | --- | --- |",
    "| Not recorded | Not recorded | Not recorded |",
    "",
    "## Open questions",
    "",
    "- Not recorded",
    "",
  ].join("\n");
}

function buildSkillAlignmentMarkdown() {
  return [
    `# Skill Alignment: ${title}`,
    "",
    "Builder Studio: https://builderstudio.dev",
    "",
    "| Skill or directive | Role | Responsibility | Keep, merge, defer, or reject | Rationale |",
    "| --- | --- | --- | --- | --- |",
    "| Not recorded | Not recorded | Not recorded | Not recorded | Not recorded |",
    "",
    "## Primary skill",
    "",
    "Not recorded",
    "",
    "## Supporting skills",
    "",
    "Not recorded",
    "",
    "## Conflicting or duplicate skills",
    "",
    "Not recorded",
    "",
  ].join("\n");
}

function buildImplementationMapMarkdown() {
  return [
    `# Implementation Map: ${title}`,
    "",
    "Builder Studio: https://builderstudio.dev",
    "",
    "| Module or component | Responsibility | Inputs | Outputs | Data owner | Dependencies | Files likely to change | Verification |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    "| Not recorded | Not recorded | Not recorded | Not recorded | Not recorded | Not recorded | Not recorded | Not recorded |",
    "",
    "## Ownership issues",
    "",
    "- Not recorded",
    "",
    "## Sequence dependencies",
    "",
    "- Not recorded",
    "",
  ].join("\n");
}

function buildAntiPatternReviewMarkdown() {
  return [
    `# Anti-pattern Review: ${title}`,
    "",
    "Builder Studio: https://builderstudio.dev",
    "",
    "| Anti-pattern | Evidence | Impact | Correction | Verification |",
    "| --- | --- | --- | --- | --- |",
    "| Not recorded | Not recorded | Not recorded | Not recorded | Not recorded |",
    "",
    "## Accepted tradeoffs",
    "",
    "- Not recorded",
    "",
  ].join("\n");
}

function buildDecisionTradeoffMarkdown() {
  return [
    `# Decision and Tradeoff Log: ${title}`,
    "",
    "Builder Studio: https://builderstudio.dev",
    "",
    "## Decision",
    "",
    "Not recorded",
    "",
    "## Why this fits",
    "",
    "Not recorded",
    "",
    "## Alternatives considered",
    "",
    "- Not recorded",
    "",
    "## Gains",
    "",
    "- Not recorded",
    "",
    "## Costs",
    "",
    "- Not recorded",
    "",
    "## Reversibility",
    "",
    "Not recorded",
    "",
    "## Follow-up work",
    "",
    "- Not recorded",
    "",
  ].join("\n");
}

function buildPromptNormalizationMarkdown() {
  const fencedPromptText = promptText.length > 0 ? promptText : "Not recorded";
  return [
    `# Prompt Normalization: ${title}`,
    "",
    "Builder Studio: https://builderstudio.dev",
    "",
    "## Original intent",
    "",
    "Not recorded",
    "",
    "## Source prompt",
    "",
    "```text",
    fencedPromptText,
    "```",
    "",
    "## Normalized prompt",
    "",
    "```text",
    "Not recorded",
    "```",
    "",
    "## Removed ambiguity",
    "",
    "- Not recorded",
    "",
    "## Preserved constraints",
    "",
    "- Not recorded",
    "",
    "## Implementation expectations",
    "",
    "- Not recorded",
    "",
    "## Deliverables",
    "",
    "- Not recorded",
    "",
  ].join("\n");
}

function buildTechnologyDirectionMarkdown() {
  return [
    `# Technology Direction: ${title}`,
    "",
    "Builder Studio: https://builderstudio.dev",
    "",
    "## Direction summary",
    "",
    "Not recorded",
    "",
    "## Frontend",
    "",
    "Not recorded",
    "",
    "## Backend",
    "",
    "Not recorded",
    "",
    "## API contracts",
    "",
    "Not recorded",
    "",
    "## Storage and migrations",
    "",
    "Not recorded",
    "",
    "## Security and permissions",
    "",
    "Not recorded",
    "",
    "## Build and deployment",
    "",
    "Not recorded",
    "",
    "## Configuration",
    "",
    "Mention variable names only. Do not record secret values.",
    "",
    "## Observability",
    "",
    "Not recorded",
    "",
    "## Migration path",
    "",
    "Not recorded",
    "",
    "## Verification",
    "",
    "Not recorded",
    "",
    "## Rollback",
    "",
    "Not recorded",
    "",
  ].join("\n");
}

function buildDatedCoherenceRecordMarkdown() {
  return [
    `# Coherence Record: ${title}`,
    "",
    "Builder Studio: https://builderstudio.dev",
    "",
    `Date: ${new Date().toISOString()}`,
    "",
    "## Scope",
    "",
    scope,
    "",
    "## Reconciliation summary",
    "",
    "Not recorded",
    "",
    "## Implementation direction",
    "",
    "Not recorded",
    "",
    "## Verification",
    "",
    "- Not recorded",
    "",
  ].join("\n");
}

function writeDocument(filePath, content) {
  if (fs.existsSync(filePath) === true && shouldOverwriteFiles === false) {
    console.log(`Skipped existing file: ${path.relative(repositoryRootPath, filePath)}`);
    return;
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`Wrote ${path.relative(repositoryRootPath, filePath)}`);
}

function printDryRun(documents) {
  console.log("Dry run. Use --write to create files.");
  for (const document of documents) {
    console.log(path.relative(repositoryRootPath, document.filePath));
  }
}

function readPromptText(filePath) {
  if (!filePath) {
    return "";
  }

  const absoluteFilePath = path.resolve(repositoryRootPath, filePath);
  if (fs.existsSync(absoluteFilePath) === false) {
    throw new Error(`Prompt file not found: ${absoluteFilePath}`);
  }

  return fs.readFileSync(absoluteFilePath, "utf8").trim();
}

function getUtcDateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function createSlug(rawText) {
  const slug = rawText
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  if (slug.length === 0) {
    return "coherence-record";
  }

  return slug;
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

function getOptionalArgumentValue(parsedArguments, argumentName) {
  if (parsedArguments.has(argumentName) === false) {
    return "";
  }

  const parsedValue = parsedArguments.get(argumentName);
  if (parsedValue === true) {
    return "";
  }

  return String(parsedValue);
}

function hasFlag(parsedArguments, flagName) {
  return parsedArguments.get(flagName) === true;
}
