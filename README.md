# ADui Skills Pack

[简体中文](./README.md) | [English](./README.en.md) | [Wiki](https://github.com/adui-studio/adui-skills/wiki)

[![版本](https://img.shields.io/github/v/release/adui-studio/adui-skills?include_prereleases&sort=semver)](https://github.com/adui-studio/adui-skills/releases)
[![校验](https://github.com/adui-studio/adui-skills/actions/workflows/validate.yml/badge.svg?branch=main)](https://github.com/adui-studio/adui-skills/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![ADui Skills Pack](https://img.shields.io/badge/skills.sh-ADui%20Skills%20Pack-000000?logo=vercel)](https://www.skills.sh/p/DCh7RQegkqCXcXn8)

> **当前版本：v0.2.0 Public Preview。** `v0.2.x` 面向公开试用，Registry/Profile Schema 与安装体验在 `v1.0.0` 前仍可能继续演进。

ADui Skills Pack 是一套面向 AI Coding / Agent 开发的可维护 Skills 体系，覆盖全栈开发、跨端开发、数据库、Git 交付和 Web 3D/GPU。GitHub 是唯一事实源，CNB 为国内只读同步镜像。

## ADui Skills Pack

GitHub 主仓库：

```text
https://github.com/adui-studio/adui-skills
```

CNB 国内镜像：

```text
https://cnb.cool/adui-studio/adui-skills
```

skills.sh Pack：

```text
https://www.skills.sh/p/DCh7RQegkqCXcXn8
```

一键安装 Pack：

```bash
npx skills add https://skills.sh/p/DCh7RQegkqCXcXn8
```

## 核心能力

```text
第三方 Skill                ADui 自研 Skill
    │                            │
    ├─ Registry                 ├─ adui-stack-router
    ├─ Folder Hash Lock         ├─ adui-feature-dev
    └─ Daily Update            ├─ adui-viteplus
             │                  ├─ adui-nestjs-prisma
             │                  ├─ adui-3d-architecture
             │                  ├─ adui-webgl2
             │                  └─ adui-tauri-v2
             │
             └──────── Profiles ─────────┐
                                         ↓
                              按项目技术栈按需组合
```

当前数据：

- Registry：84 条记录
- 启用并参与跟踪：82 个第三方 Skill
- Profiles：29 个
- ADui 自研核心 Skills：7 个

## 快速开始

校验仓库：

```bash
npm run validate
npm test
```

检测项目技术栈：

```bash
npm run detect:stack -- .
```

Profile 一键安装：

```powershell
npm run profile:list
npm run profile:plan -- vue unocss git --agent codex
npm run profile:install -- vue unocss git --agent codex --pm pnpm
```

根据目标项目自动识别技术栈和 npm / pnpm / yarn / bun：

```powershell
npm run profile:auto-install -- D:\Projects\my-app --agent codex --dry-run
```

## 每日 skills.sh 分类排行与 Pack 精选

仓库会每日从 skills.sh 按分类搜索候选，并结合安装量、GitHub Stars 与可用的安全审计结果做筛选：

```text
skills.sh 分类搜索
      ↓
按 installs 排序
      ↓
GitHub Stars / Audit 门禁
      ↓
排除 Pack 已有 Skill
      ↓
排除历史已选 Skill
      ↓
每分类选择一个最优新候选
      ↓
append-only 候选历史
      ↓
自动生成 PR，人工 Review
```

候选历史采用 **append-only**：不会删除、替换或覆盖之前已经选择的 Skill。

<!-- skills-sh-weekly-ranking:start -->
## skills.sh 今日分类排行榜

> 每日自动更新。最近一次排行：**2026-09-17** · [查看完整 Top 10 排行](./reports/skills-sh/latest.md) · [ADui Skills Pack](https://www.skills.sh/p/DCh7RQegkqCXcXn8)

| 分类 | 第 1 名 | Source | Installs | Stars | Audit |
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

> 排行展示与 Pack 候选选择是两件事：排行榜每日刷新；候选仍遵循 append-only，不删除、不替换已有 Skill。
<!-- skills-sh-weekly-ranking:end -->

本地预览：

```bash
npm run pack:ranking
```

写入候选状态：

```bash
npm run pack:ranking:apply
```

> skills.sh 当前公开文档没有提供稳定的 Pack 成员写入 API，因此自动化负责发现、排行、质量门禁、去重、选择与 PR；最终把新候选加入现有 Pack 仍需要在 skills.sh Pack 管理页确认。不会使用未公开内部接口、浏览器 Cookie 或长期登录会话绕过这一限制。

详细说明见 [skills.sh 每日分类排行](https://github.com/adui-studio/adui-skills/wiki/Weekly-Skills-Ranking)。

## 第三方 Skill 更新

第三方 Skill 不复制源码，只在 Registry 中记录来源，并使用 Skill 目录 Git tree SHA (`skillFolderHash`) 做审核锁定。

```bash
npm run updates:check
npm run updates:apply
```

第三方 Registry 更新与 Pack 候选变更仍然只通过 PR Review，**永远不会自动合并**；排行榜展示页则由每日 Workflow 自动刷新。

## 文档

详细文档统一从 GitHub Wiki 阅读：

- [Wiki 首页](https://github.com/adui-studio/adui-skills/wiki)
- [使用方法](https://github.com/adui-studio/adui-skills/wiki/Usage)
- [Profile 一键安装器](https://github.com/adui-studio/adui-skills/wiki/Profile-Installer)
- [skills.sh 每日分类排行](https://github.com/adui-studio/adui-skills/wiki/Weekly-Skills-Ranking)
- [skills.sh 最新完整榜单](https://github.com/adui-studio/adui-skills/wiki/Weekly-Skills-Ranking-Latest)
- [功能开发规范](https://github.com/adui-studio/adui-skills/wiki/Development)
- [总体架构](https://github.com/adui-studio/adui-skills/wiki/Architecture)
- [Vite+ 工程规范](https://github.com/adui-studio/adui-skills/wiki/VitePlus)
- [NestJS + Prisma 集成规范](https://github.com/adui-studio/adui-skills/wiki/NestJS-Prisma)
- [3D / GPU 架构](https://github.com/adui-studio/adui-skills/wiki/3D-Architecture)
- [WebGL2 工程规范](https://github.com/adui-studio/adui-skills/wiki/WebGL2)
- [Tauri v2 工程规范](https://github.com/adui-studio/adui-skills/wiki/Tauri-v2)
- [维护与每日更新](https://github.com/adui-studio/adui-skills/wiki/Maintenance)
- [安全规范](https://github.com/adui-studio/adui-skills/wiki/Security)
- [发布流程](https://github.com/adui-studio/adui-skills/wiki/Releasing)

仓库内 `docs/*.md` 仍是 Wiki 的唯一事实源；Wiki 由 GitHub Actions 自动同步。英文文档使用对应 `-EN` Wiki 页面作为兜底。
