
import { prisma } from "./db/prisma";

async function main() {
    console.log("Starting manual migration...");

    // 1. Clear existing embeddings (required for type change if dimensions mismatch)
    console.log("Clearing existing embeddings...");
    await prisma.$executeRawUnsafe(`UPDATE "products" SET "embedding" = NULL`);

    // 2. Alter column type
    console.log("Altering column type to vector(384)...");
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "products" ALTER COLUMN "embedding" TYPE vector(384)`);
        console.log("✅ Column type altered successfully.");
    } catch (e: any) {
        console.error("❌ Failed to alter column:", e);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
