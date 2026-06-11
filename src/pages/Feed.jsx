import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar, { CirclesTopbarBtn } from "../components/Navbar";
import ComposeSheet from "../components/ComposeSheet";
import MessagesPanel from "../components/MessagesPanel";
import { MOCK_THREADS } from "../../data";

/* ─── Story ring ────────────────────────────────────────────── */

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

/* ─── Single post ───────────────────────────────────────────── */

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

      <div style={{ flex: 1, minWidth: 0, paddingBottom: isLast ? 8 : 20 }}>
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

/* ─── Feed page ─────────────────────────────────────────────── */

export default function Feed() {
  const navigate = useNavigate();
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
        {/* Left sidebar nav */}
        <Navbar
          active={activeTab}
          setActive={setActiveTab}
          onCompose={() => setComposing(true)}
        />

        {/* Center feed */}
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
            {/* Mobile topbar */}
            <div
              className="md:hidden sticky top-0 z-20 flex justify-between items-center px-4"
              style={{
                height: 56,
                background: "rgba(249,244,239,0.92)",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid #EDE3DA",
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 22,
                  color: "#1C1410",
                }}
              >
                miwi
              </span>
              <CirclesTopbarBtn
                active={activeTab === "circles"}
                onClick={() => {
                  setActiveTab("circles");
                  navigate("/circles");
                }}
              />
            </div>

            {/* Desktop header */}
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

            {/* Threads */}
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

        {/* Right messages sidebar — desktop only */}
        {!isMobile && <MessagesPanel variant="sidebar" />}
      </div>

      {composing && (
        <ComposeSheet onClose={() => setComposing(false)} onPost={handlePost} />
      )}
    </>
  );
}
