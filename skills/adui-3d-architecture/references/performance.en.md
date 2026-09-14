# 3D Performance and Resource Budget

English fallback for the Chinese source of truth.

Measure before optimizing: FPS, CPU/GPU frame time, draw calls, primitives, texture and asset size, memory pressure, parsing time, and main-thread long tasks. Prefer culling, LOD, on-demand rendering, instancing/batching, compressed assets, incremental updates, and explicit disposal. WebGPU is not automatically faster; account for pipeline creation, binding, buffer updates, compute workload, and readback synchronization.
