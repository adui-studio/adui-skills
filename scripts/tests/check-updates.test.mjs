import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const testFileDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testFileDir, '..', '..');
const checkerSource = path.join(projectRoot, 'scripts', 'check-updates.mjs');

function run(command, args, cwd, allowFailure = false) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  if (!allowFailure && result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `${command} failed`);
  }
  return result;
}

function git(args, cwd) {
  return run('git', args, cwd);
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function createFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'adui-updater-test-'));
  const workspace = path.join(root, 'workspace');
  const sourceRepo = path.join(root, 'source');
  fs.mkdirSync(path.join(workspace, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(workspace, 'registry'), { recursive: true });
  fs.mkdirSync(path.join(sourceRepo, 'skills', 'alpha'), { recursive: true });
  fs.mkdirSync(path.join(sourceRepo, 'skills', 'beta'), { recursive: true });

  fs.copyFileSync(checkerSource, path.join(workspace, 'scripts', 'check-updates.mjs'));
  fs.writeFileSync(path.join(sourceRepo, 'skills', 'alpha', 'SKILL.md'), `---\nname: alpha\ndescription: test alpha\n---\n# Alpha\n`, 'utf8');
  fs.writeFileSync(path.join(sourceRepo, 'skills', 'beta', 'SKILL.md'), `---\nname: beta\ndescription: test beta\n---\n# Beta\n`, 'utf8');

  git(['init', '-q'], sourceRepo);
  git(['config', 'user.email', 'test@example.com'], sourceRepo);
  git(['config', 'user.name', 'ADui Test'], sourceRepo);
  git(['add', '.'], sourceRepo);
  git(['commit', '-qm', 'initial'], sourceRepo);

  writeJson(path.join(workspace, 'registry', 'skills.json'), {
    version: 2,
    updatedAt: '2026-09-14',
    skills: [
      { id: 'alpha', source: 'fixture/repo', skillPath: 'skills/alpha/SKILL.md', autoResolvePath: true, status: 'active', enabled: true },
      { id: 'beta', source: 'fixture/repo', skillPath: 'skills/beta/SKILL.md', autoResolvePath: true, status: 'active', enabled: true },
    ],
  });
  writeJson(path.join(workspace, 'registry', 'skills.lock.json'), { version: 2, generatedAt: null, skills: {} });
  writeJson(path.join(workspace, 'source-map.json'), { 'fixture/repo': sourceRepo });

  return { root, workspace, sourceRepo };
}

function runChecker(workspace, extra = [], allowFailure = false) {
  return run(
    process.execPath,
    ['scripts/check-updates.mjs', '--source-map', 'source-map.json', ...extra],
    workspace,
    allowFailure,
  );
}

test('建立基线后，无变化再次检查不会改写 Lock', () => {
  const fixture = createFixture();
  try {
    const first = runChecker(fixture.workspace, ['--write']);
    assert.equal(first.status, 0);
    const lockPath = path.join(fixture.workspace, 'registry', 'skills.lock.json');
    const before = fs.readFileSync(lockPath, 'utf8');
    const lock = JSON.parse(before);
    assert.equal(Object.keys(lock.skills).length, 2);
    assert.match(lock.skills.alpha.skillFolderHash, /^[a-f0-9]{40}$/);

    const second = runChecker(fixture.workspace, ['--write']);
    assert.equal(second.status, 0);
    const after = fs.readFileSync(lockPath, 'utf8');
    assert.equal(after, before);
    assert.match(second.stdout, /内容未变化\s+: 2/);
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('Skill 目录移动但内容不变时，只修复路径，不计为内容更新', () => {
  const fixture = createFixture();
  try {
    runChecker(fixture.workspace, ['--write']);
    const oldLock = JSON.parse(fs.readFileSync(path.join(fixture.workspace, 'registry', 'skills.lock.json'), 'utf8'));
    const oldHash = oldLock.skills.beta.skillFolderHash;

    fs.mkdirSync(path.join(fixture.sourceRepo, 'plugins', 'demo', 'skills'), { recursive: true });
    git(['mv', 'skills/beta', 'plugins/demo/skills/beta'], fixture.sourceRepo);
    git(['commit', '-qm', 'move beta'], fixture.sourceRepo);

    const result = runChecker(fixture.workspace, ['--write']);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /内容更新\s+: 0/);
    assert.match(result.stdout, /路径修复\s+: 1/);

    const registry = JSON.parse(fs.readFileSync(path.join(fixture.workspace, 'registry', 'skills.json'), 'utf8'));
    const beta = registry.skills.find((item) => item.id === 'beta');
    assert.equal(beta.skillPath, 'plugins/demo/skills/beta/SKILL.md');

    const lock = JSON.parse(fs.readFileSync(path.join(fixture.workspace, 'registry', 'skills.lock.json'), 'utf8'));
    assert.equal(lock.skills.beta.skillFolderHash, oldHash);
    assert.equal(lock.skills.beta.skillPath, 'plugins/demo/skills/beta/SKILL.md');
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('单个上游失败默认只警告，strict 模式才失败', () => {
  const fixture = createFixture();
  try {
    writeJson(path.join(fixture.workspace, 'source-map.json'), {
      'fixture/repo': path.join(fixture.root, 'missing'),
    });

    const tolerant = runChecker(fixture.workspace, [], true);
    assert.equal(tolerant.status, 0);
    assert.match(tolerant.stdout, /仓库失败\s+: 1/);

    const strict = runChecker(fixture.workspace, ['--strict'], true);
    assert.equal(strict.status, 1);
  } finally {
    fs.rmSync(fixture.root, { recursive: true, force: true });
  }
});
