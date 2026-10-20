import { connectDatabase, createIndexes, forgetConnection } from './db.js';
import { createAuth } from './auth.js';
import { createApp } from './app.js';

// Shared by the production server and Vite's in-process development API.
export async function createRuntime(environment = process.env) {
  environment = { ...environment, BETTER_AUTH_URL: environment.BETTER_AUTH_URL || environment.RENDER_EXTERNAL_URL || 'http://localhost:5173' };
  if (environment.NODE_ENV === 'production' && !environment.BETTER_AUTH_URL.startsWith('https://')) {
    throw new Error('Production requires an HTTPS BETTER_AUTH_URL.');
  }
  const { db, client } = await connectDatabase(environment.MONGODB_URI, environment.MONGODB_DB || 'miwi');
  try {
    await createIndexes(db);
    const auth = createAuth(db, client, environment);
    const app = createApp({ db, client, auth, origin: environment.BETTER_AUTH_URL || 'http://localhost:5173', production: environment.NODE_ENV === 'production', environment });
    return { app, db, client };
  } catch (error) {
    forgetConnection(environment.MONGODB_URI);
    await client.close();
    throw error;
  }
}
