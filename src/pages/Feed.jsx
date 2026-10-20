import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import AppFrame from '../components/AppFrame';
import PostItem from '../components/PostItem';
import ComposeSheet from '../components/ComposeSheet';
import MessagesPanel from '../components/MessagesPanel';
import { useCircles } from '../hooks/useCircles';
import { usePagedFeed } from '../hooks/useFeed';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
export default function Feed() {
  const { user } = useAuth(), circles = useCircles();
  const [selected, setSelected] = useState(''), [compose, setCompose] = useState(false);
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1280px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1280px)');
    const changed = event => setWide(event.matches);
    media.addEventListener('change', changed);
    return () => media.removeEventListener('change', changed);
  }, []);
  const circleId = circles.data?.some(c => c.id === selected) ? selected : circles.data?.[0]?.id;
  const feed = usePagedFeed(circleId);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const stories = useQuery({ queryKey: ['stories', user.id, circleId, timezone], enabled: !!circleId, refetchInterval: 30000, queryFn: () => api(`/circles/${circleId}/stories?timezone=${encodeURIComponent(timezone)}`) });
  return <AppFrame title="A soft space for your people." circleId={circleId} aside={wide ? <MessagesPanel /> : null}>
    <div className="miwi-row"><label className="miwi-grow">Your circle<select value={circleId || ''} onChange={e => setSelected(e.target.value)}>{circles.data?.map(c => <option key={c.id} value={c.id}>{c.cover_color} {c.name}</option>)}</select></label><Link to="/circles">Manage circles</Link></div>
    {circles.isPending ? <p role="status">Finding your circles…</p> : circles.error ? <p role="alert">{circles.error.message}</p> : !circleId ? <div className="miwi-empty"><span>🌿</span><h2>Your circle starts here.</h2><p>Create a circle or join with an invitation from a friend.</p><Link to="/circles" className="miwi-button">Find your people</Link></div> : <>
      <div className="miwi-stories" aria-label="Today in your circle">{stories.data?.map(s => s.post_id ? <Link key={s.author.id} to={`/posts/${s.post_id}`} className="miwi-story active"><span>{s.author.avatar_emoji || s.author.display_name[0]}</span>{s.author.display_name}</Link> : <div key={s.author.id} className="miwi-story"><span>{s.author.avatar_emoji || s.author.display_name[0]}</span>{s.author.display_name}</div>)}</div>
      <button className="miwi-compose-prompt" onClick={() => setCompose(true)}>🌿 How are you feeling today?</button>
      {feed.isPending && <p role="status">Settling in…</p>}{feed.error && <p role="alert">{feed.error.message} <button onClick={() => feed.refetch()}>Try again</button></p>}
      {!feed.isPending && !feed.error && !feed.data?.pages[0]?.posts.length && <div className="miwi-empty"><h2>It’s quiet here.</h2><p>Share a little of your day when you feel like it.</p></div>}
      <div className="miwi-feed">{feed.data?.pages.flatMap(p => p.posts).map(post => <PostItem key={post.id} post={post} />)}</div>
      {feed.hasNextPage && <button disabled={feed.isFetchingNextPage} onClick={() => feed.fetchNextPage()}>{feed.isFetchingNextPage ? 'Loading…' : 'Earlier check-ins'}</button>}
    </>}
    {compose && <ComposeSheet initialCircleId={circleId} onClose={() => setCompose(false)} />}
  </AppFrame>;
}
