# AGENTS.md

## 项目定位

ADui Skills Pack 是 ADui 自用并可公开复用的 Agent Skills 精选、路由、校验和维护仓库。

## 语言规则

1. 默认使用简体中文编写 README、docs、CHANGELOG、CONTRIBUTING、维护报告和 GitHub Actions 名称/步骤。
2. 面向外部英文用户时提供同名 `.en.md` 兜底文档。
3. 代码标识、第三方 Skill ID、包名、API 名称保持原文，不强制翻译。

## 修改原则

1. 先理解任务和项目结构，再修改。
2. 只做完成任务所需的最小改动。
3. 第三方 Skill 不复制到 `skills/`，只维护 Registry、Profile 和 Lock。
4. ADui 自研 Skill 放在 `skills/`。
5. 上游 Skill 更新不能自动 merge。
6. 任何“已完成”结论必须基于实际校验结果。
7. 不在代码或文档中写入 Token、密码或密钥。

## Registry

Registry v2 使用：

- `skillPath`：上游 `SKILL.md` 路径；
- `autoResolvePath`：路径失效时是否允许按 frontmatter `name` 自动定位；
- `status`：`active` / `upstream-unavailable` / `deprecated`；
- `skills.lock.json`：使用 `skillFolderHash` 锁定 Skill 目录 Git tree SHA。

## 验证

提交前至少运行：

```bash
npm run validate
```

修改上游跟踪逻辑时，还要运行本地 Git fixture 测试或等价的可重复验证。

## 功能开发约定

处理仓库内的功能开发、Bug 修复或重构时，遵循 `skills/adui-feature-dev/SKILL.md`：先理解需求与上下文，采用最小必要改动，完成实际验证，再交付结果。技术栈不明确时先使用 `adui-stack-router`。

## 专项自研 Skill

- Vite+ 项目优先使用 `adui-viteplus`，不要把普通 Vite 项目自动迁移到 Vite+。
- NestJS 与 Prisma 同时存在时使用 `adui-nestjs-prisma`；只有其中一个技术时不要加载该组合 Skill。
- 3D / GPU 选型和多引擎协同时使用 `adui-3d-architecture`；不要因个人熟悉度默认指定引擎。
- 只有项目直接使用原生 WebGL2 API 时加载 `adui-webgl2`；Three.js/Babylon.js/CesiumJS 项目不要无故下沉到 raw WebGL2。
- Tauri v2 项目优先使用 `adui-tauri-v2`；新增系统能力必须同时审查 IPC、Capability/Permission、scope、平台差异和资源生命周期。
- Profile 安装统一使用 `scripts/profile-manager.mjs`；支持 npm / pnpm / yarn / bun，优先按目标项目自动检测，允许 `--pm` 显式覆盖；实际安装必须显式指定 Agent 或 `--all-agents`，避免非交互环境出现假成功。


## 发布阶段

- 发布前执行 `npm run release:check -- --tag vX.Y.Z`。
- 不自动创建版本标签；标签必须从已合并的 `main` Commit 人工创建并推送。
- `v0.2.x` Release 必须拥有真实 Folder Hash Lock 基线。
- Release Notes 默认中文，英文 `.en.md` 兜底。
