import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 min — profile rarely changes
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, username, display_name, bio, avatar_url, streak_count, created_at",
        )
        .eq("id", user.id)
        .single();

      if (error) throw error;

      return {
        ...data,
        handle: `@${data.username}`,
        initial: data.display_name?.charAt(0).toUpperCase() ?? "?",
        joinedDate: new Date(data.created_at).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      };
    },
  });
}
