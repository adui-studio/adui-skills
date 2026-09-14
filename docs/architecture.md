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
