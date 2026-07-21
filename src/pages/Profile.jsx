import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import SettingsSheet from "../components/SettingsSheet";
import EditProfileSheet from "../components/profile/EditProfileSheet";
import ComposeSheet from "../components/ComposeSheet"; // 1. Import the sheet
import PostCard from "../components/profile/PostCard";
import {
  ProfileSkeleton,
  PostSkeleton,
  EmptyTab,
  StatPill,
  CircleChip,
} from "../components/profile/ProfileUI";
import { getInitial } from "../lib/utils";
import { useProfile } from "../hooks/useProfile";
import { useFeed } from "../hooks/useFeed";
import { useCircles } from "../hooks/useCircles";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [tab, setTab] = useState("posts");

  // Sheet states
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCompose, setShowCompose] = useState(false); // 2. Add compose state

  // 3. Update handler to toggle state instead of navigating
  const handleCompose = () => setShowCompose(true);

  const { data: profile, isLoading: loadingProfile } = useProfile();
  const { data: feedPosts = [], isLoading: loadingPosts } = useFeed();
  const { data: circles = [], isLoading: loadingCircles } = useCircles();
  const { user } = useAuth();

  const myPosts = useMemo(() => {
    return feedPosts.filter((p) => p.author_id === user?.id);
  }, [feedPosts, user?.id]);

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-[#F9F4EF] w-full flex">
        <div className="flex-1 md:ml-[80px] max-w-[720px] mx-auto border-x border-[#EDE3DA]">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const initial = getInitial(profile.display_name, profile.handle);

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-[100dvh] flex bg-[#F9F4EF]">
        <Navbar
          active={activeTab}
          setActive={(t) => {
            setActiveTab(t);
            if (t === "home") navigate("/feed");
            if (t === "circles") navigate("/circles");
            if (t === "messages") navigate("/messages");
            if (t === "activity") navigate("/activity");
          }}
          onCompose={handleCompose}
        />

        <div className="flex-1 min-w-0 flex justify-center pb-[64px] md:pb-0 md:ml-[80px]">
          <div className="w-full max-w-[600px] xl:max-w-[720px] min-h-[100dvh] border-x-0 md:border-x border-[#EDE3DA] transition-all">
            {/* Topbar */}
            <div className="sticky top-0 z-10 h-14 px-4 md:px-8 flex items-center justify-between bg-[#F9F4EF]/95 backdrop-blur-md border-b border-[#EDE3DA]">
              <span className="font-serif text-lg text-[#1C1410] truncate">
                {profile.handle}
              </span>
              <button
                onClick={() => setShowSettings(true)}
                className="w-9 h-9 rounded-full text-[#8A7060] flex items-center justify-center hover:bg-[#F0E5DB] transition"
              >
                <i className="ti ti-settings text-xl" />
              </button>
            </div>

            {/* Profile Header */}
            <div className="p-4 pt-5 md:p-8 md:pt-8">
              <div className="flex items-end justify-between mb-4 gap-3">
                <div className="w-[68px] h-[68px] md:w-[84px] md:h-[84px] rounded-full p-[3px] bg-gradient-to-br from-[#C96A3A] to-[#E8B89A] shrink-0">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full rounded-full border-[3px] border-[#F9F4EF] object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#C96A3A] border-[3px] border-[#F9F4EF] flex items-center justify-center text-[#F9F4EF] text-3xl font-serif">
                      {initial}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setShowEditProfile(true)}
                  className="px-4 py-2 rounded-full border-[1.5px] border-[#EDE3DA] text-[#5A3A28] text-[13px] font-semibold hover:bg-[#F0E5DB] transition shrink-0"
                >
                  Edit profile
                </button>
              </div>

              <div className="mb-3">
                <div className="font-serif text-2xl text-[#1C1410] mb-0.5">
                  {profile.display_name}
                </div>
                <div className="text-[13px] text-[#8A7060]">
                  {profile.handle}
                </div>
              </div>

              {profile.bio && (
                <p className="m-0 mb-4 text-sm text-[#5A3A28] leading-relaxed md:max-w-[520px]">
                  {profile.bio}
                </p>
              )}

              <div className="flex gap-2.5 mb-5 md:max-w-[420px]">
                <StatPill
                  value={loadingPosts ? "—" : myPosts.length}
                  label="posts"
                />
                <StatPill
                  value={profile.streak_count ?? 0}
                  label="day streak"
                />
                <StatPill
                  value={loadingCircles ? "—" : circles.length}
                  label="circles"
                />
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-[#EDE3DA] bg-[#F9F4EF] sticky top-14 z-[9]">
              {["posts", "circles", "about"].map((key) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex-1 py-3 text-[13px] transition border-b-2 capitalize ${
                    tab === key
                      ? "border-[#C96A3A] text-[#C96A3A] font-semibold"
                      : "border-transparent text-[#8A7060] font-normal hover:bg-[#F0E5DB]/50"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[50vh] bg-white/30">
              {tab === "posts" && (
                <div>
                  {loadingPosts ? (
                    <>
                      <PostSkeleton />
                      <PostSkeleton />
                    </>
                  ) : myPosts.length === 0 ? (
                    <EmptyTab
                      message="No posts yet. Share how you're feeling!"
                      actionLabel="Create a Post"
                      onAction={handleCompose} // This now triggers setShowCompose(true)
                    />
                  ) : (
                    myPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  )}
                </div>
              )}

              {tab === "circles" && (
                <div className="p-4 md:p-6 grid gap-3 md:grid-cols-2">
                  {loadingCircles ? (
                    <div className="animate-pulse h-16 bg-[#E8D5C4] rounded-2xl w-full" />
                  ) : circles.length === 0 ? (
                    <div className="col-span-full">
                      <EmptyTab
                        message="You haven't joined any circles yet."
                        actionLabel="Explore Circles"
                        onAction={() => navigate("/circles")}
                      />
                    </div>
                  ) : (
                    circles.map((circle, idx) => (
                      <CircleChip key={circle.id} circle={circle} idx={idx} />
                    ))
                  )}
                </div>
              )}

              {tab === "about" && (
                <div className="p-4 md:p-6">
                  <div className="p-4 rounded-2xl bg-[#F0E5DB] mb-4">
                    <div className="text-[11px] font-semibold text-[#B09A8A] uppercase tracking-wider mb-2">
                      Bio
                    </div>
                    <p className="m-0 text-sm text-[#3D2B1F] leading-relaxed">
                      {profile.bio || "No bio yet."}
                    </p>
                  </div>
                  <div className="flex items-center gap-3.5 py-3.5 border-b border-[#EDE3DA]">
                    <div className="w-9 h-9 rounded-xl bg-[#F0E5DB] flex items-center justify-center text-[#C96A3A]">
                      <i className="ti ti-circles text-lg" />
                    </div>
                    <div>
                      <div className="text-[11px] text-[#B09A8A] font-medium">
                        Circles
                      </div>
                      <div className="text-sm text-[#1C1410]">
                        {circles.length}{" "}
                        {circles.length === 1 ? "circle" : "circles"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}
      {showEditProfile && (
        <EditProfileSheet
          profile={profile}
          onClose={() => setShowEditProfile(false)}
        />
      )}

      {showCompose && <ComposeSheet onClose={() => setShowCompose(false)} />}
    </>
  );
}
