# ADui NestJS + Prisma 集成规范

[简体中文](./nestjs-prisma.md) | [English](./nestjs-prisma.en.md)

`adui-nestjs-prisma` 只在 NestJS 与 Prisma 同时存在时启用，解决框架 Skill 与 ORM Skill 之间的工程整合问题。

## 推荐流程

```text
adui-stack-router
      ↓
检测到 NestJS + Prisma
      ↓
nestjs-prisma Profile
      ↓
NestJS / Prisma / 数据库专项 Skills
      ↓
adui-nestjs-prisma
      ↓
adui-feature-dev
```

## 核心约定

- 以项目安装的 NestJS / Prisma 版本为事实源，不使用旧版 Prisma recipe 套新项目。
- DTO / Validation 定义 API 输入；Prisma generated types 不默认作为公共 API DTO。
- 复用项目现有 Repository 设计；简单项目不为了形式强行新增 Repository。
- 事务围绕业务原子性，不围绕 Controller 或所有 Service 方法。
- 数据库事务不能回滚 HTTP、MQ、文件等外部副作用。
- Migration 变更必须检查已有数据、兼容窗口、回滚、锁和 backfill 风险。
- Mock 单测不能替代真实 provider 的 Prisma 集成测试。

## 安装

```bash
npx skills add https://github.com/adui-studio/adui-skills --skill adui-nestjs-prisma
```
