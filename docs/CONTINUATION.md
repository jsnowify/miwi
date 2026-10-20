# Miwi recovery audit and implementation plan

## Baseline

The repository is a JavaScript React 19 SPA with Vite 8, React Router 7,
TanStack Query 5, Tailwind 4 and Radix primitives. npm is the existing package
manager. No application server, automated tests, deployment configuration or
checked-in database migrations existed. The local SQL reference describes
profiles, circles, circle_members, posts, reactions, notifications and memories.
The local environment contains only browser Supabase configuration; no MongoDB
connection or email credentials are configured. Existing credentials are preserved.
The package lock already had user changes before this work began.

## Feature status at takeover

| Area | Status | Findings |
| --- | --- | --- |
| Landing, legal, navigation | Implemented UI | Reusable typography, cream/terracotta colors, sidebar and mobile navigation |
| Authentication | Requires migration | Supabase browser sessions, Google buttons assume provider configuration, public email enumeration |
| Profiles | Partially implemented / requires migration | Editable fields and public Supabase avatar uploads; stored streak can become stale |
| Circles | Partially implemented / requires migration | Create and list; browser-generated invites; join, revoke, leave, roles missing |
| Posting | Partially implemented / requires migration | Caption, mood, image/music UI; audience controls missing; public media URLs |
| Feed | Partially implemented / requires migration | Latest 50 across all circles; no pagination or reliable circle isolation in UI |
| Reactions | UI only | Console logging rather than persistence; public totals contradict privacy promise |
| Story rings | Partially implemented | Rolling 24 hours instead of calendar day; authors only; no detail action |
| Vibes | Partially implemented / requires migration | Supabase list and read mutations; no verified producer or protected content navigation |
| Memories, close friends, settings | Missing / UI only | No working persisted implementation |
| Messaging | Mocked | Fabricated conversations must leave production routes |
| Tests and server authorization | Missing | SQL reference has unsafe membership insert and insufficient restricted reaction checks |

## Reuse and implementation order

1. Preserve the React/Vite framework, router paths, design palette, static product
   pages, Navbar, Radix dialogs, audio renderer and reusable PostItem.
2. Add a same-origin Node API, MongoDB driver connection pool and Better Auth.
   Validate all input, enforce origin checks and rate limits, centralize audience
   policy and use transactions for membership/invite changes.
3. Replace browser database hooks with API calls. Complete circle management,
   selected-circle feed, posting, recipient snapshots, reactions and post detail.
4. Connect profiles, preferences, authorized story rings, Vibes and monthly
   reflections to persisted records. Remove mocked production messaging.
5. Add a dry-run-first export importer, indexes, privacy/integration/browser
   tests and deployment/environment instructions. Remove Supabase SDK only after
   the replacement passes automated verification.

## UI refinement plan

Keep existing cream #F9F4EF, surface #FDFAF7, terracotta #C96A3A,
ink #1C1410, taupe #8A7060 and sage #7A9E8A. Keep the existing
DM Serif Display headings and Inter body style. Preserve the compact desktop
sidebar and mobile navigation; constrain content widths and use left-aligned
forms/feed. Improve existing interactions with labeled fields, accessible Radix
dialogs, meaningful errors, visible focus and reduced-motion support.
This is a continuation of the established Miwi visual language.

## Verification limits

Local replica-set integration tests can verify the MongoDB implementation without
production access. Atlas connectivity, existing Supabase export contents, real
SMTP delivery and live deployment require separately configured infrastructure.
Never equate local tests with verified production deployment or data migration.
