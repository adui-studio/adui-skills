# WebGL2 资源与生命周期

[简体中文](./resources.md) | [English](./resources.en.md)

## 资源所有权

为以下对象建立创建者和销毁者：

- Buffer
- Texture
- Sampler
- Renderbuffer
- Framebuffer
- VertexArray
- Shader
- Program
- Query / Transform Feedback

统一提供 `dispose()` 或等价释放路径，并避免业务组件绕过资源管理器直接长期持有裸 GL Handle。

## Buffer

- 静态数据优先一次上传。
- 动态数据按更新频率拆 Buffer，避免一个大 Buffer 每帧全部重传。
- 频繁小更新先测量 `bufferSubData` 成本。
- Vertex / Index / UBO 的结构和字节对齐要写清楚。

## Texture / FBO

- 明确颜色空间、内部格式、类型、MipMap 和过滤模式。
- 创建 FBO 后检查完整性。
- Render Target 尺寸变化时重建依赖附件。
- MRT 的 attachment 和 fragment output location 一一对应。

## Picking / Readback

优先评估 ID Buffer / Picking FBO。`readPixels` 会引入同步成本，不要在高频 Pointer Move 中无节制调用。

## Context Lost

监听 `webglcontextlost` 和 `webglcontextrestored`。丢失时停止正常渲染，并在恢复后重新创建 GPU 资源。测试阶段可使用 `WEBGL_lose_context` 模拟丢失/恢复流程。
