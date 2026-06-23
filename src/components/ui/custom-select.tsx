"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  /** Compact pill style for filter bars */
  variant?: "default" | "pill";
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  variant = "default",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  const triggerClass =
    variant === "pill"
      ? `flex h-8 items-center gap-1.5 rounded-full border pl-3 pr-2 text-xs font-medium outline-none transition-all ${
          value
            ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-400"
            : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white"
        }`
      : "flex h-9 w-full items-center justify-between rounded-lg border border-white/15 bg-transparent px-3 text-sm text-white outline-none transition-colors hover:border-white/30 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/50";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={triggerClass}
      >
        <span>{selected?.label ?? placeholder}</span>
        <ChevronDown
          className={`shrink-0 text-gray-400 transition-transform ${
            variant === "pill" ? "size-3" : "size-4"
          } ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div
          className="no-scrollbar absolute z-50 mt-1 max-h-48 min-w-full overflow-y-auto overscroll-contain rounded-lg border border-white/15 bg-gray-900 shadow-lg shadow-black/40"
          style={{ scrollbarWidth: "none" }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between whitespace-nowrap px-3 py-2 text-sm transition-colors ${
                value === opt.value
                  ? "bg-yellow-400/10 text-yellow-400"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check className="ml-2 size-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
