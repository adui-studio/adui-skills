# Vite+ 命令选择

[简体中文](./commands.md) | [English](./commands.en.md)

## 先判断任务

- Web 应用开发：`vp dev`
- Web 应用生产构建：`vp build`
- 预览构建结果：`vp preview`
- 格式化：`vp fmt`
- Lint：`vp lint`
- 组合质量检查：`vp check`
- 测试：`vp test`
- Library / CLI 打包：`vp pack`
- 任务执行：`vp run`
- 依赖安装与管理：优先使用项目当前 Vite+ / 包管理工作流，不擅自切换包管理器

## `vp check`

优先用于统一质量检查。需要排查单项问题时，再拆分检查步骤。

不要在只想检查 CI 状态时默认使用会修改文件的修复参数。

## `vp build` 与 `vp pack`

- `vp build`：面向 Web 应用产物。
- `vp pack`：面向可发布 Library、多个模块格式、声明文件或独立可执行产物。

不要为了生成 npm package 而误用 Web App 构建命令。

## Monorepo

执行命令前确认当前 package。仓库根存在多个 package 时，优先读取 workspace 和 `defaultPackage`，必要时显式指定目标目录，避免命令落到错误应用。
