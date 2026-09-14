---
name: adui-stack-router
description: 检测当前代码仓库的技术栈，并选择最小且合适的 ADui Skills Pack Profiles。用于进入陌生项目、决定需要启用哪些 ADui/第三方 Skills，或项目可能包含 Vue、React、Tailwind CSS、UnoCSS、Vite、Vite+、NestJS、Prisma、PostgreSQL、MySQL、SQLite、Flutter、Tauri、uni-app、uni-app x、微信小程序、Three.js、Babylon.js、CesiumJS、WebGL2、WebGPU、pnpm 或 Git 工作流时。
---

# ADui Stack Router

在开始实质编码前，根据真实项目证据，把当前仓库路由到最小相关 Profile 集合。

## 工作流程

1. 只读检查仓库，不修改文件。
2. 可执行代码时运行：
   ```bash
   node scripts/detect-stack.mjs <project-root>
   ```
   其他程序或 Agent 需要机器可读结果时增加 `--json`。
3. 检查检测器给出的证据，不只相信目录名或项目名。
4. 出现冲突时读取 `references/detection-rules.md`。
5. 只选择当前技术栈和任务实际需要的直接 Profiles。
6. 按 `references/profile-resolution.md` 展开继承，得到有效 Profiles。
7. 在开始大规模修改前，输出：检测到的技术、直接 Profiles、有效 Profiles、警告和不确定项。

## 路由规则

- 优先使用依赖、配置文件、框架 manifest、数据库 provider 等明确证据。
- 存在更强证据时，不要仅凭目录名推断技术。
- Tailwind CSS 与 UnoCSS 同时出现时，检查实际配置和 import，不要因为包都存在就默认同时启用。
- PostgreSQL、MySQL、SQLite 优先依据 Prisma datasource provider 或显式驱动判断，不要无依据同时启用。
- Vite+ 与普通 Vite 分开判断，只在项目确实使用 Vite+ 时选择 `viteplus`。
- uni-app 与 uni-app x 分开判断；UTS/UVue 只是中等强度证据，必要时继续确认。
- 原生微信小程序与 CloudBase 分开判断，只在实际使用 CloudBase 时加入 `wechat-cloudbase`。
- Three.js、Babylon.js、CesiumJS、WebGL2、WebGPU 可独立组合，但只有项目真实同时使用时才同时选择。
- 目标目录本身是 Git 仓库/工作树时才选择 `git`。
- 证据不足时输出候选或警告，不要伪造确定结论。

## 安全要求

- 技术栈检测必须只读。
- 不读取 `.env`、凭据、私钥、Token 或 Secret Store。
- 路由阶段不安装依赖、不修改配置、不执行项目脚本。
- 不执行破坏性 Git 操作。

## 输出示例

```text
检测到的技术栈
- Vue 3 — 高 — package.json: dependencies.vue
- UnoCSS — 高 — uno.config.ts + unocss dependency
- Prisma — 高 — prisma/schema.prisma
- PostgreSQL — 高 — Prisma datasource provider=postgresql

直接 Profiles
- vue
- unocss
- prisma
- postgresql
- git

有效 Profiles
- core
- web
- toolchain
- vue
- unocss
- database
- prisma
- postgresql
- git

警告
- 无
```

## 资源

- 中文检测规则：`references/detection-rules.md`
- 英文检测规则兜底：`references/detection-rules.en.md`
- 中文 Profile 解析：`references/profile-resolution.md`
- 英文 Profile 解析兜底：`references/profile-resolution.en.md`
