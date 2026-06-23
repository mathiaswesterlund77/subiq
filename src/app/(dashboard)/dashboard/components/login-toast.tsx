"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export function LoginToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const loginStatus = searchParams.get("login");
  const shown = useRef(false);

  useEffect(() => {
    if (loginStatus === "success" && !shown.current) {
      shown.current = true;
      toast.success("Login Successfully");

      // GA4 recommended event — feeds the Analytics "login" key event.
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "login", { method: "email" });
      }

      router.replace("/dashboard");
    }
  }, [loginStatus, router]);

  return null;
}
