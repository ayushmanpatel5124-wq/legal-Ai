export type Hit = {
  kind: "law" | "document";
  refId: number;
  title: string;
  citation: string;
  sourceType: string;
  domain: string;
  excerpt: string;
  score: number;
  relevance: number;
};

export type Answer = {
  plain: string;
  legal: string;
  steps: string[];
  caveats: string[];
  confidence: number;
  hits: Hit[];
};

export type VerificationStatus =
  | "VERIFIED"
  | "PARTIALLY_VERIFIED"
  | "CONTRADICTED"
  | "INSUFFICIENT_EVIDENCE";

export type VerifyResponse = {
  id: number;
  claim: string;
  status: VerificationStatus;
  confidence: number;
  coverage: number;
  explanation: string;
  supporting: Hit[];
  contradicting: Hit[];
  hits: Hit[];
};

export type Clause = { text: string; risk: "low" | "medium" | "high"; note: string };
export type Issue = { title: string; description: string; severity: "low" | "medium" | "high" };

export type DocAnalysis = {
  summary: string;
  clauses: Clause[];
  issues: Issue[];
  terms: { word: string; count: number }[];
  questions: string[];
  relatedLaws: { title: string; citation: string }[];
  readingTimeMinutes: number;
  wordCount: number;
};

export type DocumentRecord = {
  id: number;
  name: string;
  pages: number | null;
  sizeBytes: number | null;
  charCount: number;
  createdAt: string;
};

export type ActivityItem = {
  id: number;
  type: "chat" | "verify" | "document" | "research" | string;
  title: string;
  summary: string;
  refId: number | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
};

export type ConversationSummary = {
  id: number;
  title: string;
  updated_at: string;
  message_count: number;
};

export type ChatTurn = {
  question: string;
  answer: Answer;
};

export type View =
  | "home"
  | "dashboard"
  | "chat"
  | "verify"
  | "documents"
  | "research"
  | "how"
  | "trust"
  | "history";

export function statusClass(status?: string) {
  switch (status) {
    case "VERIFIED":
      return "verified";
    case "PARTIALLY_VERIFIED":
      return "partial";
    case "CONTRADICTED":
      return "contradicted";
    default:
      return "insufficient";
  }
}

export function formatDate(iso: string | Date) {
  try {
    return new Date(iso).toLocaleString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}
