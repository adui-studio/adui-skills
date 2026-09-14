# Build, Bundle, and Update

English fallback for `build-release.md`.

Verify the frontend production build, Rust checks/tests, Tauri configuration, bundle metadata, plugin initialization, and capabilities before packaging. Validate each target platform separately. Keep signing and updater keys in CI secrets, test updater permissions and signatures, and verify sidecar binaries inside real packaged artifacts rather than only in development mode.
