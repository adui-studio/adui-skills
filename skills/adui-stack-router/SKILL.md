---
name: adui-stack-router
description: Detect a repository's technology stack and choose the smallest appropriate ADui Skills Pack profiles for the current task. Use when starting work in an unfamiliar project, deciding which ADui/third-party skills should apply, or when a repository may contain Vue, React, Tailwind CSS, UnoCSS, Vite, Vite+, NestJS, Prisma, PostgreSQL, MySQL, SQLite, Flutter, Tauri, uni-app, uni-app x, WeChat Mini Program, Three.js, Babylon.js, CesiumJS, WebGL2, WebGPU, pnpm, or Git workflows.
---

# ADui Stack Router

Route the current repository to the smallest relevant ADui profiles before implementation begins.

## Workflow

1. Inspect the repository without changing files.
2. Run the bundled detector when code execution is available:
   ```bash
   node scripts/detect-stack.mjs <project-root>
   ```
   Use `--json` when another script or agent needs machine-readable output.
3. Review the detector's evidence instead of trusting names alone.
4. Resolve ambiguous signals using `references/detection-rules.md`.
5. Select only the profiles required by the detected stack and current task.
6. Expand inherited profiles using `references/profile-resolution.md`.
7. Report detected technologies, direct profiles, effective profiles, warnings, and uncertain decisions before substantial coding.

## Routing Rules

- Always prefer explicit project evidence such as dependencies, config files, framework manifests, and database providers.
- Never infer a technology only from directory names when stronger evidence exists.
- Do not activate Tailwind CSS and UnoCSS together merely because both packages are installed. Inspect active config/imports and warn when both appear active.
- Do not activate PostgreSQL, MySQL, and SQLite together. Prefer the Prisma datasource provider or explicit driver dependencies.
- Treat `vite-plus` as distinct from normal Vite. Select `viteplus` only when the project actually uses Vite+.
- Treat uni-app and uni-app x as distinct profiles. UTS/UVue evidence may indicate uni-app x; confirm when evidence is weak.
- Treat native WeChat Mini Program and CloudBase as separate profiles. Add `wechat-cloudbase` only when CloudBase usage is present.
- Select Three.js, Babylon.js, CesiumJS, WebGL2, and WebGPU independently. Multiple 3D profiles are valid only when the project genuinely combines them.
- Select `git` only when the target is a Git worktree/repository.
- Keep uncertain technologies as warnings or candidates rather than inventing certainty.

## Safety

- Perform detection read-only.
- Do not read `.env`, credential files, key files, tokens, or secret stores.
- Do not install packages or modify configuration during routing.
- Do not execute project scripts during detection.
- Do not run destructive Git operations.

## Output Format

Return a compact routing summary like:

```text
Detected stack
- Vue 3 — high — package.json: dependencies.vue
- UnoCSS — high — uno.config.ts + unocss dependency
- Prisma — high — prisma/schema.prisma
- PostgreSQL — high — Prisma datasource provider=postgresql

Direct profiles
- vue
- unocss
- prisma
- postgresql
- git

Effective profiles
- core
- web
- toolchain
- vue
- unocss
- database
- prisma
- postgresql
- git

Warnings
- none
```

If evidence conflicts, include the conflict and the file(s) that must be checked next.

## Resources

- `scripts/detect-stack.mjs`: deterministic read-only stack detector.
- `references/detection-rules.md`: supported signals, confidence rules, and ambiguity handling.
- `references/profile-resolution.md`: ADui profile graph and profile-selection policy.
