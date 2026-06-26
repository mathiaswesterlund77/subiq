import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Allow up to 60 s on the Hobby plan (default is 10 s).
export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function computeNextRenewal(
  currentRenewalDate: string,
  billingCycle: "monthly" | "yearly"
): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const date = new Date(currentRenewalDate + "T00:00:00");

  while (date < today) {
    if (billingCycle === "monthly") {
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setFullYear(date.getFullYear() + 1);
    }
  }

  return date.toISOString().split("T")[0];
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: subs, error } = await supabase
    .from("subscriptions")
    .select("id, next_renewal_date, billing_cycle")
    .eq("status", "active")
    .lt("next_renewal_date", today);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let updated = 0;
  let errors = 0;

  for (const sub of subs ?? []) {
    const newDate = computeNextRenewal(sub.next_renewal_date, sub.billing_cycle);

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({ next_renewal_date: newDate })
      .eq("id", sub.id);

    if (updateError) {
      errors++;
    } else {
      updated++;
    }
  }

  return NextResponse.json({ updated, errors });
}
