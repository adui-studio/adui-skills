# Tauri v2 Engineering

English fallback for `tauri-v2.md`.

`adui-tauri-v2` defines ADui conventions for frontend/Rust boundaries, IPC, capabilities, permissions, plugins, sidecars, SQL integration, updater flows, and packaging. Keep IPC narrow, put trusted system access behind Rust/plugins, scope permissions per window and resource, restrict shell/sidecar arguments, keep secrets outside frontend bundles, and validate real target-platform packages before claiming release readiness.
