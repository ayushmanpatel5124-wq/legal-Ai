import { db } from "@/db";
import { activity, verifications } from "@/db/schema";
import { retrieve, verifyClaim } from "@/lib/rag";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { claim?: string };
    const claim = (body.claim ?? "").trim();
    if (!claim) {
      return Response.json({ error: "A claim is required." }, { status: 400 });
    }

    const hits = await retrieve(claim, { topK: 6 });
    const result = verifyClaim(claim, hits);

    const [row] = await db
      .insert(verifications)
      .values({
        claim,
        status: result.status,
        confidence: result.confidence,
        coverage: result.coverage,
        explanation: result.explanation,
        evidence: { supporting: result.supporting, contradicting: result.contradicting },
      })
      .returning({ id: verifications.id });

    await db.insert(activity).values({
      type: "verify",
      title: claim,
      summary: result.explanation.slice(0, 300),
      refId: row.id,
      meta: { status: result.status, confidence: result.confidence },
    });

    return Response.json({ id: row.id, claim, hits, ...result });
  } catch (error) {
    console.error("verify error", error);
    return Response.json({ error: "Unable to verify right now." }, { status: 500 });
  }
}

export async function GET() {
  const rows = await db
    .select()
    .from(verifications)
    .orderBy(desc(verifications.id))
    .limit(20);
  return Response.json({ verifications: rows });
}
