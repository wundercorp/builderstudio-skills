#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const rootIndex = args.indexOf("--root");
const rootDirectory = path.resolve(rootIndex >= 0 && args[rootIndex + 1] ? args[rootIndex + 1] : process.cwd());
const requiredFiles = [
  "docs/design/gradient-mesh.md",
  "docs/design/mesh-performance.md",
  "docs/theme/mesh-tokens.md",
];

const problems = [];

for (const relativeFilePath of requiredFiles) {
  if (fs.existsSync(path.join(rootDirectory, relativeFilePath)) === false) {
    problems.push(`Missing ${relativeFilePath}`);
  }
}

let meshSignalFound = false;
let reducedMotionFound = false;
let tokenSignalFound = false;
let heavyPatternCount = 0;

function walk(directoryPath) {
  if (fs.existsSync(directoryPath) === false) {
    return;
  }

  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    if (["node_modules", ".git", "dist", "build", "coverage"].includes(entry.name)) {
      continue;
    }

    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      walk(entryPath);
      continue;
    }

    const extension = path.extname(entry.name);
    if ([".css", ".scss", ".ts", ".tsx", ".js", ".jsx", ".vue", ".html", ".svg", ".md"].includes(extension) === false) {
      continue;
    }

    const content = fs.readFileSync(entryPath, "utf8");
    if (content.includes("gradient-mesh") || content.includes("mesh-background") || content.includes("MeshGradientPy")) {
      meshSignalFound = true;
    }

    if (content.includes("prefers-reduced-motion")) {
      reducedMotionFound = true;
    }

    if (content.includes("--mesh-start") && content.includes("--mesh-middle") && content.includes("--mesh-end")) {
      tokenSignalFound = true;
    }

    const heavyMatches = content.match(/blur\((6[0-9]|[7-9][0-9]|[1-9][0-9]{2,})px\)|requestAnimationFrame|setInterval/g);
    if (heavyMatches) {
      heavyPatternCount += heavyMatches.length;
    }
  }
}

walk(rootDirectory);

if (meshSignalFound === false) {
  problems.push("No gradient mesh implementation or documentation signal found.");
}

if (reducedMotionFound === false) {
  problems.push("No prefers-reduced-motion handling found for mesh visuals.");
}

if (tokenSignalFound === false) {
  problems.push("No complete mesh token set found.");
}

if (heavyPatternCount > 8) {
  problems.push(`Found ${heavyPatternCount} heavy animation/filter signals. Review mesh performance before release.`);
}

if (problems.length > 0) {
  console.error("Gradient Mesh check failed:");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log("Gradient Mesh check passed.");
