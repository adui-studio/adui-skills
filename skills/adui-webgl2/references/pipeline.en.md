# WebGL2 Render Pipeline

English fallback for the Chinese source of truth.

Create and validate the WebGL2 context first, then programs, static resources, resize/DPR handling, and the render loop. Make every render pass declare its framebuffer, viewport, clear behavior, depth/blend/cull/stencil state, program, VAO, textures, uniforms/UBOs, and draw calls. Do not depend on state accidentally left by a previous pass.
