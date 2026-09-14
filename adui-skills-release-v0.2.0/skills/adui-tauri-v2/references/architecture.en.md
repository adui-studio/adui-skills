# Tauri v2 Architecture

English fallback for `architecture.md`.

Keep a strict boundary between the web frontend, IPC, Rust core/plugins, and OS resources. Put system access, trusted validation, and sensitive logic behind Rust or official plugins. Use focused commands, async commands for I/O, channels for streaming progress, events for loose broadcast, and sidecars only when an external process is genuinely required. Split capabilities by window/webview instead of granting one broad permission set to the whole application.
