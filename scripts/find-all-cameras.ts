import 'dotenv/config';
import { typesenseClient } from '../lib/typesense';

async function main() {
    console.log(`🔍 Searching for all "Camera" products in Typesense`);

    try {
        const searchResult = await typesenseClient.collections('products').documents().search({
            q: 'Camera',
            query_by: 'name',
            per_page: 20
        });

        if (searchResult.hits && searchResult.hits.length > 0) {
            console.log(`Found ${searchResult.found} results:`);
            searchResult.hits.forEach((hit: any) => {
                const doc = hit.document;
                console.log(`- [${doc.id}] ${doc.name}`);
                console.log(`  Category: ${doc.categoryName} (${doc.categoryId})`);
            });
        } else {
            console.log("No products found for 'Camera'.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

main().catch(console.error);
