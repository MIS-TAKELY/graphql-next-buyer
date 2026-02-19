"use server";

import { callLLM } from "@/lib/search/llm";
import { getCache, setCache } from "@/services/redis.services";

const CACHE_KEY_PREFIX = "smart_spec_mapping:";
const CACHE_TTL = 86400 * 7; // 7 days

export async function getSmartSpecificationMapping(rawKeys: string[]): Promise<Record<string, string>> {
    if (!rawKeys || rawKeys.length === 0) return {};

    const mapping: Record<string, string> = {};
    const unknownKeys: string[] = [];

    // 1. Try to get from cache first
    for (const key of rawKeys) {
        const normalizedInput = key.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
        const cached = await getCache<string>(`${CACHE_KEY_PREFIX}${normalizedInput}`);
        if (cached) {
            mapping[normalizedInput] = cached;
        } else {
            unknownKeys.push(key);
        }
    }

    if (unknownKeys.length === 0) return mapping;

    // 2. Use LLM to group unknown keys
    const prompt = `I have a list of product specification keys. Group synonymous or very closely related keys into a single canonical name.
    
    Keys to group: ${unknownKeys.join(", ")}
    
    Rules:
    - Return a JSON object mapping each input key to its canonical name.
    - IGNORE technical suffixes or modifiers like "(HBM)", "(Typ)", "Peak", "Maximum" when grouping.
    - Example: {"Brightness (HBM)": "Brightness", "Peak Brightness": "Brightness", "Color Depth": "Display Color", "ize": "Display Size", "Size": "Display Size"}
    - Focus on categories like Display, Processor, Storage, Memory, Connectivity, etc.
    
    Respond ONLY with the JSON object.`;

    try {
        const llmResponse = await callLLM(prompt, "qwen2.5:3b", 15000);
        const llmMapping = JSON.parse(llmResponse);

        if (typeof llmMapping === 'object' && llmMapping !== null) {
            for (const [raw, canonical] of Object.entries(llmMapping)) {
                // Use strict normalization (strip symbols) to match frontend CompareTable logic
                const normalizedRaw = raw.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
                const normalizedCanonical = (canonical as string).toLowerCase().trim();

                mapping[normalizedRaw] = normalizedCanonical;

                // Cache the result using the same strict normalization
                await setCache(`${CACHE_KEY_PREFIX}${normalizedRaw}`, normalizedCanonical, CACHE_TTL);
            }
        }
    } catch (error) {
        console.error("Failed to fetch smart mapping from LLM:", error);
        // Fallback: map unknown keys to themselves to avoid repeated attempts
        for (const key of unknownKeys) {
            const normalized = key.toLowerCase().trim();
            if (!mapping[normalized]) {
                mapping[normalized] = normalized;
            }
        }
    }

    return mapping;
}
