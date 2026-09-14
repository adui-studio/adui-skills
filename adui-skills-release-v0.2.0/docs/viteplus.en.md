# ADui Vite+ Engineering Guide

English | [简体中文](./viteplus.md)

`adui-viteplus` is activated only when a project actually uses `vite-plus` or `vp`. It coordinates Vite configuration, formatting, linting, type checking, Vitest, tsdown packaging, and task execution while preserving the existing project structure.

Use `vp build` for web applications, `vp pack` for libraries or executables, and prefer non-mutating quality checks in CI. Migrate existing tools incrementally and verify CI, hooks, IDE integration, and release scripts before deleting old configuration.
