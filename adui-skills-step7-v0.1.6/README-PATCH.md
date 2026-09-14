# ADui Skills Pack v0.1.6 增量包

[简体中文](./README-PATCH.md) | [English](./README-PATCH.en.md)

本增量包正式实现第二个 ADui 核心自研 Skill：`adui-feature-dev`。

## 主要变化

- 新增 `skills/adui-feature-dev/`。
- 固化“理解需求 → 最小改动 → 测试验证 → Diff Review → 交付”的开发流程。
- 固化六段式中文交付格式。
- 新增功能开发质量门禁、Git 安全边界和英文兜底参考。
- README、docs、AGENTS 默认中文并同步更新英文兜底。

## 应用

```powershell
.\adui-skills-step7-v0.1.6\apply.ps1 -RepositoryRoot . -Force
npm run validate
npm run test:updates
git diff
```

确认无误后再提交。
