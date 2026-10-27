/**
 * Grievance triage graph — the separate small LangGraph workflow from spec
 * 5.4 ("Grievance triage: classify, translate, de-duplicate, link to a line
 * item") and section 8.2. Fully LLM-assisted when a key is configured, with a
 * deterministic fallback so citizen intake never blocks on model availability.
 *
 * Output is a structured triage record; hashing/timestamping it to
 * GrievanceRegistry (starting the 48-hour response clock) stays the caller's
 * deterministic job, same as the budget flow.
 */
import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { getChatModel, isLlmConfigured } from "./llm";
import { searchReliefNorms } from "@/lib/db/vector-store";

export const GRIEVANCE_CATEGORIES = [
  "FUNDS_NOT_RECEIVED",
  "RELIEF_NOT_DELIVERED",
  "SPOILED_OR_SHORT_SUPPLIES",
  "WRONGFUL_EXCLUSION",
  "OFFICER_ABSENT_OR_NEGLIGENT",
  "BRIBE_DEMAND",
  "OTHER",
] as const;

export type GrievanceCategory = (typeof GRIEVANCE_CATEGORIES)[number];

const CATEGORY_KEYWORDS: Record<GrievanceCategory, string[]> = {
  FUNDS_NOT_RECEIVED: ["funds", "money", "payment", "ex-gratia", "reimbursement", "पैसा", "राशि", "रकम"],
  RELIEF_NOT_DELIVERED: ["food", "ration", "camp", "shelter", "tarpaulin", "blankets", "boat", "भोजन", "खाद्य"],
  SPOILED_OR_SHORT_SUPPLIES: ["spoiled", "rotten", "short", "quantity", "expired", "contaminated", "सड़ा", "कम"],
  WRONGFUL_EXCLUSION: ["excluded", "not listed", "missing name", "left out", "ineligible", "सूची"],
  OFFICER_ABSENT_OR_NEGLIGENT: ["absent", "no officer", "not present", "closed", "delay", "अनुपस्थित"],
  BRIBE_DEMAND: ["bribe", "demanded", "money for", "cut", "commission", "घूस", "रिश्वत"],
  OTHER: [],
};

/** Indic-script plus script-family detection, deterministic. */
export function detectLanguage(text: string): string {
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (/[\u0980-\u09FF]/.test(text)) return "bn";
  if (/[\u0A00-\u0A7F]/.test(text)) return "pa";
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  if (/[\u0C00-\u0C7F]/.test(text)) return "te";
  if (/[\u0A80-\u0AFF]/.test(text)) return "gu";
  return "en";
}

const TriageState = Annotation.Root({
  textOriginal: Annotation<string>,
  languageDetected: Annotation<string>,
  textTranslated: Annotation<string>,
  category: Annotation<GrievanceCategory>,
  urgency: Annotation<"LOW" | "MEDIUM" | "HIGH">,
  dedupeHash: Annotation<string>,
  duplicateOf: Annotation<string | null>,
  linkedNormCodes: Annotation<string[]>,
  linkedNormSummary: Annotation<string>,
  aiNote: Annotation<string>,
  steps: Annotation<string[]>({ reducer: (prev, next) => [...prev, ...next], default: () => [] }),
});

export type TriageStateType = typeof TriageState.State;

async function translateNode(state: typeof TriageState.State) {
  const language = detectLanguage(state.textOriginal);
  let translated = state.textOriginal;
  let note = "Original text preserved verbatim.";

  if (isLlmConfigured() && language !== "en") {
    try {
      const res = await getChatModel()!.invoke([
        ["system", "Translate the citizen grievance to English. Preserve every factual claim and place name. Reply with ONLY the English translation."],
        ["human", state.textOriginal],
      ]);
      translated = String(res.content).trim() || translated;
      note = "LLM translation; original text stored immutably alongside.";
    } catch {
      note += " Translation unavailable — passing original text to classifier.";
    }
  } else if (language !== "en") {
    note += " No translation without a model key — original text passed through.";
  }

  return { languageDetected: language, textTranslated: translated, steps: [`translate:detected=${language}`] };
}

const CATEGORY_INSTRUCTION = `Classify the grievance into exactly one category: ${GRIEVANCE_CATEGORIES.join(", ")}. Judge urgency HIGH for bribe demands, medical emergencies or relief not delivered while people are stranded; MEDIUM for funds not received or wrongful exclusion; LOW otherwise.`;

function heuristicClassify(translated: string): { category: GrievanceCategory; urgency: "LOW" | "MEDIUM" | "HIGH" } {
  const text = translated.toLowerCase();
  // Safety-critical categories get priority so a single strong keyword beats
  // incidental context words ("bribe ... at relief camp" is a BRIBE_DEMAND).
  const priority: Partial<Record<GrievanceCategory, number>> = {
    BRIBE_DEMAND: 3,
    WRONGFUL_EXCLUSION: 1,
    SPOILED_OR_SHORT_SUPPLIES: 1,
    OFFICER_ABSENT_OR_NEGLIGENT: 1,
  };
  const scores = new Map<GrievanceCategory, number>();
  for (const [category, words] of Object.entries(CATEGORY_KEYWORDS) as [GrievanceCategory, string[]][]) {
    const hits = words.reduce((acc, w) => acc + (text.includes(w) ? 1 : 0), 0);
    scores.set(category, hits * (1 + (priority[category] ?? 0)));
  }
  const best = [...scores.entries()].sort((a, b) => b[1] - a[1])[0];
  const category = best && best[1] > 0 ? best[0] : "OTHER";
  const urgency: "LOW" | "MEDIUM" | "HIGH" =
    category === "BRIBE_DEMAND" || category === "RELIEF_NOT_DELIVERED"
      ? "HIGH"
      : category === "FUNDS_NOT_RECEIVED" || category === "SPOILED_OR_SHORT_SUPPLIES"
        ? "MEDIUM"
        : "LOW";
  return { category, urgency };
}

async function classifyNode(state: typeof TriageState.State) {
  if (isLlmConfigured()) {
    try {
      const res = await getChatModel()!.invoke([
        ["system", CATEGORY_INSTRUCTION + ' Reply ONLY as JSON: {"category": string, "urgency": "LOW"|"MEDIUM"|"HIGH"}'],
        ["human", state.textTranslated],
      ]);
      const parsed = extractTriageJson(String(res.content));
      if (parsed) return { ...parsed, steps: [`classify:llm=${parsed.category}`] };
    } catch {
      // fall through
    }
  }
  const { category, urgency } = heuristicClassify(state.textTranslated);
  return { category, urgency, steps: [`classify:keyword=${category}`] };
}

function extractTriageJson(text: string): { category: GrievanceCategory; urgency: "LOW" | "MEDIUM" | "HIGH" } | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as { category?: string; urgency?: string };
    const category = GRIEVANCE_CATEGORIES.find((c) => c === parsed.category?.toUpperCase());
    if (!category) return null;
    const urgency = (["LOW", "MEDIUM", "HIGH"] as const).find((u) => u === parsed.urgency?.toUpperCase());
    return { category, urgency: urgency ?? "MEDIUM" };
  } catch {
    return null;
  }
}

/** Near-duplicate detection over normalised text (cheap SimHash-style). */
function normalise(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\u0900-\u097F\s]/g, "").replace(/\s+/g, " ").trim();
}

// Recent-report shingle index: in production this lives in Postgres + pgvector
// (the same document_chunks pattern used by the norms store).
const RECENT_TEXT_LENGTHS: string[] =
  (globalThis as unknown as { __rahatGrievanceShingles?: string[] }).__rahatGrievanceShingles ?? [];

export async function dedupeNode(state: typeof TriageState.State): Promise<Partial<TriageStateType>> {
  const shingle = normalise(state.textTranslated).split(" ").filter((w) => w.length > 3).slice(0, 24).join(" ");

  const queryVec = await import("@/lib/db/vector-store").then((m) => m.getEmbeddingsProvider().embedQuery(shingle));
  let duplicateOf: string | null = null;
  for (let i = 0; i < RECENT_TEXT_LENGTHS.length; i += 1) {
    const otherVec = await import("@/lib/db/vector-store").then((m) =>
      m.getEmbeddingsProvider().embedQuery(RECENT_TEXT_LENGTHS[i])
    );
    const dot = queryVec.reduce((acc, v, idx) => acc + v * otherVec[idx], 0);
    if (dot > 0.92) {
      duplicateOf = `recent-report-${i}`;
      break;
    }
  }
  RECENT_TEXT_LENGTHS.push(shingle);
  (globalThis as { __rahatGrievanceShingles?: string[] }).__rahatGrievanceShingles = RECENT_TEXT_LENGTHS.slice(-200);

  const dedupeHash = shingle.length ? `hash:${Buffer.from(shingle).toString("base64url").slice(0, 40)}` : "hash:empty";
  return {
    dedupeHash,
    duplicateOf,
    steps: [`dedupe:${duplicateOf ?? "unique"} similarity>0.92`],
  };
}

async function linkLineItemNode(state: typeof TriageState.State) {
  const results = await searchReliefNorms(state.textTranslated, { topK: 3, minScore: 0.25 });
  return {
    linkedNormCodes: results.map((r) => r.normCode),
    linkedNormSummary: results.length
      ? results.map((r) => `${r.normCode} — ${r.title} (${r.department})`).join("; ")
      : "No confident line-item match; routes to manual review.",
    steps: [`link:${results.length} norm matches`],
  };
}

function buildTriageGraph() {
  return new StateGraph(TriageState)
    .addNode("translate", translateNode)
    .addNode("classify", classifyNode)
    .addNode("dedupe", dedupeNode)
    .addNode("link_line_item", linkLineItemNode)
    .addEdge(START, "translate")
    .addEdge("translate", "classify")
    .addEdge("classify", "dedupe")
    .addEdge("dedupe", "link_line_item")
    .addEdge("link_line_item", END)
    .compile();
}

const globalForTriage = globalThis as unknown as { rahatTriageGraph?: ReturnType<typeof buildTriageGraph> };

export function getTriageGraph() {
  if (!globalForTriage.rahatTriageGraph) {
    globalForTriage.rahatTriageGraph = buildTriageGraph();
  }
  return globalForTriage.rahatTriageGraph;
}

export interface TriageRequest {
  text: string;
  sourceLabel?: string;
}

export async function runTriage(request: TriageRequest) {
  const graph = getTriageGraph();
  const result = await graph.invoke({ textOriginal: request.text });
  const { createHash } = await import("crypto");
  const grievanceHash = `0x${createHash("sha256")
    .update(`${result.textOriginal}:${result.category}:${result.dedupeHash}`)
    .digest("hex")}`;

  return {
    ...result,
    grievanceHash, // this is what GrievanceRegistry anchors — never the raw text
    responseClockStartsOnAnchor: true,
    slaHours: 48,
    correlatedActions: [
      result.duplicateOf ? "Mark duplicate of an existing report" : "Anchor hash + start 48-hour clock",
      result.category === "BRIBE_DEMAND"
        ? "Auto-escalate to Anti-Corruption Bureau copy"
        : "Route to responsible department officer",
    ],
  };
}
