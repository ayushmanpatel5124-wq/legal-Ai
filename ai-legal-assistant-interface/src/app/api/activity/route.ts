import { db } from "@/db";
import { activity } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select()
    .from(activity)
    .orderBy(desc(activity.id))
    .limit(100);
  return Response.json({ activity: rows });
}

export async function DELETE() {
  await db.delete(activity);
  return Response.json({ ok: true });
}
