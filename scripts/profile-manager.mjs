#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const REGISTRY_PATH = path.join(REPO_ROOT, 'registry', 'skills.json');
const PROFILES_DIR = path.join(REPO_ROOT, 'profiles');
const ROUTER_PATH = path.join(REPO_ROOT, 'skills', 'adui-stack-router', 'scripts', 'detect-stack.mjs');
const ADUI_SOURCE = 'https://github.com/adui-studio/adui-skills';
const NPX_COMMAND = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function loadRegistry() {
  const data = readJson(REGISTRY_PATH);
  return new Map((data.skills ?? []).map((skill) => [skill.id, skill]));
}

export function loadProfiles() {
  const profiles = new Map();
  for (const name of fs.readdirSync(PROFILES_DIR).filter((file) => file.endsWith('.json')).sort()) {
    const id = name.slice(0, -5);
    profiles.set(id, readJson(path.join(PROFILES_DIR, name)));
  }
  return profiles;
}

export function resolveProfiles(requested, profiles = loadProfiles()) {
  const order = [];
  const visiting = new Set();
  const visited = new Set();

  function visit(id, chain = []) {
    if (!profiles.has(id)) throw new Error(`不存在的 Profile：${id}`);
    if (visited.has(id)) return;
    if (visiting.has(id)) throw new Error(`Profile 循环继承：${[...chain, id].join(' -> ')}`);
    visiting.add(id);
    const profile = profiles.get(id);
    for (const parent of profile.extends ?? []) visit(parent, [...chain, id]);
    visiting.delete(id);
    visited.add(id);
    order.push(id);
  }

  for (const id of requested) visit(id);
  return order;
}

export function buildInstallPlan(requested, options = {}) {
  const profiles = options.profiles ?? loadProfiles();
  const registry = options.registry ?? loadRegistry();
  const effectiveProfiles = resolveProfiles(requested, profiles);
  const external = [];
  const local = [];
  const seenExternal = new Set();
  const seenLocal = new Set();

  for (const profileId of effectiveProfiles) {
    const profile = profiles.get(profileId);
    for (const skillId of profile.skills ?? []) {
      if (seenExternal.has(skillId)) continue;
      const skill = registry.get(skillId);
      if (!skill) throw new Error(`${profileId}: Registry 中不存在 Skill：${skillId}`);
      if (!skill.enabled || skill.status !== 'active') {
        throw new Error(`${profileId}: Skill 未启用或不可用：${skillId}`);
      }
      seenExternal.add(skillId);
      external.push(skill);
    }
    for (const skillId of profile.localSkills ?? []) {
      if (seenLocal.has(skillId)) continue;
      const skillDir = path.join(REPO_ROOT, 'skills', skillId);
      if (!fs.existsSync(path.join(skillDir, 'SKILL.md'))) {
        throw new Error(`${profileId}: 本地 Skill 不存在：${skillId}`);
      }
      seenLocal.add(skillId);
      local.push(skillId);
    }
  }

  const groups = new Map();
  for (const skill of external) {
    if (!groups.has(skill.source)) groups.set(skill.source, []);
    groups.get(skill.source).push(skill.id);
  }
  if (local.length > 0) groups.set(ADUI_SOURCE, local);

  return {
    requestedProfiles: [...requested],
    effectiveProfiles,
    externalSkills: external.map((item) => item.id),
    localSkills: local,
    groups: [...groups.entries()].map(([source, skills]) => ({ source, skills })),
  };
}

function parseOptions(args) {
  const options = {
    global: false,
    yes: false,
    copy: false,
    json: false,
    dryRun: false,
    allAgents: false,
    agents: [],
  };
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--global' || arg === '-g') options.global = true;
    else if (arg === '--yes' || arg === '-y') options.yes = true;
    else if (arg === '--copy') options.copy = true;
    else if (arg === '--json') options.json = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--all-agents') options.allAgents = true;
    else if (arg === '--agent' || arg === '-a') {
      const value = args[i + 1];
      if (!value || value.startsWith('-')) throw new Error(`${arg} 需要 agent 名称。`);
      i += 1;
      for (const name of value.split(',').map((item) => item.trim()).filter(Boolean)) {
        if (!options.agents.includes(name)) options.agents.push(name);
      }
    } else if (arg === '--help' || arg === '-h') options.help = true;
    else if (arg.startsWith('-')) throw new Error(`未知参数：${arg}`);
    else positionals.push(arg);
  }
  return { options, positionals };
}

export function buildSkillsCommand(group, options = {}) {
  const command = ['npx', '--yes', 'skills', 'add', group.source, '--skill', ...group.skills];
  if (options.global) command.push('--global');
  if (options.allAgents) command.push('--agent', '*');
  else for (const agent of options.agents ?? []) command.push('--agent', agent);
  if (options.copy) command.push('--copy');
  if (options.yes) command.push('--yes');
  return command;
}

function shellQuote(value) {
  if (/^[A-Za-z0-9_./:@*+-]+$/.test(value)) return value;
  return JSON.stringify(value);
}

function commandText(parts) {
  return parts.map(shellQuote).join(' ');
}

function printPlan(plan, options) {
  console.log('ADui Profile 安装计划');
  console.log('----------------------');
  console.log(`请求 Profiles : ${plan.requestedProfiles.join(', ')}`);
  console.log(`有效 Profiles : ${plan.effectiveProfiles.join(', ')}`);
  console.log(`第三方 Skills  : ${plan.externalSkills.length}`);
  console.log(`ADui Skills    : ${plan.localSkills.length}`);
  console.log(`安装批次       : ${plan.groups.length}`);
  console.log('');
  for (const group of plan.groups) {
    console.log(`- ${group.source}`);
    console.log(`  ${group.skills.join(', ')}`);
    console.log(`  ${commandText(buildSkillsCommand(group, options))}`);
  }
}

function listProfiles(profiles, jsonMode) {
  const data = [...profiles.entries()].map(([id, profile]) => ({
    id,
    name: profile.name,
    description: profile.description,
    extends: profile.extends ?? [],
    skills: profile.skills?.length ?? 0,
    localSkills: profile.localSkills?.length ?? 0,
  }));
  if (jsonMode) console.log(JSON.stringify(data, null, 2));
  else {
    console.log('ADui Profiles');
    console.log('-------------');
    for (const item of data) console.log(`${item.id.padEnd(22)} ${item.name}`);
  }
}

function runInstall(plan, options) {
  if (!options.allAgents && options.agents.length === 0) {
    throw new Error('安装必须显式指定 --agent <name>，或使用 --all-agents。这样可避免 skills CLI 在无 TTY/无已安装 Agent 环境中静默不安装。');
  }
  const effective = { ...options, yes: true };
  const failures = [];

  for (const group of plan.groups) {
    const parts = buildSkillsCommand(group, effective);
    console.log(`\n[安装] ${group.skills.join(', ')}`);
    console.log(commandText(parts));
    if (options.dryRun) continue;
    const result = spawnSync(NPX_COMMAND, parts.slice(1), { stdio: 'inherit', shell: false });
    if (result.status !== 0) failures.push({ source: group.source, skills: group.skills, status: result.status });
  }

  if (!options.dryRun) {
    const listArgs = ['--yes', 'skills', 'list'];
    if (options.global) listArgs.push('--global');
    spawnSync(NPX_COMMAND, listArgs, { stdio: 'inherit', shell: false });
  }

  if (failures.length) {
    console.error(`\n安装完成，但有 ${failures.length} 个来源失败。`);
    for (const failure of failures) console.error(`- ${failure.source}: ${failure.skills.join(', ')}`);
    process.exitCode = 1;
  }
}

function detectProject(projectRoot) {
  const result = spawnSync(process.execPath, [ROUTER_PATH, path.resolve(projectRoot), '--json'], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || '技术栈检测失败。');
  return JSON.parse(result.stdout);
}

function help() {
  console.log(`ADui Profile Manager\n\n用法：\n  node scripts/profile-manager.mjs list [--json]\n  node scripts/profile-manager.mjs show <profile...> [--json]\n  node scripts/profile-manager.mjs plan <profile...> [--agent codex] [--global]\n  node scripts/profile-manager.mjs install <profile...> --agent codex [--agent opencode] [--global] [--copy] [--dry-run]\n  node scripts/profile-manager.mjs auto-install <project-root> --agent codex [--dry-run]\n\n说明：\n  - 默认安装到当前项目；--global 安装到用户级。\n  - 安装操作必须显式指定 --agent，或使用 --all-agents。\n  - --dry-run 只输出计划，不调用 npx skills。\n  - 中文为默认输出；English fallback is available in docs/profile-installer.en.md.`);
}

async function main() {
  const [command = 'help', ...raw] = process.argv.slice(2);
  const { options, positionals } = parseOptions(raw);
  if (options.help || command === 'help') return help();
  const profiles = loadProfiles();

  if (command === 'list') return listProfiles(profiles, options.json);

  if (command === 'show' || command === 'plan' || command === 'install') {
    if (positionals.length === 0) throw new Error(`${command} 至少需要一个 Profile。`);
    const plan = buildInstallPlan(positionals, { profiles });
    if (options.json) console.log(JSON.stringify(plan, null, 2));
    else printPlan(plan, options);
    if (command === 'install') runInstall(plan, options);
    return;
  }

  if (command === 'auto-install') {
    const projectRoot = positionals[0] ?? '.';
    const detected = detectProject(projectRoot);
    if (!detected.directProfiles?.length) throw new Error('没有检测到可安装的 ADui Profile。');
    console.log(`检测项目：${path.resolve(projectRoot)}`);
    console.log(`直接 Profiles：${detected.directProfiles.join(', ')}`);
    if (detected.warnings?.length) {
      console.log('检测警告：');
      for (const warning of detected.warnings) console.log(`- ${warning}`);
    }
    const plan = buildInstallPlan(detected.directProfiles, { profiles });
    printPlan(plan, options);
    runInstall(plan, options);
    return;
  }

  throw new Error(`未知命令：${command}`);
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((error) => {
    console.error(`错误：${error.message}`);
    process.exit(1);
  });
}
