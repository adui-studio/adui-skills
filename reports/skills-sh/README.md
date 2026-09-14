# skills.sh 每周排行报告

本目录由 `.github/workflows/weekly-ranking.yml` 维护。

每周都会生成一份日期快照，并刷新最新榜单：

```text
reports/skills-sh/YYYY-MM-DD.md
reports/skills-sh/latest.md
```

README 展示每个分类第 1 名；`latest.md` 与 GitHub Wiki `Weekly-Skills-Ranking-Latest` 展示每个分类 Top 5。

报告记录分类排行、安装量、GitHub Stars、安全审计状态、候选选择结果与跳过原因。

候选历史采用 append-only 策略；候选 Pull Request 必须人工 Review，不会自动合并。GitHub Wiki 的最新排行榜页面由每周 Workflow 直接刷新，用于保证排行榜每周可见。
