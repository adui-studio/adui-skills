# 3D Technology Decision Matrix

English fallback for the Chinese source of truth.

Choose the primary technology from the problem domain: Three.js for flexible general Web 3D, Babylon.js for a fuller real-time engine, CesiumJS for geospatial/globe/3D Tiles, WebGL2 for raw raster control, and WebGPU for modern GPU pipelines or compute. Do not select a lower-level API only for assumed performance. For mixed engines, define coordinate ownership, camera ownership, resource ownership, and fallback behavior before implementation.
