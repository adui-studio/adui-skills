#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const registryPath = path.join(root, 'registry', 'skills.json');
const lockPath = path.join(root, 'registry', 'skills.lock.json');
const profilesDir = path.join(root, 'profiles');
const localSkillsDir = path.join(root, 'skills');

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`JSON 无效：${path.relative(root, filePath)}（${error.message}）`);
    return null;
  }
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}


function parseSkillFrontmatter(skillMdPath) {
  const content = fs.readFileSync(skillMdPath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const result = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!field) continue;
    result[field[1]] = field[2].replace(/^['"]|['"]$/g, '').trim();
  }
  return result;
}

function validateLocalSkill(skillId) {
  const dir = path.join(localSkillsDir, skillId);
  const skillMd = path.join(dir, 'SKILL.md');
  const agentYaml = path.join(dir, 'agents', 'openai.yaml');
  if (!fs.existsSync(skillMd)) {
    fail(`Local Skill 缺少 SKILL.md：${skillId}`);
    return;
  }
  if (!fs.existsSync(agentYaml)) warn(`Local Skill 缺少 agents/openai.yaml：${skillId}`);

  const frontmatter = parseSkillFrontmatter(skillMd);
  if (!frontmatter) {
    fail(`${skillId}: SKILL.md 缺少有效 YAML frontmatter。`);
  } else {
    if (frontmatter.name !== skillId) fail(`${skillId}: SKILL.md name 必须与目录名一致。`);
    if (!isNonEmptyString(frontmatter.description)) fail(`${skillId}: SKILL.md description 不能为空。`);
  }

  const referencesDir = path.join(dir, 'references');
  if (fs.existsSync(referencesDir)) {
    for (const entry of fs.readdirSync(referencesDir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.md') || entry.name.endsWith('.en.md')) continue;
      const englishName = entry.name.replace(/\.md$/, '.en.md');
      if (!fs.existsSync(path.join(referencesDir, englishName))) {
        warn(`${skillId}: 中文参考文档缺少英文兜底：references/${englishName}`);
      }
    }
  }
}

function validateBilingualDocs() {
  const rootPairs = ['README.md', 'AGENTS.md', 'CONTRIBUTING.md', 'CHANGELOG.md'];
  for (const file of rootPairs) {
    if (!fs.existsSync(path.join(root, file))) continue;
    const english = file.replace(/\.md$/, '.en.md');
    if (!fs.existsSync(path.join(root, english))) warn(`中文文档缺少英文兜底：${english}`);
  }

  const docsDir = path.join(root, 'docs');
  if (fs.existsSync(docsDir)) {
    for (const entry of fs.readdirSync(docsDir, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.md') || entry.name.endsWith('.en.md')) continue;
      const english = entry.name.replace(/\.md$/, '.en.md');
      if (!fs.existsSync(path.join(docsDir, english))) warn(`中文文档缺少英文兜底：docs/${english}`);
    }
  }
}

function validateRegistry(registry) {
  if (!registry || typeof registry !== 'object' || Array.isArray(registry)) {
    fail('registry/skills.json 必须是 JSON 对象。');
    return new Map();
  }

  if (!Number.isInteger(registry.version) || registry.version < 2) {
    fail('registry.version 必须是 >= 2 的整数。');
  }

  if (!Array.isArray(registry.skills)) {
    fail('registry.skills 必须是数组。');
    return new Map();
  }

  const allowedTiers = new Set(['S+', 'S', 'A+', 'A', 'B']);
  const allowedStatus = new Set(['active', 'upstream-unavailable', 'deprecated']);
  const idPattern = /^[a-z0-9][a-z0-9-]*$/;
  const sourcePattern = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
  const categoryPattern = /^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/;
  const skillMap = new Map();

  registry.skills.forEach((skill, index) => {
    const label = `registry.skills[${index}]`;
    if (!skill || typeof skill !== 'object' || Array.isArray(skill)) {
      fail(`${label} 必须是对象。`);
      return;
    }

    if (!isNonEmptyString(skill.id) || !idPattern.test(skill.id)) {
      fail(`${label}.id 格式无效。`);
      return;
    }
    if (skillMap.has(skill.id)) {
      fail(`Skill ID 重复：${skill.id}`);
      return;
    }
    skillMap.set(skill.id, skill);

    if (!isNonEmptyString(skill.name)) fail(`${skill.id}: name 不能为空。`);
    if (!isNonEmptyString(skill.source) || !sourcePattern.test(skill.source)) {
      fail(`${skill.id}: source 必须使用 owner/repository 格式。`);
    }
    if (skill.skillPath !== null && !isNonEmptyString(skill.skillPath)) {
      fail(`${skill.id}: skillPath 必须是非空字符串或 null。`);
    }
    if (typeof skill.autoResolvePath !== 'boolean') {
      fail(`${skill.id}: autoResolvePath 必须是 boolean。`);
    }
    if (!allowedStatus.has(skill.status)) {
      fail(`${skill.id}: status 无效：${skill.status}`);
    }
    if (!isNonEmptyString(skill.category) || !categoryPattern.test(skill.category)) {
      fail(`${skill.id}: category 无效：${skill.category}`);
    }
    if (!allowedTiers.has(skill.tier)) fail(`${skill.id}: tier 无效：${skill.tier}`);
    if (typeof skill.official !== 'boolean') fail(`${skill.id}: official 必须是 boolean。`);
    if (typeof skill.enabled !== 'boolean') fail(`${skill.id}: enabled 必须是 boolean。`);

    if (skill.status !== 'active' && skill.enabled) {
      fail(`${skill.id}: status=${skill.status} 时 enabled 必须为 false。`);
    }
    if (skill.status === 'active' && skill.enabled && skill.skillPath === null && !skill.autoResolvePath) {
      fail(`${skill.id}: 启用中的 Skill 没有 skillPath，且禁止自动定位。`);
    }

    if (!Array.isArray(skill.profiles)) {
      fail(`${skill.id}: profiles 必须是数组。`);
    } else {
      const seen = new Set();
      for (const profile of skill.profiles) {
        if (!isNonEmptyString(profile) || !idPattern.test(profile)) {
          fail(`${skill.id}: Profile 名称无效：${String(profile)}`);
          continue;
        }
        if (seen.has(profile)) fail(`${skill.id}: Profile 重复：${profile}`);
        seen.add(profile);
      }
    }

    if (!isNonEmptyString(skill.description)) fail(`${skill.id}: description 不能为空。`);
    if (!isNonEmptyString(skill.skillsShUrl)) {
      fail(`${skill.id}: skillsShUrl 不能为空。`);
    } else {
      try {
        const url = new URL(skill.skillsShUrl);
        if (url.protocol !== 'https:') fail(`${skill.id}: skillsShUrl 必须使用 HTTPS。`);
      } catch {
        fail(`${skill.id}: skillsShUrl 不是有效 URL。`);
      }
    }
  });

  return skillMap;
}

function validateLock(lock, skillMap) {
  if (!lock || typeof lock !== 'object' || Array.isArray(lock)) {
    fail('registry/skills.lock.json 必须是 JSON 对象。');
    return;
  }
  if (!Number.isInteger(lock.version) || lock.version !== 2) {
    fail('skills.lock.version 必须为 2。');
  }
  if (lock.generatedAt !== null && !isNonEmptyString(lock.generatedAt)) {
    fail('skills.lock.generatedAt 必须是 ISO 日期字符串或 null。');
  }
  if (!lock.skills || typeof lock.skills !== 'object' || Array.isArray(lock.skills)) {
    fail('skills.lock.skills 必须是对象。');
    return;
  }

  const hashPattern = /^[a-f0-9]{40,64}$/i;
  const lockedIds = new Set(Object.keys(lock.skills));

  for (const [skillId, entry] of Object.entries(lock.skills)) {
    const registrySkill = skillMap.get(skillId);
    if (!registrySkill) {
      warn(`Lock 中存在 Registry 已不存在的 Skill：${skillId}`);
      continue;
    }
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      fail(`skills.lock.${skillId} 必须是对象。`);
      continue;
    }
    if (!isNonEmptyString(entry.source)) fail(`skills.lock.${skillId}.source 不能为空。`);
    if (!isNonEmptyString(entry.skillPath)) fail(`skills.lock.${skillId}.skillPath 不能为空。`);
    if (!isNonEmptyString(entry.skillFolderHash) || !hashPattern.test(entry.skillFolderHash)) {
      fail(`skills.lock.${skillId}.skillFolderHash 必须是有效 Git tree SHA。`);
    }
    if (!isNonEmptyString(entry.repoCommit) || !hashPattern.test(entry.repoCommit)) {
      fail(`skills.lock.${skillId}.repoCommit 必须是有效 Git commit SHA。`);
    }
    if (entry.source !== registrySkill.source) {
      warn(`${skillId}: Lock source 与 Registry 不一致。`);
    }
    if (registrySkill.skillPath && entry.skillPath !== registrySkill.skillPath) {
      warn(`${skillId}: Lock skillPath 与 Registry 不一致，建议重新运行 updates:apply。`);
    }
  }

  const activeIds = [...skillMap.values()]
    .filter((skill) => skill.enabled && skill.status === 'active')
    .map((skill) => skill.id);
  const missing = activeIds.filter((id) => !lockedIds.has(id));

  if (lock.generatedAt === null) {
    if (activeIds.length > 0) {
      warn(`skills.lock.json 尚未建立 Folder Hash 基线（当前 ${activeIds.length} 个启用 Skill 未锁定）。`);
    }
  } else if (missing.length > 0) {
    warn(`Lock 缺少 ${missing.length} 个启用 Skill：${missing.slice(0, 10).join(', ')}${missing.length > 10 ? ' ...' : ''}`);
  }
}

function readProfiles() {
  if (!fs.existsSync(profilesDir)) {
    fail('缺少 profiles/ 目录。');
    return new Map();
  }
  const files = fs.readdirSync(profilesDir).filter((name) => name.endsWith('.json')).sort();
  const profiles = new Map();
  for (const file of files) {
    const id = file.replace(/\.json$/, '');
    const data = readJson(path.join(profilesDir, file));
    if (data) profiles.set(id, data);
  }
  return profiles;
}

function validateProfiles(profiles, skillMap) {
  const idPattern = /^[a-z0-9][a-z0-9-]*$/;
  for (const [id, profile] of profiles.entries()) {
    if (!idPattern.test(id)) fail(`Profile 文件名无效：${id}`);
    if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
      fail(`profiles/${id}.json 必须是对象。`);
      continue;
    }
    if (!Number.isInteger(profile.version) || profile.version < 1) fail(`${id}: version 必须 >= 1。`);
    if (!isNonEmptyString(profile.name)) fail(`${id}: name 不能为空。`);
    if (!isNonEmptyString(profile.description)) fail(`${id}: description 不能为空。`);
    if (!Array.isArray(profile.extends)) fail(`${id}: extends 必须是数组。`);
    if (!Array.isArray(profile.skills)) fail(`${id}: skills 必须是数组。`);
    if (!Array.isArray(profile.localSkills)) fail(`${id}: localSkills 必须是数组。`);

    const parentSeen = new Set();
    for (const parent of profile.extends || []) {
      if (!profiles.has(parent)) fail(`${id}: 引用了不存在的父 Profile：${parent}`);
      if (parentSeen.has(parent)) fail(`${id}: 重复继承 Profile：${parent}`);
      parentSeen.add(parent);
    }

    const skillSeen = new Set();
    for (const skillId of profile.skills || []) {
      const skill = skillMap.get(skillId);
      if (!skill) fail(`${id}: 引用了 Registry 中不存在的 Skill：${skillId}`);
      else if (!skill.enabled || skill.status !== 'active') fail(`${id}: 引用了未启用的 Skill：${skillId}`);
      if (skillSeen.has(skillId)) fail(`${id}: Skill 重复：${skillId}`);
      skillSeen.add(skillId);
    }

    const localSeen = new Set();
    for (const skillId of profile.localSkills || []) {
      if (localSeen.has(skillId)) fail(`${id}: Local Skill 重复：${skillId}`);
      localSeen.add(skillId);
      validateLocalSkill(skillId);
    }
  }

  const visiting = new Set();
  const visited = new Set();
  function visit(id, chain = []) {
    if (visiting.has(id)) {
      fail(`Profile 存在循环继承：${[...chain, id].join(' -> ')}`);
      return;
    }
    if (visited.has(id) || !profiles.has(id)) return;
    visiting.add(id);
    for (const parent of profiles.get(id).extends || []) visit(parent, [...chain, id]);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of profiles.keys()) visit(id);
}

const registry = fs.existsSync(registryPath) ? readJson(registryPath) : (fail('缺少 registry/skills.json。'), null);
const lock = fs.existsSync(lockPath) ? readJson(lockPath) : (fail('缺少 registry/skills.lock.json。'), null);
const skillMap = validateRegistry(registry);
const profiles = readProfiles();
validateProfiles(profiles, skillMap);
validateLock(lock, skillMap);
validateBilingualDocs();

console.log('ADui Skills Pack 校验结果');
console.log('-------------------------');
console.log(`Registry Skills : ${skillMap.size}`);
console.log(`Profiles        : ${profiles.size}`);
console.log(`Warnings        : ${warnings.length}`);
console.log(`Errors          : ${errors.length}`);

if (warnings.length > 0) {
  console.log('\n警告：');
  for (const message of warnings) console.log(`- ${message}`);
}
if (errors.length > 0) {
  console.error('\n错误：');
  for (const message of errors) console.error(`- ${message}`);
  console.error('\nEnglish fallback: validation failed; fix the errors above before merging.');
  process.exit(1);
}

console.log('\n校验通过。');
console.log('English fallback: validation passed.');
