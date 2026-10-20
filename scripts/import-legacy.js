import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { connectDatabase, createIndexes } from '../server/db.js';
import { MOODS, REACTIONS, idSchema, postSchema } from '../server/policy.js';

const legacyId = idSchema;
const sourceSchema = z.object({
  users: z.array(z.object({ id: legacyId, email: z.email(), email_confirmed_at: z.string().nullable().optional(), created_at: z.string().optional() })),
  profiles: z.array(z.object({ id: legacyId, username: z.string().regex(/^[a-z0-9_]{3,30}$/), display_name: z.string().min(1).max(60), bio: z.string().nullable().optional(), created_at: z.string().optional() })),
  circles: z.array(z.object({ id: legacyId, owner_id: legacyId, name: z.string().min(1).max(40), description: z.string().nullable().optional(), cover_color: z.string().optional(), created_at: z.string().optional() })),
  circle_members: z.array(z.object({ circle_id: legacyId, user_id: legacyId, role: z.enum(['owner','admin','member']).default('member'), created_at: z.string().optional() })),
  posts: z.array(z.object({ id: legacyId, circle_id: legacyId, author_id: legacyId, mood: z.string(), mood_label: z.string().optional(), caption: z.string().nullable().optional(), scope: z.enum(['circle','close_friends','one_person']).default('circle'), recipient_id: legacyId.nullable().optional(), audience_ids: z.array(legacyId).optional(), created_at: z.string(), updated_at: z.string().optional(), deleted_at: z.string().nullable().optional(), media_attachment: z.unknown().optional() })),
  reactions: z.array(z.object({ post_id: legacyId, user_id: legacyId, reaction: z.string(), created_at: z.string().optional() })).default([]),
  notifications: z.array(z.object({ id: legacyId, recipient_id: legacyId, actor_id: legacyId.nullable().optional(), circle_id: legacyId.nullable().optional(), post_id: legacyId.nullable().optional(), type: z.string(), is_read: z.boolean().default(false), created_at: z.string().optional() })).default([]),
  // Storage exports are supplied explicitly. No credentials or public URLs are fetched.
  media: z.array(z.object({ id: legacyId, post_id: legacyId, owner_id: legacyId, type: z.enum(['image/png','image/jpeg','image/webp']), data: z.string().max(2800000) })).default([]),
  memories: z.array(z.unknown()).default([]),
  user_preferences: z.array(z.object({ user_id: legacyId, timezone: z.string().default('UTC'), reactions: z.boolean().default(true), circle_activity: z.boolean().default(true) })).default([]),
});
const check = (condition, message) => { if (!condition) throw new Error(message); };
const stableId = id => new ObjectId(createHash('sha256').update(`miwi:legacy-user:${id}`).digest('hex').slice(0,24));
const date = value => { const d = new Date(value || '2000-01-01T00:00:00Z'); check(Number.isFinite(d.getTime()), 'Invalid source timestamp.'); return d; };
export function prepareImport(input) {
  const source = sourceSchema.parse(input), warnings = [];
  const userIds = new Set(source.users.map(u => u.id)), circles = new Set(source.circles.map(c => c.id)), posts = new Set(source.posts.map(p => p.id));
  const memberships = new Set(source.circle_members.map(m => `${m.circle_id}:${m.user_id}`));
  check(userIds.size === source.users.length, 'Duplicate user IDs.');
  check(circles.size === source.circles.length && posts.size === source.posts.length, 'Duplicate circle or post IDs.');
  check(new Set(source.users.map(u => u.email.toLowerCase())).size === source.users.length, 'Duplicate emails.');
  check(new Set(source.profiles.map(p => p.username)).size === source.profiles.length, 'Duplicate usernames.');
  check(new Set(source.profiles.map(p => p.id)).size === source.profiles.length, 'Duplicate profiles.');
  check(memberships.size === source.circle_members.length, 'Duplicate memberships.');
  for (const p of source.profiles) check(userIds.has(p.id), 'Profile has no exported auth user.');
  for (const u of source.users) check(source.profiles.some(p => p.id === u.id), 'Auth user has no exported profile.');
  for (const c of source.circles) check(userIds.has(c.owner_id) && source.circle_members.some(m => m.circle_id === c.id && m.user_id === c.owner_id && m.role === 'owner') && source.circle_members.filter(m => m.circle_id === c.id && m.role === 'owner').length === 1, 'Circle ownership relationship is invalid.');
  for (const m of source.circle_members) check(circles.has(m.circle_id) && userIds.has(m.user_id), 'Membership has a missing relationship.');
  for (const p of source.posts) check(circles.has(p.circle_id) && userIds.has(p.author_id), 'Post has a missing author or circle.');
  for (const r of source.reactions) check(posts.has(r.post_id) && userIds.has(r.user_id), 'Reaction has a missing relationship.');
  check(new Set(source.reactions.map(r => `${r.post_id}:${r.user_id}`)).size === source.reactions.length, 'Duplicate reactions.');
  for (const n of source.notifications) check(userIds.has(n.recipient_id) && (!n.actor_id || userIds.has(n.actor_id)) && (!n.circle_id || circles.has(n.circle_id)) && (!n.post_id || posts.has(n.post_id)), 'Notification has a missing relationship.');
  for (const media of source.media) check(posts.has(media.post_id) && source.posts.some(p => p.id === media.post_id && p.author_id === media.owner_id), 'Media has a missing post or mismatched owner.');
  const uid = id => { check(userIds.has(id), 'Unknown recipient.'); return stableId(id).toHexString(); };
  const documents = {
    user: source.users.map(u => ({ _id: stableId(u.id), name: source.profiles.find(p => p.id === u.id).display_name, email: u.email.toLowerCase(), emailVerified: !!u.email_confirmed_at, createdAt: date(u.created_at), updatedAt: date(u.created_at), legacy_id: u.id })),
    profiles: source.profiles.map(p => ({ id: uid(p.id), username: p.username, display_name: p.display_name, bio: p.bio || '', avatar_emoji: '🌿', created_at: date(p.created_at), updated_at: date(p.created_at) })),
    circles: source.circles.map(c => ({ id: c.id, owner_id: uid(c.owner_id), name: c.name, description: c.description || '', cover_color: c.cover_color || '🌿', revision: 0, created_at: date(c.created_at), updated_at: date(c.created_at) })),
    circle_memberships: source.circle_members.map(m => ({ circle_id: m.circle_id, user_id: uid(m.user_id), role: m.role, created_at: date(m.created_at), updated_at: date(m.created_at) })),
    mood_posts: source.posts.map(p => {
      const raw = (p.mood_label || p.mood).replaceAll('_',' ').toLowerCase();
      const mood = raw === 'needing hug' ? 'needing a hug' : raw;
      const label = Object.hasOwn(MOODS, mood) ? mood : Object.keys(MOODS).find(key => MOODS[key] === p.mood);
      check(label, 'Unknown mood in export.');
      check(Array.from(p.caption || '').length <= 280, 'Caption exceeds 280 characters; resolve in export before importing.');
      let recipients = [];
      if (p.scope === 'one_person') { check(p.recipient_id, 'Direct post is missing its recipient.'); recipients = [p.recipient_id]; }
      if (p.scope === 'close_friends') {
        recipients = p.audience_ids || [];
        if (!p.audience_ids) warnings.push(`Post ${p.id}: historical close-friends audience unavailable; author-only until reviewed.`);
      }
      for (const recipient of recipients) uid(recipient);
      const media = source.media.find(m => m.post_id === p.id);
      const song = p.media_attachment ? postSchema.shape.selectedSong.safeParse(p.media_attachment) : null;
      const attachment = media ? { type: 'image', url: `/api/media/${media.id}` } : song?.success && song.data ? { type: 'song', ...song.data } : null;
      if (p.media_attachment && !attachment) warnings.push(`Post ${p.id}: attachment remains in source export; provide media bytes to enable it.`);
      return { id: p.id, author_id: uid(p.author_id), circle_id: p.circle_id, mood: MOODS[label], mood_label: label, caption: p.caption || '', scope: p.scope, audience_ids: recipients.map(uid), media_attachment: attachment, created_at: date(p.created_at), updated_at: date(p.updated_at || p.created_at), deleted_at: p.deleted_at ? date(p.deleted_at) : null };
    }),
    post_reactions: source.reactions.map(r => {
      const reaction = Object.hasOwn(REACTIONS, r.reaction) ? r.reaction : { same: '🤍', thinking: '🌸', thinking_of_you: '🌸', lets_go: '🔥', sending_hug: '🫂', sending_a_hug: '🫂' }[r.reaction]; check(reaction, 'Unknown reaction.');
      return { post_id: r.post_id, user_id: uid(r.user_id), reaction, created_at: date(r.created_at), updated_at: date(r.created_at) };
    }),
    notifications: source.notifications.map(n => ({ id: n.id, recipient_id: uid(n.recipient_id), actor_id: n.actor_id ? uid(n.actor_id) : null, circle_id: n.circle_id || source.posts.find(p => p.id === n.post_id)?.circle_id || null, post_id: n.post_id || null, type: n.type, is_read: n.is_read, created_at: date(n.created_at) })),
    media: source.media.map(m => { const bytes = Buffer.from(m.data, 'base64'); check(bytes.length <= 2 * 1024 * 1024, 'Exported image exceeds size limit.'); return { id: m.id, post_id: m.post_id, owner_id: uid(m.owner_id), type: m.type, bytes, created_at: date() }; }),
    user_preferences: source.user_preferences.map(p => { new Intl.DateTimeFormat('en', { timeZone: p.timezone }).format(); return { user_id: uid(p.user_id), timezone: p.timezone, reactions: p.reactions, circle_activity: p.circle_activity }; }),
    // Archive incompatible circle-wide recaps without exposing them through personal recaps.
    legacy_memories: source.memories.map((value, index) => ({ legacy_key: String(index), source: value })),
  };
  return { documents, warnings, counts: Object.fromEntries(Object.entries(documents).map(([key, rows]) => [key, rows.length])) };
}
const identities = { user: ['_id'], profiles: ['id'], circles: ['id'], circle_memberships: ['circle_id','user_id'], mood_posts: ['id'], post_reactions: ['post_id','user_id'], notifications: ['id'], media: ['id'], user_preferences: ['user_id'], legacy_memories: ['legacy_key'] };
export async function executeImport(db, client, prepared) {
  // Check conflicts before any writes; never overwrite an existing profile or account.
  for (const user of prepared.documents.user) {
    const existing = await db.collection('user').findOne({ $or: [{ email: user.email }, { _id: user._id }] });
    check(!existing || (String(existing._id) === String(user._id) && existing.legacy_id === user.legacy_id), 'An existing account conflicts with the export. Resolve identity mapping manually.');
  }
  for (const p of prepared.documents.profiles) {
    const existing = await db.collection('profiles').findOne({ username: p.username });
    check(!existing || existing.id === p.id, 'An existing username conflicts with the export.');
  }
  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      for (const [collection, rows] of Object.entries(prepared.documents)) {
        if (!rows.length) continue;
        await db.collection(collection).bulkWrite(rows.map(row => ({ updateOne: { filter: Object.fromEntries(identities[collection].map(key => [key, row[key]])), update: { $setOnInsert: row }, upsert: true } })), { session });
      }
      for (const [collection, rows] of Object.entries(prepared.documents)) {
        for (const row of rows) check(await db.collection(collection).countDocuments(Object.fromEntries(identities[collection].map(key => [key, row[key]])), { session }) === 1, 'Imported record count did not match.');
      }
    });
  } finally { await session.endSession(); }
  return prepared.counts;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const file = process.argv[2]; check(file, 'Usage: node --env-file=.env scripts/import-legacy.js export.json [--apply]');
  const prepared = prepareImport(JSON.parse(await readFile(file, 'utf8')));
  console.log(JSON.stringify({ mode: process.argv.includes('--apply') ? 'apply' : 'dry-run', counts: prepared.counts, warnings: prepared.warnings }, null, 2));
  if (process.argv.includes('--apply')) {
    const { db, client } = await connectDatabase();
    try { await createIndexes(db); await executeImport(db, client, prepared); console.log('Import verified. No existing records or source data were overwritten.'); } finally { await client.close(); }
  }
}
