# ADui Vite+ 工程规范

[简体中文](./viteplus.md) | [English](./viteplus.en.md)

`adui-viteplus` 只在项目真实使用 `vite-plus` / `vp` 时启用，用于统一 Vite、格式化、Lint、类型检查、Vitest、tsdown 打包和任务编排。

## 推荐流程

```text
adui-stack-router
      ↓
检测到 vite-plus / vp
      ↓
adui-viteplus
      ↓
保留现有 vite.config.ts
      ↓
选择 vp check / test / build / pack
      ↓
adui-feature-dev 完成交付验证
```

## 核心约定

- 普通 Vite 项目不自动迁移到 Vite+。
- `vite.config.ts` 是统一配置入口，但不为形式统一而破坏现有模块化配置。
- Web 应用使用 `vp build`；库或 CLI 使用 `vp pack`。
- `vp check` 用于统一质量检查，CI 默认避免会修改工作区的修复参数。
- Monorepo 先确认 workspace、目标 package 与 `defaultPackage`。
- 迁移时逐项替换旧工具，确认 CI、Git Hook、IDE 和发布脚本不再引用后再删除配置。

## 安装

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-viteplus
```
