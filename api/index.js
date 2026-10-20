import { createRuntime } from '../server/runtime.js';

// Share initialization and the database pool across concurrent warm invocations.
let runtime;
export default async function handler(req, res) {
  runtime ??= createRuntime().catch(error => { runtime = undefined; throw error; });
  try {
    const { app } = await runtime;
    return app(req, res);
  } catch {
    res.setHeader('Cache-Control', 'private, no-store');
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Miwi is reconnecting. Please try again shortly.' }));
  }
}
