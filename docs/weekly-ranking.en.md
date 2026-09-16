# Daily skills.sh Ranking and Append-only Pack Curation

[简体中文](./weekly-ranking.md) | [English](./weekly-ranking.en.md)

## Goal

Each day, query skills.sh by category, rank results by install count, apply lightweight quality gates, and select one new strong candidate per category while keeping an append-only selection history.

Target Pack:

```text
https://www.skills.sh/p/DCh7RQegkqCXcXn8
```

Install:

```bash
npx skills add https://skills.sh/p/DCh7RQegkqCXcXn8
```

## Leaderboard publishing

The leaderboard is published as visible project content instead of living only in Actions logs:

- README: current #1 Skill in every category;
- GitHub Wiki: `Weekly-Skills-Ranking-Latest` with Top 10 per category;
- repository snapshot: `reports/skills-sh/latest.md`;
- historical snapshots: `reports/skills-sh/YYYY-MM-DD.md`.

Latest full leaderboard:

```text
https://github.com/adui-studio/adui-skills/wiki/Weekly-Skills-Ranking-Latest
```

> The existing `Weekly-Skills-Ranking-*` Wiki slugs are intentionally retained for backward compatibility with external links; the published content and refresh cadence are now daily.

The daily Workflow refreshes the Wiki page directly with `WIKI_TOKEN`; README and repository report snapshots are also committed directly to `main`, so public ranking updates do not depend on the Pack candidate Pull Request being merged.

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
publish README #1 summary + Wiki Top 10 leaderboard
      ↓
exclude skills already in the Pack
      ↓
exclude previously selected skills
      ↓
pick the best candidate per category
      ↓
append to pack/skills-sh-pack.json
      ↓
open a separate Pull Request for candidate changes
```

Workflow:

```text
.github/workflows/daily-ranking.yml
```

It runs every day at 08:00 Asia/Shanghai and can also be triggered manually.

## Categories

Categories are configured in `config/skills-sh-ranking.json`. The current set has 14 categories: Frontend, React, Vue, Next.js, Design/UI, UX, mobile, agent workflows, databases, testing, backend/API, Git/delivery, 3D/GPU, and tooling.

Frontend and React are ranked separately so general frontend results are not dominated by React. UX is also ranked separately from visual Design/UI.

## Default quality gates

```text
Search results        : 20
Report Top N          : 10
Minimum installs      : 5000
Minimum GitHub stars  : 100
Blocked risk levels   : HIGH / CRITICAL
Candidate per category: 1
Max additions per run : 14
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

Candidate changes still go through manual Pull Request review and are never auto-merged.

## Pack write limitation

The public skills.sh documentation currently exposes read APIs for discovery, leaderboard/search, detail, and audit use cases, but does not expose a documented stable API for mutating an existing Pack's membership. Pack management is done through the signed-in web UI.

Therefore the automation boundary is currently:

```text
automated leaderboard publishing + discovery + gates + selection + PR
                                                        ↓
                                       confirm additions in the Pack UI
```

This avoids relying on undocumented internal APIs, browser cookies, or stored login sessions. If skills.sh adds an official Pack mutation API later, a sync adapter can be added without changing the ranking and selection model.
