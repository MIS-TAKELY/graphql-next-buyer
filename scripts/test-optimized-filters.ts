import 'dotenv/config';
import { getDynamicFilters } from '../filter/getFilters';

async function testFilter() {
    const queries = [
        "iphone under 1 lakh",
        "gaming laptop with 16gb ram",
        "samsung phone",
        "redmi under 20000"
    ];

    for (const query of queries) {
        console.log(`\n--- Testing Query: "${query}" ---`);
        try {
            const result = await getDynamicFilters(query);
            console.log(`✅ Detected Category: ${result.category}`);
            console.log(`✅ Intent:`, JSON.stringify(result.intent, null, 2));
            console.log(`✅ Filters found: ${result.filters.length}`);
            result.filters.forEach(f => {
                console.log(`   - ${f.label} (${f.key}): ${f.options.length} options`);
                if (f.options.length > 0) {
                    console.log(`     Top option: ${f.options[0].label} (${f.options[0].count})`);
                }
            });
        } catch (e: any) {
            console.error(`❌ Test failed for "${query}":`, e.message);
        }
    }
}

testFilter().catch(console.error);
