# ADui Skills Pack Architecture

[简体中文](./architecture.md) | [English](./architecture.en.md)

The repository has four layers: third-party Registry/Lock, declarative Profiles, ADui-maintained Skills, and automation scripts/workflows.

`skills.json` answers what is curated. `skills.lock.json` records the reviewed Skill-folder Git tree SHA. Profiles reference Skill IDs instead of vendoring source code. GitHub is the source of truth and CNB is a one-way China mirror.
