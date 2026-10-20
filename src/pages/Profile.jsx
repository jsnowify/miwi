import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppFrame from '../components/AppFrame';
import EditProfileSheet from '../components/profile/EditProfileSheet';
import PostCard from '../components/profile/PostCard';
import { useProfile } from '../hooks/useProfile';
import { usePagedFeed } from '../hooks/useFeed';
import { useCircles } from '../hooks/useCircles';
export default function Profile() {
  const profile = useProfile(), feed = usePagedFeed(undefined, true), circles = useCircles();
  const [edit, setEdit] = useState(false), [tab, setTab] = useState('history');
  const p = profile.data, posts = feed.data?.pages.flatMap(page => page.posts) || [];
  return <AppFrame title="Your little corner" active="profile">{profile.isPending ? <p role="status">Loading your profile…</p> : profile.error ? <p role="alert">{profile.error.message}</p> : p && <>
    <section className="miwi-profile"><span className="miwi-profile-avatar">{p.avatar_emoji}</span><h2>{p.display_name}</h2><p>{p.handle}</p><p>{p.bio || 'A little space to be yourself.'}</p><button className="miwi-secondary" onClick={() => setEdit(true)}>Edit profile</button>
    <p className="miwi-muted">{p.streak_count ? `${p.streak_count} quiet day${p.streak_count === 1 ? '' : 's'} of checking in.` : 'Here whenever you want to check in.'} Only you see this rhythm.</p></section>
    <div className="miwi-tabs">{['history','posts','circles'].map(value => <button className="miwi-secondary" aria-pressed={tab === value} key={value} onClick={() => setTab(value)}>{value === 'history' ? 'Mood history' : value === 'posts' ? 'Your posts' : 'Your circles'}</button>)}</div>
    {feed.error && <p role="alert">{feed.error.message}</p>}{feed.isPending && <p>Loading your check-ins…</p>}
    {tab === 'history' && <div className="miwi-history">{posts.map(post => <Link key={post.id} to={`/posts/${post.id}`} title={post.caption}><span>{post.mood}</span><strong>{post.mood_label}</strong><time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString()}</time></Link>)}</div>}
    {tab === 'posts' && <div className="miwi-feed">{posts.map(post => <PostCard key={post.id} post={post} />)}</div>}
    {tab === 'circles' && <>{circles.error && <p role="alert">{circles.error.message}</p>}{circles.data?.map(c => <p key={c.id}><Link to={`/circles?circle=${c.id}`}>{c.cover_color} {c.name}</Link></p>)}</>}
    {tab !== 'circles' && !feed.isPending && !posts.length && <div className="miwi-empty"><h2>A little room for your days.</h2><p>Your check-ins will appear here.</p></div>}
    {tab !== 'circles' && feed.hasNextPage && <button disabled={feed.isFetchingNextPage} onClick={() => feed.fetchNextPage()}>Earlier check-ins</button>}
    {edit && <EditProfileSheet profile={p} onClose={() => setEdit(false)} />}
  </>}</AppFrame>;
}