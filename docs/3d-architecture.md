# ADui 3D / GPU 架构规范

[简体中文](./3d-architecture.md) | [English](./3d-architecture.en.md)

`adui-3d-architecture` 负责技术选型和跨引擎架构，不替代 Three.js、Babylon.js、CesiumJS、WebGL2 或 WebGPU 的专项 Skill。

## 选型

```text
通用 Web 3D
  → Three.js

完整实时 3D Engine
  → Babylon.js

GIS / Globe / 地形 / 3D Tiles
  → CesiumJS

底层 Raster / GLSL ES 3.0
  → WebGL2

GPU Compute / WGSL / 现代 GPU Pipeline
  → WebGPU
```

选择前先确认数据规模、坐标体系、目标浏览器、模型格式、实时数据频率和交互要求。

## 架构边界

推荐：

```text
业务 / 实时数据
      ↓
领域与空间模型
      ↓
加载 / 缓存 / GIS / 路径规划
      ↓
Renderer Adapter
      ↓
具体 3D / GPU 技术
```

不要让 Three.js Object3D、Babylon Node 或 Cesium Entity/Primitive 成为业务数据唯一事实源。

## 坐标体系

涉及 CesiumJS 或真实地理坐标时，明确 CRS、经纬度顺序、高度基准、本地原点和地理到渲染坐标的唯一转换入口。本地 3D 引擎优先使用局部笛卡尔坐标；大范围场景考虑局部原点、分块和精度策略。

## 性能

先测量 FPS、CPU/GPU frame time、draw call、纹理/模型体积、解析时间和内存，再决定 LOD、Instancing、Batching、Worker、资产压缩和按需渲染。

## 多引擎

同时使用 CesiumJS 与 Three.js/Babylon.js 时，先定义：

- 谁负责地理坐标；
- 谁驱动相机；
- 坐标如何转换；
- 是否共享 Canvas / Context；
- 谁拥有资源生命周期；
- 如何 Pick 和同步交互。

如果能由一个引擎完成，不为了“统一”或“炫技”增加第二套渲染栈。
