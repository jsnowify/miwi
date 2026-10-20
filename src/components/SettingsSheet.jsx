import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sheet from './Sheet';
import { useAuth } from '../context/AuthContext';
export default function SettingsSheet({ onClose }) {
  const { signOut } = useAuth(), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  return <Sheet title="Make yourself at home" description="Your account, your preferences." onClose={onClose}><div className="miwi-form">
    <Link to="/profile" onClick={onClose}>Your profile</Link><Link to="/settings" onClick={onClose}>Account and notification settings</Link><Link to="/memories" onClick={onClose}>Miwi memories</Link><Link to="/privacy" onClick={onClose}>Privacy</Link><Link to="/miwi" onClick={onClose}>About Miwi</Link>
    <button disabled={busy} onClick={async () => { setBusy(true); try { await signOut(); onClose(); } catch (e) { setError(e.message); } finally { setBusy(false); } }}>Log out</button><p role="alert">{error}</p>
  </div></Sheet>;
}