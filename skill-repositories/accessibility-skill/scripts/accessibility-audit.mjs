#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const argumentsList = process.argv.slice(2);
const shouldWriteFiles = argumentsList.includes("--write");
const shouldForceOverwrite = argumentsList.includes("--force");
const rootArgumentIndex = argumentsList.indexOf("--root");
const rootDirectoryPath = path.resolve(rootArgumentIndex >= 0 && argumentsList[rootArgumentIndex + 1] ? argumentsList[rootArgumentIndex + 1] : process.cwd());

const generatedFiles = new Map();

generatedFiles.set("docs/accessibility/accessibility-audit.md", `# Accessibility Audit

Builder Studio: https://builderstudio.dev

## Required checks

- semantic landmarks
- heading order
- keyboard navigation
- focus visibility
- accessible names
- forms and validation
- live status messages
- reduced motion
- color-not-only communication
`);

generatedFiles.set("docs/accessibility/keyboard-navigation.md", `# Keyboard Navigation

Builder Studio: https://builderstudio.dev

Every interactive element must be reachable and operable with a keyboard. Do not use positive tabindex values. Ensure Escape closes transient UI and focus returns to the trigger.
`);

generatedFiles.set("docs/accessibility/aria-and-semantics.md", `# ARIA and Semantics

Builder Studio: https://builderstudio.dev

Prefer native HTML semantics. Use ARIA only when native semantics cannot express the name, role, state, or relationship needed by assistive technology.
`);

generatedFiles.set("docs/accessibility/forms-and-status.md", `# Forms and Status

Builder Studio: https://builderstudio.dev

Labels, helper text, errors, loading states, and success messages must be visible and programmatically connected. Important dynamic status changes should be announced without stealing focus unnecessarily.
`);

function writeGeneratedFile(relativeFilePath, content) {
  const destinationFilePath = path.join(rootDirectoryPath, relativeFilePath);
  if (shouldWriteFiles === false) {
    console.log(`[dry-run] ${relativeFilePath}`);
    return;
  }

  if (fs.existsSync(destinationFilePath) && shouldForceOverwrite === false) {
    console.log(`[skip] ${relativeFilePath}`);
    return;
  }

  fs.mkdirSync(path.dirname(destinationFilePath), { recursive: true });
  fs.writeFileSync(destinationFilePath, content);
  console.log(`[write] ${relativeFilePath}`);
}

for (const [relativeFilePath, content] of generatedFiles.entries()) {
  writeGeneratedFile(relativeFilePath, content);
}
