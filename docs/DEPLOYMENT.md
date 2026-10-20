# Production deployment

## Vercel serverless

The Vercel configuration deploys the Vite build to the CDN and routes `/api`
requests to `api/index.js`, a Node function in Singapore. The function reuses
its initialized Express app and MongoDB pool between warm requests and retries
after failed initialization. Durable sessions, messages and media remain in Atlas.

Use Node 24 and set these server-only Production variables in Vercel:
`MONGODB_URI`, `MONGODB_DB=miwi`, a fresh `BETTER_AUTH_SECRET`, and
`BETTER_AUTH_URL=https://YOUR-PRODUCTION-DOMAIN`. Set `NODE_ENV=production`.
Keep the auth origin exact; never derive it from an untrusted request header.
Do not give Preview deployments access to the production database or secret.

Atlas network access must permit the function's outbound connections. Standard
serverless egress can vary; use provider static outbound IPs when available,
or deliberately configure Atlas public network access with a database-scoped
user and TLS. The repository does not change the Atlas access list automatically.
Uploads remain limited to 2 MB before base64 encoding, within the function's
request limit. Chat uses short authenticated polling requests.

`npm run dev` still starts the entire app locally. No Vercel login is required
for local development. Tests use an isolated MongoDB replica set.

## Persistent Node alternative

Deploy the GitHub repository `jsnowify/miwi`, branch `main`, as one Render
web service in Singapore. The server serves the React build and `/api` together.

- Runtime: Node 24 (`NODE_VERSION=24`).
- Build: `npm ci --include=dev && npm run build`.
- Start: `npm start`.
- Health endpoint: `/api/health`.
- Environment: `NODE_ENV=production`, `MONGODB_URI`, `MONGODB_DB=miwi`,
  and a fresh random `BETTER_AUTH_SECRET` of at least 32 characters.
- Render's `RENDER_EXTERNAL_URL` supplies the HTTPS auth origin automatically.
  Override `BETTER_AUTH_URL` with the exact public HTTPS origin for a custom domain.
- Configure `TRUSTED_PROXY` only for the hosting platform's trusted ingress.
- Copy the service's outbound IP ranges from Render's Connect > Outbound panel
  into the Atlas project's network access list before starting the API.
- Optional password reset email: `SMTP_URL` and `MAIL_FROM`.

Keep secrets in the hosting environment, never in Git. Local `.env` is ignored.
Atlas stores user data and media, so no Render persistent disk is required.
Existing Atlas data must be retained during redeployments.

A Free service can sleep when idle and take time to wake. Use an appropriate
paid compute plan when continuous availability is needed.

After deployment, verify the landing page, `/api/health`, session endpoint,
sign-in with secure cookies, and authenticated Messages. A build alone does not
confirm that the database connection or user session works.
