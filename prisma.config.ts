// prisma.config.ts
// import 'dotenv/config'; // Removed for Docker compatibility 

export default {
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
};