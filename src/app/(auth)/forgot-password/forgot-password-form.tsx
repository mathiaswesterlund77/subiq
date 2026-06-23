"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPassword } from "../actions";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

function forgotPasswordAction(
  _prevState: { success?: boolean } | null,
  formData: FormData
) {
  return forgotPassword(formData);
}

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPasswordAction,
    null
  );

  return (
    <div className="grid w-full max-w-[920px] overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#111110] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] md:grid-cols-2">
      <div className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-yellow-300 to-yellow-500 p-10 text-center text-[#1a1200] md:py-16">
        <div className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-white/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full bg-black/10 blur-3xl" />
        <div className="relative flex max-w-[280px] flex-col items-center gap-6">
          <h2 className="font-display text-[30px] font-extrabold tracking-tight">
            Forgot it?
          </h2>
          <p className="text-[14px] leading-[1.65] text-[#1a1200]/75">
            Happens to the best of us. Enter your email and we&apos;ll send you
            a link to reset your password.
          </p>
          <Link
            href="/login"
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#1a1200] px-10 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-[#1a1200] transition-colors hover:bg-[#1a1200] hover:text-yellow-400"
          >
            <ArrowLeft className="size-4" />
            Sign In
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-8 sm:p-10">
        <div className="w-full max-w-[340px]">
          <h1 className="text-center font-display text-[26px] font-extrabold tracking-tight text-white">
            Reset Password
          </h1>
          <p className="mt-3 text-center text-[13px] text-white/45">
            We&apos;ll email you a secure link to set a new password.
          </p>

          {state?.success ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm">
                <div className="flex items-center gap-2 text-yellow-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="font-semibold">Check your email</p>
                </div>
                <p className="mt-2 text-white/60">
                  If an account exists with that email, we&apos;ve sent a
                  password reset link. Please check your inbox.
                </p>
              </div>
            </div>
          ) : (
            <form action={formAction} className="mt-6 space-y-3">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email Address"
                required
                className="w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-all focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/40"
              />

              <button
                type="submit"
                disabled={pending}
                className="!mt-5 inline-flex w-full items-center justify-center rounded-full bg-yellow-400 px-8 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#1a1200] shadow-[0_10px_25px_-8px_rgba(232,181,40,0.5)] ring-1 ring-yellow-400 transition-all hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-[0_14px_30px_-8px_rgba(232,181,40,0.6)] disabled:translate-y-0 disabled:opacity-60"
              >
                {pending ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
