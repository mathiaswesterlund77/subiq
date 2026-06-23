import type { ReminderFrequency } from "@/lib/supabase/types";

/**
 * Compute the next date a review reminder should be sent.
 *
 * Returns a `YYYY-MM-DD` string. `sendDay` is the day-of-month (1-28, capped
 * by the DB schema so it always exists in every month). The next send is the
 * first occurrence of `sendDay` strictly after `from`:
 *  - monthly:   this month if `sendDay` is still ahead, otherwise next month.
 *  - quarterly: the same, but stepping forward three months at a time.
 */
export function computeNextSendDate(
  frequency: ReminderFrequency,
  sendDay: number,
  from: Date = new Date()
): string {
  const stepMonths = frequency === "quarterly" ? 3 : 1;

  const base = new Date(from);
  base.setHours(0, 0, 0, 0);

  // Candidate: `sendDay` of the current month.
  const candidate = new Date(base.getFullYear(), base.getMonth(), sendDay);

  // Advance until the candidate is strictly after `from`. `sendDay` <= 28 so
  // every month has the day and no month-length rollover can occur.
  while (candidate <= base) {
    candidate.setMonth(candidate.getMonth() + stepMonths);
    candidate.setDate(sendDay);
  }

  return toDateStr(candidate);
}

function toDateStr(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
