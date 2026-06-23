import Link from "next/link";
import { LandingHeader } from "@/components/landing-header";
import { TERMS_LAST_UPDATED } from "@/lib/legal-dates";

export const metadata = {
  title: "Terms of Service",
  description: "The terms and conditions governing your use of the Subiq platform.",
  alternates: { canonical: "/terms-of-service" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-white/[0.08] py-10">
      <h2 className="mb-5 text-xl font-bold text-white">{title}</h2>
      <div className="space-y-4 text-[15px] leading-[1.8] text-gray-400">{children}</div>
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

export default function TermsOfServicePage() {
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
            Last updated: {TERMS_LAST_UPDATED.display}
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Terms of <span className="text-yellow-400">Service</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-400">
            By accessing or using Subiq, you agree to be bound by these Terms. If you do not agree, do not use the Service.
          </p>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-[760px] px-4 pb-24">
        <Section title="1. Service Description">
          <p>
            Subiq is a web-based platform that allows users to track and manage SaaS subscriptions and related costs.
            The Service may be updated, modified, or changed at any time without prior notice.
          </p>
        </Section>

        <Section title="2. User Accounts">
          <Ul items={[
            "You must be at least 16 years old to use the Service.",
            "You must provide accurate and complete information when creating an account.",
            "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
            "You must notify us immediately if you suspect unauthorized access to your account.",
            "We reserve the right to suspend or terminate accounts that violate these Terms.",
          ]} />
        </Section>

        <Section title="3. Acceptable Use">
          <p>You agree not to:</p>
          <Ul items={[
            "Use the Service for any unlawful purpose or in violation of applicable law.",
            "Attempt to gain unauthorized access to the Service or its related systems.",
            "Reverse engineer, decompile, or disassemble any part of the Service.",
            "Use automated tools to scrape, crawl, or extract data from the Service.",
            "Share your account credentials with third parties.",
            "Interfere with or disrupt the integrity or performance of the Service.",
          ]} />
        </Section>

        <Section title="4. Intellectual Property">
          <p>
            All rights, title, and interest in the Service — including its design, code, branding, and content — are owned
            by Subiq. You are granted a limited, non-exclusive, non-transferable license to use the Service in accordance
            with these Terms.
          </p>
        </Section>

        <Section title="5. Your Data">
          <Ul items={[
            "You retain full ownership of the data you input into Subiq.",
            "We do not claim ownership of your data.",
            "We may use anonymized and aggregated data for analytics and service improvement.",
            "If you delete your account, your data will be permanently removed within 30 days, except where retention is required by law.",
          ]} />
          <p>
            For details on how we collect, process, and protect your personal data, see our{" "}
            <Link href="/privacy-policy" className="text-yellow-400 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </Section>

        <Section title="6. Payment and Subscription">
          <Ul items={[
            "Subiq may offer free and paid plans. Pricing and plan details are available on our website.",
            "Paid subscriptions are billed in advance on a recurring basis (monthly or annually).",
            "You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period.",
            "Refunds are not provided for partial billing periods unless required by applicable law.",
          ]} />
        </Section>

        <Section title="7. Availability">
          <Ul items={[
            "We strive to keep the Service available at all times but do not guarantee uninterrupted or error-free access.",
            "We may perform scheduled maintenance that temporarily affects availability.",
            "We are not responsible for outages caused by third-party services, internet disruptions, or circumstances beyond our control.",
          ]} />
        </Section>

        <Section title="8. Limitation of Liability">
          <Ul items={[
            'The Service is provided "as is" and "as available" without warranties of any kind, express or implied.',
            "To the maximum extent permitted by law, Subiq shall not be liable for any indirect, incidental, special, or consequential damages, including loss of data, revenue, or profits.",
            "Our total liability for any claim arising from the use of the Service shall not exceed the amount you paid to Subiq in the 12 months preceding the claim.",
            "We are not liable for events beyond our reasonable control (force majeure), including but not limited to natural disasters, war, or widespread internet failures.",
          ]} />
        </Section>

        <Section title="9. Termination">
          <Ul items={[
            "You may stop using the Service and delete your account at any time.",
            "We may suspend or terminate your access if you violate these Terms, with or without notice.",
            "Upon termination, your right to use the Service ceases immediately. Sections 4, 5, 8, and 11 survive termination.",
          ]} />
        </Section>

        <Section title="10. Changes to These Terms">
          <p>
            We may update these Terms from time to time. When we make material changes, we will notify you via email or
            through the Service. Continued use of the Service after such notification constitutes acceptance of the updated
            Terms.
          </p>
        </Section>

        <Section title="11. Governing Law">
          <p>
            These Terms are governed by and construed in accordance with the laws of Sweden. Any disputes arising from
            these Terms shall be resolved by the competent courts in Sweden.
          </p>
        </Section>

        <Section title="12. Indemnification">
          <p>
            You agree to indemnify and hold Subiq harmless from any claims, damages, or expenses (including legal fees)
            arising from your use of the Service or violation of these Terms.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>
            For questions about these Terms, contact us at{" "}
            <a href="mailto:hello@subiq.io" className="text-yellow-400 hover:underline">
              hello@subiq.io
            </a>
            .
          </p>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] px-4 py-8">
        <div className="mx-auto flex max-w-[760px] flex-col items-center justify-between gap-4 text-[13px] text-gray-500 sm:flex-row">
          <span>&copy; 2026 Subiq. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="transition-colors hover:text-white">Privacy Policy</Link>
            <Link href="/" className="transition-colors hover:text-white">Back to Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
