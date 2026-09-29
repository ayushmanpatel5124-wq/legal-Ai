import { db } from "@/db";
import { legalSources } from "@/db/schema";
import { sql } from "drizzle-orm";
import { CORPUS } from "./corpus";

/* ------------------------------------------------------------------ */
/* Text utilities                                                      */
/* ------------------------------------------------------------------ */

const STOPWORDS = new Set([
  "the","and","for","are","was","not","but","you","has","its","his","her","who",
  "may","can","could","should","would","about","between","after","before","these",
  "those","within","without","this","that","with","from","have","will","shall",
  "which","there","their","where","what","when","been","were","your","they","them",
  "then","than","into","also","such","only","each","under","over","more","some",
  "other","here","herein","being","upon","said","any","all","does","did","how",
  "why","are","legal","law","laws","case","please","tell","know","need","want",
]);

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter(
    (t) => t.length > 2 && !STOPWORDS.has(t),
  );
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

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

/* ------------------------------------------------------------------ */
/* Corpus seeding (idempotent)                                         */
/* ------------------------------------------------------------------ */

let seedPromise: Promise<void> | null = null;

export async function ensureCorpus(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const rows = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(legalSources);
      const count = rows[0]?.count ?? 0;
      if (count >= CORPUS.length) return;
      await db
        .insert(legalSources)
        .values(
          CORPUS.map((c) => ({
            slug: c.slug,
            title: c.title,
            citation: c.citation,
            sourceType: c.sourceType,
            domain: c.domain,
            summary: c.summary,
            body: c.body,
            keywords: c.keywords,
            authorityScore: c.authorityScore,
          })),
        )
        .onConflictDoNothing({ target: legalSources.slug });
    })().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}

/* ------------------------------------------------------------------ */
/* Retrieval                                                           */
/* ------------------------------------------------------------------ */

type SourceRow = {
  id: number;
  title: string;
  citation: string;
  source_type: string;
  domain: string;
  summary: string;
  body: string;
  keywords: string[] | null;
  authority_score: number;
};

type ChunkRow = {
  id: number;
  document_id: number;
  page: number | null;
  content: string;
  name: string;
};

function bestPassage(text: string, terms: string[], maxLen = 420): string {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 25);
  if (!sentences.length) return text.slice(0, maxLen);

  const scored = sentences.map((s) => {
    const lower = s.toLowerCase();
    let score = 0;
    for (const t of terms) if (lower.includes(t)) score += 1;
    return { s, score };
  });
  scored.sort((a, b) => b.score - a.score);
  let out = "";
  for (const item of scored) {
    if (item.score === 0 && out) break;
    if (out.length + item.s.length > maxLen) break;
    out += (out ? " " : "") + item.s;
  }
  return out || sentences[0].slice(0, maxLen);
}

export async function retrieve(
  query: string,
  opts: { topK?: number; domain?: string; sourceType?: string } = {},
): Promise<Hit[]> {
  const topK = opts.topK ?? 6;
  const terms = unique(tokenize(query));
  const lowerQuery = query.toLowerCase();
  if (!terms.length) return [];

  await ensureCorpus();

  const sourceRows = (
    await db.execute<SourceRow>(
      sql`select id, title, citation, source_type, domain, summary, body, keywords, authority_score
          from legal_sources`,
    )
  ).rows;

  const hits: Hit[] = [];

  for (const row of sourceRows) {
    if (opts.domain && row.domain !== opts.domain) continue;
    if (opts.sourceType && row.source_type !== opts.sourceType) continue;

    const haystack = `${row.title} ${row.summary} ${row.body} ${row.citation}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      const occurrences = haystack.split(term).length - 1;
      if (occurrences > 0) score += 1 + Math.min(occurrences, 5) * 0.25;
    }
    for (const key of row.keywords ?? []) {
      const k = key.toLowerCase();
      if (lowerQuery.includes(k)) score += k.includes(" ") ? 3 : 1.8;
    }
    if (score <= 0) continue;
    score *= 0.7 + (row.authority_score ?? 0.8) * 0.4;

    hits.push({
      kind: "law",
      refId: row.id,
      title: row.title,
      citation: row.citation,
      sourceType: row.source_type,
      domain: row.domain,
      excerpt: bestPassage(`${row.summary} ${row.body}`, terms),
      score,
      relevance: 0,
    });
  }

  // Uploaded document chunks via Postgres full-text search (OR query).
  const tsQuery = terms
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter(Boolean)
    .join(" | ");

  if (tsQuery && !opts.sourceType) {
    try {
      const chunkRows = (
        await db.execute<ChunkRow>(sql`
          select c.id, c.document_id, c.page, c.content, d.name,
                 ts_rank(to_tsvector('english', c.content), to_tsquery('english', ${tsQuery})) as rank
          from document_chunks c
          join documents d on d.id = c.document_id
          where to_tsvector('english', c.content) @@ to_tsquery('english', ${tsQuery})
          order by rank desc
          limit 6
        `)
      ).rows;

      for (const row of chunkRows) {
        const lower = row.content.toLowerCase();
        let score = 1.5;
        for (const term of terms) if (lower.includes(term)) score += 1.2;
        hits.push({
          kind: "document",
          refId: row.document_id,
          title: row.name + (row.page ? ` — page ${row.page}` : ""),
          citation: "Uploaded document",
          sourceType: "document",
          domain: "Uploaded",
          excerpt: bestPassage(row.content, terms, 480),
          score,
          relevance: 0,
        });
      }
    } catch {
      // full-text search is best-effort
    }
  }

  hits.sort((a, b) => b.score - a.score);
  const top = hits.slice(0, topK);
  const max = top[0]?.score ?? 1;
  return top.map((h) => ({
    ...h,
    relevance: Math.max(0.3, Math.min(0.99, h.score / (max * 1.05))),
  }));
}

/* ------------------------------------------------------------------ */
/* Answer synthesis                                                    */
/* ------------------------------------------------------------------ */

export type Answer = {
  plain: string;
  legal: string;
  steps: string[];
  caveats: string[];
  confidence: number;
  hits: Hit[];
};

export function composeAnswer(question: string, hits: Hit[]): Answer {
  if (!hits.length) {
    return {
      plain:
        "I could not find a sufficiently relevant passage in the legal corpus or in your uploaded documents for this question.",
      legal:
        "No retrieved source crossed the relevance threshold, so no grounded legal reasoning can be offered. Add more facts (jurisdiction, dates, relationship between the parties), name a statute or provision, or upload the relevant document so it can be indexed and retrieved.",
      steps: [
        "Rephrase the question with the specific statute, section or document involved.",
        "Upload the contract, notice or order you are asking about.",
        "Consult a qualified legal professional for advice on your facts.",
      ],
      caveats: [
        "This response is not legal advice.",
        "Zero sources were retrieved, so confidence is low by design.",
      ],
      confidence: 0.25,
      hits: [],
    };
  }

  const primary = hits[0];
  const laws = hits.filter((h) => h.kind === "law");
  const docs = hits.filter((h) => h.kind === "document");

  const plain =
    primary.kind === "document"
      ? `Based on the passage retrieved from ${primary.title}: ${primary.excerpt}`
      : `${primary.excerpt}`;

  const legalParts: string[] = [];
  for (const h of laws.slice(0, 3)) {
    legalParts.push(`${h.citation} — ${h.excerpt}`);
  }
  if (docs.length) {
    legalParts.push(
      `Your uploaded material: ${docs
        .slice(0, 2)
        .map((d) => `${d.title}: ${d.excerpt}`)
        .join(" ")}`,
    );
  }

  const steps = [
    "Confirm the jurisdiction and the exact dates involved, since limitation and procedure depend on both.",
    laws.length
      ? `Read the primary source in full: ${laws[0].citation}.`
      : "Locate the primary statutory source for this issue.",
    "Collect the documents that evidence the facts (agreements, notices, receipts, correspondence).",
    "Check whether a pre-litigation notice, complaint or statutory application is required before approaching a court or tribunal.",
    "Take the retrieved sources to a qualified legal professional before acting.",
  ];

  const caveats = [
    "This is an informational research response generated from a curated corpus, not legal advice.",
    "Statutory thresholds, limitation periods and jurisdictional limits change by notification — verify the current text.",
  ];
  if (docs.length)
    caveats.push(
      "Passages from your uploaded document are quoted as-is and have not been legally verified.",
    );

  const avgRelevance =
    hits.reduce((acc, h) => acc + h.relevance, 0) / hits.length;
  const confidence = Math.max(
    0.3,
    Math.min(0.93, 0.35 + avgRelevance * 0.4 + Math.min(hits.length, 4) * 0.055),
  );

  return {
    plain,
    legal: legalParts.join("\n\n"),
    steps,
    caveats,
    confidence,
    hits,
  };
}

/* ------------------------------------------------------------------ */
/* Claim verification                                                  */
/* ------------------------------------------------------------------ */

export type VerificationStatus =
  | "VERIFIED"
  | "PARTIALLY_VERIFIED"
  | "CONTRADICTED"
  | "INSUFFICIENT_EVIDENCE";

export type Verification = {
  status: VerificationStatus;
  confidence: number;
  coverage: number;
  explanation: string;
  supporting: Hit[];
  contradicting: Hit[];
};

const ABSOLUTE_WORDS = [
  "always",
  "never",
  "in every case",
  "under all circumstances",
  "cannot ever",
  "any time",
  "without any",
];

const NEGATION_MARKERS = [
  "cannot",
  "not permitted",
  "not entitled",
  "is not",
  "does not",
  "no person",
  "restrict",
  "prohibit",
  "mandatory",
  "must",
  "only",
  "required",
];

export function verifyClaim(claim: string, hits: Hit[]): Verification {
  const lower = claim.toLowerCase();
  const absolute = ABSOLUTE_WORDS.some((w) => lower.includes(w));
  const coverage = Math.min(1, hits.length / 4);

  const supporting: Hit[] = [];
  const contradicting: Hit[] = [];

  const claimTerms = unique(tokenize(claim));

  for (const hit of hits) {
    const text = hit.excerpt.toLowerCase();
    const overlap = claimTerms.filter((t) => text.includes(t)).length;
    if (!overlap) continue;
    const tension =
      absolute &&
      NEGATION_MARKERS.some((m) => text.includes(m)) &&
      overlap >= 2;
    if (tension) contradicting.push(hit);
    else supporting.push(hit);
  }

  let status: VerificationStatus = "INSUFFICIENT_EVIDENCE";
  let explanation =
    "The corpus does not contain enough specific material to test this claim. Add a statute, section number or more facts, or upload the relevant document.";

  if (!hits.length) {
    return {
      status,
      confidence: 0.25,
      coverage: 0,
      explanation,
      supporting,
      contradicting,
    };
  }

  if (contradicting.length) {
    status = "CONTRADICTED";
    explanation = `The claim is stated in absolute terms, but ${contradicting.length} retrieved source(s) impose conditions, exceptions or mandatory procedure that the claim does not account for. In particular, ${contradicting[0].citation} qualifies the position.`;
  } else if (absolute) {
    status = "PARTIALLY_VERIFIED";
    explanation =
      "The claim uses absolute wording. The retrieved sources support the general subject matter, but legal rules here depend on jurisdiction, contract terms and statutory exceptions, so the statement cannot be treated as universally true.";
  } else if (
    supporting.length >= 2 &&
    supporting[0].relevance > 0.8 &&
    supporting[0].kind === "law"
  ) {
    status = "VERIFIED";
    explanation = `The claim is consistent with the retrieved primary sources, principally ${supporting[0].citation}. The proposition is supported for the general case; the specific facts and current text of the provision should still be checked.`;
  } else if (supporting.length) {
    status = "PARTIALLY_VERIFIED";
    explanation = `Relevant material was retrieved (${supporting[0].citation}), but it does not establish the claim in full. The exact provision, jurisdiction and facts should be checked before treating the statement as settled.`;
  }

  const base =
    status === "VERIFIED"
      ? 0.82
      : status === "CONTRADICTED"
        ? 0.74
        : status === "PARTIALLY_VERIFIED"
          ? 0.6
          : 0.32;
  const confidence = Math.min(0.95, base + coverage * 0.1);

  return { status, confidence, coverage, explanation, supporting, contradicting };
}

/* ------------------------------------------------------------------ */
/* Document analysis                                                   */
/* ------------------------------------------------------------------ */

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

export function chunkText(
  text: string,
  size = 900,
): { content: string; page: number | null }[] {
  const chunks: { content: string; page: number | null }[] = [];
  const pageSplit = text.split(/\n?\[Page (\d+)\]\n?/);

  const segments: { content: string; page: number | null }[] = [];
  if (pageSplit.length > 1) {
    for (let i = 1; i < pageSplit.length; i += 2) {
      segments.push({
        page: Number(pageSplit[i]) || null,
        content: pageSplit[i + 1] ?? "",
      });
    }
  } else {
    segments.push({ page: null, content: text });
  }

  for (const seg of segments) {
    const words = seg.content.replace(/\s+/g, " ").trim();
    if (!words) continue;
    for (let i = 0; i < words.length; i += size) {
      const content = words.slice(i, i + size).trim();
      if (content.length > 40) chunks.push({ content, page: seg.page });
    }
  }
  return chunks.slice(0, 400);
}

export function topTerms(text: string, limit = 16) {
  const counts = new Map<string, number>();
  for (const w of tokenize(text)) {
    if (w.length < 5) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

const HIGH_RISK =
  /unlimited liability|sole discretion|irrevocabl|non-refundable|without notice|liquidated damages|entire liability|waive[sd]? all|perpetual|exclusive jurisdiction of/i;
const MEDIUM_RISK =
  /terminat|penalt|indemnif|liabilit|default|breach|waiv|confidential|arbitration|jurisdiction|notice period|governing law|renewal|lock-in/i;

export function analyzeDocument(text: string, hits: Hit[] = []): DocAnalysis {
  const clean = text.replace(/\[Page \d+\]/g, " ").replace(/\s+/g, " ").trim();
  const sentences = clean
    .split(/(?<=[.!?;])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 70);

  const clauses: Clause[] = sentences
    .map((s): Clause => {
      const risk: Clause["risk"] = HIGH_RISK.test(s)
        ? "high"
        : MEDIUM_RISK.test(s)
          ? "medium"
          : "low";
      return {
        text: s.slice(0, 700),
        risk,
        note:
          risk === "high"
            ? "Contains language that shifts risk heavily to one side and deserves careful legal review."
            : risk === "medium"
              ? "Contains a contractual or legal term worth reviewing before signing."
              : "Informationally significant passage.",
      };
    })
    .sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 } as const;
      return rank[a.risk] - rank[b.risk];
    })
    .slice(0, 8);

  const rules: [RegExp, string, string, Issue["severity"]][] = [
    [/without notice/i, "Action without notice", "The document contemplates action without notice. Check whether applicable law or the tenancy/employment framework requires a notice period.", "high"],
    [/sole discretion|absolute discretion/i, "Sole-discretion clause", "One party appears to receive broad unilateral discretion. Check scope, enforceability and any balancing obligations.", "medium"],
    [/unlimited liability|entire liability/i, "Liability allocation", "The text allocates broad or capped liability. Review the risk allocation against applicable law.", "high"],
    [/non-refundable/i, "Non-refundable payment", "A non-refundable payment term appears. Check statutory consumer protections and the forfeiture rules in ss. 73-74 of the Contract Act.", "medium"],
    [/indemnif/i, "Indemnity obligation", "An indemnity appears. Review its scope, exclusions, caps, and the events that trigger it.", "medium"],
    [/arbitration/i, "Arbitration clause", "An arbitration provision appears. Check seat, venue, rules, appointment mechanism and whether the dispute is arbitrable.", "low"],
    [/lock-?in|minimum term/i, "Lock-in period", "A lock-in or minimum term appears. Check the exit cost and whether it amounts to a penalty.", "medium"],
    [/governing law|jurisdiction of the courts/i, "Governing law and forum", "A governing-law or exclusive-forum clause appears. Confirm the chosen forum is practical for you.", "low"],
    [/auto-?renew|automatically renew/i, "Automatic renewal", "The agreement may renew automatically. Check the window for giving non-renewal notice.", "medium"],
    [/confidential/i, "Confidentiality obligation", "A confidentiality obligation appears. Check duration, carve-outs and survival after termination.", "low"],
  ];

  const issues: Issue[] = [];
  for (const [regex, title, description, severity] of rules) {
    if (regex.test(clean)) issues.push({ title, description, severity });
  }

  const questions = [
    "Which clauses create the largest financial or legal exposure for me?",
    "What happens if either party terminates early or breaches?",
    "Are the notice, indemnity and liability provisions enforceable under the applicable law?",
    "Which jurisdiction and dispute-resolution procedure applies, and what will it cost?",
  ];
  if (/employee|employment|salary|employer|probation/i.test(clean))
    questions.push("Which employment-law protections apply to this relationship?");
  if (/tenant|rent|landlord|lease|premises/i.test(clean))
    questions.push("Which State rent-control or tenancy rules apply to this property?");
  if (/loan|interest|emi|repay/i.test(clean))
    questions.push("Is the interest rate, default charge or recovery mechanism lawful?");

  const wordCount = clean.split(/\s+/).filter(Boolean).length;

  return {
    summary:
      `The document contains approximately ${wordCount.toLocaleString()} words. ` +
      `${clauses.length} significant passage(s) and ${issues.length} potential issue pattern(s) were detected. ` +
      "Passages are surfaced for review, not as a legal opinion.",
    clauses,
    issues,
    terms: topTerms(clean),
    questions: questions.slice(0, 6),
    relatedLaws: hits
      .filter((h) => h.kind === "law")
      .slice(0, 5)
      .map((h) => ({ title: h.title, citation: h.citation })),
    readingTimeMinutes: Math.max(1, Math.round(wordCount / 220)),
    wordCount,
  };
}
