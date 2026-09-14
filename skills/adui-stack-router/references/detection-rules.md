# Detection Rules

## Confidence

- **high**: explicit dependency, framework manifest, config import, or database provider.
- **medium**: characteristic files or source APIs without a confirming dependency.
- **low**: weak heuristic. Do not auto-select a profile solely from low confidence.

## JavaScript / TypeScript

| Technology | Strong signals | Secondary signals | Profile |
|---|---|---|---|
| Vue | `vue` dependency | `.vue` files | `vue` |
| React | `react` dependency | `.tsx/.jsx` with React imports | `react` |
| Vite | `vite` dependency, `vite.config.*` | Vite scripts | `toolchain` |
| Vite+ | `vite-plus` dependency, `defineConfig` imported from `vite-plus` | `vp` scripts | `viteplus` |
| pnpm | `packageManager: pnpm@...`, `pnpm-lock.yaml`, `pnpm-workspace.yaml` | `.pnpmfile.cjs` | `pnpm` |
| Tailwind CSS | `tailwindcss` / `@tailwindcss/*` dependency, Tailwind config/import | Tailwind directives | `tailwind` |
| UnoCSS | `unocss` / `@unocss/*` dependency, `uno.config.*`, Vite UnoCSS plugin | atomic-class usage alone is insufficient | `unocss` |
| NestJS | `@nestjs/core` dependency | Nest decorators in source | `backend` |
| Prisma | `prisma` / `@prisma/client`, `schema.prisma` | `PrismaClient` source usage | `prisma` |
| Tauri | `src-tauri/`, `@tauri-apps/api` | `tauri.conf.json` | `tauri` |
| Three.js | `three`, `@react-three/fiber` | imports from `three` | `threejs` |
| Babylon.js | any `@babylonjs/*` dependency | imports from `@babylonjs/*` | `babylonjs` |
| CesiumJS | `cesium`, `@cesium/*`, `resium` | Cesium imports | `cesiumjs` |
| WebGPU | `navigator.gpu`, `GPUDevice`, `@webgpu/types` | WGSL files | `webgpu` |
| WebGL2 | `getContext('webgl2')`, `WebGL2RenderingContext` | GLSL ES 3.0 source | `webgl2` |

## Databases

Prefer datasource declarations over driver packages.

1. Parse `prisma/schema.prisma` or root `schema.prisma`.
2. Map `provider = "postgresql"` to `postgresql`.
3. Map `provider = "mysql"` to `mysql`.
4. Map `provider = "sqlite"` to `sqlite`.
5. If Prisma has no resolvable provider, inspect driver dependencies:
   - PostgreSQL: `pg`, `postgres`, `@neondatabase/serverless`
   - MySQL: `mysql`, `mysql2`
   - SQLite: `better-sqlite3`, `sqlite3`, `@libsql/client`
6. If multiple database engines are genuinely present, select each relevant engine profile and explain why.

## Flutter

Select `flutter` when `pubspec.yaml` contains a Flutter SDK dependency or a conventional Flutter section.

## uni-app / uni-app x

Select `uniapp` when `@dcloudio/uni-*` dependencies and `pages.json` / `manifest.json` indicate uni-app.

Select `uniapp-x` when UTS/UVue source files or explicit uni-app x dependencies/configuration are present. UTS alone is medium confidence because plugins may introduce UTS inside a normal uni-app project.

## WeChat Mini Program

Select `wechat-miniprogram` when `project.config.json` and `app.json` / configured `miniprogramRoot` indicate a native mini program.

Add `wechat-cloudbase` only when CloudBase dependencies or source APIs such as `wx.cloud` are present.

## Styling conflict

When Tailwind CSS and UnoCSS are both detected:

1. Inspect their config files and Vite plugins.
2. If both are active, select both and warn that style ownership must remain explicit.
3. If only one is configured, select the configured profile and report the other as an installed-but-unused candidate.
4. Never convert between the two unless the user asks.
