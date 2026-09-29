import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const conversationId = Number(id);
  if (!Number.isFinite(conversationId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId));
  if (!conversation) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.id));

  return Response.json({ conversation, messages: rows });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const conversationId = Number(id);
  if (!Number.isFinite(conversationId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }
  await db.delete(conversations).where(eq(conversations.id, conversationId));
  return Response.json({ ok: true });
}
