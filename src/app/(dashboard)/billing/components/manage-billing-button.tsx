"use client";

import { useState, useTransition } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

/** Opens the Stripe Billing Portal for managing payment, plan and cancellation. */
export function ManageBillingButton() {
  const [, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  function openPortal() {
    setLoading(true);
    startTransition(async () => {
      try {
        const res = await fetch("/api/billing/portal", { method: "POST" });
        const data = await res.json();
        if (!res.ok || !data.url) {
          throw new Error(data.error ?? "Could not open the billing portal");
        }
        window.location.href = data.url as string;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Could not open the billing portal"
        );
        setLoading(false);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={openPortal}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.07] px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && <Loader2Icon className="size-4 animate-spin" />}
      {loading ? "Opening…" : "Manage billing"}
    </button>
  );
}
