import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { SDRF_LEGAL_NORMS, SdrfNormDocument } from "@/lib/data/sdrf-corpus";
import { prisma, isDbConfigured } from "./prisma";

export interface VectorSearchResult {
  id: string;
  normCode: string;
  category: string;
  title: string;
  statutoryReference: string;
  department: string;
  rateDescription: string;
  unitRateRupees: number;
  score: number;
  snippet: string;
}

/**
 * Deterministic hash-based 1536-dimensional mock embedding generator
 * used as a resilient fallback when OPENAI_API_KEY is not configured.
 */
function createDeterministicEmbedding(text: string, dimensions = 1536): number[] {
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const words = clean.split(/\s+/).filter(Boolean);
  const vector = new Array(dimensions).fill(0);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash << 5) - hash + word.charCodeAt(c);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    vector[idx] += 1.0 / (i + 1);
  }

  // Normalize vector to unit length
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

/**
 * Computes cosine similarity between two unit vectors
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return Math.max(0, Math.min(1, dotProduct));
}

/**
 * LangChain Embeddings provider with automatic fallback
 */
export function getEmbeddingsProvider() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && apiKey.startsWith("sk-")) {
    return new OpenAIEmbeddings({
      openAIApiKey: apiKey,
      modelName: "text-embedding-3-small",
    });
  }

  // Deterministic local embeddings adapter implementing EmbeddingsInterface
  return {
    async embedDocuments(documents: string[]): Promise<number[][]> {
      return documents.map((doc) => createDeterministicEmbedding(doc));
    },
    async embedQuery(document: string): Promise<number[]> {
      return createDeterministicEmbedding(document);
    },
  };
}

/**
 * Search the MHA SDRF relief norms using vector similarity search
 */
export async function searchReliefNorms(
  query: string,
  options: {
    topK?: number;
    minScore?: number;
    category?: string;
    department?: string;
  } = {}
): Promise<VectorSearchResult[]> {
  const { topK = 4, minScore = 0.35, category, department } = options;
  const embeddings = getEmbeddingsProvider();

  // Try live database search if Neon DB is configured
  if (isDbConfigured()) {
    try {
      const queryVec = await embeddings.embedQuery(query);
      const vectorStr = `[${queryVec.join(",")}]`;

      // pgvector cosine similarity search query via Prisma $queryRaw
      const results = await prisma.$queryRaw<
        Array<{
          id: string;
          content: string;
          metadata: any;
          similarity: number;
        }>
      >`
        SELECT 
          id, 
          content, 
          metadata, 
          1 - (embedding <=> ${vectorStr}::vector) AS similarity
        FROM document_chunks
        WHERE 1 - (embedding <=> ${vectorStr}::vector) >= ${minScore}
        ORDER BY similarity DESC
        LIMIT ${topK};
      `;

      if (results && results.length > 0) {
        return results.map((r) => {
          const meta = typeof r.metadata === "string" ? JSON.parse(r.metadata) : r.metadata || {};
          return {
            id: r.id,
            normCode: meta.normCode || "SDRF-GENERIC",
            category: meta.category || "General Relief",
            title: meta.title || "Disaster Assistance Clause",
            statutoryReference: meta.statutoryReference || "MHA SDRF 2021-2026",
            department: meta.department || "Disaster Management",
            rateDescription: meta.rateDescription || "",
            unitRateRupees: meta.unitRateRupees || 0,
            score: Math.round(r.similarity * 100) / 100,
            snippet: r.content,
          };
        });
      }
    } catch (err) {
      console.warn("[VectorStore] Live pgvector query skipped, using local semantic fallback:", err);
    }
  }

  // High-fidelity in-memory semantic fallback over SDRF_LEGAL_NORMS
  const queryVec = await embeddings.embedQuery(query);

  const scoredNorms = await Promise.all(
    SDRF_LEGAL_NORMS.map(async (norm) => {
      // Filter by category or department if specified
      if (category && norm.category.toLowerCase() !== category.toLowerCase()) {
        return null;
      }
      if (department && !norm.department.toLowerCase().includes(department.toLowerCase())) {
        return null;
      }

      const fullDocText = `${norm.normCode} ${norm.title} ${norm.category} ${norm.rateDescription} ${norm.content} ${norm.disbursalTrigger} ${norm.verificationEvidence}`;
      const docVec = await embeddings.embedQuery(fullDocText);
      const sim = cosineSimilarity(queryVec, docVec);

      // Boost for direct keyword matches in query
      const queryWords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      let boost = 0;
      for (const w of queryWords) {
        if (fullDocText.toLowerCase().includes(w)) {
          boost += 0.12;
        }
      }

      const finalScore = Math.min(0.99, Math.round((sim + boost) * 100) / 100);

      return {
        id: norm.id,
        normCode: norm.normCode,
        category: norm.category,
        title: norm.title,
        statutoryReference: norm.statutoryReference,
        department: norm.department,
        rateDescription: norm.rateDescription,
        unitRateRupees: norm.unitRateRupees,
        score: finalScore,
        snippet: norm.content,
      };
    })
  );

  return scoredNorms
    .filter((n): n is VectorSearchResult => n !== null && n.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Ingest the MHA SDRF legal corpus into the Neon pgvector document_chunks table
 */
export async function seedVectorStore(): Promise<{
  success: boolean;
  insertedCount: number;
  message: string;
}> {
  if (!isDbConfigured()) {
    return {
      success: false,
      insertedCount: 0,
      message: "Neon DATABASE_URL is not configured. Fallback semantic search is active.",
    };
  }

  try {
    const embeddings = getEmbeddingsProvider();
    let count = 0;

    for (const norm of SDRF_LEGAL_NORMS) {
      const fullDocText = `${norm.normCode}: ${norm.title}\nCategory: ${norm.category}\nRate: ${norm.rateDescription}\nStatute: ${norm.statutoryReference}\nTrigger: ${norm.disbursalTrigger}\nEvidence: ${norm.verificationEvidence}\nDetails: ${norm.content}`;
      const vec = await embeddings.embedQuery(fullDocText);
      const vecString = `[${vec.join(",")}]`;

      await prisma.$executeRaw`
        INSERT INTO document_chunks (id, content, metadata, embedding, "createdAt", "updatedAt")
        VALUES (
          ${norm.id},
          ${fullDocText},
          ${JSON.stringify({
            normCode: norm.normCode,
            category: norm.category,
            title: norm.title,
            statutoryReference: norm.statutoryReference,
            department: norm.department,
            rateDescription: norm.rateDescription,
            unitRateRupees: norm.unitRateRupees,
          })}::jsonb,
          ${vecString}::vector,
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          content = EXCLUDED.content,
          metadata = EXCLUDED.metadata,
          embedding = EXCLUDED.embedding,
          "updatedAt" = NOW();
      `;
      count++;
    }

    return {
      success: true,
      insertedCount: count,
      message: `Successfully indexed ${count} MHA SDRF legal norms into Neon pgvector.`,
    };
  } catch (err: any) {
    return {
      success: false,
      insertedCount: 0,
      message: `Failed to index into pgvector: ${err.message}`,
    };
  }
}
