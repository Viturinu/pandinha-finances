import "dotenv/config";
import { defineConfig, env } from "prisma/config";

const bancoConfigurado = Boolean(process.env.DATABASE_URL);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  ...(bancoConfigurado ? { datasource: { url: env("DATABASE_URL") } } : {}),
});
