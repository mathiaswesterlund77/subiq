"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Subscription } from "@/lib/supabase/types";

interface CsvExportButtonProps {
  subscriptions: Subscription[];
}

export function CsvExportButton({ subscriptions }: CsvExportButtonProps) {
  function handleExport() {
    const headers = [
      "software_name",
      "price",
      "currency",
      "billing_cycle",
      "seats",
      "next_renewal_date",
      "status",
    ];

    const rows = subscriptions.map((sub) =>
      [
        sub.software_name,
        sub.price,
        sub.currency,
        sub.billing_cycle,
        sub.seats,
        sub.next_renewal_date,
        sub.status,
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `subscriptions-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button onClick={handleExport} className="border border-white/15 bg-black text-gray-300 hover:bg-white/10 hover:text-white">
      <Download className="size-4" data-icon="inline-start" />
      Export CSV
    </Button>
  );
}
