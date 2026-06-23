"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface PresenceContextValue {
  onlineUsers: Record<string, boolean>;
  untrackAndDisconnect: () => Promise<void>;
}

const PresenceContext = createContext<PresenceContextValue | null>(null);

export function usePresence(): PresenceContextValue {
  const ctx = useContext(PresenceContext);
  if (!ctx) {
    throw new Error("usePresence must be used within a PresenceProvider");
  }
  return ctx;
}

interface PresenceProviderProps {
  userId: string;
  workspaceId: string;
  children: React.ReactNode;
}

export function PresenceProvider({
  userId,
  workspaceId,
  children,
}: PresenceProviderProps) {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Stable untrack + disconnect function for logout
  const untrackAndDisconnect = useCallback(async () => {
    const channel = channelRef.current;
    if (channel) {
      await channel.untrack();
      const supabase = createClient();
      await supabase.removeChannel(channel);
      channelRef.current = null;
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // removeChannel first to ensure no stale channel with the same name exists
    // (handles React strict mode double-mount and hot-reload)
    const existingChannel = supabase
      .getChannels()
      .find((ch) => ch.topic === `realtime:workspace:${workspaceId}`);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    const channel = supabase.channel(`workspace:${workspaceId}`, {
      config: { presence: { key: userId } },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const online: Record<string, boolean> = {};
        for (const key of Object.keys(state)) {
          online[key] = true;
        }
        setOnlineUsers(online);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: userId });
        }
      });

    // Visibility change: untrack after 30s hidden, re-track immediately when visible
    let hiddenTimer: ReturnType<typeof setTimeout> | null = null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenTimer = setTimeout(() => {
          channel.untrack();
        }, 30_000);
      } else if (document.visibilityState === "visible") {
        if (hiddenTimer) {
          clearTimeout(hiddenTimer);
          hiddenTimer = null;
        }
        channel.track({ user_id: userId });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (hiddenTimer) clearTimeout(hiddenTimer);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [userId, workspaceId]);

  return (
    <PresenceContext.Provider value={{ onlineUsers, untrackAndDisconnect }}>
      {children}
    </PresenceContext.Provider>
  );
}
