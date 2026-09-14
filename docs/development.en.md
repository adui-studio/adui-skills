# ADui Feature Development

[简体中文](./development.md) | [English](./development.en.md)

This is the English fallback for `adui-feature-dev`. The canonical documentation is Chinese.

Recommended flow: `adui-stack-router` → minimal profiles → `adui-feature-dev` → stack-specific skills.

Delivery order:

1. Requirements and constraints.
2. Assumptions and risks.
3. Solution and code.
4. Changed locations and reasons.
5. Executed tests and verification.
6. Unresolved questions.

Use minimal changes, follow existing repository conventions, never claim unexecuted validation, and do not commit/push/merge/release unless explicitly requested.

## Specialized routing

Add `adui-viteplus` for real Vite+ projects. Add `adui-nestjs-prisma` only when both NestJS and Prisma are present.
