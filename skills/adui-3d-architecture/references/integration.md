# 多引擎与系统集成

[简体中文](./integration.md) | [English](./integration.en.md)

## 分层

推荐保持：

```text
业务数据 / 实时数据
        ↓
领域模型 / 空间模型
        ↓
加载与缓存 / 路径规划 / GIS 转换
        ↓
Renderer Adapter
        ↓
Three.js / Babylon.js / CesiumJS / WebGL2 / WebGPU
```

## CesiumJS + 本地 3D 引擎

- 先确定 Cesium 是否是地理世界的事实源。
- 明确相机同步方向：单向驱动优先于双向互相写。
- 不共享私有内部状态；通过公开 API、坐标矩阵和显式桥接结构同步。
- 大地坐标转本地坐标时固定原点和轴向规则。
- 能用 Cesium Primitive / Model / CustomShader 完成的需求，不要为了“统一技术栈”强行叠第二套引擎。

## Worker

把解析、路径计算、空间索引、网格预处理等纯计算优先放 Worker。是否把渲染本身迁到 OffscreenCanvas，需要先检查引擎、浏览器、输入事件和调试成本。

## Renderer Adapter

适配层只暴露业务真正需要的能力，例如：

- loadModel / unloadModel
- setVisible
- updateTransform
- updateState
- pick
- focus
- dispose

不要把整个 `THREE.Scene`、Babylon `Scene` 或 Cesium `Viewer` 直接作为跨模块公共接口。
