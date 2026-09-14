# Profile Installer

English fallback for `profile-installer.md`. The Chinese document is canonical.

ADui Profile Manager resolves `profiles/*.json`, deduplicates skills, groups them by upstream source, and invokes the `skills` CLI with npm, pnpm, Yarn, or Bun.

## Package manager selection

Supported runners:

| Package manager | Runner |
| --- | --- |
| npm | `npx --yes skills ...` |
| pnpm | `pnpm dlx skills ...` |
| Yarn | `yarn dlx skills ...` |
| Bun | `bunx skills ...` |

Detection priority is `--pm` / `--package-manager` > `package.json#packageManager` > lockfiles > `npm_config_user_agent` > npm fallback. Conflicting lockfiles stop automatic selection and require an explicit `--pm`.

Examples:

```powershell
npm run profile:plan -- vue unocss --agent codex --pm pnpm
npm run profile:install -- vue unocss --agent codex --pm pnpm
npm run profile:auto-install -- D:\Projects\my-app --agent codex --dry-run
```

`--project-root <path>` selects the target project for manual `plan` and `install`. `auto-install` uses its project path both for stack detection and package-manager detection, including workspace roots such as `pnpm-workspace.yaml` or `package.json#workspaces`.

Actual installs verify that the selected package manager is available. Yarn uses `yarn dlx` and therefore requires Yarn 2+. `--dry-run` only renders the plan and does not require the selected executable to exist.

Actual installs still require `--agent <name>` or `--all-agents` to avoid silent no-op installs in non-interactive environments. Project scope is the default; pass `--global` explicitly for user-level installation.
