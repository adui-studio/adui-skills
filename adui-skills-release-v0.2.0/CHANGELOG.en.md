# Changelog

## v0.2.0 - Public Preview

- Synced upstream availability before release: `github/awesome-copilot` removed `gh-cli`, so v0.2.0 marks it `upstream-unavailable` and removes it from the default Git profile.


### Pre-release corrections

- Synced the Flutter registry with the current `flutter/agent-plugins` `skills/` tree and removed three legacy entries no longer present on the main branch.
- Replaced them with `flutter-setup-declarative-routing`, `flutter-use-http-package`, and `flutter-implement-json-serialization`.

- First public preview release.
- Added tag-driven GitHub Release workflow, release preflight checks, ZIP/checksum assets, release documentation, security policy, MIT license, issue/PR templates, and release badges.
- A real third-party Skill Folder Hash lock baseline is required before publishing.
- The skills.sh Pack is created manually after Vercel sign-in; no placeholder pack ID is published.

## v0.1.11

### Added

- Profile Installer now supports npm, pnpm, Yarn, and Bun.
- Added `--pm` / `--package-manager`, automatic package-manager detection, `--no-pm-detect`, and `--project-root`.
- Added workspace-aware detection using `packageManager`, lockfiles, workspace markers, and the current execution environment.

### Improved

- `auto-install` now runs the skills CLI inside the target project instead of the ADui Skills Pack repository.
- Conflicting lockfiles now stop automatic selection instead of guessing.
- Actual installs verify the selected package manager; Yarn Classic is rejected because the installer uses `yarn dlx`.
- Added package-manager and cross-platform command-generation tests.

## v0.1.10

### Fixed

- Fixed Windows path resolution in `scripts/tests/stack-router.test.mjs` by replacing raw `URL.pathname` handling with `fileURLToPath(import.meta.url)`.
- Added an explicit Stack Router entrypoint existence check for clearer cross-platform failures.
- The full test suite now contains 16 tests.

## v0.1.9

English fallback: added `adui-tauri-v2`, the executable ADui Profile Manager, Tauri/profile installer documentation, and enabled the local Tauri skill in the Tauri profile.

## v0.1.8

### Added

- Implemented `adui-3d-architecture` for engine selection, coordinates, integration boundaries, performance, and resource lifecycle.
- Implemented `adui-webgl2` for raw WebGL2 / GLSL ES 3.0 engineering.
- Added the shared `3d` profile inherited by Three.js, Babylon.js, CesiumJS, WebGL2, and WebGPU.
- Added 3D architecture and WebGL2 documentation with English fallbacks.
- Added router coverage for 3D profile inheritance and multi-engine warnings.

## v0.1.7

### Added

- Implemented `adui-viteplus` for the Vite+ unified toolchain.
- Implemented `adui-nestjs-prisma` for NestJS/Prisma integration.
- Added the combined `nestjs-prisma` profile and router tests.
- Added Chinese-first Vite+ and NestJS + Prisma documentation with English fallbacks.
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
