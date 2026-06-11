import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useCircles() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["circles", user?.id],
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 min
    queryFn: async () => {
      const { data, error } = await supabase
        .from("circle_members")
        .select(
          `
          circle_id,
          circles (
            id, name, description, cover_color, invite_code,
            circle_members ( user_id, profiles ( id, display_name, username, avatar_url ) )
          )
        `,
        )
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map((row) => row.circles);
    },
  });
}
