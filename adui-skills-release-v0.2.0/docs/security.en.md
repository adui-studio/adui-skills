# Security

[简体中文](./security.md) | [English](./security.en.md)

Treat Skills as supply-chain inputs that can change agent behavior. Review new shell execution, destructive file operations, remote downloads, credential access, Git pushes/history rewrites, privilege escalation, and external executables.

Upstream updates may open PRs automatically but must never auto-merge. Keep CNB credentials only in GitHub Actions secrets and use least-privilege workflow permissions.
