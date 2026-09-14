# WebGL2 Performance

English fallback for the Chinese source of truth.

Separate CPU/main-thread time, draw submission, vertex/fragment GPU load, uploads, readbacks, and state changes before optimizing. Use instancing, batching, state sorting, resolution control, and update-frequency-aware buffers only when measurements support them. Avoid gl.finish in the normal frame loop and do not rewrite a working engine-based application in raw WebGL2 for speculative performance.
