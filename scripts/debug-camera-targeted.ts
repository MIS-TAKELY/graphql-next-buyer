import 'dotenv/config';
import { typesenseClient } from '../lib/typesense';

async function main() {
    const q = "Sony ZV-1 II";
    try {
        const searchResult = await typesenseClient.collections('products').documents().search({
            q: q,
            query_by: 'name',
        });

        if (searchResult.hits && searchResult.hits.length > 0) {
            const doc = searchResult.hits[0].document;
            console.log("--- Category Info for Sony ZV-1 II ---");
            console.log("CategoryId:", doc.categoryId);
            console.log("CategoryName:", doc.categoryName);
            console.log("Description:", doc.description);
        } else {
            console.log("Product not found in Typesense.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

main().catch(console.error);
