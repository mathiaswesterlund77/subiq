"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeNextSendDate } from "@/lib/reminders";
import type { ReminderFrequency } from "@/lib/supabase/types";

const FREQUENCIES: ReminderFrequency[] = ["monthly", "quarterly"];
const ROLES = ["admin", "member"];

export interface SaveReviewRemindersInput {
  enabled: boolean;
  frequency: string;
  sendDay: number;
  recipientRoles: string[];
}

export type SaveReviewRemindersResult =
  | { success: true; nextSendAt: string | null }
  | { success: false; error: string };

export async function saveReviewReminders(
  input: SaveReviewRemindersInput
): Promise<SaveReviewRemindersResult> {
  // --- Validate input ---
  if (!FREQUENCIES.includes(input.frequency as ReminderFrequency)) {
    return { success: false, error: "Invalid frequency" };
  }

  const sendDay = Number(input.sendDay);
  if (!Number.isInteger(sendDay) || sendDay < 1 || sendDay > 28) {
    return { success: false, error: "Send day must be between 1 and 28" };
  }

  const recipientRoles = input.recipientRoles.filter((r) => ROLES.includes(r));
  if (input.enabled && recipientRoles.length === 0) {
    return { success: false, error: "Select at least one recipient group" };
  }

  // --- Authenticate & authorize ---
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, workspace_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { success: false, error: "Could not load profile" };
  }

  if (profile.role !== "admin") {
    return { success: false, error: "Only admins can change review reminders" };
  }

  // --- Persist ---
  const frequency = input.frequency as ReminderFrequency;
  const nextSendAt = input.enabled
    ? computeNextSendDate(frequency, sendDay, new Date())
    : null;

  const { error: upsertError } = await supabase
    .from("workspace_reminder_settings")
    .upsert(
      {
        workspace_id: profile.workspace_id,
        enabled: input.enabled,
        frequency,
        send_day: sendDay,
        recipient_roles: recipientRoles.length > 0 ? recipientRoles : ROLES,
        next_send_at: nextSendAt,
        updated_by: user.id,
      },
      { onConflict: "workspace_id" }
    );

  if (upsertError) {
    console.error("Error saving review reminder settings:", upsertError);
    return {
      success: false,
      error: "Failed to save settings. Please try again.",
    };
  }

  revalidatePath("/settings");

  return { success: true, nextSendAt };
}
