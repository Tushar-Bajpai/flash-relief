/**
 * LLM provider for the Rahat graph.
 *
 * The graph is designed to run WITHOUT a model key: every node that would use
 * the LLM has a deterministic fallback so demos and tests never block. When
 * OPENAI_API_KEY (or any chat provider key) is present, the real model takes
 * over for explanation, free-text parsing and grievance translation.
 */
import { ChatOpenAI } from "@langchain/openai";

export function isLlmConfigured(): boolean {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(key && key.startsWith("sk-"));
}

const MODEL_NAME = process.env.RAHAT_LLM_MODEL || "gpt-4o-mini";

export function getChatModel(options: { temperature?: number } = {}): ChatOpenAI | null {
  if (!isLlmConfigured()) return null;
  return new ChatOpenAI({
    model: MODEL_NAME,
    temperature: options.temperature ?? 0.2,
    timeout: 30_000,
    maxRetries: 2,
  });
}

/** Parse the first JSON object inside an LLM reply. */
export function extractJson<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
