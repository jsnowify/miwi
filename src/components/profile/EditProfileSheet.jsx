import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Sheet from '../Sheet';
import { api } from '../../lib/api';
export default function EditProfileSheet({ profile, onClose }) {
  const [emoji, setEmoji] = useState(profile.avatar_emoji || '🌿'), cache = useQueryClient();
  const save = useMutation({ mutationFn: body => api('/profile', { method: 'PATCH', body }), onSuccess: () => { cache.invalidateQueries(); onClose(); } });
  return <Sheet title="A little about you" description="Your profile is shared with your circle members." onClose={onClose}><form className="miwi-form" onSubmit={e => { e.preventDefault(); const f = new FormData(e.currentTarget); save.mutate({ display_name: f.get('display_name'), username: f.get('username'), bio: f.get('bio'), avatar_emoji: emoji }); }}>
    <fieldset><legend>Choose your avatar</legend><div className="miwi-moods">{['🌿','🌸','🌙','🍃','✨','🦋','☁️','🌻'].map(value => <button type="button" aria-label={`Avatar ${value}`} key={value} aria-pressed={emoji === value} onClick={() => setEmoji(value)}>{value}</button>)}</div></fieldset>
    <label>Display name<input name="display_name" defaultValue={profile.display_name} required maxLength={60} /></label><label>Username<input name="username" pattern="[a-z0-9_]{3,30}" defaultValue={profile.username} required /></label><label>Bio<textarea name="bio" defaultValue={profile.bio} maxLength={180} /></label><button disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save profile'}</button><p role="alert">{save.error?.message}</p>
  </form></Sheet>;
}