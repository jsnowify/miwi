import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

/* ─── Spring CSS ─────────────────────────────────────────────── */

const SPRING_CSS = `
@keyframes navSpring {
  0%   { transform: scale(1); }
  40%  { transform: scale(0.93); }
  100% { transform: scale(1); }
}
.nav-spring {
  animation: navSpring 0.25s cubic-bezier(0.25, 1.2, 0.5, 1) forwards;
}
`;

if (
  typeof document !== "undefined" &&
  !document.getElementById("miwi-spring")
) {
  const s = document.createElement("style");
  s.id = "miwi-spring";
  s.textContent = SPRING_CSS;
  document.head.appendChild(s);
}

function bounce(el) {
  el.classList.remove("nav-spring");
  void el.offsetWidth;
  el.classList.add("nav-spring");
}

/* ─── Icons ──────────────────────────────────────────────────── */

function HomeIcon({ active }) {
  return active ? (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3a2 2 0 0 0-1.2.4l-7.2 5.6C3.2 9.3 3 9.8 3 10.3V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9.7c0-.5-.2-1-.6-1.3l-7.2-5.6A2 2 0 0 0 12 3z" />
    </svg>
  ) : (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3a2 2 0 0 0-1.2.4l-7.2 5.6C3.2 9.3 3 9.8 3 10.3V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9.7c0-.5-.2-1-.6-1.3l-7.2-5.6A2 2 0 0 0 12 3z" />
    </svg>
  );
}

function CirclesIcon({ active }) {
  return active ? (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="9" cy="9" r="4.5" />
      <circle cx="15" cy="15" r="4.5" />
      <circle cx="15" cy="9" r="4.5" opacity="0.4" />
      <circle cx="9" cy="15" r="4.5" opacity="0.4" />
    </svg>
  ) : (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <circle cx="9" cy="9" r="3.5" />
      <circle cx="15" cy="15" r="3.5" />
      <circle cx="15" cy="9" r="3.5" />
      <circle cx="9" cy="15" r="3.5" />
    </svg>
  );
}

function MessageIcon({ active }) {
  return active ? (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" />
      <path d="M6 12h16" fill="none" stroke="#F9F4EF" strokeWidth="2.5" />
    </svg>
  ) : (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" />
      <path d="M6 12h16" />
    </svg>
  );
}

function HeartIcon({ active }) {
  return active ? (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21C12 21 3 14.5 3 8.5A5 5 0 0 1 12 6a5 5 0 0 1 9 2.5C21 14.5 12 21 12 21z" />
    </svg>
  ) : (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21C12 21 3 14.5 3 8.5A5 5 0 0 1 12 6a5 5 0 0 1 9 2.5C21 14.5 12 21 12 21z" />
    </svg>
  );
}

function UserIcon({ active }) {
  return active ? (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" />
    </svg>
  ) : (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.58-6 8-6s8 2 8 6" />
    </svg>
  );
}

/* ─── Nav button ─────────────────────────────────────────────── */

function NavBtn({ active, onClick, children, label }) {
  return (
    <button
      onClick={(e) => {
        bounce(e.currentTarget);
        onClick?.();
      }}
      title={label}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 48,
        height: 48,
        borderRadius: 16,
        border: "none",
        cursor: "pointer",
        background: active ? "#F0E5DB" : "transparent",
        color: active ? "#C96A3A" : "#B09A8A",
        transition: "background 0.2s, color 0.2s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "#F5EDE3";
          e.currentTarget.style.color = "#5A3A28";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "#B09A8A";
        }
      }}
    >
      {children}
    </button>
  );
}

function ComposeBtn({ onClick }) {
  return (
    <button
      onClick={(e) => {
        bounce(e.currentTarget);
        onClick?.();
      }}
      title="New post"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 48,
        height: 48,
        borderRadius: 14,
        border: "none",
        cursor: "pointer",
        background: "#F0E5DB",
        color: "#1C1410",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#E8D5C4")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#F0E5DB")}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  );
}

/* ─── Circles button for mobile topbar ──────────────────────── */

export function CirclesTopbarBtn({ active, onClick }) {
  return (
    <button
      onClick={(e) => {
        bounce(e.currentTarget);
        onClick?.();
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "8px 16px",
        borderRadius: 999,
        border: "none",
        cursor: "pointer",
        background: active ? "#F0E5DB" : "#F5EDE3",
        color: active ? "#C96A3A" : "#8A7060",
        fontSize: 14,
        fontWeight: 600,
        transition: "background 0.2s, color 0.2s",
      }}
    >
      <CirclesIcon active={active} />
      <span>Circles</span>
    </button>
  );
}

/* ─── Mobile bottom nav ──────────────────────────────────────── */

function MobileNav({ active, setActive, onCompose }) {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        background: "rgba(249,244,239,0.95)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderTop: "1px solid #EDE3DA",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 8px",
        }}
      >
        {/* Home */}
        <NavBtn
          active={active === "home"}
          onClick={() => setActive("home")}
          label="Home"
        >
          <HomeIcon active={active === "home"} />
        </NavBtn>

        {/* Messages */}
        <NavBtn
          active={active === "messages"}
          onClick={() => setActive("messages")}
          label="Messages"
        >
          <MessageIcon active={active === "messages"} />
        </NavBtn>

        {/* Compose (center) */}
        <ComposeBtn onClick={onCompose} />

        {/* Notifications */}
        <NavBtn
          active={active === "activity"}
          onClick={() => setActive("activity")}
          label="Notifications"
        >
          <HeartIcon active={active === "activity"} />
        </NavBtn>

        {/* Profile */}
        <NavBtn
          active={active === "profile"}
          onClick={() => setActive("profile")}
          label="Profile"
        >
          <UserIcon active={active === "profile"} />
        </NavBtn>
      </div>
    </nav>
  );
}

/* ─── Desktop left sidebar ───────────────────────────────────── */

function DesktopSidebar({ active, setActive, onCompose, navigate }) {
  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: 80,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 24,
        paddingBottom: 24,
        background: "#F9F4EF",
        borderRight: "1px solid #EDE3DA",
      }}
    >
      {/* Logo */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          paddingTop: 4,
        }}
      >
        <span
          onClick={() => window.scrollTo(0, 0)}
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 30,
            color: "#1C1410",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          m
        </span>
      </div>

      {/* Main nav: Home | Circles | + | Notifications | Profile */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <NavBtn
          active={active === "home"}
          onClick={() => setActive("home")}
          label="Home"
        >
          <HomeIcon active={active === "home"} />
        </NavBtn>

        <NavBtn
          active={active === "circles"}
          onClick={() => setActive("circles")}
          label="Circles"
        >
          <CirclesIcon active={active === "circles"} />
        </NavBtn>

        <ComposeBtn onClick={onCompose} />

        <NavBtn
          active={active === "activity"}
          onClick={() => setActive("activity")}
          label="Notifications"
        >
          <HeartIcon active={active === "activity"} />
        </NavBtn>

        <NavBtn
          active={active === "profile"}
          onClick={() => setActive("profile")}
          label="Profile"
        >
          <UserIcon active={active === "profile"} />
        </NavBtn>
      </div>

      {/* Bottom utilities */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 16,
          paddingBottom: 8,
        }}
      >
        <NavBtn onClick={() => {}}>
          <i className="ti ti-pin" style={{ fontSize: 26, strokeWidth: 2.5 }} />
        </NavBtn>
        <NavBtn onClick={() => navigate("/")}>
          <i
            className="ti ti-menu-2"
            style={{ fontSize: 26, strokeWidth: 2.5 }}
          />
        </NavBtn>
      </div>
    </nav>
  );
}

/* ─── Exported Navbar ────────────────────────────────────────── */

export default function Navbar({ active, setActive, onCompose }) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  if (isMobile) {
    return (
      <MobileNav active={active} setActive={setActive} onCompose={onCompose} />
    );
  }

  return (
    <DesktopSidebar
      active={active}
      setActive={setActive}
      onCompose={onCompose}
      navigate={navigate}
    />
  );
}
