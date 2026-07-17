import { useState } from "react";

const sections = [
  {
    emoji: "✨",
    title: "Who can use Miwi",
    content: [
      {
        heading: "Age requirement",
        body: "You must be at least 13 years old to use Miwi. If you're between 13 and 18, you should have a parent or guardian's permission.",
      },
      {
        heading: "One account per person",
        body: "Each person gets one Miwi account. Creating multiple accounts — for example, to evade a ban or impersonate someone — is not allowed.",
      },
      {
        heading: "Accurate information",
        body: "Please use your real name or a name people who know you will recognize. Miwi works best when people know who they're sharing with.",
      },
    ],
  },
  {
    emoji: "🌿",
    title: "What Miwi is for",
    content: [
      {
        heading: "Private sharing with people you trust",
        body: "Miwi is designed for small, close circles — not broadcasting to strangers. Circles are invite-only and capped at 10 people.",
      },
      {
        heading: "Honest, authentic check-ins",
        body: "Share how you're actually feeling. Miwi isn't the place for curated performance — it's for real moments with the people who matter.",
      },
      {
        heading: "Kind and supportive vibes",
        body: "The reactions in Miwi (Same, Thinking of you, Sending a hug) are designed to connect, not compete. Use them in the spirit they were made.",
      },
    ],
  },
  {
    emoji: "🌪️",
    title: "What's not allowed",
    content: [
      {
        heading: "Harassment and abuse",
        body: "Don't use Miwi to harass, threaten, or demean anyone — whether they're in your circle or not. This includes persistent unwanted contact, hate speech, and targeted cruelty.",
      },
      {
        heading: "Impersonation",
        body: "Don't pretend to be someone you're not — another person, a public figure, or a fictional brand. Use your real identity.",
      },
      {
        heading: "Spam and fake circles",
        body: "Don't create circles to spam people, farm reactions, or run coordinated manipulation campaigns. Miwi isn't a broadcast tool.",
      },
      {
        heading: "Illegal content",
        body: "Don't post anything illegal — including content that sexualizes minors, content that promotes violence, or material that violates someone's privacy without consent.",
      },
      {
        heading: "Scraping and automation",
        body: "Don't use bots, scrapers, or automated tools to access Miwi. Our API (if and when available) will have its own terms.",
      },
    ],
  },
  {
    emoji: "🤍",
    title: "Your content",
    content: [
      {
        heading: "You own what you post",
        body: "You keep ownership of the mood posts, captions, and photos you share on Miwi. We don't claim any rights to your content.",
      },
      {
        heading: "License to run the app",
        body: "By posting, you give Miwi a limited license to store and display your content to the people you choose to share it with. We use this only to operate the app — never to advertise or sell.",
      },
      {
        heading: "Content you can delete",
        body: "You can delete any of your posts at any time. Once deleted, it's removed from the feed immediately. Miwi Memories that have already been generated may retain a reference to that post for up to 30 days.",
      },
      {
        heading: "Content moderation",
        body: "We may remove content that violates these Terms, even without notice. Repeated violations may result in account suspension or permanent removal.",
      },
    ],
  },
  {
    emoji: "🫂",
    title: "Circles and membership",
    content: [
      {
        heading: "Creating a circle",
        body: "When you create a circle, you're responsible for managing it. You can invite up to 10 members, remove people, or delete the circle entirely.",
      },
      {
        heading: "Joining a circle",
        body: "You join a circle by accepting an invite link or code from someone you trust. Miwi doesn't join you to circles without your knowledge.",
      },
      {
        heading: "Leaving a circle",
        body: "You can leave any circle at any time from Circle Settings. Your past posts in that circle will remain visible to remaining members unless you delete them manually.",
      },
      {
        heading: "Invite responsibility",
        body: "If you share an invite link, you're responsible for who uses it. If someone misuses access from your link, we may ask you to revoke it.",
      },
    ],
  },
  {
    emoji: "🔥",
    title: "Miwi Plus (paid features)",
    content: [
      {
        heading: "What's included",
        body: "Miwi Plus includes custom mood tags, themed circle backgrounds, extended Memories archive, and longer post history. Features may change over time.",
      },
      {
        heading: "Billing",
        body: "Miwi Plus is billed monthly or annually. You'll be charged on the day you subscribe and on each renewal date. Prices are shown before you confirm.",
      },
      {
        heading: "Cancellation",
        body: "You can cancel Miwi Plus at any time. Your Plus features stay active until the end of your current billing period. We don't offer prorated refunds for partial months.",
      },
      {
        heading: "Refunds",
        body: "If you were charged in error or experienced a significant technical issue, contact support@miwi.app and we'll sort it out fairly.",
      },
    ],
  },
  {
    emoji: "🍃",
    title: "Disclaimers and limits",
    content: [
      {
        heading: "No guarantees on uptime",
        body: "We do our best to keep Miwi running smoothly, but we can't promise it'll always be available. We're not liable for missed moments or data loss caused by downtime.",
      },
      {
        heading: "Emotional content",
        body: "Miwi is a place to share real feelings, including hard ones. We're not a mental health service. If you or someone in your circle is in crisis, please reach out to a professional or call a helpline.",
      },
      {
        heading: "Limitation of liability",
        body: "To the extent permitted by law, Miwi's total liability for any claim arising from your use of the app is limited to the amount you paid us in the 12 months before the claim.",
      },
    ],
  },
  {
    emoji: "🌙",
    title: "Changes and termination",
    content: [
      {
        heading: "Changes to these Terms",
        body: "We may update these Terms from time to time. If we make significant changes, we'll notify you in the app and by email at least 14 days in advance.",
      },
      {
        heading: "Account suspension",
        body: "We may suspend or terminate your account if you seriously or repeatedly violate these Terms. We'll try to tell you why, unless doing so would cause harm or compromise an investigation.",
      },
      {
        heading: "You can leave anytime",
        body: "You can delete your Miwi account at any time from Settings. See our Privacy Policy for what happens to your data after deletion.",
      },
    ],
  },
];

export default function TermsOfService() {
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
            <span style={{ fontSize: 32 }}>🫂</span>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 700,
                color: "#2A1A0E",
                letterSpacing: "-0.5px",
              }}
            >
              Terms of Service
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
            A few ground rules for keeping Miwi a warm and safe space for
            everyone.
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
            <strong style={{ color: "#3B2A20" }}>The short version:</strong> Be
            yourself, be kind, share honestly. Don't use Miwi to harm people.
            Your content is yours. We'll always be upfront with you.
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

        {/* Governing law note */}
        <div
          style={{
            background: "#F8EEE6",
            border: "1px solid #EDCFB5",
            borderRadius: 14,
            padding: "1.25rem 1.5rem",
            marginBottom: "0.75rem",
          }}
        >
          <p
            style={{
              margin: "0 0 0.4rem",
              fontSize: 14,
              fontWeight: 600,
              color: "#3B2A20",
            }}
          >
            Governing law
          </p>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: "#6B4535",
              lineHeight: 1.7,
            }}
          >
            These Terms are governed by the laws of the jurisdiction where Miwi
            is incorporated. If you have a dispute with us, we'd always rather
            work it out directly first — email us at legal@miwi.app.
          </p>
        </div>

        {/* Contact */}
        <div
          style={{
            background: "#FCEADE",
            border: "1px solid #F0D5C0",
            borderRadius: 14,
            padding: "1.5rem",
            marginTop: "0.25rem",
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
            Questions about these Terms?
          </p>
          <p
            style={{
              margin: "0 0 1rem",
              fontSize: 14,
              color: "#6B4535",
              lineHeight: 1.6,
            }}
          >
            We're happy to explain anything in plain language.
          </p>
          <a
            href="mailto:legal@miwi.app"
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
            legal@miwi.app
          </a>
        </div>
      </div>
    </div>
  );
}
