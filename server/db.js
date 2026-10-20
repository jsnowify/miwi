import { MongoClient } from 'mongodb';

const connections = globalThis.__miwiConnections ??= new Map();
export function forgetConnection(uri) { connections.delete(uri); }
export async function connectDatabase(uri = process.env.MONGODB_URI, name = process.env.MONGODB_DB || 'miwi') {
  if (!uri) throw new Error('MONGODB_URI is required. Configure a MongoDB Atlas replica set.');
  if (!connections.has(uri)) {
    const client = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 10000, timeoutMS: 15000 });
    connections.set(uri, client.connect().catch(error => { connections.delete(uri); throw error; }));
  }
  const client = await connections.get(uri);
  return { client, db: client.db(name) };
}
export async function createIndexes(db) {
  const definitions = {
    profiles: [[{ id: 1 }, { unique: true }], [{ username: 1 }, { unique: true, partialFilterExpression: { username: { $type: 'string' } } }]],
    circles: [[{ id: 1 }, { unique: true }]],
    circle_memberships: [[{ circle_id: 1, user_id: 1 }, { unique: true }], [{ user_id: 1 }, {}]],
    circle_invitations: [[{ token_hash: 1 }, { unique: true }], [{ circle_id: 1 }, {}], [{ expires_at: 1 }, { expireAfterSeconds: 0 }]],
    close_friend_lists: [[{ circle_id: 1, user_id: 1 }, { unique: true }]],
    mood_posts: [[{ id: 1 }, { unique: true }], [{ circle_id: 1, created_at: -1, id: -1 }, {}], [{ author_id: 1, created_at: -1 }, {}]],
    post_reactions: [[{ post_id: 1, user_id: 1 }, { unique: true }]],
    notifications: [[{ id: 1 }, { unique: true }], [{ recipient_id: 1, created_at: -1 }, {}], [{ event_key: 1 }, { unique: true, sparse: true }]],
    monthly_memories: [[{ user_id: 1, month: 1, timezone: 1 }, { unique: true }]],
    user_preferences: [[{ user_id: 1 }, { unique: true }]],
    user: [[{ email: 1 }, { unique: true }]],
    session: [[{ token: 1 }, { unique: true }], [{ expiresAt: 1 }, { expireAfterSeconds: 0 }]],
    account: [[{ userId: 1 }, {}]],
    verification: [[{ identifier: 1 }, {}], [{ expiresAt: 1 }, { expireAfterSeconds: 0 }]],
    rate_limits: [[{ expires_at: 1 }, { expireAfterSeconds: 0 }]],
    media: [[{ id: 1 }, { unique: true }], [{ owner_id: 1, created_at: -1 }, {}], [{ post_id: 1 }, {}]],
    chat_conversations: [[{ id: 1 }, { unique: true }], [{ circle_id: 1, key: 1 }, { unique: true }], [{ circle_id: 1, updated_at: -1 }, {}]],
    chat_messages: [[{ id: 1 }, { unique: true }], [{ conversation_id: 1, sequence: -1 }, { unique: true }], [{ conversation_id: 1, author_id: 1, client_id: 1 }, { unique: true }]],
    chat_reads: [[{ conversation_id: 1, user_id: 1 }, { unique: true }]],
  };
  for (const [collection, indexes] of Object.entries(definitions)) {
    for (const [key, options] of indexes) await db.collection(collection).createIndex(key, options);
  }
}
