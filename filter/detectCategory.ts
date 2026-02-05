import { getAllCategoryNames } from "@/servers/gql/modules/category/categoryHelper";

export interface DetectedIntent {
  category: string;
  attributes: string[];
  intent: Record<string, string[]>;
}

/**
 * Detect category from search query using Typesense
 */
export async function detectCategory(
  query: string
): Promise<DetectedIntent> {
  const DEFAULT_INTENT: DetectedIntent = {
    category: "Electronics & Gadgets",
    attributes: [],
    intent: {},
  };

  try {
    console.log(`🔍 Detecting category for: "${query}"`);

    // Step 0: Try LLM-based detection (Local Ollama)
    try {
      const { extractIntentWithLLM, mapCategoryToDB } = await import("@/lib/search/intentExtractor");
      const llmIntent = await extractIntentWithLLM(query);

      if (llmIntent.category) {
        console.log(`🤖 LLM suggested category: ${llmIntent.category}`);
        const dbCategory = await mapCategoryToDB(llmIntent.category);

        if (dbCategory) {
          console.log(`✅ LLM Category mapped to DB: ${dbCategory}`);
          return {
            category: dbCategory,
            attributes: [],
            intent: {},
          };
        }
      }
    } catch (llmError) {
      console.error("⚠️ LLM Category detection failed, falling back...", llmError);
    }

    // Step 1: Use Typesense to find the most relevant category
    const { typesenseClient } = await import("@/lib/typesense");

    const searchResult = await typesenseClient.collections('products').documents().search({
      q: query,
      query_by: 'name,brand,description,categoryName',
      per_page: 1,
      include_fields: 'categoryName'
    });

    const topHit = searchResult.hits?.[0] as any;

    if (topHit?.document?.categoryName) {
      console.log(`✅ Category detected via Typesense: ${topHit.document.categoryName}`);
      return {
        category: topHit.document.categoryName,
        attributes: [],
        intent: {},
      };
    }

    // Step 2: Fallback to keyword matching
    console.log("⚠️ Typesense match failed, using keyword fallback");
    return findFallbackIntent(query);
  } catch (error) {
    console.error("❌ Category detection failed:", error);
    return findFallbackIntent(query);
  }
}

/**
 * Keyword-based fallback for category detection
 */
function findFallbackIntent(query: string): DetectedIntent {
  const queryLower = query.toLowerCase();
  const keywordMappings: Record<string, string[]> = {
    "Mobile Phones & Accessories": ["phone", "mobile", "iphone", "samsung", "smartphone"],
    "Electronics & Gadgets": ["laptop", "computer", "pc", "tv", "camera", "electronic", "gadget"],
    "Fashion & Apparel": ["shirt", "dress", "clothes", "clothing", "wear", "fashion"],
    "Furniture & Home Decor": ["furniture", "sofa", "table", "chair", "decor"],
    "Beauty & Personal Care": ["beauty", "makeup", "skin", "hair", "cosmetic"],
    "Sports & Fitness": ["sports", "fitness", "gym", "exercise", "yoga"],
    "Books & Media": ["book", "novel", "magazine", "dvd", "cd"],
    "Toys & Games": ["toy", "game", "puzzle", "doll"],
    "Automotive": ["car", "bike", "motorcycle", "automotive", "vehicle"],
    "Health & Wellness": ["health", "wellness", "vitamin", "supplement", "medicine"],
  };

  let category = "Electronics & Gadgets";
  for (const [cat, keywords] of Object.entries(keywordMappings)) {
    if (keywords.some((k) => queryLower.includes(k))) {
      category = cat;
      break;
    }
  }

  const intent: Record<string, string[]> = {};

  // Extract brand intent from keywords
  if (queryLower.includes("iphone") || queryLower.includes("apple")) {
    intent.brand = ["Apple"];
  }
  if (queryLower.includes("samsung")) {
    intent.brand = ["Samsung"];
  }
  if (queryLower.includes("oneplus")) {
    intent.brand = ["OnePlus"];
  }

  console.log(`📋 Fallback category: ${category}`);

  return {
    category,
    attributes: Object.keys(intent),
    intent,
  };
}

