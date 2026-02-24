import 'dotenv/config';
import { typesenseClient } from '../lib/typesense';

async function main() {
    const q = "Sony ZV-1 II";
    console.log(`🔍 Inspecting: "${q}" in Typesense`);

    try {
        const searchResult = await typesenseClient.collections('products').documents().search({
            q: q,
            query_by: 'name',
        });

        if (searchResult.hits && searchResult.hits.length > 0) {
            const doc = searchResult.hits[0].document;
            console.log("--- Typesense Document ---");
            console.log(JSON.stringify(doc, null, 2));

            // Also check for "Smart phones" category categoryId
            const smartphonesSearchResult = await typesenseClient.collections('products').documents().search({
                q: 'Smart phones',
                query_by: 'categoryName',
                per_page: 1
            });

            if (smartphonesSearchResult.hits && smartphonesSearchResult.hits.length > 0) {
                console.log("\n--- Example Smart phone Category Info ---");
                console.log("CategoryId:", smartphonesSearchResult.hits[0].document.categoryId);
                console.log("CategoryName:", smartphonesSearchResult.hits[0].document.categoryName);
            }
        } else {
            console.log("Product not found in Typesense.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

main().catch(console.error);
