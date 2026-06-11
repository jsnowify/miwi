import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SettingsSheet from "../components/SettingsSheet";
import { useProfile } from "../hooks/useProfile";

/* ─── Mock posts ─────────────────────────────────────────────── */
const MOCK_POSTS = [
  {
    id: 1,
    mood: "🌿",
    moodLabel: "calm",
    caption:
      "sat outside for an hour and didn't look at my phone once. needed that.",
    time: "2m ago",
    reactions: [
      { emoji: "🌿", count: 8 },
      { emoji: "✨", count: 4 },
    ],
  },
  {
    id: 2,
    mood: "🔥",
    moodLabel: "excited",
    caption: "just booked flights. we're actually doing this!!",
    time: "yesterday",
    reactions: [
      { emoji: "🔥", count: 12 },
      { emoji: "🫶", count: 6 },
    ],
  },
  {
    id: 3,
    mood: "🌙",
    moodLabel: "sleepy",
    caption: "3am thoughts hit different. going to sleep now for real.",
    time: "2 days ago",
    reactions: [{ emoji: "🌙", count: 5 }],
  },
  {
    id: 4,
    mood: "✨",
    moodLabel: "grateful",
    caption: "coffee was perfect this morning. small things.",
    time: "3 days ago",
    reactions: [
      { emoji: "✨", count: 9 },
      { emoji: "🫶", count: 3 },
    ],
  },
  {
    id: 5,
    mood: "🌧️",
    moodLabel: "low",
    caption: "some days are just harder. that's okay.",
    time: "5 days ago",
    reactions: [
      { emoji: "🫶", count: 14 },
      { emoji: "🌿", count: 7 },
    ],
  },
];

const MOCK_CIRCLES = [
  { id: "c1", emoji: "🔥", bg: "#F9EDE3", name: "Barkada", members: 5 },
  {
    id: "c2",
    emoji: "🍃",
    bg: "#E8F3EE",
    name: "Long-distance crew",
    members: 4,
  },
  { id: "c3", emoji: "🌙", bg: "#EDE8F5", name: "Just us two", members: 2 },
];

/* ─── Stat pill ─────────────────────────────────────────────── */
function StatPill({ value, label }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        padding: "10px 20px",
        borderRadius: 14,
        background: "#F0E5DB",
        flex: 1,
      }}
    >
      <span
        style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 20,
          color: "#1C1410",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: 11, color: "#8A7060", fontWeight: 500 }}>
        {label}
      </span>
    </div>
  );
}

/* ─── Post card ──────────────────────────────────────────────── */
function PostCard({ post }) {
  return (
    <div
      style={{
        padding: "16px 20px",
        borderBottom: "1px solid #EDE3DA",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "#F0E5DB",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
        }}
      >
        {post.mood}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 999,
              background: "#F0E5DB",
              color: "#A05A3A",
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            {post.mood} {post.moodLabel}
          </span>
          <span style={{ fontSize: 11, color: "#B09A8A", marginLeft: "auto" }}>
            {post.time}
          </span>
        </div>

        {post.caption && (
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 14,
              lineHeight: 1.6,
              color: "#3D2B1F",
              wordBreak: "break-word",
            }}
          >
            {post.caption}
          </p>
        )}

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {post.reactions.map((r) => (
            <button
              key={r.emoji}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                borderRadius: 999,
                border: "none",
                background: "#F5EDE3",
                color: "#8A7060",
                cursor: "pointer",
                fontSize: 13,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#EDE3DA")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#F5EDE3")
              }
            >
              {r.emoji} <span style={{ fontSize: 12 }}>{r.count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Circle chip ────────────────────────────────────────────── */
function CircleChip({ circle }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 16,
        background: circle.bg,
        cursor: "pointer",
        transition: "filter 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.96)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
    >
      <span style={{ fontSize: 22, flexShrink: 0 }}>{circle.emoji}</span>
      <div style={{ minWidth: 0 }}>
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
          {circle.name}
        </div>
        <div style={{ fontSize: 12, color: "#8A7060", marginTop: 2 }}>
          {circle.members} members
        </div>
      </div>
    </div>
  );
}

/* ─── Tabs ───────────────────────────────────────────────────── */
function Tabs({ active, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        borderBottom: "1px solid #EDE3DA",
        background: "#F9F4EF",
        position: "sticky",
        top: 56,
        zIndex: 9,
        flexShrink: 0,
      }}
    >
      {[
        { key: "posts", label: "Posts" },
        { key: "circles", label: "Circles" },
        { key: "about", label: "About" },
      ].map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            flex: 1,
            padding: "12px 8px",
            border: "none",
            background: "transparent",
            fontSize: 13,
            fontWeight: active === key ? 600 : 400,
            color: active === key ? "#C96A3A" : "#8A7060",
            cursor: "pointer",
            borderBottom:
              active === key ? "2px solid #C96A3A" : "2px solid transparent",
            transition: "all 0.15s",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

/* ─── About tab ──────────────────────────────────────────────── */
function AboutTab({ profile }) {
  return (
    <div style={{ padding: "16px" }}>
      <div
        style={{
          padding: "16px",
          borderRadius: 16,
          background: "#F0E5DB",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#B09A8A",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          Bio
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: "#3D2B1F",
            lineHeight: 1.7,
          }}
        >
          {profile.bio || "no bio yet."}
        </p>
      </div>

      {[
        { icon: "ti-calendar", label: "Joined", value: profile.joinedDate },
        {
          icon: "ti-circles",
          label: "Circles",
          value: `${MOCK_CIRCLES.length} circles`,
        },
      ].map(({ icon, label, value }) => (
        <div
          key={label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 0",
            borderBottom: "1px solid #EDE3DA",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#F0E5DB",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <i
              className={`ti ${icon}`}
              style={{ fontSize: 18, color: "#C96A3A" }}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#B09A8A", fontWeight: 500 }}>
              {label}
            </div>
            <div style={{ fontSize: 14, color: "#1C1410", marginTop: 1 }}>
              {value}
            </div>
          </div>
        </div>
      ))}

      <button
        style={{
          width: "100%",
          marginTop: 24,
          padding: "12px",
          borderRadius: 999,
          border: "1.5px solid #EDE3DA",
          background: "transparent",
          color: "#5A3A28",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#F0E5DB")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <i className="ti ti-pencil" style={{ fontSize: 16 }} />
        Edit profile
      </button>
    </div>
  );
}

/* ─── Profile page ───────────────────────────────────────────── */
export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [tab, setTab] = useState("posts");
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  // ✅ React Query — no more useEffect fetch, no more reload flicker
  const { data: profile, isLoading: loadingProfile } = useProfile();

  const avatarSize = isMobile ? 68 : 76;

  if (loadingProfile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F9F4EF",
        }}
      >
        <span
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 22,
            color: "#C96A3A",
          }}
        >
          miwi
        </span>
      </div>
    );
  }

  if (!profile) return null;

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
        style={{ minHeight: "100dvh", display: "flex", background: "#F9F4EF" }}
      >
        <Navbar
          active={activeTab}
          setActive={(t) => {
            setActiveTab(t);
            if (t === "home") navigate("/feed");
            if (t === "circles") navigate("/circles");
            if (t === "messages") navigate("/messages");
            if (t === "activity") navigate("/activity");
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
              minHeight: "100dvh",
              borderLeft: "1px solid #EDE3DA",
              borderRight: "1px solid #EDE3DA",
            }}
            className="border-x-0 md:border-x"
          >
            {/* ── Sticky topbar ── */}
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                height: 56,
                padding: "0 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(249,244,239,0.95)",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid #EDE3DA",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 18,
                  color: "#1C1410",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {profile.handle}
              </span>

              {/* ⚙️ opens settings sheet */}
              <button
                onClick={() => setShowSettings(true)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "none",
                  background: "transparent",
                  color: "#8A7060",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#F0E5DB")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <i className="ti ti-settings" style={{ fontSize: 20 }} />
              </button>
            </div>

            {/* ── Profile header ── */}
            <div style={{ padding: "20px 16px 0" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  marginBottom: 14,
                  gap: 12,
                }}
              >
                {/* Avatar with gradient ring */}
                <div
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: "50%",
                    padding: 3,
                    background: "linear-gradient(135deg, #C96A3A, #E8B89A)",
                    flexShrink: 0,
                  }}
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        border: "3px solid #F9F4EF",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        background: "#C96A3A",
                        border: "3px solid #F9F4EF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#F9F4EF",
                        fontSize: isMobile ? 24 : 28,
                        fontFamily: "'DM Serif Display', Georgia, serif",
                      }}
                    >
                      {profile.initial}
                    </div>
                  )}
                </div>

                {/* Edit button */}
                <button
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: "1.5px solid #EDE3DA",
                    background: "transparent",
                    color: "#5A3A28",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "background 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#F0E5DB")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  Edit profile
                </button>
              </div>

              {/* Name + handle */}
              <div style={{ marginBottom: 8 }}>
                <div
                  style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: isMobile ? 20 : 22,
                    color: "#1C1410",
                    marginBottom: 2,
                  }}
                >
                  {profile.display_name}
                </div>
                <div style={{ fontSize: 13, color: "#8A7060" }}>
                  {profile.handle}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p
                  style={{
                    margin: "0 0 14px",
                    fontSize: 14,
                    color: "#5A3A28",
                    lineHeight: 1.65,
                  }}
                >
                  {profile.bio}
                </p>
              )}

              {/* Stats */}
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <StatPill value={MOCK_POSTS.length} label="posts" />
                <StatPill value={profile.streak_count} label="day streak" />
              </div>
            </div>

            {/* ── Tabs ── */}
            <Tabs active={tab} onChange={setTab} />

            {/* ── Tab content ── */}
            <div style={{ minHeight: "50vh" }}>
              {tab === "posts" && (
                <div>
                  {MOCK_POSTS.length === 0 ? (
                    <div
                      style={{
                        padding: "48px 20px",
                        textAlign: "center",
                        fontSize: 13,
                        color: "#8A7060",
                      }}
                    >
                      no posts yet.
                    </div>
                  ) : (
                    MOCK_POSTS.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  )}
                </div>
              )}

              {tab === "circles" && (
                <div
                  style={{
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {MOCK_CIRCLES.length === 0 ? (
                    <div
                      style={{
                        padding: "48px 0",
                        textAlign: "center",
                        fontSize: 13,
                        color: "#8A7060",
                      }}
                    >
                      no circles yet.
                    </div>
                  ) : (
                    MOCK_CIRCLES.map((circle) => (
                      <CircleChip key={circle.id} circle={circle} />
                    ))
                  )}
                </div>
              )}

              {tab === "about" && <AboutTab profile={profile} />}
            </div>
          </div>
        </div>
      </div>

      {/* ── Settings sheet ── */}
      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}
    </>
  );
}
