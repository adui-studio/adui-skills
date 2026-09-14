#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROFILE_GRAPH_PATH = path.join(SCRIPT_DIR, 'profile-graph.json');

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const helpMode = args.includes('--help') || args.includes('-h');
const targetArg = args.find((arg) => !arg.startsWith('-')) ?? '.';
const root = path.resolve(targetArg);

if (helpMode) {
  console.log(`用法：node detect-stack.mjs [project-root] [--json]\n\n只读检测项目技术栈，并路由到 ADui Profiles。\nEnglish fallback: read-only ADui technology stack detector.`);
  process.exit(0);
}

if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
  console.error(`项目根目录不存在或不是目录：${root}`);
  process.exit(2);
}

const detections = new Map();
const warnings = [];
const candidates = [];
const directProfiles = new Set();

function rel(filePath) {
  return path.relative(root, filePath) || '.';
}

function exists(...segments) {
  return fs.existsSync(path.join(root, ...segments));
}

function firstExisting(paths) {
  for (const item of paths) {
    const abs = path.join(root, item);
    if (fs.existsSync(abs)) return abs;
  }
  return null;
}

function readText(filePath, maxBytes = 1024 * 1024) {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile() || stat.size > maxBytes) return null;
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function readJson(filePath) {
  const text = readText(filePath);
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch {
    warnings.push(`无法解析 JSON：${rel(filePath)}`);
    return null;
  }
}

function addDetection(id, profile, confidence, evidence) {
  const current = detections.get(id) ?? {
    id,
    profile,
    confidence,
    evidence: [],
  };

  const rank = { low: 1, medium: 2, high: 3 };
  if ((rank[confidence] ?? 0) > (rank[current.confidence] ?? 0)) {
    current.confidence = confidence;
  }

  if (evidence && !current.evidence.includes(evidence)) {
    current.evidence.push(evidence);
  }

  detections.set(id, current);
  if (profile && confidence !== 'low') directProfiles.add(profile);
}

function allDependencies(pkg) {
  return {
    ...(pkg?.dependencies ?? {}),
    ...(pkg?.devDependencies ?? {}),
    ...(pkg?.peerDependencies ?? {}),
    ...(pkg?.optionalDependencies ?? {}),
  };
}

function hasDependency(deps, name) {
  return Object.prototype.hasOwnProperty.call(deps, name);
}

function hasDependencyPrefix(deps, prefix) {
  return Object.keys(deps).some((name) => name.startsWith(prefix));
}

function findConfig(baseNames) {
  const exts = ['js', 'mjs', 'cjs', 'ts', 'mts', 'cts'];
  for (const base of baseNames) {
    for (const ext of exts) {
      const p = path.join(root, `${base}.${ext}`);
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

function scanSourceTokens(tokens, options = {}) {
  const roots = options.roots ?? ['src', 'lib', 'app', 'packages'];
  const maxFiles = options.maxFiles ?? 250;
  const maxBytes = options.maxBytes ?? 512 * 1024;
  const extensions = new Set(options.extensions ?? [
    '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.vue', '.svelte', '.html', '.wgsl', '.glsl', '.vert', '.frag', '.uts', '.uvue',
  ]);
  const ignored = new Set(['node_modules', '.git', 'dist', 'build', '.next', '.nuxt', 'coverage', '.dart_tool', 'target']);
  const hits = [];
  let visited = 0;

  function walk(dir) {
    if (visited >= maxFiles || !fs.existsSync(dir)) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (visited >= maxFiles) break;
      if (ignored.has(entry.name)) continue;
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
        continue;
      }
      if (!entry.isFile() || !extensions.has(path.extname(entry.name))) continue;
      visited += 1;
      const text = readText(abs, maxBytes);
      if (text === null) continue;
      for (const token of tokens) {
        if (typeof token === 'string' ? text.includes(token) : token.test(text)) {
          hits.push({ file: rel(abs), token: String(token) });
          return;
        }
      }
    }
  }

  for (const dir of roots) walk(path.join(root, dir));
  return hits;
}

const packagePath = path.join(root, 'package.json');
const pkg = fs.existsSync(packagePath) ? readJson(packagePath) : null;
const deps = allDependencies(pkg);

if (exists('.git')) {
  addDetection('git', 'git', 'high', '.git directory');
}

if (pkg) {
  if (hasDependency(deps, 'vue')) addDetection('vue', 'vue', 'high', 'package.json: vue dependency');
  if (hasDependency(deps, 'react')) addDetection('react', 'react', 'high', 'package.json: react dependency');
  if (hasDependency(deps, '@nestjs/core')) addDetection('nestjs', 'backend', 'high', 'package.json: @nestjs/core');
  if (hasDependency(deps, 'prisma') || hasDependency(deps, '@prisma/client')) addDetection('prisma', 'prisma', 'high', 'package.json: Prisma dependency');
  if (hasDependency(deps, 'three') || hasDependency(deps, '@react-three/fiber')) addDetection('threejs', 'threejs', 'high', 'package.json: Three.js dependency');
  if (hasDependencyPrefix(deps, '@babylonjs/')) addDetection('babylonjs', 'babylonjs', 'high', 'package.json: @babylonjs/* dependency');
  if (hasDependency(deps, 'cesium') || hasDependency(deps, 'resium') || hasDependencyPrefix(deps, '@cesium/')) addDetection('cesiumjs', 'cesiumjs', 'high', 'package.json: Cesium dependency');
  if (hasDependency(deps, '@tauri-apps/api') || hasDependencyPrefix(deps, '@tauri-apps/')) addDetection('tauri', 'tauri', 'high', 'package.json: @tauri-apps/* dependency');

  const hasTailwindDep = hasDependency(deps, 'tailwindcss') || hasDependencyPrefix(deps, '@tailwindcss/');
  const hasUnoDep = hasDependency(deps, 'unocss') || hasDependencyPrefix(deps, '@unocss/');
  if (hasTailwindDep) addDetection('tailwind', 'tailwind', 'high', 'package.json: Tailwind CSS dependency');
  if (hasUnoDep) addDetection('unocss', 'unocss', 'high', 'package.json: UnoCSS dependency');

  if (hasDependency(deps, 'vite-plus')) addDetection('viteplus', 'viteplus', 'high', 'package.json: vite-plus dependency');
  else if (hasDependency(deps, 'vite')) addDetection('vite', 'toolchain', 'high', 'package.json: vite dependency');

  if (typeof pkg.packageManager === 'string' && pkg.packageManager.startsWith('pnpm@')) {
    addDetection('pnpm', 'pnpm', 'high', `package.json: packageManager=${pkg.packageManager}`);
  }

  if (hasDependency(deps, '@dcloudio/uni-app') || hasDependencyPrefix(deps, '@dcloudio/uni-')) {
    addDetection('uniapp', 'uniapp', 'high', 'package.json: @dcloudio/uni-* dependency');
  }

  if (hasDependency(deps, '@cloudbase/js-sdk') || hasDependencyPrefix(deps, '@cloudbase/')) {
    addDetection('wechat-cloudbase', 'wechat-cloudbase', 'high', 'package.json: CloudBase dependency');
  }

  if (hasDependency(deps, '@webgpu/types')) addDetection('webgpu', 'webgpu', 'high', 'package.json: @webgpu/types');

  if (hasDependency(deps, 'pg') || hasDependency(deps, 'postgres') || hasDependency(deps, '@neondatabase/serverless')) {
    addDetection('postgresql', 'postgresql', 'medium', 'package.json: PostgreSQL driver dependency');
  }
  if (hasDependency(deps, 'mysql') || hasDependency(deps, 'mysql2')) {
    addDetection('mysql', 'mysql', 'medium', 'package.json: MySQL driver dependency');
  }
  if (hasDependency(deps, 'better-sqlite3') || hasDependency(deps, 'sqlite3') || hasDependency(deps, '@libsql/client')) {
    addDetection('sqlite', 'sqlite', 'medium', 'package.json: SQLite driver dependency');
  }
}

if (exists('pnpm-lock.yaml') || exists('pnpm-workspace.yaml') || exists('.pnpmfile.cjs') || exists('pnpmfile.cjs')) {
  addDetection('pnpm', 'pnpm', 'high', 'pnpm workspace/lock/config file');
}

const viteConfig = findConfig(['vite.config']);
if (viteConfig) {
  const viteText = readText(viteConfig) ?? '';
  if (/from\s+['"]vite-plus['"]|require\(['"]vite-plus['"]\)/.test(viteText)) {
    addDetection('viteplus', 'viteplus', 'high', `${rel(viteConfig)} imports vite-plus`);
  } else {
    addDetection('vite', 'toolchain', 'medium', `${rel(viteConfig)} exists`);
  }
  if (/UnoCSS|unocss|@unocss\//.test(viteText)) addDetection('unocss', 'unocss', 'high', `${rel(viteConfig)} configures UnoCSS`);
}

const unoConfig = findConfig(['uno.config', 'unocss.config']);
if (unoConfig) addDetection('unocss', 'unocss', 'high', `${rel(unoConfig)} exists`);

const tailwindConfig = findConfig(['tailwind.config']);
if (tailwindConfig) addDetection('tailwind', 'tailwind', 'high', `${rel(tailwindConfig)} exists`);

if (exists('src-tauri') || firstExisting(['src-tauri/tauri.conf.json', 'src-tauri/tauri.conf.json5'])) {
  addDetection('tauri', 'tauri', 'high', 'src-tauri/ exists');
}

const prismaSchema = firstExisting(['prisma/schema.prisma', 'schema.prisma']);
if (prismaSchema) {
  addDetection('prisma', 'prisma', 'high', `${rel(prismaSchema)} exists`);
  const schema = readText(prismaSchema) ?? '';
  const providers = [...schema.matchAll(/provider\s*=\s*["'](postgresql|mysql|sqlite)["']/g)].map((m) => m[1]);
  for (const provider of new Set(providers)) {
    addDetection(provider, provider, 'high', `${rel(prismaSchema)} datasource provider=${provider}`);
  }
}

const pubspecPath = path.join(root, 'pubspec.yaml');
if (fs.existsSync(pubspecPath)) {
  const pubspec = readText(pubspecPath) ?? '';
  if (/sdk:\s*flutter|^flutter:\s*$/m.test(pubspec)) {
    addDetection('flutter', 'flutter', 'high', 'pubspec.yaml: Flutter SDK/project section');
  }
}

const uniPages = firstExisting(['pages.json', 'src/pages.json']);
const uniManifest = firstExisting(['manifest.json', 'src/manifest.json']);
if (uniPages && uniManifest) {
  if (detections.has('uniapp')) {
    addDetection('uniapp', 'uniapp', 'high', `${rel(uniPages)} + ${rel(uniManifest)}`);
  } else {
    addDetection('uniapp', 'uniapp', 'medium', `${rel(uniPages)} + ${rel(uniManifest)}`);
  }
}

const utsHits = scanSourceTokens([/\b(?:export\s+)?(?:function|class|interface)\b/, /@UTS/], {
  extensions: ['.uts', '.uvue'],
  maxFiles: 120,
});
if (utsHits.length > 0) {
  addDetection('uniapp-x', 'uniapp-x', detections.has('uniapp') ? 'medium' : 'medium', `UTS/UVue source: ${utsHits[0].file}`);
}

const projectConfigPath = path.join(root, 'project.config.json');
if (fs.existsSync(projectConfigPath)) {
  const projectConfig = readJson(projectConfigPath);
  const miniprogramRoot = typeof projectConfig?.miniprogramRoot === 'string' ? projectConfig.miniprogramRoot : '';
  const miniRoot = miniprogramRoot ? path.join(root, miniprogramRoot) : root;
  const appJson = path.join(miniRoot, 'app.json');
  if (fs.existsSync(appJson) || projectConfig?.compileType === 'miniprogram') {
    addDetection('wechat-miniprogram', 'wechat-miniprogram', 'high', `${rel(projectConfigPath)} indicates mini program`);
  }
}

const webgpuHits = scanSourceTokens(['navigator.gpu', 'GPUDevice', 'GPUAdapter', 'createComputePipeline']);
if (webgpuHits.length > 0) addDetection('webgpu', 'webgpu', 'medium', `source API usage: ${webgpuHits[0].file}`);

const webgl2Hits = scanSourceTokens([/getContext\(\s*['"]webgl2['"]\s*\)/, 'WebGL2RenderingContext']);
if (webgl2Hits.length > 0) addDetection('webgl2', 'webgl2', 'medium', `source API usage: ${webgl2Hits[0].file}`);

const cloudHits = scanSourceTokens(['wx.cloud', 'cloud.init(', 'cloud.database('], { maxFiles: 180 });
if (cloudHits.length > 0) addDetection('wechat-cloudbase', 'wechat-cloudbase', 'medium', `source CloudBase API usage: ${cloudHits[0].file}`);

if (detections.has('tailwind') && detections.has('unocss')) {
  const tailwindStrong = Boolean(tailwindConfig) || detections.get('tailwind').evidence.some((e) => e.includes('Tailwind CSS dependency'));
  const unoStrong = Boolean(unoConfig) || detections.get('unocss').evidence.some((e) => e.includes('configures UnoCSS'));
  if (tailwindStrong && unoStrong) {
    warnings.push('同时检测到 Tailwind CSS 和 UnoCSS。修改样式规范前，请确认两者是否确实同时启用。');
  }
}

if (detections.has('nestjs') && detections.has('prisma')) {
  addDetection('nestjs-prisma', 'nestjs-prisma', 'high', '同时检测到 NestJS 与 Prisma');
}

if (detections.has('prisma') && !['postgresql', 'mysql', 'sqlite'].some((id) => detections.has(id))) {
  warnings.push('检测到 Prisma，但无法确定数据库 provider。选择数据库引擎 Profile 前，请检查 datasource 配置。');
}

if (detections.has('uniapp') && detections.has('uniapp-x')) {
  warnings.push('同时检测到 uni-app 与 uni-app x 信号。UTS/UVue 也可能来自普通 uni-app 插件，请确认主应用运行时。');
}

const graph = readJson(PROFILE_GRAPH_PATH) ?? {};

function expandProfile(name, result = new Set(), visiting = new Set()) {
  if (visiting.has(name) || result.has(name)) return result;
  visiting.add(name);
  for (const parent of graph[name] ?? []) expandProfile(parent, result, visiting);
  visiting.delete(name);
  result.add(name);
  return result;
}

function ancestorsOf(name, result = new Set()) {
  for (const parent of graph[name] ?? []) {
    if (result.has(parent)) continue;
    result.add(parent);
    ancestorsOf(parent, result);
  }
  return result;
}

if (directProfiles.size === 0) directProfiles.add('core');

// Keep direct profiles minimal: if one selected profile already inherits another,
// the inherited profile belongs only in effectiveProfiles.
for (const candidate of [...directProfiles]) {
  for (const other of directProfiles) {
    if (candidate === other) continue;
    if (ancestorsOf(other).has(candidate)) {
      directProfiles.delete(candidate);
      break;
    }
  }
}

const effectiveProfiles = new Set();
for (const profile of directProfiles) expandProfile(profile, effectiveProfiles);

const profileOrder = [
  'core', 'web', 'toolchain', 'viteplus', 'pnpm', 'vue', 'react', 'tailwind', 'unocss',
  'backend', 'database', 'prisma', 'nestjs-prisma', 'postgresql', 'mysql', 'sqlite', 'flutter', 'tauri',
  'uniapp', 'uniapp-x', 'wechat-miniprogram', 'wechat-cloudbase', 'threejs', 'babylonjs',
  'cesiumjs', 'webgl2', 'webgpu', 'git',
];

function sortProfiles(values) {
  return [...values].sort((a, b) => {
    const ai = profileOrder.indexOf(a);
    const bi = profileOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

const result = {
  root,
  detected: [...detections.values()].sort((a, b) => a.id.localeCompare(b.id)),
  directProfiles: sortProfiles(directProfiles),
  effectiveProfiles: sortProfiles(effectiveProfiles),
  candidates,
  warnings,
};

if (jsonMode) {
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

console.log('ADui Stack Router');
console.log('=================');
console.log(`项目：${root}`);
console.log('');
console.log('检测到的技术栈');
if (result.detected.length === 0) {
  console.log('- 未检测到受支持的技术栈信号');
} else {
  for (const item of result.detected) {
    console.log(`- ${item.id} — ${item.confidence}`);
    for (const evidence of item.evidence) console.log(`  - ${evidence}`);
  }
}

console.log('');
console.log('直接 Profiles');
for (const profile of result.directProfiles) console.log(`- ${profile}`);

console.log('');
console.log('有效 Profiles');
for (const profile of result.effectiveProfiles) console.log(`- ${profile}`);

console.log('');
console.log('警告');
if (result.warnings.length === 0) console.log('- 无');
else for (const warning of result.warnings) console.log(`- ${warning}`);
