"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendInviteEmail } from "@/lib/email";
import { getWorkspacePlan } from "@/lib/billing";
import { PLAN_LIMITS, PLAN_LABELS } from "@/lib/plans";

export async function toggleMemberStatus(
  memberId: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, workspace_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin")
    return { success: false, error: "Only admins can change member status" };

  if (memberId === user.id)
    return { success: false, error: "You cannot change your own status" };

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", memberId)
    .eq("workspace_id", profile.workspace_id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/settings");
  return { success: true };
}

export async function inviteTeamMember(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const email = formData.get("email") as string | null;

  if (!email || !email.includes("@")) {
    return { success: false, error: "Enter a valid email address" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, workspace_id")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin")
    return { success: false, error: "Only admins can invite members" };

  // Enforce the plan's team-member limit (members + pending invites).
  const plan = await getWorkspacePlan(supabase, profile.workspace_id);
  const maxMembers = PLAN_LIMITS[plan].maxMembers;
  if (maxMembers !== Infinity) {
    const { count: memberCount } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", profile.workspace_id);
    const { count: pendingCount } = await supabase
      .from("workspace_invites")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", profile.workspace_id)
      .eq("accepted", false);
    if ((memberCount ?? 0) + (pendingCount ?? 0) >= maxMembers) {
      return {
        success: false,
        error: `Your ${PLAN_LABELS[plan]} plan allows ${maxMembers} team member${
          maxMembers === 1 ? "" : "s"
        }. Upgrade to invite more.`,
      };
    }
  }

  // Check for existing pending invite
  const { data: existingInvite } = await supabase
    .from("workspace_invites")
    .select("id")
    .eq("workspace_id", profile.workspace_id)
    .eq("email", email.toLowerCase())
    .eq("accepted", false)
    .single();

  if (existingInvite)
    return { success: false, error: "User Already Invited" };

  // Check if already a member
  const { data: existingMember } = await supabase
    .from("profiles")
    .select("id")
    .eq("workspace_id", profile.workspace_id)
    .eq("email", email.toLowerCase())
    .single();

  if (existingMember)
    return { success: false, error: "User is already a member of this workspace" };

  await supabase.from("workspace_invites").insert({
    workspace_id: profile.workspace_id,
    email: email.toLowerCase(),
    invited_by: user.id,
  });

  // Fetch inviter name + workspace name for the email
  const { data: inviter } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("name")
    .eq("id", profile.workspace_id)
    .single();

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "https://subiq.vercel.app";
  const signupUrl = `${origin}/signup`;

  try {
    await sendInviteEmail(
      email.toLowerCase(),
      inviter?.full_name || inviter?.email || "A teammate",
      workspace?.name ?? "your workspace",
      signupUrl
    );
  } catch (err) {
    console.error("[INVITE EMAIL] Failed to send:", err);
    return { success: false, error: "Invite created but email failed to send. Check SMTP settings." };
  }

  revalidatePath("/settings");
  return { success: true };
}
