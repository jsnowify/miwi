import { useState, useEffect } from "react";
import Navbar, { CirclesTopbarBtn } from "../components/Navbar";
import ComposeSheet from "../components/ComposeSheet";
import { MOCK_THREADS } from "../../data";

/* ─── Story ring at the top of feed ────────────────────────── */

function StoryRing({ post, hasNew }) {
  return (
    <div className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0">
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          padding: 2.5,
          background: hasNew
            ? "linear-gradient(135deg, #C96A3A, #E8B89A)"
            : "transparent",
          border: hasNew ? "none" : "2px solid #E8DDD5",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: post.avatarColor,
            border: "2.5px solid #F9F4EF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#F9F4EF",
            fontSize: 16,
            fontFamily: "'DM Serif Display', Georgia, serif",
          }}
        >
          {post.avatar}
        </div>
      </div>
      <span style={{ fontSize: 11, color: "#8A7060" }}>{post.handle}</span>
    </div>
  );
}

/* ─── Single post inside a thread ──────────────────────────── */

function Post({ post, isLast }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        position: "relative",
        marginBottom: 8,
      }}
    >
      {/* Avatar column */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: post.avatarColor,
            border: "3px solid #F9F4EF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#F9F4EF",
            fontSize: 15,
            flexShrink: 0,
            zIndex: 1,
            fontFamily: "'DM Serif Display', Georgia, serif",
          }}
        >
          {post.avatar}
        </div>
        {!isLast && (
          <div
            style={{
              width: 2,
              flex: 1,
              marginTop: 4,
              marginBottom: -8,
              borderRadius: 2,
              background: "#EDE3DA",
            }}
          />
        )}
      </div>

      {/* Content column */}
      <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 8 : 20 }}>
        {/* Name + mood tag + time */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 4,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 14, color: "#1C1410" }}>
            {post.name}
          </span>
          {post.mood && (
            <span
              style={{
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 999,
                background: "#F0E5DB",
                color: "#A05A3A",
              }}
            >
              {post.mood} {post.moodLabel}
            </span>
          )}
          <span style={{ fontSize: 12, color: "#B09A8A", marginLeft: "auto" }}>
            {post.time}
          </span>
        </div>

        {/* Caption */}
        {post.caption && (
          <p
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.6,
              color: "#3D2B1F",
              wordBreak: "break-word",
            }}
          >
            {post.caption}
          </p>
        )}

        {/* Reactions + reply */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {post.reactions?.map((r) => (
            <button
              key={r.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 12px",
                borderRadius: 999,
                border: "none",
                background: "#F5EDE3",
                color: "#8A7060",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {r.emoji} <span style={{ fontSize: 12 }}>{r.count}</span>
            </button>
          ))}
          <button
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              color: "#B09A8A",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#8A7060")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#B09A8A")}
          >
            <i
              className="ti ti-message-circle"
              style={{ fontSize: 24, strokeWidth: 2.5 }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Thread card ───────────────────────────────────────────── */

function Thread({ thread, visible }) {
  return (
    <div
      style={{
        paddingBottom: 12,
        borderBottom: "1px solid #EDE3DA",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      {thread.map((post, i) => (
        <Post key={post.id} post={post} isLast={i === thread.length - 1} />
      ))}
    </div>
  );
}

/* ─── Mock Messages panel (desktop right side) ──────────────── */

const MOCK_DMS = [
  {
    id: 1,
    name: "sofía",
    avatar: "S",
    avatarColor: "#C96A3A",
    preview: "omg same 🌿 i needed that too",
    time: "2m",
    unread: true,
  },
  {
    id: 2,
    name: "marco",
    avatar: "M",
    avatarColor: "#8B5E3C",
    preview: "bro we need to celebrate!!!",
    time: "15m",
    unread: true,
  },
  {
    id: 3,
    name: "lea",
    avatar: "L",
    avatarColor: "#B07D62",
    preview: "hahaha the suitcase is still there",
    time: "1h",
    unread: false,
  },
  {
    id: 4,
    name: "juno",
    avatar: "J",
    avatarColor: "#7A9E8A",
    preview: "how are you feeling today?",
    time: "3h",
    unread: false,
  },
];

function MessagesPanel() {
  const [selectedDm, setSelectedDm] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      style={{
        width: isExpanded ? 280 : 80,
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "#F9F4EF",
        borderLeft: "1px solid #EDE3DA",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        transition: "width 0.3s ease",
        overflow: "hidden", // Clips interior elements flawlessly when shrunk
      }}
    >
      {/* Header */}
      <div
        style={{
          width: 280,
          padding: "20px 21px 12px",
          borderBottom: "1px solid #EDE3DA",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? "Collapse messages" : "Expand messages"}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            color: "#8A7060",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#F0E5DB")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <i
            className={`ti ${isExpanded ? "ti-chevron-right" : "ti-chevron-left"}`}
            style={{ fontSize: 24, strokeWidth: 2.5 }}
          />
        </button>
        <span
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 18,
            color: "#1C1410",
            whiteSpace: "nowrap",
          }}
        >
          Messages
        </span>
      </div>

      {/* DM list */}
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {MOCK_DMS.map((dm) => (
          <button
            key={dm.id}
            onClick={() => setSelectedDm(dm.id === selectedDm ? null : dm.id)}
            style={{
              width: 280,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 21px",
              background: selectedDm === dm.id ? "#F0E5DB" : "transparent",
              border: "none",
              borderBottom: "1px solid #F5EDE3",
              cursor: "pointer",
              textAlign: "left",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              if (selectedDm !== dm.id)
                e.currentTarget.style.background = "#FAF3EC";
            }}
            onMouseLeave={(e) => {
              if (selectedDm !== dm.id)
                e.currentTarget.style.background = "transparent";
            }}
          >
            {/* Avatar */}
            <div
              style={{
                position: "relative",
                flexShrink: 0,
                width: 38,
                height: 38,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: dm.avatarColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#F9F4EF",
                  fontSize: 14,
                  fontFamily: "'DM Serif Display', Georgia, serif",
                }}
              >
                {dm.avatar}
              </div>
              {dm.unread && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 1,
                    right: 1,
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: "#C96A3A",
                    border: "2px solid #F9F4EF",
                  }}
                />
              )}
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: dm.unread ? 600 : 400,
                    color: "#1C1410",
                    whiteSpace: "nowrap",
                  }}
                >
                  {dm.name}
                </span>
                <span style={{ fontSize: 11, color: "#B09A8A" }}>
                  {dm.time}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: dm.unread ? "#5A3A28" : "#8A7060",
                  fontWeight: dm.unread ? 500 : 400,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {dm.preview}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* New message button */}
      <div
        style={{
          width: 280,
          padding: "16px 21px",
          borderTop: "1px solid #EDE3DA",
        }}
      >
        <button
          style={{
            width: isExpanded ? 238 : 38,
            height: 38,
            borderRadius: isExpanded ? 999 : 14,
            border: "none",
            background: "#F0E5DB",
            color: "#7A4A2A",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#E8D5C4")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#F0E5DB")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ flexShrink: 0 }}
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          {isExpanded && (
            <span style={{ marginLeft: 8, whiteSpace: "nowrap" }}>
              New message
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Feed page ─────────────────────────────────────────────── */

export default function Feed() {
  const [threads, setThreads] = useState(MOCK_THREADS);
  const [composing, setComposing] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [visible, setVisible] = useState(MOCK_THREADS.map(() => false));
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  useEffect(() => {
    const timers = threads.map((_, i) =>
      setTimeout(
        () => {
          setVisible((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        },
        i * 120 + 200,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  function handlePost({ mood, caption }) {
    const newPost = {
      id: Date.now(),
      name: "you",
      handle: "you",
      avatar: "Y",
      avatarColor: "#C96A3A",
      mood: mood.emoji,
      moodLabel: mood.tag,
      caption: caption || "",
      time: "just now",
      reactions: [],
    };
    setThreads([[newPost], ...threads]);
    setVisible([false, ...visible]);
    setTimeout(() => {
      setVisible((prev) => {
        const next = [...prev];
        next[0] = true;
        return next;
      });
    }, 50);
  }

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
        {/* Left sidebar (desktop only — rendered by Navbar) */}
        <Navbar
          active={activeTab}
          setActive={setActiveTab}
          onCompose={() => setComposing(true)}
        />

        {/* Center content */}
        <div
          style={{ flex: 1, minWidth: 0, transition: "flex 0.3s ease" }}
          className="md:ml-[80px] pb-[64px] md:pb-0"
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
            {/* ── Mobile sticky topbar ── */}
            <div
              className="md:hidden sticky top-0 z-20 flex justify-between items-center px-4"
              style={{
                height: 56,
                background: "rgba(249,244,239,0.92)",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid #EDE3DA",
              }}
            >
              {/* Logo */}
              <span
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 22,
                  color: "#1C1410",
                }}
              >
                miwi
              </span>

              {/* Circles button — right side of topbar on mobile */}
              <CirclesTopbarBtn
                active={activeTab === "circles"}
                onClick={() =>
                  setActiveTab((t) => (t === "circles" ? "home" : "circles"))
                }
              />
            </div>

            {/* ── Desktop sticky header ── */}
            <div
              className="hidden md:flex sticky top-0 z-20 justify-center items-center"
              style={{
                height: 60,
                background: "rgba(249,244,239,0.92)",
                backdropFilter: "blur(12px)",
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 15, color: "#1C1410" }}>
                For you
              </span>
            </div>

            {/* Story rings */}
            <div
              style={{
                display: "flex",
                gap: 16,
                padding: "16px 20px",
                borderBottom: "1px solid #EDE3DA",
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {threads.map((thread, i) => (
                <StoryRing
                  key={`story-${thread[0].id}`}
                  post={thread[0]}
                  hasNew={i < 2}
                />
              ))}
            </div>

            {/* Threads feed */}
            <div
              style={{
                padding: "20px 20px 40px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {threads.map((thread, i) => (
                <Thread
                  key={`thread-${thread[0].id}`}
                  thread={thread}
                  visible={visible[i]}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel: Messages (desktop only) ── */}
        {!isMobile && <MessagesPanel />}
      </div>

      {composing && (
        <ComposeSheet onClose={() => setComposing(false)} onPost={handlePost} />
      )}
    </>
  );
}
