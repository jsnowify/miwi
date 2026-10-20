import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { createServer } from 'vite';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { connectDatabase, forgetConnection } from '../server/db.js';

test('Vite starts the UI and authenticated API together without a separate backend', { timeout: 60000 }, async () => {
  const mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 }, binary: { version: '8.2.6' } });
  const environment = { MONGODB_URI: mongo.getUri(), MONGODB_DB: 'miwi_startup', BETTER_AUTH_SECRET: 'isolated-startup-test-secret-at-least-32-characters', BETTER_AUTH_URL: 'http://localhost:5173' };
  const previous = Object.fromEntries(Object.keys(environment).map(key => [key, process.env[key]]));
  Object.assign(process.env, environment);
  let vite;
  try {
    vite = await createServer({ configFile: resolve('vite.config.js'), cacheDir: resolve('node_modules/.vite-startup-test'), server: { host: '127.0.0.1', port: 0, strictPort: true }, logLevel: 'error' });
    await vite.listen();
    const base = `http://127.0.0.1:${vite.httpServer.address().port}`;
    const health = await fetch(`${base}/api/health`);
    assert.equal(health.status, 200); assert.deepEqual(await health.json(), { ok: true });
    const session = await fetch(`${base}/api/auth/get-session`);
    assert.equal(session.status, 200); assert.equal(await session.json(), null);
    assert.equal((await fetch(`${base}/api/conversations`)).status, 401);
    const page = await fetch(base); assert.equal(page.status, 200); assert.match(await page.text(), /\/src\/main.jsx/);
    const component = await fetch(`${base}/src/components/MessagesPanel.jsx`);
    assert.equal(component.status, 200); assert.match(await component.text(), /MessagesPanel/);
    const clientCode = await (await fetch(`${base}/src/lib/auth.js`)).text();
    assert(!clientCode.includes(environment.BETTER_AUTH_SECRET));
    assert(!clientCode.includes(environment.MONGODB_URI));
    const { db } = await connectDatabase(environment.MONGODB_URI, environment.MONGODB_DB);
    assert((await db.listCollections().toArray()).some(c => c.name === 'chat_messages'));
  } finally {
    await vite?.close();
    const { client } = await connectDatabase(environment.MONGODB_URI, environment.MONGODB_DB);
    await client.close(); forgetConnection(environment.MONGODB_URI);
    for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
    await mongo.stop();
  }
});
