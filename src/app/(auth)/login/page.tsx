import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Subiq account to manage your SaaS subscriptions and track software costs.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <>
      <h1 className="sr-only">Sign in to Subiq</h1>
      <AuthCard initialMode="login" />
    </>
  );
}
