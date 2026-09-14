# WebGL2 性能

[简体中文](./performance.md) | [English](./performance.en.md)

## 先测量

至少区分：

- JavaScript / 主线程耗时
- Draw Submission
- GPU Fragment / Vertex 压力
- Buffer / Texture Upload
- Readback / 同步
- Shader 切换与状态切换

## 常用方向

- 同材质同 Geometry 大量对象：评估 Instancing。
- 大量小对象：评估合批或命令排序。
- 频繁 Program / Texture / FBO 切换：按 Pipeline 状态排序。
- Overdraw 高：评估深度策略、裁剪、透明对象排序和分辨率。
- Fill-rate 高：评估 Render Target 尺寸、后处理次数和 DPR。
- 动态 Buffer：按更新频率拆分，不重复上传静态数据。
- CPU 计算重：考虑 Worker；不要把纯业务计算放进 Render Loop。

## 禁止的伪优化

- 未 profiling 就改成 raw WebGL2。
- 为减少一两个 draw call 引入复杂且不可维护的巨大合批系统。
- 每帧手工 GC 风格地创建/销毁大量 TypedArray 和临时对象。
- 用 `gl.finish()` 证明 GPU 已完成后再继续每帧流程。
