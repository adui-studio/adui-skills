# Tauri v2 工程规范

[简体中文](./tauri-v2.md) | [English](./tauri-v2.en.md)

`adui-tauri-v2` 用于统一 Tauri v2 项目的前端/Rust 边界、IPC、Capability、Permission、插件、Sidecar、SQL、Updater 与发布规范。

## 安装

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-tauri-v2
```

更推荐通过 Tauri Profile 安装：

```powershell
npm run profile:install -- tauri --agent codex
```

## 核心原则

- Tauri 不是普通 Web 壳；WebView 不能默认拥有系统权限。
- IPC 面积保持最小，敏感操作由 Rust/插件侧完成。
- Capability/Permission 按窗口和业务能力拆分。
- Shell/Sidecar 限制程序、参数与 scope，不拼接任意命令。
- 前端 bundle 中不存在真正的 Secret。
- 发布必须分别验证目标平台、签名、Updater 和真实安装包。

详细规则位于 `skills/adui-tauri-v2/references/`。
