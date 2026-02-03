
import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
    console.log("Clearing existing embeddings...");
    await prisma.$executeRaw`UPDATE "products" SET "embedding" = NULL`;
    console.log("Embeddings cleared.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
