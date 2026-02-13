// prisma.config.ts
try {
  await import('dotenv/config'); // Required for local execution
} catch (e) {
  // dotenv is not available, which is expected in production
  // where environment variables are provided by the environment
}

export default {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
};