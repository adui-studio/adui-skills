import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '..', '..');
const releaseCheck = path.join(repoRoot, 'scripts', 'release-check.mjs');
const buildRelease = path.join(repoRoot, 'scripts', 'build-release.mjs');

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function makeReleaseFixture({ initialized = true } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'adui-release-'));
  fs.mkdirSync(path.join(dir, 'docs'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'releases'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'registry'), { recursive: true });
  fs.mkdirSync(path.join(dir, '.github', 'workflows'), { recursive: true });

  writeJson(path.join(dir, 'package.json'), { version: '0.2.0' });
  writeJson(path.join(dir, 'manifest.json'), { name: 'ADui Skills Pack v0.2.0 Public Preview', releaseChannel: 'public-preview' });
  writeJson(path.join(dir, 'registry', 'skills.json'), {
    version: 2,
    skills: [
      { id: 'alpha', source: 'owner/repo', enabled: true, status: 'active' },
      { id: 'disabled', source: 'owner/repo', enabled: false, status: 'upstream-unavailable' },
    ],
  });
  writeJson(path.join(dir, 'registry', 'skills.lock.json'), initialized ? {
    version: 2,
    generatedAt: '2026-09-14T00:00:00.000Z',
    skills: {
      alpha: {
        source: 'owner/repo',
        skillPath: 'skills/alpha/SKILL.md',
        skillFolderHash: '1'.repeat(40),
        repoCommit: '2'.repeat(40),
      },
    },
  } : { version: 2, generatedAt: null, skills: {} });

  for (const file of ['README.md','README.en.md','CHANGELOG.en.md','LICENSE','SECURITY.md','SECURITY.en.md']) {
    fs.writeFileSync(path.join(dir, file), `${file}\n`);
  }
  fs.writeFileSync(path.join(dir, 'CHANGELOG.md'), '# 更新日志\n\n## v0.2.0 - Public Preview\n');
  fs.writeFileSync(path.join(dir, 'docs', 'releasing.md'), '# 发布\n');
  fs.writeFileSync(path.join(dir, 'docs', 'releasing.en.md'), '# Release\n');
  fs.writeFileSync(path.join(dir, 'releases', 'v0.2.0.md'), '# v0.2.0\n');
  fs.writeFileSync(path.join(dir, 'releases', 'v0.2.0.en.md'), '# v0.2.0\n');
  fs.writeFileSync(path.join(dir, '.github', 'workflows', 'release.yml'), 'name: release\n');
  return dir;
}

test('发布前检查在版本与真实 Lock 完整时通过', () => {
  const dir = makeReleaseFixture();
  try {
    const result = spawnSync(process.execPath, [releaseCheck, '--repository-root', dir, '--tag', 'v0.2.0'], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /发布检查通过/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('正式发布会拒绝未初始化的 Folder Hash Lock', () => {
  const dir = makeReleaseFixture({ initialized: false });
  try {
    const result = spawnSync(process.execPath, [releaseCheck, '--repository-root', dir, '--tag', 'v0.2.0'], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stdout, /Lock 尚未建立真实基线/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('发布标签必须与 package.json 版本一致', () => {
  const dir = makeReleaseFixture();
  try {
    const result = spawnSync(process.execPath, [releaseCheck, '--repository-root', dir, '--tag', 'v0.2.1'], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stdout, /与 package.json version 0\.2\.0 不一致/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('Release 产物构建会生成 ZIP 与 SHA256SUMS', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'adui-release-build-'));
  try {
    writeJson(path.join(dir, 'package.json'), { version: '0.2.0' });
    fs.writeFileSync(path.join(dir, 'README.md'), '# fixture\n');
    execFileSync('git', ['init'], { cwd: dir, stdio: 'ignore' });
    execFileSync('git', ['config', 'user.email', 'test@example.com'], { cwd: dir });
    execFileSync('git', ['config', 'user.name', 'Test'], { cwd: dir });
    execFileSync('git', ['add', '.'], { cwd: dir });
    execFileSync('git', ['commit', '-m', 'fixture'], { cwd: dir, stdio: 'ignore' });

    const result = spawnSync(process.execPath, [buildRelease, '--repository-root', dir, '--tag', 'v0.2.0', '--out-dir', 'dist'], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr || result.stdout);

    const zip = path.join(dir, 'dist', 'adui-skills-v0.2.0.zip');
    const sums = path.join(dir, 'dist', 'SHA256SUMS.txt');
    assert.ok(fs.existsSync(zip));
    assert.ok(fs.existsSync(sums));

    const digest = crypto.createHash('sha256').update(fs.readFileSync(zip)).digest('hex');
    assert.equal(fs.readFileSync(sums, 'utf8').trim(), `${digest}  adui-skills-v0.2.0.zip`);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
