---
name: adui-viteplus
description: 为使用 Vite+（vite-plus / vp）的项目提供统一工具链工程规范。用于检测到 vite-plus、vp 命令或 Vite+ 配置时，处理项目创建、依赖管理、开发、构建、格式化、Lint、类型检查、Vitest、tsdown 打包、任务编排、staged 检查、Monorepo 与从传统 Vite 工具链迁移等工作；优先遵守项目现有 vite.config.ts 与安装版本，避免把普通 Vite 项目误写成 Vite+。默认中文输出，英文仅作为兜底。
---

# ADui Vite+

把 Vite+ 视为“统一 Web 工具链”而不是单纯的 Vite 别名。先识别项目是否真实使用 `vite-plus`，再在现有配置基础上最小修改。

## 工作流程

1. 读取 `package.json`、锁文件、`vite.config.*`、workspace 配置和现有 scripts。
2. 确认项目是否真实使用 Vite+：依赖包含 `vite-plus`、配置从 `vite-plus` 导入，或项目明确使用 `vp` 命令。
3. 识别项目类型：Web App、Library、CLI/Executable、Monorepo 或混合仓库。
4. 保留现有 Vite 配置；Vite+ 专项配置优先集中在 `vite.config.ts`。
5. 根据任务选择最小命令：开发用 `vp dev`，Web App 构建用 `vp build`，库/可执行产物用 `vp pack`，质量检查优先 `vp check`。
6. 修改配置后执行与任务匹配的验证，不要用单一 `build` 代替全部质量门禁。
7. 涉及迁移时分阶段替换工具，不一次性删除仍在 CI、IDE、Git Hook 或发布流程中使用的配置。
8. 交付时说明实际执行的 `vp` 命令、结果，以及仍保留的旧工具链配置。

命令选择见 `references/commands.md`；配置原则见 `references/configuration.md`；迁移规则见 `references/migration.md`。

## 核心规则

- 先检测项目安装的 Vite+ 版本，不凭记忆假设 API。
- 普通 Vite 项目没有明确 Vite+ 信号时，不引入 `vite-plus`。
- 保持 `vite.config.ts` 为统一配置入口；已有拆分配置时尊重项目结构，不为统一而强制重构。
- `vp build` 用于 Web 应用；`vp pack` 用于库与可执行产物，不混用职责。
- `vp check` 是组合质量入口；需要定位问题时可分别执行格式化、Lint、类型检查或测试。
- 使用 `pack` 时优先配置 `vite.config.ts` 中的 `pack`，不要无必要再引入独立 `tsdown.config.ts`。
- Monorepo 中先确认执行目录、workspace 和 `defaultPackage`，避免在错误 package 上运行命令。
- 不擅自替换包管理器；项目已声明 pnpm/npm/yarn/bun 时沿用现有选择。
- 不把自动修复命令作为只读检查。CI 默认优先使用不修改工作区的检查模式。
- 迁移前检查 CI、Git Hook、IDE、发布命令和文档引用，避免删掉仍被外部流程使用的配置。

## 与其他 Skills 协作

- 技术栈不明确：先用 `adui-stack-router`。
- 功能开发：配合 `adui-feature-dev` 执行最小修改和验证。
- Vue / React：继续使用对应框架 Skill；Vite+ 只负责工具链，不替代框架规范。
- Vitest：复杂测试规则继续使用 Vitest Skill。
- pnpm：包管理与 workspace 细节继续使用 pnpm Skill。
- Library API 或高级 TypeScript 类型：按需使用 TypeScript 相关 Skill。

## 验证建议

根据改动选择：

```text
配置 / 代码修改
      ↓
vp check
      ↓
vp test（涉及行为或测试时）
      ↓
vp build（Web App）
   或 vp pack（Library / CLI）
      ↓
检查 Git diff
```

没有实际执行过的命令必须明确标记为“未执行”。

## 语言

默认使用中文；用户明确要求英文时使用英文。英文参考使用同名 `.en.md` 文件。
