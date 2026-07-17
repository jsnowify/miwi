import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useFeed() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["feed", user?.id],
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 min
    queryFn: async () => {
      // Get all circles the user belongs to
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

// Creates a real mood post in Supabase and keeps every screen that reads
// posts (Feed, Profile, Circles mood breakdown) in sync afterward.
export function useCreatePost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ circleId, mood, moodLabel, caption }) => {
      if (!circleId) throw new Error("Pick a circle to share this with.");
      if (!mood) throw new Error("Pick a mood first.");

      const { data, error } = await supabase
        .from("posts")
        .insert({
          author_id: user.id,
          circle_id: circleId,
          mood,
          mood_label: moodLabel,
          caption: caption?.trim() ? caption.trim() : null,
        })
        .select(
          `
          *,
          author:profiles!posts_author_id_fkey ( id, display_name, username, avatar_url ),
          reactions ( reaction, user_id )
        `,
        )
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Feed, Profile's "my posts" tab, and Circles' mood breakdown all
      // derive from these two query keys — refetch both so the new post
      // shows up everywhere immediately.
      queryClient.invalidateQueries(["feed", user?.id]);
      queryClient.invalidateQueries(["circles", user?.id]);
      queryClient.invalidateQueries(["profile", user?.id]);
    },
  });
}
