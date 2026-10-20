import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { randomUUID } from 'node:crypto';
import { createIndexes } from '../server/db.js';
import { createAuth } from '../server/auth.js';
import { createApp } from '../server/app.js';
import { calendarDay, streak } from '../server/policy.js';
import { prepareImport, executeImport } from '../scripts/import-legacy.js';

let mongo, client, db, server, base;
const origin = 'http://localhost:5173';
const users = {};
async function request(user, path, method = 'GET', body, expected = 200) {
  const response = await fetch(`${base}/api${path}`, { method, headers: { Origin: origin, ...(user ? { Cookie: users[user].cookie } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const data = await response.json();
  assert.equal(response.status, expected, `${method} ${path}: ${JSON.stringify(data)}`);
  return data;
}
before(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 }, binary: { version: '8.2.6' } });
  client = await new MongoClient(mongo.getUri()).connect(); db = client.db('miwi_test'); await createIndexes(db);
  const auth = createAuth(db, client, { BETTER_AUTH_SECRET: 'test-only-secret-with-at-least-32-characters', BETTER_AUTH_URL: origin });
  server = createApp({ db, client, auth, origin }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve)); base = `http://127.0.0.1:${server.address().port}`;
  for (const name of ['alice', 'bob', 'cara', 'outsider']) {
    const response = await fetch(`${base}/api/auth/sign-up/email`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `${name}@example.com`, password: 'a-secure-test-password-123', name }) });
    const data = await response.json(); assert.equal(response.status, 200, JSON.stringify(data));
    users[name] = { id: data.user.id, cookie: response.headers.getSetCookie().map(s => s.split(';')[0]).join('; ') };
    // Fixture registration is not an end-user burst. Keep production auth limits enabled.
    await db.collection('rateLimit').deleteMany({});
  }
}, { timeout: 180000 });
after(async () => { if (server) await new Promise(resolve => server.close(resolve)); await client?.close(); await mongo?.stop(); });

test('calendar days handle DST, duplicate days, yesterday grace and date boundaries', () => {
  assert.equal(calendarDay('2026-03-08T07:30:00Z', 'America/New_York'), '2026-03-08');
  assert.equal(streak(['2026-03-07T18:00Z', '2026-03-08T18:00Z', '2026-03-08T20:00Z'], 'America/New_York', new Date('2026-03-09T18:00Z')), 2);
  assert.equal(streak(['2026-03-07T18:00Z'], 'America/New_York', new Date('2026-03-10T18:00Z')), 0);
  assert.equal(calendarDay('2026-10-01T17:00Z', 'Asia/Manila'), '2026-10-02');
});
test('private social journey, snapshots, revocation, notifications and atomic invitations', async () => {
  await request(null, '/circles', 'GET', undefined, 401);
  const circle = await request('alice', '/circles', 'POST', { name: 'Our little circle' }, 201);
  const other = await request('outsider', '/circles', 'POST', { name: 'Elsewhere' }, 201);
  const join = async user => {
    const invite = await request('alice', `/circles/${circle.id}/invitations`, 'POST', {}, 201);
    await request(user, '/invitations/accept', 'POST', { token: invite.token }); return invite;
  };
  const invitation = await join('bob'); await request('cara', '/invitations/accept', 'POST', { token: invitation.token }, 400);
  await join('cara');
  await request('bob', `/circles/${circle.id}/members/${users.outsider.id}`, 'PATCH', { role: 'owner' }, 403);
  await request('bob', `/circles/${circle.id}/invitations`, 'POST', {}, 403);
  await request('alice', `/circles/${circle.id}/close-friends`, 'PUT', { memberIds: [users.bob.id] });
  const post = (scope, recipientId) => request('alice', '/posts', 'POST', { circleId: circle.id, moodLabel: 'calm', caption: 'A quiet cup of tea', scope, ...(recipientId ? { recipientId } : {}) }, 201);
  const whole = await post('circle'), close = await post('close_friends'), direct = await post('one_person', users.bob.id);
  for (const p of [whole, close, direct]) await request('outsider', `/posts/${p.id}`, 'GET', undefined, 404);
  await request('outsider', `/posts?circleId=${circle.id}`, 'GET', undefined, 404);
  await request('cara', `/posts/${close.id}`, 'GET', undefined, 404);
  await request('cara', `/posts/${direct.id}`, 'GET', undefined, 404);
  await request('alice', `/circles/${circle.id}/close-friends`, 'PUT', { memberIds: [users.bob.id, users.cara.id] });
  await request('cara', `/posts/${close.id}`, 'GET', undefined, 404);
  assert.equal((await request('cara', `/posts?circleId=${circle.id}`)).posts.length, 1);
  await request('cara', `/posts/${close.id}/reaction`, 'PUT', { reaction: '🤍' }, 404);
  await request('bob', `/posts/${whole.id}`, 'PATCH', { caption: 'forged', moodLabel: 'low' }, 403);
  await request('bob', `/posts/${whole.id}`, 'DELETE', undefined, 403);
  await request('alice', '/posts', 'POST', { circleId: circle.id, moodLabel: 'calm', caption: 'x'.repeat(281) }, 400);
  await request('alice', '/posts', 'POST', { circleId: circle.id, moodLabel: 'calm', author_id: users.bob.id }, 400);
  await request('alice', '/posts', 'POST', { circleId: other.id, moodLabel: 'calm' }, 404);
  await request('alice', '/posts', 'POST', { circleId: circle.id, moodLabel: 'calm', scope: 'one_person', recipientId: users.outsider.id }, 404);
  await request('alice', '/posts', 'POST', { circleId: { $ne: null }, moodLabel: 'calm' }, 400);
  await request('bob', `/posts/${close.id}/reaction`, 'PUT', { reaction: '🤍' });
  await request('bob', `/posts/${close.id}/reaction`, 'PUT', { reaction: '🌸' });
  assert.equal(await db.collection('post_reactions').countDocuments({ post_id: close.id }), 1);
  assert.equal((await request('bob', `/posts/${close.id}`)).reactions.length, 0);
  assert.equal((await request('alice', `/posts/${close.id}`)).reactions[0].user_id, users.bob.id);
  assert.equal((await request('cara', '/notifications')).length, 0);
  let notifications = await request('alice', '/notifications'); assert(notifications.some(n => n.type === 'reaction_received'));
  const reactionNotification = notifications.find(n => n.type === 'reaction_received');
  await request('alice', '/notifications/read', 'PATCH', { id: reactionNotification.id });
  assert((await request('alice', '/notifications')).find(n => n.id === reactionNotification.id).is_read);
  const stories = await request('cara', `/circles/${circle.id}/stories?timezone=Asia%2FManila`);
  assert.equal(stories.find(s => s.author.id === users.alice.id).post_id, whole.id);
  await request('alice', `/posts/${whole.id}`, 'DELETE');
  assert.equal((await request('cara', `/circles/${circle.id}/stories`)).find(s => s.author.id === users.alice.id).post_id, null);
  await request('bob', `/posts/${close.id}/reaction`, 'PUT', { reaction: null });
  assert.equal(await db.collection('post_reactions').countDocuments({ post_id: close.id }), 0);
  await request('alice', `/circles/${circle.id}/members/${users.bob.id}`, 'DELETE');
  for (const p of [close, direct]) await request('bob', `/posts/${p.id}`, 'GET', undefined, 404);
  await request('bob', `/posts/${close.id}/reaction`, 'PUT', { reaction: '🤍' }, 404);
  const revoked = await request('alice', `/circles/${circle.id}/invitations`, 'POST', {}, 201);
  await request('alice', `/circles/${circle.id}/invitations/${revoked.id}`, 'DELETE');
  await request('outsider', '/invitations/accept', 'POST', { token: revoked.token }, 400);
  const expired = await request('alice', `/circles/${circle.id}/invitations`, 'POST', {}, 201);
  await db.collection('circle_invitations').updateOne({ id: expired.id }, { $set: { expires_at: new Date(0) } });
  await request('outsider', '/invitations/accept', 'POST', { token: expired.token }, 400);
  const raced = await request('alice', `/circles/${circle.id}/invitations`, 'POST', {}, 201);
  const race = await Promise.all(['bob','outsider'].map(name => fetch(`${base}/api/invitations/accept`, { method: 'POST', headers: { Origin: origin, Cookie: users[name].cookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ token: raced.token }) })));
  assert.deepEqual(race.map(r => r.status).sort(), [200, 400]);
  await request('alice', `/circles/${circle.id}/members/${users.cara.id}`, 'PATCH', { role: 'owner' });
  await request('alice', `/circles/${circle.id}/members/${users.alice.id}`, 'DELETE');
  assert.equal((await request('alice', '/notifications')).length, 0);
});
test('pagination, monthly recaps, private media and sessions', async () => {
  const circle = await request('alice', '/circles', 'POST', { name: 'Journal' }, 201);
  await request('alice', '/preferences', 'PUT', { timezone: 'Asia/Manila', reactions: true, circle_activity: false });
  for (let i = 0; i < 23; i++) await request('alice', '/posts', 'POST', { circleId: circle.id, moodLabel: 'grateful', caption: `Day ${i}` }, 201);
  const page = await request('alice', `/posts?circleId=${circle.id}`); assert.equal(page.posts.length, 20); assert(page.nextCursor);
  const next = await request('alice', `/posts?circleId=${circle.id}&cursor=${page.nextCursor}`); assert.equal(next.posts.length, 3); assert.equal(next.nextCursor, null);
  assert(!next.posts.some(p => page.posts.some(q => q.id === p.id)));
  const previousMonth = new Date(); previousMonth.setUTCDate(5); previousMonth.setUTCMonth(previousMonth.getUTCMonth() - 1);
  await db.collection('mood_posts').updateMany({ circle_id: circle.id }, { $set: { created_at: previousMonth } });
  const memories = await request('alice', '/memories'); assert.equal(memories[0].total_posts, 23); assert.equal(memories[0].days, 1);
  await request('alice', '/memories'); assert.equal(await db.collection('monthly_memories').countDocuments({ user_id: users.alice.id }), 1);
  await request('outsider', '/memories'); assert.equal((await request('outsider', '/memories')).length, 0);
  const media = await request('alice', '/media', 'POST', { type: 'image/png', data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aNmcAAAAASUVORK5CYII=' }, 201);
  await request('outsider', `/media/${media.id}`, 'GET', undefined, 404);
  const p = await request('alice', '/posts', 'POST', { circleId: circle.id, moodLabel: 'calm', mediaId: media.id }, 201);
  let image = await fetch(`${base}/api/media/${media.id}`, { headers: { Cookie: users.alice.cookie } }); assert.equal(image.status, 200); assert.equal(image.headers.get('cache-control'), 'private, no-store');
  await request('alice', `/posts/${p.id}`, 'DELETE'); await request('alice', `/media/${media.id}`, 'GET', undefined, 404);
  const forged = await fetch(`${base}/api/circles`, { method: 'POST', headers: { Cookie: users.alice.cookie, Origin: 'https://attacker.example', 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'forged' }) }); assert.equal(forged.status, 403);
  await request('alice', '/auth/sign-out', 'POST', {});
  await request('alice', '/profile', 'GET', undefined, 401);
  const signin = await fetch(`${base}/api/auth/sign-in/email`, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'alice@example.com', password: 'a-secure-test-password-123' }) });
  assert.equal(signin.status, 200); users.alice.cookie = signin.headers.getSetCookie().map(s => s.split(';')[0]).join('; ');
  await request('alice', '/profile');
});
test('legacy import is validated, idempotent and supports password-reset account transition', async () => {
  const legacyDb = client.db('miwi_legacy_test'); await createIndexes(legacyDb);
  const source = {
    users: [{ id: 'legacy-alice', email: 'legacy@example.com', email_confirmed_at: '2025-01-01T00:00:00Z' }],
    profiles: [{ id: 'legacy-alice', username: 'legacy_alice', display_name: 'Legacy Alice' }],
    circles: [{ id: 'old-circle', owner_id: 'legacy-alice', name: 'Original circle' }],
    circle_members: [{ circle_id: 'old-circle', user_id: 'legacy-alice', role: 'owner' }],
    posts: [{ id: 'old-post', circle_id: 'old-circle', author_id: 'legacy-alice', mood: 'needing_hug', caption: 'An original day', scope: 'close_friends', created_at: '2025-02-01T00:00:00Z' }],
  };
  const prepared = prepareImport(source); assert.equal(prepared.warnings.length, 1);
  assert.equal(prepared.documents.mood_posts[0].audience_ids.length, 0);
  await executeImport(legacyDb, client, prepared); await executeImport(legacyDb, client, prepared);
  assert.equal(await legacyDb.collection('user').countDocuments(), 1);
  assert.equal(await legacyDb.collection('mood_posts').countDocuments(), 1);
  assert.equal(await legacyDb.collection('account').countDocuments(), 0);
  assert.throws(() => prepareImport({ ...source, circle_members: [{ circle_id: 'unknown', user_id: 'legacy-alice' }] }));
  assert.throws(() => prepareImport({ ...source, reactions: [{ post_id: 'missing', user_id: 'legacy-alice', reaction: 'same' }] }));
  const emails = [];
  const legacyAuth = createAuth(legacyDb, client, { BETTER_AUTH_SECRET: 'legacy-test-only-long-and-private-secret', BETTER_AUTH_URL: origin, MAIL_FROM: 'Miwi <test@example.com>' }, { sendMail: async mail => emails.push(mail) });
  await legacyAuth.api.requestPasswordReset({ body: { email: 'legacy@example.com', redirectTo: `${origin}/reset-password` } });
  assert.equal(emails.length, 1);
  const link = new URL(emails[0].text.match(/https?:\/\/\S+/)[0]);
  const token = link.pathname.split('/').at(-1);
  await legacyAuth.api.resetPassword({ body: { token, newPassword: 'a-new-safe-reset-password' } });
  assert.equal(await legacyDb.collection('account').countDocuments(), 1);
  const login = await legacyAuth.api.signInEmail({ body: { email: 'legacy@example.com', password: 'a-new-safe-reset-password' } });
  assert.equal(login.user.id, prepared.documents.profiles[0].id);
  assert.equal(login.user.name, 'Legacy Alice');
  await assert.rejects(() => legacyAuth.api.resetPassword({ body: { token, newPassword: 'another-safe-test-password' } }));
  assert.equal((await legacyDb.collection('mood_posts').findOne({ id: 'old-post' })).author_id, login.user.id);
});
test('messaging persists, isolates private conversations, paginates and revokes removed members', async () => {
  const circle = await request('alice', '/circles', 'POST', { name: 'Chat circle' }, 201);
  for (const person of ['bob','cara']) {
    const invite = await request('alice', `/circles/${circle.id}/invitations`, 'POST', {}, 201);
    await request(person, '/invitations/accept', 'POST', { token: invite.token });
  }
  await request(null, '/conversations', 'GET', undefined, 401);
  const chat = await request('alice', '/conversations', 'POST', { kind: 'direct', circleId: circle.id, recipientId: users.bob.id });
  const sameChat = await request('bob', '/conversations', 'POST', { kind: 'direct', circleId: circle.id, recipientId: users.alice.id });
  assert.equal(sameChat.id, chat.id);
  await request('alice', '/conversations', 'POST', { kind: 'direct', circleId: circle.id, recipientId: users.outsider.id }, 404);
  await request('alice', '/conversations', 'POST', { kind: 'direct', circleId: circle.id, recipientId: users.alice.id }, 400);
  await request('cara', `/conversations/${chat.id}/messages`, 'GET', undefined, 404);
  await request('outsider', `/conversations/${chat.id}/messages`, 'GET', undefined, 404);
  await request('cara', `/conversations/${chat.id}/messages`, 'POST', { text: 'Intrusion', clientId: randomUUID() }, 404);
  const clientId = randomUUID();
  const message = await request('alice', `/conversations/${chat.id}/messages`, 'POST', { text: 'Hello from our circle', clientId });
  const retry = await request('alice', `/conversations/${chat.id}/messages`, 'POST', { text: 'Hello from our circle', clientId });
  assert.equal(retry.id, message.id);
  assert.equal(await db.collection('chat_messages').countDocuments({ conversation_id: chat.id }), 1);
  await request('alice', `/conversations/${chat.id}/messages`, 'POST', { text: 'Different text', clientId }, 409);
  await request('alice', `/conversations/${chat.id}/messages`, 'POST', { text: 'Forged', clientId: randomUUID(), author_id: users.bob.id }, 400);
  await request('alice', `/conversations/${chat.id}/messages`, 'POST', { text: 'x'.repeat(2001), clientId: randomUUID() }, 400);
  assert.equal((await request('bob', `/conversations/${chat.id}/messages`)).messages[0].text, 'Hello from our circle');
  assert.equal((await request('bob', '/conversations')).find(c => c.id === chat.id).unread, 1);
  assert(!(await request('cara', '/conversations')).some(c => c.id === chat.id));
  await request('cara', `/conversations/${chat.id}/read`, 'PUT', { messageId: message.id }, 404);
  await request('bob', `/conversations/${chat.id}/read`, 'PUT', { messageId: message.id });
  assert.equal((await request('bob', '/conversations')).find(c => c.id === chat.id).unread, 0);
  const reply = await request('bob', `/conversations/${chat.id}/messages`, 'POST', { text: 'Hello back', clientId: randomUUID() });
  assert.equal(reply.author_id, users.bob.id);
  for (let i = 0; i < 50; i++) await request('alice', `/conversations/${chat.id}/messages`, 'POST', { text: `Message ${i}`, clientId: randomUUID() });
  const latest = await request('bob', `/conversations/${chat.id}/messages`); assert.equal(latest.messages.length, 50); assert(latest.nextBefore);
  const older = await request('bob', `/conversations/${chat.id}/messages?before=${latest.nextBefore}`); assert.equal(older.messages.length, 2); assert.equal(older.nextBefore, null);
  assert(!older.messages.some(m => latest.messages.some(n => m.id === n.id)));
  const group = await request('alice', '/conversations', 'POST', { kind: 'circle', circleId: circle.id });
  assert.equal((await request('cara', '/conversations', 'POST', { kind: 'circle', circleId: circle.id })).id, group.id);
  await request('alice', `/conversations/${group.id}/messages`, 'POST', { text: 'Everyone is welcome here', clientId: randomUUID() });
  assert.equal((await request('cara', `/conversations/${group.id}/messages`)).messages[0].text, 'Everyone is welcome here');
  await request('outsider', `/conversations/${group.id}/messages`, 'GET', undefined, 404);
  await request('bob', `/conversations/${group.id}/read`, 'PUT', { messageId: reply.id }, 404);
  await request('alice', `/circles/${circle.id}/members/${users.bob.id}`, 'DELETE');
  await request('bob', `/conversations/${chat.id}/messages`, 'GET', undefined, 404);
  await request('bob', `/conversations/${group.id}/messages`, 'GET', undefined, 404);
  await request('bob', `/conversations/${chat.id}/messages`, 'POST', { text: 'After leaving', clientId: randomUUID() }, 404);
  assert(!(await request('bob', '/conversations')).some(c => c.circle_id === circle.id));
  await request('alice', `/conversations/${chat.id}/messages`, 'POST', { text: 'Recipient has left', clientId: randomUUID() }, 404);
});
