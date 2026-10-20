import { createContext, useContext, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authClient } from '../lib/auth';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const { data, isPending, error, refetch } = authClient.useSession();
  const queryClient = useQueryClient();
  const userId = data?.user?.id || null;
  const previous = useRef(userId);
  const retryable = !!error && (!error.status || error.status === 429 || error.status >= 500);
  useEffect(() => {
    if (!retryable) return;
    const reconnect = () => {
      if (navigator.onLine && document.visibilityState === 'visible') refetch();
    };
    const interval = window.setInterval(reconnect, 5000);
    window.addEventListener('online', reconnect);
    document.addEventListener('visibilitychange', reconnect);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('online', reconnect);
      document.removeEventListener('visibilitychange', reconnect);
    };
  }, [retryable, refetch]);
  useEffect(() => {
    const oldUserId = previous.current;
    if (oldUserId && oldUserId !== userId) {
      queryClient.removeQueries({ predicate: query => query.queryKey.includes(oldUserId) });
    }
    previous.current = userId;
  }, [userId, queryClient]);
  async function signOut() {
    const result = await authClient.signOut();
    if (result.error) throw new Error(result.error.message);
    queryClient.clear();
  }
  if (error) return <main className="miwi-auth"><h1>Miwi is taking a moment</h1><p role="alert">{retryable ? 'We couldn’t reach Miwi. We’ll reconnect automatically when it’s available.' : 'We couldn’t check your session. Please try again.'}</p><button onClick={() => refetch()}>Try again</button></main>;
  return <AuthContext.Provider value={{ user: data?.user || null, loading: isPending, signOut }}>{children}</AuthContext.Provider>;
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() { return useContext(AuthContext); }
