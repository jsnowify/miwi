import { useState, useEffect } from "react";
import { useCircles } from "../hooks/useCircles";
import { useCreatePost } from "../hooks/useFeed";

// Inlined so this component doesn't depend on the old mock data.js file.
const MOODS = [
  { emoji: "🌿", tag: "calm" },
  { emoji: "🔥", tag: "excited" },
  { emoji: "🌧️", tag: "low" },
  { emoji: "🌙", tag: "sleepy" },
  { emoji: "✨", tag: "grateful" },
  { emoji: "🫂", tag: "needing a hug" },
  { emoji: "🍃", tag: "at peace" },
  { emoji: "🌪️", tag: "overwhelmed" },
  { emoji: "😂", tag: "chaotic good" },
];

export default function ComposeSheet({ onClose, initialCircleId }) {
  const [caption, setCaption] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);
  const [circleId, setCircleId] = useState(initialCircleId ?? "");
  const [error, setError] = useState("");

  const { data: circles = [], isLoading: loadingCircles } = useCircles();
  const mutation = useCreatePost();
  const { mutate: createPost } = mutation;
  // Support both react-query v4 (isLoading) and v5 (isPending) without
  // needing to know which major version this project is pinned to.
  const posting = mutation.isPending ?? mutation.isLoading ?? false;

  // Default to the passed-in circle, or the first one the user belongs to,
  // once circles have loaded. Runs as an effect (not during render) to
  // avoid a setState-during-render warning.
  useEffect(() => {
    if (circleId) return;
    if (initialCircleId) {
      setCircleId(initialCircleId);
    } else if (circles.length > 0) {
      setCircleId(circles[0].id);
    }
  }, [circles, initialCircleId, circleId]);

  function submit() {
    setError("");
    if (!selectedMood) return;
    if (!circleId) {
      setError("Pick a circle to share this with.");
      return;
    }
    createPost(
      {
        circleId,
        mood: selectedMood.emoji,
        moodLabel: selectedMood.tag,
        caption,
      },
      {
        onSuccess: () => onClose(),
        onError: (err) => setError(err.message ?? "Something went wrong."),
      },
    );
  }

  const canSubmit = !!selectedMood && !!circleId && !posting;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(28,20,16,0.4)",
        zIndex: 100,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          background: "#FDFAF7",
          border: "1px solid #EDE3DA",
          borderRadius: "24px 24px 0 0",
          padding: "24px 24px 40px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 18,
              color: "#1C1410",
            }}
          >
            How are you feeling?
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#8A7060",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>

        {/* Circle picker */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              color: "#8A7060",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            Share with
          </label>
          {loadingCircles ? (
            <p style={{ fontSize: 13, color: "#8A7060", margin: 0 }}>
              loading circles…
            </p>
          ) : circles.length === 0 ? (
            <p style={{ fontSize: 13, color: "#A05A3A", margin: 0 }}>
              you're not in any circles yet — create one first.
            </p>
          ) : (
            <select
              value={circleId}
              onChange={(e) => setCircleId(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1.5px solid #E8D5C4",
                background: "#FFF8F3",
                color: "#1C1410",
                fontSize: 14,
                outline: "none",
                fontFamily: "inherit",
              }}
            >
              {circles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Mood picker */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 20,
          }}
        >
          {MOODS.map((m) => {
            const picked = selectedMood?.tag === m.tag;
            return (
              <button
                key={m.tag}
                onClick={() => setSelectedMood(m)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 999,
                  fontSize: 13,
                  background: picked ? "#F9EDE3" : "#F5EDE3",
                  border: picked
                    ? "1.5px solid #C96A3A"
                    : "1.5px solid transparent",
                  color: "#5A3A28",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {m.emoji} {m.tag}
              </button>
            );
          })}
        </div>

        {/* Caption */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="add a caption… (optional)"
          maxLength={280}
          rows={3}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "12px 16px",
            borderRadius: 12,
            fontSize: 14,
            background: "#FFF8F3",
            border: "1px solid #E8D5C4",
            color: "#1C1410",
            resize: "none",
            outline: "none",
            fontFamily: "inherit",
            marginBottom: 16,
          }}
        />

        {error && (
          <p style={{ fontSize: 13, color: "#A05A3A", margin: "0 0 12px" }}>
            {error}
          </p>
        )}

        {!error && !canSubmit && !posting && (
          <p style={{ fontSize: 12, color: "#B09A8A", margin: "0 0 12px" }}>
            {!selectedMood
              ? "Pick a mood above to continue."
              : !circleId
                ? loadingCircles
                  ? "Loading your circles…"
                  : "No circle selected — you may not belong to any circles yet."
                : ""}
          </p>
        )}

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, color: "#B09A8A" }}>
            {caption.length}/280
          </span>
          <button
            onClick={submit}
            disabled={!canSubmit}
            style={{
              padding: "10px 28px",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 500,
              border: "none",
              cursor: canSubmit ? "pointer" : "not-allowed",
              background: canSubmit ? "#C96A3A" : "#E8D5C4",
              color: canSubmit ? "#F9F4EF" : "#B09A8A",
              transition: "background 0.15s",
            }}
          >
            {posting ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
