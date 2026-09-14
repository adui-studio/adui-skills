# ADui Skills Pack Maintenance Guide

English | [简体中文](./maintenance.md)

## 1. Maintenance Model

GitHub is the single source of truth for ADui Skills Pack:

```text
GitHub main
    ↓
Registry / Profiles / ADui Skills
    ↓
Weekly Skills Update
    ↓
skills.lock.json
    ↓
Pull Request
    ↓
Human review
    ↓
Merge
    ↓
Synchronize to CNB
```

CNB is a China mirror only. It does not independently maintain the Registry, Profiles, or lock file.

## 2. Purpose of `skills.lock.json`

`registry/skills.json` answers: "Which third-party Skills does ADui curate?"

`registry/skills.lock.json` answers: "Which upstream Git commit was most recently reviewed by ADui?"

Each lock entry records:

- `source`
- `upstreamPath`
- `commit`
- `committedAt`
- `checkedAt`
- `url`

Do not manually invent commit SHAs.

## 3. Initial Lock Baseline

### Recommended: GitHub Actions

Open:

```text
GitHub → Actions → Weekly Skills Update → Run workflow
```

On the first run, an empty lock means every enabled third-party Skill is classified as `Baseline`. The workflow creates a pull request containing the initial pinned revisions.

Review the entire baseline PR before merging it.

### Local initialization

The updater looks for GitHub authentication in this order:

1. `GITHUB_TOKEN`
2. `GH_TOKEN`
3. `gh auth token`

If GitHub CLI is already authenticated:

```bash
gh auth login
npm run lock:init
```

PowerShell example:

```powershell
$env:GITHUB_TOKEN = gh auth token
npm run lock:init
Remove-Item Env:GITHUB_TOKEN
```

The generated review report is written to:

```text
tmp/skill-updates.md
```

## 4. Manual Upstream Checks

Check without modifying the lock:

```bash
npm run updates:check
```

Check and refresh the local lock:

```bash
npm run updates:apply
```

Check a subset:

```bash
node scripts/check-updates.mjs --only vue-best-practices,unocss
```

Machine-readable output:

```bash
node scripts/check-updates.mjs --only vue-best-practices --json
```

## 5. Weekly Automation

`.github/workflows/weekly-update.yml` runs at:

```text
Monday 09:17
Asia/Shanghai
```

The non-round minute reduces the chance of queue congestion around common schedule boundaries.

The workflow does not vendor third-party Skill source code. It only:

1. reads `registry/skills.json`
2. queries the latest Git commit affecting each `upstreamPath`
3. compares it with `skills.lock.json`
4. refreshes the lock
5. generates compare links and a review checklist
6. creates or updates the `chore/weekly-skills-update` pull request

No upstream changes means no PR.

## 6. GitHub Repository Setting

To allow the workflow to create pull requests, verify:

```text
Settings
→ Actions
→ General
→ Workflow permissions
→ Allow GitHub Actions to create and approve pull requests
```

The workflow itself already requests:

```yaml
permissions:
  contents: write
  pull-requests: write
```

Organization-level policies may still override the repository setting.

## 7. Review the Weekly PR

At minimum, inspect:

- changes to `SKILL.md` triggers and scope
- new or modified executable scripts
- destructive file operations
- Git push or repository mutation instructions
- external downloads and network calls
- credential, token, `.env`, or SSH key access
- privilege escalation or administrator requirements
- framework/version guidance changes
- whether the Skill still belongs in its assigned ADui Profile and Tier

The PR only updates `skills.lock.json`; third-party source remains upstream.

## 8. Add a Third-party Skill

1. Add metadata to `registry/skills.json`.
2. Use `owner/repository` for `source`.
3. Set `upstreamPath` to the exact Skill directory; use `.` for a repository-root Skill.
4. Add the Skill to the appropriate Profile.
5. Run:

```bash
npm run validate
```

6. Initialize its lock entry:

```bash
node scripts/check-updates.mjs --only <skill-id> --write
```

7. Review and commit.

## 9. Remove a Third-party Skill

After removing it from Registry and Profiles, run:

```bash
npm run updates:apply
```

`--prune` removes disabled or deleted Skills from the lock.

## 10. Security Principle

Weekly updates create pull requests only; they never auto-merge.

A changed Git commit means only that the upstream changed. It does not mean the change is safe. Automation detects change; maintainers approve change.
