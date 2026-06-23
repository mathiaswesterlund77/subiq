"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="w-full max-w-[740px] mx-auto">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={item.q}
            className={`border-b border-white/[0.06] ${isOpen ? "open" : ""}`}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left text-[15px] font-medium text-white/85 transition-colors hover:text-white"
            >
              <span>{item.q}</span>
              <Plus
                className={`size-5 shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-45 text-yellow-400" : "text-white/25"
                }`}
              />
            </button>
            <div
              className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="text-sm leading-[1.7] text-white/45">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
