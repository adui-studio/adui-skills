#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const root = process.cwd();
const registryPath = path.join(root, 'registry', 'skills.json');
const lockPath = path.join(root, 'registry', 'skills.lock.json');

const { values } = parseArgs({
  options: {
    write: { type: 'boolean', default: false },
    prune: { type: 'boolean', default: false },
    report: { type: 'string' },
    only: { type: 'string' },
    fixture: { type: 'string' },
    json: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
  allowPositionals: false,
});

if (values.help) {
  console.log(`ADui Skills Pack upstream checker

Usage:
  node scripts/check-updates.mjs [options]

Options:
  --write            Write refreshed data to registry/skills.lock.json
  --prune            Remove stale lock entries that are not enabled in registry
  --report <path>    Write a Markdown update report
  --only <ids>       Check a comma-separated subset of skill IDs
  --fixture <path>   Use fixture JSON instead of the GitHub API (testing only)
  --json             Print machine-readable JSON summary
  -h, --help         Show this help

Authentication:
  The script uses GITHUB_TOKEN or GH_TOKEN when available.
  If neither is set, it attempts to read a token from 'gh auth token'.
`);
  process.exit(0);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function nowIso() {
  return new Date().toISOString();
}

function firstLine(message = '') {
  return String(message).split(/\r?\n/, 1)[0].trim();
}

function resolveToken() {
  const fromEnv = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (fromEnv) {
    return fromEnv.trim();
  }

  try {
    const token = execFileSync('gh', ['auth', 'token'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    return token || null;
  } catch {
    return null;
  }
}

function loadFixture(filePath) {
  if (!filePath) {
    return null;
  }

  const absolute = path.resolve(root, filePath);
  const fixture = readJson(absolute);

  if (!fixture || typeof fixture !== 'object' || Array.isArray(fixture)) {
    throw new Error(`Fixture must contain an object: ${absolute}`);
  }

  return fixture;
}

function normalizeLatest(skillId, item) {
  if (!item || typeof item !== 'object') {
    throw new Error(`${skillId}: fixture/API result is not an object.`);
  }

  const sha = item.sha;
  const committedAt = item.committedAt ?? item.commit?.author?.date ?? item.commit?.committer?.date ?? null;
  const url = item.url ?? item.html_url ?? null;
  const message = item.message ?? item.commit?.message ?? '';

  if (typeof sha !== 'string' || !/^[a-f0-9]{40,64}$/i.test(sha)) {
    throw new Error(`${skillId}: invalid commit SHA returned by upstream.`);
  }

  return {
    sha,
    committedAt,
    url,
    message: firstLine(message),
  };
}

async function fetchLatestCommit(skill, token, fixture) {
  if (fixture) {
    if (!(skill.id in fixture)) {
      throw new Error(`${skill.id}: fixture does not contain an entry.`);
    }
    return normalizeLatest(skill.id, fixture[skill.id]);
  }

  const [owner, repo] = skill.source.split('/');
  const url = new URL(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits`);
  url.searchParams.set('per_page', '1');

  if (skill.upstreamPath && skill.upstreamPath !== '.') {
    url.searchParams.set('path', skill.upstreamPath);
  }

  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'adui-skills-updater',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const body = await response.text();
    const remaining = response.headers.get('x-ratelimit-remaining');
    const suffix = remaining === '0' ? ' GitHub API rate limit exhausted.' : '';
    throw new Error(`${skill.id}: GitHub API ${response.status} ${response.statusText}.${suffix} ${body.slice(0, 300)}`);
  }

  const payload = await response.json();

  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error(`${skill.id}: no commits found for ${skill.source}:${skill.upstreamPath}.`);
  }

  return normalizeLatest(skill.id, payload[0]);
}

function compareUrl(source, oldSha, newSha) {
  if (!oldSha || !newSha || oldSha === newSha) {
    return null;
  }

  return `https://github.com/${source}/compare/${oldSha}...${newSha}`;
}

function markdownReport(summary) {
  const lines = [
    '# ADui Skills Pack Upstream Update',
    '',
    `Generated: ${summary.checkedAt}`,
    '',
    '## Summary',
    '',
    `- Checked: ${summary.checked}`,
    `- Updated: ${summary.updated.length}`,
    `- Baseline: ${summary.baseline.length}`,
    `- Unchanged: ${summary.unchanged.length}`,
    `- Removed from lock: ${summary.removed.length}`,
    '',
  ];

  if (summary.updated.length > 0) {
    lines.push('## Updated Skills', '');
    lines.push('| Skill | Source | Old | New | Upstream change |');
    lines.push('|---|---|---|---|---|');

    for (const item of summary.updated) {
      const compare = compareUrl(item.source, item.oldCommit, item.newCommit);
      const changeLink = compare ? `[compare](${compare})` : '-';
      lines.push(`| \`${item.id}\` | \`${item.source}\` | \`${item.oldCommit.slice(0, 7)}\` | \`${item.newCommit.slice(0, 7)}\` | ${changeLink} |`);
    }

    lines.push('');

    for (const item of summary.updated) {
      lines.push(`### ${item.id}`, '');
      lines.push(`- Source: \`${item.source}\``);
      lines.push(`- Path: \`${item.upstreamPath}\``);
      lines.push(`- Previous: \`${item.oldCommit}\``);
      lines.push(`- Latest: \`${item.newCommit}\``);
      if (item.committedAt) lines.push(`- Upstream commit time: ${item.committedAt}`);
      if (item.message) lines.push(`- Commit: ${item.message.replace(/\|/g, '\\|')}`);
      const compare = compareUrl(item.source, item.oldCommit, item.newCommit);
      if (compare) lines.push(`- Compare: ${compare}`);
      lines.push('');
    }
  }

  if (summary.baseline.length > 0) {
    lines.push('## Baseline Entries', '');
    lines.push('These skills had no previous lock entry. Review the pinned upstream revision before merging the baseline PR.', '');
    lines.push('| Skill | Source | Commit |');
    lines.push('|---|---|---|');
    for (const item of summary.baseline) {
      lines.push(`| \`${item.id}\` | \`${item.source}\` | \`${item.newCommit.slice(0, 12)}\` |`);
    }
    lines.push('');
  }

  if (summary.removed.length > 0) {
    lines.push('## Removed Lock Entries', '');
    for (const item of summary.removed) {
      lines.push(`- \`${item.id}\``);
    }
    lines.push('');
  }

  lines.push(
    '## Review Checklist',
    '',
    '- Review every changed upstream `SKILL.md` before merging.',
    '- Inspect added or modified `scripts/` for shell execution, file deletion, network access, credential access, Git push, privilege escalation, and downloaded executables.',
    '- Review changes to `references/` when they alter technical guidance or supported versions.',
    '- Confirm the Skill still matches the ADui profile and tier assigned in `registry/skills.json`.',
    '- Do not auto-merge this PR.',
    '',
    '> This report tracks upstream revisions only. It does not copy third-party Skill source code into ADui Skills Pack.',
    '',
  );

  return `${lines.join('\n')}\n`;
}

function writeGithubOutputs(summary, reportPath) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;

  const changed = summary.updated.length + summary.baseline.length + summary.removed.length > 0;
  const rows = [
    `changed=${changed ? 'true' : 'false'}`,
    `checked=${summary.checked}`,
    `updated_count=${summary.updated.length}`,
    `baseline_count=${summary.baseline.length}`,
    `removed_count=${summary.removed.length}`,
  ];

  if (reportPath) {
    rows.push(`report_path=${reportPath}`);
  }

  fs.appendFileSync(outputPath, `${rows.join('\n')}\n`, 'utf8');
}

if (!fs.existsSync(registryPath)) {
  console.error('Missing registry/skills.json');
  process.exit(1);
}

const registry = readJson(registryPath);
const currentLock = fs.existsSync(lockPath)
  ? readJson(lockPath)
  : { version: 1, generatedAt: null, skills: {} };

if (!registry || !Array.isArray(registry.skills)) {
  console.error('registry/skills.json is invalid.');
  process.exit(1);
}

const onlyIds = values.only
  ? new Set(values.only.split(',').map((value) => value.trim()).filter(Boolean))
  : null;

const skills = registry.skills.filter((skill) => {
  if (!skill.enabled) return false;
  if (onlyIds && !onlyIds.has(skill.id)) return false;
  return true;
});

if (onlyIds) {
  const missing = [...onlyIds].filter((id) => !registry.skills.some((skill) => skill.id === id));
  if (missing.length > 0) {
    console.error(`Unknown skill IDs passed to --only: ${missing.join(', ')}`);
    process.exit(1);
  }
}

const fixture = loadFixture(values.fixture);
const token = fixture ? null : resolveToken();

if (!fixture && !token && skills.length > 50) {
  console.error([
    `Checking ${skills.length} Skills requires authenticated GitHub API access.`,
    'Set GITHUB_TOKEN or GH_TOKEN, or authenticate GitHub CLI with: gh auth login',
  ].join('\n'));
  process.exit(1);
}

const checkTime = nowIso();
const nextLock = {
  version: 1,
  generatedAt: currentLock.generatedAt ?? null,
  checkedAt: currentLock.checkedAt ?? null,
  skills: { ...(currentLock.skills || {}) },
};

const summary = {
  checkedAt: checkTime,
  checked: skills.length,
  updated: [],
  baseline: [],
  unchanged: [],
  removed: [],
};

const failures = [];

for (const skill of skills) {
  if (!skill.upstreamPath) {
    failures.push(`${skill.id}: upstreamPath is unresolved.`);
    continue;
  }

  try {
    const latest = await fetchLatestCommit(skill, token, fixture);
    const previous = currentLock.skills?.[skill.id] ?? null;

    const lockEntry = {
      source: skill.source,
      upstreamPath: skill.upstreamPath,
      commit: latest.sha,
      committedAt: latest.committedAt,
      checkedAt: checkTime,
      url: latest.url,
    };

    if (!previous?.commit) {
      nextLock.skills[skill.id] = lockEntry;
      summary.baseline.push({
        id: skill.id,
        source: skill.source,
        upstreamPath: skill.upstreamPath,
        oldCommit: null,
        newCommit: latest.sha,
        committedAt: latest.committedAt,
        message: latest.message,
      });
    } else if (previous.commit !== latest.sha || previous.source !== skill.source || previous.upstreamPath !== skill.upstreamPath) {
      nextLock.skills[skill.id] = lockEntry;
      summary.updated.push({
        id: skill.id,
        source: skill.source,
        upstreamPath: skill.upstreamPath,
        oldCommit: previous.commit,
        newCommit: latest.sha,
        committedAt: latest.committedAt,
        message: latest.message,
      });
    } else {
      summary.unchanged.push({ id: skill.id, commit: latest.sha });
    }
  } catch (error) {
    failures.push(error instanceof Error ? error.message : String(error));
  }
}

if (values.prune) {
  const activeIds = new Set(registry.skills.filter((skill) => skill.enabled).map((skill) => skill.id));
  for (const id of Object.keys(nextLock.skills)) {
    if (!activeIds.has(id)) {
      summary.removed.push({ id, entry: nextLock.skills[id] });
      delete nextLock.skills[id];
    }
  }
}

if (failures.length > 0) {
  console.error('Upstream check failed:');
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  console.error('\nNo lock file was written.');
  process.exit(1);
}

let reportPath = null;
if (values.report) {
  reportPath = path.resolve(root, values.report);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, markdownReport(summary), 'utf8');
}

const hasChanges = summary.updated.length + summary.baseline.length + summary.removed.length > 0;

if (hasChanges) {
  if (!nextLock.generatedAt) nextLock.generatedAt = checkTime;
  nextLock.checkedAt = checkTime;
}

if (values.write && hasChanges) {
  writeJson(lockPath, nextLock);
}

writeGithubOutputs(summary, reportPath);

if (values.json) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log('ADui Skills Pack upstream check');
  console.log('-------------------------------');
  console.log(`Checked   : ${summary.checked}`);
  console.log(`Updated   : ${summary.updated.length}`);
  console.log(`Baseline  : ${summary.baseline.length}`);
  console.log(`Unchanged : ${summary.unchanged.length}`);
  console.log(`Removed   : ${summary.removed.length}`);
  console.log(`Lock write: ${values.write ? 'yes' : 'no'}`);
  if (reportPath) console.log(`Report    : ${reportPath}`);
}
