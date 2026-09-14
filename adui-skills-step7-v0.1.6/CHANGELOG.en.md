# Changelog

[简体中文](./CHANGELOG.md) | [English](./CHANGELOG.en.md)

## v0.1.6

### Added

- Implemented `adui-feature-dev` for features, bug fixes and refactoring.
- Added requirement restatement, assumptions and risks, minimal-change rules, quality gates, diff review and delivery contract.
- Added English fallback documentation for feature development.
- Added local Skill frontmatter and bilingual documentation pair validation.

## v0.1.5

### Fixed

- Fixed v0.1.4 patch installation potentially nesting managed directories.
- Added cross-platform `apply.mjs`, cleanup and Registry/Lock v2 assertions.

## v0.1.4

### Changed

- Made Chinese the default language for docs and workflows, with `.en.md` fallbacks.
- Migrated upstream tracking to Registry/Lock v2 using Skill-folder Git tree hashes.
- Added path auto-resolution and tolerant partial upstream failures.
- Corrected known Skill paths and disabled unavailable `database-schema-design`.
