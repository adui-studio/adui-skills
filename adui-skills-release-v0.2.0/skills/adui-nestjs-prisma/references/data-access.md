# 数据访问与错误映射

[简体中文](./data-access.md) | [English](./data-access.en.md)

## 查询

- 明确只选择需要字段，避免默认加载大型关系。
- 检查 N+1 查询、循环 await、无界列表和重复 round-trip。
- API 列表必须有明确最大范围或分页策略。
- 分页结果需要稳定排序；大数据量优先评估 cursor。
- 热路径根据真实数据库分析索引，而不是仅凭 ORM 查询形状猜测。

## 写入

- 先利用数据库唯一约束、外键和事务保障一致性，再补应用层友好校验。
- `upsert`、批量写入和并发更新要确认真实并发语义。
- 不使用“先查不存在，再插入”替代数据库唯一约束来保证并发正确性。

## 错误映射

底层 Prisma/数据库错误不要原样返回客户端。优先在 Repository/Service 或统一异常层映射为稳定业务错误，例如：

```text
Unique violation → Conflict
Record not found → Not Found（仅当业务语义确实如此）
Invalid input → Bad Request / DTO Validation
Unexpected database failure → Internal Error + 安全日志
```

不要通过完整错误字符串判断类型；优先使用当前版本提供的稳定错误类型/代码。
