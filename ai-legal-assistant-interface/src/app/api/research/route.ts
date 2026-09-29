import { db } from "@/db";
import { activity } from "@/db/schema";
import { retrieve } from "@/lib/rag";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const domain = searchParams.get("domain") ?? undefined;
  const sourceType = searchParams.get("type") ?? undefined;
  const log = searchParams.get("log") === "1";

  if (!q) return Response.json({ results: [] });

  const results = await retrieve(q, {
    topK: 12,
    domain: domain || undefined,
    sourceType: sourceType && sourceType !== "all" ? sourceType : undefined,
  });

  if (log) {
    await db.insert(activity).values({
      type: "research",
      title: q,
      summary: results.length
        ? results
            .slice(0, 4)
            .map((r) => r.citation)
            .join("; ")
        : "No matching sources.",
      meta: { count: results.length, domain, sourceType },
    });
  }

  return Response.json({ results });
}
