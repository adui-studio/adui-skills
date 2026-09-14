# WebGL2 Render Pipeline

[简体中文](./pipeline.md) | [English](./pipeline.en.md)

## 初始化顺序

1. 创建 Canvas 和 `webgl2` Context。
2. 读取必要 Capability / Extension；缺失能力要明确失败或选择已设计好的替代方案。
3. 创建 Shader 和 Program，并检查 compile/link status。
4. 创建静态 Buffer、VAO、Texture、Sampler、FBO。
5. 建立 resize / DPR 处理。
6. 建立 render loop 或按需渲染入口。

## Draw Pass

推荐每个 Pass 明确声明：

- 目标 Framebuffer
- Viewport / Scissor
- Clear 行为
- Depth / Blend / Cull / Stencil
- Program
- VAO
- Texture / Sampler
- Uniform / UBO
- Draw call

不要依赖“上一个 Pass 恰好留下的状态”。

## WebGL2 优先能力

根据场景选择：

- VAO
- Instanced Drawing
- UBO
- Multiple Render Targets
- 3D Texture / Texture Array
- Transform Feedback
- Sampler Object

不要为了使用 API 而使用 API；每项优化要对应明确瓶颈。
