"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GTAG_CONVERSION_ID } from "@/lib/gtag";

interface PurchaseConversion {
  value: number;
  currency: string;
  transactionId: string;
  planName: string;
}

export function CheckoutToast({
  status,
  purchase,
}: {
  status?: string;
  purchase?: PurchaseConversion;
}) {
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (!status || handled.current) return;
    handled.current = true;

    if (status === "success") {
      toast.success("Payment received — your plan will update in a moment.");

      if (purchase && typeof window !== "undefined" && window.gtag) {
        // GA4 recommended event — feeds the Analytics "purchase" key event.
        window.gtag("event", "purchase", {
          transaction_id: purchase.transactionId,
          value: purchase.value,
          currency: purchase.currency,
          items: [{ item_name: purchase.planName, price: purchase.value }],
        });

        // Google Ads conversion — kept alongside the GA4 event for Ads reporting.
        window.gtag("event", "conversion", {
          send_to: GTAG_CONVERSION_ID,
          value: purchase.value,
          currency: purchase.currency,
          transaction_id: purchase.transactionId,
        });
      }
    } else if (status === "cancelled") {
      toast.message("Checkout cancelled.");
    }

    router.replace("/billing");
    router.refresh();
  }, [status, purchase, router]);

  return null;
}
