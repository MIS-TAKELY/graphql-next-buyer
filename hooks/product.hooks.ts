import { PrismaClient } from "@/app/generated/prisma";
import { productIndexingService } from "../services/product-indexing.services";

const prisma = new PrismaClient();

// Add this middleware to automatically index products when they're created or updated
prisma.$use(async (params, next) => {
  const result = await next(params);

  // Index product after create or update
  if (params.model === "Product") {
    if (params.action === "create" || params.action === "update") {
      try {
        await productIndexingService.indexProduct(result.id);
      } catch (error) {
        console.error("Failed to index product:", error);
      }
    }

    if (params.action === "delete") {
      try {
        await productIndexingService.removeFromIndex(params.args.where.id);
      } catch (error) {
        console.error("Failed to remove product from index:", error);
      }
    }
  }

  return result;
});

export { prisma };
