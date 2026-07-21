import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
            id, name, description, cover_color, invite_code, owner_id,
            circle_members ( user_id, role, profiles ( id, display_name, username, avatar_url ) )
          )
        `,
        )
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map((row) => row.circles);
    },
  });
}

function generateInviteCode() {
  // 6-char, human-friendly (no ambiguous 0/O/1/I) invite code.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Creates a new circle and adds the creator as its first member (and owner),
// then refetches the circles list everywhere it's used.
export function useCreateCircle() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description, coverColor }) => {
      if (!user) throw new Error("Not authenticated");

      const trimmedName = name?.trim();
      if (!trimmedName) throw new Error("Give your circle a name.");
      if (trimmedName.length > 40) {
        throw new Error("Circle name is too long (max 40 characters).");
      }

      // 1. Fixed Schema mapping: use owner_id instead of created_by
      const { data: circle, error: circleError } = await supabase
        .from("circles")
        .insert({
          name: trimmedName,
          description: description?.trim() || null,
          cover_color: coverColor || "⭕",
          invite_code: generateInviteCode(),
          owner_id: user.id, // SCHEMA FIX HERE
        })
        .select()
        .single();

      if (circleError) throw circleError;

      // 2. Add the user as an owner to circle_members
      const { error: memberError } = await supabase
        .from("circle_members")
        .insert({
          circle_id: circle.id,
          user_id: user.id,
          role: "owner", // Assign owner role based on schema
        });

      if (memberError) {
        // Roll back the orphaned circle so we don't leave a memberless
        // circle behind if adding the creator as a member fails.
        await supabase.from("circles").delete().eq("id", circle.id);
        throw memberError;
      }

      return circle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["circles", user?.id]);
    },
  });
}
