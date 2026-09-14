# Vite+ 配置规范

[简体中文](./configuration.md) | [English](./configuration.en.md)

Vite+ 延续 Vite 配置，并在 `vite.config.ts` 中增加统一工具链配置。

常见配置域包括：

```text
server / build / preview
create
run
fmt
lint
check
test
pack
staged
defaultPackage
```

## 原则

1. 先读取现有 `vite.config.*`，不要覆盖已有 Vite 配置。
2. 新增 Vite+ 能力时优先放在统一配置中。
3. 配置值优先使用项目当前版本支持的字段；不确定时查当前安装版本或官方文档。
4. `pack` 负责 tsdown 打包配置；使用 Vite+ 时不要无必要重复维护独立 tsdown 配置。
5. `test` 与 Vitest 保持同一事实源；已有复杂测试拆分时不要强制合并。
6. `defaultPackage` 适合 workspace 根目录指定裸命令的默认目标，值应保持简单、可静态读取。
7. CI、开发环境与 Git Hook 应尽量调用同一套 `vp` 命令，减少两套规则漂移。

## 质量配置

需要类型感知 Lint/Type Check 时，先确认项目 TypeScript 结构和 Vite+ 当前版本支持，再开启相应能力。不要为了追求“全开”导致大仓库检查成本失控。
