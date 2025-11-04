import axios from "axios";

/**
 * Uses Mistral 7B Instruct via OpenRouter to detect product category
 * based on a user's search term.
 */

const CATEGORIES = [
  "Electronics",
  "Mobile Phones & Accessories",
  "Computers & Laptops",
  "TVs & Home Entertainment",
  "Cameras & Photography",
  "Audio & Headphones",
  "Gaming",
  "Fashion & Apparel",
  "Men's Fashion",
  "Women's Fashion",
  "Kids & Infant Wear",
  "Footwear",
  "Watches & Jewelry",
  "Home & Kitchen",
  "Furniture",
  "Kitchen Appliances",
  "Home Decor",
  "Cookware & Dining",
  "Lighting",
  "Grocery & Gourmet",
  "Snacks & Beverages",
  "Dairy Products",
  "Breakfast Cereals",
  "Organic & Healthy Foods",
  "Tea & Coffee",
  "Beauty & Personal Care",
  "Skincare",
  "Haircare",
  "Makeup",
  "Perfumes & Deodorants",
  "Men's Grooming",
  "Health & Wellness",
  "Vitamins & Supplements",
  "Fitness Equipment",
  "Medical Supplies",
  "Fiction & NonFiction Books",
  "Educational Textbooks",
  "Office Stationery",
  "Pens & Notebooks",
  "Toys & Games",
  "Action Figures",
  "Board Games",
  "Remote Control Toys",
  "Educational Toys",
  "Automotive & Tools",
  "Car Accessories",
  "Bike Accessories",
  "Tools & Hardware",
  "Automotive Care",
  "Sports & Outdoors",
  "Gym Equipment",
  "Cricket, Football, Badminton Gear",
  "Camping & Hiking Gear",
];

// Store API key in environment variable for security
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || 
  "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";

/**
 * Validates if the category exists in our predefined list
 */
function isValidCategory(category: string): boolean {
  return CATEGORIES.some(cat => 
    cat.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Finds the closest matching category using simple string matching
 */
function findClosestCategory(input: string): string | null {
  const normalizedInput = input.toLowerCase().trim();
  
  // First try exact match (case-insensitive)
  const exactMatch = CATEGORIES.find(cat => 
    cat.toLowerCase() === normalizedInput
  );
  if (exactMatch) return exactMatch;
  
  // Then try partial match
  const partialMatch = CATEGORIES.find(cat => 
    cat.toLowerCase().includes(normalizedInput) || 
    normalizedInput.includes(cat.toLowerCase())
  );
  if (partialMatch) return partialMatch;
  
  return null;
}

/**
 * Makes a single API call to get category
 */
async function callMistralAPI(query: string, attemptNumber: number = 1): Promise<string> {
  // Make prompt increasingly strict with each attempt
  const prompt = attemptNumber === 1 
    ? `You are an expert e-commerce AI categorizer. Classify the given user search query into exactly one category from the list below. Return only the category name, without quotes, numbers, nesting or extra explanation.

Categories: ${CATEGORIES.join(", ")}

User Query: "${query}"

Category:`
    : `IMPORTANT: You MUST choose EXACTLY ONE category from this list. Do not create new categories.

Valid Categories:
${CATEGORIES.map((cat, i) => `${i + 1}. ${cat}`).join("\n")}

User Query: "${query}"

Return ONLY the exact category name from the list above. Choose the most relevant one:`;

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: prompt }],
      temperature: attemptNumber === 1 ? 0.3 : 0.1, // Lower temperature for more deterministic output
      max_tokens: 50,
    },
    {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices?.[0]?.message?.content?.trim() || "";
}

/**
 * Main function with retry logic and validation
 */
export async function detectCategory(
  query: string, 
  maxRetries: number = 3
): Promise<string> {
  const DEFAULT_CATEGORY = "Electronics"; // Fallback category
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} of ${maxRetries} for query: "${query}"`);
      
      const result = await callMistralAPI(query, attempt);
      console.log(`AI response (attempt ${attempt}):`, result);
      
      // Check if the result is valid
      if (isValidCategory(result)) {
        console.log(`Valid category found: ${result}`);
        return result;
      }
      
      // Try to find closest match
      const closestMatch = findClosestCategory(result);
      if (closestMatch) {
        console.log(`Found closest match: ${closestMatch} for AI output: ${result}`);
        return closestMatch;
      }
      
      console.warn(`Invalid category returned: "${result}". Retrying...`);
      
      // If this is the last attempt, don't continue
      if (attempt === maxRetries) {
        console.error(`Failed to get valid category after ${maxRetries} attempts`);
        break;
      }
      
    } catch (err: any) {
      console.error(`API error on attempt ${attempt}:`, err.message);
      
      // If it's the last attempt, break and use fallback
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait a bit before retrying on error
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Fallback: try to match based on keywords in the query
  const fallbackCategory = findFallbackCategory(query);
  console.log(`Using fallback category: ${fallbackCategory}`);
  return fallbackCategory;
}

/**
 * Simple keyword-based fallback categorization
 */
function findFallbackCategory(query: string): string {
  const queryLower = query.toLowerCase();
  
  // Define keyword mappings
  const keywordMappings: Record<string, string[]> = {
    "Mobile Phones & Accessories": ["phone", "mobile", "iphone", "samsung", "smartphone"],
    "Computers & Laptops": ["laptop", "computer", "pc", "macbook", "notebook"],
    "Fashion & Apparel": ["shirt", "dress", "clothes", "clothing", "wear"],
    "Home & Kitchen": ["kitchen", "home", "furniture", "utensil"],
    "Beauty & Personal Care": ["beauty", "skincare", "makeup", "cosmetic"],
    "Toys & Games": ["toy", "game", "play", "puzzle"],
    "Sports & Outdoors": ["sport", "fitness", "gym", "outdoor"],
    "Grocery & Gourmet": ["food", "snack", "grocery", "beverage"],
    // Add more mappings as needed
  };
  
  // Check for keyword matches
  for (const [category, keywords] of Object.entries(keywordMappings)) {
    if (keywords.some(keyword => queryLower.includes(keyword))) {
      return category;
    }
  }
  
  // Default fallback
  return "Electronics";
}

// Optional: Export categories for use in other parts of your application
export { CATEGORIES };