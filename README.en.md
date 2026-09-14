# ADui Skills Pack

English | [简体中文](./README.md)

ADui Skills Pack is a maintainable collection of Agent Skills for AI coding workflows across full-stack development, cross-platform apps, databases, Web 3D/GPU, Git collaboration, and software delivery.

> GitHub is the canonical repository and source of truth. CNB is a synchronized mirror for users in China.

## Repositories

- GitHub primary repository: <https://github.com/adui-studio/adui-skills>
- CNB China mirror: <https://cnb.cool/adui-studio/adui-skills>

Issues, pull requests, releases, and version management belong on GitHub.

## Technology Coverage

ADui Skills Pack currently targets:

- Web: Vue, React, Tailwind CSS, UnoCSS
- Toolchain: Vite, Vite+, Vitest, pnpm
- Backend: NestJS, TypeScript
- Database: Prisma, SQL, PostgreSQL, MySQL, SQLite
- Cross-platform: Flutter, Tauri
- Mini App: uni-app, uni-app x, WeChat Mini Program
- 3D / GPU: Three.js, Babylon.js, CesiumJS, WebGL2, WebGPU
- Delivery: Git, GitHub, pull requests, changelogs, releases

## Architecture

ADui Skills Pack does not vendor and independently maintain third-party Skill source code.

```text
Third-party Skills               ADui-maintained Skills
       │                                  │
       ▼                                  ▼
registry/skills.json                    skills/
       │                                  │
       └────────────────┬─────────────────┘
                        ▼
                    profiles/
                        │
                        ▼
                adui-stack-router
```

- `registry/`: curated third-party Skill metadata and reviewed revisions
- `profiles/`: reusable technology-specific Skill combinations
- `skills/`: ADui-maintained Skills
- `scripts/`: registry, update, and documentation automation
- `docs/`: architecture, usage, and security documentation

## Quick Start

### 1. Clone the repository

GitHub:

```bash
git clone https://github.com/adui-studio/adui-skills.git
cd adui-skills
```

China mirror:

```bash
git clone https://cnb.cool/adui-studio/adui-skills.git
cd adui-skills
```

Use the GitHub repository for development, issues, and pull requests.

### 2. Validate the registry and profiles

Node.js 22+ is required:

```bash
npm run validate
```

The validator checks:

- duplicate Registry Skill IDs
- required Skill metadata
- unknown Skill references in Profiles
- missing parent Profiles
- Profile inheritance cycles
- missing `SKILL.md` files for local ADui Skills
- missing `agents/openai.yaml` files for local ADui Skills
- unresolved `upstreamPath` values are reported as warnings

### 3. Install an ADui-maintained Skill

Install the stack router:

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-stack-router
```

Install the feature development workflow:

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-feature-dev
```

The `skills` CLI can discover valid `SKILL.md` files from a GitHub repository. Profiles are declarative configuration in the current release and are not yet one-command installers.

### 4. Install a third-party Skill from the Registry

For a Registry entry such as:

```json
{
  "id": "vue-best-practices",
  "source": "vuejs-ai/skills"
}
```

install it with:

```bash
npx skills add vuejs-ai/skills --skill vue-best-practices
```

React example:

```bash
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices
```

UnoCSS example:

```bash
npx skills add antfu/skills --skill unocss
```

See [docs/usage.en.md](./docs/usage.en.md) for more details.

### 5. Detect a project's technology stack

From the ADui Skills Pack repository:

```bash
npm run detect:stack -- ../your-project
```

Or run the Skill's bundled detector directly:

```bash
node skills/adui-stack-router/scripts/detect-stack.mjs ../your-project
```

JSON output:

```bash
node skills/adui-stack-router/scripts/detect-stack.mjs ../your-project --json
```

Detection is read-only and does not read `.env`, tokens, private keys, or secret stores.

## Profiles

Current Profiles:

| Profile | Purpose |
|---|---|
| `core` | planning, debugging, testing, review, verification, security |
| `web` | UI/UX, accessibility, web testing |
| `vue` | Vue 3, Router, Pinia, VueUse |
| `react` | React performance and component architecture |
| `tailwind` | Tailwind CSS |
| `unocss` | UnoCSS |
| `toolchain` | Vite, Vitest |
| `viteplus` | Vite+ (only when `vite-plus` is actually used) |
| `pnpm` | pnpm / workspaces |
| `backend` | NestJS, TypeScript |
| `database` | database-neutral SQL and relational schema design |
| `prisma` | Prisma CLI / Client / migrations |
| `postgresql` | PostgreSQL |
| `mysql` | MySQL |
| `sqlite` | SQLite |
| `flutter` | Flutter / Dart |
| `tauri` | Tauri v2 |
| `uniapp` | uni-app |
| `uniapp-x` | uni-app x / UTS / UVue |
| `wechat-miniprogram` | native WeChat Mini Program |
| `wechat-cloudbase` | WeChat Mini Program + Tencent CloudBase |
| `threejs` | Three.js |
| `babylonjs` | Babylon.js |
| `cesiumjs` | CesiumJS |
| `webgl2` | WebGL2 |
| `webgpu` | WebGPU |
| `git` | Git / GitHub / PR / Release |

Profiles support inheritance. For example, the Vue Profile extends both `web` and `toolchain`, which ultimately inherit `core`.

## ADui-maintained Skills

Planned core Skills:

- `adui-stack-router`: **implemented**, read-only project stack detection and minimal Profile routing
- `adui-feature-dev`: standardize requirement analysis, development, testing, review, and verification
- `adui-viteplus`: Vite+ engineering conventions
- `adui-nestjs-prisma`: NestJS + Prisma integration conventions
- `adui-tauri-v2`: Tauri v2 engineering conventions
- `adui-webgl2`: low-level WebGL2 / GLSL ES 3.0 conventions
- `adui-3d-architecture`: choose between Three.js, Babylon.js, CesiumJS, WebGL2, and WebGPU

## Update Strategy

```text
Third-party upstream change
          ↓
Weekly GitHub Actions check
          ↓
Update skills.lock.json
          ↓
Create pull request
          ↓
Human review
          ↓
Merge into main
          ↓
Synchronize to CNB
```

Third-party Skill changes are never automatically merged into `main`.

## Current Status

The project is currently in the `v0.1.x` infrastructure phase.

Completed:

- GitHub → CNB synchronization
- Registry v1
- technology Profiles v1
- Registry / Profile validator
- `adui-stack-router` stack detection and Profile routing

Next:

- initialize `skills.lock.json`
- implement upstream update checks
- enable weekly update pull requests
- create a skills.sh Pack

## Documentation

- [Usage Guide](./docs/usage.en.md)
- [Architecture](./docs/architecture.md)
- [Adding Skills](./docs/adding-skills.md)
- [Security](./docs/security.md)

## License

ADui-maintained code and Skills are distributed under this repository's LICENSE.

Third-party Skills remain owned by their upstream projects and are governed by their respective licenses. This repository normally stores only third-party metadata, source locations, and reviewed revisions rather than redistributing upstream source code.
