# Security Policy

[简体中文](./SECURITY.md) | [English](./SECURITY.en.md)

## Supported versions

ADui Skills Pack is currently in the `v0.2.x Public Preview` line. Security fixes target the latest `0.2.x` release first. Older `0.1.x` versions are patched only when the impact is significant and backporting is practical.

## Reporting a vulnerability

Do not publish tokens, passwords, private repository URLs, internal network details, or directly exploitable vulnerability information in a public issue.

Prefer GitHub Repository **Security → Report a vulnerability**. If private reporting is not available yet, open a public issue that only requests a private security channel and contains no sensitive details.

A useful report includes the affected version or commit, affected Skill/script/workflow/profile, reproduction conditions, impact, and whether credentials, command execution, deletion, network access, or supply-chain behavior are involved.

## Third-party Skill supply chain

Third-party Skill sources are not copied into this repository. Registry entries record the source and `skills.lock.json` pins the reviewed Skill-folder Git tree SHA. Weekly updates only open review PRs and are never auto-merged.

Changes involving shell execution, download-and-run behavior, credentials, `git push`, `sudo`, destructive deletion, or network-policy changes require explicit human review.
