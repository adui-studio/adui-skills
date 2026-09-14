# GitHub Wiki Maintenance

[简体中文](./wiki.md) | [English](./wiki.en.md)

## Goal

GitHub Wiki is the reader-facing documentation entry point, while the main repository remains the single source of truth. Do not maintain long-lived canonical content directly in the Wiki UI, or the repository and Wiki will drift.

Recommended flow:

```text
main repository docs/*.md
      ↓
scripts/build-wiki.mjs
      ↓
.wiki-build/*.md
      ↓
.github/workflows/wiki.yml
      ↓
adui-skills.wiki.git
```

## Local build

```bash
npm run wiki:build
```

Default output:

```text
.wiki-build/
```

Custom output:

```bash
node scripts/build-wiki.mjs --output tmp/wiki
```

## Page conventions

- Chinese pages use concise English slugs such as `Usage.md` and `Architecture.md`.
- English fallback pages use the `-EN` suffix, such as `Usage-EN.md`.
- `Home.md`, `Home-EN.md`, `_Sidebar.md`, and `_Footer.md` are generated automatically.
- Relative Markdown links from the main repository are rewritten to Wiki page links when a matching page is known.

## Publishing

When documentation, Profiles, Registry, README, CHANGELOG, SECURITY, or RELEASE content changes on `main`, the `同步 GitHub Wiki` workflow rebuilds and pushes the Wiki. The workflow can also be run manually from GitHub Actions.

## First-time setup

GitHub Wiki must be enabled in repository settings and initialized at least once so GitHub creates the `<repo>.wiki.git` repository.

If the repository reports `has_wiki=false`, enable it under:

```text
GitHub repository
→ Settings
→ Features
→ Wikis
```

Then create the first Wiki page once. After that, automated synchronization can push updates.

## Editing policy

Canonical content must be edited only in the main repository:

```text
docs/*.md
README.md
CONTRIBUTING.md
SECURITY.md
RELEASE.md
CHANGELOG.md
```

Direct Wiki edits may be overwritten by the next automated synchronization.
