# NestJS + Prisma Architecture

English fallback for `architecture.md`.

Keep NestJS responsible for modules, dependency injection, transport boundaries, and application orchestration. Keep Prisma responsible for typed persistence, schema, and migrations. Reuse the project's existing repository pattern; do not add an abstraction layer without a concrete benefit.

API DTOs and Prisma-generated database types should not be treated as the same contract by default.
