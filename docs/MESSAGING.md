# Restored messaging

The original Messages page, conversation-list components, chat bubbles, mobile
chat overlay and desktop sidebar have been recovered from the existing project
and connected to the new MongoDB API. `/messages` no longer redirects to circles.
Messages is available in navigation, the feed's wide-screen sidebar and the
shared footer. The unfinished local-state chat implementation and sample
conversations are replaced by persistent data.

## Behavior

- Start a direct conversation with a current member of a circle you share.
- The Groups tab opens the selected circle's shared conversation.
- Send messages of up to 2,000 Unicode code points; authors are server-derived.
- New messages refresh while the conversation is open; conversation lists poll
  every ten seconds and messages every five seconds. Background polling pauses
  through the existing query library's lifecycle behavior.
- Persist unread positions, show actual unread counts, load earlier messages,
  and retain the selected conversation across reloads through the URL.
- Keep failed drafts and retry with the same client request ID, so a lost
  response does not duplicate a message that already reached the server.
- No fabricated conversations, activity statuses or messages appear.

## Privacy

Chats are scoped to a circle. Direct chat history is available only to the two
participants while they are current members. Other members of the same circle
cannot list or retrieve that direct chat. Sending a direct message requires
both participants to remain members. Leaving/removal immediately denies server
access to all chats in that circle. Remaining members retain their history.
Rejoining restores access under the same rules.

Circle group chat history follows whole-circle visibility: current circle
members, including later joiners, can read earlier group messages. The contact
picker states which circle a direct conversation belongs to. There are no
cross-circle or public messaging endpoints. Conversations are private through
server authorization; this is not end-to-end encryption.

Message writes and membership mutations serialize on the circle revision within
MongoDB transactions. The server limits sending to 60 requests per minute/user,
validates every payload and scopes read-position changes to the caller.

## Storage

- `chat_conversations`: unique ID, unique circle/conversation key, circle/date
  lookup. A direct key is the sorted participant pair; each circle has one group.
- `chat_messages`: unique ID, unique conversation/sequence and unique
  conversation/author/client-request ID. Sequence pagination returns at most 50
  messages and remains stable across same-timestamp sends.
- `chat_reads`: unique conversation/user; monotonically increasing read sequence.

Indexes are installed by the regular server startup, including on the configured
Atlas database. Tests use isolated MongoDB replicas and leave real accounts and
messages untouched.
