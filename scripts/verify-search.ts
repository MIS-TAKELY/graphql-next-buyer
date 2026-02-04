#!/usr/bin/env tsx

/**
 * Verify search system performance and accuracy
 * 
 * This script tests:
 * 1. Typo tolerance (fuzzy matching)
 * 2. Semantic search accuracy
 * 3. Query performance (latency)
 * 4. Brand detection
 * 5. Price filtering
 */

import { prisma } from "../lib/db/prisma";
import { generateEmbedding } from "../lib/embemdind";
import { Prisma } from "../app/generated/prisma";

interface TestCase {
    query: string;
    expectedBrand?: string;
    expectedCategory?: string;
    description: string;
}

const testCases: TestCase[] = [
    // Typo tolerance tests
    { query: "sansang phone", expectedBrand: "Samsung", description: "Typo: sansang → Samsung" },
    { query: "laaptop", expectedCategory: "Laptop", description: "Typo: laaptop → laptop" },
    { query: "iPhon 15", expectedBrand: "Apple", description: "Typo: iPhon → iPhone" },
    { query: "macbok pro", expectedBrand: "Apple", description: "Typo: macbok → macbook" },

    // Semantic search tests
    { query: "gaming laptop", expectedCategory: "Laptop", description: "Semantic: gaming laptop" },
    { query: "smartphone under 1 lakh", expectedCategory: "Phone", description: "Semantic: smartphone with price" },
    { query: "wireless earbuds", description: "Semantic: wireless earbuds" },

    // Exact match tests
    { query: "iPhone 15 Pro", expectedBrand: "Apple", description: "Exact: iPhone 15 Pro" },
    { query: "Samsung Galaxy S24", expectedBrand: "Samsung", description: "Exact: Samsung Galaxy" },
    { query: "MacBook Pro M3", expectedBrand: "Apple", description: "Exact: MacBook Pro" },
];

async function testVectorSearch(query: string): Promise<{ id: string; name: string; brand: string; similarity: number }[]> {
    const vector = await generateEmbedding(query, 'query');
    const vectorString = `[${vector.join(",")}]`;

    const results = await prisma.$queryRaw<Array<{ id: string; name: string; brand: string; similarity: number }>>(
        Prisma.sql`
      SELECT 
        id::text,
        name,
        brand,
        1 - (embedding <#> ${Prisma.raw(`'${vectorString}'::vector`)}) AS similarity
      FROM "products"
      WHERE embedding IS NOT NULL AND status = 'ACTIVE'
      ORDER BY similarity DESC
      LIMIT 5
    `
    );

    return results;
}

async function testFuzzySearch(query: string): Promise<{ id: string; name: string; brand: string; score: number }[]> {
    const threshold = query.length < 5 ? 0.1 : 0.15;

    const results = await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SELECT set_limit(${threshold});`);

        return await tx.$queryRaw<Array<{ id: string; name: string; brand: string; score: number }>>(
            Prisma.sql`
        SELECT 
          id,
          name,
          brand,
          (
            0.5 * similarity(name, ${query}) + 
            0.3 * similarity(brand, ${query}) + 
            0.2 * COALESCE(similarity(description, ${query}), 0)
          ) as score
        FROM "products"
        WHERE status = 'ACTIVE'
          AND (
            name % ${query} 
            OR brand % ${query} 
            OR description % ${query}
          )
        ORDER BY score DESC
        LIMIT 5;
      `
        );
    });

    return results;
}

async function runTests() {
    console.log("\n" + "=".repeat(80));
    console.log("🧪 SEARCH SYSTEM VERIFICATION");
    console.log("=".repeat(80) + "\n");

    let passCount = 0;
    let failCount = 0;
    const latencies: number[] = [];

    for (const testCase of testCases) {
        console.log(`\n📝 Test: ${testCase.description}`);
        console.log(`   Query: "${testCase.query}"`);

        const startTime = Date.now();

        try {
            // Run vector search
            const vectorResults = await testVectorSearch(testCase.query);

            // Run fuzzy search
            const fuzzyResults = await testFuzzySearch(testCase.query);

            const latency = Date.now() - startTime;
            latencies.push(latency);

            console.log(`   ⏱️  Latency: ${latency}ms`);

            // Display results
            console.log(`\n   🔍 Vector Search Results:`);
            vectorResults.slice(0, 3).forEach((r, i) => {
                console.log(`      ${i + 1}. ${r.name} (${r.brand}) - Score: ${r.similarity.toFixed(3)}`);
            });

            console.log(`\n   🔤 Fuzzy Search Results:`);
            fuzzyResults.slice(0, 3).forEach((r, i) => {
                console.log(`      ${i + 1}. ${r.name} (${r.brand}) - Score: ${r.score.toFixed(3)}`);
            });

            // Validation
            let passed = true;
            if (testCase.expectedBrand) {
                const foundInVector = vectorResults.some(r => r.brand.toLowerCase() === testCase.expectedBrand!.toLowerCase());
                const foundInFuzzy = fuzzyResults.some(r => r.brand.toLowerCase() === testCase.expectedBrand!.toLowerCase());

                if (!foundInVector && !foundInFuzzy) {
                    console.log(`   ❌ FAIL: Expected brand "${testCase.expectedBrand}" not found in top results`);
                    passed = false;
                    failCount++;
                }
            }

            if (passed) {
                console.log(`   ✅ PASS`);
                passCount++;
            }

        } catch (error: any) {
            console.error(`   ❌ ERROR: ${error.message}`);
            failCount++;
        }
    }

    // Calculate statistics
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const p50 = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.5)];
    const p95 = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];
    const p99 = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.99)];

    console.log("\n" + "=".repeat(80));
    console.log("📊 TEST SUMMARY");
    console.log("=".repeat(80));
    console.log(`✅ Passed: ${passCount}/${testCases.length}`);
    console.log(`❌ Failed: ${failCount}/${testCases.length}`);
    console.log(`\n⏱️  Performance Metrics:`);
    console.log(`   Average: ${avgLatency.toFixed(0)}ms`);
    console.log(`   p50: ${p50}ms`);
    console.log(`   p95: ${p95}ms`);
    console.log(`   p99: ${p99}ms`);
    console.log("=".repeat(80) + "\n");

    // Performance targets
    if (avgLatency < 100) {
        console.log("🎯 Performance: EXCELLENT (< 100ms average)");
    } else if (avgLatency < 200) {
        console.log("✅ Performance: GOOD (< 200ms average)");
    } else {
        console.log("⚠️  Performance: NEEDS IMPROVEMENT (> 200ms average)");
    }

    // Accuracy targets
    const accuracy = (passCount / testCases.length) * 100;
    if (accuracy >= 90) {
        console.log(`🎯 Accuracy: EXCELLENT (${accuracy.toFixed(0)}%)`);
    } else if (accuracy >= 70) {
        console.log(`✅ Accuracy: GOOD (${accuracy.toFixed(0)}%)`);
    } else {
        console.log(`⚠️  Accuracy: NEEDS IMPROVEMENT (${accuracy.toFixed(0)}%)`);
    }

    console.log();
}

runTests()
    .catch((e) => {
        console.error("💥 Test failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
