# Builder Studio Skills

Master repository and system-of-record directory that owns the complete Builder Studio skillset catalog while preserving one standalone GitHub repository per skill.

Builder Studio: https://builderstudio.dev

## Repository model

This master repository is the system-of-record directory for the Builder Studio skillset. It owns a catalog of all skill repositories and vendors a clean copy of each standalone skill repository under `skill-repositories/`.

Each skill continues to have its own standalone repository and install URL. When a new skill is added, regenerate this master repository so the new skill appears both as its own repository and as a directory inside this master repository.

## Skill repositories

| Skill | Skill id | skills.sh | Standalone repo | Master directory |
| --- | --- | --- | --- | --- |
| Ogilvideo | `ogilvideo` | [![skills.sh](https://skills.sh/b/wundercorp/ogilvideo-skill)](https://skills.sh/wundercorp/ogilvideo-skill) | [ogilvideo-skill](https://github.com/wundercorp/ogilvideo-skill) | `skill-repositories/ogilvideo-skill` |
| Professional Developer | `professional-developer` | [![skills.sh](https://skills.sh/b/wundercorp/professional-developer-skill)](https://skills.sh/wundercorp/professional-developer-skill) | [professional-developer-skill](https://github.com/wundercorp/professional-developer-skill) | `skill-repositories/professional-developer-skill` |
| Wiring | `wiring` | [![skills.sh](https://skills.sh/b/wundercorp/wiring-skill)](https://skills.sh/wundercorp/wiring-skill) | [wiring-skill](https://github.com/wundercorp/wiring-skill) | `skill-repositories/wiring-skill` |
| Doctor | `doctor` | [![skills.sh](https://skills.sh/b/wundercorp/doctor-skill)](https://skills.sh/wundercorp/doctor-skill) | [doctor-skill](https://github.com/wundercorp/doctor-skill) | `skill-repositories/doctor-skill` |
| Patcher | `patcher` | [![skills.sh](https://skills.sh/b/wundercorp/patcher-skill)](https://skills.sh/wundercorp/patcher-skill) | [patcher-skill](https://github.com/wundercorp/patcher-skill) | `skill-repositories/patcher-skill` |
| Svalbard | `svalbard` | [![skills.sh](https://skills.sh/b/wundercorp/svalbard-skill)](https://skills.sh/wundercorp/svalbard-skill) | [svalbard-skill](https://github.com/wundercorp/svalbard-skill) | `skill-repositories/svalbard-skill` |
| Mimar | `mimar` | [![skills.sh](https://skills.sh/b/wundercorp/mimar-skill)](https://skills.sh/wundercorp/mimar-skill) | [mimar-skill](https://github.com/wundercorp/mimar-skill) | `skill-repositories/mimar-skill` |
| Cloud Deployment for ShipYou | `cloud-deployment-shipyou` | [![skills.sh](https://skills.sh/b/wundercorp/cloud-deployment-shipyou-skill)](https://skills.sh/wundercorp/cloud-deployment-shipyou-skill) | [cloud-deployment-shipyou-skill](https://github.com/wundercorp/cloud-deployment-shipyou-skill) | `skill-repositories/cloud-deployment-shipyou-skill` |
| Cleaner | `cleaner` | [![skills.sh](https://skills.sh/b/wundercorp/cleaner-skill)](https://skills.sh/wundercorp/cleaner-skill) | [cleaner-skill](https://github.com/wundercorp/cleaner-skill) | `skill-repositories/cleaner-skill` |
| Archivist | `archivist` | [![skills.sh](https://skills.sh/b/wundercorp/archivist-skill)](https://skills.sh/wundercorp/archivist-skill) | [archivist-skill](https://github.com/wundercorp/archivist-skill) | `skill-repositories/archivist-skill` |
| Coherence | `coherence` | [![skills.sh](https://skills.sh/b/wundercorp/coherence-skill)](https://skills.sh/wundercorp/coherence-skill) | [coherence-skill](https://github.com/wundercorp/coherence-skill) | `skill-repositories/coherence-skill` |
| Batman | `batman` | [![skills.sh](https://skills.sh/b/wundercorp/batman-skill)](https://skills.sh/wundercorp/batman-skill) | [batman-skill](https://github.com/wundercorp/batman-skill) | `skill-repositories/batman-skill` |
| Contrast Guard | `contrast-guard` | [![skills.sh](https://skills.sh/b/wundercorp/contrast-guard-skill)](https://skills.sh/wundercorp/contrast-guard-skill) | [contrast-guard-skill](https://github.com/wundercorp/contrast-guard-skill) | `skill-repositories/contrast-guard-skill` |
| Accessibility | `accessibility` | [![skills.sh](https://skills.sh/b/wundercorp/accessibility-skill)](https://skills.sh/wundercorp/accessibility-skill) | [accessibility-skill](https://github.com/wundercorp/accessibility-skill) | `skill-repositories/accessibility-skill` |
| Themable | `themable` | [![skills.sh](https://skills.sh/b/wundercorp/themable-skill)](https://skills.sh/wundercorp/themable-skill) | [themable-skill](https://github.com/wundercorp/themable-skill) | `skill-repositories/themable-skill` |
| Bauhaus | `bauhaus` | [![skills.sh](https://skills.sh/b/wundercorp/bauhaus-skill)](https://skills.sh/wundercorp/bauhaus-skill) | [bauhaus-skill](https://github.com/wundercorp/bauhaus-skill) | `skill-repositories/bauhaus-skill` |
| Gradient Mesh | `gradient-mesh` | [![skills.sh](https://skills.sh/b/wundercorp/gradient-mesh-skill)](https://skills.sh/wundercorp/gradient-mesh-skill) | [gradient-mesh-skill](https://github.com/wundercorp/gradient-mesh-skill) | `skill-repositories/gradient-mesh-skill` |
| Linguist | `linguist` | [![skills.sh](https://skills.sh/b/wundercorp/linguist-skill)](https://skills.sh/wundercorp/linguist-skill) | [linguist-skill](https://github.com/wundercorp/linguist-skill) | `skill-repositories/linguist-skill` |

## Install commands

### Ogilvideo

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/ogilvideo-skill --skill ogilvideo
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/ogilvideo-skill --skill ogilvideo
```

### Professional Developer

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/professional-developer-skill --skill professional-developer
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/professional-developer-skill --skill professional-developer
```

### Wiring

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/wiring-skill --skill wiring
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/wiring-skill --skill wiring
```

### Doctor

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/doctor-skill --skill doctor
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/doctor-skill --skill doctor
```

### Patcher

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/patcher-skill --skill patcher
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/patcher-skill --skill patcher
```

### Svalbard

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/svalbard-skill --skill svalbard
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/svalbard-skill --skill svalbard
```

### Mimar

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/mimar-skill --skill mimar
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/mimar-skill --skill mimar
```

### Cloud Deployment for ShipYou

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/cloud-deployment-shipyou-skill --skill cloud-deployment-shipyou
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/cloud-deployment-shipyou-skill --skill cloud-deployment-shipyou
```

### Cleaner

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/cleaner-skill --skill cleaner
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/cleaner-skill --skill cleaner
```

### Archivist

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/archivist-skill --skill archivist
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/archivist-skill --skill archivist
```

### Coherence

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/coherence-skill --skill coherence
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/coherence-skill --skill coherence
```

### Batman

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/batman-skill --skill batman
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/batman-skill --skill batman
```

### Contrast Guard

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/contrast-guard-skill --skill contrast-guard
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/contrast-guard-skill --skill contrast-guard
```

### Accessibility

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/accessibility-skill --skill accessibility
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/accessibility-skill --skill accessibility
```

### Themable

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/themable-skill --skill themable
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/themable-skill --skill themable
```

### Bauhaus

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/bauhaus-skill --skill bauhaus
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/bauhaus-skill --skill bauhaus
```

### Gradient Mesh

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/gradient-mesh-skill --skill gradient-mesh
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/gradient-mesh-skill --skill gradient-mesh
```

### Linguist

Using npm/npx:

```bash
npx --yes skills add https://github.com/wundercorp/linguist-skill --skill linguist
```

Using Yarn:

```bash
yarn dlx skills add https://github.com/wundercorp/linguist-skill --skill linguist
```

## Maintenance workflow

1. Add or update the seed skill under `seed-skills/<skill-id>/` in the creator repository.
2. Add or update that skill in `config/skills.manifest.json`.
3. Run `npm run create:local` to regenerate every standalone skill repository and this master repository.
4. Publish with `node scripts/create-skill-repositories.mjs --owner wundercorp --visibility public --push --allow-existing` when ready.
