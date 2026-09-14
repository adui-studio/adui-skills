# Profile 一键安装器

[简体中文](./profile-installer.md) | [English](./profile-installer.en.md)

ADui Profile Manager 把 `profiles/*.json` 从声明式清单升级成可执行安装计划。它会展开 `extends`、去重 Skill、按上游仓库分组，并根据目标项目自动选择 npm / pnpm / yarn / bun 来调用 `skills` CLI。

## 查看 Profiles

```powershell
npm run profile:list
npm run profile:show -- vue
```

## 包管理器策略

支持四种包管理器：

| 包管理器 | 执行方式 |
| --- | --- |
| npm | `npx --yes skills ...` |
| pnpm | `pnpm dlx skills ...` |
| yarn | `yarn dlx skills ...` |
| bun | `bunx skills ...` |

自动检测优先级固定为：

1. `--pm` / `--package-manager` 显式指定；
2. 目标项目 `package.json#packageManager`；
3. 目标项目或 Workspace 根目录 Lock 文件；
4. 当前执行环境 `npm_config_user_agent`；
5. 都无法确认时回退 npm。

Lock 文件对应关系：

```text
package-lock.json / npm-shrinkwrap.json -> npm
pnpm-lock.yaml                          -> pnpm
yarn.lock                               -> yarn
bun.lock / bun.lockb                    -> bun
```

如果同时发现不同包管理器的 Lock 文件，安装器不会猜测，会要求显式指定：

```powershell
npm run profile:plan -- vue --agent codex --pm pnpm
```

也可以使用长参数：

```powershell
--package-manager pnpm
```

如确实需要关闭自动检测：

```powershell
--no-pm-detect
```

此时在未显式 `--pm` 的情况下回退 npm。

## 只生成安装计划

让安装器自动识别当前目标项目：

```powershell
npm run profile:plan -- vue unocss git --agent codex
```

显式指定 pnpm：

```powershell
npm run profile:plan -- vue unocss git --agent codex --pm pnpm
```

指定另一个目标项目：

```powershell
npm run profile:plan -- vue unocss git `
  --agent codex `
  --project-root D:\Projects\my-app
```

`plan` 不安装任何内容，只显示有效 Profile、Skills、目标项目、包管理器检测依据和将执行的真实命令。

## 安装

默认目标项目是当前工作目录，并要求显式指定 Agent：

```powershell
npm run profile:install -- vue unocss git --agent codex
```

使用 pnpm：

```powershell
npm run profile:install -- vue unocss git --agent codex --pm pnpm
```

安装到指定项目：

```powershell
npm run profile:install -- vue unocss git `
  --agent codex `
  --project-root D:\Projects\my-app
```

同时安装到 Codex 与 OpenCode：

```powershell
npm run profile:install -- vue unocss --agent codex --agent opencode
```

全局安装：

```powershell
npm run profile:install -- vue --agent codex --global
```

明确安装到所有 Agent：

```powershell
npm run profile:install -- core --all-agents
```

`--all-agents` 是显式高范围操作，不作为默认值。

## 根据项目自动安装

`auto-install` 会同时做两件事：

1. 使用 `adui-stack-router` 检测目标项目的 Direct Profiles；
2. 在同一个目标项目中检测包管理器并执行安装。

第一次建议只预览：

```powershell
npm run profile:auto-install -- `
  D:\Projects\my-app `
  --agent codex `
  --dry-run
```

如果目标项目包含：

```text
package.json
pnpm-workspace.yaml
pnpm-lock.yaml
apps/web/package.json
```

即使命令本身是从 ADui Skills Pack 仓库通过 `npm run` 启动，安装器仍会按目标项目识别为 pnpm，并生成：

```bash
pnpm dlx skills add ...
```

而不是错误地使用 npm。

确认计划后执行：

```powershell
npm run profile:auto-install -- D:\Projects\my-app --agent codex
```

需要覆盖自动检测时：

```powershell
npm run profile:auto-install -- D:\Projects\my-app --agent codex --pm bun
```

## Workspace / Monorepo

包管理器检测会从目标目录向上寻找 Workspace / Git 根目录，并检查：

- `pnpm-workspace.yaml`；
- `package.json#workspaces`；
- `.git`；
- 上层 `package.json` 与 Lock 文件。

因此从 `apps/web` 执行自动安装时，可以正确识别仓库根目录的 pnpm/yarn/npm/bun 配置。

## 安装前可用性检查

真正安装前会检查所选包管理器是否存在：

```text
npm  -> npm/npx
pnpm -> pnpm
yarn -> yarn
bun  -> bun/bunx
```

如果不可用，会在执行 Skill 安装前直接报错并给出切换建议。

Yarn 使用 `yarn dlx`，因此要求 Yarn 2+；Yarn Classic 1.x 会被明确拒绝。

`--dry-run` 不做可执行文件检查，因此可以在没有安装对应包管理器的机器上预览命令。

## 为什么要求显式 Agent

`skills` CLI 在无 TTY 且没有已检测 Agent 时可能进入 Agent 选择流程但没有真正安装。ADui 安装器因此拒绝“未指定 Agent 的实际安装”，避免出现命令返回成功但 Skill 没落盘的假成功。

## 参数

- `--pm <npm|pnpm|yarn|bun>`：显式指定包管理器，优先级最高。
- `--package-manager <...>`：`--pm` 的长参数别名。
- `--no-pm-detect`：关闭自动检测并回退 npm；显式 `--pm` 仍优先。
- `--project-root <path>`：指定安装目标项目。
- `--global`：用户级安装，默认是项目级。
- `--agent <name>`：可重复。
- `--all-agents`：安装到所有 Agent。
- `--copy`：要求 `skills` CLI 使用复制而非 symlink。
- `--dry-run`：不执行安装，只显示真实计划。
- `--json`：`list/show/plan` 输出机器可读 JSON。
