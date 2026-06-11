import { useQuery } from "@tanstack/react-query";
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
