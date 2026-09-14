# ADui Skills Pack

[简体中文](./README.md) | [English](./README.en.md)

[![Release](https://img.shields.io/github/v/release/adui-studio/adui-skills?include_prereleases&sort=semver)](https://github.com/adui-studio/adui-skills/releases)
[![Validation](https://github.com/adui-studio/adui-skills/actions/workflows/validate.yml/badge.svg?branch=main)](https://github.com/adui-studio/adui-skills/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![skills.sh](https://skills.sh/b/adui-studio/adui-skills)](https://skills.sh/adui-studio/adui-skills)

> **Current release: v0.2.0 Public Preview.** Registry/Profile schema and installer UX may continue to evolve before `v1.0.0`.

ADui Skills Pack is a personal AI Coding / Agent development skill system covering full-stack development, cross-platform apps, databases, Git delivery, and Web 3D/GPU.

> **Language policy:** Chinese is the primary language for repository documentation, GitHub Actions labels, and maintenance reports. Matching `.en.md` files provide the English fallback.

## Repositories

- GitHub primary: `https://github.com/adui-studio/adui-skills`
- CNB China mirror: `https://cnb.cool/adui-studio/adui-skills`

GitHub is the single source of truth. CNB is a synchronized read-oriented mirror for China access.

## Technology scope

Vue, React, Tailwind CSS, UnoCSS, Vite, Vite+, Vitest, pnpm, NestJS, TypeScript, Prisma, SQL, PostgreSQL, MySQL, SQLite, Flutter, Tauri, uni-app, uni-app x, WeChat Mini Program, Three.js, Babylon.js, CesiumJS, WebGL2, WebGPU, Git and GitHub delivery workflows.

## Quick start

```bash
npm run validate
npm run detect:stack -- .
```

Install an ADui-maintained Skill:

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-stack-router
npx skills add https://github.com/adui-studio/adui-skills --skill adui-feature-dev
npx skills add https://github.com/adui-studio/adui-skills --skill adui-viteplus
npx skills add https://github.com/adui-studio/adui-skills --skill adui-nestjs-prisma
npx skills add https://github.com/adui-studio/adui-skills --skill adui-3d-architecture
npx skills add https://github.com/adui-studio/adui-skills --skill adui-webgl2
npx skills add https://github.com/adui-studio/adui-skills --skill adui-tauri-v2
```

Check upstream changes without writing:

```bash
npm run updates:check
```

Initialize or refresh the reviewed lock:

```bash
npm run lock:init
npm run updates:apply
```

## ADui feature development workflow

`adui-feature-dev` standardizes feature work, bug fixes and refactoring into requirement understanding, minimal changes, quality gates, diff review and explicit delivery. Chinese documentation is canonical; see [docs/development.en.md](./docs/development.en.md) for the English fallback.


## Specialized Vite+ and NestJS + Prisma skills

- `adui-viteplus` is used only for real Vite+ projects and coordinates `vp check`, `vp test`, `vp build`, `vp pack`, configuration, and incremental migration.
- `adui-nestjs-prisma` is selected only when both NestJS and Prisma are detected. It adds integration rules for module boundaries, data access, transactions, migrations, error mapping, and real database testing.

The Stack Router uses the combined `nestjs-prisma` profile so NestJS-only or Prisma-only projects do not load this integration skill.

## 3D / GPU architecture and WebGL2

`adui-3d-architecture` provides engine selection, coordinate ownership, integration boundaries, performance budgets, and resource-lifecycle guidance across Three.js, Babylon.js, CesiumJS, WebGL2, and WebGPU. `adui-webgl2` adds raw WebGL2 / GLSL ES 3.0 pipeline, shader, framebuffer, context-loss, and disposal rules.

## Upstream tracking v2

v0.1.4 tracks the Git tree SHA of each Skill folder (`skillFolderHash`) instead of relying on the GitHub commits-by-path API. Repositories are grouped by `source`, cloned once per run, and moved `SKILL.md` files can be auto-resolved by frontmatter `name`.

A single unavailable third-party repository is reported as a warning and does not invalidate successful checks for other Skills. Weekly update PRs are never auto-merged.

## Current ADui-maintained core Skills

- `adui-stack-router`
- `adui-feature-dev`
- `adui-viteplus`
- `adui-nestjs-prisma`
- `adui-3d-architecture`
- `adui-webgl2`
- `adui-tauri-v2`

## Documentation

- [Usage](./docs/usage.en.md)
- [Feature Development](./docs/development.en.md)
- [Vite+](./docs/viteplus.en.md)
- [NestJS + Prisma](./docs/nestjs-prisma.en.md)
- [3D / GPU Architecture](./docs/3d-architecture.en.md)
- [WebGL2](./docs/webgl2.en.md)
- [Tauri v2](./docs/tauri-v2.en.md)
- [Profile Installer](./docs/profile-installer.en.md)
- [Maintenance](./docs/maintenance.en.md)
- [Architecture](./docs/architecture.en.md)
- [Adding Skills](./docs/adding-skills.en.md)
- [Security](./docs/security.en.md)
- [Contributing](./CONTRIBUTING.en.md)
- [Release Process](./docs/releasing.en.md)
- [Security Policy](./SECURITY.en.md)

For the canonical documentation, use the Chinese files without the `.en` suffix.

## Profile Installer

Profiles can now be resolved and installed through the ADui Profile Manager with npm, pnpm, Yarn, or Bun. Package-manager selection follows `--pm` → `package.json#packageManager` → lockfiles → current execution environment → npm fallback. `auto-install` detects and installs inside the target project instead of assuming the package manager used to launch ADui. Actual installs still require an explicit agent target. See [Profile Installer](./docs/profile-installer.en.md).

## Tauri v2

The Tauri profile now includes `adui-tauri-v2` for IPC, state, capabilities, permissions, plugins, sidecars, updater, and packaging conventions. See [Tauri v2 Engineering](./docs/tauri-v2.en.md).


## Release and skills.sh Pack

GitHub releases are driven by `v*` tags and require validation, tests, and a complete Folder Hash lock. See [Release Process](./docs/releasing.en.md). The skills.sh Pack must be created after Vercel sign-in; the repository does not publish a fake pack ID before the real URL exists.
