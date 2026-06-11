import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

/* ─── Mock data shaped like the Supabase schema ─────────────── */
/* circles + circle_members + posts(mood) joined for display.   */
/* Replace with Supabase queries:                                */
/*   circles: select * from circles where id in (my circle ids) */
/*   members: circle_members join profiles                       */
/*   moods:   posts grouped by mood, created_at::date = today    */

const MOCK_CIRCLES = [
  {
    id: "c1",
    emoji: "🔥",
    bg: "#F9EDE3",
    name: "Barkada",
    description:
      "The group chat that actually has feelings. 5 members, created March 2026.",
    newPosts: 3,
    members: [
      {
        id: "u1",
        initial: "S",
        color: "#C96A3A",
        name: "sofía",
        mood: "🌿 calm · posted 2m ago",
        you: true,
      },
      {
        id: "u2",
        initial: "M",
        color: "#8B5E3C",
        name: "marco",
        mood: "🔥 excited · posted 14m ago",
      },
      {
        id: "u3",
        initial: "L",
        color: "#B07D62",
        name: "lea",
        mood: "🌙 sleepy · posted 1h ago",
      },
      {
        id: "u4",
        initial: "J",
        color: "#7A9E8A",
        name: "juno",
        mood: "hasn't posted today",
      },
      {
        id: "u5",
        initial: "R",
        color: "#9E7A8A",
        name: "rae",
        mood: "✨ grateful · posted 3h ago",
      },
    ],
    moodBreakdown: [
      { label: "🔥 excited", pct: 60, color: "#C96A3A", count: 3 },
      { label: "🌿 calm", pct: 40, color: "#A0B89A", count: 2 },
      { label: "🌙 sleepy", pct: 20, color: "#9A9EC4", count: 1 },
    ],
    inviteCode: "miwi/brkd·a2f9",
  },
  {
    id: "c2",
    emoji: "🍃",
    bg: "#E8F3EE",
    name: "Long-distance crew",
    description:
      "Friends scattered across three timezones. 4 members, created Jan 2026.",
    newPosts: 1,
    members: [
      {
        id: "u1",
        initial: "S",
        color: "#C96A3A",
        name: "sofía",
        mood: "🌿 calm · posted 2m ago",
        you: true,
      },
      {
        id: "u6",
        initial: "A",
        color: "#6A8A9E",
        name: "alex",
        mood: "🌧️ low · posted 30m ago",
      },
      {
        id: "u7",
        initial: "P",
        color: "#9E6A8A",
        name: "priya",
        mood: "✨ grateful · posted 5h ago",
      },
      {
        id: "u8",
        initial: "K",
        color: "#8A9E6A",
        name: "kai",
        mood: "hasn't posted today",
      },
    ],
    moodBreakdown: [
      { label: "🌿 calm", pct: 50, color: "#A0B89A", count: 2 },
      { label: "🌧️ low", pct: 30, color: "#9AACBB", count: 1 },
      { label: "✨ grateful", pct: 20, color: "#C9B46A", count: 1 },
    ],
    inviteCode: "miwi/ldc·7b3e",
  },
  {
    id: "c3",
    emoji: "🌙",
    bg: "#EDE8F5",
    name: "Just us two",
    description: "A private space for two. Created Feb 2026.",
    newPosts: 0,
    members: [
      {
        id: "u1",
        initial: "S",
        color: "#C96A3A",
        name: "sofía",
        mood: "🌿 calm · posted 2m ago",
        you: true,
      },
      {
        id: "u9",
        initial: "T",
        color: "#7A6A9E",
        name: "theo",
        mood: "🌙 sleepy · posted 4h ago",
      },
    ],
    moodBreakdown: [
      { label: "🌿 calm", pct: 50, color: "#A0B89A", count: 1 },
      { label: "🌙 sleepy", pct: 50, color: "#9A9EC4", count: 1 },
    ],
    inviteCode: "miwi/jut·c4d1",
  },
];

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
      <div style={{ fontSize: 12, color: "#5A3A28", width: 80, flexShrink: 0 }}>
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

function CirclePanel({ circle, onPost, onSettings, onCopyInvite }) {
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
          Invite link · expires never
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
        <ActionButton icon="settings" onClick={() => onSettings?.(circle)}>
          Circle settings
        </ActionButton>
      </div>
    </div>
  );
}

/* ─── Empty state (no circles at all) ───────────────────────── */

function EmptyCircles({ onCreate }) {
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
      <button
        onClick={onCreate}
        style={{
          marginTop: 16,
          padding: "12px 24px",
          borderRadius: 999,
          background: "#C96A3A",
          color: "#F9F4EF",
          border: "none",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        create a circle
      </button>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────── */

export default function Circles({ circles = MOCK_CIRCLES }) {
  const [activeTab, setActiveTab] = useState("circles");
  const [tab, setTab] = useState("mine"); // "mine" | "invites"
  const [selectedId, setSelectedId] = useState(circles[0]?.id ?? null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const selected = circles.find((c) => c.id === selectedId) ?? null;

  function handleCopyInvite(code) {
    if (navigator?.clipboard) navigator.clipboard.writeText(code);
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
          onCompose={() => {}}
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
            <button
              style={{
                marginLeft: "auto",
                padding: "8px 16px",
                borderRadius: 999,
                border: "none",
                background: "#F0E5DB",
                color: "#7A4A2A",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#E8D5C4")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#F0E5DB")
              }
            >
              <i className="ti ti-plus" style={{ fontSize: 15 }} /> New circle
            </button>
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
            ) : circles.length === 0 ? (
              <EmptyCircles onCreate={() => {}} />
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

                {/* Create-circle row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 20px",
                    borderBottom: "1px solid #EDE3DA",
                    opacity: 0.6,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#F0F0F0",
                      border: "2px dashed #E0D8D0",
                      flexShrink: 0,
                    }}
                  >
                    <i
                      className="ti ti-plus"
                      style={{ fontSize: 20, color: "#B09A8A" }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#8A7060",
                      }}
                    >
                      Create a circle
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#8A7060", marginTop: 2 }}
                    >
                      Invite up to 10 people
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right panel (desktop only) */}
        {!isMobile && (
          <CirclePanel
            circle={tab === "mine" ? selected : null}
            onCopyInvite={handleCopyInvite}
          />
        )}
      </div>
    </>
  );
}
