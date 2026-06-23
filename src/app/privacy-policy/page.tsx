import Link from "next/link";
import { LandingHeader } from "@/components/landing-header";
import { PRIVACY_LAST_UPDATED } from "@/lib/legal-dates";

export const metadata = {
  title: "Privacy Policy",
  description: "How Subiq collects, uses, and protects your personal data.",
  alternates: { canonical: "/privacy-policy" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-white/[0.08] py-10">
      <h2 className="mb-5 text-xl font-bold text-white">{title}</h2>
      <div className="space-y-4 text-[15px] leading-[1.8] text-gray-400">{children}</div>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full border-collapse text-[14px]">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className="border-b border-white/10 bg-white/[0.04] px-5 py-3 text-left text-[12px] font-bold uppercase tracking-[0.5px] text-gray-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white/[0.02]" : ""}>
              {row.map((cell, j) => (
                <td key={j} className="border-b border-white/[0.05] px-5 py-3 text-gray-400 last:border-b-0">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-yellow-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <LandingHeader />

      {/* Hero */}
      <div className="relative overflow-hidden border-b border-white/[0.08] px-4 py-16 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 blur-[80px]"
          style={{ background: "radial-gradient(circle, rgba(250,204,21,0.08) 0%, transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-[760px]">
          <span className="mb-4 inline-block rounded-full border border-white/[0.08] bg-white/10 px-4 py-1.5 text-[12px] font-medium tracking-[0.3px] text-gray-400">
            Last updated: {PRIVACY_LAST_UPDATED.display}
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Privacy <span className="text-yellow-400">Policy</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-400">
            Your privacy is important to us. This policy explains how Subiq collects, uses, stores, and protects your personal data.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-[760px] px-4 pb-24">
        <Section title="1. Data Controller">
          <p>
            Subiq is the data controller responsible for your personal data. For questions or requests regarding your data, contact us at{" "}
            <a href="mailto:hello@subiq.io" className="text-yellow-400 hover:underline">hello@subiq.io</a>.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p className="font-semibold text-white">Information you provide directly:</p>
          <Ul items={[
            "Name and email address (at registration)",
            "Subscription and payment data you enter into the platform",
            "Communications you send to us (e.g. support requests)",
          ]} />
          <p className="font-semibold text-white">Information collected automatically:</p>
          <Ul items={[
            "Device and browser information (e.g. browser type, operating system)",
            "IP address",
            "Usage data (e.g. pages visited, features used, timestamps)",
            "Cookies and similar technologies (see Section 8)",
          ]} />
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use your personal data to:</p>
          <Ul items={[
            "Provide, operate, and maintain the Service",
            "Manage your account and authenticate your identity",
            "Send important notifications (e.g. subscription renewals, security alerts, Terms updates)",
            "Analyze usage patterns to improve the platform",
            "Respond to your questions and support requests",
            "Comply with legal obligations",
          ]} />
          <p>We do <span className="font-semibold text-white">not</span> use your data for advertising or profiling purposes.</p>
        </Section>

        <Section title="4. Legal Basis for Processing (GDPR)">
          <p>We process your data based on the following legal grounds:</p>
          <Table
            headers={["Legal basis", "When it applies"]}
            rows={[
              ["Contract", "Processing necessary to provide the Service to you (Art. 6(1)(b) GDPR)"],
              ["Legitimate interest", "Analytics and service improvement, fraud prevention (Art. 6(1)(f) GDPR)"],
              ["Legal obligation", "When required by law, e.g. tax or accounting rules (Art. 6(1)(c) GDPR)"],
              ["Consent", "Optional cookies and marketing emails, where applicable (Art. 6(1)(a) GDPR)"],
            ]}
          />
        </Section>

        <Section title="5. Data Sharing and Third-Party Services">
          <p>We do <span className="font-semibold text-white">not</span> sell, rent, or trade your personal data.</p>
          <p>We use trusted third-party services strictly to operate the platform:</p>
          <Table
            headers={["Provider", "Purpose"]}
            rows={[
              ["Supabase", "Database and authentication"],
              ["Resend", "Transactional email delivery"],
            ]}
          />
          <p>We may also disclose data if required by law or to protect our legal rights.</p>
        </Section>

        <Section title="6. Data Storage and Transfers">
          <Ul items={[
            "Your data is stored on servers operated by our infrastructure providers (see Section 5).",
            "If data is transferred outside the EU/EEA, we ensure appropriate safeguards are in place, such as Standard Contractual Clauses (SCCs) approved by the European Commission.",
          ]} />
        </Section>

        <Section title="7. Data Retention">
          <Ul items={[
            "We retain your personal data for as long as your account is active and as needed to provide the Service.",
            "If you delete your account, your data will be permanently removed within 30 days, except where retention is required by law (e.g. accounting records).",
            "Anonymized and aggregated data may be retained indefinitely for analytics purposes.",
          ]} />
        </Section>

        <Section title="8. Cookies">
          <p>We may use cookies and similar technologies to keep you logged in, remember your preferences, and understand how the Service is used.</p>
          <Table
            headers={["Type", "Purpose", "Required?"]}
            rows={[
              ["Essential", "Authentication, security, core functionality", "Yes"],
              ["Analytics", "Usage statistics and service improvement", "No (consent-based)"],
            ]}
          />
          <p>You can manage cookie preferences through your browser settings. Disabling essential cookies may affect the functionality of the Service.</p>
        </Section>

        <Section title="9. Your Rights">
          <p>Under the GDPR, you have the right to:</p>
          <Ul items={[
            "Access — request a copy of the personal data we hold about you",
            "Rectification — request correction of inaccurate data",
            "Erasure — request deletion of your data (&ldquo;right to be forgotten&rdquo;)",
            "Restriction — request that we limit processing of your data",
            "Data portability — receive your data in a structured, machine-readable format",
            "Object — object to processing based on legitimate interest",
            "Withdraw consent — where processing is based on consent, withdraw it at any time",
          ]} />
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:hello@subiq.io" className="text-yellow-400 hover:underline">hello@subiq.io</a>. We will respond within 30 days.
          </p>
          <p>
            If you are unsatisfied with our response, you have the right to lodge a complaint with a supervisory authority. In Sweden, this is the{" "}
            <span className="font-semibold text-white">Swedish Authority for Privacy Protection (IMY)</span>.
          </p>
        </Section>

        <Section title="10. Security">
          <p>
            We take reasonable technical and organizational measures to protect your data, including encryption in transit (TLS) and at rest. However, no system is completely secure, and we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="11. Children">
          <p>
            The Service is not intended for users under the age of 16. We do not knowingly collect data from children. If we become aware that we have collected data from a child under 16, we will delete it promptly.
          </p>
        </Section>

        <Section title="12. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. When we make material changes, we will notify you via email or through the Service. The "Last updated" date at the top reflects the most recent revision.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            For privacy-related questions or data requests, contact us at{" "}
            <a href="mailto:hello@subiq.io" className="text-yellow-400 hover:underline">hello@subiq.io</a>.
          </p>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] px-4 py-8">
        <div className="mx-auto max-w-[760px] flex flex-col items-center justify-between gap-4 text-[13px] text-gray-500 sm:flex-row">
          <span>&copy; 2026 Subiq. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/terms-of-service" className="transition-colors hover:text-white">Terms of Service</Link>
            <Link href="/" className="transition-colors hover:text-white">Back to Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
