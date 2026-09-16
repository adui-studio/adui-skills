# ADui Skills Pack 维护与每日更新

[简体中文](./maintenance.md) | [English](./maintenance.en.md)

## 维护目标

第三方 Skill 不复制进本仓库，只跟踪：

- `source`
- `skillPath`
- `skillFolderHash`
- `repoCommit`

其中 `skillFolderHash` 是决定 Skill 是否真正变化的核心字段。

## v0.1.4 更新模型

```text
Registry
  ↓
按 GitHub source 分组
  ↓
每个仓库 clone 一次
  ↓
优先校验 skillPath
  ↓
路径失效时扫描 SKILL.md frontmatter name
  ↓
计算 Skill 目录 Git tree SHA
  ↓
与 Lock 的 skillFolderHash 比较
```

仓库 HEAD 改变但 Skill 目录未改变时，不产生 Lock Diff。

## 命令

仅检查：

```bash
npm run updates:check
```

更新 Registry 路径和 Lock：

```bash
npm run updates:apply
```

首次基线：

```bash
npm run lock:init
```

只检查部分 Skill：

```bash
node scripts/check-updates.mjs --only vue-best-practices,unocss
```

严格模式：

```bash
node scripts/check-updates.mjs --strict
```

默认情况下，单个上游仓库失败只记录警告。`--strict` 会让此类警告导致非 0 退出码。

## 路径自动修复

如果 Registry 中 `skillPath` 已失效，且 `autoResolvePath=true`，脚本会扫描仓库内所有 `SKILL.md`，读取 frontmatter `name`，寻找与 Registry `id` 完全一致的 Skill。

运行 `--write` 时，成功解析的新路径会写回 `registry/skills.json`，并进入每日更新 PR。

## 每日 Workflow

工作流文件：

```text
.github/workflows/daily-update.yml
```

默认时间：每日 08:10，时区 `Asia/Shanghai`。

有实际变化时：

1. 更新 `registry/skills.lock.json`；
2. 如有路径移动，更新 `registry/skills.json`；
3. 再次执行校验；
4. 更新 `chore/daily-skills-update` 分支；
5. 创建或更新 PR；
6. 等待人工 Review；
7. 合并后自动同步 CNB。

不会自动 approve，也不会自动 merge。

## 上游失败策略

单个第三方仓库 404、网络异常、Git 服务限制或 Skill 无法定位时：

- 保留该 Skill 已有 Lock；
- 将问题写入 Actions 摘要和更新报告；
- 继续检查其他仓库；
- 默认不让整条 Workflow 失败。

如果某个上游长期不可用，应在 Registry 中设置：

```json
{
  "enabled": false,
  "status": "upstream-unavailable"
}
```

## Review 重点

每次上游变化至少检查：

- `SKILL.md` 触发条件是否变化；
- `scripts/` 是否新增 Shell、删除、下载、凭据、push、提权；
- `references/` 是否改变框架版本或安全建议；
- Skill 是否仍适合当前 Profile；
- 自动修复的路径是否确实对应同一 Skill。
