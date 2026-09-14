# Multi-engine Integration

English fallback for the Chinese source of truth.

Separate domain/spatial logic from renderer adapters. For CesiumJS plus a local 3D engine, define geospatial ownership, a one-way camera synchronization strategy where possible, explicit coordinate transforms, and resource ownership. Prefer public APIs over private engine state. Use Workers first for parsing, pathfinding, indexing, and preprocessing; move rendering to OffscreenCanvas only after compatibility and input/debugging costs are validated.
