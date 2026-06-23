"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface WorkspaceNameLiveProps {
  workspaceId: string;
  initialName: string;
  className?: string;
}

export function WorkspaceNameLive({
  workspaceId,
  initialName,
  className,
}: WorkspaceNameLiveProps) {
  const [name, setName] = useState(initialName);

  // Pick up new server-rendered initial values (after navigation / revalidation).
  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  const refetch = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("workspaces")
      .select("name")
      .eq("id", workspaceId)
      .single<{ name: string }>();
    if (data?.name) setName(data.name);
  }, [workspaceId]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`workspace-name:${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "workspaces",
          filter: `id=eq.${workspaceId}`,
        },
        (payload) => {
          // Prefer the value carried in the payload, but fall back to a
          // refetch so we don't depend on the table's replica identity.
          const next = (payload.new as { name?: string } | null)?.name;
          if (typeof next === "string" && next.length > 0) {
            setName(next);
          } else {
            refetch();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, refetch]);

  return <div className={className}>{name}</div>;
}
