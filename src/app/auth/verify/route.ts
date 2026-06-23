import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (!token_hash || !type) {
    return NextResponse.redirect(`${origin}/login?error=verify_used`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=verify_used`);
  }

  const userId = data.user?.id;

  // NOTE: Do NOT set signup_conversion_tracked here — that flag must stay
  // false until the client-side SignupConversion component on the dashboard
  // has actually fired the GA4 sign_up + Google Ads conversion events.
  // Setting it prematurely prevents the gtag events from ever triggering.

  const target = new URL("/login", origin);
  target.searchParams.set("verified", "true");
  if (userId) target.searchParams.set("conv_id", userId);

  const response = NextResponse.redirect(target);
  const cookieStore = await cookies();
  for (const cookie of cookieStore.getAll()) {
    if (cookie.name.startsWith("sb-")) {
      response.cookies.delete(cookie.name);
    }
  }
  return response;
}
