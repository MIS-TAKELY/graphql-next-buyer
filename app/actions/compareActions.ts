"use server";

import { callLLM } from "@/lib/search/llm";
import { getCache, setCache } from "@/services/redis.services";

const CACHE_KEY_PREFIX = "smart_spec_mapping:";
const CACHE_TTL = 86400 * 7; // 7 days

export async function getSmartSpecificationMapping(rawKeysWithValues: Record<string, string>): Promise<Record<string, string>> {
    const rawKeys = Object.keys(rawKeysWithValues);
    if (!rawKeys || rawKeys.length === 0) return {};

    const mapping: Record<string, string> = {};
    const unknownKeysWithValues: Record<string, string> = {};

    // 1. Try to get from cache first
    for (const key of rawKeys) {
        if (!key || typeof key !== 'string') continue;
        const normalizedInput = key.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
        const cached = await getCache<string>(`${CACHE_KEY_PREFIX}${normalizedInput}`);
        if (cached) {
            mapping[normalizedInput] = cached;
        } else {
            unknownKeysWithValues[key] = rawKeysWithValues[key];
        }
    }

    const keysToMap = Object.keys(unknownKeysWithValues);
    if (keysToMap.length === 0) return mapping;

    // 2. Use LLM to group unknown keys
    const entriesString = Object.entries(unknownKeysWithValues)
        .map(([k, v]) => `"${k}" (Example: "${v}")`)
        .join(", ");

    const prompt = `I have a list of product specification keys with example values. Group synonymous or very closely related keys into a single canonical name.
    
    Keys to group (with context): ${entriesString}
    
    Rules:
    - Return a JSON object mapping each INPUT KEY to its canonical name.
    - Use the example values to distinguish between different types of specs (e.g. "Color" vs "Panel Type").
    - IGNORE technical suffixes or modifiers like "(HBM)", "(Typ)", "Peak", "Maximum" when grouping.
    - Example: {"Brightness (HBM)": "Brightness", "Peak": "Brightness", "RAM": "Memory", "System RAM": "Memory", "Panel": "Display Type"}
    - Standardize common names: "Display", "Processor", "Storage", "Memory", "Connectivity", "Battery", "Camera", "Physical Design", etc.
    
    Respond ONLY with the JSON object.`;

    try {
        const llmResponse = await callLLM(prompt, "qwen2.5:3b", 15000);
        const llmMapping = JSON.parse(llmResponse);

        if (typeof llmMapping === 'object' && llmMapping !== null) {
            for (const [raw, canonical] of Object.entries(llmMapping)) {
                if (!raw || !canonical || typeof canonical !== 'string') continue;

                // Use strict normalization (strip symbols) to match frontend CompareTable logic
                const normalizedRaw = raw.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
                const normalizedCanonical = canonical.toLowerCase().trim();

                mapping[normalizedRaw] = normalizedCanonical;

                // Cache the result using the same strict normalization
                await setCache(`${CACHE_KEY_PREFIX}${normalizedRaw}`, normalizedCanonical, CACHE_TTL);
            }
        }
    } catch (error) {
        console.error("Failed to fetch smart mapping from LLM:", error);
    } finally {
        // 3. Fallback: ensure EVERY input key has a mapping, even if LLM failed or skipped it
        for (const key of rawKeys) {
            const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
            if (!mapping[normalized]) {
                mapping[normalized] = normalized;
            }
        }
    }

    return mapping;
}
