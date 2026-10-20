import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authClient } from '../lib/auth';
import { api } from '../lib/api';
export default function Signup() {
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const form = new FormData(event.currentTarget);
    try {
      const result = await authClient.signUp.email({ name: form.get('name'), email: form.get('email'), password: form.get('password') });
      if (result.error) throw new Error(result.error.message);
      await api('/preferences', { method: 'PUT', body: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, reactions: true, circle_activity: true } });
      navigate('/circles');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <main className="miwi-auth"><Link to="/" className="miwi-wordmark">miwi</Link><h1>A little closer to your people.</h1><p>Create an account, then start or join your private circle.</p>
    <form onSubmit={submit} className="miwi-form"><label>Display name<input name="name" required maxLength={60} autoComplete="name" /></label><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Password<input name="password" type="password" minLength={12} maxLength={128} required autoComplete="new-password" /></label><small>Use at least 12 characters.</small><p role="alert">{error}</p><button disabled={busy}>{busy ? 'Creating your account…' : 'Create account'}</button></form>
    <p>By creating an account you agree to our <Link to="/terms">terms</Link> and <Link to="/privacy">privacy policy</Link>.</p><Link to="/login">Already here? Log in</Link></main>;
}