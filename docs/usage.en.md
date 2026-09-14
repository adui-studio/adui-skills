# ADui Skills Pack Usage

[简体中文](./usage.md) | [English](./usage.en.md)

Use the smallest relevant set of profiles instead of loading every Skill. Run `adui-stack-router` first when the project stack is unclear.

```bash
npm run validate
npm run detect:stack -- .
```

Common profile combinations:

- Vue + UnoCSS: `core + web + toolchain + vue + unocss + git`
- React + Tailwind: `core + web + toolchain + react + tailwind + git`
- NestJS + Prisma + PostgreSQL: `core + backend + database + prisma + postgresql + git`
- Tauri + Vue: `core + web + toolchain + vue + tauri + git`
- 3D/GPU: use the specific engine profile; it inherits the shared `3d` profile and `adui-3d-architecture`

Install a registry Skill with:

```bash
npx skills add <source> --skill <id>
```

Chinese documentation is canonical; English `.en.md` files are the fallback.

For architecture-first 3D decisions install `adui-3d-architecture`. For raw WebGL2 / GLSL ES 3.0 work also install `adui-webgl2`.


## Feature development

Install:

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-feature-dev
```

Recommended flow: stack router → minimal profiles → feature development → verification and delivery. See [development.en.md](./development.en.md).

## Specialized profiles

Use `viteplus` only for actual Vite+ projects. Use `nestjs-prisma` only when both NestJS and Prisma are detected; it inherits the backend and Prisma profiles.
