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
import { Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { deleteSubscription } from "../actions";

interface DeleteConfirmDialogProps {
  subscriptionId: string;
  softwareName: string;
}

export function DeleteConfirmDialog({
  subscriptionId,
  softwareName,
}: DeleteConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteSubscription(subscriptionId);
      if (result.success) {
        toast.success(`${softwareName} deleted`);
        setOpen(false);
      } else {
        toast.error(result.error ?? "Failed to delete");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-xs" className="text-gray-400 hover:text-red-400">
            <Trash2 className="size-3.5" />
          </Button>
        }
      />
      <DialogContent className="border-red-500/20 bg-gray-950 sm:max-w-sm">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <AlertTriangle className="size-6 text-red-400" />
          </div>
          <DialogTitle className="text-center text-lg font-bold text-white">
            Delete Subscription
          </DialogTitle>
          <p className="text-center text-sm text-gray-400">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">{softwareName}</span>?
            This action cannot be undone.
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
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
