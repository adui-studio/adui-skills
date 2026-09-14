# ADui Skills Pack Usage Guide

English | [简体中文](./usage.md)

## 1. Current Usage Model

ADui Skills Pack currently contains three types of data:

1. `skills/`: ADui-maintained Skills that can be installed with the `skills` CLI.
2. `registry/skills.json`: sources, categories, and ratings for third-party Skills.
3. `profiles/`: declarative combinations of third-party and ADui Skills for a technology stack.

Profiles are declarative configuration in the current release. A one-command Profile installer has not been implemented yet.

## 2. Install an ADui Skill

Install a single ADui Skill:

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-stack-router
```

Other examples:

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-feature-dev
npx skills add https://github.com/adui-studio/adui-skills --skill adui-viteplus
npx skills add https://github.com/adui-studio/adui-skills --skill adui-3d-architecture
```

## 3. Install a Third-party Skill from the Registry

Find a Skill in `registry/skills.json`:

```json
{
  "id": "vue-best-practices",
  "source": "vuejs-ai/skills"
}
```

Install it:

```bash
npx skills add vuejs-ai/skills --skill vue-best-practices
```

General form:

```text
npx skills add <source> --skill <id>
```

Where:

- `source` is the `source` field from `registry/skills.json`
- `id` is the `id` field from `registry/skills.json`

## 4. What a Profile Means

For example:

```text
vue
├── extends: web
├── extends: toolchain
├── vue-best-practices
├── vue
├── vue-router-best-practices
├── vue-pinia-best-practices
├── vue-testing-best-practices
├── vue-debug-guides
└── vueuse-functions
```

Both `web` and `toolchain` ultimately inherit `core`.

The effective capability set for a Vue project is therefore:

```text
core + web + toolchain + vue
```

Tailwind, UnoCSS, 3D, and database Profiles can be composed according to project dependencies instead of creating a combinatorial number of Profiles.

## 5. Recommended Combinations

### Vue + UnoCSS

```text
core + web + toolchain + vue + unocss + git
```

### React + Tailwind

```text
core + web + toolchain + react + tailwind + git
```

### NestJS + Prisma + PostgreSQL

```text
core + backend + database + git
```

`adui-stack-router` will later make database routing more granular based on actual project dependencies.

### Flutter

```text
core + flutter + git
```

### Tauri + Vue

```text
core + web + toolchain + vue + tauri + git
```

### uni-app

```text
core + web + toolchain + uniapp + git
```

### Three.js / Babylon.js / CesiumJS

Do not load every 3D Skill unconditionally.

Choose by scenario:

```text
General Web 3D             → threejs
Full realtime 3D engine    → babylonjs
GIS / Globe / 3D Tiles     → cesiumjs
Low-level raster pipeline  → webgl2
GPU compute / WGSL         → webgpu
```

`adui-3d-architecture` is responsible for architecture decisions rather than replacing engine-specific API Skills.

## 6. Validate the Repository

```bash
npm run validate
```

A successful validation exits with code `0`.

Unresolved `upstreamPath` values currently produce warnings and do not fail CI.

## 7. Updates

Update a single ADui Skill:

```bash
npx skills update adui-stack-router
```

Update installed Skills:

```bash
npx skills update
```

Third-party Registry updates will be tracked by the repository's Weekly Update workflow. Until that automation is implemented, do not manually edit `skills.lock.json` to fabricate reviewed revisions.

## 8. GitHub and CNB

GitHub:

```text
https://github.com/adui-studio/adui-skills
```

is the only source of truth.

CNB:

```text
https://cnb.cool/adui-studio/adui-skills
```

is a synchronized mirror for China. Submit issues, pull requests, and releases to GitHub.
