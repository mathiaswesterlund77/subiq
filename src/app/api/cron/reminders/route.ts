import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendRenewalReminderEmail } from "@/lib/email";
import { runReviewReminders } from "@/lib/review-reminders";

// Allow up to 60 s on the Hobby plan (default is 10 s, which can be too
// short when processing renewal + review reminders sequentially).
export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const REMINDER_DAYS = [30, 14, 7] as const;
type ReminderDay = (typeof REMINDER_DAYS)[number];

function notificationType(days: ReminderDay) {
  return `${days}_day` as const;
}

function dateStr(date: Date) {
  return date.toISOString().split("T")[0];
}

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[CRON /reminders] started");

  // ── Review reminders ─────────────────────────────────────────────────
  // Run these FIRST so they are not starved by the renewal-reminder loop
  // (keeps the project within the Hobby plan's 2-cron limit). A failure
  // here must not mask the renewal-reminder result, so it is reported
  // separately rather than thrown.
  let reviewReminders;
  try {
    reviewReminders = await runReviewReminders();
    console.log("[CRON /reminders] review reminders done", reviewReminders);
  } catch (error) {
    reviewReminders = {
      error: error instanceof Error ? error.message : "Unknown error",
    };
    console.error("[CRON /reminders] review reminders failed", reviewReminders.error);
  }

  // ── Renewal reminders ────────────────────────────────────────────────
  const now = new Date();
  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const days of REMINDER_DAYS) {
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + days);
    const target = dateStr(targetDate);

    // Find active subscriptions with renewal on this exact date
    const { data: subs, error: subError } = await supabase
      .from("subscriptions")
      .select("id, software_name, price, currency, billing_cycle, next_renewal_date, created_by")
      .eq("status", "active")
      .eq("next_renewal_date", target);

    if (subError || !subs) continue;

    for (const sub of subs) {
      if (!sub.created_by) {
        skipped++;
        continue;
      }

      // Check if already sent
      const { data: existing } = await supabase
        .from("notification_log")
        .select("id")
        .eq("subscription_id", sub.id)
        .eq("notification_type", notificationType(days))
        .single();

      if (existing) {
        skipped++;
        continue;
      }

      // Look up creator email
      const { data: creator } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", sub.created_by)
        .single();

      if (!creator?.email) {
        skipped++;
        continue;
      }

      // Send email
      try {
        await sendRenewalReminderEmail(creator.email, {
          softwareName: sub.software_name,
          renewalDate: sub.next_renewal_date,
          price: sub.price,
          currency: sub.currency,
          daysRemaining: days,
        });

        // Log notification
        await supabase.from("notification_log").insert({
          subscription_id: sub.id,
          notification_type: notificationType(days),
        });

        sent++;
      } catch {
        errors++;
      }
    }
  }

  console.log("[CRON /reminders] renewal reminders done", { sent, skipped, errors });

  return NextResponse.json({ sent, skipped, errors, reviewReminders });
}
