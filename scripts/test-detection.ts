
import { detectCategory } from "../filter/detectCategory";

async function test() {
    console.log("Testing category detection...");

    const cases = [
        "Electroics",
        "Furniture",
        "Beauti",
        "mobile phone",
        "laptop",
        "unknown category"
    ];

    for (const query of cases) {
        const result = await detectCategory(query);
        console.log(`Query: "${query}" -> Detected Category: "${result.category}"`);
    }
}

test().catch(console.error);
