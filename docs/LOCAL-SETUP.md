# Configured local Atlas connection

The local `.env` is configured for the dedicated **miwi** Atlas project and its
free **miwi** cluster in AWS Singapore. The `miwi_app` database user has
`readWrite` access only to the `miwi` database and is scoped to this cluster.
Credentials are stored in the ignored local environment file and are not
included here. Existing environment credentials were preserved.

The computer's current public IP is on the project's network access list.
If the network/public IP changes, update that entry in Atlas. The app uses
Atlas's standard TLS replica-set connection string because this computer's
default DNS resolver refuses SRV queries. TLS remains enabled.

Run `npm run dev` and open **http://localhost:5173**. Vite serves both the UI and
API in the same development process; a separate port-3001 server is not needed.
Create your own account on `/signup`; no example accounts were created.

Verified on October 20, 2026: direct Atlas connection, database index creation,
the app's `/api/health` on Vite's own port, and the session endpoint.
SMTP is not configured, so password reset delivery remains unavailable.
No Supabase export was supplied and no existing user data was migrated.

Atlas project:
https://cloud.mongodb.com/v2/6ad6e53da1e8d32d89e60f8a
