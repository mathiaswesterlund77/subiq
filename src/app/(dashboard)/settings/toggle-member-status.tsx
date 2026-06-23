"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { toggleMemberStatus } from "./actions";

interface ToggleMemberStatusProps {
  memberId: string;
  name: string;
  isActive: boolean;
}

export function ToggleMemberStatus({
  memberId,
  name,
  isActive,
}: ToggleMemberStatusProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const willBeActive = !isActive;

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleMemberStatus(memberId, willBeActive);
      if (result.success) {
        toast.success(
          `${name} marked as ${willBeActive ? "active" : "inactive"}`
        );
        setOpen(false);
      } else {
        toast.error(result.error ?? "Failed to update status");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            className={`rounded-md px-2 py-0.5 text-xs font-medium transition-opacity hover:opacity-70 ${
              isActive
                ? "bg-green-500/15 text-green-400"
                : "bg-white/10 text-gray-400"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </button>
        }
      />
      <DialogContent className="border border-white/15 bg-black sm:max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/10">
            <AlertTriangle className="size-6 text-yellow-400" />
          </div>
          <DialogTitle className="text-center text-lg font-bold text-white">
            {willBeActive ? "Activate Member" : "Deactivate Member"}
          </DialogTitle>
          <p className="text-center text-sm text-gray-400">
            Set{" "}
            <span className="font-semibold text-white">{name}</span> as{" "}
            <span
              className={
                willBeActive ? "text-green-400 font-semibold" : "text-gray-300 font-semibold"
              }
            >
              {willBeActive ? "active" : "inactive"}
            </span>
            ?
          </p>
        </DialogHeader>
        <div className="mt-2 flex justify-center gap-3">
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleToggle}
            disabled={isPending}
            className={
              willBeActive
                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                : "bg-white/10 text-gray-300 hover:bg-white/20"
            }
          >
            {isPending
              ? "Saving..."
              : willBeActive
                ? "Activate"
                : "Deactivate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
