import { getAllCategoryNames } from "@/servers/gql/modules/category/categoryHelper";
import { generateEmbedding } from "@/lib/embemdind";
import {
  getCategoryEmbeddings,
  findMostSimilar,
} from "@/lib/embeddingCache";

export interface DetectedIntent {
  category: string;
  attributes: string[];
  intent: Record<string, string[]>;
}

/**
 * Detect category from search query using embedding similarity
 * No external AI API required - uses self-hosted embedding model
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
    // Step 1: Try embedding-based category detection
    console.log(`🔍 Detecting category for: "${query}"`);

    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);

    // Get cached category embeddings
    const categoryEmbeddings = await getCategoryEmbeddings();

    if (categoryEmbeddings.length > 0) {
      // Find most similar category
      const bestMatch = findMostSimilar(queryEmbedding, categoryEmbeddings, 0.4);

      if (bestMatch) {
        console.log(`✅ Category detected via embedding: ${bestMatch.name}`);
        return {
          category: bestMatch.name,
          attributes: [],
          intent: {},
        };
      }
    }

    // Step 2: Fallback to keyword matching
    console.log("⚠️ Embedding match failed, using keyword fallback");
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

