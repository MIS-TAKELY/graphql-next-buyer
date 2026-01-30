import { prisma } from '@/lib/db/prisma';

/**
 * Updates lastIndexableUpdate when meaningful product changes occur
 */
export async function updateProductLastIndexable(productId: string) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { lastIndexableUpdate: new Date() },
    });
  } catch (error) {
    console.error('Error updating product lastIndexableUpdate:', error);
  }
}

/**
 * Updates lastIndexableUpdate when meaningful category changes occur
 */
export async function updateCategoryLastIndexable(categoryId: string) {
  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: { lastIndexableUpdate: new Date() },
    });
  } catch (error) {
    console.error('Error updating category lastIndexableUpdate:', error);
  }
}

/**
 * Batch update for multiple products
 */
export async function batchUpdateProductsLastIndexable(productIds: string[]) {
  try {
    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { lastIndexableUpdate: new Date() },
    });
  } catch (error) {
    console.error('Error batch updating products lastIndexableUpdate:', error);
  }
}