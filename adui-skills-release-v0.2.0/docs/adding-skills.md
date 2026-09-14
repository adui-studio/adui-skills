# 添加 Skill

[简体中文](./adding-skills.md) | [English](./adding-skills.en.md)

## 第三方 Skill

1. 确认上游仓库可信、许可证和维护状态可接受。
2. 在 `registry/skills.json` 新增记录。
3. 优先填写准确的 `skillPath`；不确定时可设为 `null`，但必须保持 `autoResolvePath=true`。
4. 将 Skill ID 加入对应 `profiles/*.json`。
5. 执行 `npm run validate`。
6. 执行 `npm run updates:apply` 建立 Folder Hash。
7. Review `git diff` 后提交。

不要把第三方 Skill 源码复制到 `skills/`。

## ADui 自研 Skill

放入：

```text
skills/<skill-name>/
├── SKILL.md
├── agents/openai.yaml
├── references/   # 按需
└── scripts/      # 按需
```

`SKILL.md` 保持精简，把较大的规则和技术资料放到 `references/`。

仓库默认中文；需要面向英文用户的文档使用 `.en.md` 兜底。
