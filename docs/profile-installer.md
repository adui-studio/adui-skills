# Profile 一键安装器

[简体中文](./profile-installer.md) | [English](./profile-installer.en.md)

ADui Profile Manager 把 `profiles/*.json` 从“声明式清单”升级成可执行安装计划。它会展开 `extends`、去重 Skill，并按上游仓库分组调用官方 `npx skills` CLI。

## 查看 Profiles

```powershell
npm run profile:list
```

查看某个 Profile 展开结果：

```powershell
npm run profile:show -- vue
```

## 只生成安装计划

```powershell
npm run profile:plan -- vue unocss git --agent codex
```

不会安装任何内容，只显示有效 Profile、Skills 和将执行的 `npx skills add` 命令。

## 安装

默认安装到当前项目，并要求显式指定 Agent：

```powershell
npm run profile:install -- vue unocss git --agent codex
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

先由 `adui-stack-router` 检测项目，再安装检测到的 Direct Profiles：

```powershell
npm run profile:auto-install -- D:\Projects\my-app --agent codex
```

建议第一次加 `--dry-run`：

```powershell
npm run profile:auto-install -- D:\Projects\my-app --agent codex --dry-run
```

## 为什么要求显式 Agent

`skills` CLI 在无 TTY 且没有已检测 Agent 时，可能进入 Agent 选择流程但没有真正安装。ADui 安装器因此拒绝“未指定 Agent 的实际安装”，避免出现命令返回成功但 Skill 没落盘的假成功。

## 其他参数

- `--global`：用户级安装，默认是项目级。
- `--agent <name>`：可重复。
- `--all-agents`：安装到所有 Agent。
- `--copy`：要求 skills CLI 使用复制而非 symlink。
- `--dry-run`：不执行安装。
- `--json`：`list/show/plan` 输出机器可读 JSON。
