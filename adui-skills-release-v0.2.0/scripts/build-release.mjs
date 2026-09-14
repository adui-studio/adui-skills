#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const defaultRepoRoot = path.resolve(scriptDir, '..');

function parseArgs(argv) {
  const args = { repositoryRoot: defaultRepoRoot, tag: null, outDir: 'dist' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repository-root' || arg === '-r') args.repositoryRoot = path.resolve(argv[++i]);
    else if (arg === '--tag') args.tag = argv[++i];
    else if (arg === '--out-dir') args.outDir = argv[++i];
    else if (arg === '--help' || arg === '-h') {
      console.log(`ADui Skills Pack Release 产物构建\n\n用法:\n  node scripts/build-release.mjs --tag v0.2.0 --out-dir dist\n\nEnglish fallback: build the Git archive release ZIP and SHA256SUMS.`);
      process.exit(0);
    } else throw new Error(`未知参数：${arg}`);
  }
  return args;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} 执行失败：\n${result.stderr || result.stdout}`);
  }
  return result.stdout.trim();
}

function sha256(file) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(file));
  return hash.digest('hex');
}

const args = parseArgs(process.argv.slice(2));
const repoRoot = args.repositoryRoot;
const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
const tag = args.tag ?? `v${pkg.version}`;
if (tag !== `v${pkg.version}`) throw new Error(`标签 ${tag} 与 package.json version ${pkg.version} 不一致。`);

const outDir = path.resolve(repoRoot, args.outDir);
fs.mkdirSync(outDir, { recursive: true });
for (const entry of fs.readdirSync(outDir)) {
  if (entry.startsWith('adui-skills-v') || entry === 'SHA256SUMS.txt') fs.rmSync(path.join(outDir, entry), { force: true, recursive: true });
}

const commit = run('git', ['rev-parse', 'HEAD'], { cwd: repoRoot });
const zipName = `adui-skills-${tag}.zip`;
const zipPath = path.join(outDir, zipName);
const prefix = `adui-skills-${tag}/`;
run('git', ['archive', '--format=zip', `--prefix=${prefix}`, `--output=${zipPath}`, 'HEAD'], { cwd: repoRoot });

const digest = sha256(zipPath);
const sumsPath = path.join(outDir, 'SHA256SUMS.txt');
fs.writeFileSync(sumsPath, `${digest}  ${zipName}\n`);

console.log('ADui Skills Pack Release 产物');
console.log('------------------------------');
console.log(`Tag    : ${tag}`);
console.log(`Commit : ${commit}`);
console.log(`ZIP    : ${zipPath}`);
console.log(`SHA256 : ${digest}`);
console.log(`Checks : ${sumsPath}`);
console.log('English fallback: release artifacts built successfully.');
