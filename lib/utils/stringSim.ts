
/**
 * optimized Levenshtein distance for short strings
 */
export function levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Find best matches from a list of candidates using Levenshtein distance
 * @param query - The search term (e.g. "sansang")
 * @param candidates - List of valid strings (e.g. ["Samsung", "Sony", ...])
 * @param threshold - Max allowed distance (default 3)
 */
export function findFuzzyMatches(
    query: string,
    candidates: string[],
    threshold: number = 2
): Array<{ value: string; distance: number; score: number }> {
    const queryLower = query.toLowerCase();

    // Safety check for very short queries
    if (query.length < 3) return [];

    const matches = candidates.map((candidate) => {
        const candidateLower = candidate.toLowerCase();

        // Exact substring match (high priority)
        if (candidateLower.includes(queryLower) || queryLower.includes(candidateLower)) {
            // If significant overlap
            if (Math.abs(candidate.length - query.length) < 3) {
                return { value: candidate, distance: 0, score: 0.9 };
            }
        }

        const distance = levenshteinDistance(queryLower, candidateLower);
        // Score = 1 - (distance / maxLen)
        const maxLen = Math.max(query.length, candidate.length);
        const score = 1 - (distance / maxLen);

        return { value: candidate, distance, score };
    });

    return matches
        .filter((m) => m.distance <= threshold && m.score > 0.6) // Filter bad matches
        .sort((a, b) => b.score - a.score); // Sort by best score
}
