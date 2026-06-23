import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  Flag,
  LayoutDashboard,
  LayoutGrid,
  Plus,
  Search,
  Settings,
  Tag,
  Users,
  UserX,
  Zap,
} from "lucide-react";
import { LandingHeader } from "@/components/landing-header";
import { PricingSection } from "@/components/pricing-section";
import { FaqAccordion } from "@/components/faq-accordion";
import { TypewriterHeadline } from "@/components/typewriter-headline";
import { LegalLinks, FooterNavLinks } from "@/components/legal-modal";
import { Logo } from "@/components/logo";

export const metadata: Metadata = {
  title: {
    absolute: "Subiq — SaaS Subscription Management Software for Small Teams",
  },
  description:
    "Subiq is a SaaS management platform that helps small teams track subscriptions, manage software spend, get renewal alerts, and reduce SaaS costs. Free plan available.",
  alternates: { canonical: "/" },
  keywords: [
    "subscription management software",
    "saas subscription management",
    "saas management platform",
    "saas spend management",
    "subscription tracker",
    "saas cost management",
    "manage saas subscriptions",
    "software license tracking",
  ],
  openGraph: {
    title: "Subiq — SaaS Subscription Management Software for Small Teams",
    description:
      "Track subscriptions, manage SaaS spend, and reduce software costs. Free plan available.",
    url: "https://www.subiq.io",
    siteName: "Subiq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Subiq — SaaS Subscription Management Software for Small Teams",
    description:
      "Track subscriptions, manage SaaS spend, and reduce software costs. Free plan available.",
  },
};

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-5 inline-block rounded-full border border-white/[0.1] bg-white/[0.06] px-[18px] py-1.5 text-[12px] font-medium uppercase tracking-[0.1em] text-gray-400">
      {children}
    </span>
  );
}

function SectionDivider() {
  return (
    <div className="mx-auto h-px w-full max-w-[720px] bg-white/[0.06]" />
  );
}

const SOLUTION_CARDS = [
  {
    icon: Bell,
    title: "Renewal alerts before you get charged",
    desc: "Get notified days before any subscription renews. Enough time to cancel, downgrade, or renegotiate — instead of finding out from your bank statement.",
    tag: "Automated reminders",
  },
  {
    icon: Users,
    title: "Invite your team. Send review requests.",
    desc: "Add team members and schedule automatic check-ins — monthly or quarterly. Everyone confirms which tools they actually use, so nothing slips through the cracks.",
    tag: "Monthly & quarterly reviews",
  },
  {
    icon: Tag,
    title: "Mark tools as active, unused, or cancelled",
    desc: "Your team tags every subscription with a status. Subiq calculates your possible savings automatically — so you see exactly how much you'd save by cutting the dead weight.",
    tag: "Possible savings calculated",
  },
];

const FEATURE_CARDS = [
  {
    icon: LayoutGrid,
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.12)",
    title: "Full spend dashboard",
    desc: "Your subscription tracking tool in one view. See total monthly and yearly SaaS costs, broken down by each tool, updated as you go. No formulas, no manual updates.",
  },
  {
    icon: Calendar,
    color: "#E8B528",
    bg: "rgba(232,181,40,0.12)",
    title: "Renewal calendar & alerts",
    desc: "Every renewal on a visual timeline. Set alerts days or weeks before a charge hits — so you decide what stays, not your credit card.",
  },
  {
    icon: Users,
    color: "#a78bfa",
    bg: "rgba(168,139,250,0.12)",
    title: "Team invites & roles",
    desc: "Add members from the dashboard. Everyone sees their own tools, admins see everything. One shared source of truth instead of scattered spreadsheets.",
  },
  {
    icon: CheckCircle2,
    color: "#34d399",
    bg: "rgba(52,211,153,0.12)",
    title: "Automated review requests",
    desc: "Schedule monthly or quarterly check-ins. Team members confirm what they use in one click. No chasing, no meetings, no guessing.",
  },
  {
    icon: Flag,
    color: "#f87171",
    bg: "rgba(248,113,113,0.12)",
    title: "Active, unused, or cancelled",
    desc: "Tag every subscription with a status for complete SaaS license management. Filter by unused to see dead weight instantly. Your dashboard adapts to show what matters right now.",
  },
  {
    icon: Zap,
    color: "#fbbf24",
    bg: "rgba(251,191,36,0.12)",
    title: "Possible savings, auto-calculated",
    desc: "The moment a tool is flagged unused, Subiq calculates your savings for instant SaaS cost optimization. See your total possible savings live — the number your team needs to make the call.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a08] text-white">
      <LandingHeader />

      {/* ── HERO ── */}
      <section
        id="product"
        className="relative overflow-hidden px-4 pb-20 pt-[100px] scroll-mt-16"
      >
        <div className="relative mx-auto max-w-[1160px]">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left */}
            <div className="flex flex-col gap-7">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.07] px-4 py-1.5 text-[13px] text-white/70">
                SaaS Subscription Management Software
              </span>
              <TypewriterHeadline
                className="font-display text-[clamp(36px,5vw,56px)] font-extrabold leading-[1.1] tracking-tight"
                holdAfterTypedMs={1000}
                holdAfterErasedMs={0}
                parts={[
                  { text: "You're probably paying for " },
                  { text: "3 tools nobody uses.", className: "text-yellow-400" },
                ]}
              />
              <p className="max-w-[420px] text-[17px] leading-[1.7] text-white/60">
                Small teams bleed money on forgotten renewals and unused
                software. Subiq is the subscription management software that
                gives your team one place to track every tool, manage SaaS
                spend, and finally see where the money actually goes.
              </p>
              <div className="flex flex-col gap-3.5">
                <Link
                  href="/signup"
                  className="inline-block w-fit rounded-full bg-yellow-400 px-8 py-3.5 text-[16px] font-medium text-[#1a1200] ring-1 ring-yellow-400 transition-all hover:-translate-y-0.5 hover:bg-black hover:text-yellow-400"
                >
                  Start tracking for free — no credit card needed
                </Link>
                <span className="text-[13px] text-white/40">
                  Free up to 3 tools &nbsp;·&nbsp; Set up in 2 minutes
                </span>
              </div>
            </div>

            {/* Right – Dashboard mockup */}
            <div className="relative" style={{ perspective: "1200px" }}>
              <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-yellow-500/25 via-yellow-600/10 to-transparent blur-2xl" />
              <div
                className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#111110] p-3 shadow-[0_40px_80px_rgba(0,0,0,0.6)] sm:p-5"
                style={{
                  transform: "perspective(1000px) rotateY(-4deg) rotateX(2deg)",
                }}
              >
                {/* Header */}
                <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
                  <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                    <Logo className="h-3 w-auto sm:h-[14px]" />
                    <span className="truncate text-[11px] text-white/40 sm:text-[13px]">Dashboard</span>
                  </div>
                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-2 py-1 text-[10px] font-medium text-white sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[12px]"
                  >
                    <Plus className="size-3" />
                    <span className="sm:hidden">Add</span>
                    <span className="hidden sm:inline">Add Subscription</span>
                  </button>
                </div>

                <div className="grid grid-cols-[76px_1fr] gap-2 sm:grid-cols-[120px_1fr] sm:gap-3.5">
                  {/* Sidebar */}
                  <div className="flex flex-col gap-0.5 pt-1 sm:gap-1">
                    {[
                      { icon: LayoutDashboard, label: "Dashboard", active: true },
                      { icon: CircleDollarSign, label: "Subscriptions" },
                      { icon: Calendar, label: "Renewals" },
                      { icon: LayoutGrid, label: "Analytics" },
                      { icon: Settings, label: "Settings" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[10px] sm:gap-2 sm:px-2.5 sm:py-1.5 sm:text-[12px] ${
                          item.active
                            ? "bg-white/[0.08] text-white"
                            : "text-white/45"
                        }`}
                      >
                        <item.icon className="size-3 shrink-0 sm:size-3.5" />
                        <span className="truncate">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Main */}
                  <div className="flex min-w-0 flex-col gap-2 sm:gap-3">
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      {[
                        {
                          label: "Monthly Spend",
                          value: "$842",
                          badge: "+12%",
                          good: true,
                        },
                        { label: "Yearly Cost", value: "$10,104" },
                        {
                          label: "Active Tools",
                          value: "18",
                          badge: "+2 unused",
                          good: false,
                        },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="min-w-0 rounded-[8px] border border-white/[0.07] bg-[#1a1a18] px-1.5 py-1.5 sm:rounded-[10px] sm:px-3 sm:py-2.5"
                        >
                          <p className="truncate text-[8px] uppercase tracking-[0.08em] text-white/40 sm:text-[9px]">
                            {s.label}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1 gap-y-0.5 sm:mt-1 sm:gap-1.5">
                            <span className="font-display text-[13px] font-bold text-white sm:text-[18px]">
                              {s.value}
                            </span>
                            {s.badge && (
                              <span
                                className={`rounded px-1 py-0.5 text-[7px] font-semibold sm:px-1.5 sm:text-[9px] ${
                                  s.good
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-yellow-400/20 text-yellow-400"
                                }`}
                              >
                                {s.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      <div className="min-w-0 rounded-[8px] border border-white/[0.07] bg-[#1a1a18] px-2 py-1.5 sm:rounded-[10px] sm:px-3 sm:py-2.5">
                        <p className="mb-1.5 text-[9px] font-medium text-white/70 sm:mb-2 sm:text-[10px]">
                          Upcoming Renewals
                        </p>
                        <div className="space-y-0.5 sm:space-y-1">
                          {[
                            { name: "Figma", price: "$45/mo", date: "Apr 12", color: "#a78bfa" },
                            { name: "Slack", price: "$32/mo", date: "Apr 18", color: "#f87171" },
                            { name: "Notion", price: "$96/yr", date: "May 1", color: "#60a5fa" },
                            { name: "AWS", price: "$380/mo", date: "May 5", color: "#34d399" },
                          ].map((r, i, arr) => (
                            <div
                              key={r.name}
                              className={`flex items-center justify-between gap-1 py-0.5 text-[8px] sm:py-1 sm:text-[10px] ${
                                i < arr.length - 1
                                  ? "border-b border-white/[0.05]"
                                  : ""
                              }`}
                            >
                              <span className="flex min-w-0 items-center gap-1 text-white/80 sm:gap-1.5">
                                <span
                                  className="size-1 shrink-0 rounded-full sm:size-1.5"
                                  style={{ backgroundColor: r.color }}
                                />
                                <span className="truncate">{r.name}</span>
                              </span>
                              <span className="shrink-0 text-white/55">{r.price}</span>
                              <span className="hidden shrink-0 text-white/35 sm:inline">{r.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="min-w-0 rounded-[8px] border border-white/[0.07] bg-[#1a1a18] px-2 py-1.5 sm:rounded-[10px] sm:px-3 sm:py-2.5">
                        <p className="mb-1.5 text-[9px] font-medium text-white/70 sm:mb-2 sm:text-[10px]">
                          Cost by Tool
                        </p>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <svg className="size-[44px] shrink-0 sm:size-[72px]" viewBox="0 0 72 72">
                            <circle cx="36" cy="36" r="26" fill="none" stroke="#34d399" strokeWidth="12" strokeDasharray="65 99" strokeDashoffset="0" />
                            <circle cx="36" cy="36" r="26" fill="none" stroke="#a78bfa" strokeWidth="12" strokeDasharray="33 131" strokeDashoffset="-65" />
                            <circle cx="36" cy="36" r="26" fill="none" stroke="#f87171" strokeWidth="12" strokeDasharray="14 150" strokeDashoffset="-98" />
                            <circle cx="36" cy="36" r="26" fill="none" stroke="#60a5fa" strokeWidth="12" strokeDasharray="6 158" strokeDashoffset="-112" />
                            <circle cx="36" cy="36" r="22" fill="#1a1a18" />
                          </svg>
                          <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-[8px] sm:gap-1 sm:text-[10px]">
                            {[
                              { label: "AWS", value: "$380", color: "#34d399" },
                              { label: "Figma", value: "$96", color: "#a78bfa" },
                              { label: "Slack", value: "$32", color: "#f87171" },
                              { label: "Notion", value: "$24", color: "#60a5fa" },
                            ].map((l) => (
                              <div
                                key={l.label}
                                className="flex items-center justify-between gap-1 text-white/60 sm:gap-1.5"
                              >
                                <span className="flex min-w-0 items-center gap-1 sm:gap-1.5">
                                  <span
                                    className="size-1 shrink-0 rounded-full sm:size-1.5"
                                    style={{ backgroundColor: l.color }}
                                  />
                                  <span className="truncate">{l.label}</span>
                                </span>
                                <span className="shrink-0 font-medium text-white/85">
                                  {l.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="relative px-4 pb-20">
        <div className="mx-auto flex max-w-[1160px] flex-col items-center gap-7">
          <p className="text-[15px] text-white/50">
            <strong className="font-medium text-yellow-400">
              Built for small teams
            </strong>{" "}
            tired of SaaS surprises
          </p>
          <div className="flex w-full max-w-[680px] flex-col items-center gap-4 rounded-[18px] border border-white/[0.09] bg-[#141412] px-6 py-10 text-center sm:px-12">
            <p className="font-display text-[26px] font-bold text-white">
              One place for{" "}
              <span className="text-yellow-400">every SaaS subscription</span>
            </p>
            <p className="text-[15px] leading-[1.5] text-white/40">
              so nothing slips through the cracks
            </p>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="relative px-4 py-20">
        <div className="mx-auto flex max-w-[1160px] flex-col items-center gap-12">
          <div className="flex max-w-[680px] flex-col items-center gap-5 text-center">
            <SectionBadge>The Problem</SectionBadge>
            <h2 className="font-display text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.15] tracking-tight">
              Nobody on your team knows{" "}
              <span className="text-yellow-400">
                what you&apos;re actually paying for.
              </span>
            </h2>
            <p className="max-w-[600px] text-base leading-[1.7] text-white/50">
              Small teams add tools fast and cancel them slow. Without proper
              SaaS cost management, subscriptions auto-renew in the background
              and software spend spirals. Nobody reviews what&apos;s still being
              used. And by the end of the year, you&apos;ve wasted thousands —
              without anyone noticing.
            </p>
          </div>
          <div className="grid w-full gap-4 sm:grid-cols-3">
            {[
              {
                icon: CircleDollarSign,
                title: "Renewals Hit on Autopilot",
                desc: "Annual renewals slip through because no one gets a heads-up. Without SaaS renewal management, you're charged thousands before anyone notices — and by then it's too late to cancel or renegotiate.",
              },
              {
                icon: Search,
                title: "No One Owns the Stack",
                desc: "Different people sign up for different tools, but there's no software license tracking in place. It all lives in inboxes, spreadsheets, and someone's memory. Nobody has a full picture of what the team is paying for — or why.",
              },
              {
                icon: UserX,
                title: "Ghost Seats & Dead Tools",
                desc: "Half the team stopped using a tool months ago, but nobody ever asked. Without SaaS license management, you're paying full price for 10 seats when only 3 are active — and no one tracks the difference.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="flex flex-col gap-3.5 rounded-2xl border border-white/[0.08] p-7"
                style={{
                  background:
                    "linear-gradient(170deg, rgba(120,30,30,0.15) 0%, rgba(20,20,18,1) 60%)",
                }}
              >
                <card.icon className="size-7 text-[#e85c5c]" strokeWidth={1.5} />
                <h3 className="font-display text-[18px] font-bold text-[#e85c5c]">
                  {card.title}
                </h3>
                <p className="text-sm leading-[1.65] text-white/50">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOLUTION ── */}
      <section className="relative px-4 py-20">
        <div className="mx-auto flex max-w-[1160px] flex-col items-center gap-12">
          <div className="flex max-w-[640px] flex-col items-center gap-5 text-center">
            <SectionBadge>The Solution</SectionBadge>
            <h2 className="font-display text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.15] tracking-tight">
              Add your tools. Loop in your team.{" "}
              <span className="text-yellow-400">Cut what nobody uses.</span>
            </h2>
            <p className="max-w-[560px] text-base leading-[1.7] text-white/50">
              Subiq is the SaaS management platform that replaces your messy
              spreadsheets with one dashboard to manage all your subscriptions.
              Invite members, send automatic review requests each month or
              quarter, and let your team flag what&apos;s active, unused, or
              ready to cancel — so you always know where to optimize your SaaS
              spend.
            </p>
          </div>

          {/* Solution feature cards */}
          <div className="grid w-full gap-4 sm:grid-cols-3">
            {SOLUTION_CARDS.map((c) => (
              <div
                key={c.title}
                className="flex flex-col gap-3.5 rounded-2xl border border-white/[0.08] p-7"
                style={{
                  background:
                    "linear-gradient(170deg, rgba(30,90,60,0.15) 0%, rgba(20,20,18,1) 60%)",
                }}
              >
                <c.icon className="size-7 text-emerald-400" strokeWidth={1.5} />
                <h3 className="font-display text-[17px] font-bold text-emerald-400">
                  {c.title}
                </h3>
                <p className="text-sm leading-[1.65] text-white/50">{c.desc}</p>
                <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-400/70">
                  <CheckCircle2 className="size-3" />
                  {c.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── FEATURES ── */}
      <section
        id="features"
        className="relative scroll-mt-16 px-4 py-20"
      >
        <div className="mx-auto flex max-w-[1160px] flex-col items-center gap-12">
          <div className="flex max-w-[640px] flex-col items-center gap-5 text-center">
            <SectionBadge>Features</SectionBadge>
            <h2 className="font-display text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.15] tracking-tight">
              No bloat. Just the features that{" "}
              <span className="text-yellow-400">actually save you money.</span>
            </h2>
            <p className="max-w-[540px] text-base leading-[1.7] text-white/50">
              Every feature in Subiq exists for one reason — to give your team
              full SaaS spend visibility and control over software costs.
              Nothing more, nothing less.
            </p>
          </div>
          <div
            className="marquee-pause-on-hover relative w-full overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
            }}
          >
            <div className="flex w-max gap-4 animate-marquee-x">
              {[...FEATURE_CARDS, ...FEATURE_CARDS].map((f, i) => (
                <div
                  key={`${f.title}-${i}`}
                  aria-hidden={i >= FEATURE_CARDS.length ? "true" : undefined}
                  className="flex w-[300px] shrink-0 flex-col gap-3 rounded-2xl border border-white/[0.07] bg-[#111110] p-6 sm:w-[340px]"
                >
                  <div
                    className="flex size-10 items-center justify-center rounded-[10px]"
                    style={{ backgroundColor: f.bg }}
                  >
                    <f.icon
                      className="size-5"
                      style={{ color: f.color }}
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-display text-base font-bold leading-[1.3]">
                    {f.title}
                  </h3>
                  <p className="text-[13px] leading-[1.65] text-white/45">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── HOW IT WORKS ── */}
      <section className="relative px-4 py-20">
        <div className="mx-auto flex max-w-[1160px] flex-col items-center gap-12">
          <div className="flex max-w-[640px] flex-col items-center gap-5 text-center">
            <SectionBadge>How It Works</SectionBadge>
            <h2 className="font-display text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.15] tracking-tight">
              Set up in 2 minutes.{" "}
              <span className="text-yellow-400">
                Start saving by the end of the week.
              </span>
            </h2>
            <p className="text-base leading-[1.7] text-white/50">
              No integrations, no onboarding calls. Start managing software
              subscriptions in three steps.
            </p>
          </div>
          <div className="relative grid w-full gap-6 sm:grid-cols-3">
            {/* Connecting line */}
            <div
              className="pointer-events-none absolute hidden h-0.5 sm:block"
              style={{
                top: "36px",
                left: "calc(16.66% + 24px)",
                right: "calc(16.66% + 24px)",
                background:
                  "linear-gradient(90deg, rgba(232,181,40,0.4), rgba(232,181,40,0.15))",
              }}
            />
            {[
              {
                step: "1",
                title: "Add your tools",
                desc: "Add subscriptions yourself, import them from a file, or invite your team and let each member add their own. However your team works — Subiq adapts.",
                time: "2 minutes",
              },
              {
                step: "2",
                title: "Get the full picture",
                desc: "Once tools are in, schedule automatic review requests — monthly or quarterly. Team members confirm what they still use in one click. No chasing, no meetings.",
                time: "Runs on autopilot",
              },
              {
                step: "3",
                title: "See what to cut",
                desc: "Tools get tagged as active, unused, or cancelled. Subiq calculates your possible savings automatically. You decide what stays — and what goes.",
                time: "Savings from day one",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="relative flex flex-col items-center gap-5 text-center"
              >
                <div className="relative z-10 flex size-[72px] items-center justify-center rounded-full border-2 border-yellow-400/35 bg-[#141412] font-display text-[28px] font-extrabold text-yellow-400">
                  {s.step}
                </div>
                <div className="flex flex-col gap-2.5">
                  <h3 className="font-display text-lg font-bold">{s.title}</h3>
                  <p className="mx-auto max-w-[300px] text-sm leading-[1.65] text-white/45">
                    {s.desc}
                  </p>
                  <span className="mx-auto inline-flex w-fit items-center rounded-full bg-yellow-400/10 px-3 py-1 text-xs text-yellow-400/70">
                    {s.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* ── COMPARE ── */}
      <section className="relative px-4 py-20">
        <div className="mx-auto flex max-w-[1160px] flex-col items-center gap-12">
          <div className="flex max-w-[640px] flex-col items-center gap-5 text-center">
            <SectionBadge>Compare</SectionBadge>
            <h2 className="font-display text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.15] tracking-tight">
              Your spreadsheet wasn&apos;t built for this.{" "}
              <span className="text-yellow-400">Subiq was.</span>
            </h2>
            <p className="text-base leading-[1.7] text-white/50">
              Most teams start with a spreadsheet. It works — until it
              doesn&apos;t. Here&apos;s what changes when you switch.
            </p>
          </div>
          <div className="w-full max-w-[820px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111110]">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="w-[36%] border-b border-white/[0.08] px-2.5 py-3 text-[11px] font-medium text-white/40 sm:w-[40%] sm:px-6 sm:py-5 sm:text-sm"></th>
                  <th className="w-[32%] border-b border-white/[0.08] px-2.5 py-3 text-[11px] font-medium text-white/40 sm:w-[30%] sm:px-6 sm:py-5 sm:text-sm">
                    Spreadsheets
                  </th>
                  <th className="w-[32%] border-b border-white/[0.08] px-2.5 py-3 font-display text-[12px] font-bold text-yellow-400 sm:w-[30%] sm:px-6 sm:py-5 sm:text-[15px]">
                    Subiq ✦
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Cost overview", "Manual updates", "Real-time dashboard"],
                  ["Renewal reminders", "Hope you remember", "Automated alerts"],
                  ["Team access", "One shared file", "Each member has a login"],
                  [
                    "Roles & permissions",
                    "Everyone can edit everything",
                    "Admin & member roles",
                  ],
                  [
                    "Review process",
                    "Manual Slack/email follow-ups",
                    "Automated review requests",
                  ],
                  [
                    "Review frequency",
                    "Whenever someone remembers",
                    "Monthly or quarterly, on schedule",
                  ],
                  [
                    "Tool status tracking",
                    "No system",
                    "Active, unused, cancelled",
                  ],
                  ["Savings calculation", "Guesswork", "Auto-calculated from status"],
                  ["Import & export", "Copy-paste between files", "File import & export"],
                  ["Renewal calendar", "Dates buried in cells", "Visual timeline"],
                  [
                    "Data accuracy",
                    "Version conflicts, stale rows",
                    "Single source of truth",
                  ],
                  ["Accountability", "Nobody owns it", "Clear ownership per tool"],
                  ["Scales with growth", "Breaks at 20+ tools", "Built for growing teams"],
                  ["Setup time", "Hours of formatting", "Under 2 minutes"],
                  [
                    "Price",
                    '"Free" (costs hours every month)',
                    "Free plan available",
                  ],
                ].map(([feat, them, us]) => (
                  <tr
                    key={feat}
                    className="border-b border-white/[0.04] transition-colors last:border-b-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-2.5 py-2.5 align-top text-[11px] font-medium leading-[1.45] text-white/70 sm:px-6 sm:py-3.5 sm:text-[13px]">
                      {feat}
                    </td>
                    <td className="px-2.5 py-2.5 align-top text-[11px] leading-[1.45] text-red-400/70 sm:px-6 sm:py-3.5 sm:text-[13px]">
                      ✗ {them}
                    </td>
                    <td className="px-2.5 py-2.5 align-top text-[11px] leading-[1.45] text-emerald-400/90 sm:px-6 sm:py-3.5 sm:text-[13px]">
                      ✓ {us}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm italic text-white/35">
            15 reasons to ditch the spreadsheet — and you only need one.
          </p>
        </div>
      </section>

      <SectionDivider />

      {/* ── PRICING ── */}
      <PricingSection />

      <SectionDivider />

      {/* ── RESOURCES ── */}
      <section
        id="resources"
        className="relative scroll-mt-16 px-4 py-20"
      >
        <div className="mx-auto flex max-w-[1160px] flex-col items-center gap-12">
          <div className="flex max-w-[580px] flex-col items-center gap-4 text-center">
            <SectionBadge>Resources</SectionBadge>
            <h2 className="font-display text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.15] tracking-tight">
              Read before your{" "}
              <span className="text-yellow-400">next renewal hits.</span>
            </h2>
            <p className="text-base leading-[1.6] text-white/50">
              Practical guides to help your team spend less on SaaS — starting
              this week.
            </p>
          </div>
          <div className="grid w-full gap-4 sm:grid-cols-3">
            {[
              {
                tag: "Guide",
                tagBg: "rgba(96,165,250,0.1)",
                tagColor: "rgba(96,165,250,0.8)",
                title: "The SaaS Audit Checklist for Small Teams",
                desc: "Find every tool your team pays for in 30 minutes. A step-by-step walkthrough covering software license tracking, forgotten subscriptions, unused seats, and quick wins you can act on today.",
                read: "5 min read",
              },
              {
                tag: "Insight",
                tagBg: "rgba(248,113,113,0.1)",
                tagColor: "rgba(248,113,113,0.8)",
                title:
                  "Why Small Teams Overspend on SaaS (And How to Reduce Costs)",
                desc: "Here's why small teams keep paying for tools nobody uses, why spreadsheets make it worse, and how to reduce SaaS costs with better software spend management.",
                read: "4 min read",
              },
              {
                tag: "Playbook",
                tagBg: "rgba(232,181,40,0.1)",
                tagColor: "rgba(232,181,40,0.8)",
                title:
                  "The Monthly SaaS Review: A 10-Minute Routine That Saves Thousands",
                desc: "How to run a quick team check-in that keeps your tool stack lean — including SaaS renewal best practices. A ready-to-use framework you can start this week, with or without Subiq.",
                read: "3 min read",
              },
            ].map((r) => (
              <div
                key={r.title}
                aria-disabled="true"
                className="flex cursor-default flex-col gap-4 rounded-2xl border border-white/[0.07] bg-[#111110] p-7"
              >
                <span
                  className="inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.08em]"
                  style={{ backgroundColor: r.tagBg, color: r.tagColor }}
                >
                  {r.tag}
                </span>
                <h3 className="font-display text-lg font-bold leading-[1.35]">
                  {r.title}
                </h3>
                <p className="text-[13px] leading-[1.65] text-white/45">
                  {r.desc}
                </p>
                <div className="mt-auto flex items-center gap-3 pt-2">
                  <span className="text-xs text-white/30">{r.read}</span>
                </div>
              </div>
            ))}
          </div>
          <span className="text-sm text-white/30">More resources coming soon</span>
        </div>
      </section>

      <SectionDivider />

      {/* ── FAQ ── */}
      <section id="faq" className="relative scroll-mt-16 px-4 py-20">
        <div className="mx-auto flex max-w-[1160px] flex-col items-center gap-12">
          <div className="flex max-w-[580px] flex-col items-center gap-4 text-center">
            <SectionBadge>FAQ</SectionBadge>
            <h2 className="font-display text-[clamp(28px,3.5vw,42px)] font-extrabold leading-[1.15] tracking-tight">
              Got questions?{" "}
              <span className="text-yellow-400">We&apos;ve got answers.</span>
            </h2>
            <p className="text-base leading-[1.6] text-white/50">
              Everything you need to know before getting started.
            </p>
          </div>
          <FaqAccordion
            items={[
              {
                q: "Who is Subiq built for?",
                a: "Subiq is SaaS management software built for small teams — startups, agencies, and growing companies that use multiple tools but don't have a dedicated procurement team. If you're a founder, ops lead, or team lead tracking subscriptions in a spreadsheet (or not tracking them at all), Subiq is for you.",
              },
              {
                q: "Is Subiq really free?",
                a: "Yes. The free plan lets you track up to 3 tools with renewal alerts and a spend dashboard — no credit card required, no time limit. When your stack grows or you need team features, you can upgrade to Pro.",
              },
              {
                q: "How do I add my subscriptions?",
                a: "Three ways: add tools manually in the dashboard, import them from a file, or invite your team and let each member add their own. Most teams are fully set up in under 2 minutes.",
              },
              {
                q: "What are automated review requests?",
                a: "As an admin, you can schedule automatic check-ins — monthly or quarterly. Each team member receives a request to review their tools and confirm what they still use. It takes one click to respond, and you get a clear picture without chasing anyone.",
              },
              {
                q: "What do the tool statuses mean?",
                a: "Every tool can be tagged as active (in use), unused (nobody's using it), or cancelled (already terminated). These statuses power your savings insights — Subiq automatically calculates how much you'd save by cutting unused tools.",
              },
              {
                q: "How does the savings calculation work?",
                a: "When a tool is marked as unused, its cost is added to your \"possible savings\" total. This number updates in real time, so you always know exactly how much you could save by cancelling the tools your team no longer needs.",
              },
              {
                q: "Do I need to connect my bank account or credit card?",
                a: "No. Subiq doesn't require any bank or payment integrations. You add your subscriptions manually or via file import. This keeps setup fast and your financial data private.",
              },
              {
                q: "How is Subiq different from a spreadsheet?",
                a: "Spreadsheets have no alerts, no team roles, no review process, and go stale the moment someone forgets to update them. As a purpose-built subscription management software, Subiq gives you automated renewal reminders, team collaboration with roles, scheduled review requests, status tracking, and auto-calculated savings — all set up in 2 minutes.",
              },
              {
                q: "Can I import and export my data?",
                a: "Yes. You can import your tools from a file to skip manual entry, and export your full subscription list anytime. Your data is never locked in.",
              },
              {
                q: "How can I reduce SaaS costs for my team?",
                a: "Start by auditing which tools your team actually uses. The fastest way to reduce software costs is to identify unused subscriptions and cancel them before they renew. Subiq automates this with review requests, status tracking, and real-time savings calculations — so you can spot waste and cut it before the next renewal.",
              },
              {
                q: "How much do companies typically spend on SaaS?",
                a: "Most teams use far more SaaS tools than they realize, and overspend on unused licenses, forgotten renewals, and duplicate tools. SaaS spend optimization starts with visibility — knowing exactly what you're paying for.",
              },
              {
                q: "Can I cancel or change my plan at any time?",
                a: "Absolutely. You can upgrade, downgrade, or cancel at any time — no lock-in, no cancellation fees. If you cancel Pro, you keep access to the free plan with up to 3 tools.",
              },
            ]}
          />
          <p className="text-center text-sm text-white/35">
            Still have questions? Reach out at{" "}
            <a
              href="mailto:hello@subiq.io"
              className="border-b border-yellow-400/30 text-yellow-400 transition-colors hover:border-yellow-400"
            >
              hello@subiq.io
            </a>
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative px-4 pb-20">
        <div className="mx-auto max-w-[1160px]">
          <div
            className="relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl border border-yellow-400/20 px-12 py-16 text-center"
            style={{
              background:
                "linear-gradient(170deg, rgba(232,181,40,0.1) 0%, #111110 50%)",
            }}
          >
            <div
              className="pointer-events-none absolute left-1/2 top-[-80px] size-[400px] -translate-x-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(232,181,40,0.12) 0%, transparent 65%)",
              }}
            />
            <h2 className="relative max-w-[600px] font-display text-[clamp(26px,3.5vw,38px)] font-extrabold leading-[1.2] tracking-tight">
              You already know you&apos;re paying for tools nobody uses.{" "}
              <span className="text-yellow-400">Now fix it.</span>
            </h2>
            <p className="relative max-w-[480px] text-base leading-[1.6] text-white/45">
              Join the teams that stopped guessing and started saving. Track
              SaaS subscriptions, manage software spend, and start spotting
              what nobody&apos;s using.
            </p>
            <Link
              href="/signup"
              className="relative inline-block rounded-full bg-yellow-400 px-8 py-3.5 text-[16px] font-medium text-[#1a1200] transition-all hover:-translate-y-0.5 hover:bg-yellow-300"
            >
              Start tracking for free
            </Link>
            <span className="relative text-[13px] text-white/30">
              No credit card required &nbsp;·&nbsp; Free up to 3 tools
              &nbsp;·&nbsp; Set up in 2 minutes
            </span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-4 pb-12 pt-0">
        <div className="mx-auto max-w-[1160px] border-t border-white/[0.06] pt-10">
          <div className="grid gap-12 sm:grid-cols-[1.5fr_1fr_1fr]">
            <div className="flex flex-col items-start gap-3">
              <Logo height={22} />
              <p className="max-w-[280px] text-[13px] leading-[1.6] text-white/35">
                SaaS subscription management software for small teams. Track
                subscriptions, manage software spend, get renewal alerts, and
                reduce SaaS costs — all from one simple dashboard.
              </p>
              <a
                href="mailto:hello@subiq.io"
                className="text-[13px] text-white/30 transition-colors hover:text-white/60"
              >
                hello@subiq.io
              </a>
              <a
                href="https://x.com/get_subiq"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow @get_subiq on X (opens in a new tab)"
                className="inline-flex items-center gap-2 text-[13px] text-white/50 transition-colors hover:text-white/80"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-3.5 fill-current"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>@get_subiq</span>
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="mb-1 text-xs uppercase tracking-[0.08em] text-white/30">
                Product
              </span>
              <FooterNavLinks />
            </div>
            <div className="flex flex-col gap-3">
              <span className="mb-1 text-xs uppercase tracking-[0.08em] text-white/30">
                Legal
              </span>
              <LegalLinks />
            </div>
          </div>
          <div className="mt-10 border-t border-white/[0.04] pt-5 text-center text-xs text-white/20">
            &copy; 2026 Subiq. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
