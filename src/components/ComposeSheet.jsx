import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sheet from './Sheet';
import SongPicker from './SongPicker';
import AudioPlayer from './AudioPlayer';
import { useCircles } from '../hooks/useCircles';
import { useCreatePost } from '../hooks/useFeed';
import { useAuth } from '../context/AuthContext';
import { MOODS } from '../../shared/moods';
export default function ComposeSheet({ onClose, initialCircleId }) {
  const { user } = useAuth();
  const { data: circles = [], isPending, error } = useCircles();
  const [selected, setSelected] = useState(initialCircleId || ''), [mood, setMood] = useState(''), [caption, setCaption] = useState(''), [scope, setScope] = useState('circle'), [recipient, setRecipient] = useState(''), [mediaFile, setMediaFile] = useState(null);
  const mutation = useCreatePost();
  const [selectedSong, setSelectedSong] = useState(null);
  const circleId = selected || circles[0]?.id || '';
  const circle = circles.find(c => c.id === circleId);
  function submit(e) { e.preventDefault(); mutation.mutate({ circleId, moodLabel: mood, caption, scope, ...(scope === 'one_person' ? { recipientId: recipient } : {}), mediaFile, selectedSong }, { onSuccess: onClose }); }
  return <Sheet title="How are you feeling?" description="A small check-in, shared your way." onClose={onClose}>
    {isPending ? <p>Loading your circles…</p> : error ? <p role="alert">{error.message}</p> : !circles.length ? <p><Link to="/circles" onClick={onClose}>Create or join a circle</Link> to share a mood.</p> :
    <form className="miwi-form" onSubmit={submit}><label>Circle<select value={circleId} onChange={e => { setSelected(e.target.value); setRecipient(''); }}>{circles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <fieldset><legend>Your mood</legend><div className="miwi-moods">{Object.entries(MOODS).map(([label,emoji]) => <button type="button" key={label} aria-pressed={mood === label} onClick={() => setMood(label)}>{emoji} {label}</button>)}</div></fieldset>
      <label>A few words, if you like<textarea value={caption} onChange={e => setCaption(e.target.value)} maxLength={560} rows={3} /></label><small>{Array.from(caption).length}/280</small>
      <label>Share with<select value={scope} onChange={e => setScope(e.target.value)}><option value="circle">Whole circle</option><option value="close_friends">Close friends</option><option value="one_person">Just one person</option></select></label>
      {scope === 'close_friends' && <small>Uses your close-friends list at publication. Manage it in <Link to="/circles" onClick={onClose}>circle settings</Link>.</small>}
      {scope === 'one_person' && <label>Recipient<select required value={recipient} onChange={e => setRecipient(e.target.value)}><option value="">Choose a person</option>{circle?.circle_members.filter(m => m.user_id !== user.id).map(m => <option key={m.user_id} value={m.user_id}>{m.profiles.display_name}</option>)}</select></label>}
      <label>Optional photo<input type="file" disabled={!!selectedSong} accept="image/png,image/jpeg,image/webp" onChange={e => setMediaFile(e.target.files?.[0] || null)} /></label><small>PNG, JPEG or WebP, up to 2 MB. Only your audience can open it.</small>
      <SongPicker disabled={!!mediaFile} onSelect={setSelectedSong} />
      {selectedSong && <div><p>{selectedSong.title} — {selectedSong.artist}</p><AudioPlayer key={selectedSong.track_id} src={selectedSong.preview_url} /><button type="button" className="miwi-secondary" onClick={() => setSelectedSong(null)}>Remove song</button></div>}
      <p role="alert">{mutation.error?.message}</p><button disabled={!mood || mutation.isPending || Array.from(caption).length > 280}>{mutation.isPending ? 'Sharing…' : 'Share your vibe'}</button>
    </form>}
  </Sheet>;
}
