import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const registry = JSON.parse(fs.readFileSync(path.join(root, 'registry', 'skills.json'), 'utf8'));
const profile = JSON.parse(fs.readFileSync(path.join(root, 'profiles', 'flutter.json'), 'utf8'));
const ids = new Set(registry.skills.map((skill) => skill.id));

test('Flutter Profile 只引用当前 Registry 中启用的 Skill', () => {
  const byId = new Map(registry.skills.map((skill) => [skill.id, skill]));
  for (const id of profile.skills) {
    assert.ok(byId.has(id), `Flutter Profile 引用了不存在的 Skill：${id}`);
    assert.equal(byId.get(id).enabled, true, `Flutter Profile 引用了未启用的 Skill：${id}`);
  }
});

test('Flutter 官方已移除的旧 Skill 不再进入发布 Registry', () => {
  for (const id of [
    'flutter-managing-state',
    'flutter-implementing-navigation-and-routing',
    'flutter-handling-http-and-json',
  ]) {
    assert.equal(ids.has(id), false, `不应继续跟踪已从 flutter/agent-plugins 当前 skills/ 目录移除的 Skill：${id}`);
  }
});

test('Flutter Profile 使用当前官方替代 Skill', () => {
  for (const id of [
    'flutter-setup-declarative-routing',
    'flutter-use-http-package',
    'flutter-implement-json-serialization',
  ]) {
    assert.ok(ids.has(id), `Registry 缺少当前 Flutter 官方 Skill：${id}`);
    assert.ok(profile.skills.includes(id), `Flutter Profile 缺少当前 Flutter 官方 Skill：${id}`);
  }
});

test('已从上游移除的 gh-cli 不参与发布跟踪与 Git Profile', () => {
  const gh = registry.skills.find((skill) => skill.id === 'gh-cli');
  assert.ok(gh);
  assert.equal(gh.source, 'github/awesome-copilot');
  assert.equal(gh.skillPath, null);
  assert.equal(gh.status, 'upstream-unavailable');
  assert.equal(gh.enabled, false);
  assert.deepEqual(gh.profiles, []);

  const gitProfile = JSON.parse(fs.readFileSync(path.join(root, 'profiles', 'git.json'), 'utf8'));
  assert.ok(!gitProfile.skills.includes('gh-cli'));
});
