import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import AppFrame from '../components/AppFrame';
export default function Memories() {
  const { user } = useAuth();
  const memories = useQuery({ queryKey: ['memories', user.id], queryFn: () => api('/memories') });
  return <AppFrame title="Miwi memories"><p>A gentle look back at the days you shared.</p>
    {memories.isPending && <p role="status">Looking back…</p>}{memories.error && <p role="alert">{memories.error.message}</p>}
    {!memories.isPending && !memories.error && !memories.data?.length && <div className="miwi-empty"><span>🌙</span><h2>Your days are still unfolding.</h2><p>Your first reflection appears after a month with check-ins has ended.</p></div>}
    {memories.data?.map(m => <article className="miwi-panel miwi-memory" key={m.month}><h2>{new Date(`${m.month}-15T12:00:00Z`).toLocaleDateString(undefined, { month: 'long', year: 'numeric', timeZone: 'UTC' })}</h2><span className="miwi-memory-emoji">{m.emoji}</span><p>You shared <strong>{m.mood}</strong> most often.</p><p>{m.days} {m.days === 1 ? 'day' : 'days'} with a check-in.</p>{m.highlight && <blockquote>“{m.highlight}”</blockquote>}<p>{m.warm_message}</p><details><summary>The moods you shared</summary>{Object.entries(m.mood_breakdown).map(([mood,count]) => <p key={mood}>{mood}: {count}</p>)}</details></article>)}
  </AppFrame>;
}