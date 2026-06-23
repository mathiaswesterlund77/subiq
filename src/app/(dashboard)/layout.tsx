import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";
import { DashboardProviders } from "@/providers/dashboard-providers";
import type { Profile, Workspace } from "@/lib/supabase/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, workspace_id")
    .eq("id", user.id)
    .single<Pick<Profile, "id" | "email" | "full_name" | "role" | "workspace_id">>();

  if (!profile) {
    await supabase.auth.signOut();
    redirect("/login?error=no_profile");
  }

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("id", profile.workspace_id)
    .single<Pick<Workspace, "id" | "name">>();

  if (!workspace) {
    await supabase.auth.signOut();
    redirect("/login?error=no_workspace");
  }

  return (
    <DashboardProviders userId={profile.id} workspaceId={workspace.id}>
      <div className="flex h-screen overflow-hidden bg-gray-950">
        <Sidebar
          user={{
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role,
          }}
          workspace={{
            id: workspace.id,
            name: workspace.name,
          }}
        />
        <main className="flex-1 overflow-y-auto bg-gray-950 p-4 pt-[72px] sm:p-6 sm:pt-20 lg:p-8">
          {children}
        </main>
      </div>
    </DashboardProviders>
  );
}
