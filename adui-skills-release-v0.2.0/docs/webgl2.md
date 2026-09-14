# ADui WebGL2 工程规范

[简体中文](./webgl2.md) | [English](./webgl2.en.md)

`adui-webgl2` 只用于原生 WebGL2 / GLSL ES 3.0 项目。普通业务 3D 优先评估高层引擎，只有确实需要底层 Pipeline 控制时再使用 raw WebGL2。

## Pipeline

每个 Render Pass 明确：Framebuffer、Viewport、Clear、Depth、Blend、Cull、Stencil、Program、VAO、Texture、Uniform/UBO 和 Draw Call。不要依赖上一个 Pass 遗留状态。

## 资源

Buffer、Texture、Sampler、Framebuffer、Renderbuffer、VAO、Shader、Program 等必须有明确创建者与销毁者。Render Target resize 时重建依赖附件。

## 调试

黑屏按固定顺序排查：Context → Drawing Buffer → Shader Compile/Link → VAO/Buffer → Draw 参数 → GL State → Matrix → FBO → Texture/Sampler。不要通过随机改参数猜问题。

## Context Lost

监听 `webglcontextlost` / `webglcontextrestored`，丢失时停止正常渲染，恢复后重新创建 GPU 资源。测试阶段可以使用 `WEBGL_lose_context` 模拟流程。

## 性能

先区分 CPU、Draw Submission、Vertex/Fragment GPU、Upload、Readback 和状态切换，再决定 Instancing、Batching、MRT、Transform Feedback 或数据布局优化。
