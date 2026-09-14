# 安全规范

[简体中文](./security.md) | [English](./security.en.md)

Skill 是会影响 Agent 行为的供应链输入，不能把“Markdown 文件”当作天然安全内容。

## 上游更新 Review

重点检查：

- Shell / PowerShell / Python 执行；
- 删除、覆盖和批量移动文件；
- `curl | bash`、远程下载和动态执行；
- `.env`、Token、Credential、SSH Key 等敏感信息；
- `git push`、force push、历史重写；
- `sudo`、管理员权限、系统目录；
- 新增二进制或外部可执行程序；
- 指令是否尝试绕过项目边界或用户授权。

## 自动化原则

- 上游更新只能自动开 PR，不能自动 merge。
- 单个上游不可用时保留已有 Lock，不自动删除可信基线。
- CNB Token 只保存在 GitHub Actions Secret 中。
- Workflow 按最小权限配置。
