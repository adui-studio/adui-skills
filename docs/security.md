# Security

Skills are executable instructions for AI coding agents and must be treated as supply-chain inputs.

Upstream updates must not be merged automatically.

Review changes that introduce or modify:

- shell execution
- destructive file operations
- network requests
- credential access
- token access
- Git push operations
- privilege escalation
- external executable downloads

Automated checks may provide risk hints, but final approval requires review.