import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

export const SUPPORTED_PACKAGE_MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'];

const LOCK_FILES = {
  npm: ['package-lock.json', 'npm-shrinkwrap.json'],
  pnpm: ['pnpm-lock.yaml'],
  yarn: ['yarn.lock'],
  bun: ['bun.lock', 'bun.lockb'],
};

function readJsonIfExists(file) {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    throw new Error(`无法解析 ${file}：${error.message}`);
  }
}

function ancestors(start) {
  const result = [];
  let current = path.resolve(start);
  while (true) {
    result.push(current);
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return result;
}

function hasWorkspaceMarker(dir) {
  if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return true;
  const pkg = readJsonIfExists(path.join(dir, 'package.json'));
  return Boolean(pkg && (Array.isArray(pkg.workspaces) || (pkg.workspaces && typeof pkg.workspaces === 'object')));
}

export function findProjectBoundary(projectRoot) {
  const dirs = ancestors(projectRoot);
  for (const dir of dirs) {
    if (fs.existsSync(path.join(dir, '.git')) || hasWorkspaceMarker(dir)) return dir;
  }
  for (const dir of dirs) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
  }
  return path.resolve(projectRoot);
}

export function parsePackageManagerSpec(spec) {
  if (typeof spec !== 'string' || spec.trim() === '') return null;
  const normalized = spec.trim().toLowerCase();
  const name = normalized.startsWith('@') ? normalized : normalized.split('@')[0];
  return SUPPORTED_PACKAGE_MANAGERS.includes(name) ? name : null;
}

function dirsUntilBoundary(projectRoot, boundary) {
  const result = [];
  let current = path.resolve(projectRoot);
  const stop = path.resolve(boundary);
  while (true) {
    result.push(current);
    if (current === stop) break;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return result;
}

function detectFromPackageManagerField(projectRoot, boundary) {
  for (const dir of dirsUntilBoundary(projectRoot, boundary)) {
    const file = path.join(dir, 'package.json');
    const pkg = readJsonIfExists(file);
    if (!pkg?.packageManager) continue;
    const name = parsePackageManagerSpec(pkg.packageManager);
    if (!name) {
      throw new Error(`package.json 的 packageManager 不受支持：${pkg.packageManager}。仅支持 npm / pnpm / yarn / bun。`);
    }
    return {
      name,
      source: 'packageManager',
      evidence: file,
      detail: pkg.packageManager,
    };
  }
  return null;
}

function detectFromLockFiles(projectRoot, boundary) {
  const matches = [];
  for (const dir of dirsUntilBoundary(projectRoot, boundary)) {
    for (const [name, files] of Object.entries(LOCK_FILES)) {
      for (const file of files) {
        const absolute = path.join(dir, file);
        if (fs.existsSync(absolute)) matches.push({ name, file: absolute });
      }
    }
  }

  const names = [...new Set(matches.map((item) => item.name))];
  if (names.length > 1) {
    const detail = matches.map((item) => `- ${item.name}: ${item.file}`).join('\n');
    throw new Error(`检测到多个包管理器 Lock 文件，无法安全自动选择：\n${detail}\n请使用 --pm <npm|pnpm|yarn|bun> 明确指定。`);
  }
  if (names.length === 0) return null;
  const selected = matches.find((item) => item.name === names[0]);
  return {
    name: names[0],
    source: 'lockfile',
    evidence: selected.file,
    detail: path.basename(selected.file),
  };
}

function detectFromEnvironment(env) {
  const ua = env.npm_config_user_agent ?? env.npm_config_useragent ?? '';
  const match = /^([^/\s]+)\//.exec(ua.trim());
  if (!match) return null;
  const name = parsePackageManagerSpec(match[1]);
  if (!name) return null;
  return {
    name,
    source: 'environment',
    evidence: 'npm_config_user_agent',
    detail: ua,
  };
}

export function detectPackageManager(projectRoot = '.', options = {}) {
  const root = path.resolve(projectRoot);
  if (options.explicit) {
    const explicit = parsePackageManagerSpec(options.explicit);
    if (!explicit) {
      throw new Error(`不支持的包管理器：${options.explicit}。仅支持 npm / pnpm / yarn / bun。`);
    }
    return {
      name: explicit,
      source: 'explicit',
      evidence: '--pm/--package-manager',
      detail: options.explicit,
      projectRoot: root,
      boundary: findProjectBoundary(root),
    };
  }

  const boundary = findProjectBoundary(root);
  if (options.noDetect) {
    return {
      name: 'npm',
      source: 'fallback',
      evidence: '--no-pm-detect',
      detail: '已禁用自动检测，使用 npm',
      projectRoot: root,
      boundary,
    };
  }

  const byField = detectFromPackageManagerField(root, boundary);
  if (byField) return { ...byField, projectRoot: root, boundary };

  const byLock = detectFromLockFiles(root, boundary);
  if (byLock) return { ...byLock, projectRoot: root, boundary };

  const byEnv = detectFromEnvironment(options.env ?? process.env);
  if (byEnv) return { ...byEnv, projectRoot: root, boundary };

  return {
    name: 'npm',
    source: 'fallback',
    evidence: 'default',
    detail: '未检测到 packageManager、Lock 文件或执行环境，回退到 npm',
    projectRoot: root,
    boundary,
  };
}

function windowsCommand(name, platform = process.platform) {
  return platform === 'win32' ? `${name}.cmd` : name;
}

export function buildPackageRunner(packageManager, skillsArgs, options = {}) {
  const pm = parsePackageManagerSpec(packageManager);
  if (!pm) throw new Error(`不支持的包管理器：${packageManager}`);
  const platform = options.platform ?? process.platform;

  if (pm === 'npm') {
    return {
      executable: windowsCommand('npx', platform),
      args: ['--yes', 'skills', ...skillsArgs],
      display: ['npx', '--yes', 'skills', ...skillsArgs],
    };
  }
  if (pm === 'pnpm') {
    return {
      executable: windowsCommand('pnpm', platform),
      args: ['dlx', 'skills', ...skillsArgs],
      display: ['pnpm', 'dlx', 'skills', ...skillsArgs],
    };
  }
  if (pm === 'yarn') {
    return {
      executable: windowsCommand('yarn', platform),
      args: ['dlx', 'skills', ...skillsArgs],
      display: ['yarn', 'dlx', 'skills', ...skillsArgs],
    };
  }
  return {
    executable: windowsCommand('bunx', platform),
    args: ['skills', ...skillsArgs],
    display: ['bunx', 'skills', ...skillsArgs],
  };
}

export function checkPackageManagerAvailable(packageManager, options = {}) {
  const pm = parsePackageManagerSpec(packageManager);
  if (!pm) throw new Error(`不支持的包管理器：${packageManager}`);
  const platform = options.platform ?? process.platform;
  const probe = pm === 'bun' ? 'bun' : pm;
  const executable = windowsCommand(probe, platform);
  const spawn = options.spawn ?? spawnSync;
  const result = spawn(executable, ['--version'], {
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
  });

  if (result.error || result.status !== 0) {
    throw new Error(`指定的包管理器 ${pm} 当前不可用。请先安装 ${pm}，或使用 --pm npm / --pm pnpm / --pm yarn / --pm bun 选择其他包管理器。`);
  }

  const version = String(result.stdout ?? '').trim();
  if (pm === 'yarn') {
    const major = Number.parseInt(version.split('.')[0], 10);
    if (Number.isFinite(major) && major < 2) {
      throw new Error(`检测到 Yarn ${version}。Profile 安装器使用 yarn dlx，需要 Yarn 2+；请升级 Yarn，或改用 --pm npm / pnpm / bun。`);
    }
  }
  return { name: pm, version, executable };
}
