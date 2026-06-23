# Subiq

SaaS subscription management platform for small teams. Track subscriptions, manage software spend, get renewal alerts, and reduce SaaS costs.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript
- **Database & Auth:** [Supabase](https://supabase.com/) (Postgres, Auth, Realtime)
- **Payments:** [Stripe](https://stripe.com/) (subscriptions, checkout, billing portal, webhooks)
- **Email:** [Resend](https://resend.com/) via SMTP (Nodemailer)
- **UI:** Tailwind CSS v4, shadcn/ui, Base UI, Recharts, Sonner
- **Forms & Validation:** React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project
- A Stripe account
- A Resend account (for transactional email)

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file from the example and fill in the values:

   ```bash
   cp .env.example .env
   ```

   See [Environment Variables](#environment-variables) below.

3. Apply the database migrations in `supabase/migrations/` to your Supabase project (in order).

4. Run the development server:

   ```bash
   npm run dev
   ```

   The app runs at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start the local dev server        |
| `npm run build` | Build for production              |
| `npm run start` | Start the production server       |
| `npm run lint`  | Run ESLint                        |

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Group        | Variable                            | Description                                            |
| ------------ | ----------------------------------- | ------------------------------------------------------ |
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL`          | Supabase project URL                                   |
|              | `NEXT_PUBLIC_SUPABASE_ANON_KEY`     | Supabase anon/public key                               |
|              | `SUPABASE_SERVICE_ROLE_KEY`         | Service role key (server-side only)                    |
| **App**      | `NEXT_PUBLIC_APP_URL`               | App base URL (`http://localhost:3000` in dev)          |
|              | `NEXT_PUBLIC_GTAG_CONVERSION_ID`    | Google Ads signup conversion action (optional)         |
| **SMTP**     | `SMTP_HOST` / `SMTP_PORT`           | Resend SMTP host and port                              |
|              | `SMTP_USER` / `SMTP_PASS`           | SMTP credentials (`resend` + Resend API key)           |
|              | `SMTP_FROM`                         | From address for outgoing email                        |
| **Cron**     | `CRON_SECRET`                       | Shared secret authorizing the cron endpoints           |
| **Stripe**   | `STRIPE_SECRET_KEY`                 | Stripe secret key                                      |
|              | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`| Stripe publishable key                                 |
|              | `STRIPE_WEBHOOK_SECRET`             | Signing secret for `/api/webhooks/stripe`              |
|              | `STRIPE_PRICE_*`                    | Recurring price IDs (Pro/Business, monthly/yearly)     |

## Project Structure

```
src/
  app/
    (auth)/         # Login, signup, password reset
    (dashboard)/    # Dashboard, subscriptions, billing, settings
    api/
      billing/      # Stripe checkout + billing portal
      webhooks/     # Stripe webhook handler
      cron/         # Renewal & reminder cron jobs
    auth/           # Auth callback / confirmation routes
  components/       # Shared components (incl. ui/ from shadcn)
  lib/supabase/     # Supabase client/server helpers
  providers/        # React context providers
  styles/           # Global styles
supabase/migrations/ # Ordered SQL migrations
```

## Cron Jobs

Scheduled endpoints under `src/app/api/cron/` (configured in `vercel.json`) handle
subscription renewals and renewal/review reminders. They are protected by `CRON_SECRET`.

## Deployment

Deployed on [Vercel](https://vercel.com/). Configure all environment variables in the
Vercel project settings, set the Stripe webhook to point at `/api/webhooks/stripe`, and
ensure the cron schedules in `vercel.json` are active.
