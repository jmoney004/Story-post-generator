import { NextRequest, NextResponse } from "next/server";
/**
 * Vercel Cron: call this route on a schedule to refresh articles.
 * In Vercel dashboard: Cron Jobs → add e.g. "0 6 * * *" (daily 6 AM UTC).
 * Set CRON_SECRET in env and send it in the request so only cron can trigger.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { runFetch } = await import("@/scripts/fetch-articles");
    await runFetch();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Cron fetch error:", e);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
