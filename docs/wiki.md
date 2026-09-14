# GitHub Wiki 维护

[简体中文](./wiki.md) | [English](./wiki.en.md)

## 目标

GitHub Wiki 作为公开阅读入口，主仓库仍然是文档唯一事实源。不要直接在 Wiki 网页长期维护正文，否则会和 `docs/` 产生双份事实源。

推荐流程：

```text
主仓库 docs/*.md
      ↓
scripts/build-wiki.mjs
      ↓
.wiki-build/*.md
      ↓
.github/workflows/wiki.yml
      ↓
adui-skills.wiki.git
```

## 本地构建

```bash
npm run wiki:build
```

默认输出到：

```text
.wiki-build/
```

自定义输出目录：

```bash
node scripts/build-wiki.mjs --output tmp/wiki
```

## 页面约定

- 中文页面使用简洁英文 slug，例如 `Usage.md`、`Architecture.md`。
- 英文兜底页面使用 `-EN` 后缀，例如 `Usage-EN.md`。
- `Home.md`、`Home-EN.md`、`_Sidebar.md`、`_Footer.md` 由构建脚本自动生成。
- 主仓库中的相对 Markdown 链接会在可识别时改写为 Wiki 页面链接。

## 发布

当 `main` 上的文档、Profile、Registry、README、CHANGELOG、SECURITY 或 RELEASE 发生变化时，`同步 GitHub Wiki` Workflow 自动重建并推送 Wiki。

也可以在 GitHub Actions 中手动运行该 Workflow。

## 首次启用

GitHub Wiki 必须先在仓库设置中启用，并至少创建一次 Wiki，GitHub 才会建立 `<repo>.wiki.git` 仓库。

当前仓库如果 `has_wiki=false`，先执行：

```text
GitHub 仓库
→ Settings
→ Features
→ 勾选 Wikis
```

然后打开 Wiki 页面创建首个页面。完成后，自动同步 Workflow 才能正常推送。

## 修改原则

文档内容只修改主仓库：

```text
docs/*.md
README.md
CONTRIBUTING.md
SECURITY.md
RELEASE.md
CHANGELOG.md
```

不要把 Wiki 当作第二套源码仓库。Wiki 上的直接修改可能在下一次自动同步时被覆盖。
