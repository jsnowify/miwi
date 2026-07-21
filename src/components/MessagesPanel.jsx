import { useState, useMemo } from "react";
import { MOCK_DMS, MOCK_GROUPS } from "./mockMessages";
import { useCircles } from "../hooks/useCircles";
import { useAuth } from "../context/AuthContext";

// Single source of truth for the sidebar widths. Previously these were
// declared separately in both Feed.jsx and here — if one ever drifted
// from the other, the outer wrapper (in Feed.jsx) and this panel's own
// root width would briefly disagree and show as a margin/gap glitch
// during the expand/collapse transition. Export them so Feed.jsx (or
// any other consumer) imports instead of re-declaring.
export const SIDEBAR_EXPANDED_W = 300;
export const SIDEBAR_COLLAPSED_W = 64;

const CONTACT_COLORS = [
  "#C96A3A",
  "#8B5E3C",
  "#B07D62",
  "#7A9E8A",
  "#9E7A8A",
  "#6A8A9E",
];

function colorForId(id) {
  if (!id) return CONTACT_COLORS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return CONTACT_COLORS[Math.abs(hash) % CONTACT_COLORS.length];
}

/* ── Avatar ── */
function Avatar({ label, color, size = 44, rounded = false }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: rounded ? 14 : "50%",
        background: color,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#F9F4EF",
        fontSize: size * 0.36,
        fontFamily: "'DM Serif Display', Georgia, serif",
      }}
    >
      {label}
    </div>
  );
}

/* ── Unread badge ── */
function Badge({ count }) {
  if (!count) return null;
  return (
    <div
      style={{
        background: "#C96A3A",
        color: "#F9F4EF",
        fontSize: 11,
        fontWeight: 700,
        minWidth: 19,
        height: 19,
        borderRadius: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 5px",
        flexShrink: 0,
      }}
    >
      {count}
    </div>
  );
}

/* ── Conversation row ── */
function ConvoRow({
  item,
  selected,
  onClick,
  rounded = false,
  collapsed = false,
}) {
  if (collapsed) {
    return (
      <button
        onClick={onClick}
        title={item.name}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          padding: "8px 0",
          background: selected ? "#F0E5DB" : "transparent",
          border: "none",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          if (!selected) e.currentTarget.style.background = "#FAF3EC";
        }}
        onMouseLeave={(e) => {
          if (!selected) e.currentTarget.style.background = "transparent";
        }}
      >
        <div style={{ position: "relative" }}>
          <Avatar
            label={item.avatar}
            color={item.avatarColor}
            size={36}
            rounded={rounded}
          />
          {item.unread > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: -1,
                right: -1,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#C96A3A",
                border: "2px solid #F9F4EF",
              }}
            />
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 13,
        padding: "12px 20px",
        background: selected ? "#F0E5DB" : "transparent",
        border: "none",
        borderBottom: "1px solid #F5EDE3",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.background = "#FAF3EC";
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.background = "transparent";
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Avatar
          label={item.avatar}
          color={item.avatarColor}
          rounded={rounded}
        />
        {item.unread > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 11,
              height: 11,
              borderRadius: "50%",
              background: "#C96A3A",
              border: "2.5px solid #F9F4EF",
            }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 3,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: item.unread > 0 ? 600 : 400,
              color: "#1C1410",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "60%",
            }}
          >
            {item.name}
          </span>
          <span style={{ fontSize: 11, color: "#B09A8A", flexShrink: 0 }}>
            {item.time}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: item.unread > 0 ? "#5A3A28" : "#8A7060",
              fontWeight: item.unread > 0 ? 500 : 400,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flex: 1,
            }}
          >
            {item.preview}
          </p>
          <Badge count={item.unread} />
        </div>
      </div>
    </button>
  );
}

/* ── Search bar ── */
function SearchBar({ value, onChange }) {
  return (
    <div
      style={{
        padding: "10px 16px",
        borderBottom: "1px solid #EDE3DA",
        background: "#F9F4EF",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#EDE3DA",
          borderRadius: 12,
          padding: "9px 14px",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle
            cx="11"
            cy="11"
            r="7.5"
            stroke="#B09A8A"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M16.5 16.5L21 21"
            stroke="#B09A8A"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          placeholder="Search messages…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
        {value && (
          <button
            onClick={() => onChange("")}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6 6 18M6 6l12 12"
                stroke="#B09A8A"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Tabs ── */
function Tabs({ active, onChange, dmUnread, groupUnread }) {
  return (
    <div
      style={{
        display: "flex",
        padding: "10px 16px 0",
        borderBottom: "1px solid #EDE3DA",
        background: "#F9F4EF",
        flexShrink: 0,
        gap: 4,
      }}
    >
      {[
        { key: "direct", label: "Direct", count: dmUnread },
        { key: "groups", label: "Groups", count: groupUnread },
      ].map(({ key, label, count }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
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
          {count > 0 && (
            <span
              style={{
                background: active === key ? "#C96A3A" : "#E8D5C4",
                color: active === key ? "#F9F4EF" : "#7A5A48",
                fontSize: 10,
                fontWeight: 700,
                minWidth: 16,
                height: 16,
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
              }}
            >
              {count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

/* ── FAB ── */
function FAB({ onClick, style }) {
  return (
    <button
      onClick={onClick}
      title="New message"
      style={{
        position: "absolute",
        bottom: 20,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: "50%",
        border: "none",
        background: "#C96A3A",
        color: "#F9F4EF",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 20px rgba(201,106,58,0.38)",
        transition: "transform 0.15s, background 0.15s",
        zIndex: 40,
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.08)";
        e.currentTarget.style.background = "#B05A2E";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.background = "#C96A3A";
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.93)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M16.57 3.6a2 2 0 0 1 2.83 0l1 1a2 2 0 0 1 0 2.83L9 18.83 5 19l.17-4L16.57 3.6Z"
          stroke="#F9F4EF"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M3 21h18"
          stroke="#F9F4EF"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    </button>
  );
}

/* ── Mobile FAB ── */
function MobileFAB({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="New message"
      style={{
        position: "fixed",
        bottom: 84,
        right: 20,
        width: 54,
        height: 54,
        borderRadius: "50%",
        border: "none",
        background: "#C96A3A",
        color: "#F9F4EF",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 20px rgba(201,106,58,0.38)",
        transition: "transform 0.15s, background 0.15s",
        zIndex: 40,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.08)";
        e.currentTarget.style.background = "#B05A2E";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.background = "#C96A3A";
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.93)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M16.57 3.6a2 2 0 0 1 2.83 0l1 1a2 2 0 0 1 0 2.83L9 18.83 5 19l.17-4L16.57 3.6Z"
          stroke="#F9F4EF"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M3 21h18"
          stroke="#F9F4EF"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    </button>
  );
}

/* ── Empty search state ── */
function EmptySearch({ query }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        gap: 10,
        textAlign: "center",
      }}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <circle
          cx="11"
          cy="11"
          r="7.5"
          stroke="#D4BFB0"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M16.5 16.5L21 21"
          stroke="#D4BFB0"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
      <p style={{ margin: 0, fontSize: 14, color: "#8A7060" }}>
        No results for <strong style={{ color: "#5A3A28" }}>"{query}"</strong>
      </p>
      <p style={{ margin: 0, fontSize: 12, color: "#B09A8A" }}>
        Try a different name or keyword
      </p>
    </div>
  );
}

/* ── New Message modal ──
   Fixes the "creating a message" bug: previously the FAB/MobileFAB had
   onClick={() => {}} — clicking "new message" did nothing at all. This
   opens a picker of people from your circles (deduped, excluding
   yourself) and hands the chosen person back as a conversation. */
function NewMessageModal({ onClose, onPick }) {
  const { user } = useAuth();
  const { data: circles = [], isLoading } = useCircles();

  const contacts = useMemo(() => {
    const seen = new Map();
    for (const circle of circles) {
      for (const cm of circle.circle_members ?? []) {
        const profile = cm.profiles;
        if (!profile || profile.id === user?.id || seen.has(profile.id)) {
          continue;
        }
        seen.set(profile.id, profile);
      }
    }
    return Array.from(seen.values());
  }, [circles, user?.id]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 110,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.2)",
        backdropFilter: "blur(4px)",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: "#FDFAF7",
          borderRadius: 20,
          border: "1px solid #EDE3DA",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "70vh",
        }}
      >
        <div
          style={{
            padding: "16px 18px",
            borderBottom: "1px solid #EDE3DA",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 17,
              color: "#1C1410",
            }}
          >
            New message
          </span>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#8A7060",
              display: "flex",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6 6 18M6 6l12 12"
                stroke="#8A7060"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div style={{ overflowY: "auto", padding: 8 }}>
          {isLoading ? (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                fontSize: 13,
                color: "#8A7060",
              }}
            >
              loading your circles…
            </div>
          ) : contacts.length === 0 ? (
            <div
              style={{
                padding: 24,
                textAlign: "center",
                fontSize: 13,
                color: "#8A7060",
              }}
            >
              join a circle first to message someone
            </div>
          ) : (
            contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => onPick(c)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  borderRadius: 12,
                  textAlign: "left",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#F5EDE3")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <Avatar
                  label={c.display_name?.charAt(0).toUpperCase() ?? "?"}
                  color={colorForId(c.id)}
                  size={38}
                />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{ fontSize: 14, fontWeight: 600, color: "#1C1410" }}
                  >
                    {c.display_name}
                  </div>
                  <div style={{ fontSize: 12, color: "#8A7060" }}>
                    @{c.username}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main export ── */
export default function MessagesPanel({
  variant = "sidebar",
  onSelect,
  selectedId,
  onExpandChange,
}) {
  const [tab, setTab] = useState("direct");
  const [search, setSearch] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [sidebarSelected, setSidebarSelected] = useState(null);
  const [showNewMessage, setShowNewMessage] = useState(false);

  const dmUnread = MOCK_DMS.reduce((s, d) => s + (d.unread > 0 ? 1 : 0), 0);
  const groupUnread = MOCK_GROUPS.reduce(
    (s, g) => s + (g.unread > 0 ? 1 : 0),
    0,
  );

  const filteredDMs = MOCK_DMS.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.preview.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredGroups = MOCK_GROUPS.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.preview.toLowerCase().includes(search.toLowerCase()),
  );

  const currentList = tab === "direct" ? filteredDMs : filteredGroups;
  const isGroup = tab === "groups";

  function toggleExpanded() {
    const next = !isExpanded;
    setIsExpanded(next);
    onExpandChange?.(next); // notify Feed so it can resize the sidebar slot
  }

  function handleSelect(item) {
    if (variant === "page") {
      onSelect?.({ ...item, rounded: isGroup });
    } else {
      setSidebarSelected(item.id === sidebarSelected ? null : item.id);
    }
  }

  // Person picked from the New Message modal -> normalize into the same
  // shape ConvoRow/ChatView expect, then route it through the normal
  // selection path (same as clicking an existing conversation).
  function handleNewMessagePick(profile) {
    const contact = {
      id: `new-${profile.id}`,
      name: profile.display_name,
      avatar: profile.display_name?.charAt(0).toUpperCase() ?? "?",
      avatarColor: colorForId(profile.id),
      preview: "",
      time: "now",
      unread: 0,
    };
    setShowNewMessage(false);
    handleSelect(contact);
  }

  const body = (
    <>
      <SearchBar value={search} onChange={setSearch} />
      <Tabs
        active={tab}
        onChange={setTab}
        dmUnread={dmUnread}
        groupUnread={groupUnread}
      />
      <div>
        {currentList.length === 0 ? (
          <EmptySearch query={search} />
        ) : (
          currentList.map((item) => (
            <ConvoRow
              key={item.id}
              item={item}
              rounded={isGroup}
              collapsed={false}
              selected={
                variant === "page"
                  ? selectedId === item.id
                  : sidebarSelected === item.id
              }
              onClick={() => handleSelect(item)}
            />
          ))
        )}
      </div>
    </>
  );

  /* ── page variant ── */
  if (variant === "page") {
    return (
      <div
        style={{
          background: "#F9F4EF",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 0,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            height: 56,
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            background: "rgba(249,244,239,0.95)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid #EDE3DA",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 20,
              color: "#1C1410",
            }}
          >
            Messages
          </span>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>{body}</div>
        <MobileFAB onClick={() => setShowNewMessage(true)} />
        {showNewMessage && (
          <NewMessageModal
            onClose={() => setShowNewMessage(false)}
            onPick={handleNewMessagePick}
          />
        )}
      </div>
    );
  }

  /* ── sidebar variant ──
     Width is now driven entirely by this component (SIDEBAR_EXPANDED_W /
     SIDEBAR_COLLAPSED_W, exported above). The parent (Feed.jsx) no longer
     declares its own width for the wrapping div — it just reserves a
     flex slot and lets this element's own width + transition do the
     animating, so there's only ever one source of truth. */
  return (
    <div
      style={{
        width: isExpanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W,
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "#F9F4EF",
        borderLeft: "1px solid #EDE3DA",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        transition: "width 0.25s ease",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "100%",
          height: 60, // matches feed desktop header height
          padding: isExpanded ? "0 16px" : "0",
          display: "flex",
          alignItems: "center",
          justifyContent: isExpanded ? "flex-start" : "center",
          gap: 8,
          borderBottom: "1px solid #EDE3DA",
          flexShrink: 0,
        }}
      >
        <button
          onClick={toggleExpanded}
          title={isExpanded ? "Collapse" : "Expand"}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "none",
            background: "transparent",
            color: "#8A7060",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#F0E5DB")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d={isExpanded ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"}
              stroke="#8A7060"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {isExpanded && (
          <span
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 17,
              color: "#1C1410",
              whiteSpace: "nowrap",
            }}
          >
            Messages
          </span>
        )}
      </div>

      {isExpanded ? (
        // ── Expanded body ──
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {body}
          <FAB onClick={() => setShowNewMessage(true)} />
        </div>
      ) : (
        // ── Collapsed rail — paddingTop: 8 only, header already pushes content down ──
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 8,
            position: "relative",
          }}
        >
          {currentList.map((item) => (
            <ConvoRow
              key={item.id}
              item={item}
              rounded={isGroup}
              collapsed={true}
              selected={sidebarSelected === item.id}
              onClick={() => handleSelect(item)}
            />
          ))}
          <FAB
            onClick={() => setShowNewMessage(true)}
            style={{
              position: "absolute",
              right: "50%",
              transform: "translateX(50%)",
            }}
          />
        </div>
      )}

      {showNewMessage && (
        <NewMessageModal
          onClose={() => setShowNewMessage(false)}
          onPick={handleNewMessagePick}
        />
      )}
    </div>
  );
}
