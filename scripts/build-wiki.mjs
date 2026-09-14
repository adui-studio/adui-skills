import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

function getArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

const outputArg = getArg('--output');
const outputDir = outputArg
  ? path.resolve(repoRoot, outputArg)
  : path.join(repoRoot, '.wiki-build');

const pages = [
  ['docs/usage.md', 'Usage', '使用指南'],
  ['docs/usage.en.md', 'Usage-EN', 'Usage'],
  ['docs/profile-installer.md', 'Profile-Installer', 'Profile 一键安装器'],
  ['docs/profile-installer.en.md', 'Profile-Installer-EN', 'Profile Installer'],
  ['docs/weekly-ranking.md', 'Weekly-Skills-Ranking', 'skills.sh 每周分类排行'],
  ['docs/weekly-ranking.en.md', 'Weekly-Skills-Ranking-EN', 'Weekly skills.sh Ranking'],
  ['docs/architecture.md', 'Architecture', '总体架构'],
  ['docs/architecture.en.md', 'Architecture-EN', 'Architecture'],
  ['docs/development.md', 'Development', '功能开发规范'],
  ['docs/development.en.md', 'Development-EN', 'Feature Development'],
  ['docs/adding-skills.md', 'Adding-Skills', '添加 Skill'],
  ['docs/adding-skills.en.md', 'Adding-Skills-EN', 'Adding Skills'],
  ['docs/maintenance.md', 'Maintenance', '维护与每周更新'],
  ['docs/maintenance.en.md', 'Maintenance-EN', 'Maintenance'],
  ['docs/security.md', 'Security', '安全规范'],
  ['docs/security.en.md', 'Security-EN', 'Security'],
  ['docs/releasing.md', 'Releasing', '发布流程'],
  ['docs/releasing.en.md', 'Releasing-EN', 'Release Process'],
  ['docs/viteplus.md', 'VitePlus', 'Vite+ 工程规范'],
  ['docs/viteplus.en.md', 'VitePlus-EN', 'Vite+ Engineering'],
  ['docs/nestjs-prisma.md', 'NestJS-Prisma', 'NestJS + Prisma 集成规范'],
  ['docs/nestjs-prisma.en.md', 'NestJS-Prisma-EN', 'NestJS + Prisma'],
  ['docs/3d-architecture.md', '3D-Architecture', '3D / GPU 架构'],
  ['docs/3d-architecture.en.md', '3D-Architecture-EN', '3D / GPU Architecture'],
  ['docs/webgl2.md', 'WebGL2', 'WebGL2 工程规范'],
  ['docs/webgl2.en.md', 'WebGL2-EN', 'WebGL2 Engineering'],
  ['docs/tauri-v2.md', 'Tauri-v2', 'Tauri v2 工程规范'],
  ['docs/tauri-v2.en.md', 'Tauri-v2-EN', 'Tauri v2 Engineering'],
  ['docs/wiki.md', 'GitHub-Wiki', 'GitHub Wiki 维护'],
  ['docs/wiki.en.md', 'GitHub-Wiki-EN', 'GitHub Wiki Maintenance'],
  ['CONTRIBUTING.md', 'Contributing', '贡献指南'],
  ['CONTRIBUTING.en.md', 'Contributing-EN', 'Contributing'],
  ['SECURITY.md', 'Security-Policy', '安全策略'],
  ['SECURITY.en.md', 'Security-Policy-EN', 'Security Policy'],
  ['RELEASE.md', 'Release-Checklist', '发布检查清单'],
  ['RELEASE.en.md', 'Release-Checklist-EN', 'Release Checklist'],
  ['CHANGELOG.md', 'Changelog', '变更记录'],
  ['CHANGELOG.en.md', 'Changelog-EN', 'Changelog'],
];

const existingPages = pages.filter(([source]) => fs.existsSync(path.join(repoRoot, source)));
const sourceToSlug = new Map(existingPages.map(([source, slug]) => [source, slug]));

function rewriteMarkdownLinks(content, sourcePath) {
  const sourceDir = path.posix.dirname(sourcePath);

  return content.replace(/\]\(([^)]+\.md)(#[^)]+)?\)/g, (full, rawTarget, hash = '') => {
    if (/^(?:https?:|mailto:)/i.test(rawTarget)) return full;

    const normalized = path.posix.normalize(path.posix.join(sourceDir, rawTarget));
    const slug = sourceToSlug.get(normalized);
    if (!slug) return full;

    return `](${slug}${hash})`;
  });
}

function languageNotice(source, slug) {
  const isEnglish = source.endsWith('.en.md');
  const counterpart = isEnglish ? slug.replace(/-EN$/, '') : `${slug}-EN`;
  const counterpartExists = existingPages.some(([, candidate]) => candidate === counterpart);

  if (!counterpartExists) return '';

  return isEnglish
    ? `> 🌐 [简体中文](${counterpart}) · This page is automatically synchronized from the main repository.\n\n`
    : `> 🌐 [English](${counterpart}) · 本页由主仓库自动同步，请在主仓库修改源文档。\n\n`;
}

function writeSourcePage(source, slug) {
  const sourceFile = path.join(repoRoot, source);
  let content = fs.readFileSync(sourceFile, 'utf8').trimEnd();
  content = rewriteMarkdownLinks(content, source);

  const notice = languageNotice(source, slug);
  fs.writeFileSync(path.join(outputDir, `${slug}.md`), `${notice}${content}\n`, 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), 'utf8'));
}

function countLocalSkills() {
  const skillsDir = path.join(repoRoot, 'skills');
  if (!fs.existsSync(skillsDir)) return 0;

  return fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(skillsDir, entry.name, 'SKILL.md')))
    .length;
}

function countProfiles() {
  const profilesDir = path.join(repoRoot, 'profiles');
  if (!fs.existsSync(profilesDir)) return 0;

  return fs.readdirSync(profilesDir)
    .filter((name) => name.endsWith('.json'))
    .length;
}

function buildHome() {
  const pkg = readJson('package.json');
  const registry = readJson('registry/skills.json');
  const registrySkills = Array.isArray(registry.skills) ? registry.skills : [];
  const enabled = registrySkills.filter((skill) => skill.enabled).length;
  const profiles = countProfiles();
  const localSkills = countLocalSkills();

  const home = `# ADui Skills Pack Wiki\n\n` +
    `ADui Skills Pack 是面向 AI Coding / Agent 开发的可维护 Skills 集合，覆盖全栈、跨端、数据库、Git 交付与 Web 3D/GPU。\n\n` +
    `> **当前版本：v${pkg.version}** · Wiki 以主仓库文档为事实源，由 GitHub Actions 自动发布。\n\n` +
    `## 当前数据\n\n` +
    `- Registry：${registrySkills.length} 条记录\n` +
    `- 启用第三方 Skills：${enabled} 个\n` +
    `- Profiles：${profiles} 个\n` +
    `- ADui 自研 Skills：${localSkills} 个\n\n` +
    `## 从这里开始\n\n` +
    `- [[使用指南|Usage]]\n` +
    `- [[Profile 一键安装器|Profile-Installer]]\n` +
    `- [[skills.sh 每周分类排行|Weekly-Skills-Ranking]]\n` +
    `- [[总体架构|Architecture]]\n` +
    `- [[功能开发规范|Development]]\n` +
    `- [[维护与每周更新|Maintenance]]\n` +
    `- [[发布流程|Releasing]]\n\n` +
    `## 技术专题\n\n` +
    `- [[Vite+ 工程规范|VitePlus]]\n` +
    `- [[NestJS + Prisma 集成规范|NestJS-Prisma]]\n` +
    `- [[3D / GPU 架构|3D-Architecture]]\n` +
    `- [[WebGL2 工程规范|WebGL2]]\n` +
    `- [[Tauri v2 工程规范|Tauri-v2]]\n\n` +
    `## 项目入口\n\n` +
    `- [GitHub 主仓库](https://github.com/adui-studio/adui-skills)\n` +
    `- [Releases](https://github.com/adui-studio/adui-skills/releases)\n` +
    `- [Issues](https://github.com/adui-studio/adui-skills/issues)\n` +
    `- [[English Home|Home-EN]]\n`;

  const homeEn = `# ADui Skills Pack Wiki\n\n` +
    `ADui Skills Pack is a maintainable collection of AI Coding / Agent Skills for full-stack, cross-platform, database, Git delivery, and Web 3D/GPU workflows.\n\n` +
    `> **Current version: v${pkg.version}** · The main repository is the documentation source of truth and this Wiki is published automatically by GitHub Actions.\n\n` +
    `## Current data\n\n` +
    `- Registry records: ${registrySkills.length}\n` +
    `- Enabled third-party Skills: ${enabled}\n` +
    `- Profiles: ${profiles}\n` +
    `- ADui-maintained Skills: ${localSkills}\n\n` +
    `## Start here\n\n` +
    `- [[Usage|Usage-EN]]\n` +
    `- [[Profile Installer|Profile-Installer-EN]]\n` +
    `- [[Weekly skills.sh Ranking|Weekly-Skills-Ranking-EN]]\n` +
    `- [[Architecture|Architecture-EN]]\n` +
    `- [[Feature Development|Development-EN]]\n` +
    `- [[Maintenance|Maintenance-EN]]\n` +
    `- [[Release Process|Releasing-EN]]\n\n` +
    `## Project links\n\n` +
    `- [GitHub repository](https://github.com/adui-studio/adui-skills)\n` +
    `- [Releases](https://github.com/adui-studio/adui-skills/releases)\n` +
    `- [[简体中文|Home]]\n`;

  fs.writeFileSync(path.join(outputDir, 'Home.md'), home, 'utf8');
  fs.writeFileSync(path.join(outputDir, 'Home-EN.md'), homeEn, 'utf8');
}

function buildSidebar() {
  const sidebar = `# ADui Skills Pack\n\n` +
    `- [[首页|Home]]\n` +
    `- [[使用指南|Usage]]\n` +
    `- [[Profile 一键安装器|Profile-Installer]]\n` +
    `- [[skills.sh 每周分类排行|Weekly-Skills-Ranking]]\n\n` +
    `## 工程体系\n\n` +
    `- [[总体架构|Architecture]]\n` +
    `- [[功能开发规范|Development]]\n` +
    `- [[添加 Skill|Adding-Skills]]\n\n` +
    `## 技术专题\n\n` +
    `- [[Vite+|VitePlus]]\n` +
    `- [[NestJS + Prisma|NestJS-Prisma]]\n` +
    `- [[3D / GPU|3D-Architecture]]\n` +
    `- [[WebGL2|WebGL2]]\n` +
    `- [[Tauri v2|Tauri-v2]]\n\n` +
    `## 维护与发布\n\n` +
    `- [[维护与每周更新|Maintenance]]\n` +
    `- [[安全规范|Security]]\n` +
    `- [[发布流程|Releasing]]\n` +
    `- [[贡献指南|Contributing]]\n` +
    `- [[安全策略|Security-Policy]]\n` +
    `- [[发布检查清单|Release-Checklist]]\n` +
    `- [[变更记录|Changelog]]\n` +
    `- [[Wiki 维护|GitHub-Wiki]]\n\n` +
    `---\n\n` +
    `- [[English|Home-EN]]\n`;

  fs.writeFileSync(path.join(outputDir, '_Sidebar.md'), sidebar, 'utf8');
  fs.writeFileSync(
    path.join(outputDir, '_Footer.md'),
    `[ADui Skills Pack](https://github.com/adui-studio/adui-skills) · 主仓库是文档唯一事实源。\n`,
    'utf8',
  );
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const [source, slug] of existingPages) {
  writeSourcePage(source, slug);
}

buildHome();
buildSidebar();

console.log(`GitHub Wiki 构建完成：${outputDir}`);
console.log(`页面数量：${fs.readdirSync(outputDir).filter((name) => name.endsWith('.md')).length}`);
