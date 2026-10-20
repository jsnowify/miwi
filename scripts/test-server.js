// Isolated browser-test infrastructure. Never used by the application start command.
import express from 'express';
import { resolve } from 'node:path';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { createIndexes } from '../server/db.js';
import { createAuth } from '../server/auth.js';
import { createApp } from '../server/app.js';
const mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 }, binary: { version: '8.2.6' } });
const client = await new MongoClient(mongo.getUri()).connect(), db = client.db('miwi_browser');
await createIndexes(db);
const origin = 'http://localhost:4173';
const auth = createAuth(db, client, { BETTER_AUTH_SECRET: 'browser-test-only-secret-at-least-32-characters', BETTER_AUTH_URL: origin });
const app = createApp({ db, client, auth, origin });
app.use(express.static(resolve('dist')));
app.get('/{*path}', (req, res) => res.sendFile(resolve('dist/index.html')));
const server = app.listen(4173, () => console.log('Miwi browser test server ready'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(async () => { await client.close(); await mongo.stop(); process.exit(0); }));
