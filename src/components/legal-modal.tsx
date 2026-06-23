"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X } from "lucide-react";

const TERMS = {
  title: "Terms of Service",
  updated: "April 7, 2026",
  sections: [
    {
      heading: "1. Service Description",
      body: "Subiq is a web-based platform that allows users to track and manage SaaS subscriptions and related costs. The Service may be updated, modified, or changed at any time without prior notice.",
    },
    {
      heading: "2. User Accounts",
      body: "You must be at least 16 years old to use the Service. You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately if you suspect unauthorized access. We reserve the right to suspend or terminate accounts that violate these Terms.",
    },
    {
      heading: "3. Acceptable Use",
      body: "You agree not to use the Service for any unlawful purpose, attempt to gain unauthorized access, reverse engineer any part of the Service, use automated tools to scrape data, share your account credentials with third parties, or interfere with the integrity or performance of the Service.",
    },
    {
      heading: "4. Intellectual Property",
      body: "All rights, title, and interest in the Service — including its design, code, branding, and content — are owned by Subiq. You are granted a limited, non-exclusive, non-transferable license to use the Service in accordance with these Terms.",
    },
    {
      heading: "5. Your Data",
      body: "You retain full ownership of the data you input into Subiq. We do not claim ownership of your data. We may use anonymized and aggregated data for analytics and service improvement. If you delete your account, your data will be permanently removed within 30 days, except where retention is required by law.",
    },
    {
      heading: "6. Payment and Subscription",
      body: 'Subiq may offer free and paid plans. Paid subscriptions are billed in advance on a recurring basis (monthly or annually). You may cancel at any time; cancellation takes effect at the end of the current billing period. Refunds are not provided for partial billing periods unless required by law.',
    },
    {
      heading: "7. Limitation of Liability",
      body: 'The Service is provided "as is" without warranties of any kind. To the maximum extent permitted by law, Subiq shall not be liable for any indirect, incidental, special, or consequential damages. Our total liability shall not exceed the amount you paid to Subiq in the 12 months preceding the claim.',
    },
    {
      heading: "8. Governing Law",
      body: "These Terms are governed by the laws of Sweden. Any disputes shall be resolved by the competent courts in Sweden.",
    },
    {
      heading: "9. Contact",
      body: "For questions about these Terms, contact us at hello@subiq.io",
    },
  ],
};

const PRIVACY = {
  title: "Privacy Policy",
  updated: "April 7, 2026",
  sections: [
    {
      heading: "1. Data Controller",
      body: "Subiq is the data controller responsible for your personal data. For questions or requests regarding your data, contact us at hello@subiq.io",
    },
    {
      heading: "2. Information We Collect",
      body: "We collect information you provide directly (name, email, subscription data, support communications) and information collected automatically (device/browser info, IP address, usage data, cookies).",
    },
    {
      heading: "3. How We Use Your Information",
      body: "We use your data to provide and maintain the Service, manage your account, send important notifications, analyze usage patterns to improve the platform, and comply with legal obligations. We do not use your data for advertising or profiling.",
    },
    {
      heading: "4. Data Sharing",
      body: "We do not sell, rent, or trade your personal data. We use Supabase for database and authentication, and Resend for transactional email delivery. These providers process data on our behalf under appropriate agreements. We may disclose data if required by law.",
    },
    {
      heading: "5. Data Retention",
      body: "We retain your personal data for as long as your account is active. If you delete your account, your data will be permanently removed within 30 days, except where retention is required by law. Anonymized data may be retained indefinitely for analytics.",
    },
    {
      heading: "6. Cookies",
      body: "We use essential cookies (authentication, security) and optional analytics cookies. You can manage cookie preferences through your browser settings. Disabling essential cookies may affect Service functionality.",
    },
    {
      heading: "7. Your Rights (GDPR)",
      body: "You have the right to access, rectify, erase, restrict, or port your personal data, and to object to processing or withdraw consent. Contact hello@subiq.io to exercise these rights. We will respond within 30 days. You may also lodge a complaint with the Swedish Authority for Privacy Protection (IMY) at www.imy.se.",
    },
    {
      heading: "8. Security",
      body: "We take reasonable technical and organizational measures to protect your data, including TLS encryption in transit and encryption at rest. No system is completely secure and we cannot guarantee absolute security.",
    },
    {
      heading: "9. Contact",
      body: "For privacy-related questions or data requests, contact us at hello@subiq.io",
    },
  ],
};

type Doc = typeof TERMS;
type DocKey = "terms" | "privacy";

const DOCS: Record<DocKey, Doc> = { terms: TERMS, privacy: PRIVACY };
const DURATION = 280; // ms

function Modal({
  doc,
  origin,
  closing,
  onClose,
}: {
  doc: Doc;
  origin: string;
  closing: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        animation: closing
          ? `lm-fade-out ${DURATION}ms ease forwards`
          : `lm-fade-in ${DURATION}ms ease forwards`,
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
        style={{
          transformOrigin: origin,
          animation: closing
            ? `lm-pop-out ${DURATION}ms cubic-bezier(0.4,0,1,1) forwards`
            : `lm-pop-in ${DURATION}ms cubic-bezier(0,0,0.2,1) forwards`,
        }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-white">{doc.title}</h2>
            <p className="text-[11px] text-gray-500">Last updated: {doc.updated}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Scrollable content — hidden scrollbar */}
        <div
          className="overflow-y-auto px-5 py-4 space-y-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <style>{`.lm-scroll::-webkit-scrollbar{display:none}`}</style>
          {doc.sections.map((s) => (
            <div key={s.heading} className="flex gap-3">
              <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400" />
              <div>
                <h3 className="mb-1 text-[13px] font-semibold text-white">
                  {s.heading.replace(/^\d+\.\s*/, "")}
                </h3>
                <p className="text-[13px] leading-[1.75] text-gray-400">{s.body}</p>
              </div>
            </div>
          ))}
          <div className="h-2" />
        </div>
      </div>

      <style>{`
        @keyframes lm-fade-in  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes lm-fade-out { from { opacity: 1 } to { opacity: 0 } }
        @keyframes lm-pop-in   { from { opacity: 0; transform: scale(0.12) } to { opacity: 1; transform: scale(1) } }
        @keyframes lm-pop-out  { from { opacity: 1; transform: scale(1) } to { opacity: 0; transform: scale(0.12) } }
      `}</style>
    </div>
  );
}

export function LegalLinks() {
  const [open, setOpen] = useState<DocKey | null>(null);
  const [closing, setClosing] = useState(false);
  const [origin, setOrigin] = useState("50% 100%");
  const termsRef = useRef<HTMLButtonElement>(null);
  const privacyRef = useRef<HTMLButtonElement>(null);

  const openModal = useCallback((key: DocKey) => {
    const btn = key === "terms" ? termsRef.current : privacyRef.current;
    if (btn) {
      const r = btn.getBoundingClientRect();
      const x = ((r.left + r.right) / 2 / window.innerWidth) * 100;
      const y = ((r.top + r.bottom) / 2 / window.innerHeight) * 100;
      setOrigin(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
    }
    setClosing(false);
    setOpen(key);
  }, []);

  const closeModal = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setOpen(null);
      setClosing(false);
    }, DURATION);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, closeModal]);

  return (
    <>
      <ul className="space-y-2.5">
        <li>
          <button
            ref={termsRef}
            onClick={() => openModal("terms")}
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            Terms of Service
          </button>
        </li>
        <li>
          <button
            ref={privacyRef}
            onClick={() => openModal("privacy")}
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            Privacy Policy
          </button>
        </li>
      </ul>

      {open && (
        <Modal
          doc={DOCS[open]}
          origin={origin}
          closing={closing}
          onClose={closeModal}
        />
      )}
    </>
  );
}

const NAV_LINKS = [
  { label: "Features",  href: "#features"  },
  { label: "Pricing",   href: "#pricing"   },
  { label: "Resources", href: "#resources" },
] as const;

export function FooterNavLinks() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <ul className="space-y-2.5">
      {NAV_LINKS.map(({ label, href }) => (
        <li key={href}>
          <button
            onClick={() => scrollTo(href)}
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            {label}
          </button>
        </li>
      ))}
    </ul>
  );
}
