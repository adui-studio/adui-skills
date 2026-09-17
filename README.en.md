# ADui Skills Pack

[简体中文](./README.md) | [English](./README.en.md) | [Wiki](https://github.com/adui-studio/adui-skills/wiki/Home-EN)

[![Release](https://img.shields.io/github/v/release/adui-studio/adui-skills?include_prereleases&sort=semver)](https://github.com/adui-studio/adui-skills/releases)
[![Validation](https://github.com/adui-studio/adui-skills/actions/workflows/validate.yml/badge.svg?branch=main)](https://github.com/adui-studio/adui-skills/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![ADui Skills Pack](https://img.shields.io/badge/skills.sh-ADui%20Skills%20Pack-000000?logo=vercel)](https://www.skills.sh/p/DCh7RQegkqCXcXn8)

> **Current release: v0.2.0 Public Preview.** Registry/Profile schema and installer UX may continue to evolve before `v1.0.0`.

ADui Skills Pack is a maintainable AI Coding / Agent Skills system covering full-stack development, cross-platform apps, databases, Git delivery, and Web 3D/GPU. GitHub is the source of truth and CNB is a read-oriented China mirror.

## ADui Skills Pack

GitHub:

```text
https://github.com/adui-studio/adui-skills
```

CNB mirror:

```text
https://cnb.cool/adui-studio/adui-skills
```

skills.sh Pack:

```text
https://www.skills.sh/p/DCh7RQegkqCXcXn8
```

Install the Pack:

```bash
npx skills add https://skills.sh/p/DCh7RQegkqCXcXn8
```

## Core capabilities

```text
Third-party Skills             ADui-maintained Skills
      │                                │
      ├─ Registry                     ├─ adui-stack-router
      ├─ Folder Hash Lock             ├─ adui-feature-dev
      └─ Daily Update                ├─ adui-viteplus
               │                      ├─ adui-nestjs-prisma
               │                      ├─ adui-3d-architecture
               │                      ├─ adui-webgl2
               │                      └─ adui-tauri-v2
               │
               └──────── Profiles ─────────┐
                                           ↓
                                  minimal per-project set
```

Current data:

- Registry: 84 records
- Enabled tracked third-party Skills: 82
- Profiles: 29
- ADui-maintained core Skills: 7

## Quick start

Validate:

```bash
npm run validate
npm test
```

Detect a project stack:

```bash
npm run detect:stack -- .
```

Install Profiles:

```powershell
npm run profile:list
npm run profile:plan -- vue unocss git --agent codex
npm run profile:install -- vue unocss git --agent codex --pm pnpm
```

Auto-detect stack and npm / pnpm / yarn / bun for a target project:

```powershell
npm run profile:auto-install -- D:\Projects\my-app --agent codex --dry-run
```

## Daily skills.sh ranking and Pack curation

Every day the repository searches skills.sh by category and filters candidates with install counts, GitHub Stars, and available security-audit results:

```text
skills.sh category search
      ↓
rank by installs
      ↓
GitHub Stars / Audit gates
      ↓
exclude skills already in the Pack
      ↓
exclude previously selected skills
      ↓
pick one best new candidate per category
      ↓
append-only candidate history
      ↓
automated PR for manual review
```

Selection history is **append-only**: previous selections are never deleted, replaced, or overwritten.

<!-- skills-sh-weekly-ranking:start -->
## skills.sh Daily Category Leaderboard

> Updated daily. Latest ranking: **2026-09-17** · [View full Top 10 ranking](./reports/skills-sh/latest.md) · [ADui Skills Pack](https://www.skills.sh/p/DCh7RQegkqCXcXn8)

| Category | #1 Skill | Source | Installs | Stars | Audit |
| --- | --- | --- | ---: | ---: | --- |
| 前端 | [router](https://skills.sh/lubusin/frappe-skills/router) | `lubusin/frappe-skills` | 66 | 60 | pass |
| React | [vercel-react-best-practices](https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices) | `vercel-labs/agent-skills` | 720,059 | 31,253 | pass |
| Vue | [vue-best-practices](https://skills.sh/vuejs-ai/skills/vue-best-practices) | `vuejs-ai/skills` | 38,957 | 2,855 | pass |
| Next.js | [clerk-nextjs-patterns](https://skills.sh/clerk/skills/clerk-nextjs-patterns) | `clerk/skills` | 44,347 | 74 | unknown |
| 设计 / UI | [web-design-guidelines](https://skills.sh/vercel-labs/agent-skills/web-design-guidelines) | `vercel-labs/agent-skills` | 641,241 | 31,253 | unknown |
| UX | [lean-ux](https://skills.sh/wondelai/skills/lean-ux) | `wondelai/skills` | 4,580 | 2,190 | warn |
| 移动端 | [agent-spec-mobile-react-native](https://skills.sh/ruvnet/ruflo/agent-spec-mobile-react-native) | `ruvnet/ruflo` | 1,266 | 72,643 | pass |
| Agent 工作流 | [google-agents-cli-workflow](https://skills.sh/google/agents-cli/google-agents-cli-workflow) | `google/agents-cli` | 248,659 | 5,945 | warn |
| 数据库 | [prisma-database-setup](https://skills.sh/prisma/skills/prisma-database-setup) | `prisma/skills` | 292,035 | 57 | unknown |
| 测试 | [playwright-testing](https://skills.sh/maddhruv/absolute/playwright-testing) | `maddhruv/absolute` | 160 | 213 | blocked |
| 后端 / API | [extension-backend](https://skills.sh/quangpl/browser-extension-skills/extension-backend) | `quangpl/browser-extension-skills` | 133 | 53 | pass |
| Git / 交付 | [github-release](https://skills.sh/jezweb/claude-skills/github-release) | `jezweb/claude-skills` | 1,256 | 1,010 | blocked |
| 3D / GPU | [threejs-webgl](https://skills.sh/freshtechbro/claudedesignskills/threejs-webgl) | `freshtechbro/claudedesignskills` | 3,697 | 910 | unknown |
| 工程化 | [vite](https://skills.sh/onmax/nuxt-skills/vite) | `onmax/nuxt-skills` | 2,141 | 711 | unknown |

> Leaderboard display and Pack candidate selection are separate: the ranking refreshes daily, while Pack candidates remain append-only and never replace existing Skills.
<!-- skills-sh-weekly-ranking:end -->

Preview locally:

```bash
npm run pack:ranking
```

Write candidate state:

```bash
npm run pack:ranking:apply
```

> The public skills.sh documentation does not currently expose a stable API for mutating an existing Pack's membership. Automation therefore handles discovery, ranking, quality gates, deduplication, selection, and PR creation; adding the selected candidates to the existing Pack still requires confirmation in the skills.sh Pack UI. The workflow does not rely on undocumented internal endpoints, browser cookies, or persistent login sessions.

See [Daily skills.sh Ranking](https://github.com/adui-studio/adui-skills/wiki/Weekly-Skills-Ranking-EN).

## Third-party Skill updates

Third-party Skill source code is not vendored. The Registry stores references and reviewed Skill-folder Git tree SHA values (`skillFolderHash`).

```bash
npm run updates:check
npm run updates:apply
```

Third-party Registry updates and Pack candidate changes still require Pull Request review and **never auto-merge**; the public leaderboard page itself is refreshed automatically by the daily Workflow.

## Documentation

Browse detailed documentation in the GitHub Wiki:

- [Wiki Home](https://github.com/adui-studio/adui-skills/wiki/Home-EN)
- [Usage](https://github.com/adui-studio/adui-skills/wiki/Usage-EN)
- [Profile Installer](https://github.com/adui-studio/adui-skills/wiki/Profile-Installer-EN)
- [Daily skills.sh Ranking](https://github.com/adui-studio/adui-skills/wiki/Weekly-Skills-Ranking-EN)
- [Latest full skills.sh ranking](https://github.com/adui-studio/adui-skills/wiki/Weekly-Skills-Ranking-Latest)
- [Feature Development](https://github.com/adui-studio/adui-skills/wiki/Development-EN)
- [Architecture](https://github.com/adui-studio/adui-skills/wiki/Architecture-EN)
- [Vite+](https://github.com/adui-studio/adui-skills/wiki/VitePlus-EN)
- [NestJS + Prisma](https://github.com/adui-studio/adui-skills/wiki/NestJS-Prisma-EN)
- [3D / GPU Architecture](https://github.com/adui-studio/adui-skills/wiki/3D-Architecture-EN)
- [WebGL2](https://github.com/adui-studio/adui-skills/wiki/WebGL2-EN)
- [Tauri v2](https://github.com/adui-studio/adui-skills/wiki/Tauri-v2-EN)
- [Maintenance](https://github.com/adui-studio/adui-skills/wiki/Maintenance-EN)
- [Security](https://github.com/adui-studio/adui-skills/wiki/Security-EN)
- [Release Process](https://github.com/adui-studio/adui-skills/wiki/Releasing-EN)

Repository `docs/*.md` files remain the single source of truth and GitHub Actions publishes them to the Wiki. Chinese remains the canonical source language.
