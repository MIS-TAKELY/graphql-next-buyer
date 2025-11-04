import axios from "axios";
import fs from "fs";
import path from "path";

// Types for filter attributes
interface FilterAttribute {
  model: string;
  field: string;
  dataType: "string" | "number" | "boolean" | "enum" | "JSON";
  filterType: "dropdown" | "slider" | "checkbox" | "text";
  exampleValues: string[];
  notes?: string;
}

// Load Prisma schema
const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
const fullSchema = fs.readFileSync(schemaPath, "utf-8");

// Split schema by models
function splitSchemaByModel(schema: string): string[] {
  const regex = /model\s+(\w+)\s*{[\s\S]*?}/g;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(schema)) !== null) {
    matches.push(match[0]);
  }
  return matches;
}

// Clean AI response to extract valid JSON
function cleanAIResponse(content: string): string {
  // Remove markdown code blocks
  let cleaned = content
    .replace(/^```(?:json|typescript)?\n?|\n?```$/g, "")
    .trim();

  // Remove common AI preamble (e.g., "Based on the schema...")
  cleaned = cleaned.replace(/^Based on.*?\n*(\[.*)/s, "$1");

  // Extract JSON array if response contains extra text
  const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  return cleaned;
}

// Call AI for one chunk with retry logic
async function generateFilterJSONForChunk(
  chunk: string,
  retryCount = 0,
  maxRetries = 2
): Promise<FilterAttribute[]> {
  const prompt = `You are an AI assistant tasked with analyzing a Prisma database schema chunk for an e-commerce platform. Your task is to identify filterable attributes for a product filter system (e.g., price, category, brand, size, color, rating). Return ONLY a valid JSON array of objects in this exact format, with no additional text, explanations, or markdown:

[
  {
    "model": "ModelName",
    "field": "fieldName",
    "dataType": "string|number|boolean|enum|JSON",
    "filterType": "dropdown|slider|checkbox|text",
    "exampleValues": ["example1", "example2"],
    "notes": "Optional notes"
  }
]

Focus on fields relevant to e-commerce filtering (e.g., price, category, brand, size, color, rating, stock, specifications). Exclude internal fields like IDs unless they are explicitly filterable (e.g., productId for relations). If no filterable attributes are found, return an empty array [].

Schema chunk:
\`\`\`
${chunk}
\`\`\`
`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mixtral-8x7b-instruct",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 8000,
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer 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`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://your-app.com",
          "X-Title": "Prisma Filter Extractor",
        },
      }
    );

    const content = response.data.choices[0].message.content?.trim();
    if (!content) {
      console.warn(
        `Empty response for chunk: ${chunk.split("\n")[0]?.slice(0, 50)}...`
      );
      return [];
    }

    const cleanedContent = cleanAIResponse(content);
    if (!cleanedContent.startsWith("[")) {
      throw new Error(`Invalid JSON start: ${cleanedContent.slice(0, 20)}...`);
    }

    const parsed = JSON.parse(cleanedContent) as FilterAttribute[];

    // Validate schema
    for (const attr of parsed) {
      if (
        !["string", "number", "boolean", "enum", "JSON"].includes(attr.dataType)
      ) {
        throw new Error(`Invalid dataType in response: ${attr.dataType}`);
      }
      if (
        !["dropdown", "slider", "checkbox", "text"].includes(attr.filterType)
      ) {
        throw new Error(`Invalid filterType in response: ${attr.filterType}`);
      }
    }

    return parsed;
  } catch (error: any) {
    console.error(
      `Error processing chunk: ${chunk.split("\n")[0]?.slice(0, 50)}...`,
      error.message
    );

    // Save failed chunk for debugging
    fs.appendFileSync(
      path.join(process.cwd(), "failed_chunks.txt"),
      `Chunk: ${chunk}\nError: ${error.message}\nResponse: ${
        error.response?.data?.choices?.[0]?.message?.content || "No response"
      }\n\n`
    );

    // Retry logic
    if (retryCount < maxRetries) {
      console.log(`Retrying chunk (${retryCount + 1}/${maxRetries})...`);
      return generateFilterJSONForChunk(chunk, retryCount + 1, maxRetries);
    }

    return [];
  }
}

// Main function
export async function getFilterableAttributes(): Promise<FilterAttribute[]> {
  console.log("📥 Loading Prisma schema...");
  const chunks = splitSchemaByModel(fullSchema);
  console.log(`🔍 Found ${chunks.length} models to analyze`);

  const allAttributes: FilterAttribute[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`🤖 Processing model ${i + 1}/${chunks.length}...`);
    const chunkAttributes = await generateFilterJSONForChunk(chunk);
    allAttributes.push(...chunkAttributes);
  }

  // Deduplicate by model+field
  const uniqueAttributes = Array.from(
    new Map(
      allAttributes.map((attr) => [`${attr.model}-${attr.field}`, attr])
    ).values()
  );

  return uniqueAttributes;
}

// Run
(async () => {
  //   if (!process.env.OPENROUTER_API_KEY) {
  //     console.error("❌ Set OPENROUTER_API_KEY environment variable");
  //     process.exit(1);
  //   }

  try {
    const filters = await getFilterableAttributes();
    console.log("\n🎉 All filterable attributes:");
    console.log(JSON.stringify(filters, null, 2));

    // Save output to file
    fs.writeFileSync(
      path.join(process.cwd(), "filterable_attributes.json"),
      JSON.stringify(filters, null, 2)
    );
    console.log("✅ Saved to filterable_attributes.json");
  } catch (err) {
    console.error("Failed:", err);
  }
})();
