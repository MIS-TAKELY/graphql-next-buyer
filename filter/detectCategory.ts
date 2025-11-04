import axios from "axios";

/**
 * Uses Mistral 7B Instruct via OpenRouter to detect product category
 * based on a user's search term.
 */


export async function detectCategory(query: string): Promise<string> {
  const categories = [
    "Electronics",
    "Mobile Phones & Accessories",
    "Computers & Laptops",
    "TVs & Home Entertainment",
    "Cameras & Photography",
    "Audio & Headphones",
    "Gaming",
    "Fashion & Apparel",
    "Men’s Fashion",
    "Women’s Fashion",
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
    "Men’s Grooming",
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

  const prompt = `
You are an expert e-commerce AI categorizer. Classify the given user search query into **exactly one** category from the list below. Return **only the category name**, without quotes, numbers,nesting or extra explanation. 

Categories:"${categories}"

User Query: "${query}"
`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer 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`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "response of ai---->",
      response.data.choices?.[0]?.message?.content.trim()
    );

    return response.data.choices?.[0]?.message?.content?.trim() || "Unknown";
  } catch (err: any) {
    console.error("Mistral API error:", err.message);
    return "Unknown";
  }
}
