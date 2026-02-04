import 'dotenv/config';
import { typesenseClient } from '../lib/typesense';

async function verifySearch() {
    const queries = ["sansang", "laptop", "Apple"];

    for (const q of queries) {
        console.log(`\n🔍 Searching for: "${q}"`);
        try {
            const searchResult = await typesenseClient.collections('products').documents().search({
                q: q,
                query_by: 'name,brand',
                prefix: true
            });

            console.log(`Found ${searchResult.found} results:`);
            searchResult.hits?.forEach((hit: any) => {
                console.log(`- [${hit.document.id}] ${hit.document.name} (Brand: ${hit.document.brand}, Score: ${hit.text_match})`);
            });
        } catch (e) {
            console.error(`Error searching for "${q}":`, e);
        }
    }
}

verifySearch().catch(console.error);
