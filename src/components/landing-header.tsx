"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

const navTabs = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Resources", href: "#resources" },
] as const;

export function LandingHeader() {
  const [activeTab, setActiveTab] = useState("Product");
  const navRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Update sliding indicator position whenever activeTab changes
  useEffect(() => {
    const el = tabRefs.current.get(activeTab);
    const nav = navRef.current;
    if (el && nav) {
      const navRect = nav.getBoundingClientRect();
      const tabRect = el.getBoundingClientRect();
      setIndicator({
        left: tabRect.left - navRect.left,
        width: tabRect.width,
      });
    }
  }, [activeTab]);

  // Track which section is visible (only when not click-scrolling)
  useEffect(() => {
    const sectionIds = navTabs.map((t) => t.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const match = navTabs.find(
              (t) => t.href === `#${entry.target.id}`
            );
            if (match) setActiveTab(match.label);
          }
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  // Smooth scroll on click — lock observer until scroll settles
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, label: string, href: string) => {
      e.preventDefault();
      isScrollingRef.current = true;
      setActiveTab(label);

      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);

      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }

      // Re-enable observer after scroll finishes
      const unlock = () => {
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = setTimeout(() => {
          isScrollingRef.current = false;
          window.removeEventListener("scroll", resetTimer);
        }, 150);
      };
      const resetTimer = () => unlock();
      window.addEventListener("scroll", resetTimer);
      unlock();
    },
    []
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
            setActiveTab("Product");
          }}
          aria-label="SUBIQ — home"
          className="flex items-center"
        >
          <Logo height={22} priority />
        </Link>
        <nav ref={navRef} className="relative hidden items-center gap-8 md:flex">
          {navTabs.map((tab) => (
            <a
              key={tab.label}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.label, el);
              }}
              href={tab.href}
              onClick={(e) => handleClick(e, tab.label, tab.href)}
              className={`relative text-sm transition-colors duration-200 ${
                activeTab === tab.label
                  ? "font-medium text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </a>
          ))}
          {/* Sliding indicator */}
          <span
            className="pointer-events-none absolute -bottom-[21px] h-[2px] bg-yellow-400 transition-all duration-300 ease-in-out"
            style={{ left: indicator.left, width: indicator.width }}
          />
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-yellow-400 px-5 text-sm font-semibold text-yellow-400 transition-all duration-200 hover:bg-yellow-400 hover:text-black hover:shadow-[0_0_18px_rgba(250,204,21,0.45)] hover:scale-[1.03]"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
