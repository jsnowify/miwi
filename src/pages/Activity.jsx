import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../hooks/useNotifications";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function notificationContent(n) {
  switch (n.type) {
    case "reaction_received":
      return {
        icon: n.reaction,
        iconBg: "#F0E5DB",
        title: (
          <>
            <strong style={{ color: "#1C1410" }}>
              {n.actor?.display_name}
            </strong>
            {" reacted "}
            <span>{n.reaction_label}</span>
            {" to your post"}
          </>
        ),
        subtitle: n.post_mood && `${n.post_mood} ${n.post_caption}`,
      };
    case "new_post":
      return {
        icon: n.post_mood,
        iconBg: "#F0E5DB",
        title: (
          <>
            <strong style={{ color: "#1C1410" }}>
              {n.actor?.display_name}
            </strong>
            {" posted in "}
            <strong style={{ color: "#1C1410" }}>{n.circle_name}</strong>
          </>
        ),
        subtitle: n.post_caption,
      };
    case "member_joined":
      return {
        icon: "👋",
        iconBg: "#E8F3EE",
        title: (
          <>
            <strong style={{ color: "#1C1410" }}>
              {n.actor?.display_name}
            </strong>
            {" joined "}
            <strong style={{ color: "#1C1410" }}>{n.circle_name}</strong>
          </>
        ),
        subtitle: null,
      };
    case "daily_vibe_check":
      return {
        icon: "☁️",
        iconBg: "#EDE8F5",
        title: "How are you feeling today?",
        subtitle: "Tap to share your vibe with your circles.",
        isSystem: true,
      };
    case "memory_ready":
      return {
        icon: "✨",
        iconBg: "#FFF8E8",
        title: (
          <>
            {"Your "}
            <strong style={{ color: "#1C1410" }}>{n.memory_period}</strong>
            {" memory is ready"}
          </>
        ),
        subtitle: `A little recap from ${n.circle_name}.`,
        isSystem: true,
      };
    default:
      return {
        icon: "🔔",
        iconBg: "#F0E5DB",
        title: "New notification",
        subtitle: null,
      };
  }
}

function NotifAvatar({ actor, fallbackIcon, fallbackBg }) {
  if (actor) {
    return (
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: actor.color,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#F9F4EF",
          fontSize: 15,
          fontFamily: "'DM Serif Display', Georgia, serif",
        }}
      >
        {actor.initial ?? actor.display_name?.charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: "50%",
        background: fallbackBg,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
      }}
    >
      {fallbackIcon}
    </div>
  );
}

function NotifRow({ notif, onMarkRead }) {
  const { icon, iconBg, title, subtitle } = notificationContent(notif);
  const unread = !notif.is_read;

  return (
    <div
      onClick={() => unread && onMarkRead(notif.id)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 13,
        padding: "14px 20px",
        borderBottom: "1px solid #F5EDE3",
        background: unread ? "#FFFAF6" : "transparent",
        cursor: unread ? "pointer" : "default",
        transition: "background 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (unread) e.currentTarget.style.background = "#FFF3E8";
      }}
      onMouseLeave={(e) => {
        if (unread) e.currentTarget.style.background = "#FFFAF6";
      }}
    >
      {unread && (
        <div
          style={{
            position: "absolute",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#C96A3A",
            flexShrink: 0,
          }}
        />
      )}
      <div style={{ marginLeft: unread ? 4 : 0, flexShrink: 0 }}>
        <NotifAvatar
          actor={notif.actor}
          fallbackIcon={icon}
          fallbackBg={iconBg}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: "0 0 3px",
            fontSize: 14,
            color: "#5A3A28",
            lineHeight: 1.5,
            fontWeight: unread ? 500 : 400,
          }}
        >
          {title}
        </p>
        {subtitle && (
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "#B09A8A",
              lineHeight: 1.5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "90%",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      <span
        style={{ fontSize: 11, color: "#C0A898", flexShrink: 0, marginTop: 2 }}
      >
        {notif.created_at}
      </span>
    </div>
  );
}

function SectionLabel({ label }) {
  return (
    <div
      style={{
        padding: "12px 20px 6px",
        fontSize: 11,
        fontWeight: 600,
        color: "#B09A8A",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        borderBottom: "1px solid #F5EDE3",
        background: "#F9F4EF",
      }}
    >
      {label}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
        gap: 10,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 4 }}>🌿</div>
      <div
        style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 18,
          color: "#1C1410",
        }}
      >
        all quiet here
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#8A7060",
          lineHeight: 1.7,
          maxWidth: 220,
        }}
      >
        reactions, new posts, and gentle nudges will show up here.
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function Activity() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("activity");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  // ✅ React Query hooks replace manual useState/useEffect
  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Split into today vs earlier
  const todayIds = new Set(notifications.slice(0, 4).map((n) => n.id));
  const todayNotifs = notifications.filter((n) => todayIds.has(n.id));
  const earlierNotifs = notifications.filter((n) => !todayIds.has(n.id));

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
          setActive={(t) => {
            setActiveTab(t);
            if (t === "home") navigate("/feed");
            if (t === "circles") navigate("/circles");
            if (t === "messages") navigate("/messages");
            if (t === "profile") navigate("/profile");
          }}
          onCompose={() => {}}
        />

        <div
          className="md:ml-[80px] pb-[64px] md:pb-0"
          style={{ flex: 1, minWidth: 0 }}
        >
          <div
            style={{
              maxWidth: 600,
              margin: "0 auto",
              minHeight: "100vh",
              borderLeft: "1px solid #EDE3DA",
              borderRight: "1px solid #EDE3DA",
            }}
            className="border-x-0 md:border-x"
          >
            {/* Topbar */}
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                height: 56,
                padding: "0 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(249,244,239,0.95)",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid #EDE3DA",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: 20,
                    color: "#1C1410",
                  }}
                >
                  Activity
                </span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: "#C96A3A",
                      color: "#F9F4EF",
                      fontSize: 11,
                      fontWeight: 700,
                      minWidth: 18,
                      height: 18,
                      borderRadius: 999,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 5px",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#C96A3A",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 8px",
                    borderRadius: 8,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#F0E5DB")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Content */}
            {isLoading ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "64px 24px",
                }}
              >
                <span style={{ fontSize: 13, color: "#8A7060" }}>loading…</span>
              </div>
            ) : notifications.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {todayNotifs.length > 0 && (
                  <>
                    <SectionLabel label="Today" />
                    {todayNotifs.map((n) => (
                      <NotifRow key={n.id} notif={n} onMarkRead={markRead} />
                    ))}
                  </>
                )}
                {earlierNotifs.length > 0 && (
                  <>
                    <SectionLabel label="Earlier" />
                    {earlierNotifs.map((n) => (
                      <NotifRow key={n.id} notif={n} onMarkRead={markRead} />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
