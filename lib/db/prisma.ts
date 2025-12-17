import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Add connection pool configuration
    // @ts-ignore - These options exist but may not be in types
    __internal: {
      engine: {
        connection_limit: 10,
        pool_timeout: 10,
      },
    },
  });

if (process.env.NODE_ENV === "development") {
  process.on("beforeExit", async () => {
    // console.log("Process is exiting, disconnecting Prisma...");
    await prisma.$disconnect();
  });
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
