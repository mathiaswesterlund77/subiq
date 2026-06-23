import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your Subiq password. Enter your email to receive a secure reset link.",
  alternates: { canonical: "/forgot-password" },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
