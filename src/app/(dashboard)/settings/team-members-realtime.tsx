"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePresence } from "@/providers/presence-provider";

interface Member {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface TeamMembersRealtimeProps {
  initialMembers: Member[];
  currentUserId: string;
  workspaceId: string;
}

export function TeamMembersRealtime({
  initialMembers,
  currentUserId,
  workspaceId,
}: TeamMembersRealtimeProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const { onlineUsers } = usePresence();

  const refreshMembers = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });
    if (data) setMembers(data);
  }, [workspaceId]);

  // Listen for profile changes (new members, removals)
  useEffect(() => {
    const supabase = createClient();

    const dbChannel = supabase
      .channel("profiles-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        () => {
          refreshMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dbChannel);
    };
  }, [workspaceId, refreshMembers]);

  return (
    <div className="mt-4 divide-y divide-white/10">
      {members.map((member) => {
        const isSelf = member.id === currentUserId;
        const isOnline = isSelf || onlineUsers[member.id];

        return (
          <div
            key={member.id}
            className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={`size-2 shrink-0 rounded-full transition-colors duration-500 ${
                  isOnline
                    ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]"
                    : "bg-gray-600"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {member.full_name || "Unnamed"}
                  {isSelf && (
                    <span className="ml-2 text-xs text-gray-600">(you)</span>
                  )}
                </p>
                <p className="truncate text-xs text-gray-500">{member.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pl-5 sm:pl-0">
              <span
                className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${
                  member.role === "admin"
                    ? "bg-yellow-400/10 text-yellow-400"
                    : "bg-white/10 text-gray-400"
                }`}
              >
                {member.role}
              </span>

              <span
                className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors duration-500 ${
                  isOnline
                    ? "bg-green-500/15 text-green-400"
                    : "bg-white/10 text-gray-400"
                }`}
              >
                {isOnline ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        );
      })}

      {members.length === 0 && (
        <p className="text-sm text-gray-500">No members found.</p>
      )}
    </div>
  );
}
