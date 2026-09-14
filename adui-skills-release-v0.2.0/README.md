# ADui Skills Pack

[简体中文](./README.md) | [English](./README.en.md)

[![版本](https://img.shields.io/github/v/release/adui-studio/adui-skills?include_prereleases&sort=semver)](https://github.com/adui-studio/adui-skills/releases)
[![校验](https://github.com/adui-studio/adui-skills/actions/workflows/validate.yml/badge.svg?branch=main)](https://github.com/adui-studio/adui-skills/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![skills.sh](https://skills.sh/b/adui-studio/adui-skills)](https://skills.sh/adui-studio/adui-skills)

> **当前版本：v0.2.0 Public Preview。** `v0.2.x` 面向公开试用，Registry/Profile Schema 与安装体验在 `v1.0.0` 前仍可能继续演进。

ADui Skills Pack 是一套面向 AI Coding / Agent 开发的个人技能体系，覆盖全栈开发、跨端开发、数据库、Git 交付和 Web 3D/GPU。

> **语言约定**：仓库内文档、GitHub Actions 名称与维护报告默认使用中文；英文文档使用同名 `.en.md` 文件作为兜底。

## 仓库

- GitHub 主仓库：`https://github.com/adui-studio/adui-skills`
- CNB 国内镜像：`https://cnb.cool/adui-studio/adui-skills`

GitHub 是唯一事实源。Issue、Pull Request、Release 与每周更新都以 GitHub 为准；CNB 只作为国内同步镜像。

## 技术范围

- 前端：Vue、React、Tailwind CSS、UnoCSS
- 工程化：Vite、Vite+、Vitest、pnpm
- 后端：NestJS、TypeScript
- 数据库：Prisma、SQL、PostgreSQL、MySQL、SQLite
- 跨端：Flutter、Tauri
- 小程序：uni-app、uni-app x、微信小程序、CloudBase
- 3D/GPU：Three.js、Babylon.js、CesiumJS、WebGL2、WebGPU
- Git/交付：Git、GitHub、PR、Changelog、Release

## 核心设计

```text
第三方 Skill                ADui 自研 Skill
    │                            │
    ├─ Registry                 ├─ adui-stack-router
    ├─ Folder Hash Lock         ├─ adui-feature-dev
    └─ Weekly Update            └─ 技术胶水与路由能力
             │
             └──────── Profiles ────────┐
                                        ↓
                               按项目技术栈按需组合
```

仓库不复制第三方 Skill 源码。第三方 Skill 只在 `registry/skills.json` 中登记来源，并由 `registry/skills.lock.json` 记录审核过的 Skill 目录 Git tree SHA。

## 快速开始

### 1. 校验仓库

```bash
npm run validate
```

### 2. 检测当前项目技术栈

```bash
npm run detect:stack -- .
```

检测其他项目：

```bash
npm run detect:stack -- D:/Projects/my-project
```

机器可读输出：

```bash
node skills/adui-stack-router/scripts/detect-stack.mjs . --json
```

### 3. 安装 ADui 自研 Skill

技术栈路由：

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-stack-router
```

统一功能开发流程：

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-feature-dev
```

推荐先用 `adui-stack-router` 识别项目，再用 `adui-feature-dev` 约束需求理解、最小改动、测试验证和交付。
Vite+ 专项工具链：

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-viteplus
```

NestJS + Prisma 集成：

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-nestjs-prisma
```

3D / GPU 架构决策：

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-3d-architecture
```

原生 WebGL2：

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-webgl2
```

Tauri v2：

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-tauri-v2
```


### 4. 安装 Registry 中的第三方 Skill

例如 Vue：

```bash
npx skills add vuejs-ai/skills --skill vue-best-practices
npx skills add antfu/skills --skill vue
```

React：

```bash
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices
npx skills add vercel-labs/agent-skills --skill vercel-composition-patterns
```

## Profiles

`profiles/*.json` 是声明式技术组合，不是独立 Skill。

常见组合：

```text
Vue + UnoCSS
core + web + toolchain + vue + unocss + git

React + Tailwind CSS
core + web + toolchain + react + tailwind + git

NestJS + Prisma + PostgreSQL
core + nestjs-prisma + postgresql + git

Three.js / Babylon.js / CesiumJS / WebGL2 / WebGPU
统一继承 3d Profile；按真实项目分别启用 threejs / babylonjs / cesiumjs / webgl2 / webgpu
```

完整使用方法见 [docs/usage.md](./docs/usage.md)。

## ADui 功能开发流程

`adui-feature-dev` 是仓库的第二个核心自研 Skill，负责把编码任务统一为：

```text
理解需求
  ↓
建立项目上下文 / 技术路由
  ↓
说明假设与风险
  ↓
最小必要修改
  ↓
测试与质量门禁
  ↓
Review Git Diff
  ↓
按固定交付契约输出
```

默认不会自动执行 `commit`、`push`、`merge` 或 `release`，除非用户明确要求。完整说明见 [docs/development.md](./docs/development.md)。


## Vite+ 与 NestJS + Prisma 专项能力

- `adui-viteplus`：仅在真实 Vite+ 项目中启用，统一 `vp check/test/build/pack`、`vite.config.ts` 与渐进式迁移规则。
- `adui-nestjs-prisma`：仅在 NestJS 与 Prisma 同时存在时启用，补充模块边界、数据访问、事务、错误映射、迁移与真实数据库测试规范。

Stack Router 会在同时检测到 NestJS 与 Prisma 时选择 `nestjs-prisma` 组合 Profile，避免普通 NestJS 或非 NestJS Prisma 项目误加载该 Skill。

详细说明见 [Vite+ 工程规范](./docs/viteplus.md) 与 [NestJS + Prisma 集成规范](./docs/nestjs-prisma.md)。

## 3D / GPU 架构与 WebGL2

- `adui-3d-architecture`：统一 Three.js、Babylon.js、CesiumJS、WebGL2、WebGPU 的选型、坐标体系、多引擎边界、性能与资源生命周期。
- `adui-webgl2`：原生 WebGL2 / GLSL ES 3.0 的 Pipeline、Shader、FBO、VAO、资源释放、Context Lost 与性能规范。

所有 3D/GPU 专项 Profile 统一继承 `3d` Profile；只有 `webgl2` Profile 会额外加载 `adui-webgl2`。详细说明见 [3D / GPU 架构](./docs/3d-architecture.md) 与 [WebGL2 工程规范](./docs/webgl2.md)。

## 第三方 Skill 更新机制

v0.1.4 起不再使用 GitHub `commits?path=` API 作为核心版本检测方式，而是：

```text
按 source 分组
   ↓
每个 GitHub 仓库克隆一次
   ↓
定位 SKILL.md
   ↓
计算 Skill 所在目录 Git tree SHA
   ↓
skillFolderHash
   ↓
与 skills.lock.json 比较
```

这种方式只在 Skill 目录实际发生变化时更新 Lock，避免同仓库其他 Skill 修改造成假阳性。

检查但不写入：

```bash
npm run updates:check
```

检查并更新 Lock：

```bash
npm run updates:apply
```

首次建立基线：

```bash
npm run lock:init
```

每周一 09:17（Asia/Shanghai）GitHub Actions 会自动检查上游变化；有实际变更时创建 PR，但**永远不会自动合并**。

维护说明见 [docs/maintenance.md](./docs/maintenance.md)。

## 当前数据

- Registry：84 条记录
- 启用并参与跟踪：82 个第三方 Skill
- Profiles：29 个
- ADui 自研核心 Skills：7 个（`adui-stack-router`、`adui-feature-dev`、`adui-viteplus`、`adui-nestjs-prisma`、`adui-3d-architecture`、`adui-webgl2`、`adui-tauri-v2`）
- 已知停用项：`database-schema-design`（上游当前不可稳定访问）

## 文档

- [使用方法](./docs/usage.md)
- [功能开发规范](./docs/development.md)
- [Vite+ 工程规范](./docs/viteplus.md)
- [NestJS + Prisma 集成规范](./docs/nestjs-prisma.md)
- [3D / GPU 架构](./docs/3d-architecture.md)
- [WebGL2 工程规范](./docs/webgl2.md)
- [Tauri v2 工程规范](./docs/tauri-v2.md)
- [Profile 一键安装器](./docs/profile-installer.md)
- [维护与每周更新](./docs/maintenance.md)
- [架构说明](./docs/architecture.md)
- [添加 Skill](./docs/adding-skills.md)
- [安全规范](./docs/security.md)
- [贡献指南](./CONTRIBUTING.md)
- [发布流程](./docs/releasing.md)
- [安全策略](./SECURITY.md)

英文兜底：见 [README.en.md](./README.en.md) 及各文档对应的 `.en.md` 文件。

## Profile 一键安装

现在 `profiles/*.json` 可以直接生成并执行安装计划，并支持 npm / pnpm / yarn / bun：

```powershell
npm run profile:list
npm run profile:plan -- vue unocss git --agent codex
npm run profile:install -- vue unocss git --agent codex --pm pnpm
```

包管理器默认按 `--pm` → `package.json#packageManager` → Lock 文件 → 当前执行环境 → npm 的优先级自动选择。多种 Lock 文件冲突时不会猜测，会要求显式指定 `--pm`。

根据项目技术栈和目标项目包管理器自动安装：

```powershell
npm run profile:auto-install -- D:\Projects\my-app --agent codex --dry-run
```

即使命令从 ADui Skills Pack 仓库通过 npm 启动，`auto-install` 也会按目标项目识别 pnpm/yarn/bun，并在目标项目目录执行安装。第一次建议使用 `--dry-run`。实际安装必须显式指定 `--agent` 或 `--all-agents`。详见 [Profile 一键安装器](./docs/profile-installer.md)。

## Tauri v2

Tauri Profile 现已包含 `adui-tauri-v2`，用于统一 IPC、State、Capability/Permission、插件、Shell/Sidecar、SQL、Updater 与构建发布规范。详见 [Tauri v2 工程规范](./docs/tauri-v2.md)。


## 发布与 skills.sh Pack

GitHub Release 由 `v*` 标签触发，发布前会强制运行校验、测试和 Folder Hash Lock 完整性检查。完整流程见 [发布流程](./docs/releasing.md)。

skills.sh Pack 需要登录 Vercel 后在网页创建。Pack URL 真实生成之前不会在仓库中伪造 `<pack-id>`。官方 Pack 创建完成后，可使用一条 `npx skills add https://skills.sh/p/<pack-id>` 安装 Pack。
