import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar, { CirclesTopbarBtn } from "../components/Navbar";
import ComposeSheet from "../components/ComposeSheet";
import MessagesPanel from "../components/MessagesPanel";
import { useFeed } from "../hooks/useFeed";

const AVATAR_COLORS = [
  "#C96A3A",
  "#8B5E3C",
  "#B07D62",
  "#7A9E8A",
  "#9E7A8A",
  "#6A8A9E",
  "#9E6A8A",
  "#7A6A9E",
];

function colorForId(id) {
  if (!id) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/* ─── Avatar (shared by story ring + post) ─────────────────── */

function PersonAvatar({ author, size, ring }) {
  const initial = author?.display_name?.charAt(0).toUpperCase() ?? "?";
  const img = author?.avatar_url ? (
    <img
      src={author.avatar_url}
      alt={author.display_name}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        border: `${ring ? 2.5 : 3}px solid #F9F4EF`,
        objectFit: "cover",
      }}
    />
  ) : (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        background: colorForId(author?.id),
        border: `${ring ? 2.5 : 3}px solid #F9F4EF`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#F9F4EF",
        fontSize: size * 0.36,
        fontFamily: "'DM Serif Display', Georgia, serif",
      }}
    >
      {initial}
    </div>
  );

  if (!ring) return <div style={{ width: size, height: size }}>{img}</div>;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        padding: 2.5,
        background: ring
          ? "linear-gradient(135deg, #C96A3A, #E8B89A)"
          : "transparent",
      }}
    >
      {img}
    </div>
  );
}

/* ─── Story ring ────────────────────────────────────────────── */

function StoryRing({ author, hasNew }) {
  return (
    <div className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0">
      <PersonAvatar author={author} size={52} ring={hasNew} />
      <span style={{ fontSize: 11, color: "#8A7060" }}>@{author.username}</span>
    </div>
  );
}

/* ─── Single post ───────────────────────────────────────────── */

function Post({ post, visible }) {
  const reactionMap = (post.reactions ?? []).reduce((acc, r) => {
    acc[r.reaction] = (acc[r.reaction] ?? 0) + 1;
    return acc;
  }, {});
  const reactions = Object.entries(reactionMap).map(([emoji, count]) => ({
    emoji,
    count,
  }));

  const circleName = post.circles?.name || post.circle?.name;

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        paddingBottom: 20,
        borderBottom: "1px solid #EDE3DA",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      <PersonAvatar author={post.author} size={40} ring={false} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header: Author + Circle + Mood + Time */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 4,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: "#1C1410" }}>
              {post.author?.username ?? "someone"}
            </span>

            {circleName && (
              <>
                <i
                  className="ti ti-chevron-right"
                  style={{ fontSize: 14, color: "#8A7060" }}
                />
                <span
                  style={{ fontSize: 14, fontWeight: 400, color: "#8A7060" }}
                >
                  {circleName}
                </span>
              </>
            )}
          </div>

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
              {post.mood} {post.mood_label}
            </span>
          )}
          <span style={{ fontSize: 12, color: "#B09A8A", marginLeft: "auto" }}>
            {timeAgo(post.created_at)}
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

        {/* Media Renderer: Image */}
        {post.media_attachment?.type === "image" && (
          <div style={{ marginTop: 12 }}>
            <img
              src={post.media_attachment.url}
              alt="Post attachment"
              style={{
                width: "100%",
                maxHeight: 400,
                objectFit: "cover",
                borderRadius: 14,
                border: "1px solid #EDE3DA",
              }}
            />
          </div>
        )}

        {/* Media Renderer: Audio/Song */}
        {post.media_attachment?.type === "song" &&
          post.media_attachment.preview_url && (
            <div
              style={{
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                background: "#F5EDE3",
                borderRadius: 14,
                border: "1px solid #EDE3DA",
              }}
            >
              <img
                src={post.media_attachment.cover_url}
                alt="Song cover"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 8,
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#1C1410",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {post.media_attachment.title}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#8A7060",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginBottom: 6,
                  }}
                >
                  {post.media_attachment.artist}
                </div>

                <audio
                  controls
                  src={post.media_attachment.preview_url}
                  style={{
                    height: 32,
                    width: "100%",
                    maxWidth: 250,
                    outline: "none",
                  }}
                />
              </div>
            </div>
          )}

        {/* Actions bar */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {reactions.map((r) => (
            <button
              key={r.emoji}
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

function EmptyFeed() {
  const navigate = useNavigate();
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
        it's quiet here
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#8A7060",
          lineHeight: 1.7,
          maxWidth: 240,
        }}
      >
        join or create a circle, then share how you're feeling to get things
        going.
      </div>

      <button
        onClick={() => navigate("/circles")}
        style={{
          marginTop: 12,
          padding: "10px 20px",
          borderRadius: 999,
          border: "none",
          background: "#C96A3A",
          color: "#F9F4EF",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Browse Circles
      </button>
    </div>
  );
}

/* ─── Feed page ─────────────────────────────────────────────── */

export default function Feed() {
  const navigate = useNavigate();
  const { data: posts = [], isLoading } = useFeed();
  const [composing, setComposing] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const [isDesktopWide, setIsDesktopWide] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1280 : false,
  );

  useEffect(() => {
    const handle = () => {
      setIsMobile(window.innerWidth < 768);
      setIsDesktopWide(window.innerWidth >= 1280);
    };
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const t = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  const storyAuthors = useMemo(() => {
    const seen = new Map();
    for (const post of posts) {
      if (!post.author || seen.has(post.author.id)) continue;
      const hasNew =
        Date.now() - new Date(post.created_at).getTime() < 1000 * 60 * 60 * 24;
      seen.set(post.author.id, { author: post.author, hasNew });
    }
    return Array.from(seen.values());
  }, [posts]);

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
          onCompose={() => setComposing(true)}
        />

        {/* Center feed */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            justifyContent: isMobile ? "stretch" : "center",
            transition: "all 0.2s ease",
          }}
          className="md:ml-[80px] pb-[64px] md:pb-0"
        >
          <div
            style={{
              width: "100%",
              maxWidth: isDesktopWide ? 720 : 600,
              minHeight: "100vh",
              borderLeft: "1px solid #EDE3DA",
              borderRight: "1px solid #EDE3DA",
              transition: "max-width 0.2s ease",
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
            {storyAuthors.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  padding: isDesktopWide ? "20px 32px" : "16px 20px",
                  borderBottom: "1px solid #EDE3DA",
                  overflowX: "auto",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {storyAuthors.map(({ author, hasNew }) => (
                  <StoryRing key={author.id} author={author} hasNew={hasNew} />
                ))}
              </div>
            )}

            {/* Posts */}
            <div
              style={{
                padding: isDesktopWide ? "24px 32px 48px" : "20px 20px 40px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {isLoading ? (
                <p
                  style={{
                    fontSize: 13,
                    color: "#8A7060",
                    textAlign: "center",
                    padding: "24px 0",
                  }}
                >
                  loading your circle's vibes…
                </p>
              ) : posts.length === 0 ? (
                <EmptyFeed />
              ) : (
                posts.map((post) => (
                  <Post key={post.id} post={post} visible={visible} />
                ))
              )}
            </div>
          </div>
        </div>

        {!isMobile && <MessagesPanel variant="sidebar" />}
      </div>

      {composing && <ComposeSheet onClose={() => setComposing(false)} />}
    </>
  );
}
