"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Persist that the Google Ads signup conversion has fired for the current user,
 * so it never fires again on later logins. Called by <SignupConversion /> right
 * after gtag emits the event. Guarded by the `signup_conversion_tracked = false`
 * match so concurrent calls flip the flag at most once.
 */
export async function markSignupConversionTracked() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const admin = createAdminClient();
  await admin
    .from("profiles")
    .update({ signup_conversion_tracked: true })
    .eq("id", user.id)
    .eq("signup_conversion_tracked", false);
}
