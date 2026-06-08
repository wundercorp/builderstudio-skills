# Agentic AI Video Director

Builder Studio: https://builderstudio.dev

This reference defines how Ogilvideo directs AI agents and AI video tools.

## Prime rule

Use AI video for motion, atmosphere, camera language, transitions, and visual exploration. Use controlled design and compositing for exact product UI, legal claims, logos, prices, names, metrics, and CTA text.

## Multi-agent sequence

1. Strategy agent defines audience, offer, proof, constraints, and forbidden claims.
2. Script agent compresses the story into short on-screen lines.
3. Art direction agent creates palette, typography, shape language, depth, materials, and brand rules.
4. Styleframe agent creates locked still frames for each major beat.
5. UI agent creates product screens, dashboards, cards, states, charts, and data labels.
6. Motion agent writes camera, object choreography, easing, transition, and sound notes.
7. AI video agent creates short controlled clips from approved styleframes.
8. Compositing agent overlays exact UI, text, logo, and claims.
9. Sound agent maps music and effects to edit points.
10. QA agent checks artifacts, readability, claims, export specs, and platform variants.

## Model-neutral shot prompt template

```text
Create a [duration]-second motion shot for a premium SaaS product video.

Scene purpose: [what this shot proves]
Composition: [foreground, midground, background]
Brand system: [colors, typography, radius, shadow, texture]
Exact text to preserve: [copy]
UI to preserve: [cards, buttons, data, logo, labels]
Motion: [object movement, timing, easing]
Camera: [push, pan, orbit, locked, macro, parallax]
Transition in: [how this shot begins]
Transition out: [how this shot ends]
Sound cue: [music hit, whoosh, tick, pulse]
Constraints: Do not alter the logo. Do not invent new labels. Do not warp text. Do not change the product UI. Do not add extra characters. Do not introduce new colors. Keep typography readable.
```

## Styleframe prompt template

```text
Create a static styleframe for a premium motion explainer.

Brand: [brand name]
Audience: [audience]
Scene beat: [hook/problem/demo/proof/CTA]
Canvas: [aspect ratio]
Visual system: white premium tech canvas, soft blue gradient edge bloom, crisp black typography, rounded UI cards, subtle shadows, restrained accent color.
On-screen text: [exact text]
Main object: [card/map/dashboard/icon/logo]
Hierarchy: [what should be largest, second, third]
Mood: confident, clean, high-trust, modern, not cluttered.
Do not include unreadable fake text. Do not add random UI. Do not overdecorate.
```

## Motion prompt template

```text
Animate this approved styleframe as a controlled premium UI motion shot.

Duration: [seconds]
Frame rate target: [fps]
Primary motion: [one main movement]
Secondary motion: [supporting movement]
Easing: [curve]
Depth: [blur/parallax/shadow]
Typography: [reveal/hold/exit]
UI behavior: [progress, counter, card slide, status change]
Transition: [connect to next shot]
Keep all text and UI geometry stable. No morphing letters. No invented content.
```

## Edit assembly prompt template

```text
Assemble the video from these shots into a coherent motion commercial.

Target length: [seconds]
Story arc: [hook, pressure, pivot, demo, proof, CTA]
Pacing: fast opening, controlled product demonstration, confident proof, calm CTA.
Motif: [blue spline/waveform/orbit/etc.]
Music: [tempo and mood]
Sound effects: [hit points]
CTA hold: [seconds]
Final export: [aspect ratio, resolution, codec]
Remove any tool UI, watermarks, device overlays, or accidental capture artifacts.
```

## Negative prompt library

Use these constraints when relevant:

```text
No garbled text, no random captions, no logo changes, no extra buttons, no fake browser chrome unless requested, no shaky handheld motion, no overexposed white screen, no excessive lens flare, no random people, no AI-smoothed faces in UI avatars, no changing numbers, no watermark, no mobile control-center overlay, no editing app interface, no cropped CTA.
```

## AI video risk map

| Risk | Prevention |
| --- | --- |
| Warped typography | Composite text after generation or use image-to-video from locked frame. |
| Fake UI labels | Keep UI in Figma/AE layers, not inside generated footage. |
| Brand drift | Provide palette, logo lockup, and negative constraints every time. |
| Inconsistent shots | Generate from approved styleframes with shared style bible. |
| Motion chaos | Limit each shot to one primary motion idea. |
| Unusable final export | Treat AI video as source plates, not the final edit. |
