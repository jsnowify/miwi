// src/components/profile/EditProfileSheet.jsx
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { extractAvatarStoragePath, getInitial } from "../../lib/utils";
import toast from "react-hot-toast";

export default function EditProfileSheet({ profile, onClose }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef(null);
  const usernameDebounce = useRef(null);

  const currentUsername =
    profile.username ?? profile.handle?.replace("@", "") ?? "";

  const [form, setForm] = useState({
    display_name: profile.display_name ?? "",
    username: currentUsername,
    bio: profile.bio ?? "",
  });

  const [usernameStatus, setUsernameStatus] = useState("unchanged");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    profile.avatar_url ?? null,
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
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
      const { data: exists, error: rpcError } = await supabase.rpc(
        "check_username_exists",
        { p_username: username, p_exclude_user_id: user.id },
      );

      if (!isMounted) return;

      if (rpcError) {
        setUsernameStatus(null);
        return;
      }
      setUsernameStatus(exists ? "taken" : "available");
    }, 500);

    return () => {
      isMounted = false;
      clearTimeout(usernameDebounce.current);
    };
  }, [form.username, currentUsername, user.id]);

  // Revoke any blob: preview URL we created so we don't leak memory if the
  // user picks multiple avatars before saving, or closes without saving.
  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke the previous blob preview (if any) before creating a new one.
    if (avatarPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  const usernameOk =
    usernameStatus === "unchanged" || usernameStatus === "available";
  const usernamePending = usernameStatus === "checking";

  async function handleSave() {
    if (!form.display_name.trim() || !form.username.trim()) {
      toast.error("Name and username cannot be empty.");
      return;
    }
    if (usernamePending) {
      toast.error("Still checking that username, hang on a sec.");
      return;
    }
    if (usernameStatus === "taken" || usernameStatus === "invalid") {
      toast.error("Please choose a valid, available username.");
      return;
    }

    setSaving(true);

    const updateProfilePromise = async () => {
      let avatar_url = profile.avatar_url;

      if (avatarFile) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError)
          throw new Error("Session expired. Please log in again.");

        const ext = avatarFile.name.split(".").pop().toLowerCase();
        const path = `${user.id}/avatar-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, {
            upsert: false,
            contentType: avatarFile.type,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);
        avatar_url = urlData.publicUrl;

        const oldPath = extractAvatarStoragePath(profile.avatar_url);
        if (oldPath && oldPath !== path) {
          supabase.storage
            .from("avatars")
            .remove([oldPath])
            .then(({ error: removeError }) => {
              if (removeError) {
                console.warn(
                  `Failed to remove old avatar at "${oldPath}":`,
                  removeError,
                );
              }
            })
            .catch((err) =>
              console.warn(`Unexpected error removing old avatar:`, err),
            );
        }
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

      queryClient.setQueryData(["profile", user.id], (old) => ({
        ...old,
        display_name: form.display_name.trim(),
        handle: `@${form.username.trim()}`,
        username: form.username.trim(),
        bio: form.bio.trim(),
        avatar_url,
      }));

      queryClient.invalidateQueries(["profile", user.id]);
    };

    toast
      .promise(updateProfilePromise(), {
        loading: "Saving profile...",
        success: "Profile updated successfully!",
        error: (err) => `Could not save: ${err.message}`,
      })
      .then(() => {
        setSaving(false);
        onClose();
      })
      .catch(() => {
        setSaving(false);
      });
  }

  const initial = getInitial(form.display_name, form.username);

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#1C1410]/40 z-[100] backdrop-blur-sm"
      />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[#FDFAF7] rounded-t-3xl z-[101] pb-safe">
        <div className="w-9 h-1 rounded-full bg-[#E8D5C4] mx-auto mt-3" />

        <div className="p-5 flex items-center justify-between border-b border-[#EDE3DA]">
          <span className="font-serif text-[20px] text-[#1C1410]">
            Edit profile
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F0E5DB] text-[#8A7060] flex items-center justify-center hover:bg-[#E8D5C4] transition"
          >
            <i className="ti ti-x text-lg" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex justify-center">
            <div className="relative w-[72px] h-[72px]">
              <div className="w-full h-full rounded-full p-[3px] bg-gradient-to-br from-[#C96A3A] to-[#E8B89A]">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="w-full h-full rounded-full border-[3px] border-[#FDFAF7] object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-[#C96A3A] border-[3px] border-[#FDFAF7] flex items-center justify-center text-[#F9F4EF] text-2xl font-serif">
                    {initial}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full border-2 border-[#FDFAF7] bg-[#C96A3A] text-[#F9F4EF] flex items-center justify-center hover:bg-[#A05A3A] transition"
              >
                <i className="ti ti-camera text-sm" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8A7060] uppercase tracking-wide mb-1.5">
              Display name
            </label>
            <input
              type="text"
              value={form.display_name}
              onChange={set("display_name")}
              maxLength={50}
              className="w-full p-3 rounded-xl border-2 border-[#E8D5C4] bg-[#FFF8F3] text-[#1C1410] text-sm outline-none focus:border-[#1C1410] transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8A7060] uppercase tracking-wide mb-1.5">
              Username
            </label>
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
              className={`w-full p-3 rounded-xl border-2 bg-[#FFF8F3] text-[#1C1410] text-sm outline-none transition ${
                usernameStatus === "available"
                  ? "border-[#6BAE8A]"
                  : usernameStatus === "taken" || usernameStatus === "invalid"
                    ? "border-[#C96A3A]"
                    : "border-[#E8D5C4] focus:border-[#1C1410]"
              }`}
            />
            {usernameStatus === "checking" && (
              <p className="text-xs text-[#8A7060] mt-1">
                Checking availability…
              </p>
            )}
            {usernameStatus === "available" && (
              <p className="text-xs text-[#6BAE8A] mt-1">
                @{form.username} is available!
              </p>
            )}
            {usernameStatus === "taken" && (
              <p className="text-xs text-[#C96A3A] mt-1">
                @{form.username} is already taken.
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8A7060] uppercase tracking-wide mb-1.5">
              Bio
            </label>
            <textarea
              value={form.bio}
              onChange={set("bio")}
              maxLength={160}
              rows={3}
              className="w-full p-3 rounded-xl border-2 border-[#E8D5C4] bg-[#FFF8F3] text-[#1C1410] text-sm outline-none resize-none focus:border-[#1C1410] transition leading-relaxed"
            />
            <div className="text-right text-[11px] text-[#B09A8A] mt-1">
              {form.bio.length}/160
            </div>
          </div>

          <div className="flex gap-2.5 mt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-full border-[1.5px] border-[#EDE3DA] text-[#5A3A28] text-sm font-semibold hover:bg-[#F0E5DB] transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !usernameOk || usernamePending}
              className="flex-[2] py-3 rounded-full bg-[#C96A3A] text-[#F9F4EF] text-sm font-semibold disabled:bg-[#E8D5C4] disabled:text-[#B09A8A] transition"
            >
              {saving
                ? "Saving…"
                : usernamePending
                  ? "Checking…"
                  : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
