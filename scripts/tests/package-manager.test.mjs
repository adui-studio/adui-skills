import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  buildPackageRunner,
  checkPackageManagerAvailable,
  detectPackageManager,
  findProjectBoundary,
} from '../lib/package-manager.mjs';

function withTempDir(callback) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'adui-pm-'));
  try {
    return callback(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

test('显式 --pm 优先级最高', () => {
  withTempDir((dir) => {
    writeJson(path.join(dir, 'package.json'), { packageManager: 'pnpm@10.17.1' });
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');
    const result = detectPackageManager(dir, { explicit: 'bun' });
    assert.equal(result.name, 'bun');
    assert.equal(result.source, 'explicit');
  });
});

test('优先读取 package.json#packageManager', () => {
  withTempDir((dir) => {
    writeJson(path.join(dir, 'package.json'), { packageManager: 'pnpm@10.17.1' });
    fs.writeFileSync(path.join(dir, 'package-lock.json'), '{}');
    const result = detectPackageManager(dir, { env: { npm_config_user_agent: 'npm/11.0.0 node/v24' } });
    assert.equal(result.name, 'pnpm');
    assert.equal(result.source, 'packageManager');
  });
});

test('四类 Lock 文件都可识别', () => {
  const cases = [
    ['package-lock.json', 'npm'],
    ['pnpm-lock.yaml', 'pnpm'],
    ['yarn.lock', 'yarn'],
    ['bun.lock', 'bun'],
    ['bun.lockb', 'bun'],
  ];
  for (const [lockfile, expected] of cases) {
    withTempDir((dir) => {
      writeJson(path.join(dir, 'package.json'), {});
      fs.writeFileSync(path.join(dir, lockfile), '');
      const result = detectPackageManager(dir, { env: {} });
      assert.equal(result.name, expected, lockfile);
      assert.equal(result.source, 'lockfile');
    });
  }
});

test('多个不同包管理器 Lock 文件时拒绝自动选择', () => {
  withTempDir((dir) => {
    writeJson(path.join(dir, 'package.json'), {});
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');
    fs.writeFileSync(path.join(dir, 'package-lock.json'), '{}');
    assert.throws(
      () => detectPackageManager(dir, { env: {} }),
      /检测到多个包管理器 Lock 文件/,
    );
  });
});

test('pnpm Monorepo 可从子项目向上识别 workspace 根', () => {
  withTempDir((dir) => {
    const app = path.join(dir, 'apps', 'web');
    fs.mkdirSync(app, { recursive: true });
    writeJson(path.join(dir, 'package.json'), { private: true, workspaces: ['apps/*'] });
    fs.writeFileSync(path.join(dir, 'pnpm-workspace.yaml'), 'packages:\n  - apps/*\n');
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), 'lockfileVersion: 9\n');
    writeJson(path.join(app, 'package.json'), { name: 'web' });
    assert.equal(findProjectBoundary(app), dir);
    const result = detectPackageManager(app, { env: {} });
    assert.equal(result.name, 'pnpm');
    assert.equal(result.source, 'lockfile');
  });
});

test('没有声明和 Lock 时使用当前执行环境', () => {
  withTempDir((dir) => {
    writeJson(path.join(dir, 'package.json'), {});
    const result = detectPackageManager(dir, { env: { npm_config_user_agent: 'yarn/4.9.2 npm/? node/v24.18.0' } });
    assert.equal(result.name, 'yarn');
    assert.equal(result.source, 'environment');
  });
});

test('--no-pm-detect 禁用检测并回退 npm', () => {
  withTempDir((dir) => {
    writeJson(path.join(dir, 'package.json'), { packageManager: 'pnpm@10.17.1' });
    const result = detectPackageManager(dir, { noDetect: true });
    assert.equal(result.name, 'npm');
    assert.equal(result.source, 'fallback');
  });
});

test('四种包管理器生成正确 skills CLI Runner', () => {
  const args = ['add', 'antfu/skills', '--skill', 'vue', '--agent', 'codex', '--yes'];
  assert.deepEqual(buildPackageRunner('npm', args, { platform: 'linux' }).display.slice(0, 3), ['npx', '--yes', 'skills']);
  assert.deepEqual(buildPackageRunner('pnpm', args, { platform: 'linux' }).display.slice(0, 3), ['pnpm', 'dlx', 'skills']);
  assert.deepEqual(buildPackageRunner('yarn', args, { platform: 'linux' }).display.slice(0, 3), ['yarn', 'dlx', 'skills']);
  assert.deepEqual(buildPackageRunner('bun', args, { platform: 'linux' }).display.slice(0, 2), ['bunx', 'skills']);
});

test('Windows Runner 使用 .cmd 可执行文件', () => {
  assert.equal(buildPackageRunner('npm', ['list'], { platform: 'win32' }).executable, 'npx.cmd');
  assert.equal(buildPackageRunner('pnpm', ['list'], { platform: 'win32' }).executable, 'pnpm.cmd');
  assert.equal(buildPackageRunner('yarn', ['list'], { platform: 'win32' }).executable, 'yarn.cmd');
  assert.equal(buildPackageRunner('bun', ['list'], { platform: 'win32' }).executable, 'bunx.cmd');
});

test('Yarn Classic 会在实际安装前被拒绝', () => {
  const fakeSpawn = () => ({ status: 0, stdout: '1.22.22\n', stderr: '' });
  assert.throws(
    () => checkPackageManagerAvailable('yarn', { platform: 'linux', spawn: fakeSpawn }),
    /需要 Yarn 2\+/,
  );
});

test('Profile plan 可显式生成 pnpm dlx 命令', () => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const cli = path.resolve(here, '../profile-manager.mjs');
  const result = spawnSync(process.execPath, [cli, 'plan', 'vue', '--agent', 'codex', '--pm', 'pnpm'], {
    cwd: path.resolve(here, '../..'),
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /包管理器\s+: pnpm/);
  assert.match(result.stdout, /pnpm dlx skills add/);
});

test('auto-install 按目标项目而不是 ADui 仓库检测包管理器', () => {
  withTempDir((dir) => {
    writeJson(path.join(dir, 'package.json'), {
      name: 'fixture',
      packageManager: 'bun@1.2.20',
      dependencies: { vue: '^3.5.0' },
      devDependencies: { vite: '^7.0.0' },
    });
    fs.writeFileSync(path.join(dir, 'bun.lock'), '');

    const here = path.dirname(fileURLToPath(import.meta.url));
    const cli = path.resolve(here, '../profile-manager.mjs');
    const result = spawnSync(process.execPath, [cli, 'auto-install', dir, '--agent', 'codex', '--dry-run'], {
      cwd: path.resolve(here, '../..'),
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /包管理器\s+: bun/);
    assert.match(result.stdout, /bunx skills add/);
    assert.match(result.stdout, new RegExp(dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
});
