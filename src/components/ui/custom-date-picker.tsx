"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDisplay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface CustomDatePickerProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  /** Compact pill style for filter bars */
  variant?: "default" | "pill";
}

export function CustomDatePicker({
  value,
  onChange,
  placeholder = "Select date",
  variant = "default",
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const parsed = value ? new Date(value + "T00:00:00") : null;
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());

  // Reset view when opening
  useEffect(() => {
    if (isOpen) {
      const d = parsed ?? today;
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [isOpen, parsed, today]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function selectDate(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    onChange(toDateStr(d));
    setIsOpen(false);
  }

  function selectToday() {
    onChange(toDateStr(today));
    setIsOpen(false);
  }

  function clear() {
    onChange("");
    setIsOpen(false);
  }

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; current: boolean }[] = [];
  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, current: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true });
  }
  // Next month leading days
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false });
  }

  const todayStr = toDateStr(today);

  const isPill = variant === "pill";

  const triggerClass = isPill
    ? `flex h-8 items-center gap-1.5 rounded-full border pl-2.5 pr-3 text-xs font-medium outline-none transition-all ${
        value
          ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-400"
          : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-white"
      }`
    : `flex h-9 w-full items-center gap-2 rounded-lg border border-white/15 bg-transparent px-3 text-sm outline-none transition-colors hover:border-white/30 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/50 ${
        value ? "text-white" : "text-gray-500"
      }`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={triggerClass}
      >
        <Calendar className={isPill ? "size-3" : "size-4 text-gray-400"} />
        <span className="flex-1 text-left">
          {value ? formatDisplay(value) : placeholder}
        </span>
        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
            className="ml-1 rounded-full p-0.5 transition-colors hover:bg-white/10"
          >
            <X className={isPill ? "size-2.5" : "size-3 text-gray-400"} />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="relative z-10 mt-1 w-full max-w-[280px] rounded-lg border border-white/15 bg-gray-900 p-3 shadow-lg shadow-black/40 sm:absolute sm:z-50 sm:w-[280px]">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-medium text-white">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="mb-1 grid grid-cols-7 gap-0">
            {DAYS.map((d) => (
              <div
                key={d}
                className="py-1 text-center text-xs font-medium text-gray-500"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0">
            {cells.map((cell, i) => {
              const cellDate = cell.current
                ? toDateStr(new Date(viewYear, viewMonth, cell.day))
                : "";
              const isSelected = cell.current && cellDate === value;
              const isToday = cell.current && cellDate === todayStr;

              return (
                <button
                  key={i}
                  type="button"
                  disabled={!cell.current}
                  onClick={() => cell.current && selectDate(cell.day)}
                  className={`relative mx-auto flex size-8 items-center justify-center rounded-md text-xs transition-colors ${
                    !cell.current
                      ? "cursor-default text-gray-700"
                      : isSelected
                        ? "bg-yellow-400 font-semibold text-black"
                        : isToday
                          ? "font-semibold text-yellow-400 ring-1 ring-yellow-400/40"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={clear}
              className="text-xs text-gray-400 transition-colors hover:text-white"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={selectToday}
              className="rounded-md bg-yellow-400/10 px-3 py-1 text-xs font-medium text-yellow-400 transition-colors hover:bg-yellow-400/20"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
