import { useState } from "react";
import { MOODS } from "../../data";

export default function ComposeSheet({ onClose, onPost }) {
  const [caption, setCaption] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);

  function submit() {
    if (!selectedMood) return;
    onPost({ mood: selectedMood, caption });
    onClose();
  }

  return (
    /* Faux viewport wrapper so the overlay has layout height (no fixed positioning) */
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
            disabled={!selectedMood}
            style={{
              padding: "10px 28px",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 500,
              border: "none",
              cursor: selectedMood ? "pointer" : "not-allowed",
              background: selectedMood ? "#C96A3A" : "#E8D5C4",
              color: selectedMood ? "#F9F4EF" : "#B09A8A",
              transition: "background 0.15s",
            }}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
