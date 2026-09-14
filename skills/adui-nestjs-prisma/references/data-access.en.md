# Data Access and Error Mapping

English fallback for `data-access.md`.

Select only required fields, avoid N+1 and unbounded queries, use stable ordering for pagination, and rely on database constraints for concurrency correctness. Do not leak raw Prisma/database errors to controllers or clients; map stable error types/codes to domain or HTTP exceptions at an appropriate boundary.
