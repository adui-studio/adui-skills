# AGENTS.md

## Project

ADui Skills Pack is a curated and maintainable AI coding skill collection.

GitHub is the canonical repository.

CNB is a synchronized mirror and must not be treated as an independent source of truth.

## Principles

1. Understand before modifying.
2. Prefer minimal changes.
3. Do not vendor third-party skills unless explicitly required.
4. Keep third-party metadata in `registry/`.
5. Keep ADui-maintained skills in `skills/`.
6. Keep reusable technology combinations in `profiles/`.
7. Never automatically merge upstream skill changes.
8. Validate changes before claiming completion.
9. Avoid destructive Git operations unless explicitly requested.
10. Keep skills concise and progressively load detailed references.

## Skill Changes

Every ADui-maintained skill must contain:

- `SKILL.md`
- `agents/openai.yaml`

Use `references/` for detailed technical documentation.

Use `scripts/` only when deterministic automation materially improves reliability.

## Third-party Skills

Third-party skills must be tracked through:

- source repository
- skill path
- category
- tier
- reviewed commit

Do not silently replace upstream sources.

## Verification

Before completing repository changes:

1. validate JSON
2. validate required skill files
3. inspect Git diff
4. ensure no unexpected destructive instructions were introduced