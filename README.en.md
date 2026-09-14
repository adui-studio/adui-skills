# ADui Skills Pack

[简体中文](./README.md) | [English](./README.en.md)

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

## Upstream tracking v2

v0.1.4 tracks the Git tree SHA of each Skill folder (`skillFolderHash`) instead of relying on the GitHub commits-by-path API. Repositories are grouped by `source`, cloned once per run, and moved `SKILL.md` files can be auto-resolved by frontmatter `name`.

A single unavailable third-party repository is reported as a warning and does not invalidate successful checks for other Skills. Weekly update PRs are never auto-merged.

## Documentation

- [Usage](./docs/usage.en.md)
- [Maintenance](./docs/maintenance.en.md)
- [Architecture](./docs/architecture.en.md)
- [Adding Skills](./docs/adding-skills.en.md)
- [Security](./docs/security.en.md)
- [Contributing](./CONTRIBUTING.en.md)

For the canonical documentation, use the Chinese files without the `.en` suffix.
