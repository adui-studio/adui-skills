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

Install a registry Skill with:

```bash
npx skills add <source> --skill <id>
```

Chinese documentation is canonical; English `.en.md` files are the fallback.
