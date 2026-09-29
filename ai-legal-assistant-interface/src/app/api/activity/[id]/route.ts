import { db } from "@/db";
import { activity } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const itemId = Number(id);
  if (!Number.isFinite(itemId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }
  await db.delete(activity).where(eq(activity.id, itemId));
  return Response.json({ ok: true });
}
