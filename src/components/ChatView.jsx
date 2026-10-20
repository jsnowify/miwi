import { useState, useRef, useEffect } from "react";
import { useChatMessages, useSendChatMessage, useMarkChatRead } from '../hooks/useMessages';
import { useAuth } from '../context/AuthContext';
import { useCircles } from '../hooks/useCircles';

export default function ChatView({ contact, onBack, isMobile }) {
  const { user } = useAuth();
  const query = useChatMessages(contact.id), send = useSendChatMessage(contact.id);
  const { mutate: markRead } = useMarkChatRead(contact.id);
  const { data: circles = [] } = useCircles();
  const roster = circles.find(c => c.id === contact.circle_id)?.circle_members || [];
  const records = query.error ? [] : query.data?.pages.flatMap(page => page.messages) || [];
  const messages = [...new Map(records.map(message => [message.id, message])).values()].sort((a,b) => a.sequence - b.sequence).map(message => ({ ...message,
    from: message.author_id === user.id ? 'me' : 'them',
    authorName: message.author_id === user.id ? 'You' : roster.find(m => m.user_id === message.author_id)?.profiles.display_name || 'Former member',
    time: new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
  }));
  const latestId = records[0]?.id;
  const latestSequence = query.data?.pages[0]?.messages[0]?.sequence;
  const pending = useRef(null);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  // The parent keys this component by conversation ID to isolate drafts and mutations.
  useEffect(() => { if (latestId && !query.error) markRead(latestId); }, [latestId, markRead, query.error]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [latestSequence]);

  function handleSend() {
    const text = draft.trim();
    if (!text || send.isPending || query.error || Array.from(text).length > 2000) return;
    if (pending.current?.text !== text) pending.current = { text, clientId: crypto.randomUUID() };
    send.mutate(pending.current, { onSuccess: () => { setDraft(''); pending.current = null; } });
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "#F9F4EF",
        borderLeft: "1px solid #EDE3DA",
        height: isMobile ? "100dvh" : "100vh",
        ...(isMobile && {
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 30,
        }),
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 56,
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "1px solid #EDE3DA",
          background: "rgba(249,244,239,0.95)",
          backdropFilter: "blur(12px)",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        {isMobile && (
          <button
            aria-label="Back to conversations"
            onClick={onBack}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "none",
              background: "transparent",
              color: "#5A3A28",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="#5A3A28"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: contact.rounded ? 12 : "50%",
            background: contact.avatarColor,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#F9F4EF",
            fontSize: 14,
            fontFamily: "'DM Serif Display', Georgia, serif",
          }}
        >
          {contact.avatar}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#1C1410",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {contact.name}
          </div>
          <div style={{ fontSize: 11, color: "#8A7060" }}>
            {contact.rounded ? 'Circle conversation' : 'Private conversation'} · {contact.circle_name}
          </div>
        </div>


      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {query.hasNextPage && !query.error && <button disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()} style={{color:'#705B4D',background:'#F0E5DB',padding:10,borderRadius:16}}>Earlier messages</button>}
        {query.isPending ? <p role="status">Loading messages…</p> : query.error ? <p role="alert">This conversation is unavailable. Your circle access may have changed.</p> : messages.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: contact.rounded ? 18 : "50%",
                background: contact.avatarColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#F9F4EF",
                fontSize: 22,
                fontFamily: "'DM Serif Display', Georgia, serif",
                marginBottom: 8,
              }}
            >
              {contact.avatar}
            </div>
            <div
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 18,
                color: "#1C1410",
              }}
            >
              {contact.name}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#8A7060",
                maxWidth: 240,
                lineHeight: 1.6,
              }}
            >
              {contact.rounded
                ? "This is the beginning of your group conversation."
                : "This is the beginning of your conversation."}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              data-message-id={m.id}
              style={{
                display: "flex",
                justifyContent: m.from === 'me' ? "flex-end" : "flex-start",
                alignItems: "flex-end",
                gap: 6,
              }}
            >
              <span style={{ fontSize: 10, color: "#B09A8A", flexShrink: 0 }}>
                {m.time}
              </span>
              <div
                style={{
                  maxWidth: "72%",
                  padding: "9px 14px",
                  borderRadius: "16px 16px 4px 16px",
                  background: m.from === 'me' ? "#C96A3A" : '#EDE3DA',
                  color: m.from === 'me' ? "#F9F4EF" : '#40332E',
                  fontSize: 14,
                  lineHeight: 1.5,
                  wordBreak: "break-word",
                }}
              >
                {contact.rounded && m.from !== 'me' && <strong style={{display:'block',fontSize:11}}>{m.authorName}</strong>}
                <span style={{whiteSpace:'pre-wrap'}}>{m.text}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input bar */}
      {send.error && <p role="alert" style={{color:'#9B3428',padding:'8px 16px'}}>{send.error.message} Your draft is still here.</p>}
      {Array.from(draft.trim()).length > 2000 && <p role="alert" style={{color:'#9B3428',padding:'8px 16px'}}>Messages can have up to 2,000 characters.</p>}
      <div
        style={{
          padding: "12px 16px",
          paddingBottom: isMobile
            ? "calc(76px + env(safe-area-inset-bottom))"
            : 12,
          borderTop: "1px solid #EDE3DA",
          background: "#F9F4EF",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            background: "#EDE3DA",
            borderRadius: 24,
            padding: "10px 16px",
            gap: 8,
          }}
        >
          <input
            aria-label="Message text"
            disabled={send.isPending || !!query.error || query.isPending}
            maxLength={4000}
            type="text"
            placeholder={`Message ${contact.name}…`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              fontSize: 14,
              color: "#1C1410",
              outline: "none",
              fontFamily: "'Inter Variable', sans-serif",
            }}
          />
        </div>
        <button
          aria-label="Send message"
          onClick={handleSend}
          disabled={!draft.trim() || send.isPending || !!query.error || query.isPending || Array.from(draft.trim()).length > 2000}
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            border: "none",
            background: draft.trim() ? "#C96A3A" : "#E8D5C4",
            color: "#F9F4EF",
            cursor: draft.trim() ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.15s, transform 0.1s",
          }}
          onMouseEnter={(e) => {
            if (draft.trim()) e.currentTarget.style.background = "#B05A2E";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = draft.trim()
              ? "#C96A3A"
              : "#E8D5C4";
          }}
          onMouseDown={(e) => {
            if (draft.trim()) e.currentTarget.style.transform = "scale(0.93)";
          }}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M3.4 3.05a.5.5 0 0 0-.68.63l2.84 7.63a2 2 0 0 1 0 1.4L2.72 20.3a.5.5 0 0 0 .68.63l18-8.5a.5.5 0 0 0 0-.9l-18-8.5Z"
              fill="#F9F4EF"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
