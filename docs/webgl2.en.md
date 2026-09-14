# ADui WebGL2 Engineering Guide

English fallback for the Chinese source of truth.

Use `adui-webgl2` only for raw WebGL2 / GLSL ES 3.0 work. Declare render-pass state explicitly, own and dispose GPU resources deterministically, validate shader compilation/linking, handle context loss/restoration, and profile CPU/GPU/upload/readback bottlenecks before optimizing with instancing, batching, MRT, or transform feedback.
