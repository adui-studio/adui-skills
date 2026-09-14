# Tauri v2 架构边界

[简体中文](./architecture.md) | [English](./architecture.en.md)

## 分层

```text
Web 前端
  ↓ invoke / event / channel
IPC 边界
  ↓
Rust Core / 官方插件
  ↓
OS / 文件 / 数据库 / Shell / Sidecar / Updater
```

## 规则

1. 纯展示、表单状态和 Web 业务留在前端。
2. 系统资源、敏感数据、可信校验和高权限操作放在 Rust/插件侧。
3. 一个 Command 对应一个清晰业务动作，避免“万能 execute”或大对象透传。
4. 插件已有成熟能力时优先插件；只有应用特有业务才自定义 Command。
5. Sidecar 用于真正需要独立进程/现有二进制的能力，不作为规避 Rust 实现的默认捷径。
6. 多窗口应用按窗口拆 Capability；低权限窗口不继承主窗口全部能力。
7. Rust Core 只持有必要状态；数据库连接池、任务句柄等共享资源通过受控 State 管理。

## 选择机制

- 同步、小而快的请求/响应：Command。
- I/O 或耗时任务：async Command。
- 连续进度/流式数据：Channel。
- 广播式通知：Event。
- 外部 CLI/服务：Sidecar，前提是权限、参数和生命周期可控。
