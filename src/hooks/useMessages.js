import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
export function conversationContact(conversation) {
  const other = conversation.other;
  return { ...conversation, name: other?.display_name || conversation.circle_name,
    avatar: other?.avatar_emoji || conversation.circle_emoji || '🌿', avatarColor: '#7A9E8A',
    rounded: conversation.kind === 'circle', preview: conversation.last_message?.text || 'Start a conversation',
    time: conversation.last_message ? new Date(conversation.last_message.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '',
  };
}
export function useConversations() {
  const { user } = useAuth();
  return useQuery({ queryKey: ['conversations', user?.id], enabled: !!user, refetchInterval: 10000, queryFn: async () => (await api('/conversations')).map(conversationContact) });
}
export function useStartConversation() {
  const cache = useQueryClient();
  return useMutation({ mutationFn: async body => conversationContact(await api('/conversations', { method: 'POST', body })),
    onSuccess: () => cache.invalidateQueries({ queryKey: ['conversations'] }),
  });
}
export function useChatMessages(conversationId) {
  const { user } = useAuth();
  return useInfiniteQuery({ queryKey: ['chatMessages', user?.id, conversationId], enabled: !!user && !!conversationId,
    initialPageParam: null, refetchInterval: 5000, retry: false,
    queryFn: ({ pageParam }) => api(`/conversations/${conversationId}/messages${pageParam ? `?before=${pageParam}` : ''}`),
    getNextPageParam: page => page.nextBefore || undefined,
  });
}
export function useSendChatMessage(conversationId) {
  const { user } = useAuth(), cache = useQueryClient();
  return useMutation({ mutationFn: body => api(`/conversations/${conversationId}/messages`, { method: 'POST', body }),
    onSuccess: message => {
      cache.setQueryData(['chatMessages', user.id, conversationId], current => current && ({ ...current,
        pages: current.pages.map((page, index) => index === 0 ? { ...page, messages: [message, ...page.messages.filter(m => m.id !== message.id)].sort((a,b) => b.sequence - a.sequence) } : page),
      }));
      cache.invalidateQueries({ queryKey: ['chatMessages', user.id, conversationId] });
      cache.invalidateQueries({ queryKey: ['conversations', user.id] });
    },
  });
}
export function useMarkChatRead(conversationId) {
  const cache = useQueryClient();
  return useMutation({ mutationFn: messageId => api(`/conversations/${conversationId}/read`, { method: 'PUT', body: { messageId } }),
    onSuccess: () => cache.invalidateQueries({ queryKey: ['conversations'] }),
  });
}
