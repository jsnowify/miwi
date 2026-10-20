// src/components/PostItem.jsx
//
// Single source of truth for "how a post looks." Feed.jsx and
// profile/PostCard.jsx used to each maintain their own copy of this —
// which is how the media_attachment/timestamp bugs happened: one got
// fixed, the other silently didn't. Both now render through here.
//
// showAuthor=true  -> Feed usage: avatar/username/circle name in the header
// showAuthor=false -> Profile usage: just the mood icon, no author row
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import Sheet from "./Sheet";
import { MOODS, REACTIONS } from '../../shared/moods';
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
      {author?.avatar_emoji || initial}
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

  const { user } = useAuth(), cache = useQueryClient();
  const [editing, setEditing] = useState(false), [caption, setCaption] = useState(post.caption || ''), [moodLabel, setMoodLabel] = useState(post.mood_label);
  const circleName = post.circles?.name || post.circle?.name;
  const action = useMutation({ mutationFn: ({ method, path, body }) => api(path, { method, body }), onSuccess: () => {
    for (const key of ['feed', 'post', 'stories', 'notifications', 'profile', 'memories']) cache.invalidateQueries({ queryKey: [key] });
    setEditing(false);
  } });
  function handleReact(emoji) {
    if (onReact) onReact(emoji);
    else action.mutate({ method: 'PUT', path: `/posts/${post.id}/reaction`, body: { reaction: post.my_reaction === emoji ? null : emoji } });
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
                {post.author?.display_name ??
                  post.author?.username ??
                  "someone"}
              </span>
              {circleName && (
                <>
                  <span aria-hidden="true" style={{ color: "#8A7060" }}>/</span>
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
                    key={post.media_attachment.preview_url}
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

        <div className="miwi-reactions">
          {post.author_id !== user.id && Object.entries(REACTIONS).map(([emoji,label]) => <button className="miwi-secondary" key={emoji} aria-label={label} title={label} aria-pressed={post.my_reaction === emoji} disabled={action.isPending} onClick={() => handleReact(emoji)}>{emoji}</button>)}
          <Link to={`/posts/${post.id}`}>View check-in</Link>
          {post.author_id === user.id && <><button className="miwi-secondary" disabled={action.isPending} onClick={() => setEditing(true)}>Edit</button><button className="miwi-secondary" disabled={action.isPending} onClick={() => { if (window.confirm('Delete this check-in?')) action.mutate({ method: 'DELETE', path: `/posts/${post.id}` }); }}>Delete</button></>}
        </div>
        {post.author_id === user.id && !!post.reactions?.length && <details><summary>Kind words from your people</summary>{post.reactions.map(r => <p key={r.user_id}>{r.reaction} {r.profile?.display_name || 'A friend'}</p>)}</details>}
        <small className="miwi-muted">{post.scope === 'close_friends' ? 'Close friends' : post.scope === 'one_person' ? 'Just one person' : 'Whole circle'} · <time dateTime={post.created_at}>{new Date(post.created_at).toLocaleString()}</time></small>
        <p role="alert">{action.error?.message}</p>
        {editing && <Sheet title="Edit your check-in" description="Your original audience stays the same." onClose={() => setEditing(false)}><form className="miwi-form" onSubmit={e => { e.preventDefault(); action.mutate({ method: 'PATCH', path: `/posts/${post.id}`, body: { caption, moodLabel } }); }}><label>Mood<select value={moodLabel} onChange={e => setMoodLabel(e.target.value)}>{Object.entries(MOODS).map(([label,emoji]) => <option key={label} value={label}>{emoji} {label}</option>)}</select></label><label>Your words<textarea value={caption} onChange={e => setCaption(e.target.value)} rows={3} /></label><small>{Array.from(caption).length}/280</small><button disabled={action.isPending || Array.from(caption).length > 280}>Save changes</button><p role="alert">{action.error?.message}</p></form></Sheet>}

      </div>
    </div>
  );
}
