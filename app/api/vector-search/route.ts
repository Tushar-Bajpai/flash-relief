import { NextRequest, NextResponse } from "next/server";
import { searchReliefNorms, seedVectorStore } from "@/lib/db/vector-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, topK = 4, minScore = 0.25, category, department } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Query string is required for vector semantic search." },
        { status: 400 }
      );
    }

    const results = await searchReliefNorms(query.trim(), {
      topK: Math.min(10, Math.max(1, Number(topK) || 4)),
      minScore: Number(minScore) || 0.25,
      category,
      department,
    });

    return NextResponse.json({
      success: true,
      query: query.trim(),
      totalMatches: results.length,
      matches: results,
      searchEngine: "LangChain pgvector (Cosine Similarity)",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[VectorSearch API] Error:", err);
    return NextResponse.json(
      { error: "Internal vector search failure", message: err.message },
      { status: 500 }
    );
  }
}

// Optional trigger to index/re-seed the vector database
export async function PUT() {
  const result = await seedVectorStore();
  return NextResponse.json(result);
}
