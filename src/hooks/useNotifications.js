import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
export function useNotifications() {
  const { user } = useAuth();
  return useQuery({ queryKey: ['notifications', user?.id], enabled: !!user, refetchInterval: 30000, queryFn: () => api('/notifications') });
}
function useRead(all) {
  const cache = useQueryClient();
  return useMutation({ mutationFn: id => api('/notifications/read', { method: 'PATCH', body: all ? {} : { id } }), onSuccess: () => cache.invalidateQueries({ queryKey: ['notifications'] }) });
}
export function useMarkNotificationRead() { return useRead(false); }
export function useMarkAllNotificationsRead() { return useRead(true); }
