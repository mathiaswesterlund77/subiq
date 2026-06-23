"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { login, signup, resendVerificationEmail } from "@/app/(auth)/actions";
import { PasswordInput } from "@/components/password-input";
import { GTAG_CONVERSION_ID } from "@/lib/gtag";
import styles from "./auth-card.module.css";

type AuthMode = "login" | "signup";

const URL_ERRORS: Record<string, string> = {
  no_profile: "Account setup incomplete. Please sign up again.",
  no_workspace: "Workspace not found. Please sign up again.",
  auth_callback_failed: "Email confirmation failed. Please try again.",
  verify_used: "Link is already Used. Request for a New link below.",
};

function loginAction(
  _prev: { error?: string; code?: "EMAIL_NOT_CONFIRMED"; email?: string } | null,
  formData: FormData
) {
  return login(formData);
}
function signupAction(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  return signup(formData);
}
function resendAction(
  _prev: { success?: boolean } | null,
  formData: FormData
) {
  return resendVerificationEmail(formData);
}

const inputClass =
  "w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/35 outline-none transition-all focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/40";

const submitClass =
  "mt-5 inline-flex w-full items-center justify-center rounded-full bg-yellow-400 px-8 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#1a1200] shadow-[0_10px_25px_-8px_rgba(232,181,40,0.5)] ring-1 ring-yellow-400 transition-all hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-[0_14px_30px_-8px_rgba(232,181,40,0.6)] disabled:translate-y-0 disabled:opacity-60";

const overlayPillClass =
  "mt-2 inline-flex items-center justify-center rounded-full border-2 border-[#1a1200] px-10 py-2.5 text-sm font-semibold uppercase tracking-[0.1em] text-[#1a1200] transition-colors hover:bg-[#1a1200] hover:text-yellow-400";

function SignInPane() {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const [resendState, resendFormAction, resendPending] = useActionState(
    resendAction,
    null
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlError = searchParams.get("error");
  const verified = searchParams.get("verified");
  const loggedOut = searchParams.get("logged_out");
  const tokenHash = searchParams.get("token_hash");
  const tokenType = searchParams.get("type");
  const isVerifyingToken = Boolean(tokenHash && tokenType);
  const toastShown = useRef(false);
  const verifiedToastShown = useRef(false);
  const resendToastShown = useRef(false);

  useEffect(() => {
    if (!isVerifyingToken) return;
    window.location.replace(
      `/auth/verify?token_hash=${encodeURIComponent(tokenHash!)}&type=${encodeURIComponent(tokenType!)}`
    );
  }, [isVerifyingToken, tokenHash, tokenType]);

  useEffect(() => {
    if (loggedOut === "true" && !toastShown.current) {
      toastShown.current = true;
      toast.success("Logout Successfully");
    }
  }, [loggedOut]);

  useEffect(() => {
    if (verified === "true" && !verifiedToastShown.current) {
      verifiedToastShown.current = true;
      toast.success("Email verified. Please sign in.");

      const transactionId = searchParams.get("conv_id");
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "conversion", {
          send_to: GTAG_CONVERSION_ID,
          value: 1.0,
          currency: "USD",
          ...(transactionId ? { transaction_id: transactionId } : {}),
        });
      }

      const url = new URL(window.location.href);
      url.searchParams.delete("verified");
      url.searchParams.delete("conv_id");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [verified, router, searchParams]);

  useEffect(() => {
    if (resendState?.success && !resendToastShown.current) {
      resendToastShown.current = true;
      toast.success("If an account exists, a new verification email has been sent.");
    }
  }, [resendState]);

  const unconfirmed = state?.code === "EMAIL_NOT_CONFIRMED";

  if (isVerifyingToken) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 sm:p-10">
        <div className="w-full max-w-[340px] text-center">
          <h2 className="font-display text-[26px] font-extrabold tracking-tight text-white">
            Verifying your email…
          </h2>
          <p className="mt-3 text-[13px] text-white/45">
            Hold on a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 sm:p-10">
      <div className="w-full max-w-[340px]">
        <h2 className="text-center font-display text-[26px] font-extrabold tracking-tight text-white">
          Sign In
        </h2>
        <p className="mt-3 text-center text-[13px] text-white/45">
          Sign in to your account to continue.
        </p>

        <form action={formAction} className="mt-6 space-y-3">
          {unconfirmed ? (
            <div
              role="alert"
              className="rounded-lg border border-yellow-400/20 bg-yellow-400/10 p-3 text-sm text-yellow-200"
            >
              <p className="font-semibold">Please verify your email</p>
              <p className="mt-1 text-yellow-100/80">
                We sent a verification link to{" "}
                <span className="font-medium text-yellow-100">{state?.email}</span>.
                Click the link in your inbox, then sign in.
              </p>
            </div>
          ) : (
            (state?.error || urlError) && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
              >
                {state?.error || (urlError && URL_ERRORS[urlError]) || urlError}
              </div>
            )
          )}

          <input
            id="signin_email"
            name="email"
            type="email"
            placeholder="Email Address"
            required
            className={inputClass}
          />
          <PasswordInput
            id="signin_password"
            name="password"
            placeholder="Password"
            required
          />

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-[12px] text-white/45 transition-colors hover:text-yellow-400"
            >
              Forgot your password?
            </Link>
          </div>

          <button type="submit" disabled={pending} className={submitClass}>
            {pending ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {unconfirmed && (
          <form action={resendFormAction} className="mt-3 text-center">
            <input type="hidden" name="email" value={state?.email ?? ""} />
            <button
              type="submit"
              disabled={resendPending}
              className="text-[12px] font-semibold uppercase tracking-[0.1em] text-yellow-300 underline-offset-2 hover:underline disabled:opacity-60"
            >
              {resendPending ? "Sending..." : "Resend verification email"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function SignUpPane() {
  const [state, formAction, pending] = useActionState(signupAction, null);

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 sm:p-10">
      <div className="w-full max-w-[340px]">
        <h2 className="text-center font-display text-[26px] font-extrabold tracking-tight text-white">
          Create Account
        </h2>
        <p className="mt-3 text-center text-[13px] text-white/45">
          Get started with Subiq today.
        </p>

        {state?.success ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm">
              <div className="flex items-center gap-2 text-yellow-400">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-semibold">Check your email to confirm</p>
              </div>
              <p className="mt-2 text-white/60">
                We&apos;ve sent a confirmation link to your email address.
                Click the link to activate your account.
              </p>
            </div>
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

            <input
              id="signup_full_name"
              name="full_name"
              type="text"
              placeholder="Full Name"
              required
              className={inputClass}
            />
            <input
              id="signup_company_name"
              name="company_name"
              type="text"
              placeholder="Company Name"
              required
              className={inputClass}
            />
            <input
              id="signup_email"
              name="email"
              type="email"
              placeholder="Email Address"
              required
              className={inputClass}
            />
            <PasswordInput
              id="signup_password"
              name="password"
              placeholder="Password"
              required
              minLength={6}
            />

            <button type="submit" disabled={pending} className={submitClass}>
              {pending ? "Creating..." : "Sign Up"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function OverlayContent({
  title,
  body,
  cta,
  onClick,
}: {
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <div className="relative flex max-w-[280px] flex-col items-center gap-6 px-8 text-center text-[#1a1200]">
      <h2 className="font-display text-[30px] font-extrabold tracking-tight">
        {title}
      </h2>
      <p className="text-[14px] leading-[1.65] text-[#1a1200]/75">{body}</p>
      <button type="button" onClick={onClick} className={overlayPillClass}>
        {cta}
      </button>
    </div>
  );
}

function AuthCardInner({ initialMode }: { initialMode: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const isSignup = mode === "signup";
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    const target = isSignup ? "/signup" : "/login";
    if (pathname !== target) {
      router.replace(target, { scroll: false });
    }
  }, [isSignup, pathname, router]);

  return (
    <div
      className={`${styles.shell} ${isSignup ? styles.signupActive : ""}`}
    >
      <div
        className={`${styles.pane} ${styles.signinPane}`}
        inert={isSignup}
      >
        <SignInPane />
      </div>
      <div
        className={`${styles.pane} ${styles.signupPane}`}
        inert={!isSignup}
      >
        <SignUpPane />
      </div>

      <div className={styles.overlayTrack}>
        <div className={styles.overlay}>
          <div className={styles.overlayBlobA} />
          <div className={styles.overlayBlobB} />

          <div className={`${styles.overlayPane} ${styles.overlayLeft}`}>
            <OverlayContent
              title="Welcome Back!"
              body="To keep connected with us please sign in with your credentials."
              cta="Sign In"
              onClick={() => setMode("login")}
            />
          </div>

          <div className={`${styles.overlayPane} ${styles.overlayRight}`}>
            <OverlayContent
              title="Hello, Friend!"
              body="New to Subiq? Create an account and start tracking your team's SaaS in under 2 minutes."
              cta="Sign Up"
              onClick={() => setMode("signup")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthCard({ initialMode }: { initialMode: AuthMode }) {
  return (
    <Suspense>
      <AuthCardInner initialMode={initialMode} />
    </Suspense>
  );
}
