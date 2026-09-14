# NestJS + Prisma 架构边界

[简体中文](./architecture.md) | [English](./architecture.en.md)

## 目标

让 NestJS 负责模块、依赖注入、接口边界与业务编排；让 Prisma 负责类型安全的数据访问与 schema/migration，不让两者职责互相污染。

## 推荐原则

- Controller 处理协议层输入输出，不直接承载数据库规则。
- DTO 与 Validation Pipe 定义 API 输入约束。
- Service 承载业务用例与事务边界。
- 项目已有 Repository 层时沿用；简单项目可直接由 Service 注入 PrismaService。
- Prisma generated types 不默认等同于 API DTO。
- PrismaModule 是否 `@Global()` 由项目现有架构决定，不机械设为全局。
- 数据库 provider、driver adapter、生成输出目录和连接方式以当前 Prisma 版本和项目配置为准。

## 依赖方向

业务模块可以依赖数据库基础设施，但数据库基础设施不应反向依赖业务 Controller。

避免跨模块直接访问其他模块的 Prisma 查询实现；需要共享时通过明确 Service/Repository 接口或共享基础设施组织。
