# Shader 与黑屏调试

[简体中文](./shaders-debugging.md) | [English](./shaders-debugging.en.md)

## Shader

- GLSL ES 3.00 明确 `#version 300 es`。
- Vertex Shader 使用 `in` / `out`；Fragment Shader 声明输出变量。
- 显式检查 `COMPILE_STATUS` 和 `LINK_STATUS`。
- 记录 `getShaderInfoLog` / `getProgramInfoLog`。
- Attribute location、UBO binding、Sampler unit 和 fragment output location 要有稳定约定。

## 黑屏排查顺序

1. Context 是否创建成功、是否丢失。
2. Canvas drawing buffer 尺寸是否正确。
3. Program 是否 compile/link 成功。
4. VAO / Buffer / Attribute 是否正确绑定。
5. Index type / count / offset 是否正确。
6. Viewport、Cull、Depth、Scissor 是否把内容裁掉。
7. Camera / Matrix / Clip Space 是否正确。
8. FBO 是否 complete，最终输出是否真的回到可见 framebuffer。
9. Texture 是否 complete，Sampler / Texture Unit 是否对应。
10. 使用最小纯色 Shader 缩小问题范围。

## 错误检查

开发期可在关键 Pass 边界加入错误检测或 Debug Wrapper，但不要在性能敏感的每个 GL 调用后永久执行高成本检查。
