import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MOODS = [
  { tag: "calm", emoji: "🌿" },
  { tag: "excited", emoji: "🔥" },
  { tag: "low", emoji: "🌧️" },
  { tag: "sleepy", emoji: "🌙" },
  { tag: "grateful", emoji: "✨" },
  { tag: "needing a hug", emoji: "🫂" },
  { tag: "at peace", emoji: "🍃" },
  { tag: "overwhelmed", emoji: "🌪️" },
  { tag: "chaotic good", emoji: "😂" },
];

const MOCK_POSTS = [
  {
    id: 1,
    name: "sofía",
    handle: "sofi",
    avatar: "S",
    avatarColor: "#C96A3A",
    mood: "🌿",
    moodLabel: "calm",
    caption:
      "made chamomile tea and watched the rain for an hour. honestly needed that.",
    time: "2m ago",
    reactions: [
      { emoji: "🤍", label: "Same", count: 3 },
      { emoji: "🌸", label: "Thinking of you", count: 1 },
    ],
  },
  {
    id: 2,
    name: "marco",
    handle: "marcooo",
    avatar: "M",
    avatarColor: "#8B5E3C",
    mood: "🔥",
    moodLabel: "excited",
    caption: "got into the program!!!! cannot believe it's actually happening",
    time: "14m ago",
    reactions: [
      { emoji: "🔥", label: "Let's go!", count: 5 },
      { emoji: "🤍", label: "Same", count: 2 },
    ],
  },
  {
    id: 3,
    name: "lea",
    handle: "lealeale",
    avatar: "L",
    avatarColor: "#B07D62",
    mood: "🌙",
    moodLabel: "sleepy",
    caption:
      "three days in and still haven't unpacked. the suitcase is just a fixture now.",
    time: "1h ago",
    reactions: [{ emoji: "😂", label: "Same energy", count: 4 }],
  },
];

function ComposeSheet({ onClose, onPost }) {
  const [caption, setCaption] = useState("");
  const [selectedMood, setSelectedMood] = useState(null);

  function submit() {
    if (!selectedMood) return;
    onPost({ mood: selectedMood, caption });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 flex items-end justify-center z-50"
      style={{ background: "rgba(28, 20, 16, 0.4)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-[600px] rounded-t-3xl p-6 pb-10"
        style={{ background: "#FDFAF7", border: "1px solid #EDE3DA" }}
      >
        <div className="flex justify-between items-center mb-5">
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
            className="text-lg"
            style={{
              background: "none",
              border: "none",
              color: "#8A7060",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {MOODS.map((m) => (
            <button
              key={m.tag}
              onClick={() => setSelectedMood(m)}
              className="px-4 py-2 rounded-full text-sm transition-all"
              style={{
                background: selectedMood?.tag === m.tag ? "#F9EDE3" : "#F5EDE3",
                border:
                  selectedMood?.tag === m.tag
                    ? "1.5px solid #C96A3A"
                    : "1.5px solid transparent",
                color: "#5A3A28",
                cursor: "pointer",
              }}
            >
              {m.emoji} {m.tag}
            </button>
          ))}
        </div>

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="add a caption… (optional)"
          maxLength={280}
          rows={3}
          className="w-full px-4 py-3 rounded-xl text-sm border resize-none mb-4"
          style={{
            background: "#FFF8F3",
            borderColor: "#E8D5C4",
            color: "#1C1410",
            outline: "none",
            fontFamily: "inherit",
          }}
        />

        <div className="flex justify-between items-center">
          <span className="text-xs" style={{ color: "#B09A8A" }}>
            {caption.length}/280
          </span>
          <button
            onClick={submit}
            disabled={!selectedMood}
            className="px-7 py-2.5 rounded-full font-medium text-sm"
            style={{
              background: selectedMood ? "#C96A3A" : "#E8D5C4",
              color: selectedMood ? "#F9F4EF" : "#B09A8A",
              border: "none",
              cursor: selectedMood ? "pointer" : "not-allowed",
            }}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Feed() {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [composing, setComposing] = useState(false);
  const [visiblePosts, setVisiblePosts] = useState(posts.map(() => false));
  const navigate = useNavigate();

  useEffect(() => {
    const timers = posts.map((_, i) =>
      setTimeout(
        () =>
          setVisiblePosts((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          }),
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
    setPosts([newPost, ...posts]);
    setVisiblePosts([false, ...visiblePosts]);
    setTimeout(
      () =>
        setVisiblePosts((prev) => {
          const next = [...prev];
          next[0] = true;
          return next;
        }),
      50,
    );
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <div className="min-h-screen" style={{ background: "#F9F4EF" }}>
        <div className="max-w-[600px] mx-auto">
          {/* Header */}
          <div
            className="flex justify-between items-center px-5 py-4 sticky top-0 z-10"
            style={{ background: "#F9F4EF", borderBottom: "1px solid #EDE3DA" }}
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
            <div className="flex gap-3 items-center">
              <button
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                🔔
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={{
                  background: "#C96A3A",
                  color: "#F9F4EF",
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Y
              </button>
            </div>
          </div>

          {/* Stories */}
          <div
            className="flex gap-4 px-5 py-4"
            style={{
              borderBottom: "1px solid #EDE3DA",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {MOCK_POSTS.map((p, i) => (
              <div
                key={p.id}
                className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <div
                  className="rounded-full p-[2.5px]"
                  style={{
                    width: 52,
                    height: 52,
                    background:
                      i < 2
                        ? "linear-gradient(135deg, #C96A3A, #E8B89A)"
                        : "transparent",
                    border: i >= 2 ? "2px solid #e8ddd5" : "none",
                  }}
                >
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center text-[#F9F4EF] text-lg"
                    style={{
                      background: p.avatarColor,
                      border: "2.5px solid #F9F4EF",
                      fontFamily: "'DM Serif Display', Georgia, serif",
                    }}
                  >
                    {p.avatar}
                  </div>
                </div>
                <span className="text-[11px]" style={{ color: "#8A7060" }}>
                  {p.handle}
                </span>
              </div>
            ))}
          </div>

          {/* Posts */}
          <div className="px-5 pt-5 pb-28 flex flex-col gap-5">
            {posts.map((post, i) => (
              <div
                key={post.id}
                className="pb-5 border-b transition-all duration-500"
                style={{
                  borderColor: "#EDE3DA",
                  opacity: visiblePosts[i] ? 1 : 0,
                  transform: visiblePosts[i]
                    ? "translateY(0)"
                    : "translateY(10px)",
                }}
              >
                <div className="flex gap-3 items-start">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[#F9F4EF] text-base flex-shrink-0"
                    style={{
                      background: post.avatarColor,
                      fontFamily: "'DM Serif Display', Georgia, serif",
                    }}
                  >
                    {post.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="font-semibold text-sm"
                        style={{ color: "#1C1410" }}
                      >
                        {post.name}
                      </span>
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{ background: "#F0E5DB", color: "#A05A3A" }}
                      >
                        {post.mood} {post.moodLabel}
                      </span>
                      <span
                        className="text-xs ml-auto"
                        style={{ color: "#B09A8A" }}
                      >
                        {post.time}
                      </span>
                    </div>
                    {post.caption ? (
                      <p
                        className="text-sm leading-relaxed m-0 break-words"
                        style={{ color: "#3D2B1F" }}
                      >
                        {post.caption}
                      </p>
                    ) : null}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {post.reactions.map((r) => (
                        <button
                          key={r.label}
                          className="flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                          style={{
                            background: "#F5EDE3",
                            color: "#8A7060",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {r.emoji} <span className="text-xs">{r.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Compose FAB */}
          <div
            className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-3"
            style={{
              background: "linear-gradient(to top, #F9F4EF 60%, transparent)",
            }}
          >
            <div className="max-w-[600px] mx-auto">
              <button
                onClick={() => setComposing(true)}
                className="w-full py-3.5 rounded-full font-medium text-base"
                style={{
                  background: "#1C1410",
                  color: "#F9F4EF",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                how are you feeling today?
              </button>
            </div>
          </div>
        </div>
      </div>

      {composing && (
        <ComposeSheet onClose={() => setComposing(false)} onPost={handlePost} />
      )}
    </>
  );
}
