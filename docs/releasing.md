# 发布流程

[简体中文](./releasing.md) | [English](./releasing.en.md)

## 发布原则

- GitHub `adui-studio/adui-skills` 是唯一事实源。
- CNB 只同步 `main` 与版本标签，不在 CNB 单独发布不同内容。
- 文档、Workflow、Release Notes 默认中文；英文文件只做兜底。
- Release 必须来自已经合并到 `main` 的 Commit。
- 第三方 Skill Lock 基线未完成时禁止正式发布。
- `v0.2.0` 标记为 **Public Preview / Pre-release**。

## 1. 发布前检查

```bash
npm run validate
npm test
npm run release:check -- --tag v0.2.0
```

`release:check` 会确认版本号、Release Notes、License、安全策略和第三方 Skill Folder Hash Lock 均已就绪。

如果仍出现“Lock 尚未建立基线”，先运行每周更新 Workflow 或：

```bash
npm run lock:init
```

然后 Review `registry/skills.lock.json`，确认无异常上游后再提交。

## 2. GitHub 仓库公开与元数据

Public Preview 发布前确认仓库已切换为 Public，并建议设置 Topics：

```text
agent-skills
ai-coding
ai-agent
codex
opencode
viteplus
nestjs
prisma
tauri
threejs
cesiumjs
webgl2
webgpu
```

README 已准备 GitHub Release、Validate、License 和 skills.sh Badge。skills.sh 页面首次被索引前，Badge 可能暂时没有数据。

## 3. 创建版本标签

只在 `main` 最新发布 Commit 上创建 Annotated Tag：

```bash
git switch main
git pull --ff-only origin main
git tag -a v0.2.0 -m "ADui Skills Pack v0.2.0 Public Preview"
git push origin v0.2.0
```

推送标签后会同时触发：

- `发布 ADui Skills Pack`：校验、测试、打包、生成 SHA256、创建 GitHub Pre-release；
- `同步 GitHub 到 CNB`：同步 `main` 和 `v0.2.0` 标签。

Release Workflow **不会自动创建标签**，避免由 `GITHUB_TOKEN` 创建事件导致其他 Workflow 不触发。

## 4. Release 产物

Release Workflow 会附加：

```text
adui-skills-v0.2.0.zip
SHA256SUMS.txt
```

Public 仓库还会为 ZIP 生成 GitHub Artifact Attestation，用户可使用 GitHub CLI 验证来源。

## 5. 创建 skills.sh Pack

Packs 目前需要在 skills.sh 网页登录 Vercel 后创建，无法仅通过本仓库 Workflow 完成。

发布后打开 `https://skills.sh/packs/create`：

1. 使用 Vercel 登录；
2. Pack 名称：`ADui Skills Pack`；
3. 描述：`ADui Studio 的 AI Coding / Agent 全栈、跨端与 3D/GPU 核心 Skills。`；
4. 连接 GitHub，并导入 `adui-studio/adui-skills`；
5. 加入仓库内 7 个 `adui-*` Skills；
6. 创建 Pack，保存 `https://skills.sh/p/<pack-id>`。

Pack 创建后建议提交一个小版本，把真实 Pack URL 写入 README。不要在 URL 尚未创建时伪造 Pack ID。

## 6. 发布后验证

- GitHub Release 标记为 Pre-release；
- ZIP 与 `SHA256SUMS.txt` 可下载；
- Validate Workflow 仍为绿色；
- CNB 已出现 `v0.2.0` 标签；
- `npx skills add https://github.com/adui-studio/adui-skills --skill adui-stack-router` 可正常读取仓库；
- skills.sh Pack 创建后，`npx skills add https://skills.sh/p/<pack-id>` 可安装；
- README Badge 无失效链接。
## Lock 缺项处理

如果 `release:check` 报告少量启用 Skill 没有 Folder Hash，不要手工伪造 Hash。先确认 Registry 中的 `source` / `skillPath` 仍存在于上游主分支，然后使用：

```bash
npm run updates:apply -- --only <skill-id-1>,<skill-id-2> --strict
```

再次执行发布检查。若上游已经删除或重命名 Skill，应先更新 Registry / Profile，再重新生成对应 Lock。

