export default function ChatView({ contact, onBack, isMobile }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "#F9F4EF",
        borderLeft: "1px solid #EDE3DA",
        height: isMobile ? "100dvh" : "100vh",
        ...(isMobile && {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 30,
        }),
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 56,
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid #EDE3DA",
          background: "rgba(249,244,239,0.95)",
          backdropFilter: "blur(12px)",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {isMobile && (
          <button
            onClick={onBack}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              color: "#5A3A28",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="#5A3A28"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: contact.rounded ? 12 : "50%",
            background: contact.avatarColor,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#F9F4EF",
            fontSize: 14,
            fontFamily: "'DM Serif Display', Georgia, serif",
          }}
        >
          {contact.avatar}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#1C1410",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {contact.name}
          </div>
          <div style={{ fontSize: 11, color: "#8A7060" }}>
            {contact.rounded ? "Group · tap to see members" : "Active recently"}
          </div>
        </div>

        <button
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            color: "#8A7060",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#F0E5DB")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="5" cy="12" r="1.5" fill="#8A7060" />
            <circle cx="12" cy="12" r="1.5" fill="#8A7060" />
            <circle cx="19" cy="12" r="1.5" fill="#8A7060" />
          </svg>
        </button>
      </div>

      {/* Messages area — empty state */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: contact.rounded ? 18 : "50%",
            background: contact.avatarColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#F9F4EF",
            fontSize: 22,
            fontFamily: "'DM Serif Display', Georgia, serif",
            marginBottom: 8,
          }}
        >
          {contact.avatar}
        </div>
        <div
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 18,
            color: "#1C1410",
          }}
        >
          {contact.name}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#8A7060",
            maxWidth: 240,
            lineHeight: 1.6,
          }}
        >
          {contact.rounded
            ? "This is the beginning of your group conversation."
            : "This is the beginning of your conversation."}
        </div>
      </div>

      {/* Input bar */}
      <div
        style={{
          padding: "12px 16px",
          paddingBottom: isMobile
            ? "calc(76px + env(safe-area-inset-bottom))"
            : 12,
          borderTop: "1px solid #EDE3DA",
          background: "#F9F4EF",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            background: "#EDE3DA",
            borderRadius: 24,
            padding: "10px 16px",
            gap: 8,
          }}
        >
          <input
            type="text"
            placeholder={`Message ${contact.name}…`}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              fontSize: 14,
              color: "#1C1410",
              outline: "none",
              fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>
        <button
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            border: "none",
            background: "#C96A3A",
            color: "#F9F4EF",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.15s, transform 0.1s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#B05A2E")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#C96A3A")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.93)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M3.4 3.05a.5.5 0 0 0-.68.63l2.84 7.63a2 2 0 0 1 0 1.4L2.72 20.3a.5.5 0 0 0 .68.63l18-8.5a.5.5 0 0 0 0-.9l-18-8.5Z"
              fill="#F9F4EF"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
