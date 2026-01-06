// prisma.config.ts
import 'dotenv/config';
import { defineConfig, env } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',           // or './prisma/schema.prisma' if needed

  migrations: {
    path: 'prisma/migrations',
  },

  datasource: {
    url: env('DATABASE_URL'),
  },
});