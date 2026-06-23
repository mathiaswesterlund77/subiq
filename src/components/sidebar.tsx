"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { usePresence } from "@/providers/presence-provider";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
import { WorkspaceNameLive } from "@/components/workspace-name-live";
import { Logo } from "@/components/logo";

interface SidebarProps {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  };
  workspace: {
    id: string;
    name: string;
  };
}

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Subscriptions",
    href: "/subscriptions",
    icon: CreditCard,
  },
  {
    label: "Billing",
    href: "/billing",
    icon: Wallet,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

function SidebarContent({
  user,
  workspace,
  pathname,
  onSignOut,
  onNavClick,
}: SidebarProps & {
  pathname: string;
  onSignOut: () => void;
  onNavClick?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-black text-white">
      {/* Brand */}
      <div className="flex h-16 flex-col items-start justify-center px-6">
        <Logo height={22} />
        <WorkspaceNameLive
          workspaceId={workspace.id}
          initialName={workspace.name}
          className="mt-0.5 truncate text-xs font-medium text-gray-400"
        />
      </div>

      <div className="mx-4 border-t border-white/10" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/10 text-yellow-400"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 border-t border-white/10" />

      {/* User info */}
      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <p className="truncate text-sm font-medium text-white">
            {user.full_name}
          </p>
          <p className="truncate text-xs text-gray-500">{user.email}</p>
          <span className="mt-1 inline-block rounded-md bg-yellow-400/10 px-2 py-0.5 text-xs font-medium capitalize text-yellow-400">
            {user.role}
          </span>
        </div>
        <button
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ user, workspace }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { untrackAndDisconnect } = usePresence();

  const handleSignOut = async () => {
    await untrackAndDisconnect();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login?logged_out=true");
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0">
        <div className="fixed inset-y-0 left-0 z-30 w-64 border-r border-white/10">
          <SidebarContent
            user={user}
            workspace={workspace}
            pathname={pathname}
            onSignOut={handleSignOut}
          />
        </div>
      </aside>

      {/* Mobile header + sheet */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-white/10 bg-black px-4 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <button className="rounded-lg p-2 text-white hover:bg-white/5" />
            }
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-0 p-0">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <SidebarContent
              user={user}
              workspace={workspace}
              pathname={pathname}
              onSignOut={handleSignOut}
              onNavClick={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <div className="flex min-w-0 flex-col items-start">
          <Logo height={18} />
          <WorkspaceNameLive
            workspaceId={workspace.id}
            initialName={workspace.name}
            className="truncate text-[11px] font-medium text-gray-400"
          />
        </div>
      </div>

    </>
  );
}
