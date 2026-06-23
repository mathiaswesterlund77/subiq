"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UpdateWorkspaceResult =
  | { success: true }
  | { success: false; error: string };

export async function updateWorkspaceName(
  formData: FormData
): Promise<UpdateWorkspaceResult> {
  const name = (formData.get("name") as string | null)?.trim();

  if (!name) {
    return { success: false, error: "Workspace name is required" };
  }

  if (name.length > 100) {
    return { success: false, error: "Workspace name must be 100 characters or fewer" };
  }

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
    return { success: false, error: "Only admins can update the workspace name" };
  }

  const { error: updateError } = await supabase
    .from("workspaces")
    .update({ name })
    .eq("id", profile.workspace_id);

  if (updateError) {
    console.error("Error updating workspace name:", updateError);
    return {
      success: false,
      error: "Failed to update workspace name. Please try again.",
    };
  }

  // Revalidate the root layout so the sidebar (and any server-rendered
  // workspace name) refreshes for the admin who just made the change.
  revalidatePath("/", "layout");

  return { success: true };
}
