"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { toggleSubscriptionUnused } from "../actions";

interface UnusedToggleProps {
  subscriptionId: string;
  softwareName: string;
  isUnused: boolean;
}

export function UnusedToggle({
  subscriptionId,
  softwareName,
  isUnused,
}: UnusedToggleProps) {
  const [optimisticChecked, setOptimisticChecked] = useOptimistic(isUnused);
  const [isPending, startTransition] = useTransition();

  function handleChange(checked: boolean) {
    startTransition(async () => {
      setOptimisticChecked(checked);
      const result = await toggleSubscriptionUnused(subscriptionId, checked);
      if (!result.success) {
        toast.error(result.error ?? "Failed to update");
        return;
      }
      toast.success(
        checked
          ? `${softwareName} marked as unused`
          : `${softwareName} unmarked as unused`
      );
    });
  }

  return (
    <Switch
      checked={optimisticChecked}
      onCheckedChange={handleChange}
      disabled={isPending}
      aria-label={`Mark ${softwareName} as unused`}
    />
  );
}
