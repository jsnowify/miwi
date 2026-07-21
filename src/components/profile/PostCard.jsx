// src/components/profile/PostCard.jsx
export default function PostCard({ post }) {
  const reactionMap = (post.reactions ?? []).reduce((acc, r) => {
    acc[r.reaction] = (acc[r.reaction] ?? 0) + 1;
    return acc;
  }, {});
  const reactions = Object.entries(reactionMap).map(([emoji, count]) => ({
    emoji,
    count,
  }));

  const handleReact = async (emoji) => {
    // TODO: Implement post reaction toggle mutation here.
    console.log(`Reacted with ${emoji} to post ${post.id}`);
  };

  return (
    <div className="p-4 md:p-5 border-b border-[#EDE3DA] flex gap-3.5 items-start bg-transparent hover:bg-white/30 transition">
      <div className="w-10 h-10 rounded-full bg-[#F0E5DB] shrink-0 flex items-center justify-center text-lg shadow-inner">
        {post.mood}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F0E5DB] text-[#A05A3A] font-medium shrink-0">
            {post.mood} {post.mood_label}
          </span>
          <span className="text-[11px] text-[#B09A8A] ml-auto">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
        {post.caption && (
          <p className="m-0 mb-3 text-sm leading-relaxed text-[#3D2B1F] break-words">
            {post.caption}
          </p>
        )}
        {reactions.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => handleReact(r.emoji)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full border-none bg-[#F5EDE3] text-[#8A7060] text-[13px] hover:bg-[#EDE3DA] transition"
              >
                {r.emoji} <span className="text-xs font-medium">{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
