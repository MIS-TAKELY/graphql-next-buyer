import 'dotenv/config';
import { typesenseClient } from '../lib/typesense';

async function checkRemote() {
    console.log("🔍 Checking remote Typesense status...");
    console.log(`Host: ${process.env.TYPESENSE_HOST || '72.61.249.56'}`);
    console.log(`API Key: ${process.env.TYPESENSE_API_KEY || 'xyz'}`);

    try {
        const collection = await typesenseClient.collections('products').retrieve();
        console.log("✅ Collection 'products' found.");
        console.log(`- Document count: ${collection.num_documents}`);
        console.log(`- Fields: ${collection.fields.map(f => f.name).join(', ')}`);

        const searchResult = await typesenseClient.collections('products').documents().search({
            q: 'phone',
            query_by: 'name,brand,description,categoryName',
            query_by_weights: '4,3,2,1',
            prefix: true,
            filter_by: 'status:=ACTIVE',
            sort_by: 'soldCount:desc,_text_match:desc',
        });
        console.log(`🔍 Test search for 'phone' with full params found ${searchResult.found} results.`);
        if (searchResult.hits?.length) {
            console.log(`- Top result: ${searchResult.hits[0].document.name}`);
        }
    } catch (e: any) {
        console.error("❌ Failed to check remote Typesense:", e.message);
        if (e.httpStatus) console.error(`HTTP Status: ${e.httpStatus}`);
    }
}

checkRemote();
