import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export function useNotifications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
          *,
          actor:profiles!notifications_actor_id_fkey ( display_name, username ),
          post:posts ( mood, caption )
        `,
        )
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });
}

export function useMarkNotificationRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);
      if (error) throw error;
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries(["notifications", user?.id]);
      const previous = queryClient.getQueryData(["notifications", user?.id]);
      queryClient.setQueryData(["notifications", user?.id], (old) =>
        old?.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n,
        ),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(["notifications", user?.id], context.previous);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("recipient_id", user.id)
        .eq("is_read", false);
      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries(["notifications", user?.id]);
      const previous = queryClient.getQueryData(["notifications", user?.id]);
      queryClient.setQueryData(["notifications", user?.id], (old) =>
        old?.map((n) => ({ ...n, is_read: true })),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(["notifications", user?.id], context.previous);
    },
  });
}
