# Vite+ Configuration

English fallback for `configuration.md`.

Keep Vite and Vite+ configuration aligned in `vite.config.ts`. Preserve existing Vite settings and add Vite+ blocks only when needed. Typical areas include create, run, fmt, lint, check, test, pack, staged, and defaultPackage.

Use the project-installed version as the source of truth. Avoid duplicate configuration, especially separate tsdown configuration when `pack` already owns library packaging.
