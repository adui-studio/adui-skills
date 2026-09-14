# Adding Skills

[简体中文](./adding-skills.md) | [English](./adding-skills.en.md)

For third-party Skills, add metadata to `registry/skills.json`, reference the ID from the appropriate Profile, validate, then initialize its folder hash with `npm run updates:apply`. Do not vendor third-party Skill source code.

ADui-maintained Skills belong under `skills/<skill-name>/` and must include `SKILL.md` and `agents/openai.yaml`. Keep the entrypoint concise and move detailed guidance to `references/`.
