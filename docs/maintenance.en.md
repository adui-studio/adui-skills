# ADui Skills Pack Maintenance

[简体中文](./maintenance.md) | [English](./maintenance.en.md)

Third-party Skill source code is not vendored. The pack tracks `source`, `skillPath`, `skillFolderHash`, and `repoCommit`.

`skillFolderHash` is the Git tree SHA of the Skill directory and is the primary change detector. Repository commits that do not change the Skill folder do not create lock noise.

Commands:

```bash
npm run updates:check
npm run updates:apply
npm run lock:init
node scripts/check-updates.mjs --only vue-best-practices,unocss
```

By default, a single unavailable upstream is a warning and does not fail the whole run. Use `--strict` when every source must succeed.

Moved Skill paths can be auto-resolved by scanning `SKILL.md` frontmatter names. Weekly PRs must be reviewed manually and are never auto-merged.
