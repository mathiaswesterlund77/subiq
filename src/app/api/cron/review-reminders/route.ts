import { NextResponse } from "next/server";
import { runReviewReminders } from "@/lib/review-reminders";

/**
 * Standalone endpoint for review reminders.
 *
 * Review reminders are normally driven by the daily `/api/cron/reminders` cron
 * (which calls the same `runReviewReminders()` core), so this route no longer
 * has its own entry in `vercel.json` — keeping the project within the Vercel
 * Hobby plan's 2-cron limit. It is retained for manual triggering and testing,
 * e.g.:
 *   curl -H "Authorization: Bearer $CRON_SECRET" .../api/cron/review-reminders
 */
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access.
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runReviewReminders();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
