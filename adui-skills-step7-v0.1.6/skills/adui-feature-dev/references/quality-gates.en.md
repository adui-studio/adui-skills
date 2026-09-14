# ADui Quality Gates

Use the relevant gates supported by the project: formatter, lint, type/static analysis, unit tests, integration/E2E, build, runtime checks, and final diff review.

For bug fixes, obtain reproducible evidence before claiming a root cause. For database changes, review data compatibility, migrations, rollback, indexes, and transaction boundaries. For platform-specific Flutter/Tauri/Mini Program changes, state whether device or simulator verification was actually performed. For 3D/GPU work, verify resource lifecycle, memory, coordinate systems, capabilities, and fallback behavior.
