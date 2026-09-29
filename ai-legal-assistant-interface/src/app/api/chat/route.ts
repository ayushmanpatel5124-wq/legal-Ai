import { db } from "@/db";
import { activity, conversations, messages } from "@/db/schema";
import { composeAnswer, retrieve } from "@/lib/rag";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      question?: string;
      conversationId?: number | null;
    };
    const question = (body.question ?? "").trim();
    if (!question) {
      return Response.json({ error: "A question is required." }, { status: 400 });
    }

    const hits = await retrieve(question, { topK: 6 });
    const answer = composeAnswer(question, hits);

    let conversationId = body.conversationId ?? null;
    if (!conversationId) {
      const [conv] = await db
        .insert(conversations)
        .values({
          title: question.length > 80 ? question.slice(0, 77) + "…" : question,
        })
        .returning({ id: conversations.id });
      conversationId = conv.id;
    } else {
      await db
        .update(conversations)
        .set({ updatedAt: new Date() })
        .where(eq(conversations.id, conversationId));
    }

    await db.insert(messages).values([
      { conversationId, role: "user", content: question },
      {
        conversationId,
        role: "assistant",
        content: answer.plain,
        payload: answer,
      },
    ]);

    await db.insert(activity).values({
      type: "chat",
      title: question,
      summary: answer.plain.slice(0, 300),
      refId: conversationId,
      meta: { confidence: answer.confidence, sources: hits.length },
    });

    return Response.json({ conversationId, answer });
  } catch (error) {
    console.error("chat error", error);
    return Response.json({ error: "Unable to answer right now." }, { status: 500 });
  }
}

export async function GET() {
  const rows = await db.execute<{
    id: number;
    title: string;
    updated_at: string;
    message_count: number;
  }>(sql`
    select c.id, c.title, c.updated_at,
           (select count(*)::int from messages m where m.conversation_id = c.id) as message_count
    from conversations c
    order by c.updated_at desc
    limit 40
  `);
  return Response.json({ conversations: rows.rows });
}
