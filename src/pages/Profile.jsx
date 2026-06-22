import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SettingsSheet from "../components/SettingsSheet";
import { useProfile } from "../hooks/useProfile";
import { useFeed } from "../hooks/useFeed";
import { useCircles } from "../hooks/useCircles";
import { supabase } from "../lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";

// ─── Edit Profile Sheet ───────────────────────────────────────────────────────

function EditProfileSheet({ profile, onClose }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef(null);
  const usernameDebounce = useRef(null);

  // Strip the leading "@" to get the raw username
  const currentUsername =
    profile.username ?? profile.handle?.replace("@", "") ?? "";

  const [form, setForm] = useState({
    display_name: profile.display_name ?? "",
    username: currentUsername,
    bio: profile.bio ?? "",
  });
  const [usernameStatus, setUsernameStatus] = useState("unchanged");
  // null | "checking" | "available" | "taken" | "invalid" | "unchanged"
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    profile.avatar_url ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Live username availability check — skip if unchanged
  useEffect(() => {
    const username = form.username.trim();

    if (username === currentUsername) {
      setUsernameStatus("unchanged");
      clearTimeout(usernameDebounce.current);
      return;
    }
    if (!username) {
      setUsernameStatus(null);
      return;
    }
    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      setUsernameStatus("invalid");
      return;
    }

    setUsernameStatus("checking");
    clearTimeout(usernameDebounce.current);
    usernameDebounce.current = setTimeout(async () => {
      // Use RPC (SECURITY DEFINER) so RLS doesn't hide other users' usernames
      const { data: exists, error: rpcError } = await supabase.rpc(
        "check_username_exists",
        {
          p_username: username,
          p_exclude_user_id: user.id,
        },
      );
      if (rpcError) {
        setUsernameStatus(null);
        return;
      }
      setUsernameStatus(exists ? "taken" : "available");
    }, 500);

    return () => clearTimeout(usernameDebounce.current);
  }, [form.username]);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  const usernameOk =
    usernameStatus === "unchanged" || usernameStatus === "available";

  async function handleSave() {
    if (!form.display_name.trim()) {
      setError("Display name can't be empty.");
      return;
    }
    if (!form.username.trim()) {
      setError("Username can't be empty.");
      return;
    }
    if (usernameStatus === "taken") {
      setError(`@${form.username} is already taken.`);
      return;
    }
    if (usernameStatus === "invalid") {
      setError(
        "Username must be 3–30 characters: lowercase letters, numbers, or underscores only.",
      );
      return;
    }
    if (usernameStatus === "checking") {
      setError("Still checking username availability, please wait.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      let avatar_url = profile.avatar_url;

      // Upload new avatar if selected
      if (avatarFile) {
        const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
        const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

        if (!ALLOWED_TYPES.includes(avatarFile.type)) {
          setError("Avatar must be a JPEG, PNG, or WebP image.");
          setSaving(false);
          return;
        }
        if (avatarFile.size > MAX_SIZE_BYTES) {
          setError("Avatar must be under 2 MB.");
          setSaving(false);
          return;
        }

        const ext = avatarFile.name.split(".").pop().toLowerCase();
        // Path matches schema: avatars/{user_id}/avatar.{ext}
        // RLS policy checks foldername = user_id, so the folder is required
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, {
            upsert: true,
            contentType: avatarFile.type,
          });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);
        avatar_url = urlData.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          display_name: form.display_name.trim(),
          username: form.username.trim(),
          bio: form.bio.trim(),
          avatar_url,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Invalidate so Profile re-fetches fresh data
      queryClient.invalidateQueries(["profile", user.id]);
      onClose();
    } catch (err) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  const avatarSize = 72;
  const initial = form.display_name?.charAt(0).toUpperCase() ?? "?";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(28,20,16,0.4)",
          zIndex: 100,
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          background: "#FDFAF7",
          borderRadius: "24px 24px 0 0",
          zIndex: 101,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Handle */}
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 999,
            background: "#E8D5C4",
            margin: "12px auto 0",
          }}
        />

        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #EDE3DA",
          }}
        >
          <span
            style={{
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontSize: 20,
              color: "#1C1410",
            }}
          >
            Edit profile
          </span>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "#F0E5DB",
              color: "#8A7060",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6 6 18M6 6l12 12"
                stroke="#8A7060"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "20px 24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* Avatar picker */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                position: "relative",
                width: avatarSize,
                height: avatarSize,
              }}
            >
              <div
                style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: "50%",
                  padding: 3,
                  background: "linear-gradient(135deg, #C96A3A, #E8B89A)",
                }}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      border: "3px solid #FDFAF7",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      background: "#C96A3A",
                      border: "3px solid #FDFAF7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#F9F4EF",
                      fontSize: 26,
                      fontFamily: "'DM Serif Display', Georgia, serif",
                    }}
                  >
                    {initial}
                  </div>
                )}
              </div>
              {/* Camera button */}
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  border: "2px solid #FDFAF7",
                  background: "#C96A3A",
                  color: "#F9F4EF",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                    stroke="#F9F4EF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="13"
                    r="4"
                    stroke="#F9F4EF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* Display name */}
          <div>
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
              Display name
            </label>
            <input
              type="text"
              value={form.display_name}
              onChange={set("display_name")}
              maxLength={50}
              placeholder="Your name"
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
              onFocus={(e) => (e.target.style.borderColor = "#1C1410")}
              onBlur={(e) => (e.target.style.borderColor = "#E8D5C4")}
            />
          </div>

          {/* Username */}
          <div>
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
              Username
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    username: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9_]/g, ""),
                  }))
                }
                maxLength={30}
                placeholder="your_username"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 40px 10px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${
                    usernameStatus === "available"
                      ? "#6BAE8A"
                      : usernameStatus === "taken" ||
                          usernameStatus === "invalid"
                        ? "#C96A3A"
                        : "#E8D5C4"
                  }`,
                  background: "#FFF8F3",
                  color: "#1C1410",
                  fontSize: 14,
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.15s",
                }}
              />
              {/* Status icon */}
              <span
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  alignItems: "center",
                  pointerEvents: "none",
                }}
              >
                {usernameStatus === "checking" && (
                  <span
                    style={{
                      color: "#B09A8A",
                      fontSize: 12,
                      letterSpacing: "0.1em",
                    }}
                  >
                    ···
                  </span>
                )}
                {usernameStatus === "available" && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <polyline
                      points="20 6 9 17 4 12"
                      stroke="#6BAE8A"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {(usernameStatus === "taken" ||
                  usernameStatus === "invalid") && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <line
                      x1="18"
                      y1="6"
                      x2="6"
                      y2="18"
                      stroke="#C96A3A"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <line
                      x1="6"
                      y1="6"
                      x2="18"
                      y2="18"
                      stroke="#C96A3A"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </span>
            </div>
            {/* Status message */}
            {usernameStatus === "available" && (
              <p style={{ fontSize: 12, color: "#6BAE8A", margin: "4px 0 0" }}>
                @{form.username} is available!
              </p>
            )}
            {usernameStatus === "taken" && (
              <p style={{ fontSize: 12, color: "#A05A3A", margin: "4px 0 0" }}>
                @{form.username} is already taken.
              </p>
            )}
            {usernameStatus === "invalid" && (
              <p style={{ fontSize: 12, color: "#A05A3A", margin: "4px 0 0" }}>
                3–30 characters: lowercase letters, numbers, or underscores
                only.
              </p>
            )}
            {usernameStatus === "checking" && (
              <p style={{ fontSize: 12, color: "#B09A8A", margin: "4px 0 0" }}>
                Checking availability…
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
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
              Bio
            </label>
            <textarea
              value={form.bio}
              onChange={set("bio")}
              maxLength={160}
              rows={3}
              placeholder="A little about you…"
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
                resize: "none",
                fontFamily: "inherit",
                lineHeight: 1.6,
              }}
              onFocus={(e) => (e.target.style.borderColor = "#1C1410")}
              onBlur={(e) => (e.target.style.borderColor = "#E8D5C4")}
            />
            <div
              style={{
                textAlign: "right",
                fontSize: 11,
                color: "#B09A8A",
                marginTop: 4,
              }}
            >
              {form.bio.length}/160
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: "#A05A3A", margin: 0 }}>{error}</p>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "11px",
                borderRadius: 999,
                border: "1.5px solid #EDE3DA",
                background: "transparent",
                color: "#5A3A28",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !usernameOk}
              style={{
                flex: 2,
                padding: "11px",
                borderRadius: 999,
                border: "none",
                background: saving || !usernameOk ? "#E8D5C4" : "#C96A3A",
                color: saving || !usernameOk ? "#B09A8A" : "#F9F4EF",
                fontSize: 14,
                fontWeight: 600,
                cursor: saving || !usernameOk ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ value, label }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        padding: "10px 20px",
        borderRadius: 14,
        background: "#F0E5DB",
        flex: 1,
      }}
    >
      <span
        style={{
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontSize: 20,
          color: "#1C1410",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: 11, color: "#8A7060", fontWeight: 500 }}>
        {label}
      </span>
    </div>
  );
}

// ─── Post card (real data) ────────────────────────────────────────────────────

function PostCard({ post }) {
  // Group reactions by emoji
  const reactionMap = (post.reactions ?? []).reduce((acc, r) => {
    acc[r.reaction] = (acc[r.reaction] ?? 0) + 1;
    return acc;
  }, {});
  const reactions = Object.entries(reactionMap).map(([emoji, count]) => ({
    emoji,
    count,
  }));

  const timeAgo = (ts) => {
    const diff = (Date.now() - new Date(ts)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div
      style={{
        padding: "16px 20px",
        borderBottom: "1px solid #EDE3DA",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
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

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 999,
              background: "#F0E5DB",
              color: "#A05A3A",
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            {post.mood} {post.mood_label}
          </span>
          <span style={{ fontSize: 11, color: "#B09A8A", marginLeft: "auto" }}>
            {timeAgo(post.created_at)}
          </span>
        </div>

        {post.caption && (
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 14,
              lineHeight: 1.6,
              color: "#3D2B1F",
              wordBreak: "break-word",
            }}
          >
            {post.caption}
          </p>
        )}

        {reactions.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {reactions.map((r) => (
              <button
                key={r.emoji}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 10px",
                  borderRadius: 999,
                  border: "none",
                  background: "#F5EDE3",
                  color: "#8A7060",
                  cursor: "pointer",
                  fontSize: 13,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#EDE3DA")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#F5EDE3")
                }
              >
                {r.emoji} <span style={{ fontSize: 12 }}>{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyTab({ message }) {
  return (
    <div
      style={{
        padding: "48px 20px",
        textAlign: "center",
        fontSize: 13,
        color: "#8A7060",
        lineHeight: 1.7,
      }}
    >
      {message}
    </div>
  );
}

// ─── Circle chip (real data) ──────────────────────────────────────────────────

const CIRCLE_BG = ["#F9EDE3", "#E8F3EE", "#EDE8F5", "#F3EEE8", "#E8EEF3"];

function CircleChip({ circle, idx }) {
  const bg = CIRCLE_BG[idx % CIRCLE_BG.length];
  const memberCount = circle.circle_members?.length ?? 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 16,
        background: bg,
        cursor: "pointer",
        transition: "filter 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.96)")}
      onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 13,
          background: "rgba(255,255,255,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          flexShrink: 0,
        }}
      >
        {circle.cover_color ?? "⭕"}
      </div>
      <div style={{ minWidth: 0 }}>
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
          {circle.name}
        </div>
        <div style={{ fontSize: 12, color: "#8A7060", marginTop: 2 }}>
          {memberCount} {memberCount === 1 ? "member" : "members"}
        </div>
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function Tabs({ active, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        borderBottom: "1px solid #EDE3DA",
        background: "#F9F4EF",
        position: "sticky",
        top: 56,
        zIndex: 9,
        flexShrink: 0,
      }}
    >
      {[
        { key: "posts", label: "Posts" },
        { key: "circles", label: "Circles" },
        { key: "about", label: "About" },
      ].map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            flex: 1,
            padding: "12px 8px",
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
        </button>
      ))}
    </div>
  );
}

// ─── About tab ────────────────────────────────────────────────────────────────

function AboutTab({ profile, circleCount, onEdit }) {
  return (
    <div style={{ padding: "16px" }}>
      <div
        style={{
          padding: "16px",
          borderRadius: 16,
          background: "#F0E5DB",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "#B09A8A",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          Bio
        </div>
        <p
          style={{ margin: 0, fontSize: 14, color: "#3D2B1F", lineHeight: 1.7 }}
        >
          {profile.bio || "no bio yet."}
        </p>
      </div>

      {[
        { icon: "ti-calendar", label: "Joined", value: profile.joinedDate },
        {
          icon: "ti-circles",
          label: "Circles",
          value: `${circleCount} ${circleCount === 1 ? "circle" : "circles"}`,
        },
      ].map(({ icon, label, value }) => (
        <div
          key={label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 0",
            borderBottom: "1px solid #EDE3DA",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#F0E5DB",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <i
              className={`ti ${icon}`}
              style={{ fontSize: 18, color: "#C96A3A" }}
            />
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#B09A8A", fontWeight: 500 }}>
              {label}
            </div>
            <div style={{ fontSize: 14, color: "#1C1410", marginTop: 1 }}>
              {value}
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={onEdit}
        style={{
          width: "100%",
          marginTop: 24,
          padding: "12px",
          borderRadius: 999,
          border: "1.5px solid #EDE3DA",
          background: "transparent",
          color: "#5A3A28",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#F0E5DB")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <i className="ti ti-pencil" style={{ fontSize: 16 }} />
        Edit profile
      </button>
    </div>
  );
}

// ─── Profile page ─────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [tab, setTab] = useState("posts");
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );
  const [isDesktopWide, setIsDesktopWide] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1100 : false,
  );

  useEffect(() => {
    const handle = () => {
      setIsMobile(window.innerWidth < 768);
      setIsDesktopWide(window.innerWidth >= 1100);
    };
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  const { data: profile, isLoading: loadingProfile } = useProfile();
  const { data: feedPosts = [], isLoading: loadingPosts } = useFeed();
  const { data: circles = [], isLoading: loadingCircles } = useCircles();

  // Filter feed posts down to only this user's own posts
  const { user } = useAuth();
  const myPosts = feedPosts.filter((p) => p.author_id === user?.id);

  const avatarSize = isMobile ? 68 : 84;

  if (loadingProfile) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F9F4EF",
        }}
      >
        <span
          style={{
            fontFamily: "'DM Serif Display', Georgia, serif",
            fontSize: 22,
            color: "#C96A3A",
          }}
        >
          miwi
        </span>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />

      <div
        style={{ minHeight: "100dvh", display: "flex", background: "#F9F4EF" }}
      >
        <Navbar
          active={activeTab}
          setActive={(t) => {
            setActiveTab(t);
            if (t === "home") navigate("/feed");
            if (t === "circles") navigate("/circles");
            if (t === "messages") navigate("/messages");
            if (t === "activity") navigate("/activity");
          }}
          onCompose={() => {}}
        />

        <div
          className="md:ml-[80px] pb-[64px] md:pb-0"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {/* Center column — widens on large desktop, stays readable on tablet/mobile */}
          <div
            style={{
              width: "100%",
              maxWidth: isDesktopWide ? 720 : 600,
              minHeight: "100dvh",
              borderLeft: "1px solid #EDE3DA",
              borderRight: "1px solid #EDE3DA",
              transition: "max-width 0.2s ease",
            }}
            className="border-x-0 md:border-x"
          >
            {/* Sticky topbar */}
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 10,
                height: 56,
                padding: isDesktopWide ? "0 32px" : "0 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(249,244,239,0.95)",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid #EDE3DA",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Serif Display', Georgia, serif",
                  fontSize: 18,
                  color: "#1C1410",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {profile.handle}
              </span>

              <button
                onClick={() => setShowSettings(true)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: "none",
                  background: "transparent",
                  color: "#8A7060",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#F0E5DB")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <i className="ti ti-settings" style={{ fontSize: 20 }} />
              </button>
            </div>

            {/* Profile header */}
            <div
              style={{ padding: isDesktopWide ? "32px 32px 0" : "20px 16px 0" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  marginBottom: 14,
                  gap: 12,
                }}
              >
                {/* Avatar with gradient ring */}
                <div
                  style={{
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: "50%",
                    padding: 3,
                    background: "linear-gradient(135deg, #C96A3A, #E8B89A)",
                    flexShrink: 0,
                  }}
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        border: "3px solid #F9F4EF",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        background: "#C96A3A",
                        border: "3px solid #F9F4EF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#F9F4EF",
                        fontSize: isMobile ? 24 : 30,
                        fontFamily: "'DM Serif Display', Georgia, serif",
                      }}
                    >
                      {profile.initial}
                    </div>
                  )}
                </div>

                {/* Edit profile button */}
                <button
                  onClick={() => setShowEditProfile(true)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: "1.5px solid #EDE3DA",
                    background: "transparent",
                    color: "#5A3A28",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "background 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#F0E5DB")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  Edit profile
                </button>
              </div>

              {/* Name + handle */}
              <div style={{ marginBottom: 8 }}>
                <div
                  style={{
                    fontFamily: "'DM Serif Display', Georgia, serif",
                    fontSize: isMobile ? 20 : 24,
                    color: "#1C1410",
                    marginBottom: 2,
                  }}
                >
                  {profile.display_name}
                </div>
                <div style={{ fontSize: 13, color: "#8A7060" }}>
                  {profile.handle}
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p
                  style={{
                    margin: "0 0 14px",
                    fontSize: 14,
                    color: "#5A3A28",
                    lineHeight: 1.65,
                    maxWidth: isDesktopWide ? 520 : "none",
                  }}
                >
                  {profile.bio}
                </p>
              )}

              {/* Stats */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 20,
                  maxWidth: isDesktopWide ? 420 : "none",
                }}
              >
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

            {/* Tabs */}
            <Tabs active={tab} onChange={setTab} />

            {/* Tab content */}
            <div style={{ minHeight: "50vh" }}>
              {tab === "posts" && (
                <div>
                  {loadingPosts ? (
                    <EmptyTab message="loading posts…" />
                  ) : myPosts.length === 0 ? (
                    <EmptyTab message="no posts yet. share how you're feeling!" />
                  ) : (
                    myPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  )}
                </div>
              )}

              {tab === "circles" && (
                <div
                  style={{
                    padding: isDesktopWide ? "16px 32px" : "16px",
                    display: isDesktopWide ? "grid" : "flex",
                    gridTemplateColumns: isDesktopWide
                      ? "repeat(2, 1fr)"
                      : undefined,
                    flexDirection: isDesktopWide ? undefined : "column",
                    gap: 10,
                  }}
                >
                  {loadingCircles ? (
                    <EmptyTab message="loading circles…" />
                  ) : circles.length === 0 ? (
                    <EmptyTab message="not in any circles yet." />
                  ) : (
                    circles.map((circle, idx) => (
                      <CircleChip key={circle.id} circle={circle} idx={idx} />
                    ))
                  )}
                </div>
              )}

              {tab === "about" && (
                <AboutTab
                  profile={profile}
                  circleCount={circles.length}
                  onEdit={() => setShowEditProfile(true)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings sheet */}
      {showSettings && <SettingsSheet onClose={() => setShowSettings(false)} />}

      {/* Edit profile sheet */}
      {showEditProfile && (
        <EditProfileSheet
          profile={profile}
          onClose={() => setShowEditProfile(false)}
        />
      )}
    </>
  );
}
