import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import MessagesPanel from "../components/MessagesPanel";
import ChatView from "../components/ChatView";

export default function Messages() {
  const [activeTab, setActiveTab] = useState("messages");
  const [selected, setSelected] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  /* On desktop, if the user resizes from mobile to desktop
     while a chat is open, keep it open — no need to reset */

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />

      <div
        style={{ minHeight: "100vh", display: "flex", background: "#F9F4EF" }}
      >
        <Navbar
          active={activeTab}
          setActive={setActiveTab}
          onCompose={() => {}}
        />

        <div
          className="md:ml-[80px] pb-[64px] md:pb-0"
          style={{ flex: 1, minWidth: 0, display: "flex" }}
        >
          {/*
            Layout logic:
            ┌─────────────────────────────────────────┐
            │ Mobile (<768px)                         │
            │   No chat open → full-width list        │
            │   Chat open    → ChatView overlays      │
            ├─────────────────────────────────────────┤
            │ Tablet / Desktop (≥768px)               │
            │   List (340px) │ ChatView or empty state│
            └─────────────────────────────────────────┘
          */}

          {/* List — hidden on mobile when chat is open */}
          <div
            style={{
              width: isMobile ? "100%" : 340,
              flexShrink: 0,
              borderRight: !isMobile ? "1px solid #EDE3DA" : "none",
              display: isMobile && selected ? "none" : "flex",
              flexDirection: "column",
              overflowY: "auto",
              /* sticky so the header inside MessagesPanel scrolls correctly */
              height: "100vh",
              position: "sticky",
              top: 0,
            }}
          >
            <MessagesPanel
              variant="page"
              onSelect={setSelected}
              selectedId={selected?.id}
            />
          </div>

          {/* Chat panel or desktop empty state */}
          {selected ? (
            <ChatView
              contact={selected}
              isMobile={isMobile}
              onBack={() => setSelected(null)}
            />
          ) : (
            !isMobile && (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  textAlign: "center",
                  padding: "40px 24px",
                }}
              >
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3C7.03 3 3 6.58 3 11c0 2.07.86 3.95 2.27 5.36L4 21l4.91-1.55A9.3 9.3 0 0 0 12 20c4.97 0 9-3.58 9-9s-4.03-8-9-8Z"
                    stroke="#D4BFB0"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div
                  style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: 20,
                    color: "#1C1410",
                  }}
                >
                  your messages
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#8A7060",
                    maxWidth: 220,
                    lineHeight: 1.7,
                  }}
                >
                  select a conversation to start chatting
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
