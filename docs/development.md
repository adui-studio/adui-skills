# ADui 功能开发规范

[简体中文](./development.md) | [English](./development.en.md)

`adui-feature-dev` 用于统一功能开发、Bug 修复、重构和既有项目修改的工作方式。

## 推荐组合

```text
adui-stack-router
      ↓
识别技术栈与 Profiles
      ↓
adui-feature-dev
      ↓
调用对应 Vue / React / NestJS / Prisma / Flutter / 3D 等专业 Skill
```

## 六段式交付

1. 需求与关键约束。
2. 必要假设与潜在风险。
3. 解决方案与代码。
4. 修改位置与修改原因。
5. 运行、测试和验证结果。
6. 仍未确认的问题。

简单任务可以压缩内容，但不能把未验证结果描述成已验证。

## 最小改动

修改已有项目时：

- 不无故重构目录和公共 API。
- 不顺手升级无关依赖。
- 不把无关格式化改动混入业务修改。
- 优先复用已有组件、工具、类型和服务。

## 验证

根据项目实际能力选择：Format、Lint、Type/Static Check、Unit Test、Integration/E2E、Build、Runtime Check 和 Diff Review。

没有执行过的检查必须明确标记为“未执行”。

## Git

默认不自动执行 `commit`、`push`、`merge` 或 `release`。只有用户明确要求时才进行对应写操作。

## 专项 Skill 路由

- 检测到 Vite+：在框架 Skill 之外增加 `adui-viteplus`。
- 同时检测到 NestJS + Prisma：增加 `adui-nestjs-prisma`，不要只凭 NestJS 或 Prisma 单独信号加载。
