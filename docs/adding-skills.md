# Adding Skills

## Third-party skills

Do not copy third-party skill source code into `skills/`.

Add the skill metadata to:

`registry/skills.json`

Then add its skill ID to the appropriate profile.

## ADui skills

ADui-maintained skills belong under:

`skills/<skill-name>/`

Each skill must contain:

- `SKILL.md`
- `agents/openai.yaml`

Additional references, scripts and assets may be added when required.