import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-guard";
import { getWorkspacePlan } from "@/lib/billing";
import { PLAN_LIMITS, PLAN_LABELS } from "@/lib/plans";
import type { WorkspaceInvite } from "@/lib/supabase/types";
import { WorkspaceForm, InviteForm } from "./settings-forms";
import { ReviewRemindersForm } from "./review-reminders-form";
import { TeamMembersRealtime } from "./team-members-realtime";
import { WorkspaceNameLive } from "@/components/workspace-name-live";

export default async function SettingsPage() {
  const { supabase, user, profile } = await requireAuth();

  // All of these read independently off workspace_id — run them concurrently.
  const [
    { data: workspace },
    { data: members },
    { data: pendingInvites },
    { data: reminderSettings },
    plan,
  ] = await Promise.all([
    supabase
      .from("workspaces")
      .select("id, name")
      .eq("id", profile.workspace_id)
      .single(),
    supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("workspace_id", profile.workspace_id)
      .order("created_at", { ascending: true }),
    supabase
      .from("workspace_invites")
      .select("id, email, created_at")
      .eq("workspace_id", profile.workspace_id)
      .eq("accepted", false)
      .order("created_at", { ascending: false }),
    supabase
      .from("workspace_reminder_settings")
      .select("enabled, frequency, send_day, recipient_roles, next_send_at")
      .eq("workspace_id", profile.workspace_id)
      .maybeSingle(),
    getWorkspacePlan(supabase, profile.workspace_id),
  ]);

  if (!workspace) redirect("/login");

  const isAdmin = profile.role === "admin";
  const maxMembers = PLAN_LIMITS[plan].maxMembers;
  const memberTotal = (members?.length ?? 0) + (pendingInvites?.length ?? 0);
  const atMemberLimit = maxMembers !== Infinity && memberTotal >= maxMembers;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Settings
        </h1>
        <p className="text-gray-500">
          Manage your workspace and team members.
        </p>
      </div>

      {/* Workspace Name */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
        <h2 className="text-base font-semibold text-white">Workspace</h2>
        <p className="mt-1 text-sm text-gray-500">
          {isAdmin
            ? "Update your workspace name."
            : "Your workspace information."}
        </p>
        <div className="mt-4">
          {isAdmin ? (
            <WorkspaceForm defaultName={workspace.name} />
          ) : (
            <WorkspaceNameLive
              workspaceId={workspace.id}
              initialName={workspace.name}
              className="text-sm font-medium text-white"
            />
          )}
        </div>
      </div>

      {/* Team Members — Real-time */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
        <h2 className="text-base font-semibold text-white">Team Members</h2>
        <p className="mt-1 text-sm text-gray-500">
          People who are part of this workspace.
        </p>
        <TeamMembersRealtime
          initialMembers={members ?? []}
          currentUserId={user.id}
          workspaceId={profile.workspace_id}
        />
      </div>

      {/* Pending Invites */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
        <h2 className="text-base font-semibold text-white">Pending Invites</h2>
        <p className="mt-1 text-sm text-gray-500">
          Invitations that have not yet been accepted.
        </p>
        <div className="mt-4 divide-y divide-white/10">
          {pendingInvites?.map(
            (invite: Pick<WorkspaceInvite, "id" | "email" | "created_at">) => (
              <div
                key={invite.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <p className="text-sm text-gray-300">{invite.email}</p>
                <span className="rounded-md border border-white/10 px-2 py-0.5 text-xs text-gray-500">
                  Pending
                </span>
              </div>
            )
          )}

          {(!pendingInvites || pendingInvites.length === 0) && (
            <p className="text-sm text-gray-500">No pending invites.</p>
          )}
        </div>
      </div>

      {/* Invite Member (admin only) */}
      {isAdmin && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
          <h2 className="text-base font-semibold text-white">Invite Member</h2>
          <p className="mt-1 text-sm text-gray-500">
            Send an invitation to join this workspace.
          </p>
          {atMemberLimit ? (
            <div className="mt-4 rounded-lg border border-yellow-400/20 bg-yellow-400/[0.06] px-4 py-3 text-sm text-yellow-200/90">
              Your {PLAN_LABELS[plan]} plan allows {maxMembers} team member
              {maxMembers === 1 ? "" : "s"}.{" "}
              <Link
                href="/billing"
                className="font-medium text-yellow-400 underline"
              >
                Upgrade
              </Link>{" "}
              to invite more.
            </div>
          ) : (
            <InviteForm />
          )}
        </div>
      )}

      {/* Review Reminders (admin only) */}
      {isAdmin && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
          <h2 className="text-base font-semibold text-white">
            Review Reminders
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Send your team a recurring reminder to review their subscriptions.
          </p>
          <ReviewRemindersForm
            initialSettings={{
              enabled: reminderSettings?.enabled ?? false,
              frequency: reminderSettings?.frequency ?? "monthly",
              sendDay: reminderSettings?.send_day ?? 1,
              recipientRoles: reminderSettings?.recipient_roles ?? [
                "admin",
                "member",
              ],
              nextSendAt: reminderSettings?.next_send_at ?? null,
            }}
          />
        </div>
      )}
    </div>
  );
}
