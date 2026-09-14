# ADui NestJS + Prisma Integration Guide

English | [简体中文](./nestjs-prisma.md)

`adui-nestjs-prisma` is used only when NestJS and Prisma coexist. It coordinates module boundaries, DTO validation, Prisma data access, transactions, error mapping, migrations, and testing without replacing the dedicated NestJS, Prisma, or database-provider skills.

Use the installed project versions as the source of truth. Keep API DTOs separate from database-generated types, keep transactions aligned with business atomicity, and review real migration SQL and provider behavior before claiming database changes are safe.
