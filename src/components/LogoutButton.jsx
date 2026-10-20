import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
export default function LogoutButton() {
  const { signOut } = useAuth(), [error, setError] = useState('');
  return <><button onClick={() => signOut().catch(e => setError(e.message))}>Log out</button><p role="alert">{error}</p></>;
}