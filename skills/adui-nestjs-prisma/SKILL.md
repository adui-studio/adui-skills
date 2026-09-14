---
name: adui-nestjs-prisma
description: 规范 NestJS 与 Prisma 的集成边界。用于项目同时存在 @nestjs/core 与 Prisma ORM 时，设计或修改 PrismaModule/PrismaService、Repository/Service 数据访问、DTO 与 Validation、事务、异常映射、分页、迁移、测试、数据库 provider 和应用生命周期；优先适配项目实际 Prisma/NestJS 版本与数据库，不套用旧版 Prisma 教程。默认中文输出，英文仅作为兜底。
---

# ADui NestJS + Prisma

只在 NestJS 与 Prisma 同时存在时使用。目标是保持 NestJS 模块边界、业务层语义与 Prisma 数据访问职责清晰，而不是把 Prisma Client 直接扩散到整个项目。

## 工作流程

1. 读取 `package.json`、Prisma schema / config、NestJS module/service/controller、DTO 和测试结构。
2. 确认 NestJS、Prisma 版本和数据库 provider；不要沿用旧版 Prisma API 或旧生成目录习惯。
3. 明确改动属于：基础接入、查询、写入、事务、迁移、性能、测试或错误处理。
4. 复用项目现有 Prisma 集成方式；已有 Repository 层时不绕过，项目明确直接在 Service 使用 Prisma 时也不强行新增 Repository。
5. DTO/Validation 负责接口输入；Prisma generated types 负责数据库类型，不把数据库生成类型直接当公共 API DTO。
6. 事务边界由业务用例决定，不以“一个 Service 方法一个事务”为机械规则。
7. Prisma 错误在合适边界转换为领域/HTTP 异常，避免向 Controller 泄漏底层数据库错误细节。
8. Schema/Migration 变更必须说明兼容性、数据迁移和回滚风险。
9. 执行单元/集成测试、Prisma 生成/校验与 NestJS 构建，按实际执行结果交付。

架构见 `references/architecture.md`；数据访问与错误映射见 `references/data-access.md`；事务见 `references/transactions.md`；测试与迁移见 `references/testing-migrations.md`。

## 核心规则

- 以当前安装的 Prisma/NestJS 版本为事实源，不复制旧版 NestJS Prisma recipe。
- `PrismaService` 的生命周期、连接方式和 driver adapter 应服从当前 Prisma 版本与部署环境。
- 不把数据库连接串、密码或 Secret 写入源码。
- 不把 Prisma Client 暴露为 Controller 的公共 API 契约。
- 不在循环中执行可批量化的独立查询；主动识别 N+1、过度 `include`、无界列表和缺失索引风险。
- 写操作涉及多个必须原子成功的数据库动作时，评估事务；涉及外部 HTTP/MQ/文件系统时不要误以为数据库事务能覆盖外部副作用。
- 事务内避免长时间网络请求和无关计算，减少锁持有时间。
- 唯一约束、外键、not-found 等数据库错误应在稳定边界映射，不依赖脆弱的错误字符串匹配。
- 分页优先明确排序稳定性；大数据量场景评估 cursor pagination，而不是默认无限 offset。
- Migration 不等于数据回填；复杂变更需要单独 backfill/兼容窗口和回滚方案。

## 模块边界

推荐把数据库基础设施集中管理，但是否全局模块取决于现有项目：

```text
Controller
   ↓
Application / Domain Service
   ↓
Repository（项目已有时）或 PrismaService
   ↓
Prisma Client / Driver Adapter
   ↓
Database
```

不要为了“标准化”给简单项目增加没有价值的抽象层。

## 与其他 Skills 协作

- 技术栈检测：`adui-stack-router`。
- 功能开发：`adui-feature-dev`。
- NestJS 框架规则：`nestjs-best-practices`。
- Prisma CLI / Client / Setup：使用 Prisma 官方 Skills。
- PostgreSQL/MySQL/SQLite 专项优化：使用真实 provider 对应 Skill。
- 高级 TypeScript 类型：仅在确有必要时使用相关 Skill。

## 验证建议

根据任务执行适用项：

```text
Prisma schema/config 校验
       ↓
Prisma Client 生成
       ↓
NestJS type/build check
       ↓
Unit Test
       ↓
Database Integration Test
       ↓
Migration / rollback review
       ↓
Git diff review
```

数据库集成测试、迁移或真实 provider 未执行时必须明确说明，不能用 mock 测试代替这些结论。

## 语言

默认使用中文；用户明确要求英文时使用英文。英文参考使用同名 `.en.md` 文件。
