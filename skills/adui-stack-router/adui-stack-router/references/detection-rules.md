# 技术栈检测规则

[简体中文](./detection-rules.md) | [English](./detection-rules.en.md)

## 置信度

- **高**：明确依赖、框架 manifest、配置 import 或数据库 provider。
- **中**：特征文件或源码 API，但缺少依赖确认。
- **低**：弱启发式；不能仅凭低置信度自动选择 Profile。

## JavaScript / TypeScript

| 技术 | 强信号 | 次级信号 | Profile |
|---|---|---|---|
| Vue | `vue` 依赖 | `.vue` 文件 | `vue` |
| React | `react` 依赖 | `.tsx/.jsx` + React import | `react` |
| Vite | `vite`、`vite.config.*` | Vite scripts | `toolchain` |
| Vite+ | `vite-plus`、从 `vite-plus` import `defineConfig` | `vp` scripts | `viteplus` |
| pnpm | `packageManager: pnpm@...`、lock/workspace | `.pnpmfile.cjs` | `pnpm` |
| Tailwind CSS | `tailwindcss` / `@tailwindcss/*`、配置/import | directives | `tailwind` |
| UnoCSS | `unocss` / `@unocss/*`、`uno.config.*` | 原子类本身不足 | `unocss` |
| NestJS | `@nestjs/core` | Nest decorators | `backend` |
| Prisma | `prisma` / `@prisma/client`、`schema.prisma` | `PrismaClient` | `prisma` |
| Tauri | `src-tauri/`、`@tauri-apps/api` | `tauri.conf.json` | `tauri` |
| Three.js | `three` / `@react-three/fiber` | Three import | `threejs` |
| Babylon.js | `@babylonjs/*` | Babylon import | `babylonjs` |
| CesiumJS | `cesium` / `@cesium/*` / `resium` | Cesium import | `cesiumjs` |
| WebGPU | `navigator.gpu`、`GPUDevice`、`@webgpu/types` | WGSL | `webgpu` |
| WebGL2 | `getContext('webgl2')`、`WebGL2RenderingContext` | GLSL ES 3.0 | `webgl2` |

## 数据库

优先使用 datasource 声明，不优先使用驱动包猜测：

1. 解析 `prisma/schema.prisma` 或根目录 `schema.prisma`。
2. `provider = "postgresql"` → `postgresql`。
3. `provider = "mysql"` → `mysql`。
4. `provider = "sqlite"` → `sqlite`。
5. 无法从 Prisma 判断时，再检查数据库驱动依赖。

## uni-app / uni-app x

- `@dcloudio/uni-*` + `pages.json` / `manifest.json`：`uniapp`。
- UTS/UVue 或明确 uni-app x 配置：候选 `uniapp-x`。
- UTS 也可能来自普通 uni-app 插件，因此仅作为中等置信度时要继续确认。

## 微信小程序

`project.config.json` 与 `app.json` / `miniprogramRoot` 明确指向原生小程序时选择 `wechat-miniprogram`。

只有存在 CloudBase 依赖或 `wx.cloud` 等 API 时才增加 `wechat-cloudbase`。
