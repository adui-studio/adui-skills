# Weekly skills.sh Ranking and Append-only Pack Curation

[简体中文](./weekly-ranking.md) | [English](./weekly-ranking.en.md)

## Goal

Each week, query skills.sh by category, rank results by install count, apply lightweight quality gates, and select one new strong candidate per category while keeping an append-only selection history.

Target Pack:

```text
https://www.skills.sh/p/DCh7RQegkqCXcXn8
```

Install:

```bash
npx skills add https://skills.sh/p/DCh7RQegkqCXcXn8
```

## Flow

```text
skills.sh category search
      ↓
rank by installs
      ↓
GitHub Stars gate
      ↓
best-effort skills.sh audit check
      ↓
exclude skills already in the Pack
      ↓
exclude previously selected skills
      ↓
pick the best candidate per category
      ↓
append to pack/skills-sh-pack.json
      ↓
write a weekly report
      ↓
manual Pull Request review
```

Workflow:

```text
.github/workflows/weekly-ranking.yml
```

It runs every Monday at 09:37 Asia/Shanghai and can also be triggered manually.

## Categories

Categories are configured in `config/skills-sh-ranking.json`. The default set covers frontend/React, Vue, Next.js, Design/UI, mobile, agent workflows, databases, testing, backend/API, Git/delivery, 3D/GPU, and tooling.

## Default quality gates

```text
Search results       : 20
Report Top N         : 5
Minimum installs     : 5000
Minimum GitHub stars : 100
Blocked risk levels  : HIGH / CRITICAL
Candidate per category: 1
```

Audit checks are best-effort. Explicit `fail`, `HIGH`, or `CRITICAL` findings block a candidate. If the audit endpoint is unavailable, the report uses `unknown` rather than inventing a safe result.

## Append-only policy

State is stored in:

```text
pack/skills-sh-pack.json
```

The file must stay in `append-only` mode. The script never removes previous selections, never replaces an existing selection, skips names already present in the live Pack, and prevents the same skill from being selected by multiple categories in a single run.

If the Pack well-known index cannot be read, `--write` fails closed and leaves the state unchanged.

## Local commands

Check and generate a temporary report:

```bash
npm run pack:ranking
```

Write append-only selection state:

```bash
npm run pack:ranking:apply
```

The scheduled workflow is the preferred path because it opens a Pull Request for review.

## Pack write limitation

The public skills.sh documentation currently exposes read APIs for discovery, leaderboard/search, detail, and audit use cases, but does not expose a documented stable API for mutating an existing Pack's membership. Pack management is done through the signed-in web UI.

Therefore the automation boundary is currently:

```text
automated discovery + ranking + gates + selection + PR
                                      ↓
                     confirm additions in the Pack UI
```

This avoids relying on undocumented internal APIs, browser cookies, or stored login sessions. If skills.sh adds an official Pack mutation API later, a sync adapter can be added without changing the ranking and selection model.
