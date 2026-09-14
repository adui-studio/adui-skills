# Shaders and Black-screen Debugging

English fallback for the Chinese source of truth.

For GLSL ES 3.00, use the WebGL2 shader syntax consistently and always inspect compile/link status and info logs. Debug black screens in a fixed order: context, drawing-buffer size, program, VAO/attributes, index parameters, render state, transforms, framebuffer completeness, textures/samplers, then reduce to a minimal solid-color shader.
