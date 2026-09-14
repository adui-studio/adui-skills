#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const args = { repositoryRoot: '.', force: false, skipValidate: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repository-root' || arg === '-r') {
      args.repositoryRoot = argv[++i];
    } else if (arg === '--force' || arg === '-f') {
      args.force = true;
    } else if (arg === '--skip-validate') {
      args.skipValidate = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`ADui Skills Pack v0.2.0 增量应用器\n\n用法:\n  node apply.mjs --repository-root <仓库路径> --force\n\n参数:\n  -r, --repository-root  目标仓库根目录，默认当前目录\n  -f, --force            覆盖由本增量包管理的已有文件\n      --skip-validate    应用后不执行 Registry 校验\n  -h, --help             显示帮助\n\nEnglish fallback: apply the v0.2.0 patch to an ADui Skills Pack repository.`);
      process.exit(0);
    } else {
      throw new Error(`未知参数：${arg}`);
    }
  }
  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(source, target, force) {
  if (fs.existsSync(target) && !force) {
    console.log(`[跳过] 已存在：${path.relative(repoRoot, target)}`);
    return;
  }
  ensureDir(path.dirname(target));
  fs.copyFileSync(source, target);
  console.log(`[完成] ${path.relative(repoRoot, target)}`);
}

function copyDirectoryContents(sourceDir, targetDir, force) {
  ensureDir(targetDir);
  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const source = path.join(sourceDir, entry.name);
    const target = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyDirectoryContents(source, target, force);
    } else if (entry.isFile()) {
      copyFile(source, target, force);
    }
  }
}

function copyManagedItem(relativePath, force) {
  const source = path.join(packageRoot, relativePath);
  const target = path.join(repoRoot, relativePath);
  if (!fs.existsSync(source)) {
    throw new Error(`增量包中缺少文件：${relativePath}`);
  }
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    copyDirectoryContents(source, target, force);
  } else {
    copyFile(source, target, force);
  }
}

function removeKnownBadNestedDirectory(relativePath, markerRelativePath) {
  const target = path.join(repoRoot, relativePath);
  const marker = path.join(target, markerRelativePath);
  if (fs.existsSync(target) && fs.existsSync(marker)) {
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`[清理] 已移除 v0.1.4 错误复制目录：${relativePath}`);
  }
}

function assertPatchRegistryV2() {
  const registry = JSON.parse(fs.readFileSync(path.join(packageRoot, 'registry/skills.json'), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(path.join(packageRoot, 'registry/skills.lock.json'), 'utf8'));
  if (!Number.isInteger(registry.version) || registry.version < 2) {
    throw new Error(`增量包自身 registry.version 异常：${registry.version}`);
  }
  if (lock.version !== 2) {
    throw new Error(`增量包自身 skills.lock.version 异常：${lock.version}`);
  }
}

function assertAppliedRegistryV2() {
  const registry = JSON.parse(fs.readFileSync(path.join(repoRoot, 'registry/skills.json'), 'utf8'));
  const lock = JSON.parse(fs.readFileSync(path.join(repoRoot, 'registry/skills.lock.json'), 'utf8'));
  if (!Number.isInteger(registry.version) || registry.version < 2) {
    throw new Error(`应用失败：目标仓库 registry.version 仍为 ${registry.version}，期望 >= 2。`);
  }
  if (lock.version !== 2) {
    throw new Error(`应用失败：目标仓库 skills.lock.version 仍为 ${lock.version}，期望 2。`);
  }
}

const args = parseArgs(process.argv.slice(2));
const repoRoot = path.resolve(args.repositoryRoot);

if (!fs.existsSync(repoRoot)) {
  throw new Error(`仓库目录不存在：${repoRoot}`);
}
if (!fs.existsSync(path.join(repoRoot, '.git'))) {
  console.warn('[警告] 目标目录中未发现 .git；请确认这是 ADui Skills Pack 仓库根目录。');
}

assertPatchRegistryV2();

let preservedLock = null;
const existingLockPath = path.join(repoRoot, 'registry/skills.lock.json');
if (fs.existsSync(existingLockPath)) {
  try {
    const existingLock = JSON.parse(fs.readFileSync(existingLockPath, 'utf8'));
    if (existingLock.version === 2 && Object.keys(existingLock.skills ?? {}).length > 0) {
      preservedLock = fs.readFileSync(existingLockPath, 'utf8');
      console.log('[保留] 检测到现有 Folder Hash Lock 基线，应用后将恢复。');
    }
  } catch {
    console.warn('[警告] 现有 skills.lock.json 无法解析，将由增量包版本覆盖。');
  }
}

console.log('ADui Skills Pack v0.2.0 增量应用');
console.log('--------------------------------');
console.log(`目标仓库：${repoRoot}`);
console.log(`覆盖模式：${args.force ? '是' : '否'}`);
console.log('');

// v0.1.4 的 PowerShell 安装器可能把“目录本身”复制进同名目标目录，
// 形成 registry/registry、profiles/profiles 等。这里只清理可明确识别的已知错误产物。
removeKnownBadNestedDirectory('registry/registry', 'skills.json');
removeKnownBadNestedDirectory('profiles/profiles', 'core.json');
removeKnownBadNestedDirectory('scripts/tests/tests', 'check-updates.test.mjs');
removeKnownBadNestedDirectory('skills/adui-stack-router/adui-stack-router', 'SKILL.md');

const managedItems = [
  'registry',
  'profiles',
  'scripts/check-updates.mjs',
  'scripts/validate-registry.mjs',
  'scripts/profile-manager.mjs',
  'scripts/lib',
  'scripts/tests',
  '.github/workflows/validate.yml',
  '.github/workflows/weekly-update.yml',
  '.github/workflows/sync-cnb.yml',
  'skills/adui-stack-router',
  'skills/adui-feature-dev',
  'skills/adui-viteplus',
  'skills/adui-nestjs-prisma',
  'skills/adui-3d-architecture',
  'skills/adui-webgl2',
  'skills/adui-tauri-v2',
  'docs/development.md',
  'docs/development.en.md',
  'docs/viteplus.md',
  'docs/viteplus.en.md',
  'docs/nestjs-prisma.md',
  'docs/nestjs-prisma.en.md',
  'docs/3d-architecture.md',
  'docs/3d-architecture.en.md',
  'docs/webgl2.md',
  'docs/webgl2.en.md',
  'docs/tauri-v2.md',
  'docs/tauri-v2.en.md',
  'docs/profile-installer.md',
  'docs/profile-installer.en.md',
  'docs/usage.md',
  'docs/usage.en.md',
  'docs/maintenance.md',
  'docs/maintenance.en.md',
  'docs/architecture.md',
  'docs/architecture.en.md',
  'docs/adding-skills.md',
  'docs/adding-skills.en.md',
  'docs/security.md',
  'docs/security.en.md',
  'README.md',
  'README.en.md',
  'AGENTS.md',
  'AGENTS.en.md',
  'CONTRIBUTING.md',
  'CONTRIBUTING.en.md',
  'CHANGELOG.md',
  'CHANGELOG.en.md',
  'SECURITY.md',
  'SECURITY.en.md',
  'RELEASE.md',
  'RELEASE.en.md',
  'LICENSE',
  '.gitignore',
  'releases',
  'docs/releasing.md',
  'docs/releasing.en.md',
  'scripts/release-check.mjs',
  'scripts/build-release.mjs',
  '.github/workflows/release.yml',
  '.github/release.yml',
  '.github/PULL_REQUEST_TEMPLATE.md',
  '.github/ISSUE_TEMPLATE',
  'manifest.json',
  'package.json'
];

for (const item of managedItems) {
  copyManagedItem(item, args.force);
}

if (preservedLock !== null) {
  fs.writeFileSync(path.join(repoRoot, 'registry/skills.lock.json'), preservedLock);
  console.log('[恢复] 已恢复现有 Folder Hash Lock 基线。');
}

assertAppliedRegistryV2();

if (!args.skipValidate) {
  console.log('');
  console.log('开始执行 Registry / Profile 校验...');
  const result = spawnSync(process.execPath, [path.join(repoRoot, 'scripts/validate-registry.mjs')], {
    cwd: repoRoot,
    stdio: 'inherit'
  });
  if (result.status !== 0) {
    throw new Error(`应用完成，但校验失败，退出码：${result.status ?? 'unknown'}`);
  }
}

console.log('');
console.log('ADui Skills Pack v0.2.0 已成功应用。');
console.log('建议继续执行：');
console.log('  npm test');
console.log('  npm run profile:list');
console.log('  npm run release:check -- --tag v0.2.0');
console.log('  git status');
console.log('  git diff');
console.log('');
console.log('English fallback: v0.2.0 patch applied successfully. Review the Git diff before committing.');
