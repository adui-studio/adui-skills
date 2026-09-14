# 测试与迁移

[简体中文](./testing-migrations.md) | [English](./testing-migrations.en.md)

## 测试层次

- Service 单测：验证业务分支；可 mock 数据访问边界，但不要把 mock 当数据库兼容性证明。
- Repository/Prisma 集成测试：验证真实 query、constraint、transaction 和 provider 行为。
- API 集成/E2E：验证 DTO、Validation、Guard、Exception Filter 与数据库行为组合。

## Prisma 变更验证

涉及 schema/config 时至少检查：

1. Schema/config 是否能被当前 Prisma 版本解析。
2. Client 是否能正常生成。
3. NestJS 是否能 typecheck/build。
4. 对应单测/集成测试是否通过。
5. Migration SQL 是否符合预期。

## Migration

- 新增非空字段前考虑已有数据。
- Rename/drop/type change 评估兼容窗口和回滚。
- 大表操作考虑锁、执行时长和分批 backfill。
- 数据回填与 schema migration 可以拆开，不强行塞进一次发布。
- 生产执行前保留备份/恢复和观测方案。

不要声称“迁移安全”除非实际检查了目标数据库、生成 SQL 和数据条件。
