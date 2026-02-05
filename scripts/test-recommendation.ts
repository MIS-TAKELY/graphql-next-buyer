import { prisma } from "../lib/db/prisma.ts";
import { productResolvers } from "../servers/gql/modules/products/product.resolvers.ts";

async function testRecommendation() {
    console.log("🚀 Testing Optimized Recommendation...");

    try {
        // 1. Test Item-to-Item Recommendation
        const sampleProduct = await prisma.product.findFirst({
            where: { embedding: { not: null } },
            select: { id: true, name: true }
        });

        if (sampleProduct) {
            console.log(`\n📦 Testing Item-to-Item for: "${sampleProduct.name}" (${sampleProduct.id})`);
            const recommendations = await productResolvers.Query.getRecommendedProducts(
                null,
                { productId: sampleProduct.id, limit: 5 },
                {}
            );
            console.log("✅ Results:");
            recommendations.forEach((p: any, i: number) => {
                console.log(`${i + 1}. ${p.name} (Brand: ${p.brand})`);
            });
        } else {
            console.log("❌ No products with embeddings found for item-to-item test.");
        }

        // 2. Test Personalized Recommendation (Guest)
        console.log("\n👤 Testing Landing Page Recommendation (Guest)...");
        const guestRecs = await productResolvers.Query.getRecommendedProducts(
            null,
            { limit: 5 },
            {}
        );
        console.log("✅ Results:");
        guestRecs.forEach((p: any, i: number) => {
            console.log(`${i + 1}. ${p.name}`);
        });

        // 3. Test Personalized Recommendation (User)
        const sampleUser = await prisma.user.findFirst({
            where: { recentlyViewed: { some: {} } },
            select: { id: true, firstName: true }
        });

        if (sampleUser) {
            console.log(`\n👤 Testing Personalized Recommendation for User: "${sampleUser.firstName}" (${sampleUser.id})`);
            const userRecs = await productResolvers.Query.getRecommendedProducts(
                null,
                { limit: 5 },
                { user: { id: sampleUser.id } }
            );
            console.log("✅ Results:");
            userRecs.forEach((p: any, i: number) => {
                console.log(`${i + 1}. ${p.name}`);
            });
        } else {
            console.log("❌ No users with recent activity found for personalized test.");
        }

    } catch (error) {
        console.error("❌ Recommendation test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testRecommendation();
