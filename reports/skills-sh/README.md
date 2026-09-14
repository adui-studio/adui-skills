# skills.sh 每周排行报告

本目录由 `.github/workflows/weekly-ranking.yml` 维护。

当每周排行产生新的优选候选时，会生成：

```text
reports/skills-sh/YYYY-MM-DD.md
```

报告记录分类排行、安装量、GitHub Stars、安全审计状态、候选选择结果与跳过原因。

候选历史采用 append-only 策略；Pull Request 必须人工 Review，不会自动合并。
