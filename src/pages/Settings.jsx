import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AppFrame from '../components/AppFrame';
import { api } from '../lib/api';
import { authClient, requestReset } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
function PreferenceForm({ settings }) {
  const [timezone, setTimezone] = useState(settings.timezone), [reactions, setReactions] = useState(settings.reactions), [activity, setActivity] = useState(settings.circle_activity), cache = useQueryClient();
  const save = useMutation({ mutationFn: () => api('/preferences', { method: 'PUT', body: { timezone, reactions, circle_activity: activity } }), onSuccess: () => cache.invalidateQueries() });
  return <form className="miwi-form miwi-panel" onSubmit={e => { e.preventDefault(); save.mutate(); }}><h2>Your preferences</h2><label>Timezone<select value={timezone} onChange={e => setTimezone(e.target.value)}>{[...new Set([settings.timezone, Intl.DateTimeFormat().resolvedOptions().timeZone, 'UTC', ...Intl.supportedValuesOf('timeZone')])].map(tz => <option key={tz}>{tz}</option>)}</select></label><small>Your private rhythm and monthly memories use this timezone. Story rings follow your device’s local date.</small>
    <label className="miwi-check"><input type="checkbox" checked={reactions} onChange={e => setReactions(e.target.checked)} />Reaction notifications</label>
    <label className="miwi-check"><input type="checkbox" checked={activity} onChange={e => setActivity(e.target.checked)} />Circle invitations and activity notifications</label>
    <p>Daily reminders are not available yet.</p><button disabled={save.isPending}>Save preferences</button><p role="status">{save.isSuccess && 'Preferences saved.'}</p><p role="alert">{save.error?.message}</p>
  </form>;
}
export default function Settings() {
  const { user, signOut } = useAuth(), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  const settings = useQuery({ queryKey: ['preferences', user.id], queryFn: () => api('/preferences') });
  async function accountAction(fn, success) { setBusy(true); setMessage(''); try { const result = await fn(); if (result?.error) throw new Error(result.error.message); setMessage(success); } catch (e) { setMessage(e.message); } finally { setBusy(false); } }
  return <AppFrame title="Make yourself at home" active="profile">{settings.isPending ? <p>Loading preferences…</p> : settings.error ? <p role="alert">{settings.error.message}</p> : <PreferenceForm settings={settings.data} />}
    <section className="miwi-panel"><h2>Your account</h2><p>{user.email}</p><div className="miwi-form"><Link to="/profile">Edit your profile</Link>
      <button className="miwi-secondary" disabled={busy} onClick={() => accountAction(() => requestReset(user.email), 'If an account exists, a password reset email will arrive shortly.')}>Request password reset</button>
      <button className="miwi-secondary" disabled={busy} onClick={() => accountAction(() => authClient.revokeOtherSessions(), 'Other sessions revoked.')}>Sign out other devices</button>
      <button disabled={busy} onClick={() => accountAction(signOut, '')}>Log out</button><p role="status">{message}</p></div></section><Link to="/privacy">Privacy policy</Link>
  </AppFrame>;
}