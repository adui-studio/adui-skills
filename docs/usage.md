# ADui Skills Pack 使用方法

[简体中文](./usage.md) | [English](./usage.en.md)

## 基本原则

不要把所有 Skill 一次性加载到同一个项目。优先运行 `adui-stack-router` 识别项目，再组合最小 Profile 集。

## 校验仓库

```bash
npm run validate
```

## 技术栈检测

```bash
npm run detect:stack -- .
```

JSON：

```bash
node skills/adui-stack-router/scripts/detect-stack.mjs . --json
```

## 功能开发

安装：

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-feature-dev
```

推荐流程：

```text
adui-stack-router
      ↓
选择最小 Profiles
      ↓
adui-feature-dev
      ↓
实现 / 测试 / Review / 交付
```

详细规范见 [development.md](./development.md)。

## 常见组合

### Vue + UnoCSS

```text
core + web + toolchain + vue + unocss + git
```

### React + Tailwind CSS

```text
core + web + toolchain + react + tailwind + git
```

### NestJS + Prisma + PostgreSQL

```text
core + nestjs-prisma + postgresql + git
```

### Tauri + Vue

```text
core + web + toolchain + vue + tauri + git
```

### uni-app

```text
core + web + toolchain + uniapp + git
```

### 3D/GPU

- 普通 Web 3D：Three.js
- 完整实时 3D Engine：Babylon.js
- GIS / Globe / 3D Tiles：CesiumJS
- 底层 Raster / GLSL：WebGL2
- GPU Compute / WGSL：WebGPU

这些 Profile 统一继承 `3d`，因此会加载 `adui-3d-architecture`。原生 `webgl2` 还会加载 `adui-webgl2`。

## 3D / GPU 架构 Skill

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-3d-architecture
npx skills add https://github.com/adui-studio/adui-skills --skill adui-webgl2
```

如果项目还没确定引擎，先使用 `adui-3d-architecture`；如果已经确认使用 raw WebGL2，再加载 `adui-webgl2`。

## 安装第三方 Skill

从 `registry/skills.json` 读取 `source` 和 `id`：

```bash
npx skills add <source> --skill <id>
```

示例：

```bash
npx skills add vuejs-ai/skills --skill vue-best-practices
```

## 语言

仓库文档默认中文。英文用户使用对应 `.en.md` 文件。

## Vite+ 专项

当 Stack Router 检测到 `vite-plus` 或 `vite.config.*` 从 `vite-plus` 导入时启用：

```text
core + toolchain + viteplus
```

安装：

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-viteplus
```

## NestJS + Prisma 专项

仅在两者同时存在时启用：

```text
core + backend + database + prisma + nestjs-prisma
```

安装：

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-nestjs-prisma
```
