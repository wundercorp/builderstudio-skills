#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const argumentsMap = parseArguments(process.argv.slice(2));
const projectRoot = path.resolve(getArgumentValue(argumentsMap, "root", "."));
const videoDirectory = path.join(projectRoot, "video");
const requiredFiles = [
  "brief.md",
  "script.md",
  "style-bible.md",
  "storyboard.md",
  "shot-list.md",
  "ai-prompt-pack.md",
  "asset-list.md",
  "sound-map.md",
  "qa-checklist.md",
];

let hasFailure = false;

for (const requiredFileName of requiredFiles) {
  const requiredFilePath = path.join(videoDirectory, requiredFileName);
  if (fs.existsSync(requiredFilePath) === false) {
    console.error(`Missing video/${requiredFileName}`);
    hasFailure = true;
    continue;
  }
  const content = fs.readFileSync(requiredFilePath, "utf8");
  if (content.trim().length < 40) {
    console.error(`video/${requiredFileName} appears too short to be useful`);
    hasFailure = true;
  }
}

if (hasFailure) {
  process.exit(1);
}

console.log("Ogilvideo check passed.");

function parseArguments(rawArguments) {
  const parsedArguments = new Map();
  for (let argumentIndex = 0; argumentIndex < rawArguments.length; argumentIndex += 1) {
    const rawArgument = rawArguments[argumentIndex];
    if (rawArgument.startsWith("--") === false) {
      continue;
    }
    const argumentWithoutPrefix = rawArgument.slice(2);
    if (argumentWithoutPrefix.includes("=")) {
      const separatorIndex = argumentWithoutPrefix.indexOf("=");
      parsedArguments.set(argumentWithoutPrefix.slice(0, separatorIndex), argumentWithoutPrefix.slice(separatorIndex + 1));
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

function getArgumentValue(argumentsMap, argumentName, fallbackValue) {
  if (argumentsMap.has(argumentName) === false) {
    return fallbackValue;
  }
  const value = argumentsMap.get(argumentName);
  if (value === true) {
    return fallbackValue;
  }
  return String(value);
}
