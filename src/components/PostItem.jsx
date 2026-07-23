// src/components/PostItem.jsx
//
// Single source of truth for "how a post looks." Feed.jsx and
// profile/PostCard.jsx used to each maintain their own copy of this —
// which is how the media_attachment/timestamp bugs happened: one got
// fixed, the other silently didn't. Both now render through here.
//
// showAuthor=true  -> Feed usage: avatar/username/circle name in the header
// showAuthor=false -> Profile usage: just the mood icon, no author row
import { useRef } from "react";
import LyricsSync from "./LyricsSync";
import AudioPlayer from "./AudioPlayer";

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

function LeadingIcon({ post, showAuthor }) {
  if (!showAuthor) {
    // Profile context: no author to show (it's always you) — just the mood.
    return (
      <div
        style={{
          width: 40,
          height: 40,
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
    );
  }

  const author = post.author;
  const initial = author?.display_name?.charAt(0).toUpperCase() ?? "?";

  if (author?.avatar_url) {
    return (
      <img
        src={author.avatar_url}
        alt={author.display_name}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: colorForId(author?.id),
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#F9F4EF",
        fontSize: 15,
        fontFamily: "'DM Serif Display', Georgia, serif",
      }}
    >
      {initial}
    </div>
  );
}

export default function PostItem({
  post,
  showAuthor = true,
  visible = true,
  onReact,
}) {
  const audioRef = useRef(null);

  const reactionMap = (post.reactions ?? []).reduce((acc, r) => {
    acc[r.reaction] = (acc[r.reaction] ?? 0) + 1;
    return acc;
  }, {});
  const reactions = Object.entries(reactionMap).map(([emoji, count]) => ({
    emoji,
    count,
  }));

  const circleName = post.circles?.name || post.circle?.name;

  function handleReact(emoji) {
    if (onReact) {
      onReact(emoji);
    } else {
      // TODO: wire up a real reaction-toggle mutation.
      console.log(`Reacted with ${emoji} to post ${post.id}`);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: showAuthor ? "0 0 20px" : "16px 20px",
        borderBottom: "1px solid #EDE3DA",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      <LeadingIcon post={post} showAuthor={showAuthor} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 4,
          }}
        >
          {showAuthor && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: "#1C1410" }}>
                {post.author?.username ??
                  post.author?.display_name ??
                  "someone"}
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
          )}

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

        {post.media_attachment?.type === "song" &&
          post.media_attachment.preview_url && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                background: "#F5EDE3",
                borderRadius: 14,
                border: "1px solid #EDE3DA",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                      marginBottom: 8,
                    }}
                  >
                    {post.media_attachment.artist}
                  </div>

                  <AudioPlayer
                    ref={audioRef}
                    src={post.media_attachment.preview_url}
                    clipStart={post.media_attachment.clip_start}
                  />
                </div>
              </div>

              <LyricsSync
                lyrics={post.media_attachment.lyrics}
                audioRef={audioRef}
              />
            </div>
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
          {reactions.map((r) => (
            <button
              key={r.emoji}
              onClick={() => handleReact(r.emoji)}
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
