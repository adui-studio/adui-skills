# IPC and State

English fallback for `ipc.md`.

Use focused `#[tauri::command]` handlers with runtime input validation and sanitized error DTOs. Prefer async commands for I/O and channels for streaming progress or large responses. Use events only for broadcast-style communication. Manage shared application resources with Tauri state, keep lock scopes short, and clean up event listeners and background tasks explicitly.
