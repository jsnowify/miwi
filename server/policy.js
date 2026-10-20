import { z } from 'zod';
import { MOODS } from '../shared/moods.js';
export { MOODS, REACTIONS } from '../shared/moods.js';
export const idSchema = z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/);
export const timezoneSchema = z.string().max(80).refine(value => {
  try { new Intl.DateTimeFormat('en', { timeZone: value }).format(); return true; } catch { return false; }
}, 'Choose a valid timezone.');
export const postSchema = z.object({
  circleId: idSchema,
  moodLabel: z.enum(Object.keys(MOODS)),
  caption: z.string().trim().refine(s => Array.from(s).length <= 280, 'Captions can have up to 280 characters.').default(''),
  scope: z.enum(['circle', 'close_friends', 'one_person']).default('circle'),
  recipientId: idSchema.optional(),
  mediaId: idSchema.optional(),
  selectedSong: z.object({ track_id: z.string().max(40), title: z.string().max(200), artist: z.string().max(200), cover_url: z.url().regex(/^https:\/\/[^/]*mzstatic\.com\//), preview_url: z.url().regex(/^https:\/\/[^/]*itunes\.apple\.com\//), clip_start: z.number().min(0).max(30).default(0) }).nullable().optional(),
}).strict();
export function httpError(status, message) { return Object.assign(new Error(message), { status }); }
export function assert(condition, status = 404, message = 'This content is unavailable.') { if (!condition) throw httpError(status, message); }

// Membership is checked at request time; restricted recipients are frozen at publication.
export function audienceFilter(userId, circleIds) {
  return { circle_id: { $in: circleIds }, deleted_at: null,
    $or: [{ author_id: userId }, { scope: 'circle' }, { audience_ids: userId }] };
}
/** @param {import('mongodb').Db} db @param {string} circleId @param {string} userId @param {import('mongodb').FindOptions} options */
export async function requireMember(db, circleId, userId, options = {}) {
  const membership = await db.collection('circle_memberships').findOne({ circle_id: circleId, user_id: userId }, options);
  assert(membership); return membership;
}
/** @param {import('mongodb').Db} db @param {string} postId @param {string} userId @param {import('mongodb').FindOptions} options */
export async function requirePost(db, postId, userId, options = {}) {
  const memberships = await db.collection('circle_memberships').find({ user_id: userId }, options).toArray();
  const post = await db.collection('mood_posts').findOne({ id: postId, ...audienceFilter(userId, memberships.map(m => m.circle_id)) }, options);
  assert(post); return post;
}
export function calendarDay(date, timeZone) {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(date));
}
export function previousDay(day) { const d = new Date(`${day}T12:00:00Z`); d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10); }
export function streak(dates, timezone, now = new Date()) {
  const days = new Set(dates.map(d => calendarDay(d, timezone)));
  let day = calendarDay(now, timezone), count = 0;
  if (!days.has(day)) day = previousDay(day);
  while (days.has(day)) { count++; day = previousDay(day); }
  return count;
}
