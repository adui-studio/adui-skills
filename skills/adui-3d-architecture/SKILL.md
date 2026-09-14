---
name: adui-3d-architecture
description: 负责 Web 3D 与 GPU 项目的技术选型、架构边界和跨引擎决策。用于 Three.js、Babylon.js、CesiumJS、WebGL2、WebGPU 相关的新项目选型、既有项目重构、多引擎协同、坐标体系设计、资产管线、Worker、LOD、Instancing、GPU 性能与资源生命周期规划；当用户描述三维孪生、GIS、3D Tiles、GLB、GPU Compute 或底层渲染需求，但尚未确定引擎或需要判断架构时使用。
---

# ADui 3D Architecture

把 3D 技术选型和架构边界放在 API 编码之前。先确认场景、数据规模、坐标体系、交互、GPU 能力和交付目标，再选择 Three.js、Babylon.js、CesiumJS、WebGL2 或 WebGPU。

## 工作流

1. 读取现有项目依赖、渲染入口、模型格式、坐标数据和部署目标。
2. 明确需求属于：通用 Web 3D、完整实时引擎、地理空间、底层 Raster、GPU Compute，或多个方向的组合。
3. 先确定坐标体系和精度边界，再确定引擎；涉及经纬度、地球椭球、3D Tiles 时优先阅读 [references/coordinates.md](references/coordinates.md)。
4. 按 [references/decision-matrix.md](references/decision-matrix.md) 选择主引擎和可选辅助层，不因熟悉某个库而默认选它。
5. 把业务状态、空间计算、路径规划、数据加载与渲染实现解耦。渲染引擎不能成为业务数据的唯一事实源。
6. 为模型、纹理、LOD、压缩、缓存、Worker 与资源释放定义边界；高负载场景阅读 [references/performance.md](references/performance.md)。
7. 多引擎或 GIS + 本地三维组合时阅读 [references/integration.md](references/integration.md)，先定义坐标转换、相机同步和生命周期，再写桥接代码。
8. 输出架构决策、风险、验证方案和未确认项；不要只给库名。

## 选型原则

- 使用 **Three.js**：通用 Web 3D、定制交互、轻量场景、生态自由度优先。
- 使用 **Babylon.js**：完整实时 3D Engine、PBR、动画、物理、复杂场景管理和较强引擎能力优先。
- 使用 **CesiumJS**：GIS、Globe、WGS84、地形、影像、3D Tiles、超大范围地理空间优先。
- 使用 **WebGL2**：确实需要底层 Raster Pipeline、GLSL ES 3.0、自定义状态机或极低层控制时使用；普通业务 3D 不要为“性能”直接降到 raw WebGL2。
- 使用 **WebGPU**：需要现代 GPU Pipeline、Compute、WGSL 或明确受益于 WebGPU 的渲染/计算场景时使用；必须设计能力检测和降级策略。

## 强制约束

- 不把经纬度直接当作 Three.js/Babylon.js 世界坐标。
- 不在大型地理场景中忽略浮点精度、局部原点或坐标变换。
- 不因引擎同时存在就假设它们能共享 Scene、Camera、Context 或资源对象。
- 不把 CPU 路径规划、业务规则或灾害权重绑定到具体渲染引擎 API。
- 不把“帧率低”简单归因于 draw call；先用真实 profiling 数据定位 CPU、GPU、网络、解析、纹理和内存瓶颈。
- 不创建 GPU 资源而没有明确释放路径。
- 不假定 WebGPU 在所有目标环境可用；检查目标浏览器、设备和项目当前版本。

## 输出格式

给出 5 部分：

1. **需求与约束**：数据类型、坐标体系、场景规模、目标平台。
2. **推荐架构**：主引擎、辅助能力和模块边界。
3. **关键原因**：为什么选择，为什么不选择其他候选。
4. **风险与验证**：精度、兼容、性能、资源、Worker、Fallback。
5. **仍未确认**：没有证据支持的点必须明确列出。

英文兜底资料位于同名 `.en.md` 文件。
