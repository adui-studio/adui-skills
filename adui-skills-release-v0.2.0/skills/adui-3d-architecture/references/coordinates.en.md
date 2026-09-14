# Coordinates and Precision

English fallback for the Chinese source of truth.

Keep business, geospatial, engine-world, and screen coordinates separate. Use CesiumJS geospatial types for globe/GIS concerns and convert to an explicit local frame before feeding local Cartesian engines. Record CRS, axis order, units, height datum, local origin, model axes, and the single conversion boundary. Keep pathfinding and spatial business logic independent from renderer object types.
