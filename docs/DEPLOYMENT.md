# Production deployment

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
