import nodemailer from "nodemailer";

function sanitizeUrl(url: string): string {
  if (
    url.startsWith("https://") ||
    url.startsWith("http://localhost")
  ) {
    return url;
  }
  throw new Error(`Unsafe URL rejected: ${url}`);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const smtpPort = Number(process.env.SMTP_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection on startup (logs to server console)
transporter.verify().then(
  () => console.log("[EMAIL] SMTP connection verified"),
  (err) => console.error("[EMAIL] SMTP connection FAILED:", err.message)
);

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://subiq.vercel.app";

interface EmailLayoutOptions {
  preheader: string;
  greeting?: string;
  headline: string;
  bodyHtml: string;
  cta?: { label: string; url: string };
  infoBox?: { label: string; html: string };
  signOffName?: string;
}

function renderEmail({
  preheader,
  greeting = "Hi there,",
  headline,
  bodyHtml,
  cta,
  infoBox,
  signOffName = "The Subiq team",
}: EmailLayoutOptions): string {
  const ctaHtml = cta
    ? `
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 28px;">
              <tr>
                <td style="border-radius:99px; background-color:#E8B528;">
                  <a href="${sanitizeUrl(cta.url)}" style="display:inline-block; padding:14px 32px; font-size:15px; font-weight:600; color:#1a1200; text-decoration:none; border-radius:99px;">
                    ${escapeHtml(cta.label)}
                  </a>
                </td>
              </tr>
            </table>`
    : "";

  const infoBoxHtml = infoBox
    ? `
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#faf9f5; border-radius:10px; border:1px solid #efece4;">
              <tr>
                <td style="padding: 16px 20px;">
                  <p style="margin:0 0 6px; font-size:11px; font-weight:600; letter-spacing:0.06em; color:#999687; text-transform:uppercase;">
                    ${escapeHtml(infoBox.label)}
                  </p>
                  <div style="margin:0; font-size:14px; color:#4a4a45; line-height:1.55;">
                    ${infoBox.html}
                  </div>
                </td>
              </tr>
            </table>`
    : "";

  const unsubscribeUrl = `${APP_URL}/settings`;
  const preferencesUrl = `${APP_URL}/settings`;
  const slackUrl = "https://subiq.io";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${escapeHtml(headline)}</title>
<!--[if mso]>
<style type="text/css">
table, td, div, h1, p { font-family: Arial, sans-serif; }
</style>
<![endif]-->
<style>
  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
  body { margin: 0 !important; padding: 0 !important; width: 100% !important; }

  @media screen and (max-width: 600px) {
    .container { width: 100% !important; }
    .content-padding { padding: 24px !important; }
    .h1 { font-size: 22px !important; line-height: 1.3 !important; }
    .stack { display: block !important; width: 100% !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#f5f4f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">

<div style="display:none; font-size:1px; color:#f5f4f0; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
  ${escapeHtml(preheader)}
</div>

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f5f4f0;">
  <tr>
    <td align="center" style="padding: 40px 16px;">

      <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="container" width="600" style="width:600px; max-width:600px; background-color:#ffffff; border-radius:14px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.04);">

        <tr>
          <td style="padding: 32px 40px 24px; border-bottom:1px solid #efece4;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td>
                  <a href="${APP_URL}" style="text-decoration:none; display:inline-block;">
                    <img src="${APP_URL}/subiq-logo-black.png" alt="SUBIQ" width="96" height="20" style="display:block; height:20px; width:96px; border:0; outline:none; text-decoration:none;" />
                  </a>
                </td>
                <td align="right">
                  <a href="${APP_URL}" style="font-size:13px; color:#999687; text-decoration:none;">subiq.io</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td class="content-padding" style="padding: 40px;">

            <p style="margin:0 0 16px; font-size:16px; color:#1a1a18; line-height:1.5;">
              ${escapeHtml(greeting)}
            </p>

            <h1 class="h1" style="margin:0 0 20px; font-size:26px; font-weight:800; color:#1a1a18; line-height:1.25; letter-spacing:-0.01em;">
              ${escapeHtml(headline)}
            </h1>

            ${bodyHtml}

            ${ctaHtml}

            ${infoBoxHtml}

          </td>
        </tr>

        <tr>
          <td style="padding: 0 40px 40px;">
            <p style="margin:0 0 4px; font-size:15px; color:#4a4a45; line-height:1.5;">
              Cheers,
            </p>
            <p style="margin:0; font-size:15px; color:#1a1a18; font-weight:600; line-height:1.5;">
              ${escapeHtml(signOffName)}
            </p>
          </td>
        </tr>

        <tr>
          <td style="background-color:#1a1a18; padding: 32px 40px;">

            <img src="${APP_URL}/subiq-logo-white.png" alt="SUBIQ" width="88" height="18" style="display:block; height:18px; width:88px; border:0; outline:none; margin-bottom:10px;" />
            <p style="margin:0 0 24px; font-size:13px; color:rgba(255,255,255,0.5); line-height:1.55;">
              SaaS subscription management for small teams.
            </p>

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px;">
              <tr>
                <td style="padding-right:16px;">
                  <a href="https://x.com/subiq" style="font-size:13px; color:#E8B528; text-decoration:none; font-weight:500;">
                    X
                  </a>
                </td>
                <td style="padding:0 16px; border-left:1px solid rgba(255,255,255,0.15);">
                  <a href="https://linkedin.com/company/subiq" style="font-size:13px; color:#E8B528; text-decoration:none; font-weight:500;">
                    LinkedIn
                  </a>
                </td>
                <td style="padding:0 0 0 16px; border-left:1px solid rgba(255,255,255,0.15);">
                  <a href="${slackUrl}" style="font-size:13px; color:#E8B528; text-decoration:none; font-weight:500;">
                    Slack community
                  </a>
                </td>
              </tr>
            </table>

            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="border-top:1px solid rgba(255,255,255,0.08); padding-top:20px;">
                  <p style="margin:0 0 6px; font-size:12px; color:rgba(255,255,255,0.4); line-height:1.5;">
                    Subiq · <a href="mailto:hello@subiq.io" style="color:rgba(255,255,255,0.5); text-decoration:none;">hello@subiq.io</a> · <a href="${APP_URL}" style="color:rgba(255,255,255,0.5); text-decoration:none;">subiq.io</a>
                  </p>
                  <p style="margin:0; font-size:11px; color:rgba(255,255,255,0.25); line-height:1.5;">
                    You're receiving this email because you have an account with Subiq. <a href="${unsubscribeUrl}" style="color:rgba(255,255,255,0.4); text-decoration:underline;">Unsubscribe</a> · <a href="${preferencesUrl}" style="color:rgba(255,255,255,0.4); text-decoration:underline;">Email preferences</a>
                  </p>
                  <p style="margin:8px 0 0; font-size:11px; color:rgba(255,255,255,0.2);">
                    © ${new Date().getFullYear()} Subiq. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>

</body>
</html>`;
}

export async function sendInviteEmail(
  email: string,
  invitedByName: string,
  workspaceName: string,
  signupUrl: string
) {
  const safeInviter = escapeHtml(invitedByName);
  const safeWorkspace = escapeHtml(workspaceName);
  await transporter.sendMail({
    from: `"SUBIQ" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `You've been invited to join ${workspaceName} on SUBIQ`,
    html: renderEmail({
      preheader: `${invitedByName} invited you to join ${workspaceName} on SUBIQ.`,
      headline: `Join ${workspaceName} on SUBIQ`,
      bodyHtml: `
            <p style="margin:0 0 16px; font-size:15px; color:#4a4a45; line-height:1.65;">
              <strong style="color:#1a1a18;">${safeInviter}</strong> has invited you to join <strong style="color:#1a1a18;">${safeWorkspace}</strong> on SUBIQ — a modern subscription management platform that helps small teams keep every renewal, payment, and seat in one place.
            </p>
            <p style="margin:0 0 28px; font-size:15px; color:#4a4a45; line-height:1.65;">
              Click the button below to accept the invitation and finish setting up your account.
            </p>`,
      cta: { label: "Accept invitation", url: signupUrl },
      infoBox: {
        label: "Heads up",
        html: "If you weren't expecting this invitation, you can safely ignore this email — no account will be created.",
      },
    }),
  });
}

export async function sendWelcomeEmail(email: string, loginUrl: string) {
  await transporter.sendMail({
    from: `"SUBIQ" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: "Welcome to SUBIQ",
    html: renderEmail({
      preheader: "Your SUBIQ account is ready — sign in to get started.",
      headline: "Welcome to SUBIQ",
      bodyHtml: `
            <p style="margin:0 0 16px; font-size:15px; color:#4a4a45; line-height:1.65;">
              Your account is ready. Sign in to start tracking renewals, costs, and team subscriptions — all in one place.
            </p>
            <p style="margin:0 0 28px; font-size:15px; color:#4a4a45; line-height:1.65;">
              We're glad to have you on board.
            </p>`,
      cta: { label: "Sign in to SUBIQ", url: loginUrl },
      infoBox: {
        label: "Quick tip",
        html: "Add your first subscription from the dashboard to get an instant view of upcoming renewals and total spend.",
      },
    }),
  });
}

interface RenewalReminderData {
  softwareName: string;
  renewalDate: string;
  price: number;
  currency: string;
  daysRemaining: number;
}

export async function sendRenewalReminderEmail(
  email: string,
  data: RenewalReminderData
) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: data.currency,
  }).format(data.price);

  const formattedDate = new Date(data.renewalDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const safeName = escapeHtml(data.softwareName);
  const dayWord = data.daysRemaining === 1 ? "day" : "days";

  await transporter.sendMail({
    from: `"SUBIQ" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `Renewal Reminder: ${data.softwareName} in ${data.daysRemaining} ${dayWord}`,
    html: renderEmail({
      preheader: `${data.softwareName} renews in ${data.daysRemaining} ${dayWord} for ${formattedPrice}.`,
      headline: `${data.softwareName} renews in ${data.daysRemaining} ${dayWord}`,
      bodyHtml: `
            <p style="margin:0 0 16px; font-size:15px; color:#4a4a45; line-height:1.65;">
              Your subscription to <strong style="color:#1a1a18;">${safeName}</strong> is renewing soon. Here are the details so you can plan ahead — or cancel if you no longer need it.
            </p>
            <p style="margin:0 0 28px; font-size:15px; color:#4a4a45; line-height:1.65;">
              You can review and manage all renewals from your SUBIQ dashboard.
            </p>`,
      cta: { label: "View in SUBIQ", url: `${APP_URL}/subscriptions` },
      infoBox: {
        label: "Renewal details",
        html: `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px; color:#4a4a45;">
            <tr>
              <td style="padding:4px 0; color:#999687; width:130px;">Subscription</td>
              <td style="padding:4px 0; color:#1a1a18; font-weight:600; text-align:right;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding:4px 0; color:#999687;">Price</td>
              <td style="padding:4px 0; color:#1a1a18; font-weight:600; text-align:right;">${escapeHtml(formattedPrice)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0; color:#999687;">Renewal date</td>
              <td style="padding:4px 0; color:#1a1a18; font-weight:600; text-align:right;">${escapeHtml(formattedDate)}</td>
            </tr>
          </table>
        `,
      },
    }),
  });
}

interface ReviewReminderData {
  workspaceName: string;
  adminName: string;
}

export async function sendReviewReminderEmail(
  email: string,
  data: ReviewReminderData
) {
  const safeWorkspace = escapeHtml(data.workspaceName);

  await transporter.sendMail({
    from: `"SUBIQ" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: `Time to review your ${data.workspaceName} subscriptions`,
    html: renderEmail({
      preheader: `A quick reminder to review the SaaS tools on ${data.workspaceName}.`,
      headline: "Time to review your subscriptions",
      bodyHtml: `
            <p style="margin:0 0 16px; font-size:15px; color:#4a4a45; line-height:1.65;">
              It's time for <strong style="color:#1a1a18;">${safeWorkspace}</strong> to take a quick look at its SaaS subscriptions. A few minutes now keeps spend under control and avoids paying for tools no one uses.
            </p>
            <p style="margin:0 0 12px; font-size:15px; color:#4a4a45; line-height:1.65;">
              As you go through the list, ask yourself:
            </p>
            <ul style="margin:0 0 28px; padding-left:20px; font-size:15px; color:#4a4a45; line-height:1.8;">
              <li>Is each tool still actively used by the team?</li>
              <li>Does the current plan still fit how much you use it?</li>
              <li>Are there overlapping tools you could consolidate?</li>
            </ul>`,
      cta: { label: "Review subscriptions", url: `${APP_URL}/subscriptions` },
      infoBox: {
        label: "Why this matters",
        html: "Unused and oversized subscriptions are the most common source of wasted SaaS spend — a periodic review is the simplest way to catch them.",
      },
      signOffName: data.adminName,
    }),
  });
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  await transporter.sendMail({
    from: `"SUBIQ" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: "Reset your SUBIQ password",
    html: renderEmail({
      preheader: "Reset your SUBIQ password — link expires soon.",
      headline: "Reset your password",
      bodyHtml: `
            <p style="margin:0 0 16px; font-size:15px; color:#4a4a45; line-height:1.65;">
              We received a request to reset the password for your SUBIQ account. Click the button below to choose a new one.
            </p>
            <p style="margin:0 0 28px; font-size:15px; color:#4a4a45; line-height:1.65;">
              For your security, this link will expire shortly.
            </p>`,
      cta: { label: "Reset password", url: resetUrl },
      infoBox: {
        label: "Didn't request this?",
        html: "If you didn't request a password reset, you can safely ignore this email — your password will stay the same.",
      },
    }),
  });
}

export async function sendVerificationEmail(email: string, verifyUrl: string) {
  await transporter.sendMail({
    from: `"SUBIQ" <${process.env.SMTP_FROM}>`,
    to: email,
    subject: "Verify your SUBIQ email",
    html: renderEmail({
      preheader: "Verify your email to activate your SUBIQ account.",
      headline: "Verify your email",
      bodyHtml: `
            <p style="margin:0 0 16px; font-size:15px; color:#4a4a45; line-height:1.65;">
              Welcome to SUBIQ. To finish setting up your account, confirm your email address by clicking the button below.
            </p>
            <p style="margin:0 0 28px; font-size:15px; color:#4a4a45; line-height:1.65;">
              This link expires in 24 hours. If you request a new verification email, the previous link will stop working.
            </p>`,
      cta: { label: "Verify email", url: verifyUrl },
      infoBox: {
        label: "Didn't sign up?",
        html: "If you didn't create a SUBIQ account, you can safely ignore this email.",
      },
    }),
  });
}
