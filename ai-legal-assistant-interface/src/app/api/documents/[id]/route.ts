import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const docId = Number(id);
  if (!Number.isFinite(docId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }
  const [doc] = await db
    .select({
      id: documents.id,
      name: documents.name,
      pages: documents.pages,
      sizeBytes: documents.sizeBytes,
      charCount: documents.charCount,
      analysis: documents.analysis,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .where(eq(documents.id, docId));

  if (!doc) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ document: doc, analysis: doc.analysis });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const docId = Number(id);
  if (!Number.isFinite(docId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }
  await db.delete(documents).where(eq(documents.id, docId));
  return Response.json({ ok: true });
}
