"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id: string;
  name: string;
  placeholder: string;
  required?: boolean;
  minLength?: number;
  className?: string;
}

const DEFAULT_CLASSNAME =
  "w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-4 py-3 pr-10 text-sm text-white placeholder-white/35 outline-none transition-all focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/40";

export function PasswordInput({
  id,
  name,
  placeholder,
  required,
  minLength,
  className,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className={className ?? DEFAULT_CLASSNAME}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 transition-colors hover:text-yellow-400"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
