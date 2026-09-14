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
    └─ Weekly Update            ├─ adui-viteplus
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

## 每周 skills.sh 分类排行与 Pack 精选

仓库会每周从 skills.sh 按分类搜索候选，并结合安装量、GitHub Stars 与可用的安全审计结果做筛选：

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
## skills.sh 本周分类排行榜

> 每周自动更新。首次榜单将在 Workflow 第一次运行后生成 · [查看 Wiki 最新完整榜单](https://github.com/adui-studio/adui-skills/wiki/Weekly-Skills-Ranking-Latest) · [ADui Skills Pack](https://www.skills.sh/p/DCh7RQegkqCXcXn8)

| 分类 | 第 1 名 | Source | Installs | Stars | Audit |
| --- | --- | --- | ---: | ---: | --- |
| - | 等待首次自动刷新 | - | - | - | - |

> README 展示每个分类第 1 名；Wiki / `reports/skills-sh/latest.md` 展示每个分类 Top 5。候选仍遵循 append-only，不删除、不替换已有 Skill。
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

详细说明见 [skills.sh 每周分类排行](https://github.com/adui-studio/adui-skills/wiki/Weekly-Skills-Ranking)。

## 第三方 Skill 更新

第三方 Skill 不复制源码，只在 Registry 中记录来源，并使用 Skill 目录 Git tree SHA (`skillFolderHash`) 做审核锁定。

```bash
npm run updates:check
npm run updates:apply
```

每周更新和每周排行都只会创建 PR，**永远不会自动合并**。

## 文档

详细文档统一从 GitHub Wiki 阅读：

- [Wiki 首页](https://github.com/adui-studio/adui-skills/wiki)
- [使用方法](https://github.com/adui-studio/adui-skills/wiki/Usage)
- [Profile 一键安装器](https://github.com/adui-studio/adui-skills/wiki/Profile-Installer)
- [skills.sh 每周分类排行](https://github.com/adui-studio/adui-skills/wiki/Weekly-Skills-Ranking)
- [skills.sh 最新完整榜单](https://github.com/adui-studio/adui-skills/wiki/Weekly-Skills-Ranking-Latest)
- [功能开发规范](https://github.com/adui-studio/adui-skills/wiki/Development)
- [总体架构](https://github.com/adui-studio/adui-skills/wiki/Architecture)
- [Vite+ 工程规范](https://github.com/adui-studio/adui-skills/wiki/VitePlus)
- [NestJS + Prisma 集成规范](https://github.com/adui-studio/adui-skills/wiki/NestJS-Prisma)
- [3D / GPU 架构](https://github.com/adui-studio/adui-skills/wiki/3D-Architecture)
- [WebGL2 工程规范](https://github.com/adui-studio/adui-skills/wiki/WebGL2)
- [Tauri v2 工程规范](https://github.com/adui-studio/adui-skills/wiki/Tauri-v2)
- [维护与每周更新](https://github.com/adui-studio/adui-skills/wiki/Maintenance)
- [安全规范](https://github.com/adui-studio/adui-skills/wiki/Security)
- [发布流程](https://github.com/adui-studio/adui-skills/wiki/Releasing)

仓库内 `docs/*.md` 仍是 Wiki 的唯一事实源；Wiki 由 GitHub Actions 自动同步。英文文档使用对应 `-EN` Wiki 页面作为兜底。
