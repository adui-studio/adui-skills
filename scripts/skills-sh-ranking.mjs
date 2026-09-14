import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

function argValue(args, name, fallback = null) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}

function hasArg(args, name) {
  return args.includes(name);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export function skillKey(skill) {
  return `${String(skill.source || '').trim().toLowerCase()}@${String(skill.name || '').trim().toLowerCase()}`;
}

export function normalizeSearchSkills(payload) {
  const list = Array.isArray(payload?.skills) ? payload.skills : [];
  const seen = new Set();
  const normalized = [];

  for (const item of list) {
    const source = typeof item?.source === 'string' ? item.source.trim() : '';
    const name = typeof item?.name === 'string' ? item.name.trim() : '';
    const id = typeof item?.id === 'string' ? item.id.trim() : '';
    const installs = Number.isFinite(Number(item?.installs)) ? Number(item.installs) : 0;
    if (!source || !name) continue;

    const candidate = {
      id: id || `${source}/${name}`,
      source,
      name,
      installs,
      skillsShUrl: `https://skills.sh/${id || `${source}/${name}`}`,
    };
    const key = skillKey(candidate);
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(candidate);
  }

  return normalized.sort((a, b) => b.installs - a.installs || skillKey(a).localeCompare(skillKey(b)));
}

export function parsePackIndex(payload) {
  const names = new Set();
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.skills)) return names;

  for (const item of payload.skills) {
    if (item && typeof item.name === 'string' && item.name.trim()) {
      names.add(item.name.trim().toLowerCase());
    }
  }
  return names;
}

export function summarizeAudit(payload, blockedRiskLevels = ['HIGH', 'CRITICAL']) {
  const audits = Array.isArray(payload?.audits) ? payload.audits : [];
  if (audits.length === 0) {
    return { status: 'unknown', blocked: false, providers: 0, reasons: [] };
  }

  const blockedLevels = new Set(blockedRiskLevels.map((value) => String(value).toUpperCase()));
  const reasons = [];
  let warned = false;

  for (const audit of audits) {
    const status = String(audit?.status || '').toLowerCase();
    const riskLevel = String(audit?.riskLevel || '').toUpperCase();
    const provider = String(audit?.provider || audit?.slug || 'unknown');

    if (status === 'fail') reasons.push(`${provider}: fail`);
    if (blockedLevels.has(riskLevel)) reasons.push(`${provider}: ${riskLevel}`);
    if (status === 'warn' || riskLevel === 'MEDIUM') warned = true;
  }

  if (reasons.length > 0) {
    return { status: 'blocked', blocked: true, providers: audits.length, reasons };
  }

  return {
    status: warned ? 'warn' : 'pass',
    blocked: false,
    providers: audits.length,
    reasons: [],
  };
}

export function evaluateCandidate(candidate, context) {
  const {
    packSkillNames = new Set(),
    selectedKeys = new Set(),
    selectedNames = new Set(),
    minInstalls = 0,
    minRepoStars = 0,
  } = context;

  const key = skillKey(candidate);
  const name = candidate.name.toLowerCase();

  if (packSkillNames.has(name)) return { accepted: false, reason: 'already-in-pack' };
  if (selectedKeys.has(key) || selectedNames.has(name)) return { accepted: false, reason: 'already-selected' };
  if (candidate.installs < minInstalls) return { accepted: false, reason: 'installs-below-threshold' };
  if ((candidate.repoStars || 0) < minRepoStars) return { accepted: false, reason: 'stars-below-threshold' };
  if (candidate.audit?.blocked) return { accepted: false, reason: 'security-audit-blocked' };

  return { accepted: true, reason: null };
}

export function appendSelections(state, selections) {
  const current = Array.isArray(state.selected) ? [...state.selected] : [];
  const existing = new Set(current.map(skillKey));

  for (const selection of selections) {
    const key = skillKey(selection);
    if (existing.has(key)) continue;
    current.push(selection);
    existing.add(key);
  }

  return { ...state, selected: current };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status} ${response.statusText}: ${url}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function fetchPackSkills(packUrl, fetcher = fetchJson) {
  const normalized = packUrl.replace(/\/$/, '');
  const candidates = [
    `${normalized}/.well-known/agent-skills/index.json`,
    `${normalized}/.well-known/skills/index.json`,
  ];

  const errors = [];
  for (const url of candidates) {
    try {
      const payload = await fetcher(url);
      const names = parsePackIndex(payload);
      if (names.size > 0) return { ok: true, names, url, payload };
      errors.push(`${url}: empty index`);
    } catch (error) {
      errors.push(`${url}: ${error.message}`);
    }
  }

  return { ok: false, names: new Set(), url: null, payload: null, errors };
}

async function searchSkills(query, limit, fetcher = fetchJson) {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const payload = await fetcher(`https://skills.sh/api/search?${params.toString()}`);
  return normalizeSearchSkills(payload);
}

async function fetchRepoStars(source, token, fetcher = fetchJson) {
  if (!/^[^/]+\/[^/]+$/.test(source)) return 0;

  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'adui-skills-ranking',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const repo = await fetcher(`https://api.github.com/repos/${source}`, { headers });
    return Number.isFinite(Number(repo?.stargazers_count)) ? Number(repo.stargazers_count) : 0;
  } catch {
    return 0;
  }
}

async function fetchAudit(candidate, blockedRiskLevels, fetcher = fetchJson) {
  try {
    const payload = await fetcher(`https://skills.sh/api/v1/skills/audit/${candidate.id}`);
    return summarizeAudit(payload, blockedRiskLevels);
  } catch (error) {
    if (error?.status === 401 || error?.status === 404) {
      return { status: 'unknown', blocked: false, providers: 0, reasons: [] };
    }
    return { status: 'unknown', blocked: false, providers: 0, reasons: [`audit-error: ${error.message}`] };
  }
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Number(value) || 0);
}

function selectionLine(selection) {
  return `- **${selection.categoryName}**：\`${selection.source}@${selection.name}\` — ${formatNumber(selection.installs)} installs / ${formatNumber(selection.repoStars)} stars / audit: ${selection.auditStatus}`;
}

export function buildReport({ date, config, pack, categoryResults, selections, state }) {
  const lines = [];
  lines.push('# skills.sh 每周分类排行与 Pack 候选');
  lines.push('');
  lines.push(`- 日期：${date}`);
  lines.push(`- Pack：${config.packUrl}`);
  lines.push(`- Pack 当前可读取 Skill 数：${pack.ok ? pack.names.size : '读取失败'}`);
  lines.push(`- 本次新增候选：${selections.length}`);
  lines.push(`- 本地累计选择记录：${Array.isArray(state.selected) ? state.selected.length : 0}`);
  lines.push('');
  lines.push('> 选择记录是 append-only：脚本只追加，不删除历史候选，也不会删除或覆盖 Pack 中已有 Skill。');
  lines.push('');

  if (!pack.ok) {
    lines.push('## Pack 读取失败');
    lines.push('');
    for (const error of pack.errors || []) lines.push(`- ${error}`);
    lines.push('');
  }

  lines.push('## 本周建议追加');
  lines.push('');
  if (selections.length === 0) {
    lines.push('本周没有新的合格候选。');
  } else {
    for (const selection of selections) lines.push(selectionLine(selection));
  }
  lines.push('');

  lines.push('## 分类排行');
  lines.push('');
  for (const result of categoryResults) {
    lines.push(`### ${result.category.name}`);
    lines.push('');
    lines.push(`查询：\`${result.category.query}\``);
    lines.push('');
    if (result.ranked.length === 0) {
      lines.push('没有结果。');
      lines.push('');
      continue;
    }
    lines.push('| 排名 | Skill | Source | Installs | Stars | Audit | 结果 |');
    lines.push('| ---: | --- | --- | ---: | ---: | --- | --- |');
    result.ranked.slice(0, config.reportTopN || 5).forEach((item, index) => {
      lines.push(`| ${index + 1} | [${item.name}](${item.skillsShUrl}) | \`${item.source}\` | ${formatNumber(item.installs)} | ${formatNumber(item.repoStars)} | ${item.audit?.status || 'unknown'} | ${item.selectionReason || ''} |`);
    });
    lines.push('');
  }

  lines.push('## Pack 同步说明');
  lines.push('');
  lines.push('skills.sh 当前公开文档提供排行榜/搜索读取 API，但没有公开的 Pack 成员写入 API。');
  lines.push('因此本工作流负责自动发现、排序、质量门禁和 append-only 候选清单；最终把新候选加入现有 Pack 仍需在 skills.sh Pack 管理页确认。');
  lines.push('');
  lines.push(`Pack 地址：${config.packUrl}`);
  lines.push('');
  lines.push('English fallback: ranking and candidate selection are automated; Pack membership changes still require confirmation in the skills.sh Pack UI because no documented write API is available.');
  lines.push('');

  return `${lines.join('\n')}\n`;
}

export async function runRanking({ config, state, now = new Date(), fetcher = fetchJson, githubToken = process.env.GITHUB_TOKEN || '' }) {
  const pack = await fetchPackSkills(config.packUrl, fetcher);
  if (!pack.ok) {
    return { pack, categoryResults: [], selections: [], nextState: state, changed: false };
  }

  const selectedKeys = new Set((state.selected || []).map(skillKey));
  const selectedNames = new Set((state.selected || []).map((item) => String(item.name || '').toLowerCase()));
  const pickedThisRun = new Set();
  const categoryResults = [];
  const selections = [];

  for (const category of config.categories || []) {
    if (category.enabled === false) continue;
    const ranked = await searchSkills(category.query, config.searchLimit || 20, fetcher);

    for (const candidate of ranked) {
      candidate.repoStars = await fetchRepoStars(candidate.source, githubToken, fetcher);
      candidate.audit = await fetchAudit(candidate, config.blockedRiskLevels || ['HIGH', 'CRITICAL'], fetcher);
      candidate.selectionReason = '';
    }

    let chosen = null;
    for (const candidate of ranked) {
      const key = skillKey(candidate);
      if (pickedThisRun.has(key)) {
        candidate.selectionReason = '本周已由其他分类选中';
        continue;
      }

      const evaluation = evaluateCandidate(candidate, {
        packSkillNames: pack.names,
        selectedKeys,
        selectedNames,
        minInstalls: config.minInstalls || 0,
        minRepoStars: config.minRepoStars || 0,
      });

      if (!evaluation.accepted) {
        candidate.selectionReason = evaluation.reason;
        continue;
      }

      chosen = candidate;
      candidate.selectionReason = '本周候选';
      pickedThisRun.add(key);
      break;
    }

    categoryResults.push({ category, ranked, chosen });

    if (chosen) {
      const selectedAt = now.toISOString();
      selections.push({
        key: skillKey(chosen),
        source: chosen.source,
        name: chosen.name,
        skillsShUrl: chosen.skillsShUrl,
        category: category.id,
        categoryName: category.name,
        installs: chosen.installs,
        repoStars: chosen.repoStars,
        auditStatus: chosen.audit?.status || 'unknown',
        selectedAt,
      });
      selectedKeys.add(skillKey(chosen));
      selectedNames.add(chosen.name.toLowerCase());
    }
  }

  const limitedSelections = selections.slice(0, config.maxNewPerRun || selections.length);
  const nextState = appendSelections(state, limitedSelections);

  return {
    pack,
    categoryResults,
    selections: limitedSelections,
    nextState,
    changed: limitedSelections.length > 0,
  };
}

function writeGithubOutput(values) {
  const file = process.env.GITHUB_OUTPUT;
  if (!file) return;
  const lines = Object.entries(values).map(([key, value]) => `${key}=${String(value)}`);
  fs.appendFileSync(file, `${lines.join('\n')}\n`, 'utf8');
}

async function main() {
  const args = process.argv.slice(2);
  const configPath = path.resolve(repoRoot, argValue(args, '--config', 'config/skills-sh-ranking.json'));
  const statePath = path.resolve(repoRoot, argValue(args, '--state', 'pack/skills-sh-pack.json'));
  const reportArg = argValue(args, '--report', null);
  const reportPath = reportArg ? path.resolve(repoRoot, reportArg) : null;
  const write = hasArg(args, '--write');

  const config = readJson(configPath);
  const state = readJson(statePath);
  const now = new Date();
  const date = now.toISOString().slice(0, 10);

  if (state.packUrl !== config.packUrl) {
    throw new Error(`Pack URL 不一致：config=${config.packUrl}, state=${state.packUrl}`);
  }
  if (state.mode !== 'append-only') {
    throw new Error('pack/skills-sh-pack.json 必须使用 append-only 模式。');
  }

  const result = await runRanking({ config, state, now });
  const report = buildReport({
    date,
    config,
    pack: result.pack,
    categoryResults: result.categoryResults,
    selections: result.selections,
    state: result.nextState,
  });

  if (!result.pack.ok && write) {
    if (reportPath) {
      fs.mkdirSync(path.dirname(reportPath), { recursive: true });
      fs.writeFileSync(reportPath, report, 'utf8');
    }
    writeGithubOutput({ changed: false, selected_count: 0, report_path: reportPath || '' });
    throw new Error('无法读取当前 skills.sh Pack，已停止写入，避免重复选择或覆盖现有 Pack。');
  }

  if (write && result.changed) writeJson(statePath, result.nextState);
  if (reportPath) {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, report, 'utf8');
  }

  writeGithubOutput({
    changed: result.changed,
    selected_count: result.selections.length,
    pack_count: result.pack.ok ? result.pack.names.size : 0,
    report_path: reportPath || '',
  });

  console.log(report);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`skills.sh 每周排行失败：${error.message}`);
    process.exitCode = 1;
  });
}
