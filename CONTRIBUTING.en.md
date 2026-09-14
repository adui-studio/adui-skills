# Contributing

[简体中文](./CONTRIBUTING.md) | [English](./CONTRIBUTING.en.md)

GitHub is the only primary repository; CNB is a synchronized mirror. Chinese is the default documentation language and matching `.en.md` files are the English fallback.

Before submitting changes, run:

```bash
npm run validate
```

Use `npm run updates:check` for Registry changes and `npm run detect:stack -- <project-root>` for router changes. Third-party upstream updates must be reviewed manually and never auto-merged.

## Local skill references

`localSkills` may reference only ADui skills that already exist and pass validation. Planned skills are added to profiles only after implementation and validation.
