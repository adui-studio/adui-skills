# 迁移到 Vite+

[简体中文](./migration.md) | [English](./migration.en.md)

## 迁移顺序

1. 盘点现有工具：Vite、Vitest、ESLint、Prettier、tsc、tsdown/tsup、lint-staged、任务脚本和包管理器。
2. 查找 CI、IDE、Git Hook、Dockerfile、发布脚本和文档中的引用。
3. 一次只迁移一类能力，例如先 lint/format，再 test，再 pack。
4. 每迁移一类能力都运行等价验证，并比较输出与退出码。
5. 只有确认没有引用后再删除旧配置和旧依赖。
6. 更新 README、AGENTS 和 CI 命令，避免团队继续调用旧入口。

## 不要做

- 不一次删除所有 ESLint/Prettier/Vitest 配置再“边报错边修”。
- 不因为 Vite+ 能覆盖某能力，就强制迁移项目当前稳定且有特殊插件依赖的配置。
- 不同时切换包管理器、Node 版本和工具链；变量太多会导致回归难定位。
- 不在没有构建/测试证据时声称迁移完成。
