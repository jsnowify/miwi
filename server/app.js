import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { registerMessaging } from './messaging.js';
import { audienceFilter, assert, requireMember, requirePost, postSchema, MOODS, REACTIONS, timezoneSchema, idSchema, calendarDay, streak } from './policy.js';

const clean = doc => { if (!doc) return doc; const { _id, ...rest } = doc; void _id; return rest; };
const hash = token => createHash('sha256').update(token).digest('hex');
const listSchema = z.object({ memberIds: z.array(idSchema).max(100) }).strict();
const circleSchema = z.object({ name: z.string().trim().min(1).max(40), description: z.string().trim().max(300).default(''), coverColor: z.string().max(20).default('🌿') }).strict();
const profileSchema = z.object({ display_name: z.string().trim().min(1).max(60), username: z.string().regex(/^[a-z0-9_]{3,30}$/), bio: z.string().trim().max(180).default(''), avatar_emoji: z.enum(['🌿', '🌸', '🌙', '🍃', '✨', '🦋', '☁️', '🌻']).default('🌿') }).strict();
const preferencesSchema = z.object({ timezone: timezoneSchema.default('UTC'), reactions: z.boolean().default(true), circle_activity: z.boolean().default(true) }).strict();
const nowFields = () => ({ created_at: new Date(), updated_at: new Date() });

export function createApp({ db, client, auth, origin = process.env.BETTER_AUTH_URL || 'http://localhost:5173', production = false, environment = process.env }) {
  const app = express();
  app.disable('x-powered-by');
  if (environment.TRUSTED_PROXY) app.set('trust proxy', environment.TRUSTED_PROXY.split(','));
  app.use(helmet({ contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"],
    fontSrc: ["'self'", 'data:'], imgSrc: ["'self'", 'data:', 'blob:', 'https://*.mzstatic.com'],
    mediaSrc: ["'self'", 'https://*.itunes.apple.com'], connectSrc: ["'self'", 'https://itunes.apple.com'],
  } }, crossOriginEmbedderPolicy: false, strictTransportSecurity: production ? undefined : false }));
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'private, no-store');
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers.origin !== origin) return res.status(403).json({ message: 'Request origin is not allowed.' });
    next();
  });
  app.use('/api', rateLimit({ windowMs: 60000, limit: 240, standardHeaders: 'draft-8', legacyHeaders: false }));
  app.get('/api/health', async (req, res) => { await db.command({ ping: 1 }); res.json({ ok: true }); });
  app.get('/api/config', (req, res) => res.json({ passwordReset: !!(environment.SMTP_URL && environment.MAIL_FROM) }));
  app.all('/api/auth/*splat', (req, res) => {
    req.headers['x-miwi-client-ip'] = req.ip;
    return toNodeHandler(auth)(req, res);
  });
  app.use(express.json({ limit: '3mb' }));
  app.use('/api', async (req, res, next) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) return res.status(401).json({ message: 'Sign in to continue.' });
    req.user = session.user;
    next();
  });
  const c = name => db.collection(name);
  async function transaction(fn) { const session = client.startSession(); try { return await session.withTransaction(() => fn(session)); } finally { await session.endSession(); } }
  async function prefs(userId) { return await c('user_preferences').findOne({ user_id: userId }) || { timezone: 'UTC', reactions: true, circle_activity: true }; }
  async function profile(userId) {
    const existing = await c('profiles').findOne({ id: userId });
    if (existing) return clean(existing);
    const user = await c('user').findOne({ _id: ObjectId.isValid(userId) ? new ObjectId(userId) : userId });
    const value = { id: userId, display_name: user?.name || 'Miwi friend', username: `friend_${userId.replaceAll('-', '').slice(-12)}`, bio: '', avatar_emoji: '🌿', ...nowFields() };
    await c('profiles').updateOne({ id: userId }, { $setOnInsert: value }, { upsert: true });
    return clean(await c('profiles').findOne({ id: userId }));
  }
  async function presentPosts(posts, userId) {
    if (!posts.length) return [];
    const [circles, reactions] = await Promise.all([
      c('circles').find({ id: { $in: [...new Set(posts.map(p => p.circle_id))] } }, { projection: { id: 1, name: 1 } }).toArray(),
      c('post_reactions').find({ post_id: { $in: posts.map(p => p.id) }, $or: [{ user_id: userId }, { post_id: { $in: posts.filter(p => p.author_id === userId).map(p => p.id) } }] }).toArray(),
    ]);
    const ids = [...new Set([...posts.map(p => p.author_id), ...reactions.map(r => r.user_id)])];
    const profiles = new Map((await c('profiles').find({ id: { $in: ids } }).toArray()).map(p => [p.id, clean(p)]));
    for (const id of ids) if (!profiles.has(id)) profiles.set(id, await profile(id));
    return posts.map(p => ({ ...clean(p), audience_ids: undefined, author: profiles.get(p.author_id),
      circles: { name: circles.find(c => c.id === p.circle_id)?.name },
      reactions: p.author_id === userId ? reactions.filter(r => r.post_id === p.id).map(r => ({ reaction: r.reaction, user_id: r.user_id, profile: profiles.get(r.user_id) })) : [],
      my_reaction: reactions.find(r => r.post_id === p.id && r.user_id === userId)?.reaction || null,
    }));
  }
  async function visiblePosts(userId, extra = {}) {
    const memberships = await c('circle_memberships').find({ user_id: userId }).toArray();
    return c('mood_posts').find({ $and: [audienceFilter(userId, memberships.map(m => m.circle_id)), extra] });
  }
  async function notify({ recipient_id, actor_id, circle_id, post_id = undefined, type, reaction = undefined, event_key }, session) {
    if (recipient_id === actor_id) return;
    const settings = await prefs(recipient_id);
    if ((type === 'reaction_received' && !settings.reactions) || (type !== 'reaction_received' && !settings.circle_activity)) return;
    const value = { id: randomUUID(), recipient_id, actor_id, circle_id, post_id, type, reaction, event_key, is_read: false, ...nowFields() };
    const { id, ...fields } = value;
    await c('notifications').updateOne({ event_key }, { $set: fields, $setOnInsert: { id } }, { upsert: true, session });
  }
  // Mutating a shared circle document serializes membership and audience-sensitive writes.
  async function lockCircle(circleId, session) { await c('circles').updateOne({ id: circleId }, { $inc: { revision: 1 } }, { session }); }
  app.get('/api/profile', async (req, res) => {
    const p = await profile(req.user.id), settings = await prefs(req.user.id);
    const posts = await (await visiblePosts(req.user.id, { author_id: req.user.id })).sort({ created_at: -1 }).toArray();
    res.json({ ...p, streak_count: streak(posts.map(p => p.created_at), settings.timezone), total_posts: posts.length, preferences: clean(settings) });
  });
  app.patch('/api/profile', async (req, res) => {
    const body = profileSchema.parse(req.body); await profile(req.user.id);
    await c('profiles').updateOne({ id: req.user.id }, { $set: { ...body, updated_at: new Date() } }); res.json({ ok: true });
  });
  app.get('/api/preferences', async (req, res) => res.json(clean(await prefs(req.user.id))));
  app.put('/api/preferences', async (req, res) => {
    const body = preferencesSchema.parse(req.body);
    await c('user_preferences').updateOne({ user_id: req.user.id }, { $set: { ...body, updated_at: new Date() } }, { upsert: true }); res.json(body);
  });
  app.get('/api/circles', async (req, res) => {
    const memberships = await c('circle_memberships').find({ user_id: req.user.id }).toArray();
    const circles = await c('circles').find({ id: { $in: memberships.map(m => m.circle_id) } }).toArray();
    res.json(await Promise.all(circles.map(async circle => ({ ...clean(circle),
      circle_members: await Promise.all((await c('circle_memberships').find({ circle_id: circle.id }).toArray()).map(async m => ({ ...clean(m), profiles: await profile(m.user_id) }))),
    }))));
  });
  app.post('/api/circles', async (req, res) => {
    const body = circleSchema.parse(req.body);
    const circle = { id: randomUUID(), name: body.name, description: body.description, cover_color: body.coverColor, owner_id: req.user.id, revision: 0, ...nowFields() };
    await transaction(async session => {
      await c('circles').insertOne({ ...circle }, { session });
      await c('circle_memberships').insertOne({ circle_id: circle.id, user_id: req.user.id, role: 'owner', ...nowFields() }, { session });
    }); res.status(201).json(circle);
  });
  app.patch('/api/circles/:id', async (req, res) => {
    const body = circleSchema.parse(req.body);
    await transaction(async session => {
      await lockCircle(req.params.id, session);
      const member = await requireMember(db, req.params.id, req.user.id, { session }); assert(['owner', 'admin'].includes(member.role), 403, 'Only administrators can change this circle.');
      await c('circles').updateOne({ id: req.params.id }, { $set: { name: body.name, description: body.description, cover_color: body.coverColor, updated_at: new Date() } }, { session });
    }); res.json({ ok: true });
  });
  app.post('/api/circles/:id/invitations', async (req, res) => {
    const { recipientId } = z.object({ recipientId: idSchema.optional() }).strict().parse(req.body);
    const token = randomBytes(24).toString('base64url'), id = randomUUID(), expires_at = new Date(Date.now() + 7 * 86400000);
    await transaction(async session => {
      await lockCircle(req.params.id, session);
      const member = await requireMember(db, req.params.id, req.user.id, { session }); assert(['owner', 'admin'].includes(member.role), 403, 'Only administrators can invite members.');
      if (recipientId) {
        const mine = await c('circle_memberships').find({ user_id: req.user.id }, { session }).toArray();
        assert(await c('circle_memberships').findOne({ user_id: recipientId, circle_id: { $in: mine.map(m => m.circle_id) } }, { session }), 400, 'Choose someone from an existing circle.');
      }
      await c('circle_invitations').insertOne({ id, circle_id: req.params.id, creator_id: req.user.id, recipient_id: recipientId || null, token_hash: hash(token), expires_at, revoked: false, used_by: null, ...nowFields() }, { session });
      if (recipientId) await notify({ recipient_id: recipientId, actor_id: req.user.id, circle_id: req.params.id, type: 'circle_invitation', event_key: `invitation:${id}` }, session);
    }); res.status(201).json({ id, token, expires_at });
  });
  app.get('/api/circles/:id/invitations', async (req, res) => {
    const m = await requireMember(db, req.params.id, req.user.id); assert(['owner', 'admin'].includes(m.role), 403);
    res.json((await c('circle_invitations').find({ circle_id: req.params.id }, { projection: { token_hash: 0 } }).toArray()).map(clean));
  });
  app.delete('/api/circles/:id/invitations/:inviteId', async (req, res) => {
    await transaction(async session => {
      await lockCircle(req.params.id, session);
      const m = await requireMember(db, req.params.id, req.user.id, { session }); assert(['owner', 'admin'].includes(m.role), 403);
      await c('circle_invitations').updateOne({ id: req.params.inviteId, circle_id: req.params.id }, { $set: { revoked: true } }, { session });
    }); res.json({ ok: true });
  });
  app.post('/api/invitations/accept', async (req, res) => {
    const { token } = z.object({ token: z.string().min(20).max(100) }).strict().parse(req.body);
    // Database-backed, shared across processes. Never log invite tokens.
    const bucket = `${req.user.id}:invite:${Math.floor(Date.now() / 60000)}`;
    const rate = await c('rate_limits').findOneAndUpdate({ _id: bucket }, { $inc: { count: 1 }, $setOnInsert: { expires_at: new Date(Date.now() + 120000) } }, { upsert: true, returnDocument: 'after' });
    assert(rate.count <= 10, 429, 'Please wait a minute before trying another invitation.');
    let circleId;
    await transaction(async session => {
      const invitation = await c('circle_invitations').findOne({ token_hash: hash(token), revoked: false, expires_at: { $gt: new Date() }, used_by: null }, { session }); assert(invitation, 400, 'This invitation is invalid, expired or already used.');
      assert(!invitation.recipient_id || invitation.recipient_id === req.user.id, 403, 'This invitation is for someone else.');
      circleId = invitation.circle_id;
      await lockCircle(circleId, session);
      await c('circle_invitations').updateOne({ id: invitation.id }, { $set: { used_by: req.user.id, used_at: new Date() } }, { session });
      await c('circle_memberships').updateOne({ circle_id: circleId, user_id: req.user.id }, { $setOnInsert: { role: 'member', ...nowFields() } }, { session, upsert: true });
      await notify({ recipient_id: invitation.creator_id, actor_id: req.user.id, circle_id: circleId, type: 'member_joined', event_key: `join:${invitation.id}` }, session);
    }); res.json({ circle_id: circleId });
  });
  app.delete('/api/circles/:id/members/:userId', async (req, res) => {
    await transaction(async session => {
      await lockCircle(req.params.id, session);
      const m = await requireMember(db, req.params.id, req.user.id, { session });
      const target = await requireMember(db, req.params.id, req.params.userId, { session });
      assert(target.role !== 'owner', 400, 'Transfer ownership before leaving.');
      assert(req.user.id === req.params.userId || m.role === 'owner' || (m.role === 'admin' && target.role === 'member'), 403, 'You cannot remove this member.');
      await c('circle_memberships').deleteOne({ circle_id: req.params.id, user_id: req.params.userId }, { session });
      await c('close_friend_lists').updateMany({ circle_id: req.params.id }, { $pull: { member_ids: req.params.userId } }, { session });
    }); res.json({ ok: true });
  });
  app.patch('/api/circles/:id/members/:userId', async (req, res) => {
    const { role } = z.object({ role: z.enum(['owner', 'admin', 'member']) }).strict().parse(req.body);
    await transaction(async session => {
      await lockCircle(req.params.id, session);
      const m = await requireMember(db, req.params.id, req.user.id, { session }); assert(m.role === 'owner', 403);
      await requireMember(db, req.params.id, req.params.userId, { session });
      assert(req.user.id !== req.params.userId, 400, 'Choose another member.');
      if (role === 'owner') {
        await c('circle_memberships').updateOne({ circle_id: req.params.id, user_id: req.user.id }, { $set: { role: 'admin' } }, { session });
        await c('circles').updateOne({ id: req.params.id }, { $set: { owner_id: req.params.userId } }, { session });
      }
      await c('circle_memberships').updateOne({ circle_id: req.params.id, user_id: req.params.userId }, { $set: { role } }, { session });
    }); res.json({ ok: true });
  });
  app.get('/api/circles/:id/close-friends', async (req, res) => {
    await requireMember(db, req.params.id, req.user.id);
    res.json({ memberIds: (await c('close_friend_lists').findOne({ circle_id: req.params.id, user_id: req.user.id }))?.member_ids || [] });
  });
  app.put('/api/circles/:id/close-friends', async (req, res) => {
    const { memberIds } = listSchema.parse(req.body);
    await transaction(async session => {
      await lockCircle(req.params.id, session); await requireMember(db, req.params.id, req.user.id, { session });
      for (const id of memberIds) await requireMember(db, req.params.id, id, { session });
      await c('close_friend_lists').updateOne({ circle_id: req.params.id, user_id: req.user.id }, { $set: { member_ids: [...new Set(memberIds)].filter(id => id !== req.user.id), updated_at: new Date() } }, { upsert: true, session });
    }); res.json({ ok: true });
  });
  app.get('/api/posts', async (req, res) => {
    const q = z.object({ circleId: idSchema.optional(), author: z.enum(['me']).optional(), cursor: z.string().max(300).optional() }).parse(req.query);
    if (q.circleId) await requireMember(db, q.circleId, req.user.id);
    /** @type {import('mongodb').Filter<import('./types.js').MoodPost>} */
    const extra = { ...(q.circleId ? { circle_id: q.circleId } : {}), ...(q.author ? { author_id: req.user.id } : {}) };
    if (q.cursor) {
      let cursor; try { cursor = JSON.parse(Buffer.from(q.cursor, 'base64url').toString()); } catch { assert(false, 400, 'Invalid page cursor.'); }
      const { date, id } = z.object({ date: z.iso.datetime(), id: idSchema }).parse(cursor);
      extra.$or = [{ created_at: { $lt: new Date(date) } }, { created_at: new Date(date), id: { $lt: id } }];
    }
    const posts = await (await visiblePosts(req.user.id, extra)).sort({ created_at: -1, id: -1 }).limit(21).toArray();
    const more = posts.length > 20; if (more) posts.pop(); const last = posts.at(-1);
    res.json({ posts: await presentPosts(posts, req.user.id), nextCursor: more ? Buffer.from(JSON.stringify({ date: last.created_at.toISOString(), id: last.id })).toString('base64url') : null });
  });
  app.get('/api/posts/:id', async (req, res) => res.json((await presentPosts([await requirePost(db, req.params.id, req.user.id)], req.user.id))[0]));
  app.post('/api/posts', async (req, res) => {
    const body = postSchema.parse(req.body); let post;
    await transaction(async session => {
      await lockCircle(body.circleId, session); await requireMember(db, body.circleId, req.user.id, { session });
      let audience_ids = [];
      if (body.scope === 'one_person') { assert(body.recipientId && body.recipientId !== req.user.id, 400, 'Choose a recipient.'); await requireMember(db, body.circleId, body.recipientId, { session }); audience_ids = [body.recipientId]; }
      if (body.scope === 'close_friends') {
        const list = await c('close_friend_lists').findOne({ circle_id: body.circleId, user_id: req.user.id }, { session });
        const current = await c('circle_memberships').find({ circle_id: body.circleId, user_id: { $in: list?.member_ids || [] } }, { session }).toArray(); audience_ids = current.map(m => m.user_id);
        assert(audience_ids.length, 400, 'Choose close friends in circle settings first.');
      }
      /** @type {import('./types.js').MediaAttachment | null} */
      let attachment = body.selectedSong ? { type: 'song', ...body.selectedSong } : null;
      if (body.mediaId) { const media = await c('media').findOne({ id: body.mediaId, owner_id: req.user.id, post_id: null }, { session }); assert(media, 400, 'Upload this image again.'); attachment = { type: 'image', url: `/api/media/${media.id}` }; }
      post = { id: randomUUID(), circle_id: body.circleId, author_id: req.user.id, mood: MOODS[body.moodLabel], mood_label: body.moodLabel, caption: body.caption, scope: body.scope, audience_ids, media_attachment: attachment, deleted_at: null, ...nowFields() };
      await c('mood_posts').insertOne({ ...post }, { session });
      if (body.mediaId) await c('media').updateOne({ id: body.mediaId }, { $set: { post_id: post.id } }, { session });
    }); res.status(201).json((await presentPosts([post], req.user.id))[0]);
  });
  app.patch('/api/posts/:id', async (req, res) => {
    const body = z.object({ caption: postSchema.shape.caption, moodLabel: postSchema.shape.moodLabel }).strict().parse(req.body);
    await transaction(async session => {
      const post = await requirePost(db, req.params.id, req.user.id, { session }); await lockCircle(post.circle_id, session);
      assert(post.author_id === req.user.id, 403, 'You can only edit your own posts.');
      await c('mood_posts').updateOne({ id: post.id }, { $set: { caption: body.caption, mood_label: body.moodLabel, mood: MOODS[body.moodLabel], updated_at: new Date() } }, { session });
    }); res.json({ ok: true });
  });
  app.delete('/api/posts/:id', async (req, res) => {
    await transaction(async session => {
      const post = await requirePost(db, req.params.id, req.user.id, { session }); await lockCircle(post.circle_id, session); assert(post.author_id === req.user.id, 403);
      await c('mood_posts').updateOne({ id: post.id }, { $set: { deleted_at: new Date() } }, { session });
    }); res.json({ ok: true });
  });
  app.put('/api/posts/:id/reaction', async (req, res) => {
    const { reaction } = z.object({ reaction: z.enum(Object.keys(REACTIONS)).nullable() }).strict().parse(req.body);
    await transaction(async session => {
      const post = await requirePost(db, req.params.id, req.user.id, { session }); await lockCircle(post.circle_id, session);
      assert(post.author_id !== req.user.id, 400, 'Reactions are for your friends’ posts.');
      if (!reaction) {
        await c('post_reactions').deleteOne({ post_id: post.id, user_id: req.user.id }, { session });
        await c('notifications').deleteMany({ event_key: `reaction:${post.id}:${req.user.id}` }, { session });
      } else {
        await c('post_reactions').updateOne({ post_id: post.id, user_id: req.user.id }, { $set: { reaction, updated_at: new Date() }, $setOnInsert: { created_at: new Date() } }, { upsert: true, session });
        await notify({ recipient_id: post.author_id, actor_id: req.user.id, circle_id: post.circle_id, post_id: post.id, type: 'reaction_received', reaction, event_key: `reaction:${post.id}:${req.user.id}` }, session);
      }
    }); res.json({ ok: true });
  });
  app.get('/api/circles/:id/stories', async (req, res) => {
    await requireMember(db, req.params.id, req.user.id);
    const timezone = timezoneSchema.parse(req.query.timezone || (await prefs(req.user.id)).timezone);
    const today = calendarDay(new Date(), timezone);
    const posts = await (await visiblePosts(req.user.id, { circle_id: req.params.id, created_at: { $gte: new Date(Date.now() - 48 * 3600000) } })).sort({ created_at: -1 }).toArray();
    const members = await c('circle_memberships').find({ circle_id: req.params.id }).toArray();
    res.json(await Promise.all(members.map(async m => ({ author: await profile(m.user_id), post_id: posts.find(p => p.author_id === m.user_id && calendarDay(p.created_at, timezone) === today)?.id || null }))));
  });
  app.get('/api/notifications', async (req, res) => {
    const rows = await c('notifications').find({ recipient_id: req.user.id }).sort({ created_at: -1 }).limit(100).toArray();
    const output = [];
    for (const row of rows) {
      // An invitation does not authorize reading the private circle or its members.
      if (row.type === 'circle_invitation') { output.push({ id: row.id, type: row.type, is_read: row.is_read, created_at: row.created_at }); continue; }
      try {
        await requireMember(db, row.circle_id, req.user.id);
        const post = row.post_id ? await requirePost(db, row.post_id, req.user.id) : null;
        output.push({ ...clean(row), actor: row.actor_id ? await profile(row.actor_id) : null, post_mood: post?.mood, post_caption: post?.caption, reaction_label: REACTIONS[row.reaction], circle_name: (await c('circles').findOne({ id: row.circle_id }))?.name });
      } catch (error) { if (error.status !== 404) throw error; }
    } res.json(output);
  });
  app.patch('/api/notifications/read', async (req, res) => {
    const { id } = z.object({ id: idSchema.optional() }).strict().parse(req.body);
    await c('notifications').updateMany({ recipient_id: req.user.id, ...(id ? { id } : {}) }, { $set: { is_read: true } }); res.json({ ok: true });
  });
  app.get('/api/memories', async (req, res) => {
    const timezone = (await prefs(req.user.id)).timezone;
    const posts = await (await visiblePosts(req.user.id, { author_id: req.user.id })).sort({ created_at: 1 }).toArray();
    const months = [...new Set(posts.map(p => calendarDay(p.created_at, timezone).slice(0, 7)))];
    const current = calendarDay(new Date(), timezone).slice(0, 7);
    const result = [];
    for (const month of months.filter(m => m < current)) {
      const selected = posts.filter(p => calendarDay(p.created_at, timezone).startsWith(month));
      const counts = selected.reduce((acc, p) => ({ ...acc, [p.mood_label]: (acc[p.mood_label] || 0) + 1 }), {});
      const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b))[0];
      const recap = { user_id: req.user.id, month, timezone, mood: top, emoji: MOODS[top], days: new Set(selected.map(p => calendarDay(p.created_at, timezone))).size, total_posts: selected.length, highlight: selected.find(p => p.caption)?.caption || null, warm_message: 'Some quiet days, some bright ones. Every check-in was yours.', mood_breakdown: counts, updated_at: new Date() };
      // Recompute from currently authorized records so revoked content cannot survive in a cached recap.
      await c('monthly_memories').updateOne({ user_id: req.user.id, month, timezone }, { $set: recap, $setOnInsert: { created_at: new Date() } }, { upsert: true }); result.push(recap);
    } res.json(result.reverse());
  });
  app.post('/api/media', async (req, res) => {
    const bucket = `${req.user.id}:media:${Math.floor(Date.now() / 60000)}`;
    const rate = await c('rate_limits').findOneAndUpdate({ _id: bucket }, { $inc: { count: 1 }, $setOnInsert: { expires_at: new Date(Date.now() + 120000) } }, { upsert: true, returnDocument: 'after' });
    assert(rate.count <= 10, 429, 'Please wait a minute before uploading another photo.');
    const { data, type } = z.object({ data: z.string().max(2800000), type: z.enum(['image/jpeg', 'image/png', 'image/webp']) }).strict().parse(req.body);
    const bytes = Buffer.from(data, 'base64'); assert(bytes.length <= 2 * 1024 * 1024 && bytes.length > 12, 400, 'Images must be under 2 MB.');
    const valid = type === 'image/png' ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : type === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
    assert(valid, 400, 'Choose a valid PNG, JPEG or WebP image.');
    const id = randomUUID(); await c('media').insertOne({ id, owner_id: req.user.id, post_id: null, type, bytes, created_at: new Date() }); res.status(201).json({ id });
  });
  app.get('/api/media/:id', async (req, res) => {
    const media = await c('media').findOne({ id: req.params.id }); assert(media);
    if (media.post_id) await requirePost(db, media.post_id, req.user.id); else assert(media.owner_id === req.user.id);
    res.type(media.type).send(Buffer.from(media.bytes.buffer));
  });
  registerMessaging(app, { db, client, profile });
  app.use('/api', (req, res) => res.status(404).json({ message: 'Endpoint not found.' }));
  app.use((error, req, res, next) => {
    void next;
    const status = error instanceof z.ZodError ? 400 : error.code === 11000 ? 409 : error.status || (error.type === 'entity.too.large' ? 413 : 500);
    res.status(status).json({ message: status === 500 ? 'Something went wrong. Please try again.' : error instanceof z.ZodError ? error.issues[0].message : error.code === 11000 ? 'This value is already in use.' : error.message });
  });
  return app;
}
