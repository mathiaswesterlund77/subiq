"use client";

import { useEffect, useState } from "react";

type Part = { text: string; className?: string };

interface TypewriterHeadlineProps {
  parts: Part[];
  typeMs?: number;
  eraseMs?: number;
  holdAfterTypedMs?: number;
  holdAfterErasedMs?: number;
  startDelayMs?: number;
  className?: string;
}

function buildAnimatedParts(parts: Part[], revealed: number) {
  const result: { key: number; className?: string; visible: string }[] = [];
  let offset = 0;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    const remaining = Math.max(0, revealed - offset);
    result.push({
      key: i,
      className: p.className,
      visible: p.text.slice(0, remaining),
    });
    offset += p.text.length;
  }
  return result;
}

export function TypewriterHeadline({
  parts,
  typeMs = 45,
  eraseMs = 25,
  holdAfterTypedMs = 1800,
  holdAfterErasedMs = 450,
  startDelayMs = 250,
  className = "",
}: TypewriterHeadlineProps) {
  const fullText = parts.map((p) => p.text).join("");
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let phase: "typing" | "erasing" = "typing";
    let current = 0;

    const tick = () => {
      if (reducedMotion) {
        setRevealed(fullText.length);
        return;
      }

      if (phase === "typing") {
        current += 1;
        setRevealed(current);
        if (current >= fullText.length) {
          phase = "erasing";
          timer = setTimeout(tick, holdAfterTypedMs);
        } else {
          timer = setTimeout(tick, typeMs);
        }
      } else {
        current -= 1;
        setRevealed(current);
        if (current <= 0) {
          phase = "typing";
          timer = setTimeout(tick, holdAfterErasedMs);
        } else {
          timer = setTimeout(tick, eraseMs);
        }
      }
    };

    timer = setTimeout(tick, startDelayMs);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [
    fullText.length,
    typeMs,
    eraseMs,
    holdAfterTypedMs,
    holdAfterErasedMs,
    startDelayMs,
  ]);

  const animated = buildAnimatedParts(parts, revealed);

  return (
    <h1 className={`relative ${className}`} aria-label={fullText}>
      {/* Layout placeholder — reserves full size, prevents layout shift */}
      <span aria-hidden="true" className="block opacity-0">
        {parts.map((p, i) => (
          <span key={i} className={p.className}>
            {p.text}
          </span>
        ))}
      </span>
      {/* Animated overlay */}
      <span aria-hidden="true" className="absolute inset-0 block">
        {animated.map((p) => (
          <span key={p.key} className={p.className}>
            {p.visible}
          </span>
        ))}
        <span className="tw-caret" />
      </span>
    </h1>
  );
}
