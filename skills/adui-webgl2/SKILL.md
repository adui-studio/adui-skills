---
name: adui-webgl2
description: 负责原生 WebGL2 与 GLSL ES 3.0 的工程实现、调试和性能规范。用于项目直接调用 canvas.getContext("webgl2")、WebGL2RenderingContext、VAO/VBO/EBO、UBO、FBO/MRT、Instancing、Transform Feedback、Picking、纹理与 Shader Pipeline 时；也用于排查黑屏、Shader 编译链接失败、状态污染、资源泄漏、Context Lost、GPU/CPU 瓶颈，以及构建不依赖 Three.js/Babylon.js 的底层渲染层。
---

# ADui WebGL2

仅在项目确实需要 raw WebGL2 控制时使用。先确认高层引擎无法更低成本满足需求，再进入底层 Pipeline 实现。

## 工作流

1. 确认目标浏览器、Canvas、WebGL2 Context 创建参数和扩展能力。
2. 先定义资源所有权和生命周期，再创建 Buffer、Texture、Framebuffer、Program、VAO。
3. 按 [references/pipeline.md](references/pipeline.md) 建立稳定 Render Pipeline，避免在业务代码里散落全局状态修改。
4. 按 [references/shaders-debugging.md](references/shaders-debugging.md) 编译、链接和验证 Shader；失败时保留完整日志，不用“黑屏猜测法”。
5. 按 [references/resources.md](references/resources.md) 管理 Buffer、Texture、FBO、UBO、Picking 与 Context Lost 恢复。
6. 性能问题按 [references/performance.md](references/performance.md) 先 profiling，再决定 Instancing、Batching、MRT、Transform Feedback 或数据布局优化。
7. 修改完成后验证尺寸变化、DPR、Context Lost/Restore、错误路径和资源释放。

## 核心约束

- 只请求 `webgl2`，不要在未说明原因的情况下自动降级到 WebGL1。
- Shader 使用 GLSL ES 3.00 时明确 `#version 300 es`，不要混用 WebGL1 attribute/varying 语义。
- 使用 VAO 固化顶点属性状态；不要让多个渲染模块隐式共享未知 GL State。
- 每个创建出来的 Program、Shader、Buffer、Texture、Framebuffer、Renderbuffer、VertexArray 都要能追溯到释放位置。
- 不在每帧重复创建 Program、Framebuffer、VAO 或静态 Buffer。
- 不把 `gl.finish()` 当成常规同步手段。
- Picking、ReadPixels 和 GPU Readback 要评估同步停顿。
- Context Lost 时停止正常渲染；恢复后重新创建所有依赖 GPU Context 的资源。
- 不凭经验宣称“GPU 慢”或“draw call 太多”；先采集数据。

## 状态边界

建议建立一个 Renderer/Pass 层统一管理：

- Program
- VAO
- Blend / Depth / Cull / Stencil
- Framebuffer
- Viewport / Scissor
- Texture Unit
- Uniform / UBO

业务模块提交 Render Item 或 Draw Command，不直接任意修改全局 GL 状态。

## 输出格式

处理 WebGL2 Bug 或实现时，至少说明：

1. Context 与能力前提。
2. Pipeline / Shader / Resource 的修改位置。
3. 状态和生命周期影响。
4. 执行过的验证与 profiling。
5. 未确认的浏览器、GPU 或扩展兼容性。

英文兜底资料位于同名 `.en.md` 文件。
