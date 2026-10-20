# Miwi continuation report

## Existing work retained

React/Vite, npm, React Router routes, TanStack Query, Tailwind, Radix primitives,
the cream/terracotta visual identity, serif headings, sidebar/mobile navigation,
landing and login layouts, legal page layouts, PostItem, profile PostCard and the
audio/lyrics renderers remain. Existing `.env` credentials were left untouched.

## Fixed and implemented

- Added a server API, pooled MongoDB driver and indexed collections. Supabase
  browser imports, SDK and active dependencies have been removed.
- Replaced Supabase Auth with Better Auth registration, login, logout, persistent
  seven-day sessions, secure production cookies, password hashing, reset support
  when SMTP is configured, single-use reset tokens and other-device revocation.
- Added onboarding through private circle creation/joining, optional descriptions
  and emoji identities, cryptographic single-use invites, expiry/revocation,
  member removal, leaving, administrator roles and ownership transfer.
- Added selected-circle chronological cursor pagination, persistent moods/photos,
  caption limits, post detail/edit/delete, explicit audiences and close friends.
- Added four persisted reaction types, change/removal, private author-only
  reactor identities, deduplicated Vibes and read/read-all controls.
- Added authorized local-date story rings with post-detail navigation, selectable
  profile avatars, profile editing, paginated mood history, calendar-day streaks,
  timezone/notification preferences and personal previous-month memories.
- Restored the original Messages page, navigation, chat layout and wide-screen
  feed sidebar with persistent direct and circle chats, unread positions,
  chronological pagination and server-side circle/participant checks. Removed
  fabricated conversations and the unused posting modal. Corrected old claims
  about paid features, reminders and automatic deletion in existing UI copy.
- Added same-origin mutation checks, validation, safe errors, request/invitation/
  upload limits, security headers, protected media and transactions for membership,
  invitation and audience-sensitive changes.
- Added a dry-run-first, idempotent export importer that preserves relationships,
  rejects conflicting identities, validates counts and supports reset-based
  credential transition without copying Supabase hashes.

## Main files

- `server/app.js`, `server/policy.js`: routes, shared authorization, validation,
  calendar dates, streaks, transactions and private response shaping.
- `server/db.js`, `server/auth.js`, `server/runtime.js`, `server/index.js`: connection/index setup,
  Better Auth configuration and production server lifecycle.
- `server/messaging.js`, `src/hooks/useMessages.js`, `MessagesPanel.jsx`,
  `ChatView.jsx`, `src/pages/Messages.jsx`: restored messaging and its API.
- `shared/moods.js`, `server/types.js`: consistent domain values and editor types.
- `src/lib/api.js`, `src/lib/auth.js`, `src/context/AuthContext.jsx`, `src/hooks/*`:
  authenticated API requests and user/circle-scoped query caches.
- `src/components/ComposeSheet.jsx`, `PostItem.jsx`, `AppFrame.jsx`, `Sheet.jsx`,
  `SettingsSheet.jsx`, `profile/EditProfileSheet.jsx`: connected reusable UI.
- `src/pages/{Feed,Circles,Profile,Activity,Memories,Settings,PostDetail,Signup,
  ResetPassword}.jsx`: working product screens on the existing router.
- `scripts/import-legacy.js`, `tests/privacy.test.js`, `tests/e2e/journey.spec.js`:
  data transition and automated verification.
- `.env.example`, `Dockerfile`, `README.md`, `docs/*`: configuration and handoff.

## Data and indexes

Collections include Better Auth `user`, `account`, `session`, `verification`,
`rateLimit`, plus `profiles`, `circles`, `circle_memberships`,
`circle_invitations`, `close_friend_lists`, `mood_posts`, `post_reactions`,
`notifications`, `monthly_memories`, `user_preferences`, `media`, and
`rate_limits`, `chat_conversations`, `chat_messages`, and `chat_reads`.
Imported old circle recaps are archived in `legacy_memories`.
Unique identity, membership, reaction and recap constraints, chronological
feed indexes and expiration indexes are detailed in
[DATA-AND-PRIVACY.md](DATA-AND-PRIVACY.md).

## Performance and reliability

Feed responses contain at most 20 posts with stable date/ID cursors. Related
profiles, circles and reactions are fetched in batches. Connections reuse a
10-connection pool, and private responses are never shared-cacheable. Polling
uses 30-second intervals and cleans up through query lifecycles. A browser-test
failure uncovered and fixed full-cache clearing during initial session loading.
Typography is self-hosted; external font and icon stylesheet requests were
removed. An unused shadcn CLI and its vulnerable transitive dependencies were
removed while preserving its CSS locally. The production client bundle is
approximately 473 kB (143 kB gzip), including restored messaging; no server
credentials enter that bundle.

## Automated verification

- `npm run lint`: passed.
- `npm run typecheck`: passed for server/shared/importer JavaScript using checkJs.
- `npm test`: six integration tests passed against isolated MongoDB replicas
  set: calendar/DST, multi-user social/privacy, pagination/media/sessions/recaps,
  idempotent legacy import plus reset/sign-in transition, and messaging privacy,
  pagination, deduplication, unread positions and revoked membership. The startup
  test also cold-starts Vite and verifies UI/API responses in the same process
  without a second backend, with no server credentials in served client code.
- `npm run build`: passed.
- `npm run test:e2e`: two Chromium journeys passed at desktop and iPhone-sized
  viewports. Tests cover registration, circle creation, invitation generation,
  publishing, reload persistence, editing, profiles, preferences, empty memories,
  logout/login and layout overflow. Desktop additionally covers a second browser
  account accepting an invite, reacting, and the author's notification/detail.
  Messaging coverage includes a two-account direct exchange, persisted history
  after reload, and a mobile circle chat with back navigation.
  Session recovery coverage simulates a temporary 503 response, restores the
  endpoint, and verifies automatic recovery without pressing Try again.
  Optional music attachment persistence uses a fixture for Apple's search
  response; live Apple availability and audio playback are not asserted.
- `npm audit`: zero reported vulnerabilities at implementation time.

The privacy suite checks nonmembers, removed members, circle isolation,
publication-time audiences, forged mutations, duplicate reactions, revoked/
expired/contended invitations, hidden activity, notification access and media
access after deletion. Mail is captured through a test transport; no delivery
claim is made. Docker configuration was authored but no image deployment was
performed.

## Required external configuration and remaining limits

Set `MONGODB_URI`, `MONGODB_DB`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` and
`PORT` using [.env.example](../.env.example). SMTP requires both `SMTP_URL` and
`MAIL_FROM`; a proxy requires an explicit `TRUSTED_PROXY` allowlist.

The initial environment supplied only old browser Supabase variables. Atlas
has since been configured and verified with a dedicated free Singapore cluster,
scoped database user, IP access entry, database indexes and a read transaction.
The running local welcome/signup screens and same-port health/session endpoints
were verified against that connection. See [LOCAL-SETUP.md](LOCAL-SETUP.md).
A real legacy export, production cutover, SMTP delivery and hosted deployment
have **not** been verified or performed.

Google OAuth, browser push, daily reminders, subscriptions,
self-service account deletion/export and automatic retention jobs are not
implemented in this scope; the product UI does not claim to provide them.
Music search and short previews are preserved as an optional attachment flow;
availability depends on Apple's external service. The importer preserves valid
music records and warns on unsupported legacy attachments; source assets must be reviewed before
cutover. Final operator contact details and retention terms still need to be set
for the actual hosted instance.

The core social implementation is locally verified. Production readiness still
depends on the configuration and cutover work above; it is not a deployed or
completed production migration.
