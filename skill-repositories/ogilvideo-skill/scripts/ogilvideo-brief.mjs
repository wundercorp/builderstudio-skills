#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const argumentsMap = parseArguments(process.argv.slice(2));
const projectRoot = path.resolve(getArgumentValue(argumentsMap, "root", "."));
const videoDirectory = path.join(projectRoot, "video");
const brandName = getArgumentValue(argumentsMap, "brand", "Brand");
const targetDuration = getArgumentValue(argumentsMap, "duration", "45");
const forceWrite = hasFlag(argumentsMap, "force");
const shouldWrite = hasFlag(argumentsMap, "write");

const filesToCreate = new Map([
  ["brief.md", buildBriefMarkdown(brandName, targetDuration)],
  ["script.md", buildScriptMarkdown(brandName, targetDuration)],
  ["style-bible.md", buildStyleBibleMarkdown(brandName)],
  ["storyboard.md", buildStoryboardMarkdown(brandName, targetDuration)],
  ["shot-list.md", buildShotListMarkdown(brandName, targetDuration)],
  ["ai-prompt-pack.md", buildPromptPackMarkdown(brandName, targetDuration)],
  ["asset-list.md", buildAssetListMarkdown(brandName)],
  ["sound-map.md", buildSoundMapMarkdown(brandName, targetDuration)],
  ["qa-checklist.md", buildQaChecklistMarkdown(brandName)],
]);

if (shouldWrite === false) {
  for (const [fileName, fileContent] of filesToCreate.entries()) {
    console.log(`\n--- video/${fileName} ---\n`);
    console.log(fileContent);
  }
  process.exit(0);
}

fs.mkdirSync(videoDirectory, { recursive: true });

for (const [fileName, fileContent] of filesToCreate.entries()) {
  const targetFilePath = path.join(videoDirectory, fileName);
  if (fs.existsSync(targetFilePath) && forceWrite === false) {
    console.log(`Skipped existing file: ${targetFilePath}`);
    continue;
  }
  fs.writeFileSync(targetFilePath, fileContent, "utf8");
  console.log(`Wrote ${targetFilePath}`);
}

function buildBriefMarkdown(brandName, targetDuration) {
  return `# Ogilvideo Brief: ${brandName}\n\nTarget duration: ${targetDuration} seconds\n\n## Creative thesis\n\n[Write the one-sentence argument of the video.]\n\n## Audience\n\n[Define who watches and what they already believe.]\n\n## Objective\n\n[Define the action the viewer should take.]\n\n## Core promise\n\n[Define the product promise in one line.]\n\n## Proof\n\n[List supportable metrics, demos, testimonials, or before/after evidence.]\n\n## Constraints\n\n[List legal, brand, product, platform, timing, and export constraints.]\n`;
}

function buildScriptMarkdown(brandName, targetDuration) {
  return `# Ogilvideo Script: ${brandName}\n\nTarget duration: ${targetDuration} seconds\n\n## On-screen copy\n\n1. [Hook]\n2. [Problem]\n3. [Cost or consequence]\n4. [Pivot question]\n5. [Brand/product reveal]\n6. [Product action]\n7. [Proof metric]\n8. [Value claim]\n9. [CTA]\n\n## Voiceover\n\n[Optional voiceover. Keep it shorter than the edit can visually support.]\n`;
}

function buildStyleBibleMarkdown(brandName) {
  return `# Ogilvideo Style Bible: ${brandName}\n\n## Palette\n\n- Primary:\n- Background:\n- Accent:\n- Success:\n- Warning/pain:\n\n## Typography\n\n- Headline:\n- Body:\n- Numeric/data:\n\n## UI language\n\n- Card radius:\n- Stroke:\n- Shadow:\n- Grid:\n- Icon style:\n- Data style:\n\n## Motion motif\n\n[Choose one primary motif, such as spline, orbit, waveform, scan, path, card stream, or counter.]\n\n## Do not use\n\n[List colors, effects, camera moves, visual clichés, and AI artifacts to avoid.]\n`;
}

function buildStoryboardMarkdown(brandName, targetDuration) {
  return `# Ogilvideo Storyboard: ${brandName}\n\nTarget duration: ${targetDuration} seconds\n\n| Frame | Beat | Composition | Copy | Motion note | Asset note |\n| --- | --- | --- | --- | --- | --- |\n| 1 | Hook | [Composition] | [Copy] | [Motion] | [Assets] |\n| 2 | Problem | [Composition] | [Copy] | [Motion] | [Assets] |\n| 3 | Pressure | [Composition] | [Copy] | [Motion] | [Assets] |\n| 4 | Pivot | [Composition] | [Copy] | [Motion] | [Assets] |\n| 5 | Demo | [Composition] | [Copy] | [Motion] | [Assets] |\n| 6 | Proof | [Composition] | [Copy] | [Motion] | [Assets] |\n| 7 | CTA | [Composition] | [Copy] | [Motion] | [Assets] |\n`;
}

function buildShotListMarkdown(brandName, targetDuration) {
  return `# Ogilvideo Shot List: ${brandName}\n\nTarget duration: ${targetDuration} seconds\n\n| Shot | Start | End | Purpose | On-screen copy | Visual | Primary motion | Camera | Transition | Sound | Risk | QA |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n| 01 | 0.0 | 1.5 | Hook | [Copy] | [Visual] | [Motion] | [Camera] | [Transition] | [Sound] | [Risk] | [QA] |\n| 02 | 1.5 | 4.0 | Problem | [Copy] | [Visual] | [Motion] | [Camera] | [Transition] | [Sound] | [Risk] | [QA] |\n| 03 | 4.0 | 7.0 | Pressure | [Copy] | [Visual] | [Motion] | [Camera] | [Transition] | [Sound] | [Risk] | [QA] |\n| 04 | 7.0 | 12.0 | Pivot | [Copy] | [Visual] | [Motion] | [Camera] | [Transition] | [Sound] | [Risk] | [QA] |\n| 05 | 12.0 | 22.0 | Demo | [Copy] | [Visual] | [Motion] | [Camera] | [Transition] | [Sound] | [Risk] | [QA] |\n| 06 | 22.0 | 35.0 | System working | [Copy] | [Visual] | [Motion] | [Camera] | [Transition] | [Sound] | [Risk] | [QA] |\n| 07 | 35.0 | 42.0 | Proof | [Copy] | [Visual] | [Motion] | [Camera] | [Transition] | [Sound] | [Risk] | [QA] |\n| 08 | 42.0 | ${targetDuration} | CTA | [Copy] | [Visual] | [Motion] | [Camera] | [Transition] | [Sound] | [Risk] | [QA] |\n`;
}

function buildPromptPackMarkdown(brandName, targetDuration) {
  return `# Ogilvideo AI Prompt Pack: ${brandName}\n\nTarget duration: ${targetDuration} seconds\n\n## Styleframe prompt\n\nCreate a static premium motion-video styleframe for ${brandName}. Scene purpose: [purpose]. Exact on-screen text: [text]. Visual system: [palette, type, cards, icon style, depth, background]. Keep the composition clean, high-trust, and readable. Do not invent text, alter the logo, or add random UI.\n\n## Motion prompt\n\nAnimate the approved styleframe as a controlled premium motion shot. Duration: [seconds]. Primary motion: [motion]. Camera: [camera]. Easing: [easing]. Transition in: [transition]. Transition out: [transition]. Preserve all text, UI, logo, and brand colors exactly.\n\n## Negative constraints\n\nNo garbled text, no random labels, no logo changes, no warped UI, no unwanted watermarks, no phone control-center overlays, no shaky camera, no unreadable typography.\n`;
}

function buildAssetListMarkdown(brandName) {
  return `# Ogilvideo Asset List: ${brandName}\n\n## Brand assets\n\n- [ ] Logo SVG\n- [ ] Wordmark SVG\n- [ ] Typeface\n- [ ] Color tokens\n- [ ] CTA\n\n## Product assets\n\n- [ ] UI screens\n- [ ] Product data\n- [ ] Cards\n- [ ] Tables\n- [ ] Charts\n- [ ] Icons\n\n## Motion assets\n\n- [ ] Transition motif\n- [ ] Counter rig\n- [ ] Progress rig\n- [ ] Card rig\n- [ ] Waveform rig\n- [ ] Logo resolve\n\n## Sound assets\n\n- [ ] Music bed\n- [ ] Whooshes\n- [ ] UI ticks\n- [ ] Hits\n- [ ] Sonic logo\n`;
}

function buildSoundMapMarkdown(brandName, targetDuration) {
  return `# Ogilvideo Sound Map: ${brandName}\n\nTarget duration: ${targetDuration} seconds\n\n| Time | Visual event | Sound cue | Notes |\n| --- | --- | --- | --- |\n| 0.0 | Hook | [Cue] | [Notes] |\n| 2.0 | Problem appears | [Cue] | [Notes] |\n| 6.0 | Cost pressure | [Cue] | [Notes] |\n| 12.0 | Brand reveal | [Cue] | [Notes] |\n| 22.0 | Product proof | [Cue] | [Notes] |\n| 42.0 | Value claim | [Cue] | [Notes] |\n| ${targetDuration} | CTA | [Cue] | [Notes] |\n`;
}

function buildQaChecklistMarkdown(brandName) {
  return `# Ogilvideo QA Checklist: ${brandName}\n\n- [ ] Hook is clear in the first 1 to 2 seconds.\n- [ ] Story has problem, pressure, pivot, demo, proof, and CTA.\n- [ ] Every text line is readable on mobile.\n- [ ] UI text is not garbled.\n- [ ] Logo is correct and stable.\n- [ ] Claims are supportable or labeled placeholder.\n- [ ] Motion motifs are consistent.\n- [ ] Audio does not clip.\n- [ ] CTA holds long enough.\n- [ ] Export has no screen-recording overlays or tool UI.\n- [ ] Platform aspect ratios and safe areas are correct.\n`;
}

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

function hasFlag(argumentsMap, flagName) {
  return argumentsMap.get(flagName) === true;
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
