# skills.sh 每周分类排行与 Pack 增量精选

[简体中文](./weekly-ranking.md) | [English](./weekly-ranking.en.md)

## 目标

每周从 skills.sh 获取分类搜索结果，按安装量排序，在满足基础质量门禁后为每个分类选择一个新的优选 Skill，并维护一个 **append-only** 的候选历史。

目标 Pack：

```text
https://www.skills.sh/p/DCh7RQegkqCXcXn8
```

安装：

```bash
npx skills add https://skills.sh/p/DCh7RQegkqCXcXn8
```

## 工作流

```text
skills.sh 分类搜索
      ↓
按 installs 降序排行
      ↓
GitHub Stars 门禁
      ↓
skills.sh Audit 最佳努力安全检查
      ↓
排除 Pack 已存在 Skill
      ↓
排除历史已经选择的 Skill
      ↓
每分类选取最优候选
      ↓
追加到 pack/skills-sh-pack.json
      ↓
生成每周报告
      ↓
Pull Request 人工 Review
```

工作流文件：

```text
.github/workflows/weekly-ranking.yml
```

默认每周一 09:37（Asia/Shanghai）执行，也支持手动运行。

## 分类

分类由 `config/skills-sh-ranking.json` 管理，当前覆盖：

- 前端 / React
- Vue
- Next.js
- 设计 / UI
- 移动端
- Agent 工作流
- 数据库
- 测试
- 后端 / API
- Git / 交付
- 3D / GPU
- 工程化

每个分类通过 skills.sh 搜索查询获得候选，然后按安装量排序。

## 默认质量门禁

当前默认：

```text
搜索结果数量       : 20
报告展示 Top       : 5
最低 installs      : 5000
最低 GitHub Stars  : 100
阻断风险等级       : HIGH / CRITICAL
每分类候选         : 1
```

GitHub Stars 用来过滤过于冷门的来源仓库；skills.sh Audit 采用最佳努力模式：如果能读取到审计结果，则 `fail`、`HIGH`、`CRITICAL` 会阻断候选；如果审计端点暂时不可用，则报告为 `unknown`，但不会伪造安全结论。

## Append-only 规则

状态文件：

```text
pack/skills-sh-pack.json
```

它必须保持：

```json
{
  "mode": "append-only"
}
```

脚本只允许追加新的 `selected` 记录：

- 不删除历史选择；
- 不替换已有选择；
- 不选择 Pack 当前已经存在的同名 Skill；
- 同一次运行中，同一个 Skill 不会被多个分类重复追加。

如果无法读取当前 Pack 的 well-known index，`--write` 会直接失败，不写入状态，避免在不知道 Pack 当前内容的情况下产生重复选择。

## 本地运行

只检查并生成临时报告：

```bash
npm run pack:ranking
```

写入 append-only 选择状态：

```bash
npm run pack:ranking:apply
```

通常不建议在本地直接合并选择结果；每周 Workflow 会自动创建 PR，由人工 Review 后再合并。

## 报告

当本周存在新候选时，会新增：

```text
reports/skills-sh/YYYY-MM-DD.md
```

报告包含：

- 当前 Pack Skill 数；
- 本周建议追加；
- 每个分类 Top 排行；
- installs；
- GitHub Stars；
- Audit 状态；
- 被跳过的原因。

## Pack 自动写入限制

截至当前版本，skills.sh 的公开文档提供排行榜、搜索、详情与审计等读取能力，但 **没有公开、稳定的 Pack 成员写入 API**。Pack 文档要求通过登录后的网页管理 Pack。

因此当前自动化边界是：

```text
自动发现 + 自动排行 + 自动门禁 + 自动选择 + 自动 PR
                                      ↓
                         skills.sh Pack 页面人工确认追加
```

这不是为了减少自动化程度，而是避免依赖未公开的内部接口、浏览器 Cookie 或长期保存登录会话。

一旦 skills.sh 官方提供 Pack 写入 API，可以在保持 `append-only` 规则的前提下增加同步适配器，而无需改动排行与选择逻辑。
