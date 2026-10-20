import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
export function useProfile() {
  const { user } = useAuth();
  return useQuery({ queryKey: ['profile', user?.id], enabled: !!user, queryFn: async () => {
    const p = await api('/profile');
    return { ...p, handle: `@${p.username}`, initial: p.display_name?.[0]?.toUpperCase() || '?', joinedDate: new Date(p.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) };
  } });
}