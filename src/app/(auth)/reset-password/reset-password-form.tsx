"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword } from "../actions";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PasswordInput } from "@/components/password-input";

function resetPasswordAction(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  return resetPassword(formData);
}

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    resetPasswordAction,
    null
  );

  return (
    <div className="grid w-full max-w-[920px] overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#111110] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] md:grid-cols-2">
      <div className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-yellow-300 to-yellow-500 p-10 text-center text-[#1a1200] md:py-16">
        <div className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-white/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 size-72 rounded-full bg-black/10 blur-3xl" />
        <div className="relative flex max-w-[280px] flex-col items-center gap-6">
          <h2 className="font-display text-[30px] font-extrabold tracking-tight">
            Almost There!
          </h2>
          <p className="text-[14px] leading-[1.65] text-[#1a1200]/75">
            Choose a new password to secure your account. Make it a good one
            this time — we won&apos;t judge.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-8 sm:p-10">
        <div className="w-full max-w-[340px]">
          <h1 className="text-center font-display text-[26px] font-extrabold tracking-tight text-white">
            Set New Password
          </h1>
          <p className="mt-3 text-center text-[13px] text-white/45">
            Enter your new password below.
          </p>

          {state?.success ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm">
                <div className="flex items-center gap-2 text-yellow-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="font-semibold">Password updated</p>
                </div>
                <p className="mt-2 text-white/60">
                  Your password has been reset successfully. You can now sign
                  in with your new password.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-yellow-400 transition-colors hover:text-yellow-300"
              >
                Sign in <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <form action={formAction} className="mt-6 space-y-3">
              {state?.error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
                >
                  {state.error}
                </div>
              )}

              <PasswordInput
                id="password"
                name="password"
                placeholder="New Password"
                required
                minLength={6}
              />

              <PasswordInput
                id="confirm_password"
                name="confirm_password"
                placeholder="Confirm Password"
                required
                minLength={6}
              />

              <button
                type="submit"
                disabled={pending}
                className="!mt-5 inline-flex w-full items-center justify-center rounded-full bg-yellow-400 px-8 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#1a1200] shadow-[0_10px_25px_-8px_rgba(232,181,40,0.5)] ring-1 ring-yellow-400 transition-all hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-[0_14px_30px_-8px_rgba(232,181,40,0.6)] disabled:translate-y-0 disabled:opacity-60"
              >
                {pending ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
