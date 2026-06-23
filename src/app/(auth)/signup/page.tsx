import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Sign up for Subiq and start tracking your team's SaaS subscriptions in under 2 minutes. Free plan available, no credit card required.",
  alternates: { canonical: "/signup" },
};

export default function SignupPage() {
  return (
    <>
      <h1 className="sr-only">Create your Subiq account</h1>
      <AuthCard initialMode="signup" />
    </>
  );
}
