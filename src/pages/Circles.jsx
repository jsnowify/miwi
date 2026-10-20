import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AppFrame from '../components/AppFrame';
import { useCircles, useCreateCircle } from '../hooks/useCircles';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
function CircleSettings({ circle }) {
  const { user } = useAuth(), cache = useQueryClient();
  const circles = useCircles();
  const [invitation, setInvitation] = useState(null), [message, setMessage] = useState(''), [inviteRecipient, setInviteRecipient] = useState('');
  const contacts = [...new Map((circles.data || []).flatMap(c => c.circle_members).filter(m => m.user_id !== user.id && !circle.circle_members.some(current => current.user_id === m.user_id)).map(m => [m.user_id, m])).values()];
  const mine = circle.circle_members.find(m => m.user_id === user.id);
  const admin = ['owner','admin'].includes(mine?.role);
  const close = useQuery({ queryKey: ['closeFriends', user.id, circle.id], queryFn: () => api(`/circles/${circle.id}/close-friends`) });
  const invites = useQuery({ queryKey: ['invitations', user.id, circle.id], enabled: admin, queryFn: () => api(`/circles/${circle.id}/invitations`) });
  const action = useMutation({ mutationFn: ({ path, method = 'POST', body = {} }) => api(path, { method, body }),
    onSuccess: () => { for (const key of ['circles','invitations','closeFriends','feed','stories','notifications','profile','memories','post']) cache.invalidateQueries({ queryKey: [key] }); },
  });
  function run(path, method, body, onSuccess) { setMessage(''); action.mutate({ path, method, body }, { onSuccess }); }
  function save(e) { e.preventDefault(); const f = new FormData(e.currentTarget); run(`/circles/${circle.id}`, 'PATCH', { name: f.get('name'), description: f.get('description'), coverColor: f.get('coverColor') }, () => setMessage('Circle updated.')); }
  return <section className="miwi-panel"><h2>{circle.cover_color} {circle.name}</h2><p>{circle.description || 'A small space for your people.'}</p>
    {admin && <details><summary>Circle settings</summary><form onSubmit={save} className="miwi-form"><label>Name<input name="name" defaultValue={circle.name} required maxLength={40} /></label><label>Description<textarea name="description" defaultValue={circle.description} maxLength={300} /></label><label>Circle emoji<input name="coverColor" defaultValue={circle.cover_color} required maxLength={20} /></label><button disabled={action.isPending}>Save circle</button></form></details>}
    <h3>Your people</h3>{circle.circle_members.map(m => <div className="miwi-member" key={m.user_id}><span>{m.profiles.avatar_emoji || '🌿'} {m.profiles.display_name} <small>{m.role}</small></span>
      {m.user_id !== user.id && <div className="miwi-row">{mine?.role === 'owner' && <select aria-label={`Role for ${m.profiles.display_name}`} value={m.role} disabled={action.isPending} onChange={e => { if (e.target.value !== 'owner' || window.confirm('Transfer ownership to this member?')) run(`/circles/${circle.id}/members/${m.user_id}`, 'PATCH', { role: e.target.value }); }}><option value="member">Member</option><option value="admin">Admin</option><option value="owner">Transfer ownership</option></select>}
      {(mine?.role === 'owner' || (mine?.role === 'admin' && m.role === 'member')) && <button className="miwi-secondary" disabled={action.isPending} onClick={() => { if (window.confirm('Remove this member? Their access will end immediately.')) run(`/circles/${circle.id}/members/${m.user_id}`, 'DELETE'); }}>Remove</button>}</div>}</div>)}
    <h3>Your close friends</h3><p className="miwi-muted">Changes apply to future posts. Existing posts keep their original recipients.</p>
    {close.error && <p role="alert">{close.error.message}</p>}
    {circle.circle_members.filter(m => m.user_id !== user.id).map(m => <label className="miwi-check" key={m.user_id}><input type="checkbox" disabled={action.isPending || !close.data} checked={close.data?.memberIds.includes(m.user_id) || false} onChange={e => run(`/circles/${circle.id}/close-friends`, 'PUT', { memberIds: e.target.checked ? [...close.data.memberIds, m.user_id] : close.data.memberIds.filter(id => id !== m.user_id) })} />{m.profiles.display_name}</label>)}
    {admin && <><h3>Invitations</h3><p>Private, single-use invitations expire in seven days.</p>
      {!!contacts.length && <label>Invite a friend<select value={inviteRecipient} onChange={e => setInviteRecipient(e.target.value)}><option value="">Anyone with this link</option>{contacts.map(m => <option key={m.user_id} value={m.user_id}>{m.profiles.display_name}</option>)}</select></label>}
      <button disabled={action.isPending} onClick={() => run(`/circles/${circle.id}/invitations`, 'POST', inviteRecipient ? { recipientId: inviteRecipient } : {}, value => setInvitation(value))}>Create invitation</button>
      {invitation && <div className="miwi-invite"><label>Invitation link<input readOnly value={`${window.location.origin}/circles?invite=${invitation.token}`} /></label><button className="miwi-secondary" onClick={async () => { try { await navigator.clipboard.writeText(`${window.location.origin}/circles?invite=${invitation.token}`); setMessage('Invitation copied.'); } catch { setMessage('Select and copy the invitation link above.'); } }}>Copy link</button></div>}
      {invites.error && <p role="alert">{invites.error.message}</p>}
      {invites.data?.filter(i => !i.revoked && !i.used_by && new Date(i.expires_at) > new Date()).map(i => <div className="miwi-member" key={i.id}><span>Expires {new Date(i.expires_at).toLocaleDateString()}</span><button disabled={action.isPending} className="miwi-secondary" onClick={() => run(`/circles/${circle.id}/invitations/${i.id}`, 'DELETE')}>Revoke</button></div>)}
    </>}
    {mine?.role !== 'owner' && <button disabled={action.isPending} className="miwi-secondary" onClick={() => { if (window.confirm('Leave this circle? You will need a new invitation to return.')) run(`/circles/${circle.id}/members/${user.id}`, 'DELETE'); }}>Leave circle</button>}
    <p role="status">{message}</p><p role="alert">{action.error?.message}</p>
  </section>;
}
export default function Circles() {
  const circles = useCircles(), create = useCreateCircle(), cache = useQueryClient(), [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState(params.get('circle') || ''), [token, setToken] = useState(params.get('invite') || ''), [showCreate, setShowCreate] = useState(false);
  const circle = circles.data?.find(c => c.id === selected) || circles.data?.[0];
  const join = useMutation({ mutationFn: () => { let code = token.trim(); try { code = new URL(code).searchParams.get('invite') || code; } catch { /* raw token */ } return api('/invitations/accept', { method: 'POST', body: { token: code } }); },
    onSuccess: value => { setSelected(value.circle_id); setToken(''); setParams({}); cache.invalidateQueries(); } });
  function createCircle(e) { e.preventDefault(); const f = new FormData(e.currentTarget); create.mutate({ name: f.get('name'), description: f.get('description'), coverColor: f.get('coverColor') }, { onSuccess: c => { setSelected(c.id); setShowCreate(false); } }); }
  return <AppFrame title="Your circles" active="circles"><p>Small circles. Room for all your feelings.</p>
    <form className="miwi-form miwi-panel" onSubmit={e => { e.preventDefault(); join.mutate(); }}><label>Join with an invitation<input value={token} onChange={e => setToken(e.target.value)} placeholder="Paste a code or invitation link" required /></label><button disabled={join.isPending}>{join.isPending ? 'Joining…' : 'Join circle'}</button><p role="alert">{join.error?.message}</p></form>
    <button onClick={() => setShowCreate(!showCreate)} className="miwi-secondary">{showCreate ? 'Cancel' : 'Create a circle'}</button>
    {showCreate && <form className="miwi-form miwi-panel" onSubmit={createCircle}><label>Circle name<input name="name" required maxLength={40} /></label><label>Description<textarea name="description" maxLength={300} /></label><label>Circle emoji<input name="coverColor" defaultValue="🌿" maxLength={20} /></label><button disabled={create.isPending}>Create circle</button><p role="alert">{create.error?.message}</p></form>}
    {circles.isPending && <p role="status">Loading circles…</p>}{circles.error && <p role="alert">{circles.error.message}</p>}
    {!!circles.data?.length && <label>Choose a circle<select value={circle?.id || ''} onChange={e => setSelected(e.target.value)}>{circles.data.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>}
    {circle ? <CircleSettings key={circle.id} circle={circle} /> : !circles.isPending && <div className="miwi-empty"><h2>Make room for your people.</h2><p>Create a circle, or ask a friend for an invitation. Circles are always private.</p></div>}<Link to="/feed">Back to your feed</Link>
  </AppFrame>;
}
