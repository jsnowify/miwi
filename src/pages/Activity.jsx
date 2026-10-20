import { Link } from 'react-router-dom';
import AppFrame from '../components/AppFrame';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../hooks/useNotifications';
export default function Activity() {
  const notifications = useNotifications(), read = useMarkNotificationRead(), all = useMarkAllNotificationsRead();
  return <AppFrame title="Vibes" active="activity"><p>Small signs that someone is thinking of you.</p>
    <button className="miwi-secondary" disabled={all.isPending || !notifications.data?.some(n => !n.is_read)} onClick={() => all.mutate()}>Mark all as read</button>
    <p role="alert">{read.error?.message || all.error?.message || notifications.error?.message}</p>{notifications.isPending && <p role="status">Loading your vibes…</p>}
    {!notifications.isPending && !notifications.error && !notifications.data?.length && <div className="miwi-empty"><span>🌸</span><h2>All quiet for now.</h2><p>Reactions and circle invitations will find you here.</p></div>}
    {notifications.data?.map(n => <article className={`miwi-notification ${n.is_read ? '' : 'unread'}`} key={n.id}><p>{n.type === 'reaction_received' ? `${n.reaction} ${n.actor?.display_name} sent “${n.reaction_label}”` : n.type === 'member_joined' ? `${n.actor?.display_name} joined ${n.circle_name}` : n.type === 'circle_invitation' ? 'You have a circle invitation. Ask your friend for the invitation link.' : 'A little circle update.'}</p>
      {n.post_caption && <p className="miwi-muted">{n.post_mood} {n.post_caption}</p>}<time dateTime={n.created_at}>{new Date(n.created_at).toLocaleString()}</time>
      <div className="miwi-row">{n.post_id && <Link to={`/posts/${n.post_id}`}>View mood</Link>}{n.type === 'circle_invitation' && <Link to="/circles">Join a circle</Link>}{!n.is_read && <button className="miwi-secondary" disabled={read.isPending} onClick={() => read.mutate(n.id)}>Mark read</button>}</div>
    </article>)}
  </AppFrame>;
}