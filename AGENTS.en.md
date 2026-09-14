# AGENTS.md - English fallback

Chinese is the canonical language for repository documentation and workflow labels. Preserve third-party Skill IDs, package names, APIs, and code identifiers in their original form.

Keep third-party Skills in the Registry instead of vendoring source code. Use Skill-folder Git tree hashes for reviewed upstream revisions. Never auto-merge upstream updates and never commit credentials.

Run `npm run validate` before completion.

## Feature development

For feature work, bug fixes, or refactoring, follow `skills/adui-feature-dev/SKILL.md`. Use `adui-stack-router` first when the project stack is unclear.

## Specialized local skills

Use `adui-viteplus` only for actual Vite+ projects. Use `adui-nestjs-prisma` only when both NestJS and Prisma are present.
