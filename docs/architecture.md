# ADui Skills Pack 架构

[简体中文](./architecture.md) | [English](./architecture.en.md)

## 四层结构

1. `registry/`：第三方 Skill 元数据与审核锁。
2. `profiles/`：按技术栈组织的声明式组合。
3. `skills/`：ADui 自研 Skill。
4. `scripts/` + `.github/workflows/`：校验、路由、更新和镜像自动化。

## Registry 与 Lock

`skills.json` 表示“我们选择哪些 Skill”。

`skills.lock.json` 表示“我们审核到了哪个 Skill 文件夹版本”。

Lock v2 使用 `skillFolderHash`，避免仓库中无关文件或其他 Skill 修改造成假更新。

## Profile

Profile 只保存 Skill ID 和 Profile 继承关系，不复制 Skill 内容。项目通过 `adui-stack-router` 检测技术栈，再选择最小组合。

## 主仓与镜像

GitHub 是唯一事实源，CNB 为单向国内镜像。所有修改、PR、Release 和自动更新先进入 GitHub。

## ADui 自研核心 Skills

- `adui-stack-router`：只读检测技术栈并解析最小 Profile 集。
- `adui-feature-dev`：统一需求理解、最小修改、测试验证、Review 与交付格式。
- `adui-viteplus`：Vite+ 统一工具链专项规范。
- `adui-nestjs-prisma`：NestJS 与 Prisma 同时存在时的工程胶水层。

两者关系：

```text
项目进入
  ↓
adui-stack-router
  ↓
技术栈 / Profiles
  ↓
adui-feature-dev
  ↓
实现与验证
```

## 组合 Profile

`nestjs-prisma` 同时继承 `backend` 与 `prisma`，仅在 Stack Router 同时检测到 NestJS 和 Prisma 时作为直接 Profile。这样可以避免 `backend` 对所有 NestJS 项目强制加载 Prisma 集成规则。
