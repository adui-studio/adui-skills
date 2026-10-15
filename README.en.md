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

> Updated daily. Latest ranking: **2026-10-15** · [View full Top 10 ranking](./reports/skills-sh/latest.md) · [ADui Skills Pack](https://www.skills.sh/p/DCh7RQegkqCXcXn8)

| Category | #1 Skill | Source | Installs | Stars | Audit |
| --- | --- | --- | ---: | ---: | --- |
| 前端 | [frontend-design](https://skills.sh/anthropics/skills/frontend-design) | `anthropics/skills` | 986,635 | 181,203 | pass |
| React | [design-mobile-apps](https://skills.sh/designed-by-ai/skills/design-mobile-apps) | `designed-by-ai/skills` | 811,787 | 16 | blocked |
| Vue | [design-taste-frontend](https://skills.sh/leonxlnx/taste-skill/design-taste-frontend) | `leonxlnx/taste-skill` | 610,012 | 96,561 | pass |
| Next.js | [vercel-react-best-practices](https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices) | `vercel-labs/agent-skills` | 801,585 | 32,438 | pass |
| 设计 / UI | [frontend-design](https://skills.sh/anthropics/skills/frontend-design) | `anthropics/skills` | 986,635 | 181,203 | pass |
| UX | [bmad-ux](https://skills.sh/bmad-code-org/bmad-method/bmad-ux) | `bmad-code-org/bmad-method` | 9,123 | 54,154 | pass |
| 移动端 | [cloudbase](https://skills.sh/tencentcloudbase/cloudbase-skills/cloudbase) | `tencentcloudbase/cloudbase-skills` | 12,276 | 36 | blocked |
| Agent 工作流 | [agent-browser](https://skills.sh/vercel-labs/agent-browser/agent-browser) | `vercel-labs/agent-browser` | 1,053,977 | 43,990 | blocked |
| 数据库 | [prisma-orm-setup](https://skills.sh/prisma/skills/prisma-orm-setup) | `prisma/skills` | 39,583 | 70 | unknown |
| 测试 | [tdd](https://skills.sh/mattpocock/skills/tdd) | `mattpocock/skills` | 1,084,529 | 291,500 | unknown |
| 后端 / API | [code-to-prd](https://skills.sh/alirezarezvani/claude-skills/code-to-prd) | `alirezarezvani/claude-skills` | 739 | 28,204 | pass |
| Git / 交付 | [github-ops](https://skills.sh/affaan-m/ecc/github-ops) | `affaan-m/ecc` | 8,179 | 279,561 | warn |
| 3D / GPU | [hyperframes-animation](https://skills.sh/heygen-com/hyperframes/hyperframes-animation) | `heygen-com/hyperframes` | 861,451 | 63,829 | warn |
| 工程化 | [angular-tooling](https://skills.sh/analogjs/angular-skills/angular-tooling) | `analogjs/angular-skills` | 5,137 | 590 | pass |

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
