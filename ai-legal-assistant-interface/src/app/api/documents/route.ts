import { db } from "@/db";
import { activity, documentChunks, documents } from "@/db/schema";
import { analyzeDocument, chunkText, retrieve, topTerms } from "@/lib/rag";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

const MAX_CHARS = 400_000;

export async function GET() {
  const rows = await db
    .select({
      id: documents.id,
      name: documents.name,
      pages: documents.pages,
      sizeBytes: documents.sizeBytes,
      charCount: documents.charCount,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .orderBy(desc(documents.id))
    .limit(30);
  return Response.json({ documents: rows });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      text?: string;
      pages?: number | null;
      sizeBytes?: number | null;
      mimeType?: string | null;
    };

    const name = (body.name ?? "document").slice(0, 200);
    const text = (body.text ?? "").slice(0, MAX_CHARS);

    if (text.trim().length < 40) {
      return Response.json(
        {
          error:
            "No readable text was extracted. Scanned or image-only PDFs need OCR before analysis.",
        },
        { status: 400 },
      );
    }

    // Retrieve related laws using the most frequent terms of the document.
    const probe = topTerms(text, 12)
      .map((t) => t.word)
      .join(" ");
    const relatedHits = probe ? await retrieve(probe, { topK: 5 }) : [];
    const analysis = analyzeDocument(text, relatedHits);

    const [doc] = await db
      .insert(documents)
      .values({
        name,
        mimeType: body.mimeType ?? null,
        pages: body.pages ?? null,
        sizeBytes: body.sizeBytes ?? null,
        charCount: text.length,
        text,
        analysis,
      })
      .returning({ id: documents.id, createdAt: documents.createdAt });

    const chunks = chunkText(text);
    if (chunks.length) {
      await db.insert(documentChunks).values(
        chunks.map((c, index) => ({
          documentId: doc.id,
          chunkIndex: index,
          page: c.page,
          content: c.content,
        })),
      );
    }

    await db.insert(activity).values({
      type: "document",
      title: name,
      summary: `${text.length.toLocaleString()} characters extracted, ${chunks.length} chunks indexed.`,
      refId: doc.id,
      meta: { issues: analysis.issues.length, clauses: analysis.clauses.length },
    });

    return Response.json({
      document: {
        id: doc.id,
        name,
        pages: body.pages ?? null,
        sizeBytes: body.sizeBytes ?? null,
        charCount: text.length,
        createdAt: doc.createdAt,
      },
      analysis,
      chunks: chunks.length,
    });
  } catch (error) {
    console.error("document error", error);
    return Response.json({ error: "Unable to analyze the document." }, { status: 500 });
  }
}
