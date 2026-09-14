# Vite+ Command Selection

English fallback for `commands.md`.

Use `vp dev` for app development, `vp build` for web application production builds, `vp preview` for preview, `vp fmt`/`vp lint`/`vp check` for quality checks, `vp test` for tests, `vp pack` for libraries or executables, and `vp run` for task orchestration.

Prefer non-mutating checks in CI. Distinguish web application builds from publishable package builds. In monorepos, resolve the intended package or `defaultPackage` before running commands.
