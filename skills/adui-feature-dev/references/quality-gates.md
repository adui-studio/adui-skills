# ADui 质量门禁

## 通用门禁

| 门禁 | 何时执行 | 最低要求 |
|---|---|---|
| Format | 项目存在格式化工具 | 无意外格式变化 |
| Lint | 项目存在 Lint | 目标范围无新增错误 |
| Type / Static Check | TS/Dart/Rust 等 | 无新增类型/静态错误 |
| Unit Test | 核心逻辑可测 | 正常、异常、关键边界 |
| Integration / E2E | 涉及模块协作或 UI 流程 | 关键用户路径通过 |
| Build | 构建型项目 | 目标构建成功 |
| Runtime | 行为依赖真实运行 | 关键行为有实际证据 |
| Diff Review | 所有代码修改 | 无无关改动和敏感信息 |

## Bug 修复

优先建立以下任一种证据：

1. 现有失败测试。
2. 新增复现测试。
3. 稳定的最小复现步骤。
4. 明确的错误日志/调用链证据。

没有复现证据时，不要声称“已定位根因”。

## Web

常见顺序：

```text
format → lint → typecheck → unit → E2E/浏览器验证 → build
```

UI 修改还要检查：响应式、键盘操作、Focus、可访问性和 Console 错误。

## NestJS / Node

至少关注：

- DTO 与输入校验。
- 权限和鉴权边界。
- 异常映射。
- 异步错误与资源释放。
- 数据库事务边界。

## Database

Schema/Migration 变更额外检查：

- 是否破坏已有数据。
- 是否需要 backfill。
- 是否可回滚。
- 索引/约束是否影响写入。
- Prisma schema 与真实数据库是否一致。

## Flutter / Tauri / 小程序

除静态检查和测试外，涉及平台 API 时应说明是否完成目标平台实机/模拟器验证。未执行时明确标注。

## 3D / GPU

关注：

- 渲染循环与资源释放。
- GPU buffer/texture 生命周期。
- 大模型、LOD、Instancing 与内存。
- 坐标系与单位。
- WebGL/WebGPU capability 和 fallback。
