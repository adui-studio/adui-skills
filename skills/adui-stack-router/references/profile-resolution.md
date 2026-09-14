# Profile Resolution

## Profile graph

```text
core
├── web
│   ├── vue ── toolchain
│   ├── react ── toolchain
│   ├── tailwind
│   ├── unocss
│   ├── threejs ── toolchain
│   ├── babylonjs ── toolchain
│   ├── cesiumjs ── toolchain
│   ├── webgl2 ── toolchain
│   └── webgpu ── toolchain
├── toolchain
│   └── viteplus
├── pnpm
├── backend
├── database
│   ├── prisma
│   ├── postgresql
│   ├── mysql
│   └── sqlite
├── flutter
├── tauri ── toolchain
├── uniapp ── web + toolchain
├── uniapp-x ── web + toolchain
├── wechat-miniprogram
│   └── wechat-cloudbase
└── git
```

The actual repository `profiles/*.json` files are authoritative when this skill is used inside the ADui Skills Pack repository. The bundled graph is a portable snapshot for installed copies of the skill.

## Selection policy

Choose **direct profiles** from explicit project evidence. Then expand `extends` to obtain **effective profiles**.

Examples:

### Vue + UnoCSS + Prisma + PostgreSQL

Direct:

```text
vue
unocss
prisma
postgresql
git
```

Effective:

```text
core
web
toolchain
vue
unocss
database
prisma
postgresql
git
```

### React + Tailwind + Vite+

Direct:

```text
react
tailwind
viteplus
git
```

Effective includes `core`, `web`, and `toolchain` through inheritance.

### Native WeChat Mini Program + CloudBase

Direct:

```text
wechat-miniprogram
wechat-cloudbase
git
```

Do not select `uniapp` unless the repository is actually built with uni-app.

## Manual override

Detection is advisory. Override the router when:

- a monorepo contains multiple unrelated applications;
- a dependency is installed but unused;
- generated code produces false signals;
- database providers vary by package/environment;
- both Tailwind and UnoCSS are intentionally active;
- a task concerns only a subset of the detected stack.

When overriding, explain the evidence and keep the selected set minimal.
