import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import handler from '../api/index.js';
import { connectDatabase, forgetConnection } from '../server/db.js';

test('serverless API retries failed startup and preserves secure sessions across requests', { timeout: 60000 }, async () => {
  const mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 }, binary: { version: '8.2.6' } });
  const environment = { MONGODB_URI: mongo.getUri(), MONGODB_DB: 'miwi_serverless', BETTER_AUTH_SECRET: 'isolated-serverless-test-secret-at-least-32-characters', BETTER_AUTH_URL: 'https://miwi.example.com', NODE_ENV: 'production' };
  const previous = Object.fromEntries(Object.keys(environment).map(key => [key, process.env[key]]));
  const server = createServer(handler);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    Object.assign(process.env, environment);
    delete process.env.MONGODB_URI;
    const failed = await fetch(`${base}/api/health`);
    assert.equal(failed.status, 503);
    assert(!(await failed.text()).includes(environment.BETTER_AUTH_SECRET));
    process.env.MONGODB_URI = environment.MONGODB_URI;
    const health = await Promise.all(Array.from({ length: 5 }, () => fetch(`${base}/api/health`)));
    assert(health.every(r => r.status === 200));
    assert.equal((await fetch(`${base}/api/conversations`)).status, 401);
    const payload = JSON.stringify({ name: 'Serverless test', email: 'isolated@miwi.test', password: 'isolated-test-password-123' });
    const rejected = await fetch(`${base}/api/auth/sign-up/email`, { method: 'POST', headers: { origin: 'https://other.example.com', 'content-type': 'application/json' }, body: payload });
    assert.equal(rejected.status, 403);
    const signup = await fetch(`${base}/api/auth/sign-up/email`, { method: 'POST', headers: { origin: environment.BETTER_AUTH_URL, 'content-type': 'application/json' }, body: payload });
    assert.equal(signup.status, 200);
    const cookies = signup.headers.getSetCookie();
    assert(cookies.some(c => /Secure/i.test(c) && /HttpOnly/i.test(c)));
    const cookie = cookies.map(c => c.split(';')[0]).join('; ');
    const session = await fetch(`${base}/api/auth/get-session`, { headers: { cookie } });
    assert.equal(session.status, 200);
    assert.equal((await session.json()).user.email, 'isolated@miwi.test');
    const conversations = await fetch(`${base}/api/conversations`, { headers: { cookie } });
    assert.equal(conversations.status, 200);
    assert.match(conversations.headers.get('cache-control'), /no-store/);
  } finally {
    await new Promise(resolve => server.close(resolve));
    const { client } = await connectDatabase(environment.MONGODB_URI, environment.MONGODB_DB);
    await client.close(); forgetConnection(environment.MONGODB_URI);
    for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
    await mongo.stop();
  }
});
