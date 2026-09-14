# Changelog

## v0.1.5

### Fixed

- Fixed v0.1.4 patch installation potentially nesting managed directories instead of replacing their contents.
- Added cross-platform `apply.mjs`, known bad nested directory cleanup, Registry/Lock v2 assertions, and automatic post-apply validation.

[简体中文](./CHANGELOG.md) | [English](./CHANGELOG.en.md)

## Unreleased

- Chinese is now the primary language for docs and GitHub Actions, with `.en.md` fallbacks.
- Upstream tracking migrated to Registry/Lock v2 using Skill-folder Git tree hashes.
- Moved `SKILL.md` paths can be auto-resolved from frontmatter names.
- Individual upstream failures are warnings by default instead of aborting the whole weekly check.
- Corrected known Vercel, Prisma, Tailwind, TypeScript, uni-app and release paths.
- Renamed `uniapp-mini-guide` to `uniapp-mini`.
- Temporarily disabled `database-schema-design` because its upstream is unavailable.
