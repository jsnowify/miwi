import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api, uploadImage } from '../lib/api';
export function useFeed(circleId) {
  const { user } = useAuth();
  return useQuery({ queryKey: ['feed', user?.id, circleId], enabled: !!user,
    queryFn: async () => (await api(`/posts${circleId ? `?circleId=${circleId}` : '?author=me'}`)).posts });
}
export function usePagedFeed(circleId, own = false) {
  const { user } = useAuth();
  return useInfiniteQuery({ queryKey: ['feed', user?.id, circleId, own], enabled: !!user && (!!circleId || own), initialPageParam: '', refetchInterval: 30000,
    queryFn: ({ pageParam }) => api(`/posts?${new URLSearchParams({ ...(own ? { author: 'me' } : { circleId }), ...(pageParam ? { cursor: pageParam } : {}) })}`),
    getNextPageParam: page => page.nextCursor || undefined });
}
export function useCreatePost() {
  const cache = useQueryClient();
  return useMutation({ mutationFn: async ({ mediaFile, mood, ...body }) => {
    void mood;
    if (mediaFile) body.mediaId = (await uploadImage(mediaFile)).id;
    return api('/posts', { method: 'POST', body });
  }, onSuccess: () => { for (const key of ['feed', 'profile', 'stories', 'memories']) cache.invalidateQueries({ queryKey: [key] }); } });
}