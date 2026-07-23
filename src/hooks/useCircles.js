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
  // Uses crypto.getRandomValues rather than Math.random — Math.random
  // isn't a CSPRNG, and this code gates access to a private circle, so
  // it's worth the slightly stronger guarantee.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
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

      // Retry a couple times on the (rare) chance two circles land on the
      // same invite code. If invite_code has a unique constraint in the DB,
      // a collision surfaces as Postgres error 23505 rather than silently
      // succeeding with a duplicate code — retry with a fresh code instead
      // of failing the whole creation for something the user can't control.
      let circle, circleError;
      for (let attempt = 0; attempt < 3; attempt++) {
        const result = await supabase
          .from("circles")
          .insert({
            name: trimmedName,
            description: description?.trim() || null,
            cover_color: coverColor || "⭕",
            invite_code: generateInviteCode(),
            owner_id: user.id,
          })
          .select()
          .single();

        circle = result.data;
        circleError = result.error;

        if (!circleError || circleError.code !== "23505") break;
      }

      if (circleError) throw circleError;

      const { error: memberError } = await supabase
        .from("circle_members")
        .insert({
          circle_id: circle.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) {
        // Roll back the orphaned circle so we don't leave a memberless
        // circle behind if adding the creator as a member fails. Note:
        // if this delete itself fails (e.g. RLS blocks delete before any
        // member row exists), the circle can still end up orphaned — the
        // more robust fix is wrapping both inserts in a single Postgres
        // transaction via an RPC function rather than two client calls.
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
