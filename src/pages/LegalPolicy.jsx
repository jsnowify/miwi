import { useState } from "react";

const sections = [
  {
    emoji: "🌿",
    title: "What we collect",
    content: [
      {
        heading: "Account information",
        body: "When you sign up, we collect your name, email address, and a profile photo if you choose to upload one. That's it — no phone number required.",
      },
      {
        heading: "Mood posts and reactions",
        body: "The posts you share, the mood tags you pick, and the reactions you send are stored so your circle can see them. Posts shared to 'just one person' are only visible to that person and you.",
      },
      {
        heading: "Usage data",
        body: "We collect basic analytics like which features you use and how often you open the app. This helps us improve Miwi. We don't track you across other apps or websites.",
      },
      {
        heading: "Device information",
        body: "We collect your device type and operating system version to keep the app running smoothly. We don't collect your precise location.",
      },
    ],
  },
  {
    emoji: "🤍",
    title: "How we use it",
    content: [
      {
        heading: "To run Miwi",
        body: "We use your information to show your mood posts to your circle, send notifications you've opted into, and generate your monthly Miwi Memories recap.",
      },
      {
        heading: "To improve the app",
        body: "Aggregated, anonymized usage data helps us understand what's working and what isn't. We never sell this data or share it with advertisers.",
      },
      {
        heading: "To keep things safe",
        body: "We may use account information to investigate reports of abuse or to verify your identity if you lose access to your account.",
      },
    ],
  },
  {
    emoji: "🫂",
    title: "Who we share it with",
    content: [
      {
        heading: "Your circle",
        body: "Posts you share go to the people you choose — your whole circle, a close-friends group, or one specific person. You control this every time you post.",
      },
      {
        heading: "Service providers",
        body: "We work with a small number of trusted companies to host the app and send notifications (like push notification services). They process data on our behalf and are contractually required to keep it confidential.",
      },
      {
        heading: "Nobody else",
        body: "We don't sell your data. We don't share it with advertisers. We don't license it to third parties. The intimacy of Miwi is the product — we'd be destroying it if we did any of those things.",
      },
    ],
  },
  {
    emoji: "✨",
    title: "Your choices",
    content: [
      {
        heading: "Delete your account",
        body: "You can delete your Miwi account at any time from Settings. When you do, your posts, reactions, and profile information are permanently removed within 30 days.",
      },
      {
        heading: "Edit or delete posts",
        body: "You can delete any post you've made at any time. Once deleted, it's removed from your circle's feed immediately.",
      },
      {
        heading: "Notification controls",
        body: "You can turn off the daily Vibe Check nudge and other notifications anytime in your device settings or within Miwi.",
      },
      {
        heading: "Data export",
        body: "You can request a copy of your Miwi data at any time by emailing us at privacy@miwi.app.",
      },
    ],
  },
  {
    emoji: "🌙",
    title: "Data retention",
    content: [
      {
        heading: "Active accounts",
        body: "We keep your posts and account data for as long as you're using Miwi. Monthly Memories are stored for 12 months.",
      },
      {
        heading: "Deleted accounts",
        body: "After you delete your account, we remove your personal data within 30 days. Some anonymized, aggregated data (like total mood tag counts) may be retained for analytics purposes.",
      },
    ],
  },
  {
    emoji: "🍃",
    title: "Keeping you safe",
    content: [
      {
        heading: "Encryption",
        body: "All data is encrypted in transit (TLS) and at rest. Passwords are hashed — we never store them in plain text.",
      },
      {
        heading: "Access controls",
        body: "Only a small number of Miwi employees can access user data, and only when necessary for support or security purposes.",
      },
      {
        heading: "Breach notification",
        body: "If a data breach occurs that affects your personal information, we'll notify you by email within 72 hours of becoming aware of it.",
      },
    ],
  },
  {
    emoji: "🌪️",
    title: "Children's privacy",
    content: [
      {
        heading: "Age requirement",
        body: "Miwi is not intended for children under 13. We don't knowingly collect personal information from anyone under 13. If you believe a child has created an account, please contact us at privacy@miwi.app and we'll remove it promptly.",
      },
    ],
  },
  {
    emoji: "🔥",
    title: "Changes to this policy",
    content: [
      {
        heading: "How we'll tell you",
        body: "If we make meaningful changes to this Privacy Policy, we'll notify you in the app and by email at least 14 days before the changes take effect. Continuing to use Miwi after that date means you accept the updated policy.",
      },
    ],
  },
];

export default function LegalPolicy() {
  const [openIdx, setOpenIdx] = useState(null);
  const lastUpdated = "June 2025";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FDF6F0",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#3B2A20",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#FCEADE",
          borderBottom: "1px solid #F0D5C0",
          padding: "0 1.5rem",
        }}
      >
        <div
          style={{ maxWidth: 680, margin: "0 auto", padding: "2rem 0 2.5rem" }}
        >
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              color: "#B07050",
              textDecoration: "none",
              marginBottom: "1.5rem",
              fontWeight: 500,
            }}
          >
            ← Back to Miwi
          </a>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: "0.75rem",
            }}
          >
            <span style={{ fontSize: 32 }}>🌿</span>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 700,
                color: "#2A1A0E",
                letterSpacing: "-0.5px",
              }}
            >
              Privacy Policy
            </h1>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              color: "#8B6650",
              lineHeight: 1.6,
            }}
          >
            Miwi is built on trust. Here's exactly what we do — and don't do —
            with your information.
          </p>
          <p style={{ margin: "0.75rem 0 0", fontSize: 13, color: "#B09080" }}>
            Last updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Intro banner */}
      <div
        style={{ maxWidth: 680, margin: "0 auto", padding: "1.5rem 1.5rem 0" }}
      >
        <div
          style={{
            background: "#FFF5EE",
            border: "1px solid #F0D8C8",
            borderRadius: 14,
            padding: "1.25rem 1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 15,
              color: "#6B4535",
              lineHeight: 1.7,
            }}
          >
            <strong style={{ color: "#3B2A20" }}>The short version:</strong> We
            collect only what's needed to run Miwi. We never sell your data. We
            never show you ads. Your circle sees only what you choose to share
            with them.
          </p>
        </div>
      </div>

      {/* Sections */}
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "1.25rem 1.5rem 4rem",
        }}
      >
        {sections.map((section, i) => (
          <div
            key={i}
            style={{
              background: "#FFFFFF",
              border: "1px solid #EDD5C0",
              borderRadius: 14,
              marginBottom: "0.75rem",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.1rem 1.5rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>{section.emoji}</span>
                <span
                  style={{ fontSize: 16, fontWeight: 600, color: "#2A1A0E" }}
                >
                  {section.title}
                </span>
              </div>
              <span
                style={{
                  fontSize: 18,
                  color: "#C08060",
                  transform: openIdx === i ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                  flexShrink: 0,
                }}
              >
                ↓
              </span>
            </button>

            {openIdx === i && (
              <div
                style={{
                  padding: "0 1.5rem 1.5rem",
                  borderTop: "1px solid #F5E4D4",
                }}
              >
                {section.content.map((item, j) => (
                  <div
                    key={j}
                    style={{
                      paddingTop: "1.1rem",
                      borderTop: j > 0 ? "1px solid #F8EEE6" : "none",
                      marginTop: j > 0 ? "0.25rem" : "1rem",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 0.3rem",
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#5C3825",
                      }}
                    >
                      {item.heading}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        color: "#6B5045",
                        lineHeight: 1.7,
                      }}
                    >
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Contact */}
        <div
          style={{
            background: "#FCEADE",
            border: "1px solid #F0D5C0",
            borderRadius: 14,
            padding: "1.5rem",
            marginTop: "1rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 0.4rem",
              fontSize: 15,
              fontWeight: 600,
              color: "#2A1A0E",
            }}
          >
            Questions about privacy?
          </p>
          <p
            style={{
              margin: "0 0 1rem",
              fontSize: 14,
              color: "#6B4535",
              lineHeight: 1.6,
            }}
          >
            We're a small, real team and we actually read our emails.
          </p>
          <a
            href="mailto:privacy@miwi.app"
            style={{
              display: "inline-block",
              background: "#D97B50",
              color: "#FFF5EE",
              textDecoration: "none",
              borderRadius: 24,
              padding: "0.6rem 1.5rem",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            privacy@miwi.app
          </a>
        </div>
      </div>
    </div>
  );
}
