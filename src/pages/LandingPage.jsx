import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

function StoryRing({ name, avatar, avatarColor, active }) {
  return (
    <div className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0">
      <div
        className="rounded-full p-[2.5px]"
        style={{
          width: 52,
          height: 52,
          background: active
            ? "linear-gradient(135deg, #C96A3A, #E8B89A)"
            : "transparent",
          border: active ? "none" : "2px solid #e8ddd5",
        }}
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center text-[#F9F4EF] text-lg"
          style={{
            background: avatarColor,
            border: "2.5px solid #F9F4EF",
            fontFamily: "'DM Serif Display', Georgia, serif",
          }}
        >
          {avatar}
        </div>
      </div>
      <span className="text-[11px]" style={{ color: "#8A7060" }}>
        {name}
      </span>
    </div>
  );
}

function PostCard({ post, visible }) {
  return (
    <div
      className="pb-5 border-b transition-all duration-500"
      style={{
        borderColor: "#EDE3DA",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
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
              className="text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{ background: "#F0E5DB", color: "#A05A3A" }}
            >
              {post.mood} {post.moodLabel}
            </span>
            <span
              className="text-xs ml-auto whitespace-nowrap"
              style={{ color: "#B09A8A" }}
            >
              {post.time}
            </span>
          </div>
          <p
            className="text-sm leading-relaxed m-0 break-words"
            style={{ color: "#3D2B1F" }}
          >
            {post.caption}
          </p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {post.reactions.map((r) => (
              <button
                key={r.label}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-sm border-0 cursor-pointer"
                style={{ background: "#F5EDE3", color: "#8A7060" }}
              >
                {r.emoji} <span className="text-xs">{r.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MockFeed() {
  const [visiblePosts, setVisiblePosts] = useState([false, false, false]);

  useEffect(() => {
    const timers = [0, 400, 800].map((delay, i) =>
      setTimeout(() => {
        setVisiblePosts((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, delay + 300),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#FDFAF7",
        border: "1px solid #EDE3DA",
        boxShadow: "0 4px 32px rgba(140, 90, 60, 0.08)",
      }}
    >
      <div
        className="flex justify-between items-center px-5 py-3 border-b"
        style={{ borderColor: "#EDE3DA", background: "#FDFAF7" }}
      >
        <span
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 20,
            color: "#1C1410",
          }}
        >
          miwi
        </span>
        <div className="flex gap-3 items-center">
          <span className="text-lg cursor-pointer">🔔</span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#F9F4EF] text-sm"
            style={{
              background: "#C96A3A",
              fontFamily: "'DM Serif Display', Georgia, serif",
            }}
          >
            Y
          </div>
        </div>
      </div>
      <div
        className="flex gap-4 px-5 py-4 border-b overflow-x-auto"
        style={{ borderColor: "#EDE3DA", WebkitOverflowScrolling: "touch" }}
      >
        {MOCK_POSTS.map((p, i) => (
          <StoryRing
            key={p.id}
            name={p.handle}
            avatar={p.avatar}
            avatarColor={p.avatarColor}
            active={i < 2}
          />
        ))}
        <StoryRing
          name="+ invite"
          avatar="+"
          avatarColor="#D9C5B5"
          active={false}
        />
      </div>
      <div className="px-5 pt-5 pb-1 flex flex-col gap-5">
        {MOCK_POSTS.map((post, i) => (
          <PostCard key={post.id} post={post} visible={visiblePosts[i]} />
        ))}
      </div>
    </div>
  );
}

function FeatureRow({ emoji, title, description }) {
  return (
    <div className="flex gap-4 items-start">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
        style={{ background: "#F0E5DB" }}
      >
        {emoji}
      </div>
      <div>
        <p
          className="m-0 mb-1 font-semibold text-sm"
          style={{ color: "#1C1410" }}
        >
          {title}
        </p>
        <p className="m-0 text-sm leading-relaxed" style={{ color: "#7A6254" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <div
        className="min-h-screen"
        style={{ background: "#F9F4EF", color: "#1C1410" }}
      >
        {/* Nav */}
        <nav className="max-w-[600px] mx-auto px-6 py-5 flex justify-between items-center">
          <span
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 24,
              color: "#1C1410",
            }}
          >
            miwi
          </span>
          <Link
            to="/login"
            className="text-sm font-medium no-underline"
            style={{ color: "#8A7060" }}
          >
            Log in
          </Link>
        </nav>

        {/* Hero */}
        <section className="max-w-[600px] mx-auto px-6 pt-10 pb-16">
          <p
            className="text-xs font-medium tracking-widest uppercase mb-5"
            style={{ color: "#C96A3A" }}
          >
            Small circle. Big feelings.
          </p>
          <h1
            className="font-normal leading-[1.15] mb-5"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(32px, 7vw, 52px)",
              color: "#1C1410",
            }}
          >
            A soft space for the people who matter.
          </h1>
          <p
            className="leading-[1.7] mb-10"
            style={{ fontSize: "clamp(15px, 3vw, 17px)", color: "#7A6254" }}
          >
            Miwi is a private mood-sharing app for your closest circle — no
            algorithm, no audience, no performance. Just honest daily check-ins
            with the people you love.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full font-medium text-base no-underline"
              style={{ background: "#C96A3A", color: "#F9F4EF" }}
            >
              Get started — it's free
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-7 py-3.5 rounded-full font-medium text-base no-underline"
              style={{ background: "#F0E5DB", color: "#7A4A2A" }}
            >
              Log in
            </Link>
          </div>
        </section>

        {/* Mock feed */}
        <section className="max-w-[600px] mx-auto px-6 mb-20">
          <MockFeed />
        </section>

        {/* Features */}
        <section className="max-w-[600px] mx-auto px-6 mb-20">
          <h2
            className="font-normal mb-9"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(24px, 5vw, 28px)",
              color: "#1C1410",
            }}
          >
            Made for closeness, not clout.
          </h2>
          <div className="flex flex-col gap-7">
            <FeatureRow
              emoji="🌿"
              title="Mood posts"
              description="Start with a vibe tag — calm, low, excited, at peace — then a short caption. Low-pressure, high-honesty."
            />
            <FeatureRow
              emoji="🫂"
              title="Soft reactions"
              description="No cold like counts. React with Same, Thinking of you, Let's go!, or Sending a hug — only the poster sees who reacted."
            />
            <FeatureRow
              emoji="🔗"
              title="Circles"
              description="Invite-only groups of 3–10. Your barkada, your long-distance friends, your person — each gets their own circle."
            />
            <FeatureRow
              emoji="✨"
              title="Miwi Memories"
              description="At the end of each month, a quiet recap of your most-used mood, a highlight from your circle, and a warm note."
            />
          </div>
        </section>

        {/* Mood tags */}
        <section className="max-w-[600px] mx-auto px-6 mb-20">
          <h2
            className="font-normal mb-5"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(24px, 5vw, 28px)",
              color: "#1C1410",
            }}
          >
            How are you feeling today?
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {[
              ["🌿", "calm"],
              ["🔥", "excited"],
              ["🌧️", "low"],
              ["🌙", "sleepy"],
              ["✨", "grateful"],
              ["🫂", "needing a hug"],
              ["🍃", "at peace"],
              ["🌪️", "overwhelmed"],
              ["😂", "chaotic good"],
            ].map(([emoji, label]) => (
              <div
                key={label}
                className="px-4 py-2 rounded-full text-sm"
                style={{
                  background: "#F5EDE3",
                  border: "1px solid #E8D5C4",
                  color: "#5A3A28",
                }}
              >
                {emoji} {label}
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section
          className="max-w-[600px] mx-auto px-6 py-16 text-center"
          style={{ borderTop: "1px solid #EDE3DA" }}
        >
          <p
            className="font-normal leading-snug mb-4"
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: "clamp(26px, 5vw, 38px)",
              color: "#1C1410",
            }}
          >
            Your circle is waiting.{" "}
            <span style={{ color: "#C96A3A", fontStyle: "italic" }}>
              Join them.
            </span>
          </p>
          <p className="text-sm mb-9" style={{ color: "#7A6254" }}>
            No ads. No strangers. No algorithm.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full font-medium text-base no-underline"
            style={{ background: "#1C1410", color: "#F9F4EF" }}
          >
            Create your circle 🌸
          </Link>
        </section>

        {/* Footer */}
        <footer
          className="max-w-[600px] mx-auto px-6 py-5 flex justify-between items-center"
          style={{ borderTop: "1px solid #EDE3DA" }}
        >
          <span
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 18,
              color: "#1C1410",
            }}
          >
            miwi
          </span>
          <span className="text-xs" style={{ color: "#B09A8A" }}>
            made with 🌸
          </span>
        </footer>
      </div>
    </>
  );
}
