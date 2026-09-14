# 安全策略

[简体中文](./SECURITY.md) | [English](./SECURITY.en.md)

## 支持范围

ADui Skills Pack 当前处于 `v0.2.x Public Preview`。安全修复优先进入最新的 `0.2.x` 版本；更早的 `0.1.x` 仅在影响严重且修复成本可控时回补。

## 报告安全问题

请不要在公开 Issue 中提交 Token、密码、私有仓库地址、内部网络信息或可直接利用的漏洞细节。

优先使用 GitHub Repository 的 **Security → Report a vulnerability** 私密报告入口。如果该入口暂不可用，请只在公开 Issue 中说明“需要私密安全沟通”，不要附敏感细节。

报告建议包含：

- 受影响版本或 Commit；
- 受影响的 Skill、脚本、Workflow 或 Profile；
- 复现条件与影响范围；
- 是否涉及凭据、命令执行、文件删除、网络访问或供应链风险；
- 可行的缓解或修复建议（如有）。

## 第三方 Skill 供应链

第三方 Skill 源码不会复制进本仓库。Registry 只记录来源，`skills.lock.json` 锁定审核过的 Skill 目录 Git tree SHA。每周更新只创建 PR，不自动合并。

任何涉及 Shell、下载执行、凭据、`git push`、`sudo`、大范围文件删除或网络策略变化的上游更新，都必须人工 Review 后再合并。

## 密钥

- 不要把 `CNB_TOKEN`、GitHub Token、Vercel 凭据或其他 Secret 写进仓库。
- GitHub Actions Secret 只授予 Workflow 完成任务所需的最小权限。
- 一旦凭据曾出现在公开日志或聊天记录中，应视为已泄露并立即吊销、重新生成。
