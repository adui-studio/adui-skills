---
name: adui-tauri-v2
description: 为 Tauri v2 桌面/跨端应用提供 ADui 工程规范。用于检测到 src-tauri、@tauri-apps/*、tauri.conf.json 或用户明确要求 Tauri v2 时，指导前端与 Rust 边界、command/invoke、事件与 Channel、State、Capabilities/Permissions、插件、文件系统、Shell/Sidecar、SQL、Updater、窗口、构建打包与安全验证；优先最小权限、最小 IPC 面积和项目已安装版本。默认中文输出，英文仅作为兜底。
---

# ADui Tauri v2

把 Tauri 应用视为“受权限控制的 WebView + Rust Core”，不要把它当成普通 Web 页面套壳。先识别前端、Rust、IPC、Capabilities 和插件边界，再修改代码。

## 工作流程

1. 读取 `package.json`、`src-tauri/Cargo.toml`、`src-tauri/tauri.conf.*`、`src-tauri/capabilities/*` 和 `src-tauri/src/*`。
2. 确认 Tauri 主版本与插件版本，默认按 v2 处理；发现 v1 配置时先识别迁移状态，不混写两代 API。
3. 判断需求应放在前端、Rust command、官方插件还是 sidecar；优先使用最小能力面。
4. 新增 IPC 前先定义输入、输出、错误、权限、调用窗口/来源和是否需要异步/流式传输。
5. 新增插件或系统能力时，同步检查 Rust 初始化、JS API、Capability/Permission、CSP 与平台差异。
6. 涉及文件、Shell、Sidecar、SQL、Updater 等高权限能力时，按最小权限原则配置 scope，不使用无边界的通配授权。
7. 运行与改动匹配的 Rust、前端和 Tauri 验证；至少检查编译、类型、Capability/Permission 与实际运行路径。
8. 交付时说明改动发生在前端、Rust、配置、权限还是打包层，以及哪些平台没有实际验证。

架构边界见 `references/architecture.md`；IPC 规则见 `references/ipc.md`；安全与权限见 `references/security.md`；构建与发布见 `references/build-release.md`。

## 核心规则

- 优先读取项目安装版本和官方 v2 文档，不凭记忆假设 Tauri API。
- 前端只暴露完成业务所需的最小 IPC；敏感逻辑、系统资源访问和可信校验放在 Rust/插件侧。
- Command 用于请求/响应；大数据流或进度流优先 Channel；松耦合广播才使用 Event。
- `State` 用于受控共享状态，避免把全局可变状态散落到命令中；并发访问必须考虑锁粒度和阻塞。
- 所有潜在危险插件命令默认视为不可访问，必须通过 Capability/Permission 显式授权。
- Capability 应按窗口/WebView 与业务能力分组，不给所有窗口同一组高权限。
- Shell/Sidecar 必须限制可执行程序与参数；动态参数使用白名单或严格 validator，不允许拼接任意命令字符串。
- 文件系统访问使用最小 scope；不要为了省配置直接扩大到整个 HOME 或磁盘。
- SQL、文件和 sidecar 的路径由 Rust/权限层约束，不信任前端传入的任意路径。
- Updater、签名、发布密钥和 CI Secret 不写入仓库；不要在日志中输出私钥或 Token。
- 不把主线程用于长时间阻塞任务；重工作使用 async command、异步 runtime、线程或 sidecar。
- 不为了“跨平台”忽略平台差异；Windows/macOS/Linux 的权限、打包、签名、路径和 WebView 行为要分别验证。

## 与其他 Skills 协作

- 技术栈识别：先用 `adui-stack-router`。
- 通用功能开发：配合 `adui-feature-dev`。
- Vue / React / Vite+：继续使用对应 Web / Vite+ Skill；本 Skill 只负责 Tauri 边界。
- SQLite / PostgreSQL / MySQL：数据库建模与查询继续使用 Database Profile；Tauri SQL 只负责桌面集成和权限。
- 安全敏感变更：配合 `security-guidance`，并优先审查 Capability、Permission、Shell、文件与 Updater。

## 验证建议

根据项目现有包管理器和 Rust 工具链选择等价命令：

```text
前端 lint / typecheck / test
        ↓
cargo check / cargo test
        ↓
Tauri dev 或目标 command/plugin 路径验证
        ↓
Capability / Permission 负向测试
        ↓
目标平台 build/bundle（涉及发布时）
        ↓
检查 Git diff
```

未实际执行的桌面平台、签名、安装包和更新流程必须明确标记为“未验证”。

## 语言

默认使用中文；用户明确要求英文时使用英文。英文参考使用同名 `.en.md` 文件。
