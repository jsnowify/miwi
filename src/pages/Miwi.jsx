export default function WhatIsMiwi() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          background: "#F9F4EF",
          color: "#1C1410",
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "64px 32px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: "100%", maxWidth: 680 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#C96A3A",
              marginBottom: 16,
            }}
          >
            What is miwi?
          </p>
          <h2
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(32px, 5vw, 48px)",
              lineHeight: 1.12,
              color: "#1C1410",
              fontWeight: 400,
              marginBottom: 24,
            }}
          >
            A soft corner of the internet for{" "}
            <em style={{ fontStyle: "italic", color: "#C96A3A" }}>
              your people.
            </em>
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: "#5A4A3C",
              maxWidth: 540,
            }}
          >
            miwi is a private mood-sharing app built for small, close-knit
            circles — not followers, not an audience. Just a gentle daily
            check-in with the people who actually matter to you. No pressure, no
            algorithms. Just vibes.
          </p>
        </div>
      </div>
    </>
  );
}
