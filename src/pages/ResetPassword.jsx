import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authClient } from '../lib/auth';
export default function ResetPassword() {
  const [params] = useSearchParams(), [message, setMessage] = useState(''), [busy, setBusy] = useState(false), [done, setDone] = useState(false);
  const token = params.get('token');
  async function submit(e) { e.preventDefault(); setBusy(true); try {
    const result = await authClient.resetPassword({ token, newPassword: new FormData(e.currentTarget).get('password') });
    if (result.error) throw new Error(result.error.message); setDone(true);
  } catch (error) { setMessage(error.message); } finally { setBusy(false); } }
  return <main className="miwi-auth"><h1>A fresh start</h1>{done ? <p>Your password has been reset. <Link to="/login">Log in</Link></p> : token ? <form onSubmit={submit} className="miwi-form"><label>New password<input type="password" name="password" required minLength={12} maxLength={128} autoComplete="new-password" /></label><button disabled={busy}>Reset password</button><p role="alert">{message}</p></form> : <p>This reset link is missing or invalid. Request another from the <Link to="/login">login page</Link>.</p>}</main>;
}