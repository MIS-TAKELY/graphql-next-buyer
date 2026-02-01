import { getAllCategoryNames } from "@/servers/gql/modules/category/categoryHelper";
import axios from "axios";

const OPENROUTER_API_KEY =
  process.env.OPENROUTER_FILTER_API_KEY ||
  process.env.OPENROUTER_API_KEY ||
  "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";

// Cache at module level to avoid repeated DB calls
let CATEGORIES_CACHE: string[] | null = null;
let CATEGORIES_PROMISE: Promise<string[]> | null = null;

export interface DetectedIntent {
  category: string;
  attributes: string[];
  intent: Record<string, string[]>;
}

export async function detectCategory(
  query: string,
  maxRetries = 3
): Promise<DetectedIntent> {
  const DEFAULT_INTENT: DetectedIntent = {
    category: "Electronics & Gadgets",
    attributes: [],
    intent: {},
  };

  // ===== LOAD CATEGORIES =====
  async function loadCategories(): Promise<string[]> {
    if (CATEGORIES_CACHE) {
      return CATEGORIES_CACHE;
    }

    if (CATEGORIES_PROMISE) {
      return CATEGORIES_PROMISE;
    }

    CATEGORIES_PROMISE = (async () => {
      try {
        const result = await getAllCategoryNames();

        if (!Array.isArray(result) || result.length === 0) {
          console.warn("⚠️ Empty category list, using fallback");
          return ["Electronics & Gadgets"];
        }

        CATEGORIES_CACHE = result;
        return result;
      } catch (error) {
        console.error("❌ Failed to load categories:", error);
        return ["Electronics & Gadgets"];
      }
    })();

    return CATEGORIES_PROMISE;
  }

  // ===== CALL AI API =====
  async function callMistralAPI(
    query: string,
    categories: string[]
  ): Promise<DetectedIntent | null> {
    try {
      const prompt = `You are an expert e-commerce AI. Analyze the search query and return a JSON object.
Choose exactly one category from the provided list.
Identify any specific attributes (like color, brand, size, storage) mentioned in the query.

Categories: ${categories.join(", ")}

User Query: "${query}"

Return ONLY a JSON object in this format:
{
  "category": "Exact Category Name",
  "attributes": ["attribute1", "attribute2"],
  "intent": {
    "attributeName": ["value1", "value2"]
  }
}

Example for "red nike shoes":
{
  "category": "Footwear",
  "attributes": ["color", "brand"],
  "intent": {
    "color": ["red"],
    "brand": ["nike"]
  }
}`;

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "mistralai/mistral-7b-instruct",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 200,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const content = response.data?.choices?.[0]?.message?.content || "";
      const parsed = JSON.parse(content);

      // Robust matching: Check if AI category exactly matches or if any DB category includes the AI category
      const normalizedAI = (parsed.category || "").toLowerCase();
      const exactMatch = categories.find(c => c.toLowerCase() === normalizedAI);

      let finalCategory = "Electronics & Gadgets"; // System default

      if (exactMatch) {
        finalCategory = exactMatch;
      } else {
        const partialMatch = categories.find(c => c.toLowerCase().includes(normalizedAI) || normalizedAI.includes(c.toLowerCase()));
        if (partialMatch) {
          finalCategory = partialMatch;
        }
      }

      return {
        category: finalCategory,
        attributes: parsed.attributes || [],
        intent: parsed.intent || {}
      };
    } catch (error: any) {
      if (error?.response?.status === 402) {
        console.warn("⚠️ AI API credit exhausted (402), falling back to keyword detection immediately.");
      } else {
        console.error("AI API error:", error.message || error);
      }
      return null;
    }
  }

  // ===== KEYWORD FALLBACK =====
  function findFallbackIntent(query: string): DetectedIntent {
    const queryLower = query.toLowerCase();
    const keywordMappings: Record<string, string[]> = {
      "Mobile Phones & Accessories": ["phone", "mobile", "iphone", "samsung"],
      "Electronics & Gadgets": ["laptop", "computer", "pc", "tv", "camera", "electronic"],
      "Fashion & Apparel": ["shirt", "dress", "clothes", "clothing", "wear"],
      "Furniture & Home Decor": ["furniture", "sofa", "table", "chair"],
      "Beauty & Personal Care": ["beauty", "makeup", "skin", "hair"]
    };

    let category = "Electronics & Gadgets";
    for (const [cat, keywords] of Object.entries(keywordMappings)) {
      if (keywords.some((k) => queryLower.includes(k))) {
        category = cat;
        break;
      }
    }

    const intent: Record<string, string[]> = {};
    if (queryLower.includes("iphone")) intent.brand = ["Apple"];
    if (queryLower.includes("samsung")) intent.brand = ["Samsung"];

    return {
      category,
      attributes: Object.keys(intent),
      intent
    };
  }

  // ===== MAIN LOGIC =====
  const CATEGORIES = await loadCategories();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await callMistralAPI(query, CATEGORIES);
    if (result) return result;
    if (attempt < maxRetries) await new Promise(res => setTimeout(res, 500));
  }

  return findFallbackIntent(query);
}
