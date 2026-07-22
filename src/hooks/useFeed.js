import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useFeed() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["feed", user?.id],
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
    queryFn: async () => {
      const { data: memberships, error: mError } = await supabase
        .from("circle_members")
        .select("circle_id")
        .eq("user_id", user.id);

      if (mError) throw mError;

      const circleIds = memberships.map((m) => m.circle_id);
      if (circleIds.length === 0) return [];

      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          author:profiles!posts_author_id_fkey ( id, display_name, username, avatar_url ),
          circles ( name ),
          reactions ( reaction, user_id )
        `,
        )
        .in("circle_id", circleIds)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      circleId,
      mood,
      moodLabel,
      caption,
      mediaFile,
      selectedSong,
    }) => {
      if (!user) throw new Error("Not authenticated");
      if (!circleId) throw new Error("Pick a circle to share this with.");
      if (!mood) throw new Error("Pick a mood first.");

      let media_attachment = null;

      if (mediaFile) {
        const ext = mediaFile.name.split(".").pop().toLowerCase();
        const filePath = `${user.id}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("post_media")
          .upload(filePath, mediaFile, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("post_media")
          .getPublicUrl(filePath);

        media_attachment = {
          type: "image",
          url: urlData.publicUrl,
        };
      }

      if (selectedSong) {
        media_attachment = {
          type: "song",
          track_id: selectedSong.track_id,
          title: selectedSong.title,
          artist: selectedSong.artist,
          cover_url: selectedSong.cover_url,
          preview_url: selectedSong.preview_url,
          clip_start: selectedSong.clip_start ?? 0,
          lyrics: selectedSong.lyrics ?? null,
        };
      }

      const { data, error } = await supabase
        .from("posts")
        .insert({
          author_id: user.id,
          circle_id: circleId,
          mood,
          mood_label: moodLabel,
          caption: caption?.trim() ? caption.trim() : null,
          media_attachment,
        })
        .select(
          `
          *,
          author:profiles!posts_author_id_fkey ( id, display_name, username, avatar_url ),
          circles ( name ),
          reactions ( reaction, user_id )
        `,
        )
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["feed", user?.id]);
      queryClient.invalidateQueries(["circles", user?.id]);
      queryClient.invalidateQueries(["profile", user?.id]);
    },
  });
}
