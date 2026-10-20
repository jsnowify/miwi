import { resolve } from 'node:path';
import express from 'express';
import { createRuntime } from './runtime.js';

const { app, client } = await createRuntime();
app.use(express.static(resolve('dist'), { index: false }));
app.get('/{*path}', (req, res) => res.sendFile(resolve('dist/index.html')));
const server = app.listen(Number(process.env.PORT || 3001), '0.0.0.0', () => console.log('Miwi server ready'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(async () => { await client.close(); process.exit(0); }));
