# Profile 解析规则

[简体中文](./profile-resolution.md) | [English](./profile-resolution.en.md)

## Profile 图

```text
core
├── web
│   ├── vue ── toolchain
│   ├── react ── toolchain
│   ├── tailwind
│   ├── unocss
│   ├── 3d
│   │   ├── threejs ── toolchain
│   │   ├── babylonjs ── toolchain
│   │   ├── cesiumjs ── toolchain
│   │   ├── webgl2 ── toolchain
│   │   └── webgpu ── toolchain
├── toolchain
│   └── viteplus
├── pnpm
├── backend
├── database
│   ├── prisma
│   │   └── nestjs-prisma ── backend
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

仓库中的 `profiles/*.json` 是权威定义。Skill 内置图只是安装到其他项目后的可移植快照。`3d` 是共享架构 Profile，本身通常不作为直接检测结果，而由具体 3D/GPU Profile 继承。

## 选择策略

先根据明确项目证据选择**直接 Profiles**，再递归展开 `extends` 得到**有效 Profiles**。

### Vue + UnoCSS + Prisma + PostgreSQL

直接：

```text
vue
unocss
prisma
postgresql
git
```

有效：

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

### NestJS + Prisma + PostgreSQL

直接：

```text
nestjs-prisma
postgresql
git
```

有效：

```text
core
backend
database
prisma
nestjs-prisma
postgresql
git
```
