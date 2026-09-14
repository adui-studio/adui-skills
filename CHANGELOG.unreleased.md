# 未发布变更

## skills.sh 每周分类排行与 Pack 精选

- 新增 `每周精选 skills.sh 排行 Skill` Workflow，每周按分类获取候选并生成排行报告。
- 新增安装量、GitHub Stars 与最佳努力安全审计门禁。
- 新增 `pack/skills-sh-pack.json` append-only 选择历史，不删除、不替换历史候选。
- 自动排除当前 Pack 已存在 Skill、历史已选 Skill，以及同一次运行的重复候选。
- 新增真实 Pack 地址 `https://www.skills.sh/p/DCh7RQegkqCXcXn8` 与一键安装命令。
- 当前 skills.sh 没有公开稳定的 Pack 写入 API，因此最终加入 Pack 仍由人工在 Pack 管理页确认；不会依赖未公开接口或浏览器登录状态。
