import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const router = path.join(repoRoot, 'skills/adui-stack-router/scripts/detect-stack.mjs');

function withProject(files, callback) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'adui-router-'));
  try {
    for (const [name, content] of Object.entries(files)) {
      const target = path.join(root, name);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, typeof content === 'string' ? content : JSON.stringify(content, null, 2));
    }
    return callback(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

function detect(root) {
  return JSON.parse(execFileSync(process.execPath, [router, root, '--json'], { encoding: 'utf8' }));
}

test('NestJS + Prisma 自动组合 nestjs-prisma Profile', () => {
  withProject({
    'package.json': {
      dependencies: {
        '@nestjs/core': '^11.0.0',
        '@prisma/client': '^8.0.0',
        prisma: '^8.0.0',
      },
    },
    'prisma/schema.prisma': 'datasource db { provider = "postgresql" }\n',
  }, (root) => {
    const result = detect(root);
    assert.ok(result.directProfiles.includes('nestjs-prisma'));
    assert.ok(result.directProfiles.includes('postgresql'));
    assert.ok(!result.directProfiles.includes('backend'));
    assert.ok(!result.directProfiles.includes('prisma'));
    assert.ok(result.effectiveProfiles.includes('backend'));
    assert.ok(result.effectiveProfiles.includes('prisma'));
  });
});

test('仅 NestJS 时不会加载 adui-nestjs-prisma 组合 Profile', () => {
  withProject({
    'package.json': {
      dependencies: {
        '@nestjs/core': '^11.0.0',
      },
    },
  }, (root) => {
    const result = detect(root);
    assert.ok(result.directProfiles.includes('backend'));
    assert.ok(!result.directProfiles.includes('nestjs-prisma'));
  });
});

test('vite-plus 优先于普通 Vite toolchain 直接 Profile', () => {
  withProject({
    'package.json': {
      devDependencies: {
        'vite-plus': '^0.1.0',
        vite: '^8.0.0',
      },
    },
    'vite.config.ts': "import { defineConfig } from 'vite-plus';\nexport default defineConfig({});\n",
  }, (root) => {
    const result = detect(root);
    assert.ok(result.directProfiles.includes('viteplus'));
    assert.ok(!result.directProfiles.includes('toolchain'));
    assert.ok(result.effectiveProfiles.includes('toolchain'));
  });
});

test('Three.js 项目自动继承 3d 架构 Profile', () => {
  withProject({
    'package.json': {
      dependencies: {
        three: '^0.180.0',
      },
    },
  }, (root) => {
    const result = detect(root);
    assert.ok(result.directProfiles.includes('threejs'));
    assert.ok(!result.directProfiles.includes('3d'));
    assert.ok(result.effectiveProfiles.includes('3d'));
  });
});

test('原生 WebGL2 项目加载 webgl2 与 3d Profile', () => {
  withProject({
    'package.json': { devDependencies: { vite: '^8.0.0' } },
    'src/renderer.ts': "const gl = canvas.getContext('webgl2');\n",
  }, (root) => {
    const result = detect(root);
    assert.ok(result.directProfiles.includes('webgl2'));
    assert.ok(result.effectiveProfiles.includes('3d'));
    assert.ok(result.effectiveProfiles.includes('webgl2'));
  });
});

test('同时检测到多个高层 3D 引擎时给出架构警告', () => {
  withProject({
    'package.json': {
      dependencies: {
        three: '^0.180.0',
        cesium: '^1.133.0',
      },
    },
  }, (root) => {
    const result = detect(root);
    assert.ok(result.directProfiles.includes('threejs'));
    assert.ok(result.directProfiles.includes('cesiumjs'));
    assert.ok(result.warnings.some((item) => item.includes('多个高层 3D 引擎')));
  });
});
