import { searchResolvers } from '../servers/gql/modules/search/search.resolvers';
import { prisma } from '../lib/db/prisma';

async function verifySearch() {
    const queries = ["laaptopt", "l"];

    for (const query of queries) {
        console.log(`\nTesting query: "${query}"`);
        try {
            // @ts-ignore
            const result = await searchResolvers.Query.searchProducts({}, { query, page: 1, limit: 10 });
            console.log(`Found ${result.products.length} products:`);
            result.products.forEach((p: any) => {
                console.log(`- [${p.id}] ${p.name} (Brand: ${p.brand}, Category: ${p.category?.name})`);
            });

            // @ts-ignore
            const suggestions = await searchResolvers.Query.searchSuggestions({}, { query });
            console.log(`Suggestions: ${suggestions.join(", ")}`);

        } catch (e) {
            console.error(`Error testing "${query}":`, e);
        }
    }

    // Also test a specific case where we expect "laaptopt" to find laptops
    // This part is manual validation by reading logs, but we could assert if we knew IDs.
}

verifySearch()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
