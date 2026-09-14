# Capability、Permission 与系统权限

[简体中文](./security.md) | [English](./security.en.md)

## 最小权限

1. 默认假设插件的危险命令不可访问。
2. 在 `src-tauri/capabilities/` 中只授权需要的 permission。
3. Scope 约束到明确文件目录、URL、命令或参数。
4. 不使用“为了先跑起来”而永久保留的宽泛通配权限。
5. 多窗口分别定义 Capability，尤其是登录页、外部内容页、设置页和主业务页。

## Shell / Sidecar

- 只允许声明过的程序。
- 参数默认拒绝；动态参数使用固定值或正则 validator。
- 不把用户输入拼成 shell command。
- Sidecar 的 `externalBin`、权限与调用名称保持一致。
- 子进程要处理退出、异常、重启和应用关闭时清理。

## 文件与 URL

- 文件路径做 canonicalize / scope 校验，避免路径穿越。
- 外部 URL 打开能力限制 scheme 与域名。
- CSP 保持最小允许集合；不要为解决开发报错直接放开 `unsafe-*` 或任意远程源。

## Secret

- 签名私钥、Updater 私钥、Token、数据库口令只放安全 Secret 管理。
- 前端 bundle 中的值视为可被用户读取，不保存真正秘密。
