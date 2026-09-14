# 3D 性能与资源预算

[简体中文](./performance.md) | [English](./performance.en.md)

## 先量化再优化

至少记录：FPS、CPU frame time、GPU frame time、draw calls、triangles/points、GPU memory 近似值、纹理数量/尺寸、模型解析时间、网络体积和主线程长任务。

## 通用优先级

1. 先减少不可见工作：视锥裁剪、距离裁剪、LOD、按需渲染。
2. 再减少提交成本：Instancing、Batching、材质合并、合理共享 Geometry/Material。
3. 再减少资产体积：glTF/GLB、Meshopt/Draco、KTX2/Basis 等，具体方案以当前引擎和终端支持为准。
4. 将重解析、空间计算和非渲染任务移出主线程时，再评估 Worker/OffscreenCanvas。
5. 给纹理、Render Target、Geometry、Buffer、Material、Engine/Renderer 建立显式释放路径。

## 大场景

- 不一次加载所有模型和纹理。
- 建立区域、楼层、巷道、Tile 或 Chunk 粒度的加载/卸载策略。
- 避免每帧分配大量临时对象。
- 高频实时数据采用增量更新，不重复重建整棵场景树。
- 设备状态与可视对象建立稳定 ID 映射，不把业务状态直接存成 Scene Graph 唯一来源。

## WebGPU

WebGPU 不等于自动更快。评估 Pipeline 创建、Bind Group、Buffer 更新、Compute 工作量和 Readback 成本；避免频繁 CPU/GPU 同步。
