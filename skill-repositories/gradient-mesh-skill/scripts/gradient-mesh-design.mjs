#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const shouldWrite = args.includes("--write");
const shouldForce = args.includes("--force");
const rootIndex = args.indexOf("--root");
const rootDirectory = path.resolve(rootIndex >= 0 && args[rootIndex + 1] ? args[rootIndex + 1] : process.cwd());

const files = new Map();

files.set("src/design/gradient-mesh.css", `.gradient-mesh-background {
  position: absolute;
  inset: 0;
  pointer-events: none;
  aria-hidden: true;
  background:
    radial-gradient(circle at 18% 24%, var(--mesh-start, rgba(139, 92, 246, 0.62)), transparent 32%),
    radial-gradient(circle at 84% 18%, var(--mesh-middle, rgba(56, 189, 248, 0.42)), transparent 30%),
    radial-gradient(circle at 50% 90%, var(--mesh-end, rgba(34, 211, 238, 0.28)), transparent 36%),
    var(--background, #070914);
  filter: saturate(1.08);
}

.gradient-mesh-readable-surface {
  background: var(--surface-overlay, rgba(15, 23, 42, 0.76));
  border: 1px solid var(--border, rgba(148, 163, 184, 0.22));
  backdrop-filter: blur(18px);
}

@media (prefers-reduced-motion: reduce) {
  .gradient-mesh-background {
    animation: none;
  }
}
`);

files.set("assets/gradient-mesh-sample.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720" role="img" aria-label="Decorative gradient mesh sample">
  <defs>
    <radialGradient id="meshA" cx="20%" cy="20%" r="60%">
      <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="meshB" cx="80%" cy="15%" r="55%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="meshC" cx="50%" cy="90%" r="70%">
      <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#22d3ee" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="720" fill="#070914"/>
  <rect width="1200" height="720" fill="url(#meshA)"/>
  <rect width="1200" height="720" fill="url(#meshB)"/>
  <rect width="1200" height="720" fill="url(#meshC)"/>
</svg>
`);

files.set("docs/design/gradient-mesh.md", `# Gradient Mesh

Builder Studio: https://builderstudio.dev

This project uses decorative mesh gradients through tokenized CSS/SVG assets. Keep meshes behind readable surfaces and avoid heavy animation by default.

MeshGradientPy reference: https://github.com/DonsetPG/MeshGradientPy
`);

files.set("docs/design/mesh-performance.md", `# Mesh Performance

Builder Studio: https://builderstudio.dev

Prefer CSS or static SVG meshes. Avoid continuously animating full-screen blur filters. Respect reduced motion.
`);

files.set("docs/theme/mesh-tokens.md", `# Mesh Tokens

Builder Studio: https://builderstudio.dev

Required mesh tokens: \`--mesh-start\`, \`--mesh-middle\`, and \`--mesh-end\`.
`);

function writeFile(relativeFilePath, content) {
  const destinationFilePath = path.join(rootDirectory, relativeFilePath);
  if (shouldWrite === false) {
    console.log(`[dry-run] ${relativeFilePath}`);
    return;
  }

  if (fs.existsSync(destinationFilePath) && shouldForce === false) {
    console.log(`[skip] ${relativeFilePath}`);
    return;
  }

  fs.mkdirSync(path.dirname(destinationFilePath), { recursive: true });
  fs.writeFileSync(destinationFilePath, content);
  console.log(`[write] ${relativeFilePath}`);
}

for (const [relativeFilePath, content] of files.entries()) {
  writeFile(relativeFilePath, content);
}
