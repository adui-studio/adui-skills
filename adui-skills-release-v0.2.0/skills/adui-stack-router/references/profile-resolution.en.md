# Profile Resolution - English fallback

Choose direct Profiles from explicit project evidence, then recursively expand each Profile's `extends` list to obtain effective Profiles. The repository `profiles/*.json` files are authoritative; the graph bundled with the Skill is only a portable snapshot.


When NestJS and Prisma are both detected, prefer the combined `nestjs-prisma` profile. It inherits both `backend` and `prisma`, preventing the integration skill from loading in NestJS-only or Prisma-only projects.


All Three.js, Babylon.js, CesiumJS, WebGL2, and WebGPU profiles inherit the shared `3d` profile. It carries `adui-3d-architecture` and normally appears only in effective profiles, not as a direct detection result.
