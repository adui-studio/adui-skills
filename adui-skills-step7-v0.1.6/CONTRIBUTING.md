# 贡献指南

[简体中文](./CONTRIBUTING.md) | [English](./CONTRIBUTING.en.md)

## 基本规则

- GitHub `adui-studio/adui-skills` 是唯一主仓库。
- CNB 只做同步镜像，不在 CNB 提交独立修改。
- 文档默认中文；英文使用同名 `.en.md` 兜底。
- 第三方 Skill 只登记 Registry，不复制源码。
- 上游更新必须人工 Review，不自动 merge。

## 提交前

```bash
npm run validate
```

涉及第三方 Registry：

```bash
npm run updates:check
```

涉及技术栈路由：

```bash
npm run detect:stack -- <project-root>
```

## Commit 建议

```text
feat(registry): 增加新的第三方 Skill
feat(router): 完善技术栈检测规则
fix(update): 修复上游路径自动解析
ci: 调整每周更新 Workflow
docs: 更新中文与英文兜底文档
```
