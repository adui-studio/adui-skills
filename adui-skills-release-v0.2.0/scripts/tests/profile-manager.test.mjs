import assert from 'node:assert/strict';
import test from 'node:test';

import { buildInstallPlan, buildSkillsCommand, loadProfiles, resolveProfiles } from '../profile-manager.mjs';

test('Vue Profile 展开 core/web/toolchain 且包含 ADui feature-dev', () => {
  const profiles = loadProfiles();
  const effective = resolveProfiles(['vue'], profiles);
  assert.ok(effective.includes('core'));
  assert.ok(effective.includes('web'));
  assert.ok(effective.includes('toolchain'));
  assert.equal(effective.at(-1), 'vue');
  const plan = buildInstallPlan(['vue'], { profiles });
  assert.ok(plan.localSkills.includes('adui-feature-dev'));
  assert.ok(plan.externalSkills.includes('vue-best-practices'));
});

test('多个 Profile 安装计划会去重并按来源分组', () => {
  const plan = buildInstallPlan(['vue', 'unocss', 'git']);
  assert.equal(new Set(plan.externalSkills).size, plan.externalSkills.length);
  assert.equal(new Set(plan.localSkills).size, plan.localSkills.length);
  assert.ok(plan.groups.some((group) => group.source === 'antfu/skills' && group.skills.includes('vue') && group.skills.includes('unocss')));
  assert.ok(plan.groups.some((group) => group.source === 'https://github.com/adui-studio/adui-skills'));
});

test('skills CLI 命令支持多个 Skill、指定 Agent 与项目/全局范围', () => {
  const command = buildSkillsCommand(
    { source: 'antfu/skills', skills: ['vue', 'unocss'] },
    { global: true, yes: true, copy: false, allAgents: false, agents: ['codex', 'opencode'] },
  );
  assert.deepEqual(command.slice(0, 7), ['npx', '--yes', 'skills', 'add', 'antfu/skills', '--skill', 'vue']);
  assert.ok(command.includes('unocss'));
  assert.ok(command.includes('--global'));
  assert.equal(command.filter((item) => item === '--agent').length, 2);
  assert.ok(command.includes('--yes'));
});

test('Tauri Profile 包含 adui-tauri-v2', () => {
  const plan = buildInstallPlan(['tauri']);
  assert.ok(plan.localSkills.includes('adui-tauri-v2'));
  assert.ok(plan.externalSkills.includes('tauri-setup'));
  assert.ok(plan.externalSkills.includes('tauri-config'));
});


test('Profile 命令可切换 npm/pnpm/yarn/bun', () => {
  const group = { source: 'antfu/skills', skills: ['vue'] };
  assert.deepEqual(buildSkillsCommand(group, { packageManager: 'npm' }).slice(0, 3), ['npx', '--yes', 'skills']);
  assert.deepEqual(buildSkillsCommand(group, { packageManager: 'pnpm' }).slice(0, 3), ['pnpm', 'dlx', 'skills']);
  assert.deepEqual(buildSkillsCommand(group, { packageManager: 'yarn' }).slice(0, 3), ['yarn', 'dlx', 'skills']);
  assert.deepEqual(buildSkillsCommand(group, { packageManager: 'bun' }).slice(0, 2), ['bunx', 'skills']);
});

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('实际安装未指定 Agent 时拒绝执行，避免 skills CLI 假成功', () => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const cli = path.resolve(here, '../profile-manager.mjs');
  const result = spawnSync(process.execPath, [cli, 'install', 'tauri', '--dry-run'], { encoding: 'utf8' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /必须显式指定 --agent/);
});
