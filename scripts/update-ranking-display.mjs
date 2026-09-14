import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const START_MARKER = '<!-- skills-sh-weekly-ranking:start -->';
const END_MARKER = '<!-- skills-sh-weekly-ranking:end -->';

function argValue(args, name, fallback = null) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

export function parseWeeklyRanking(report) {
  const dateMatch = report.match(/^- 日期：(.+)$/m);
  const packMatch = report.match(/^- Pack：(.+)$/m);
  const categoryPattern = /^### (.+)\n\n查询：`[^`]+`\n\n\| 排名 \| Skill \| Source \| Installs \| Stars \| Audit \| 结果 \|\n\|[^\n]+\|\n([^\n]+)/gm;
  const rows = [];

  for (const match of report.matchAll(categoryPattern)) {
    const category = match[1].trim();
    const firstRow = match[2].trim();
    const cells = firstRow.split('|').slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 7) continue;

    const skillMatch = cells[1].match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    rows.push({
      category,
      rank: cells[0],
      skill: skillMatch ? skillMatch[1] : cells[1],
      url: skillMatch ? skillMatch[2] : '',
      source: cells[2].replace(/^`|`$/g, ''),
      installs: cells[3],
      stars: cells[4],
      audit: cells[5],
      result: cells[6],
    });
  }

  return {
    date: dateMatch?.[1]?.trim() || '',
    packUrl: packMatch?.[1]?.trim() || '',
    rows,
  };
}

function link(label, url) {
  return url ? `[${label}](${url})` : label;
}

export function buildChineseBlock(data) {
  const lines = [
    START_MARKER,
    '## skills.sh 本周分类排行榜',
    '',
    `> 每周自动更新。最近一次排行：**${data.date || '未生成'}** · [查看完整 Top 5 排行](./reports/skills-sh/latest.md) · [ADui Skills Pack](${data.packUrl})`,
    '',
    '| 分类 | 第 1 名 | Source | Installs | Stars | Audit |',
    '| --- | --- | --- | ---: | ---: | --- |',
  ];

  for (const row of data.rows) {
    lines.push(`| ${row.category} | ${link(row.skill, row.url)} | \`${row.source}\` | ${row.installs} | ${row.stars} | ${row.audit} |`);
  }

  if (data.rows.length === 0) {
    lines.push('| - | 暂无排行数据 | - | - | - | - |');
  }

  lines.push('', '> 排行展示与 Pack 候选选择是两件事：排行榜每周刷新；候选仍遵循 append-only，不删除、不替换已有 Skill。', END_MARKER);
  return lines.join('\n');
}

export function buildEnglishBlock(data) {
  const lines = [
    START_MARKER,
    '## skills.sh Weekly Category Leaderboard',
    '',
    `> Updated weekly. Latest ranking: **${data.date || 'not generated'}** · [View full Top 5 ranking](./reports/skills-sh/latest.md) · [ADui Skills Pack](${data.packUrl})`,
    '',
    '| Category | #1 Skill | Source | Installs | Stars | Audit |',
    '| --- | --- | --- | ---: | ---: | --- |',
  ];

  for (const row of data.rows) {
    lines.push(`| ${row.category} | ${link(row.skill, row.url)} | \`${row.source}\` | ${row.installs} | ${row.stars} | ${row.audit} |`);
  }

  if (data.rows.length === 0) {
    lines.push('| - | No ranking data yet | - | - | - | - |');
  }

  lines.push('', '> Leaderboard display and Pack candidate selection are separate: the ranking refreshes weekly, while Pack candidates remain append-only and never replace existing Skills.', END_MARKER);
  return lines.join('\n');
}

export function replaceRankingBlock(content, block) {
  const start = content.indexOf(START_MARKER);
  const end = content.indexOf(END_MARKER);

  if (start >= 0 && end >= start) {
    const after = end + END_MARKER.length;
    return `${content.slice(0, start)}${block}${content.slice(after)}`;
  }

  const insertBefore = '\n## 发布与 skills.sh Pack';
  const englishInsertBefore = '\n## Release and skills.sh Pack';
  const marker = content.includes(insertBefore) ? insertBefore : englishInsertBefore;
  const index = content.indexOf(marker);

  if (index >= 0) {
    return `${content.slice(0, index)}\n\n${block}\n${content.slice(index)}`;
  }

  return `${content.trimEnd()}\n\n${block}\n`;
}

function main() {
  const args = process.argv.slice(2);
  const reportPath = path.resolve(repoRoot, argValue(args, '--report', 'reports/skills-sh/latest.md'));
  const readmePath = path.resolve(repoRoot, argValue(args, '--readme', 'README.md'));
  const readmeEnPath = path.resolve(repoRoot, argValue(args, '--readme-en', 'README.en.md'));

  const data = parseWeeklyRanking(readText(reportPath));
  const readme = replaceRankingBlock(readText(readmePath), buildChineseBlock(data));
  const readmeEn = replaceRankingBlock(readText(readmeEnPath), buildEnglishBlock(data));

  writeText(readmePath, readme);
  writeText(readmeEnPath, readmeEn);

  console.log(`排行榜摘要已更新：${path.relative(repoRoot, readmePath)} / ${path.relative(repoRoot, readmeEnPath)}`);
  console.log(`分类数量：${data.rows.length}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
