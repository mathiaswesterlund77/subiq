"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { CustomSelect } from "@/components/ui/custom-select";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";

interface FilterBarProps {
  currencies: string[];
  selectedCurrency?: string;
  from?: string;
  to?: string;
}

export function FilterBar({
  currencies,
  selectedCurrency,
  from,
  to,
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/dashboard?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  const hasFilters = selectedCurrency || from || to;
  const activeCount = [selectedCurrency, from, to].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Label */}
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
        <SlidersHorizontal className="size-3.5" />
        Filters
        {activeCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-black">
            {activeCount}
          </span>
        )}
      </div>

      <div className="h-4 w-px bg-white/10" />

      {/* Currency pill */}
      <CustomSelect
        value={selectedCurrency ?? ""}
        onChange={(val) => updateParams("currency", val || null)}
        variant="pill"
        placeholder="Currency"
        options={[
          { value: "", label: "All Currencies" },
          ...currencies.map((c) => ({ value: c, label: c })),
        ]}
      />

      {/* From date pill */}
      <CustomDatePicker
        value={from ?? ""}
        onChange={(val) => updateParams("from", val || null)}
        placeholder="From"
        variant="pill"
      />

      {/* To date pill */}
      <CustomDatePicker
        value={to ?? ""}
        onChange={(val) => updateParams("to", val || null)}
        placeholder="To"
        variant="pill"
      />

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex h-8 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 text-xs text-gray-400 transition-colors hover:border-white/20 hover:text-white"
        >
          <X className="size-3" />
          Clear
        </button>
      )}
    </div>
  );
}
