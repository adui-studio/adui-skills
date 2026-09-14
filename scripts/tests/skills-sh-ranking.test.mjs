import test from 'node:test';
import assert from 'node:assert/strict';
import {
  appendSelections,
  evaluateCandidate,
  normalizeSearchSkills,
  parsePackIndex,
  runRanking,
  skillKey,
  summarizeAudit,
} from '../skills-sh-ranking.mjs';

test('搜索结果按 installs 降序并去重', () => {
  const result = normalizeSearchSkills({
    skills: [
      { id: 'a/repo/one', source: 'a/repo', name: 'one', installs: 10 },
      { id: 'b/repo/two', source: 'b/repo', name: 'two', installs: 30 },
      { id: 'a/repo/one', source: 'a/repo', name: 'one', installs: 99 },
    ],
  });

  assert.equal(result.length, 2);
  assert.equal(result[0].name, 'two');
  assert.equal(result[1].name, 'one');
});

test('Pack index 只读取已有 Skill 名称', () => {
  const names = parsePackIndex({ skills: [{ name: 'one' }, { name: 'Two' }] });
  assert.deepEqual([...names].sort(), ['one', 'two']);
});

test('安全审计出现 fail 或 HIGH/CRITICAL 时阻止候选', () => {
  const result = summarizeAudit({
    audits: [
      { provider: 'A', status: 'pass', riskLevel: 'LOW' },
      { provider: 'B', status: 'warn', riskLevel: 'HIGH' },
    ],
  });
  assert.equal(result.blocked, true);
  assert.equal(result.status, 'blocked');
});

test('Pack 已存在和历史已选 Skill 都不会再次选择', () => {
  const base = { source: 'a/repo', name: 'one', installs: 10000, repoStars: 500, audit: { blocked: false } };
  assert.equal(
    evaluateCandidate(base, { packSkillNames: new Set(['one']), selectedKeys: new Set(), selectedNames: new Set() }).reason,
    'already-in-pack',
  );
  assert.equal(
    evaluateCandidate(base, { packSkillNames: new Set(), selectedKeys: new Set([skillKey(base)]), selectedNames: new Set() }).reason,
    'already-selected',
  );
});

test('append-only 只追加，不删除历史选择', () => {
  const state = {
    version: 1,
    mode: 'append-only',
    selected: [{ source: 'a/repo', name: 'one' }],
  };
  const next = appendSelections(state, [
    { source: 'a/repo', name: 'one' },
    { source: 'b/repo', name: 'two' },
  ]);
  assert.deepEqual(next.selected.map((item) => item.name), ['one', 'two']);
});

test('一次运行同一 Skill 不会被多个分类重复追加', async () => {
  const config = {
    packUrl: 'https://skills.sh/p/test',
    searchLimit: 20,
    minInstalls: 100,
    minRepoStars: 100,
    maxNewPerRun: 10,
    blockedRiskLevels: ['HIGH', 'CRITICAL'],
    categories: [
      { id: 'a', name: 'A', query: 'alpha' },
      { id: 'b', name: 'B', query: 'beta' },
    ],
  };
  const state = { version: 1, packUrl: config.packUrl, mode: 'append-only', selected: [] };

  const fetcher = async (url) => {
    if (url.includes('/.well-known/agent-skills/index.json')) {
      return { skills: [{ name: 'existing' }] };
    }
    if (url.includes('/api/search?')) {
      return { skills: [{ id: 'x/repo/best', source: 'x/repo', name: 'best', installs: 5000 }] };
    }
    if (url.includes('api.github.com/repos/x/repo')) {
      return { stargazers_count: 500 };
    }
    if (url.includes('/api/v1/skills/audit/')) {
      return { audits: [{ provider: 'Audit', status: 'pass', riskLevel: 'LOW' }] };
    }
    throw new Error(`unexpected url: ${url}`);
  };

  const result = await runRanking({ config, state, now: new Date('2026-09-14T00:00:00Z'), fetcher });
  assert.equal(result.selections.length, 1);
  assert.equal(result.nextState.selected.length, 1);
  assert.equal(result.selections[0].name, 'best');
});
