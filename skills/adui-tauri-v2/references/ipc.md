# IPC 与 State

[简体中文](./ipc.md) | [English](./ipc.en.md)

## Command

- 使用 `#[tauri::command]` 定义边界清晰的函数，并在 `invoke_handler` 注册。
- 前端参数名与 Rust 参数序列化规则保持一致；输入必须验证，不把 TypeScript 类型当运行时安全边界。
- 返回可序列化 DTO，不把内部错误栈、数据库错误或系统路径直接暴露给前端。
- I/O 和耗时任务优先 async；同步 Command 不执行长时间阻塞工作。

## Channel 与 Event

- 大文件、进度、持续输出优先 Channel，避免频繁 JSON 往返或一次性巨大 payload。
- Event 不提供强类型请求/响应语义；只用于广播或松耦合通知。
- 监听器创建后要有释放路径，防止窗口重建或路由切换造成重复监听。

## State

- 使用 `Builder::manage` / `State<T>` 管理连接池、配置、任务注册表等共享资源。
- 明确并发模型；持锁期间不要执行不可控的网络/磁盘长任务。
- 不把所有业务对象塞进单个全局 Mutex。
