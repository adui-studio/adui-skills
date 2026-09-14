# 更新日志

[简体中文](./CHANGELOG.md) | [English](./CHANGELOG.en.md)

## v0.2.0 - Public Preview

- 发布前同步上游状态：`github/awesome-copilot` 已移除 `gh-cli`，因此 v0.2.0 将其标记为 `upstream-unavailable` 并从 Git Profile 默认集合移除。


### 发布前修正

- 同步 Flutter 官方 `flutter/agent-plugins` 当前 `skills/` 目录：移除已不在主分支中的 `flutter-managing-state`、`flutter-implementing-navigation-and-routing`、`flutter-handling-http-and-json`。
- Flutter Profile 改用当前官方 `flutter-setup-declarative-routing`、`flutter-use-http-package`、`flutter-implement-json-serialization`。

### 发布

- 首个公开预览版本，版本线从内部 `v0.1.x` 进入 `v0.2.x Public Preview`。
- 新增 GitHub Tag 驱动的 Release Workflow、发布前检查、Release ZIP 与 SHA256 产物。
- 新增 `RELEASE.md`、`docs/releasing.md`、`releases/v0.2.0.md` 及英文兜底。
- 新增根目录 `SECURITY.md` 与 MIT License，补齐公开仓库发布基础文件。
- 新增 GitHub Issue Forms、PR 模板与 Release Notes 分类配置。
- README 增加版本、校验、License 与 skills.sh Badge，并明确 Public Preview 状态。

### 约束

- 正式 Release 前必须存在真实的第三方 Skill Folder Hash Lock 基线。
- skills.sh Pack 需要 Vercel 登录后手动创建；在 Pack ID 真实存在前不写伪造 URL。

## v0.1.11

### 新增

- Profile 一键安装器正式支持 npm、pnpm、yarn、bun。
- 新增 `--pm` / `--package-manager`、包管理器自动检测、`--no-pm-detect` 与 `--project-root`。
- 新增基于 `packageManager`、Lock 文件、Workspace 标记和当前执行环境的包管理器识别。

### 改进

- `auto-install` 现在会在目标项目目录执行 Skills CLI，不再错误地在 ADui Skills Pack 仓库目录安装。
- 检测到多个不同包管理器 Lock 文件时拒绝猜测，要求显式 `--pm`。
- 实际安装前检查包管理器是否可用；由于安装器使用 `yarn dlx`，Yarn Classic 1.x 会被明确拒绝。
- 新增包管理器检测、Monorepo、Windows `.cmd` Runner 与四类命令生成测试。

## v0.1.10

### 修复

- 修复 Windows 下 `scripts/tests/stack-router.test.mjs` 使用 `new URL(import.meta.url).pathname` 导致盘符被重复解析为 `D:\\D:\\...` 的问题。
- 统一改用 Node.js `fileURLToPath(import.meta.url)` 将 `file:` URL 转为本地文件系统路径，兼容 Windows 盘符、空格和 URL 编码字符。
- 新增 Stack Router 测试入口存在性检查，让路径解析错误能够以更直接的错误信息暴露。

### 验证

- `npm test` 现在包含 16 个测试；Stack Router 的 8 个测试均使用跨平台路径解析。


## v0.1.9

### 新增

- 实现 `adui-tauri-v2`，覆盖 Tauri v2 IPC、State、Capability/Permission、插件、Shell/Sidecar、SQL、Updater 与构建发布规范。
- 新增 Profile 一键安装器 `scripts/profile-manager.mjs`，支持 Profile 继承解析、安装计划、项目/全局安装、指定 Agent 与基于 Stack Router 的自动安装。
- 新增 `docs/tauri-v2.md` 与 `docs/profile-installer.md`，中文为默认，英文文档兜底。
- Tauri Profile 正式启用 `adui-tauri-v2`。

## v0.1.8

### 新增

- 正式实现 `adui-3d-architecture`，统一 Three.js、Babylon.js、CesiumJS、WebGL2、WebGPU 的技术选型、坐标体系、多引擎集成、性能和资源生命周期。
- 正式实现 `adui-webgl2`，覆盖原生 WebGL2 / GLSL ES 3.0 Pipeline、VAO/FBO/UBO、Shader 调试、Context Lost、资源释放和性能规范。
- 新增共享 `3d` Profile，Three.js、Babylon.js、CesiumJS、WebGL2、WebGPU 均继承该 Profile。
- 新增 `docs/3d-architecture.md`、`docs/webgl2.md` 及英文兜底文档。
- Stack Router 新增多 3D 引擎检测警告和 3D Profile 继承测试。

### 改进

- `webgl2` Profile 只在原生 WebGL2 场景加载 `adui-webgl2`。
- 3D/GPU 专项 Profile 共享 `adui-3d-architecture`，避免重复规则。
- 自动化测试增加 Three.js、WebGL2 和多引擎警告场景。

## v0.1.7

### 新增

- 正式实现 `adui-viteplus`，覆盖 Vite+ 配置、`vp` 命令、质量检查、Vitest、tsdown 打包与渐进迁移。
- 正式实现 `adui-nestjs-prisma`，覆盖 NestJS 模块边界、Prisma 数据访问、事务、错误映射、迁移与测试。
- 新增 `nestjs-prisma` 组合 Profile，仅在 NestJS 与 Prisma 同时存在时加载。
- 新增 Stack Router 自动化测试，验证 NestJS + Prisma 组合路由与 Vite+ 优先级。
- 新增 `docs/viteplus.md`、`docs/nestjs-prisma.md` 及英文兜底文档。

### 改进

- `backend` Profile 不再默认加载 Prisma 集成 Skill。
- GitHub 校验 Workflow 改为运行全部自动化测试。
- 清理尚未实现的 `adui-tauri-v2`、`adui-webgl2`、`adui-3d-architecture` Profile 引用，保证 `localSkills` 只指向真实存在的 Skill。


## v0.1.6

### 新增

- 正式实现 `adui-feature-dev`，统一功能开发、Bug 修复和重构流程。
- 新增需求复述、假设与风险、最小改动、质量门禁、Diff Review 和交付契约。
- 新增 `docs/development.md` 与英文兜底文档。
- Registry 校验器增加本地 Skill frontmatter 和中英文文档配对检查。

### 改进

- README、使用文档、架构文档和 AGENTS 增加 `adui-feature-dev` 使用说明。
- 增量应用器开始管理 `skills/adui-feature-dev`。

## v0.1.5

### 修复

- 修复 v0.1.4 `apply.ps1` 在已有目录上可能产生同名嵌套目录的问题。
- 新增跨平台 `apply.mjs`，统一使用“复制目录内容”语义。
- 自动清理可识别的错误嵌套目录。
- 应用后强制确认 Registry 与 Lock 已迁移到 v2，并默认执行完整校验。

## v0.1.4

### 变更

- 仓库文档与 GitHub Actions 默认改为中文，英文使用 `.en.md` 兜底。
- 第三方 Skill 跟踪模型升级到 Registry/Lock v2。
- 使用 `skillFolderHash` 判断 Skill 目录真实变化。
- 上游仓库按 `source` 分组，每个仓库每次只克隆一次。
- `skillPath` 失效时支持按 `SKILL.md` frontmatter `name` 自动修复。
- 单个第三方仓库失败默认只警告，不阻塞其他 Skill 更新。
- `uniapp-mini-guide` 更正为 `uniapp-mini`。
- 暂停 `database-schema-design`，等待可靠上游恢复或替代。
