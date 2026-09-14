# ADui Skills Pack

[English](./README.en.md) | 简体中文

ADui Skills Pack 是一套面向 AI Coding / Agent 开发的可维护 Skills 集合，覆盖全栈开发、跨端应用、数据库、Web 3D/GPU、Git 协作与软件交付流程。

> GitHub 是唯一主仓库和事实源；CNB 仅作为国内同步镜像。

## 仓库

- GitHub 主仓库：<https://github.com/adui-studio/adui-skills>
- CNB 国内镜像：<https://cnb.cool/adui-studio/adui-skills>

Issue、Pull Request、Release 与版本管理均以 GitHub 为准。

## 技术栈

ADui Skills Pack 当前面向：

- Web：Vue、React、Tailwind CSS、UnoCSS
- Toolchain：Vite、Vite+、Vitest、pnpm
- Backend：NestJS、TypeScript
- Database：Prisma、SQL、PostgreSQL、MySQL、SQLite
- Cross-platform：Flutter、Tauri
- Mini App：uni-app、uni-app x、微信小程序
- 3D / GPU：Three.js、Babylon.js、CesiumJS、WebGL2、WebGPU
- Delivery：Git、GitHub、Pull Request、Changelog、Release

## 设计原则

ADui Skills Pack 不复制和二次维护第三方 Skill 源码。

```text
第三方 Skill                 ADui 自研 Skill
     │                             │
     ▼                             ▼
registry/skills.json             skills/
     │                             │
     └──────────────┬──────────────┘
                    ▼
                profiles/
                    │
                    ▼
            adui-stack-router
```

- `registry/`：第三方 Skill 索引与审核版本
- `profiles/`：按技术栈组织的 Skill 组合
- `skills/`：ADui 自己维护的 Skills
- `scripts/`：Registry、更新和文档自动化
- `docs/`：架构、使用和安全说明

## 快速开始

### 1. 克隆仓库

GitHub：

```bash
git clone https://github.com/adui-studio/adui-skills.git
cd adui-skills
```

国内只读镜像：

```bash
git clone https://cnb.cool/adui-studio/adui-skills.git
cd adui-skills
```

建议开发、Issue 和 PR 始终使用 GitHub 主仓库。

### 2. 验证 Registry 和 Profiles

需要 Node.js 22+：

```bash
npm run validate
```

验证内容包括：

- Registry Skill ID 是否重复
- Skill 元数据是否完整
- Profile 是否引用不存在的 Skill
- Profile `extends` 是否存在
- Profile 是否存在循环继承
- ADui 本地 Skill 是否存在 `SKILL.md`
- ADui 本地 Skill 是否存在 `agents/openai.yaml`
- 尚未确定的 `upstreamPath` 会以 Warning 显示

### 3. 安装 ADui 自研 Skill

例如安装技术栈路由器：

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-stack-router
```

安装功能开发工作流：

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-feature-dev
```

`skills` CLI 支持直接从 GitHub 仓库发现并安装有效的 `SKILL.md`。当前 Profile 是声明式配置，还不是一键安装器。

### 4. 根据 Registry 安装第三方 Skill

例如 Registry 中：

```json
{
  "id": "vue-best-practices",
  "source": "vuejs-ai/skills"
}
```

对应安装：

```bash
npx skills add vuejs-ai/skills --skill vue-best-practices
```

React 示例：

```bash
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices
```

UnoCSS 示例：

```bash
npx skills add antfu/skills --skill unocss
```

更多使用方式见 [docs/usage.md](./docs/usage.md)。

## Profiles

当前 Profile：

| Profile | 主要用途 |
|---|---|
| `core` | 规划、Debug、测试、Review、验证、安全 |
| `web` | UI/UX、可访问性、Web 测试 |
| `vue` | Vue 3、Router、Pinia、VueUse |
| `react` | React 性能与组件架构 |
| `tailwind` | Tailwind CSS |
| `unocss` | UnoCSS |
| `toolchain` | Vite、Vite+、Vitest、pnpm |
| `backend` | NestJS、TypeScript |
| `database` | Prisma、SQL、PostgreSQL、MySQL、SQLite |
| `flutter` | Flutter / Dart |
| `tauri` | Tauri v2 |
| `uniapp` | uni-app / uni-app x |
| `wechat-miniprogram` | 微信小程序 |
| `threejs` | Three.js |
| `babylonjs` | Babylon.js |
| `cesiumjs` | CesiumJS |
| `webgl2` | WebGL2 |
| `webgpu` | WebGPU |
| `git` | Git / GitHub / PR / Release |

Profile 支持继承。例如 Vue Profile 会组合 `web` 与 `toolchain`，最终间接继承 `core`。

## ADui 自研 Skills

规划中的核心 Skill：

- `adui-stack-router`：识别项目技术栈并选择 Profile
- `adui-feature-dev`：统一需求分析、开发、测试、Review 和验证流程
- `adui-viteplus`：Vite+ 工程规范
- `adui-nestjs-prisma`：NestJS + Prisma 集成规范
- `adui-tauri-v2`：Tauri v2 工程规范
- `adui-webgl2`：WebGL2 / GLSL ES 3.0 底层规范
- `adui-3d-architecture`：Three.js / Babylon.js / CesiumJS / WebGL2 / WebGPU 技术决策

## 更新策略

```text
第三方上游更新
      ↓
GitHub Actions 每周检查
      ↓
更新 skills.lock.json
      ↓
生成 Pull Request
      ↓
人工 Review
      ↓
合并 main
      ↓
自动同步 CNB
```

第三方 Skill 更新不会自动合并到 `main`。

## 当前状态

项目仍处于 `v0.1.x` 基础设施阶段。

已完成：

- GitHub → CNB 自动同步
- Registry v1
- 技术 Profile v1
- Registry / Profile 验证器

下一步：

- 完成 `adui-stack-router`
- 初始化 `skills.lock.json`
- 实现上游更新检查器
- 开启每周 Update PR
- 创建 skills.sh Pack

## 文档

- [使用指南](./docs/usage.md)
- [架构说明](./docs/architecture.md)
- [添加 Skill](./docs/adding-skills.md)
- [安全策略](./docs/security.md)

## License

ADui 自研代码与 Skill 按仓库 LICENSE 发布。

第三方 Skill 仍归各自上游项目所有，并遵循对应上游 License；本仓库默认只保存第三方 Skill 的元数据、来源和审核版本，不重新分发其源码。
