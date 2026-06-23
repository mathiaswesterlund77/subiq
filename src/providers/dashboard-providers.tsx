"use client";

import { PresenceProvider } from "./presence-provider";

interface DashboardProvidersProps {
  userId: string;
  workspaceId: string;
  children: React.ReactNode;
}

export function DashboardProviders({
  userId,
  workspaceId,
  children,
}: DashboardProvidersProps) {
  return (
    <PresenceProvider userId={userId} workspaceId={workspaceId}>
      {children}
    </PresenceProvider>
  );
}
