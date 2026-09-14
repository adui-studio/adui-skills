#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
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
    strict: { type: 'boolean', default: false },
    'source-map': { type: 'string' },
    json: { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
  allowPositionals: false,
});

if (values.help) {
  console.log(`ADui Skills Pack 上游更新检查器

用法：
  node scripts/check-updates.mjs [选项]

选项：
  --write               写入 registry/skills.lock.json，并保存自动修复的 skillPath
  --prune               删除已停用或已从 Registry 移除的 Lock 条目
  --report <path>       输出 Markdown 更新报告
  --only <ids>          仅检查逗号分隔的 Skill ID
  --strict              任意上游仓库或 Skill 解析失败时返回非 0
  --source-map <path>   测试用：JSON 映射 source -> 本地 Git 仓库路径
  --json                输出机器可读 JSON
  -h, --help            显示帮助

默认策略：
  - 按 source 分组，每个 GitHub 仓库只克隆一次。
  - 优先使用 Registry 中的 skillPath；失效时扫描 SKILL.md 并按 frontmatter name 自动定位。
  - 使用 Skill 目录的 Git tree SHA（skillFolderHash）判断实际内容是否变化。
  - 单个第三方上游失败只记录警告，不阻塞其他 Skill；使用 --strict 可改为严格模式。

English fallback: this command checks upstream Skills by Git folder tree hashes and can auto-repair moved SKILL.md paths.
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

function runGit(args, cwd, { allowFailure = false } = {}) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: '0',
    },
  });

  if (result.status !== 0 && !allowFailure) {
    const stderr = String(result.stderr || '').trim();
    const stdout = String(result.stdout || '').trim();
    throw new Error(stderr || stdout || `git ${args.join(' ')} 失败，退出码 ${result.status}`);
  }

  return {
    ok: result.status === 0,
    stdout: String(result.stdout || '').trim(),
    stderr: String(result.stderr || '').trim(),
    status: result.status,
  };
}

function normalizeGitPath(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().replace(/\\/g, '/').replace(/^\.\//, '');
  return normalized || null;
}

function parseFrontmatterName(content) {
  if (typeof content !== 'string') return null;
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;

  const nameLine = match[1]
    .split(/\r?\n/)
    .find((line) => /^\s*name\s*:/.test(line));

  if (!nameLine) return null;
  let value = nameLine.replace(/^\s*name\s*:\s*/, '').trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  return value || null;
}

function gitObjectExists(repoDir, gitPath) {
  if (!gitPath) return false;
  return runGit(['cat-file', '-e', `HEAD:${gitPath}`], repoDir, { allowFailure: true }).ok;
}

function readGitFile(repoDir, gitPath) {
  const result = runGit(['show', `HEAD:${gitPath}`], repoDir, { allowFailure: true });
  return result.ok ? result.stdout : null;
}

function listSkillFiles(repoDir) {
  const result = runGit(['ls-tree', '-r', '--name-only', 'HEAD'], repoDir);
  return result.stdout
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter((item) => item === 'SKILL.md' || item.endsWith('/SKILL.md'));
}

function buildSkillIndex(repoDir) {
  const byName = new Map();
  const paths = listSkillFiles(repoDir);

  for (const skillPath of paths) {
    const content = readGitFile(repoDir, skillPath);
    const name = parseFrontmatterName(content);
    if (!name) continue;
    const entries = byName.get(name) || [];
    entries.push(skillPath);
    byName.set(name, entries);
  }

  return { byName, paths };
}

function resolveSkillPath(skill, repoDir, indexRef) {
  const configured = normalizeGitPath(skill.skillPath);

  if (configured && gitObjectExists(repoDir, configured)) {
    const configuredName = parseFrontmatterName(readGitFile(repoDir, configured));
    if (configuredName === skill.id) {
      return { skillPath: configured, resolvedBy: 'registry', repaired: false };
    }
  }

  if (!skill.autoResolvePath) {
    return {
      skillPath: null,
      resolvedBy: 'disabled',
      repaired: false,
      error: `Registry 中的 skillPath 无效，且 autoResolvePath=false：${configured ?? 'null'}`,
    };
  }

  if (!indexRef.current) {
    indexRef.current = buildSkillIndex(repoDir);
  }

  const exact = indexRef.current.byName.get(skill.id) || [];
  if (exact.length === 1) {
    return {
      skillPath: exact[0],
      resolvedBy: 'frontmatter-name',
      repaired: exact[0] !== configured,
    };
  }

  if (exact.length > 1) {
    return {
      skillPath: null,
      resolvedBy: 'ambiguous',
      repaired: false,
      error: `发现多个 name=${skill.id} 的 SKILL.md：${exact.join(', ')}`,
    };
  }

  const dirnameMatches = indexRef.current.paths.filter((item) => {
    const folder = path.posix.dirname(item);
    return path.posix.basename(folder) === skill.id;
  });

  if (dirnameMatches.length === 1) {
    return {
      skillPath: dirnameMatches[0],
      resolvedBy: 'directory-name-fallback',
      repaired: dirnameMatches[0] !== configured,
      warning: '未从 frontmatter name 精确匹配，使用目录名兜底定位。',
    };
  }

  return {
    skillPath: null,
    resolvedBy: 'not-found',
    repaired: false,
    error: `未找到 name=${skill.id} 的 SKILL.md。`,
  };
}

function getFolderHash(repoDir, skillPath) {
  const folder = path.posix.dirname(skillPath);
  const spec = folder === '.' ? 'HEAD^{tree}' : `HEAD:${folder}`;
  return runGit(['rev-parse', spec], repoDir).stdout;
}

function getRepoMeta(repoDir) {
  const output = runGit(['show', '-s', '--format=%H%n%cI%n%s', 'HEAD'], repoDir).stdout;
  const [commit = '', committedAt = '', ...messageParts] = output.split(/\r?\n/);
  return {
    commit: commit.trim(),
    committedAt: committedAt.trim() || null,
    message: messageParts.join(' ').trim(),
  };
}

function sanitizeSource(source) {
  return source.replace(/[^A-Za-z0-9_.-]+/g, '__');
}

function cloneSource(source, tempRoot) {
  const target = path.join(tempRoot, sanitizeSource(source));
  const url = `https://github.com/${source}.git`;
  const result = runGit(
    ['clone', '--depth=1', '--filter=blob:none', '--no-tags', '--quiet', url, target],
    root,
    { allowFailure: true },
  );

  if (!result.ok) {
    throw new Error(result.stderr || result.stdout || `无法克隆 ${source}`);
  }
  return target;
}

function loadSourceMap(filePath) {
  if (!filePath) return {};
  const absolute = path.resolve(root, filePath);
  const raw = readJson(absolute);
  const result = {};
  for (const [source, repoPath] of Object.entries(raw)) {
    result[source] = path.resolve(path.dirname(absolute), repoPath);
  }
  return result;
}

function compareUrl(source, oldCommit, newCommit) {
  if (!oldCommit || !newCommit || oldCommit === newCommit) return null;
  return `https://github.com/${source}/compare/${oldCommit}...${newCommit}`;
}

function skillUrl(source, repoCommit, skillPath) {
  if (!source || !repoCommit || !skillPath) return null;
  return `https://github.com/${source}/blob/${repoCommit}/${skillPath}`;
}

function markdownReport(summary) {
  const lines = [
    '# ADui Skills Pack 每周上游更新报告',
    '',
    `生成时间：${summary.checkedAt}`,
    '',
    '## 中文摘要',
    '',
    `- 实际检查 Skill：${summary.checked}`,
    `- 内容更新：${summary.updated.length}`,
    `- 首次建立基线：${summary.baseline.length}`,
    `- 路径自动修复：${summary.pathRepairs.length}`,
    `- 内容未变化：${summary.unchanged.length}`,
    `- 从 Lock 移除：${summary.removed.length}`,
    `- 上游仓库失败：${summary.sourceFailures.length}`,
    `- Skill 无法定位：${summary.unresolved.length}`,
    '',
  ];

  if (summary.updated.length > 0) {
    lines.push('## 内容已更新的 Skills', '');
    lines.push('| Skill | 上游 | 旧 Hash | 新 Hash | 对比 |');
    lines.push('|---|---|---|---|---|');
    for (const item of summary.updated) {
      const compare = compareUrl(item.source, item.oldRepoCommit, item.newRepoCommit);
      lines.push(`| \`${item.id}\` | \`${item.source}\` | \`${item.oldHash.slice(0, 10)}\` | \`${item.newHash.slice(0, 10)}\` | ${compare ? `[查看](${compare})` : '-'} |`);
    }
    lines.push('');
  }

  if (summary.baseline.length > 0) {
    lines.push('## 首次建立基线', '', '这些 Skill 之前没有 Folder Hash 锁定记录，请在合并前抽查其 `SKILL.md` 与脚本。', '');
    lines.push('| Skill | 上游 | skillFolderHash | SKILL.md |');
    lines.push('|---|---|---|---|');
    for (const item of summary.baseline) {
      const url = skillUrl(item.source, item.repoCommit, item.skillPath);
      lines.push(`| \`${item.id}\` | \`${item.source}\` | \`${item.newHash.slice(0, 12)}\` | ${url ? `[查看](${url})` : `\`${item.skillPath}\``} |`);
    }
    lines.push('');
  }

  if (summary.pathRepairs.length > 0) {
    lines.push('## 自动修复 Skill 路径', '');
    lines.push('| Skill | 原路径 | 新路径 | 定位方式 |');
    lines.push('|---|---|---|---|');
    for (const item of summary.pathRepairs) {
      lines.push(`| \`${item.id}\` | \`${item.oldPath ?? 'null'}\` | \`${item.newPath}\` | ${item.resolvedBy} |`);
    }
    lines.push('');
  }

  if (summary.sourceFailures.length > 0 || summary.unresolved.length > 0) {
    lines.push('## 需要人工关注的警告', '');
    for (const item of summary.sourceFailures) {
      lines.push(`- **仓库失败** \`${item.source}\`：${item.error}`);
    }
    for (const item of summary.unresolved) {
      lines.push(`- **Skill 未定位** \`${item.id}\`（\`${item.source}\`）：${item.error}`);
    }
    lines.push('');
  }

  if (summary.removed.length > 0) {
    lines.push('## 从 Lock 移除', '');
    for (const item of summary.removed) lines.push(`- \`${item.id}\``);
    lines.push('');
  }

  lines.push(
    '## 合并前检查清单',
    '',
    '- [ ] 检查发生变化的 `SKILL.md`，确认触发条件和行为约束没有异常变化。',
    '- [ ] 检查新增或修改的 `scripts/`：Shell 执行、删除文件、网络下载、凭据读取、Git push、提权、外部可执行文件。',
    '- [ ] 检查 `references/` 中是否修改了框架版本、API 或安全建议。',
    '- [ ] 确认 Skill 仍适合当前 ADui Profile 和等级。',
    '- [ ] 对路径自动修复项确认新路径确实对应同一个 Skill。',
    '- [ ] 不自动合并本 PR。',
    '',
    '> ADui Skills Pack 只跟踪第三方 Skill 的上游版本，不复制第三方 Skill 源码。',
    '',
    '---',
    '',
    '## English fallback',
    '',
    `- Checked: ${summary.checked}`,
    `- Updated content: ${summary.updated.length}`,
    `- New baselines: ${summary.baseline.length}`,
    `- Auto-repaired paths: ${summary.pathRepairs.length}`,
    `- Source failures: ${summary.sourceFailures.length}`,
    `- Unresolved skills: ${summary.unresolved.length}`,
    '',
    'Please review changed SKILL.md files and scripts before merging. This PR must not be auto-merged.',
    '',
  );

  return `${lines.join('\n')}\n`;
}

function writeGithubOutputs(summary, reportPath, hasChanges) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;

  const rows = [
    `changed=${hasChanges ? 'true' : 'false'}`,
    `checked=${summary.checked}`,
    `updated_count=${summary.updated.length}`,
    `baseline_count=${summary.baseline.length}`,
    `repaired_count=${summary.pathRepairs.length}`,
    `removed_count=${summary.removed.length}`,
    `source_failure_count=${summary.sourceFailures.length}`,
    `unresolved_count=${summary.unresolved.length}`,
  ];
  if (reportPath) rows.push(`report_path=${reportPath}`);
  fs.appendFileSync(outputPath, `${rows.join('\n')}\n`, 'utf8');
}

if (!fs.existsSync(registryPath)) {
  console.error('缺少 registry/skills.json。');
  process.exit(1);
}

const registry = readJson(registryPath);
const currentLock = fs.existsSync(lockPath)
  ? readJson(lockPath)
  : { version: 2, generatedAt: null, skills: {} };

if (!registry || !Array.isArray(registry.skills)) {
  console.error('registry/skills.json 格式无效。');
  process.exit(1);
}

const onlyIds = values.only
  ? new Set(values.only.split(',').map((value) => value.trim()).filter(Boolean))
  : null;

if (onlyIds) {
  const missing = [...onlyIds].filter((id) => !registry.skills.some((skill) => skill.id === id));
  if (missing.length > 0) {
    console.error(`--only 包含未知 Skill ID：${missing.join(', ')}`);
    process.exit(1);
  }
}

const skills = registry.skills.filter((skill) => {
  if (!skill.enabled || skill.status !== 'active') return false;
  if (onlyIds && !onlyIds.has(skill.id)) return false;
  return true;
});

const grouped = new Map();
for (const skill of skills) {
  const list = grouped.get(skill.source) || [];
  list.push(skill);
  grouped.set(skill.source, list);
}

const sourceMap = loadSourceMap(values['source-map']);
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'adui-skills-updater-'));
const checkedAt = nowIso();
const nextLock = {
  version: 2,
  generatedAt: currentLock.generatedAt ?? null,
  skills: { ...(currentLock.skills || {}) },
};
const nextRegistry = structuredClone(registry);
const registryById = new Map(nextRegistry.skills.map((skill) => [skill.id, skill]));

const summary = {
  checkedAt,
  checked: 0,
  updated: [],
  baseline: [],
  unchanged: [],
  pathRepairs: [],
  sourceFailures: [],
  unresolved: [],
  removed: [],
};

try {
  for (const [source, sourceSkills] of grouped.entries()) {
    let repoDir;
    try {
      if (sourceMap[source]) {
        repoDir = sourceMap[source];
        if (!fs.existsSync(path.join(repoDir, '.git'))) {
          throw new Error(`source-map 指向的目录不是 Git 仓库：${repoDir}`);
        }
      } else {
        repoDir = cloneSource(source, tempRoot);
      }
    } catch (error) {
      summary.sourceFailures.push({
        source,
        skills: sourceSkills.map((item) => item.id),
        error: error instanceof Error ? error.message : String(error),
      });
      continue;
    }

    const repoMeta = getRepoMeta(repoDir);
    const indexRef = { current: null };

    for (const skill of sourceSkills) {
      summary.checked += 1;
      const resolved = resolveSkillPath(skill, repoDir, indexRef);

      if (!resolved.skillPath) {
        summary.unresolved.push({
          id: skill.id,
          source,
          configuredPath: skill.skillPath ?? null,
          error: resolved.error || '无法解析 SKILL.md 路径。',
        });
        continue;
      }

      if (resolved.warning) {
        summary.unresolved.push({
          id: skill.id,
          source,
          configuredPath: skill.skillPath ?? null,
          warningOnly: true,
          error: resolved.warning,
        });
      }

      if (resolved.repaired) {
        summary.pathRepairs.push({
          id: skill.id,
          source,
          oldPath: skill.skillPath ?? null,
          newPath: resolved.skillPath,
          resolvedBy: resolved.resolvedBy,
        });
        const registryEntry = registryById.get(skill.id);
        if (registryEntry) registryEntry.skillPath = resolved.skillPath;
      }

      const folderHash = getFolderHash(repoDir, resolved.skillPath);
      const previous = currentLock.skills?.[skill.id] ?? null;
      const nextEntry = {
        source,
        skillPath: resolved.skillPath,
        skillFolderHash: folderHash,
        repoCommit: repoMeta.commit,
        committedAt: repoMeta.committedAt,
      };

      if (!previous?.skillFolderHash) {
        nextLock.skills[skill.id] = nextEntry;
        summary.baseline.push({
          id: skill.id,
          source,
          skillPath: resolved.skillPath,
          newHash: folderHash,
          repoCommit: repoMeta.commit,
          committedAt: repoMeta.committedAt,
        });
      } else if (
        previous.skillFolderHash !== folderHash ||
        previous.source !== source
      ) {
        nextLock.skills[skill.id] = nextEntry;
        summary.updated.push({
          id: skill.id,
          source,
          skillPath: resolved.skillPath,
          oldHash: previous.skillFolderHash,
          newHash: folderHash,
          oldRepoCommit: previous.repoCommit ?? null,
          newRepoCommit: repoMeta.commit,
          committedAt: repoMeta.committedAt,
        });
      } else if (previous.skillPath !== resolved.skillPath) {
        // 内容未变化，但 Skill 在上游仓库中移动了目录。
        // 更新 Lock 的路径与仓库定位信息，内容更新计数保持为 0。
        nextLock.skills[skill.id] = nextEntry;
      } else {
        summary.unchanged.push({ id: skill.id, hash: folderHash });
      }
    }
  }

  if (values.prune) {
    const activeIds = new Set(
      registry.skills
        .filter((skill) => skill.enabled && skill.status === 'active')
        .map((skill) => skill.id),
    );
    for (const id of Object.keys(nextLock.skills)) {
      if (!activeIds.has(id)) {
        summary.removed.push({ id, entry: nextLock.skills[id] });
        delete nextLock.skills[id];
      }
    }
  }

  const warningOnlyUnresolved = summary.unresolved.filter((item) => item.warningOnly).length;
  const hardUnresolved = summary.unresolved.length - warningOnlyUnresolved;
  const hasWarnings = summary.sourceFailures.length > 0 || hardUnresolved > 0;
  const hasChanges =
    summary.updated.length +
      summary.baseline.length +
      summary.pathRepairs.length +
      summary.removed.length >
    0;

  if (hasChanges && !nextLock.generatedAt) nextLock.generatedAt = checkedAt;

  if (values.write && hasChanges) {
    writeJson(lockPath, nextLock);
    if (summary.pathRepairs.length > 0) {
      nextRegistry.updatedAt = checkedAt.slice(0, 10);
      writeJson(registryPath, nextRegistry);
    }
  }

  let reportPath = null;
  if (values.report) {
    reportPath = path.resolve(root, values.report);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, markdownReport(summary), 'utf8');
  }

  writeGithubOutputs(summary, reportPath, hasChanges);

  if (values.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log('ADui Skills Pack 上游更新检查');
    console.log('-----------------------------');
    console.log(`实际检查     : ${summary.checked}`);
    console.log(`内容更新     : ${summary.updated.length}`);
    console.log(`首次基线     : ${summary.baseline.length}`);
    console.log(`路径修复     : ${summary.pathRepairs.length}`);
    console.log(`内容未变化   : ${summary.unchanged.length}`);
    console.log(`移除 Lock    : ${summary.removed.length}`);
    console.log(`仓库失败     : ${summary.sourceFailures.length}`);
    console.log(`无法定位     : ${hardUnresolved}`);
    console.log(`写入文件     : ${values.write ? '是' : '否'}`);
    if (reportPath) console.log(`报告         : ${reportPath}`);
    if (hasWarnings) {
      console.log('\n警告：部分第三方上游未成功检查，其他 Skill 的结果仍然有效。');
      console.log('English fallback: some upstream sources could not be checked; successful results remain valid.');
    }
  }

  if (values.strict && hasWarnings) process.exitCode = 1;
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
