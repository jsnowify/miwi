import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
export function useCircles() {
  const { user } = useAuth();
  return useQuery({ queryKey: ['circles', user?.id], enabled: !!user, refetchInterval: 30000, queryFn: () => api('/circles') });
}
export function useCreateCircle() {
  const cache = useQueryClient();
  return useMutation({ mutationFn: body => api('/circles', { method: 'POST', body }), onSuccess: () => cache.invalidateQueries({ queryKey: ['circles'] }) });
}