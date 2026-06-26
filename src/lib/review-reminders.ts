import { createClient } from "@supabase/supabase-js";
import { sendReviewReminderEmail } from "@/lib/email";
import { computeNextSendDate } from "@/lib/reminders";
import type { ReminderFrequency } from "@/lib/supabase/types";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_ROLES = ["admin", "member"];

/** A due reminder row with its workspace + configuring admin embedded. */
interface DueSetting {
  workspace_id: string;
  frequency: ReminderFrequency;
  send_day: number;
  recipient_roles: string[] | null;
  next_send_at: string;
  workspaces: { name: string } | null;
  admin: { full_name: string | null; email: string | null } | null;
}

export interface ReviewRemindersResult {
  workspaces: number;
  sent: number;
  errors: number;
}

/**
 * Send any review reminders that are due today (or overdue) and advance each
 * workspace's schedule to its next occurrence.
 *
 * This is the shared core invoked both by the daily `/api/cron/reminders` job
 * (so review reminders piggyback on an existing cron instead of needing a
 * separate one) and by the standalone `/api/cron/review-reminders` route, which
 * is kept for manual triggering/testing.
 */
export async function runReviewReminders(): Promise<ReviewRemindersResult> {
  const today = new Date().toISOString().split("T")[0];
  console.log("[ReviewReminders] checking for due workspaces, today =", today);

  // Workspaces with reminders enabled and a send date due today or earlier
  // (`lte` so a missed cron run still fires on the next day). The workspace
  // name and the configuring admin are embedded via their foreign keys, so the
  // whole batch loads in one query instead of two extra lookups per row.
  const { data: dueSettings, error: settingsError } = await supabase
    .from("workspace_reminder_settings")
    .select(
      "workspace_id, frequency, send_day, recipient_roles, next_send_at, " +
        "workspaces(name), admin:profiles!updated_by(full_name, email)"
    )
    .eq("enabled", true)
    .not("next_send_at", "is", null)
    .lte("next_send_at", today)
    .returns<DueSetting[]>();

  if (settingsError) {
    console.error("[ReviewReminders] settings query error:", settingsError.message);
    throw new Error(settingsError.message);
  }

  console.log("[ReviewReminders] found", dueSettings?.length ?? 0, "due workspace(s)");

  let workspaces = 0;
  let sent = 0;
  let errors = 0;

  for (const setting of dueSettings ?? []) {
    // Workspace name for the email copy (embedded above).
    const workspace = setting.workspaces;
    if (!workspace) {
      errors++;
      continue;
    }

    // Name of the admin who configured the reminder (embedded above) — used
    // as the email sign-off.
    const admin = setting.admin;
    const adminName =
      admin?.full_name?.trim() || admin?.email || "Your workspace admin";

    // Eligible recipients: active members whose role is in recipient_roles.
    const roles =
      Array.isArray(setting.recipient_roles) &&
      setting.recipient_roles.length > 0
        ? setting.recipient_roles
        : DEFAULT_ROLES;

    const { data: recipients, error: recipientsError } = await supabase
      .from("profiles")
      .select("email")
      .eq("workspace_id", setting.workspace_id)
      .eq("is_active", true)
      .in("role", roles);

    // Bail before advancing the schedule if the recipient lookup failed —
    // otherwise the workspace would silently skip this period's reminder and
    // not retry on the next run.
    if (recipientsError) {
      errors++;
      continue;
    }

    // Send the workspace's emails concurrently — awaiting them one by one
    // would risk running the cron past Vercel's execution limit for a large
    // team. The workspace loop stays sequential, so concurrency is bounded to
    // one team at a time.
    const results = await Promise.allSettled(
      (recipients ?? [])
        .filter((recipient) => recipient.email)
        .map((recipient) =>
          sendReviewReminderEmail(recipient.email, {
            workspaceName: workspace.name,
            adminName,
          })
        )
    );
    sent += results.filter((r) => r.status === "fulfilled").length;
    errors += results.filter((r) => r.status === "rejected").length;

    // Advance the schedule regardless of individual send failures so the
    // workspace is not re-notified on the next daily run.
    const nextSendAt = computeNextSendDate(
      setting.frequency,
      setting.send_day,
      new Date()
    );

    const { error: updateError } = await supabase
      .from("workspace_reminder_settings")
      .update({ last_sent_at: new Date().toISOString(), next_send_at: nextSendAt })
      .eq("workspace_id", setting.workspace_id);

    if (updateError) {
      console.error("[ReviewReminders] failed to advance schedule for workspace", setting.workspace_id, updateError.message);
      errors++;
    } else {
      console.log("[ReviewReminders] workspace", setting.workspace_id, "done — next send:", nextSendAt);
      workspaces++;
    }
  }

  return { workspaces, sent, errors };
}
