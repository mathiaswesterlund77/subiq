import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "Subiq — SaaS Subscription Management Software for Small Teams";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoBuffer = await readFile(
    join(process.cwd(), "public", "subiq-logo-white.png")
  );
  const logoDataUri = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a08",
          color: "#ffffff",
          padding: "72px 80px",
          position: "relative",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Top-left golden glow */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: -260,
            left: -200,
            width: 760,
            height: 760,
            background:
              "radial-gradient(circle, rgba(232,181,40,0.22) 0%, rgba(232,181,40,0.06) 35%, transparent 65%)",
          }}
        />

        {/* Bottom-right subtle glow */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: -240,
            right: -200,
            width: 600,
            height: 600,
            background:
              "radial-gradient(circle, rgba(232,181,40,0.08) 0%, transparent 60%)",
          }}
        />

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            zIndex: 1,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoDataUri}
            alt="SUBIQ"
            width={170}
            height={36}
            style={{ width: 170, height: 36 }}
          />
        </div>

        {/* Spacer */}
        <div style={{ display: "flex", flex: 1 }} />

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            fontSize: 84,
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            zIndex: 1,
            maxWidth: 1040,
          }}
        >
          <span>You&apos;re probably paying for&nbsp;</span>
          <span style={{ color: "#facc15" }}>3 tools nobody uses.</span>
        </div>

        {/* Subhead */}
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: 26,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.45,
            maxWidth: 900,
            zIndex: 1,
          }}
        >
          SaaS subscription management software for small teams. Track every
          tool, manage software spend, and reduce SaaS costs.
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            marginTop: 56,
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 22,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#facc15",
              }}
            />
            subiq.io
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#facc15",
              fontWeight: 600,
            }}
          >
            Free plan available →
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
