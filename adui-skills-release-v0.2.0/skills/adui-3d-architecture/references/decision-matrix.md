# 3D 技术选型矩阵

[简体中文](./decision-matrix.md) | [English](./decision-matrix.en.md)

## 先问 6 个问题

1. 数据是否具有真实地理坐标、地形、影像或 3D Tiles？
2. 是否需要完整实时引擎能力，例如复杂动画、物理、PBR、粒子和场景管理？
3. 是否主要是普通网页中的 3D 产品、工业设备、模型浏览或自定义交互？
4. 是否必须直接控制 VAO、FBO、MRT、GLSL、Render State 等底层 Raster Pipeline？
5. 是否需要 Compute Shader、WGSL 或现代 GPU Pipeline？
6. 目标浏览器和设备是否允许 WebGPU，并且是否必须保留 WebGL2 Fallback？

## 决策矩阵

| 方向 | 首选 | 不应作为首选的典型原因 |
|---|---|---|
| 通用 Web 3D | Three.js | 如果核心是全球 GIS/3D Tiles，应优先 CesiumJS |
| 完整实时 3D Engine | Babylon.js | 如果只需要轻量模型展示，可能过重 |
| GIS / Globe / 3D Tiles | CesiumJS | 不应把它当普通游戏引擎使用 |
| Raw Raster / GLSL | WebGL2 | 开发和维护成本高，不应只因为“可能更快”而选择 |
| GPU Compute / WGSL | WebGPU | 需要能力检测、版本验证和 Fallback |

## 组合原则

- CesiumJS + Three.js/Babylon.js：先确定谁负责地理坐标和主相机。优先通过明确的数据/坐标桥接而不是共享内部对象。
- Three.js + WebGPU：先检查项目当前 Three.js 版本和 WebGPURenderer 支持范围；自定义 ShaderMaterial、后处理等能力不能假设与 WebGLRenderer 完全等价。
- Babylon.js + WebGPU：以项目当前 Babylon.js 版本和目标设备能力为事实源，不把 WebGPU 当成无条件默认后端。
- WebGL2 + WebGPU 双后端：共享业务数据和数学层，分离资源创建、Shader、Pipeline 和生命周期实现。

## 新项目默认策略

没有地理空间需求时，不因为“3D”默认上 CesiumJS；没有底层图形学需求时，不默认写 raw WebGL2；没有 Compute 或明确 WebGPU 收益时，不为了新技术而强制迁移。
