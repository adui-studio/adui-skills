# Profile Installer

English fallback for `profile-installer.md`.

The ADui Profile Manager resolves `profiles/*.json` inheritance, deduplicates skills, groups them by upstream source, and invokes the official `npx skills` CLI. Use `profile:list`, `profile:show`, and `profile:plan` for inspection. Actual installs require an explicit `--agent <name>` or `--all-agents` to avoid silent no-op installs in non-interactive environments. `profile:auto-install` first uses the ADui stack router and then installs the detected direct profiles. Project scope is the default; pass `--global` explicitly for user-level installation.
