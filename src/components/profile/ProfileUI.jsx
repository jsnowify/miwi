// src/components/profile/ProfileUI.jsx
import { useNavigate } from "react-router-dom";

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse p-4 md:p-8">
      <div className="flex justify-between items-end mb-4">
        <div className="w-[68px] h-[68px] md:w-[84px] md:h-[84px] rounded-full bg-[#E8D5C4]" />
        <div className="w-24 h-9 rounded-full bg-[#E8D5C4]" />
      </div>
      <div className="w-48 h-8 bg-[#E8D5C4] rounded mb-2" />
      <div className="w-32 h-4 bg-[#E8D5C4] rounded mb-4" />
      <div className="w-full max-w-[520px] h-16 bg-[#E8D5C4] rounded mb-5" />
      <div className="flex gap-2">
        <div className="flex-1 h-16 bg-[#E8D5C4] rounded-xl" />
        <div className="flex-1 h-16 bg-[#E8D5C4] rounded-xl" />
        <div className="flex-1 h-16 bg-[#E8D5C4] rounded-xl" />
      </div>
    </div>
  );
}

export function PostSkeleton() {
  return (
    <div className="p-4 md:p-5 border-b border-[#EDE3DA] flex gap-3 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-[#E8D5C4] shrink-0" />
      <div className="flex-1">
        <div className="w-32 h-4 bg-[#E8D5C4] rounded mb-3" />
        <div className="w-full h-4 bg-[#E8D5C4] rounded mb-2" />
        <div className="w-3/4 h-4 bg-[#E8D5C4] rounded" />
      </div>
    </div>
  );
}

export function EmptyTab({ message, actionLabel, onAction }) {
  return (
    <div className="py-12 px-5 text-center flex flex-col items-center">
      <p className="text-[13px] text-[#8A7060] leading-relaxed mb-4">
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-full bg-[#C96A3A] text-[#F9F4EF] text-sm font-semibold transition hover:bg-[#A05A3A]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function StatPill({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-2.5 px-4 rounded-xl bg-[#F0E5DB] flex-1">
      <span className="font-serif text-xl text-[#1C1410] leading-none">
        {value}
      </span>
      <span className="text-[11px] text-[#8A7060] font-medium uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

const CIRCLE_BG = ["#F9EDE3", "#E8F3EE", "#EDE8F5", "#F3EEE8", "#E8EEF3"];

export function CircleChip({ circle, idx }) {
  const navigate = useNavigate();
  const bg = CIRCLE_BG[idx % CIRCLE_BG.length];
  const memberCount = circle.circle_members?.length ?? 0;

  return (
    <div
      onClick={() => navigate(`/circles/${circle.id}`)}
      className="flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer hover:brightness-95 transition"
      style={{ background: bg }}
    >
      <div className="w-10 h-10 rounded-[13px] bg-white/60 flex items-center justify-center text-xl shrink-0 shadow-sm">
        {circle.cover_color ?? "⭕"}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-[#1C1410] truncate">
          {circle.name}
        </div>
        <div className="text-xs text-[#8A7060] mt-0.5">
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </div>
      </div>
    </div>
  );
}
