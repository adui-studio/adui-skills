# Capabilities, Permissions, and System Access

English fallback for `security.md`.

Treat dangerous plugin commands as denied until explicitly granted. Use narrow capabilities and scopes per window/webview. Restrict shell/sidecar programs and arguments, validate file paths and external URLs, keep CSP narrow, and never place real secrets in the frontend bundle or repository. Clean up child processes and background resources on shutdown.
