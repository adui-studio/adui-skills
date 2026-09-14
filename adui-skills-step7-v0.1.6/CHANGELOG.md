# 更新日志

[简体中文](./CHANGELOG.md) | [English](./CHANGELOG.en.md)

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
