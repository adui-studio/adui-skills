# 构建、打包与更新

[简体中文](./build-release.md) | [English](./build-release.en.md)

## 构建前

- 确认前端生产构建成功。
- 执行 `cargo check` / `cargo test` 或项目等价验证。
- 校验 `tauri.conf.*`、bundle identifier、图标、版本与平台配置。
- 对新增插件确认 Rust 初始化、JS 依赖和 Capability 三者同时存在。

## 平台验证

- Windows：安装包、WebView2、路径、签名与升级权限。
- macOS：Bundle、签名、公证、Entitlements 与架构产物。
- Linux：系统依赖、WebKitGTK、AppImage/deb/rpm 等目标格式。

不要因为一个平台 build 成功就宣称所有平台已验证。

## Updater

- 更新检查/下载/安装需要显式 updater permission。
- 签名与发布密钥必须由 CI Secret 管理。
- 发布前验证版本递增、endpoint、签名和失败回滚/重试策略。
- 不在本地示例或日志中打印私钥。

## Sidecar

- 为目标平台/架构准备正确二进制。
- 确认 bundle `externalBin` 与运行时名称一致。
- 真实安装包内验证 sidecar 路径，不只在 `tauri dev` 验证。
