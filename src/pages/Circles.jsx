import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import ComposeSheet from "../components/ComposeSheet";
import { useCircles } from "../hooks/useCircles";
import { useFeed } from "../hooks/useFeed";
import { useAuth } from "../context/AuthContext";

/* ─── Display constants (not stored in the DB) ──────────────── */

const CIRCLE_BG = ["#F9EDE3", "#E8F3EE", "#EDE8F5", "#F3EEE8", "#E8EEF3"];

const MOOD_COLORS = {
  calm: "#A0B89A",
  excited: "#C96A3A",
  low: "#9AACBB",
  sleepy: "#9A9EC4",
  grateful: "#C9B46A",
  "needing a hug": "#D9A0A0",
  "at peace": "#A0C4B8",
  overwhelmed: "#C49AC4",
  "chaotic good": "#D9B46A",
};
const DEFAULT_MOOD_COLOR = "#C9B4A0";

function bgForId(id, list) {
  if (!id) return list[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return list[Math.abs(hash) % list.length];
}

function timeAgo(ts) {
  const diff = (Date.now() - new Date(ts)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function isToday(ts) {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

// Turns a raw Supabase circle + the full posts feed into everything the
// panel needs to render: members with live "posted Xm ago" status, today's
// mood breakdown, and an activity count for the badge.
function buildDisplayCircle(circle, posts, currentUserId, idx) {
  const circlePosts = posts.filter((p) => p.circle_id === circle.id);
  const todaysPosts = circlePosts.filter((p) => isToday(p.created_at));

  const latestByUser = new Map();
  for (const post of circlePosts) {
    if (!latestByUser.has(post.author_id)) {
      latestByUser.set(post.author_id, post);
    }
  }

  const members = (circle.circle_members ?? []).map((cm) => {
    const profile = cm.profiles;
    const latest = latestByUser.get(cm.user_id);
    const postedToday = latest && isToday(latest.created_at);
    return {
      id: profile?.id ?? cm.user_id,
      initial: profile?.display_name?.charAt(0).toUpperCase() ?? "?",
      color: bgForId(profile?.id ?? cm.user_id, [
        "#C96A3A",
        "#8B5E3C",
        "#B07D62",
        "#7A9E8A",
        "#9E7A8A",
        "#6A8A9E",
      ]),
      name: profile?.display_name ?? "someone",
      mood: postedToday
        ? `${latest.mood} ${latest.mood_label} · posted ${timeAgo(latest.created_at)}`
        : "hasn't posted today",
      you: profile?.id === currentUserId,
    };
  });

  const moodCounts = todaysPosts.reduce((acc, p) => {
    const key = p.mood_label ?? "vibe";
    acc[key] = acc[key] ?? { count: 0, emoji: p.mood };
    acc[key].count += 1;
    return acc;
  }, {});
  const total = todaysPosts.length;
  const moodBreakdown = Object.entries(moodCounts)
    .map(([label, { count, emoji }]) => ({
      label: `${emoji} ${label}`,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
      color: MOOD_COLORS[label] ?? DEFAULT_MOOD_COLOR,
    }))
    .sort((a, b) => b.count - a.count);

  const newPosts = circlePosts.filter(
    (p) => Date.now() - new Date(p.created_at).getTime() < 1000 * 60 * 60 * 24,
  ).length;

  return {
    id: circle.id,
    emoji: circle.cover_color || "⭕",
    bg: CIRCLE_BG[idx % CIRCLE_BG.length],
    name: circle.name,
    description:
      circle.description ||
      `${members.length} ${members.length === 1 ? "member" : "members"}.`,
    newPosts,
    members,
    moodBreakdown,
    inviteCode: circle.invite_code ?? "—",
  };
}

/* ─── Small bits ─────────────────────────────────────────────── */

function CircleAvatar({ emoji, bg, size = 46, radius = 16, fontSize = 20 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize,
        flexShrink: 0,
      }}
    >
      {emoji}
    </div>
  );
}

function CircleRow({ circle, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 20px",
        borderBottom: "1px solid #EDE3DA",
        cursor: "pointer",
        background: selected ? "#F0E5DB" : "transparent",
        transition: "background 0.12s",
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.background = "#F5EDE3";
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.background = "transparent";
      }}
    >
      <CircleAvatar emoji={circle.emoji} bg={circle.bg} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1C1410" }}>
          {circle.name}
        </div>
        <div style={{ fontSize: 12, color: "#8A7060", marginTop: 2 }}>
          {circle.members.length} members
          {circle.newPosts > 0
            ? ` · ${circle.newPosts} new post${circle.newPosts > 1 ? "s" : ""}`
            : " · quiet today"}
        </div>
      </div>
      {circle.newPosts > 0 && (
        <div
          style={{
            background: "#C96A3A",
            color: "#F9F4EF",
            fontSize: 11,
            fontWeight: 600,
            minWidth: 20,
            height: 20,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 6px",
            flexShrink: 0,
          }}
        >
          {circle.newPosts}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: "#B09A8A",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function MemberRow({ member }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: member.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#F9F4EF",
          fontSize: 13,
          fontFamily: "'DM Serif Display', Georgia, serif",
          flexShrink: 0,
        }}
      >
        {member.initial}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, color: "#1C1410", fontWeight: 500 }}>
          {member.name}
        </div>
        <div style={{ fontSize: 11, color: "#8A7060" }}>{member.mood}</div>
      </div>
      {member.you && (
        <div
          style={{
            marginLeft: "auto",
            fontSize: 11,
            padding: "2px 8px",
            borderRadius: 999,
            background: "#F0E5DB",
            color: "#A05A3A",
            flexShrink: 0,
          }}
        >
          You
        </div>
      )}
    </div>
  );
}

function MoodRow({ label, pct, color, count }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 8,
      }}
    >
      <div style={{ fontSize: 12, color: "#5A3A28", width: 90, flexShrink: 0 }}>
        {label}
      </div>
      <div
        style={{
          flex: 1,
          height: 6,
          background: "#EDE3DA",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 999,
            background: color,
            width: `${pct}%`,
          }}
        />
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#B09A8A",
          width: 20,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {count}
      </div>
    </div>
  );
}

function ActionButton({ primary, icon, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: 10,
        borderRadius: 999,
        border: "none",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        background: primary ? "#C96A3A" : "#F0E5DB",
        color: primary ? "#F9F4EF" : "#7A4A2A",
        transition: "filter 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.97)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
    >
      <i className={`ti ti-${icon}`} style={{ fontSize: 15 }} />
      {children}
    </button>
  );
}

/* ─── Right detail panel ─────────────────────────────────────── */

function CirclePanel({ circle, onPost, onCopyInvite }) {
  if (!circle) {
    return (
      <div
        style={{
          width: 320,
          borderLeft: "1px solid #EDE3DA",
          display: "flex",
          flexDirection: "column",
          background: "#FDFAF7",
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          textAlign: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 18,
            color: "#1C1410",
          }}
        >
          select a circle
        </div>
        <div style={{ fontSize: 13, color: "#8A7060", lineHeight: 1.6 }}>
          pick a circle on the left to see members, moods, and the invite link
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: 320,
        borderLeft: "1px solid #EDE3DA",
        display: "flex",
        flexDirection: "column",
        background: "#FDFAF7",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{ padding: "20px 20px 16px", borderBottom: "1px solid #EDE3DA" }}
      >
        <div style={{ marginBottom: 12 }}>
          <CircleAvatar
            emoji={circle.emoji}
            bg={circle.bg}
            size={52}
            radius={18}
            fontSize={24}
          />
        </div>
        <div
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 20,
            color: "#1C1410",
            marginBottom: 4,
          }}
        >
          {circle.name}
        </div>
        <div style={{ fontSize: 13, color: "#7A6254", lineHeight: 1.5 }}>
          {circle.description}
        </div>
      </div>

      {/* Members */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #EDE3DA" }}>
        <SectionLabel>Members</SectionLabel>
        {circle.members.map((m) => (
          <MemberRow key={m.id} member={m} />
        ))}
      </div>

      {/* Mood breakdown */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #EDE3DA" }}>
        <SectionLabel>Circle mood today</SectionLabel>
        {circle.moodBreakdown.length === 0 ? (
          <div style={{ fontSize: 13, color: "#B09A8A" }}>
            no posts yet today
          </div>
        ) : (
          circle.moodBreakdown.map((m) => <MoodRow key={m.label} {...m} />)
        )}
      </div>

      {/* Invite */}
      <div
        style={{
          margin: "16px 20px",
          padding: "12px 14px",
          borderRadius: 14,
          background: "#F5EDE3",
          border: "1px solid #E8D5C4",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#8A7060",
            marginBottom: 6,
            fontWeight: 500,
          }}
        >
          Invite code
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#5A3A28",
              fontFamily: "monospace",
              letterSpacing: "0.1em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {circle.inviteCode}
          </span>
          <button
            onClick={() => onCopyInvite?.(circle.inviteCode)}
            style={{
              fontSize: 11,
              color: "#C96A3A",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
            }}
          >
            <i className="ti ti-copy" style={{ fontSize: 14 }} /> Copy
          </button>
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginTop: "auto",
        }}
      >
        <ActionButton primary icon="pencil" onClick={() => onPost?.(circle)}>
          Post to this circle
        </ActionButton>
      </div>
    </div>
  );
}

/* ─── Empty state (no circles at all) ───────────────────────── */

function EmptyCircles() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        textAlign: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 18,
          color: "#1C1410",
        }}
      >
        no circles yet
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#8A7060",
          lineHeight: 1.6,
          maxWidth: 280,
        }}
      >
        circles are small private groups — invite up to 10 people who actually
        matter to you
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */

export default function Circles() {
  const { user } = useAuth();
  const { data: rawCircles = [], isLoading: loadingCircles } = useCircles();
  const { data: posts = [], isLoading: loadingPosts } = useFeed();

  const [activeTab, setActiveTab] = useState("circles");
  const [tab, setTab] = useState("mine"); // "mine" | "invites"
  const [selectedId, setSelectedId] = useState(null);
  const [composing, setComposing] = useState(false);
  const [composeCircleId, setComposeCircleId] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const circles = useMemo(
    () =>
      rawCircles.map((c, idx) => buildDisplayCircle(c, posts, user?.id, idx)),
    [rawCircles, posts, user?.id],
  );

  // Keep a selection once data loads, defaulting to the first circle
  useEffect(() => {
    if (!selectedId && circles.length > 0) {
      setSelectedId(circles[0].id);
    }
  }, [circles, selectedId]);

  const selected = circles.find((c) => c.id === selectedId) ?? null;
  const loading = loadingCircles || loadingPosts;

  function handleCopyInvite(code) {
    if (navigator?.clipboard) navigator.clipboard.writeText(code);
  }

  function handlePostToCircle(circle) {
    setComposeCircleId(circle.id);
    setComposing(true);
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
        <Navbar
          active={activeTab}
          setActive={setActiveTab}
          onCompose={() => {
            setComposeCircleId(null);
            setComposing(true);
          }}
        />

        {/* Center column */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
          className="md:ml-[80px] pb-[64px] md:pb-0"
        >
          {/* Topbar */}
          <div
            style={{
              height: 56,
              borderBottom: "1px solid #EDE3DA",
              display: "flex",
              alignItems: "center",
              padding: "0 20px",
              gap: 12,
              background: "#F9F4EF",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 18,
                color: "#1C1410",
              }}
            >
              Circles
            </span>
          </div>

          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: 4,
              padding: "12px 20px 0",
              borderBottom: "1px solid #EDE3DA",
              flexShrink: 0,
            }}
          >
            {["mine", "invites"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "999px 999px 0 0",
                  border: "none",
                  background: "transparent",
                  fontSize: 13,
                  color: tab === t ? "#C96A3A" : "#8A7060",
                  cursor: "pointer",
                  fontWeight: 500,
                  borderBottom:
                    tab === t ? "2px solid #C96A3A" : "2px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                {t === "mine" ? "My circles" : "Invites"}
              </button>
            ))}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {tab === "invites" ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px 20px",
                  textAlign: "center",
                  fontSize: 13,
                  color: "#8A7060",
                }}
              >
                no pending invites
              </div>
            ) : loading ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  fontSize: 13,
                  color: "#8A7060",
                }}
              >
                loading circles…
              </div>
            ) : circles.length === 0 ? (
              <EmptyCircles />
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {circles.map((c) => (
                  <CircleRow
                    key={c.id}
                    circle={c}
                    selected={c.id === selectedId}
                    onClick={() => setSelectedId(c.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right panel (desktop only) */}
        {!isMobile && (
          <CirclePanel
            circle={tab === "mine" ? selected : null}
            onPost={handlePostToCircle}
            onCopyInvite={handleCopyInvite}
          />
        )}
      </div>

      {composing && (
        <ComposeSheet
          initialCircleId={composeCircleId}
          onClose={() => setComposing(false)}
        />
      )}
    </>
  );
}
