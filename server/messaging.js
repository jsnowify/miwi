import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { assert, idSchema, requireMember } from './policy.js';

// Conversations belong to a circle. Leaving/removal revokes access to its chats.
export function registerMessaging(app, { db, client, profile }) {
  const conversations = db.collection('chat_conversations');
  const messages = db.collection('chat_messages');
  const reads = db.collection('chat_reads');
  async function transaction(fn) {
    const session = client.startSession();
    try { return await session.withTransaction(() => fn(session)); } finally { await session.endSession(); }
  }
  async function lockCircle(circleId, session) {
    await db.collection('circles').updateOne({ id: circleId }, { $inc: { revision: 1 } }, { session });
  }
  async function requireConversation(id, userId, session = undefined) {
    const conversation = await conversations.findOne({ id }, { session });
    assert(conversation);
    await requireMember(db, conversation.circle_id, userId, { session });
    assert(conversation.kind === 'circle' || conversation.participant_ids.includes(userId));
    return conversation;
  }
  const messageDTO = message => ({ id: message.id, conversation_id: message.conversation_id, author_id: message.author_id, text: message.text, sequence: message.sequence, created_at: message.created_at });
  async function conversationDTO(conversation, userId) {
    const [circle, last, read] = await Promise.all([
      db.collection('circles').findOne({ id: conversation.circle_id }),
      messages.findOne({ conversation_id: conversation.id }, { sort: { sequence: -1 } }),
      reads.findOne({ conversation_id: conversation.id, user_id: userId }),
    ]);
    const otherId = conversation.kind === 'direct' ? conversation.participant_ids.find(id => id !== userId) : null;
    return { id: conversation.id, circle_id: conversation.circle_id, kind: conversation.kind,
      circle_name: circle.name, circle_emoji: circle.cover_color,
      other: otherId ? await profile(otherId) : null,
      last_message: last ? messageDTO(last) : null,
      unread: await messages.countDocuments({ conversation_id: conversation.id, sequence: { $gt: read?.last_read_sequence || 0 }, author_id: { $ne: userId } }),
      updated_at: conversation.updated_at,
    };
  }
  app.get('/api/conversations', async (req, res) => {
    const memberships = await db.collection('circle_memberships').find({ user_id: req.user.id }).toArray();
    const rows = await conversations.find({ circle_id: { $in: memberships.map(m => m.circle_id) }, $or: [{ kind: 'circle' }, { participant_ids: req.user.id }] }).sort({ updated_at: -1, id: -1 }).limit(100).toArray();
    res.json(await Promise.all(rows.map(row => conversationDTO(row, req.user.id))));
  });
  app.post('/api/conversations', async (req, res) => {
    const body = z.discriminatedUnion('kind', [
      z.object({ kind: z.literal('direct'), circleId: idSchema, recipientId: idSchema }).strict(),
      z.object({ kind: z.literal('circle'), circleId: idSchema }).strict(),
    ]).parse(req.body);
    let conversation;
    await transaction(async session => {
      await lockCircle(body.circleId, session);
      await requireMember(db, body.circleId, req.user.id, { session });
      const participant_ids = body.kind === 'direct' ? [req.user.id, body.recipientId].sort() : [];
      if (body.kind === 'direct') {
        assert(body.recipientId !== req.user.id, 400, 'Choose a friend to message.');
        await requireMember(db, body.circleId, body.recipientId, { session });
      }
      const key = body.kind === 'direct' ? JSON.stringify(participant_ids) : 'circle';
      conversation = await conversations.findOneAndUpdate({ circle_id: body.circleId, key }, { $setOnInsert: {
        id: randomUUID(), kind: body.kind, participant_ids, sequence: 0, created_at: new Date(), updated_at: new Date(),
      } }, { upsert: true, returnDocument: 'after', session });
    });
    res.json(await conversationDTO(conversation, req.user.id));
  });
  app.get('/api/conversations/:id/messages', async (req, res) => {
    await requireConversation(req.params.id, req.user.id);
    const { before } = z.object({ before: z.coerce.number().int().min(1).max(Number.MAX_SAFE_INTEGER).optional() }).parse(req.query);
    const rows = await messages.find({ conversation_id: req.params.id, ...(before ? { sequence: { $lt: before } } : {}) }).sort({ sequence: -1 }).limit(51).toArray();
    const more = rows.length > 50; if (more) rows.pop();
    res.json({ messages: rows.map(messageDTO), nextBefore: more ? rows.at(-1).sequence : null });
  });
  app.post('/api/conversations/:id/messages', async (req, res) => {
    const body = z.object({ text: z.string().trim().min(1).refine(value => Array.from(value).length <= 2000, 'Messages can have up to 2,000 characters.'), clientId: z.uuid() }).strict().parse(req.body);
    const bucket = `${req.user.id}:messages:${Math.floor(Date.now() / 60000)}`;
    const rate = await db.collection('rate_limits').findOneAndUpdate({ _id: bucket }, { $inc: { count: 1 }, $setOnInsert: { expires_at: new Date(Date.now() + 120000) } }, { upsert: true, returnDocument: 'after' });
    assert(rate.count <= 60, 429, 'Please wait a minute before sending another message.');
    let message;
    await transaction(async session => {
      const conversation = await requireConversation(req.params.id, req.user.id, session);
      await lockCircle(conversation.circle_id, session);
      if (conversation.kind === 'direct') for (const id of conversation.participant_ids) await requireMember(db, conversation.circle_id, id, { session });
      message = await messages.findOne({ conversation_id: conversation.id, author_id: req.user.id, client_id: body.clientId }, { session });
      if (message) { assert(message.text === body.text, 409, 'This message request was already used.'); return; }
      const updated = await conversations.findOneAndUpdate({ id: conversation.id }, { $inc: { sequence: 1 }, $set: { updated_at: new Date() } }, { returnDocument: 'after', session });
      message = { id: randomUUID(), conversation_id: conversation.id, author_id: req.user.id, client_id: body.clientId, text: body.text, sequence: updated.sequence, created_at: new Date() };
      await messages.insertOne({ ...message }, { session });
    });
    res.json(messageDTO(message));
  });
  app.put('/api/conversations/:id/read', async (req, res) => {
    const { messageId } = z.object({ messageId: z.uuid() }).strict().parse(req.body);
    await requireConversation(req.params.id, req.user.id);
    const message = await messages.findOne({ conversation_id: req.params.id, id: messageId }); assert(message);
    await reads.updateOne({ conversation_id: req.params.id, user_id: req.user.id }, { $max: { last_read_sequence: message.sequence }, $set: { updated_at: new Date() } }, { upsert: true });
    res.json({ ok: true });
  });
}
