import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAuth() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, workspace_id, signup_conversion_tracked")
    .eq("id", user.id)
    .single<{
      id: string;
      email: string;
      full_name: string;
      role: string;
      workspace_id: string;
      signup_conversion_tracked: boolean;
    }>();

  if (!profile) redirect("/login");

  return { supabase, user, profile };
}
