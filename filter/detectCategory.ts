import { getAllCategoryNames } from "@/servers/gql/modules/category/categoryHelper";
import axios from "axios";

const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY ||
  "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";

// Cache at module level to avoid repeated DB calls
let CATEGORIES_CACHE: string[] | null = null;
let CATEGORIES_PROMISE: Promise<string[]> | null = null;

export async function detectCategory(
  query: string,
  maxRetries = 3
): Promise<string> {
  const DEFAULT_CATEGORY = "Electronics";

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
          return ["Electronics"];
        }

        CATEGORIES_CACHE = result;
        console.log("✅ Categories loaded:", result);
        return result;
      } catch (error) {
        console.error("❌ Failed to load categories:", error);
        return ["Electronics"];
      }
    })();

    return CATEGORIES_PROMISE;
  }

  // ===== VALIDATE CATEGORY =====
  function isValidCategory(category: string, categories: string[]): boolean {
    try {
      return categories.some(
        (cat) => cat.toLowerCase() === category.toLowerCase()
      );
    } catch (err) {
      console.error("Error validating category:", err);
      return false;
    }
  }

  // ===== FIND CLOSEST MATCH =====
  function findClosestCategory(
    input: string,
    categories: string[]
  ): string | null {
    try {
      const normalizedInput = input.toLowerCase().trim();

      const exactMatch = categories.find(
        (cat) => cat.toLowerCase() === normalizedInput
      );
      if (exactMatch) return exactMatch;

      const partialMatch = categories.find(
        (cat) =>
          cat.toLowerCase().includes(normalizedInput) ||
          normalizedInput.includes(cat.toLowerCase())
      );
      return partialMatch || null;
    } catch (err) {
      console.error("Error finding closest category:", err);
      return null;
    }
  }

  // ===== CALL AI API =====
  async function callMistralAPI(
    query: string,
    categories: string[],
    attemptNumber = 1
  ): Promise<string> {
    try {
      const prompt =
        attemptNumber === 1
          ? `You are an expert e-commerce AI categorizer. Classify the given user search query into exactly one category from the list below. Return only the category name, without quotes, numbers, nesting or extra explanation.

Categories: ${categories.join(", ")}

User Query: "${query}"

Category:`
          : `IMPORTANT: You MUST choose EXACTLY ONE category from this list. Do not create new categories.

Valid Categories:
${categories.map((cat, i) => `${i + 1}. ${cat}`).join("\n")}

User Query: "${query}"

Return ONLY the exact category name from the list above.`;

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "mistralai/mistral-7b-instruct",
          messages: [{ role: "user", content: prompt }],
          temperature: attemptNumber === 1 ? 0.3 : 0.1,
          max_tokens: 50,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const aiResponse =
        response.data?.choices?.[0]?.message?.content?.trim() || "";
      console.log(`🤖 AI response (attempt ${attemptNumber}):`, aiResponse);

      return aiResponse;
    } catch (error: any) {
      console.error("Mistral API error:", error.message || error);
      return "";
    }
  }

  // ===== KEYWORD FALLBACK =====
  function findFallbackCategory(query: string): string {
    const queryLower = query.toLowerCase();
    const keywordMappings: Record<string, string[]> = {
      "Mobile Phones & Accessories": [
        "phone",
        "mobile",
        "iphone",
        "samsung",
        "smartphone",
      ],
      "Computers & Laptops": [
        "laptop",
        "computer",
        "pc",
        "macbook",
        "notebook",
      ],
      "Fashion & Apparel": [
        "shirt",
        "dress",
        "clothes",
        "clothing",
        "wear",
        "kurta",
      ],
      "Home & Kitchen": ["kitchen", "home", "furniture", "utensil"],
      "Beauty & Personal Care": ["beauty", "skincare", "makeup", "cosmetic"],
      "Toys & Games": ["toy", "game", "play", "puzzle"],
      "Sports & Outdoors": ["sport", "fitness", "gym", "outdoor"],
      "Grocery & Gourmet": ["food", "snack", "grocery", "beverage"],
    };

    for (const [category, keywords] of Object.entries(keywordMappings)) {
      if (keywords.some((k) => queryLower.includes(k))) {
        return category;
      }
    }

    return "Electronics";
  }

  // ===== MAIN LOGIC =====
  const CATEGORIES = await loadCategories();

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\n🔄 Attempt ${attempt}/${maxRetries}: "${query}"`);

      const result = await callMistralAPI(query, CATEGORIES, attempt);

      if (isValidCategory(result, CATEGORIES)) {
        console.log(`✅ Valid category found: ${result}`);
        return result;
      }

      const closestMatch = findClosestCategory(result, CATEGORIES);
      if (closestMatch) {
        console.log(`🔍 Closest match found: ${closestMatch}`);
        return closestMatch;
      }

      console.warn(`⚠️ Invalid category returned: "${result}"`);

      if (attempt === maxRetries) {
        console.error("❌ Max retry limit reached.");
        break;
      }

      await new Promise((res) => setTimeout(res, 1000));
    } catch (error) {
      console.error(`Error in detectCategory (attempt ${attempt}):`, error);
      if (attempt === maxRetries) break;
    }
  }

  const fallbackCategory = findFallbackCategory(query);
  console.log(`🧭 Using fallback category: ${fallbackCategory}`);
  return fallbackCategory || DEFAULT_CATEGORY;
}
