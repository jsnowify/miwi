# Miwi — Your circle, your vibes 🌿

Miwi continues the original React/Vite application with a same-origin Node API,
MongoDB Atlas persistence and Better Auth. Supabase is no longer required at
runtime. The original product concept is retained below.

## Run locally

Use Node 24 and npm. Install with `npm ci`. Add the variables in
[.env.example](.env.example) to your existing local `.env`; do not overwrite
existing secrets. At minimum configure `MONGODB_URI`, `MONGODB_DB`,
`BETTER_AUTH_SECRET` (at least 32 random characters), and `BETTER_AUTH_URL`.
Use an Atlas replica set because circle and auth operations use transactions.

```powershell
npm run dev
```

Open **http://localhost:5173** (the origin must exactly match
`BETTER_AUTH_URL`). The UI and API run together in the same Vite process;
you do not need to start a second server on port 3001.
Create an account, create a circle, generate an invitation, and share a mood.
Add `SMTP_URL` and `MAIL_FROM` to enable password resets. Google sign-in and
push reminders are not configured; the app does not simulate them.

## Build and deploy

```powershell
npm run build
npm start
```

The Node process serves both `dist` and `/api`. Deploy it as a persistent Node
service or use the provided [Dockerfile](Dockerfile). Set `NODE_ENV=production`,
the public **HTTPS** `BETTER_AUTH_URL`, MongoDB credentials and the auth secret
in the hosting environment. Configure Atlas network access for the server and
use a database user scoped to the Miwi database. Health check: `/api/health`.
If behind a proxy, set `TRUSTED_PROXY` only to known proxy IPs/CIDRs.
`vite preview` previews assets only; it does not provide the API.

On Render, the server uses `RENDER_EXTERNAL_URL` when `BETTER_AUTH_URL` is
omitted. Set an explicit `BETTER_AUTH_URL` when adding a custom domain.
Production startup rejects an HTTP origin. See [deployment settings](docs/DEPLOYMENT.md).

## Verification

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Integration and browser tests create isolated local MongoDB replica sets and do
not use your `.env` or production database. First use downloads a MongoDB test
binary. Browser tests exercise the production build, so build before running.
The JavaScript server, authorization policies, shared domain constants and
importer are checked with TypeScript's `checkJs`; the existing React JSX is
verified by linting and Vite's production build.

See [the recovery audit](docs/CONTINUATION.md),
[data and privacy rules](docs/DATA-AND-PRIVACY.md),
[legacy import instructions](docs/MIGRATION.md), and
[the implementation report](docs/IMPLEMENTATION.md).

---

# Original app concept

> _A cozy, warm corner of the internet for you and your closest people._

---

## What is Miwi?

Miwi is a private social mood-sharing app designed for small, close-knit circles of friends. Unlike big social media platforms built around followers, likes, and performance — Miwi is intimate. It's a soft, daily check-in with the people who actually matter to you. No pressure. No audience. Just vibes.

The name Miwi feels warm, personal, and friendly — and that's exactly what the app is.

---

## The Problem Miwi Solves

Big social apps (Instagram, TikTok, Twitter) are built for broadcasting. You perform for an audience. You curate. You compare. It's exhausting.

Meanwhile, group chats get flooded and chaotic. There's no easy way to just softly say _"hey, I'm feeling cozy today"_ to the people you love without it getting buried.

Miwi fills that gap — a calm, beautiful space to share your daily mood and small moments with a trusted few.

---

## Target Users

- Friend groups of 3–10 people who want to stay emotionally connected
- Couples wanting a shared daily ritual
- Long-distance friends keeping in touch meaningfully
- Anyone tired of performative social media

---

## Core Features

### 1. Mood Posts

The heart of Miwi. Every post starts with a **vibe tag** — a mood emoji that sets the tone — followed by a short caption (max 280 characters). Keeps things light, honest, and low-pressure.

Mood tags include:

- 🌿 calm
- 🔥 excited
- 🌧️ low
- 🌙 sleepy
- ✨ grateful
- 🫂 needing a hug
- 🍃 at peace
- 🌪️ overwhelmed
- 😂 chaotic good

### 2. The Circle Feed

A cozy, scrollable home feed showing mood posts from your circle in real time. No algorithm — purely chronological. No ads. No strangers.

### 3. Story Rings

At the top of the feed, small avatar rings show who has posted today. Tap to see their full post. Missed a day? No judgment — rings just quietly go dark.

### 4. Soft Reactions

Instead of cold "like" counts, Miwi uses warm reactions:

- 🤍 **Same** — I feel you
- 🌸 **Thinking of you**
- 🔥 **Let's go!**
- 🫂 **Sending a hug**

Reactions are private — only the poster sees who reacted.

### 5. Share Controls

Every post can be shared to:

- **Your whole circle**
- **Close friends** (a smaller sub-group)
- **Just one person** (a soft, personal moment)

### 6. Vibe Check Notifs

Optional gentle daily nudge: _"How are you feeling today? ☁️"_ — not pushy, just a soft reminder to check in.

### 7. Miwi Memories

At the end of each month, Miwi quietly generates a little recap — your most used mood, a highlight moment from your circle, and a warm message. Like a tiny journal you didn't know you were keeping.

### 8. Profile Page

Simple and personal — your name, a short bio, your recent moods displayed as a soft grid, and a mood streak (how many days in a row you've shared something).

### 9. Circles Management

Create or join a circle. Each circle is invite-only via a simple link or code. You can be in multiple circles (e.g., one for your barkada, one for a long-distance friend group).

---

## What Miwi is NOT

- Not a public social network
- Not built around follower counts or metrics
- Not designed to go viral
- No ads, ever
- No algorithm deciding what you see

---

## Design Language

| Element       | Direction                            |
| ------------- | ------------------------------------ |
| Color palette | Warm terracotta, cream, soft blush   |
| Typography    | Soft, rounded, friendly              |
| Tone          | Cozy, calm, intimate                 |
| Animations    | Gentle fades, no jarring transitions |
| Icons         | Minimal, outline style               |

---

## Screens Overview

1. **Home Feed** — Circle's mood posts, story rings, soft reactions
2. **Post a Vibe** — Mood picker + caption + share controls
3. **Profile** — Personal mood history, streak, bio
4. **Notifications (Vibes)** — Who reacted, who posted, gentle nudges
5. **Circle Settings** — Manage members, invite friends

---

## Monetization (Future)

- **Miwi Plus** — Custom mood tags, themed circle backgrounds, memory archive, extended post history
- No ads, ever — the intimacy of the app is the product

---

## Tagline Ideas

- _"Your circle, your vibes."_
- _"A soft space for the people who matter."_
- _"Small circle. Big feelings."_
- _"Just you and your people."_

---

_Made with love — and a little bit of a crush_ 🌸
