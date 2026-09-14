# ADui Skills Pack 使用指南

[English](./usage.en.md) | 简体中文

## 1. 当前版本的使用模型

ADui Skills Pack 当前有三种内容：

1. `skills/`：可以通过 `skills` CLI 安装的 ADui 自研 Skill。
2. `registry/skills.json`：第三方 Skill 的来源、分类和评级。
3. `profiles/`：声明某种技术栈应该组合哪些第三方 Skill 与 ADui Skill。

当前 `profiles/*.json` 是声明式配置，尚未实现一键 Profile 安装器。

## 2. 安装 ADui Skill

安装单个 ADui Skill：

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-stack-router
```

其他示例：

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-feature-dev
npx skills add https://github.com/adui-studio/adui-skills --skill adui-viteplus
npx skills add https://github.com/adui-studio/adui-skills --skill adui-3d-architecture
```

## 3. 从 Registry 安装第三方 Skill

先在 `registry/skills.json` 查找 Skill：

```json
{
  "id": "vue-best-practices",
  "source": "vuejs-ai/skills"
}
```

安装：

```bash
npx skills add vuejs-ai/skills --skill vue-best-practices
```

通用格式：

```text
npx skills add <source> --skill <id>
```

其中：

- `source` 来自 `registry/skills.json` 的 `source`
- `id` 来自 `registry/skills.json` 的 `id`

## 4. Profile 的含义

例如：

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

`web` 和 `toolchain` 最终又会继承 `core`。

所以 Vue 项目实际能力集合是：

```text
core + web + toolchain + vue
```

Tailwind、UnoCSS、3D、Database 等 Profile 可以继续按项目依赖组合，而不是创建大量笛卡尔积 Profile。

## 5. 推荐组合

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
core + backend + database + prisma + postgresql + git
```

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

### uni-app x

```text
core + web + toolchain + uniapp-x + git
```

### 微信小程序 + CloudBase

```text
core + wechat-miniprogram + wechat-cloudbase + git
```

### Three.js / Babylon.js / CesiumJS

不要同时无条件加载全部 3D Skill。

由场景选择：

```text
普通 Web 3D          → threejs
完整实时 3D Engine   → babylonjs
GIS / Globe / 3D Tiles → cesiumjs
底层 WebGL2          → webgl2
GPU Compute / WGSL   → webgpu
```

`adui-3d-architecture` 负责技术决策而不是替代各引擎的 API Skill。

## 6. 自动检测技术栈

在 ADui Skills Pack 仓库中：

```bash
npm run detect:stack -- ../your-project
```

直接运行：

```bash
node skills/adui-stack-router/scripts/detect-stack.mjs ../your-project
```

机器可读输出：

```bash
node skills/adui-stack-router/scripts/detect-stack.mjs ../your-project --json
```

Router 会输出：

- 检测到的技术栈和证据
- Direct Profiles
- 展开继承后的 Effective Profiles
- 冲突和不确定项

检测过程是只读的，不读取 `.env`、Token、私钥等敏感文件。

## 7. 验证仓库

```bash
npm run validate
```

成功时退出码为 `0`。验证器同时检查 Registry、Profiles、本地 ADui Skill 与 `skills.lock.json`。

在 Lock 尚未建立 Baseline 时会得到 Warning；一旦 `generatedAt` 已初始化，任何已启用第三方 Skill 缺失 Lock 都会作为 Error。

## 8. 第三方 Skill 上游更新

只检查，不修改 Lock：

```bash
npm run updates:check
```

检查并刷新本地 Lock：

```bash
npm run updates:apply
```

首次初始化：

```bash
npm run lock:init
```

推荐通过 GitHub 的 **Actions → Weekly Skills Update → Run workflow** 完成首次初始化。第一次运行会为所有启用 Skill 建立 Baseline，并创建人工审核 PR。

只检查部分 Skill：

```bash
node scripts/check-updates.mjs --only vue-best-practices,unocss
```

完整维护方式见 [maintenance.md](./maintenance.md)。

## 9. 已安装 Skill 的客户端更新

ADui 自研 Skill：

```bash
npx skills update adui-stack-router
```

已安装 Skills 的统一更新：

```bash
npx skills update
```

这里更新的是开发者本地安装的 Skill；`registry/skills.lock.json` 则用于 ADui Skills Pack 自己跟踪已审核的上游版本，两者职责不同。

## 10. GitHub 与 CNB

GitHub：

```text
https://github.com/adui-studio/adui-skills
```

是唯一事实源。

CNB：

```text
https://cnb.cool/adui-studio/adui-skills
```

只作为国内同步镜像。Issue、PR、Release 均提交到 GitHub。
