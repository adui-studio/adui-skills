# Release Process

[简体中文](./releasing.md) | [English](./releasing.en.md)

## Principles

GitHub `adui-studio/adui-skills` is the single source of truth. CNB mirrors `main` and version tags. Chinese is canonical for docs, workflows and release notes, with English fallback files. Releases must come from merged `main` commits, and a complete third-party Skill Folder Hash lock is required. `v0.2.0` is a Public Preview / pre-release.

## Preflight

```bash
npm run validate
npm test
npm run release:check -- --tag v0.2.0
```

If the reviewed lock baseline is not initialized yet, establish it first and review the resulting registry/lock diff before releasing.

## Tag and release

```bash
git switch main
git pull --ff-only origin main
git tag -a v0.2.0 -m "ADui Skills Pack v0.2.0 Public Preview"
git push origin v0.2.0
```

Pushing the tag triggers both the GitHub release workflow and the GitHub-to-CNB tag synchronization workflow. The release workflow deliberately does not create tags itself.

## skills.sh Pack

Pack creation currently requires signing in to skills.sh with Vercel. After the public release, open `https://skills.sh/packs/create`, connect GitHub, import `adui-studio/adui-skills`, select the seven `adui-*` Skills, create the pack, and then add the real `https://skills.sh/p/<pack-id>` URL to the README in a follow-up patch. Do not invent a pack ID before it exists.
## Repairing missing Lock entries

If `release:check` reports a small number of enabled Skills without Folder Hash entries, never fabricate hashes. First verify the Registry `source` / `skillPath` still exists on the upstream default branch, then run:

```bash
npm run updates:apply -- --only <skill-id-1>,<skill-id-2> --strict
```

Run the release check again. If upstream removed or renamed a Skill, update the Registry / Profile first and regenerate the corresponding Lock entries.

