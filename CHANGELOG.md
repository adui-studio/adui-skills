# Changelog

## v0.1.5

### 修复

- 修复 v0.1.4 `apply.ps1` 在已有目录上可能产生同名嵌套目录的问题。
- 新增跨平台 `apply.mjs`，统一使用“复制目录内容”语义。
- 自动清理可识别的 `registry/registry`、`profiles/profiles`、`scripts/tests/tests` 和 Stack Router 重复嵌套目录。
- 应用后强制确认 Registry 与 Lock 已迁移到 v2，并默认执行完整校验。

# 更新日志

[简体中文](./CHANGELOG.md) | [English](./CHANGELOG.en.md)

## 未发布

### 变更

- 仓库文档与 GitHub Actions 默认改为中文，英文使用 `.en.md` 兜底。
- 第三方 Skill 跟踪模型升级到 Registry/Lock v2。
- 使用 `skillFolderHash`（Skill 目录 Git tree SHA）判断真实变化。
- 上游仓库按 `source` 分组，每个仓库每次只克隆一次。
- `skillPath` 失效时支持扫描 `SKILL.md` frontmatter `name` 自动修复路径。
- 单个第三方仓库失败默认只警告，不阻塞其他 Skill 更新。
- 修正 Vercel、Prisma、Tailwind、TypeScript、uni-app 等已知路径。
- `uniapp-mini-guide` 更正为 `uniapp-mini`。
- 暂停 `database-schema-design`，等待可靠上游恢复或替代。
