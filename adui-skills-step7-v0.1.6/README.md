# ADui Skills Pack

[简体中文](./README.md) | [English](./README.en.md)

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
core + backend + database + prisma + postgresql + git

Three.js / Babylon.js / CesiumJS
按真实项目分别启用 threejs / babylonjs / cesiumjs
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
- 启用并参与跟踪：83 个第三方 Skill
- Profiles：27 个
- ADui 自研核心 Skills：2 个（`adui-stack-router`、`adui-feature-dev`）
- 已知停用项：`database-schema-design`（上游当前不可稳定访问）

## 文档

- [使用方法](./docs/usage.md)
- [功能开发规范](./docs/development.md)
- [维护与每周更新](./docs/maintenance.md)
- [架构说明](./docs/architecture.md)
- [添加 Skill](./docs/adding-skills.md)
- [安全规范](./docs/security.md)
- [贡献指南](./CONTRIBUTING.md)

英文兜底：见 [README.en.md](./README.en.md) 及各文档对应的 `.en.md` 文件。
