#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const defaultRepoRoot = path.resolve(scriptDir, '..');

function parseArgs(argv) {
  const args = {
    repositoryRoot: defaultRepoRoot,
    tag: null,
    allowUninitializedLock: false,
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repository-root' || arg === '-r') {
      args.repositoryRoot = path.resolve(argv[++i]);
    } else if (arg === '--tag') {
      args.tag = argv[++i];
    } else if (arg === '--allow-uninitialized-lock') {
      args.allowUninitializedLock = true;
    } else if (arg === '--json') {
      args.json = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`ADui Skills Pack 发布前检查\n\n用法:\n  node scripts/release-check.mjs --tag v0.2.0\n\n参数:\n  -r, --repository-root <path>    仓库根目录\n      --tag <vX.Y.Z>             预期发布标签；默认使用 package.json 版本\n      --allow-uninitialized-lock  仅用于增量包/测试，不应用于正式 Release\n      --json                      输出 JSON\n  -h, --help                      显示帮助\n\nEnglish fallback: verify release readiness before publishing.`);
      process.exit(0);
    } else {
      throw new Error(`未知参数：${arg}`);
    }
  }
  return args;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function exists(repoRoot, rel) {
  return fs.existsSync(path.join(repoRoot, rel));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const repoRoot = args.repositoryRoot;
  const errors = [];
  const warnings = [];

  const requiredFiles = [
    'README.md',
    'README.en.md',
    'CHANGELOG.md',
    'CHANGELOG.en.md',
    'LICENSE',
    'SECURITY.md',
    'SECURITY.en.md',
    'docs/releasing.md',
    'docs/releasing.en.md',
    '.github/workflows/release.yml',
  ];
  for (const file of requiredFiles) {
    if (!exists(repoRoot, file)) errors.push(`缺少发布文件：${file}`);
  }

  let pkg;
  let manifest;
  let registry;
  let lock;
  try { pkg = readJson(path.join(repoRoot, 'package.json')); } catch (error) { errors.push(`package.json 无法解析：${error.message}`); }
  try { manifest = readJson(path.join(repoRoot, 'manifest.json')); } catch (error) { errors.push(`manifest.json 无法解析：${error.message}`); }
  try { registry = readJson(path.join(repoRoot, 'registry/skills.json')); } catch (error) { errors.push(`registry/skills.json 无法解析：${error.message}`); }
  try { lock = readJson(path.join(repoRoot, 'registry/skills.lock.json')); } catch (error) { errors.push(`registry/skills.lock.json 无法解析：${error.message}`); }

  const version = pkg?.version;
  if (!version || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    errors.push(`package.json version 无效：${version ?? 'undefined'}`);
  }
  const expectedTag = args.tag ?? (version ? `v${version}` : null);
  if (expectedTag && version && expectedTag !== `v${version}`) {
    errors.push(`标签 ${expectedTag} 与 package.json version ${version} 不一致。`);
  }
  if (manifest?.name && version && !manifest.name.includes(`v${version}`)) {
    errors.push(`manifest.name 未包含当前版本 v${version}。`);
  }
  if (manifest?.releaseChannel !== 'public-preview' && version?.startsWith('0.2.')) {
    warnings.push(`v0.2.x 建议 manifest.releaseChannel=public-preview，当前为 ${manifest?.releaseChannel ?? 'undefined'}。`);
  }

  if (expectedTag) {
    const releaseZh = `releases/${expectedTag}.md`;
    const releaseEn = `releases/${expectedTag}.en.md`;
    if (!exists(repoRoot, releaseZh)) errors.push(`缺少中文 Release Notes：${releaseZh}`);
    if (!exists(repoRoot, releaseEn)) errors.push(`缺少英文兜底 Release Notes：${releaseEn}`);

    if (exists(repoRoot, 'CHANGELOG.md')) {
      const changelog = fs.readFileSync(path.join(repoRoot, 'CHANGELOG.md'), 'utf8');
      if (!changelog.includes(`## ${expectedTag}`)) errors.push(`CHANGELOG.md 缺少 ${expectedTag} 条目。`);
    }
  }

  const activeIds = Array.isArray(registry?.skills)
    ? registry.skills.filter((skill) => skill?.enabled && skill?.status === 'active').map((skill) => skill.id)
    : [];
  const lockedIds = new Set(Object.keys(lock?.skills ?? {}));
  const missingLock = activeIds.filter((id) => !lockedIds.has(id));
  const initialized = lock?.version === 2 && typeof lock?.generatedAt === 'string' && lock.generatedAt.length > 0;

  if (!args.allowUninitializedLock) {
    if (!initialized) errors.push('第三方 Skill Folder Hash Lock 尚未建立真实基线；正式 Release 禁止继续。');
    if (missingLock.length > 0) {
      errors.push(`Folder Hash Lock 缺少 ${missingLock.length} 个启用 Skill：${missingLock.slice(0, 8).join(', ')}${missingLock.length > 8 ? ' ...' : ''}`);
    }
  } else if (!initialized || missingLock.length > 0) {
    warnings.push(`允许未初始化 Lock：${missingLock.length} 个启用 Skill 尚未锁定。该模式只能用于增量包或自动化测试。`);
  }

  const result = {
    version,
    tag: expectedTag,
    releaseChannel: manifest?.releaseChannel ?? null,
    activeExternalSkills: activeIds.length,
    lockedExternalSkills: activeIds.length - missingLock.length,
    errors,
    warnings,
  };

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log('ADui Skills Pack 发布前检查');
    console.log('---------------------------');
    console.log(`版本             : ${version ?? '-'}`);
    console.log(`标签             : ${expectedTag ?? '-'}`);
    console.log(`发布通道         : ${result.releaseChannel ?? '-'}`);
    console.log(`启用第三方 Skills: ${activeIds.length}`);
    console.log(`已锁定           : ${result.lockedExternalSkills}`);
    console.log(`Warnings         : ${warnings.length}`);
    console.log(`Errors           : ${errors.length}`);
    if (warnings.length) {
      console.log('\n警告：');
      for (const item of warnings) console.log(`- ${item}`);
    }
    if (errors.length) {
      console.log('\n错误：');
      for (const item of errors) console.log(`- ${item}`);
      if (missingLock.length > 0) {
        console.log('\n建议：先修正无法解析的 Registry 条目，再执行：');
        console.log(`npm run updates:apply -- --only ${missingLock.join(',')} --strict`);
        console.log('然后重新执行 npm run release:check -- --tag ' + expectedTag);
      }
    }
    console.log(errors.length ? '\n发布检查失败。' : '\n发布检查通过。');
    console.log(errors.length ? 'English fallback: release preflight failed.' : 'English fallback: release preflight passed.');
  }

  process.exit(errors.length ? 1 : 0);
}

main();
