import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parseWeeklyRanking,
  buildChineseBlock,
  buildEnglishBlock,
  replaceRankingBlock,
  replaceSkillsBadge,
} from '../update-ranking-display.mjs';

const REPORT = `# skills.sh 每周分类排行与 Pack 候选

- 日期：2026-09-14
- Pack：https://www.skills.sh/p/DCh7RQegkqCXcXn8
- Pack 当前可读取 Skill 数：10
- 本次新增候选：1
- 本地累计选择记录：1

## 分类排行

### Vue

查询：\`vue\`

| 排名 | Skill | Source | Installs | Stars | Audit | 结果 |
| ---: | --- | --- | ---: | ---: | --- | --- |
| 1 | [vue-best-practices](https://skills.sh/vuejs-ai/skills/vue-best-practices) | \`vuejs-ai/skills\` | 12,345 | 678 | pass | 本周候选 |
| 2 | [vue](https://skills.sh/antfu/skills/vue) | \`antfu/skills\` | 10,000 | 500 | pass | already-selected |

### 3D / GPU

查询：\`threejs cesium webgl webgpu\`

| 排名 | Skill | Source | Installs | Stars | Audit | 结果 |
| ---: | --- | --- | ---: | ---: | --- | --- |
| 1 | [webgl](https://skills.sh/example/skills/webgl) | \`example/skills\` | 9,999 | 321 | warn |  |
`;

test('解析每个分类第 1 名', () => {
  const data = parseWeeklyRanking(REPORT);
  assert.equal(data.date, '2026-09-14');
  assert.equal(data.packUrl, 'https://www.skills.sh/p/DCh7RQegkqCXcXn8');
  assert.equal(data.rows.length, 2);
  assert.equal(data.rows[0].category, 'Vue');
  assert.equal(data.rows[0].skill, 'vue-best-practices');
  assert.equal(data.rows[0].installs, '12,345');
  assert.equal(data.rows[1].category, '3D / GPU');
});

test('中文 README 区块包含完整排行入口与 Pack', () => {
  const block = buildChineseBlock(parseWeeklyRanking(REPORT));
  assert.match(block, /skills\.sh 本周分类排行榜/);
  assert.match(block, /reports\/skills-sh\/latest\.md/);
  assert.match(block, /DCh7RQegkqCXcXn8/);
  assert.match(block, /vue-best-practices/);
});

test('英文 README 区块包含分类榜', () => {
  const block = buildEnglishBlock(parseWeeklyRanking(REPORT));
  assert.match(block, /Weekly Category Leaderboard/);
  assert.match(block, /vue-best-practices/);
});

test('排行榜区块可重复更新且不重复插入', () => {
  const data = parseWeeklyRanking(REPORT);
  const block = buildChineseBlock(data);
  const initial = '# Demo\n\n## 发布与 skills.sh Pack\n';
  const once = replaceRankingBlock(initial, block);
  const twice = replaceRankingBlock(once, block);
  assert.equal((twice.match(/skills-sh-weekly-ranking:start/g) || []).length, 1);
  assert.equal((twice.match(/skills-sh-weekly-ranking:end/g) || []).length, 1);
});

test('skills.sh Badge 指向用户自己的 Pack 地址并保持幂等', () => {
  const initial = '[![skills.sh](https://skills.sh/b/adui-studio/adui-skills)](https://skills.sh/adui-studio/adui-skills)\n';
  const packUrl = 'https://www.skills.sh/p/DCh7RQegkqCXcXn8';
  const once = replaceSkillsBadge(initial, packUrl);
  const twice = replaceSkillsBadge(once, packUrl);
  assert.match(twice, /ADui Skills Pack/);
  assert.match(twice, /https:\/\/www\.skills\.sh\/p\/DCh7RQegkqCXcXn8/);
  assert.doesNotMatch(twice, /skills\.sh\/adui-studio\/adui-skills/);
  assert.equal((twice.match(/ADui Skills Pack/g) || []).length, 1);
});
