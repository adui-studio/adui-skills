# ADui Skills Pack 维护指南

[English](./maintenance.en.md) | 简体中文

## 1. 维护模型

ADui Skills Pack 将 GitHub 作为唯一事实源：

```text
GitHub main
    ↓
Registry / Profiles / ADui Skills
    ↓
Weekly Skills Update
    ↓
skills.lock.json
    ↓
Pull Request
    ↓
人工 Review
    ↓
Merge
    ↓
同步 CNB
```

CNB 只作为国内镜像，不独立维护 Skill Registry、Profile 或版本锁。

## 2. `skills.lock.json` 的作用

`registry/skills.json` 表示“ADui 选择哪些第三方 Skill”。

`registry/skills.lock.json` 表示“ADui 最近审核到哪个上游 Git Commit”。

每个锁定项包含：

- `source`
- `upstreamPath`
- `commit`
- `committedAt`
- `checkedAt`
- `url`

不要手工伪造 Commit SHA。

## 3. 首次初始化 Lock

### 推荐：GitHub Actions

进入：

```text
GitHub → Actions → Weekly Skills Update → Run workflow
```

第一次运行时，因为 Lock 为空，所有启用的第三方 Skill 都会被识别为 `Baseline`，工作流会生成一个 Pull Request。

请完整 Review 该 PR 后再合并。

### 本地初始化

需要 GitHub API Token。脚本按以下顺序寻找认证信息：

1. `GITHUB_TOKEN`
2. `GH_TOKEN`
3. `gh auth token`

如果已经登录 GitHub CLI：

```bash
gh auth login
npm run lock:init
```

PowerShell 也可以显式传入：

```powershell
$env:GITHUB_TOKEN = gh auth token
npm run lock:init
Remove-Item Env:GITHUB_TOKEN
```

生成的审核报告位于：

```text
tmp/skill-updates.md
```

## 4. 手动检查上游更新

只检查，不修改 Lock：

```bash
npm run updates:check
```

检查并更新本地 Lock：

```bash
npm run updates:apply
```

检查指定 Skill：

```bash
node scripts/check-updates.mjs --only vue-best-practices,unocss
```

JSON 输出：

```bash
node scripts/check-updates.mjs --only vue-best-practices --json
```

## 5. 每周自动更新

`.github/workflows/weekly-update.yml` 当前配置为：

```text
每周一 09:17
Asia/Shanghai
```

选择 09:17 而不是整点，是为了减少 Actions 定时任务高峰时段的排队概率。

工作流不会下载或复制第三方 Skill 源码，只会：

1. 读取 `registry/skills.json`
2. 查询每个 Skill 对应 `upstreamPath` 的最新 Git Commit
3. 与 `skills.lock.json` 比较
4. 更新 Lock
5. 生成 Upstream Compare 链接和 Review Checklist
6. 创建或更新 `chore/weekly-skills-update` Pull Request

如果没有上游变化，则不会创建 PR。

## 6. GitHub 设置

要允许 Workflow 自动创建 PR，请确认仓库：

```text
Settings
→ Actions
→ General
→ Workflow permissions
→ Allow GitHub Actions to create and approve pull requests
```

Workflow 自己已经声明：

```yaml
permissions:
  contents: write
  pull-requests: write
```

如果 Organization 级策略禁止该能力，需要先在 Organization Actions 设置中允许。

## 7. Review 每周更新 PR

至少检查：

- `SKILL.md` 的触发条件是否改变
- 是否新增 Shell / PowerShell / Python 等可执行脚本
- 是否新增删除文件、覆盖文件、Git push 等操作
- 是否新增外部网络请求或下载可执行文件
- 是否读取 Token、凭证、`.env`、SSH Key 等敏感内容
- 是否引入 `sudo`、管理员权限或权限提升
- 是否改变技术版本、框架约束或推荐架构
- Skill 是否仍然适合当前 ADui Profile 和 Tier

PR 只更新 `skills.lock.json`，第三方源码仍留在上游仓库。

## 8. 新增第三方 Skill

1. 在 `registry/skills.json` 增加元数据。
2. 确认 `source` 使用 `owner/repository`。
3. 确认 `upstreamPath` 精确指向 Skill 目录；如果 Skill 位于仓库根目录，使用 `.`。
4. 加入合适的 Profile。
5. 运行：

```bash
npm run validate
```

6. 初始化该 Skill 的 Lock：

```bash
node scripts/check-updates.mjs --only <skill-id> --write
```

7. Review 后提交。

## 9. 删除第三方 Skill

从 Registry 与 Profile 中移除后运行：

```bash
npm run updates:apply
```

`--prune` 会从 Lock 中清理已经禁用或删除的 Skill。

## 10. 安全原则

Weekly Update 永远只创建 PR，不自动合并。

Git Commit 变化仅表示“上游发生变化”，不代表“变化是安全的”。自动化只能帮助发现变化，最终审核仍由维护者完成。
