import { db } from "@/db";
import { ensureCorpus } from "@/lib/rag";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureCorpus();
    const rows = await db.execute<{
      questions: number;
      documents: number;
      verifications: number;
      sources: number;
      chunks: number;
    }>(sql`
      select
        (select count(*)::int from messages where role = 'user') as questions,
        (select count(*)::int from documents) as documents,
        (select count(*)::int from verifications) as verifications,
        (select count(*)::int from legal_sources) as sources,
        (select count(*)::int from document_chunks) as chunks
    `);

    const recentChats = await db.execute<{
      id: number;
      title: string;
      updated_at: string;
    }>(sql`select id, title, updated_at from conversations order by updated_at desc limit 5`);

    const recentDocs = await db.execute<{
      id: number;
      name: string;
      pages: number | null;
      created_at: string;
    }>(sql`select id, name, pages, created_at from documents order by id desc limit 5`);

    const recentClaims = await db.execute<{
      id: number;
      claim: string;
      status: string;
      created_at: string;
    }>(sql`select id, claim, status, created_at from verifications order by id desc limit 5`);

    return Response.json({
      ok: true,
      stats: rows.rows[0],
      recentChats: recentChats.rows,
      recentDocs: recentDocs.rows,
      recentClaims: recentClaims.rows,
    });
  } catch (error) {
    console.error("stats error", error);
    return Response.json({ ok: false, error: "Database unavailable" }, { status: 500 });
  }
}
