import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import ComposeSheet from './ComposeSheet';
export default function AppFrame({ title, active = 'home', children, circleId, aside }) {
  const [composing, setComposing] = useState(false);
  return <div className={`miwi-app${aside ? ' miwi-app-with-aside' : ''}`}><Navbar active={active} setActive={() => {}} onCompose={() => setComposing(true)} />
    <main className="miwi-main"><header className="miwi-header"><Link to="/feed" className="miwi-wordmark">miwi</Link><span>Your circle, your vibes.</span></header>
      <div className="miwi-page"><h1>{title}</h1>{children}</div>
      <footer className="miwi-footer"><Link to="/circles">Circles</Link><Link to="/messages">Messages</Link><Link to="/memories">Memories</Link><Link to="/settings">Settings</Link></footer>
    </main>{aside && <aside className="miwi-desktop-messages" aria-label="Your conversations">{aside}</aside>}{composing && <ComposeSheet initialCircleId={circleId} onClose={() => setComposing(false)} />}</div>;
}
