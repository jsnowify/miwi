# Data and authorization

## Collections

Application IDs are UUID strings; Better Auth uses ObjectIds internally and
hexadecimal strings at API boundaries. Legacy circle/post IDs are kept stable.

| Collection | Contents / indexes |
| --- | --- |
| `user`, `account`, `session`, `verification`, `rateLimit` | Better Auth owns credentials, reset tokens and sessions. Unique email/token; session and verification TTLs. |
| `profiles` | Display name, unique username, bio, emoji avatar; unique user ID. Never stores an email or password. |
| `circles` | UUID, name, description, emoji, owner and revision; unique ID. |
| `circle_memberships` | Circle, user, role, timestamps; unique circle/user, user lookup. |
| `circle_invitations` | SHA-256 token digest, creator, optional recipient, expiry, revoked/used state; unique digest, circle lookup, expiry TTL. Tokens have 192 bits of entropy and are shown only when generated. |
| `close_friend_lists` | User/circle and selected member IDs; unique user/circle. |
| `mood_posts` | Author, circle, mood, caption, scope, recipient snapshot, attachment, timestamps and soft deletion; unique ID, circle/date/ID feed index, author/date index. |
| `post_reactions` | Post, user and reaction; unique post/user prevents duplicates. |
| `notifications` | Recipient, actor, circle, optional post, event, read state; recipient/date, unique ID and sparse unique event key. |
| `monthly_memories` | Personal month, timezone, real mood breakdown and highlight; unique user/month/timezone. |
| `user_preferences` | Timezone and notification preferences; unique user ID. |
| `media` | Validated image bytes, owner, post, content type; unique ID, owner/date and post indexes. Images are limited to 2 MB. |
| `chat_conversations` | Circle-scoped direct or group chat; unique ID and circle/key, circle/date lookup. |
| `chat_messages` | Sender, text, sequence and client request ID; unique ID, conversation/sequence and conversation/sender/request constraints. |
| `chat_reads` | User's last read message sequence; unique conversation/user. |
| `rate_limits` | Shared per-user invitation-attempt windows with TTL. |
| `legacy_memories` | Preserved legacy circle recaps, inaccessible through personal memory endpoints. |

`server/db.js` creates indexes before serving requests. Zod schemas enforce input
types and bounds; clients cannot supply MongoDB operators, authors or roles to
general-purpose update operations. All collection writes go through the API or
the separately invoked importer. Atlas credentials belong only to the server.

## Visibility rules

Every post read first requires **current** membership in its circle, including
reads by its author. A removed or departed member immediately loses API access
to old posts and their media. A previously downloaded copy cannot be revoked.
Rejoining restores access under the same audience rules.

Whole-circle posts are visible to current members, including later joiners.
Close-friends and direct posts freeze their recipient IDs when created. The
author can always read while a member. Editing a post preserves its audience.
Adding close friends later never grants access to older restricted posts.

`server/policy.js` is shared by feed, detail, reactions, media, notifications,
story rings and memories. Reactions return identities only to the author; other
viewers receive only their own selected reaction, without public totals.
Notifications recheck access at read time and omit unavailable content.
Invitation notifications expose no circle/member details to nonmembers.

MongoDB transactions protect multi-document mutations. Membership removal,
invitation acceptance, role changes, post creation and reactions write the same
circle revision document to serialize concurrent audience-sensitive changes.

## Dates and memories

At signup, the browser's IANA timezone is saved as a preference. Imported or
older accounts default to UTC until changed in Settings. A streak counts unique
calendar dates in that timezone, ending today or yesterday, and is private to
the user. Date arithmetic uses calendar-day strings rather than subtracting
24 hours, handling daylight-saving transitions. Timezone changes recompute
history in the new zone.

Story rings use the viewer's device timezone and local calendar day. They query
all eligible posts for that date independently of feed pagination. Hidden posts
never activate a ring. Inactive members remain visible as roster members.

Memories are generated lazily on opening the page after a month has ended. They
are personal, derived from the user's own currently accessible posts, and
idempotent for user/month/timezone. The latest response is recomputed so deleted
or inaccessible content cannot leak through a stale stored recap. Months with
no eligible activity have an empty state. There is no background delivery or AI
inference about emotional health.

## Updates and resource limits

Feed, roster, stories and Vibes poll every 30 seconds while their screens are
active; TanStack Query pauses intervals in background tabs by default. All
private query keys include the authenticated user; circle feeds also include
circle ID. Authentication changes remove the previous user's cached queries.
All API responses use `private, no-store`. Feed pagination uses date/ID cursors
with at most 20 posts. Post hydration batches related profile, circle and
reaction reads instead of querying those per post.

The API enforces same-origin mutations, Helmet headers, 240 requests/minute/IP,
Better Auth's persistent endpoint-specific limits, and 10 invite attempts per
minute/user. Photo uploads are additionally limited to 10 per minute/user.
Deploy a trusted reverse proxy explicitly if needed; do not trust
client-provided forwarding headers. Use HTTPS in production. No auth session
or password hashes are copied from Supabase.

Messaging uses the additional participant and membership policy described in
[MESSAGING.md](MESSAGING.md). Its conversation list polls every ten seconds and
open chats every five seconds. Session reads allow 120/minute/IP; sensitive
authentication endpoints retain Better Auth's stricter endpoint limits.
