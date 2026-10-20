# Existing-data transition

The application has no Supabase runtime dependency. The local `.env` was not
changed, and the old database and storage are not deleted by any script.

1. Take an operator-controlled backup/export of the old database, authentication
   user identities and storage objects. Keep an immutable copy outside the repo.
   Put the source behind a maintenance/read-only window for final cutover.
2. Prepare a JSON file containing arrays `users`, `profiles`, `circles`,
   `circle_members`, `posts`, and optionally `reactions`, `notifications`,
   `memories`, `media`, `user_preferences`. These match the old table names.
   Each user requires an ID and email; omit password hashes, access tokens,
   refresh tokens and provider secrets. Profiles require ID, username and name.
   `scripts/import-legacy.js` defines exact schemas and defaults.
3. For images, supply `media` entries with stable `id`, `post_id`, `owner_id`,
   MIME `type`, and base64 `data`. Existing source attachments are never fetched
   using public URLs. Unsupported/missing attachment exports produce warnings;
   resolve them before cutover. Keep source avatar assets in the backup.
   Compatible music preview metadata is preserved; unsupported formats produce warnings.
4. Run a dry run (no connection or writes required):

   ```powershell
   node scripts/import-legacy.js C:\backups\miwi-export.json
   ```

5. Inspect counts, relationship validation and warnings. Legacy close-friends
   flags do not identify a reliable historical audience. Provide explicit
   `audience_ids` on those posts, or they import as author-only. They are never
   silently broadened. Direct posts require their original `recipient_id`.
6. Configure MongoDB credentials and apply to a staging Atlas replica set first:

   ```powershell
   node --env-file=.env scripts/import-legacy.js C:\backups\miwi-export.json --apply
   ```

   Writes use `$setOnInsert` and a transaction. Repeating the same import does
   not duplicate or overwrite existing documents. IDs, ownership and reference
   counts are validated. Conflicting auth identities/usernames stop the import.
   Keep exports small enough for a MongoDB transaction; split a very large
   migration using an explicitly reviewed migration procedure.
7. Configure SMTP and the public Better Auth origin. Imported users receive
   deterministic Better Auth identities, but **no credential accounts or hashes**.
   Ask them to request a password reset from the login page. Better Auth creates
   their credential account only after a valid single-use reset token is used.
   There is no shared temporary password and no automatic email blast.
8. Verify records and user journeys in staging, including restricted posts and
   media, then repeat against the intended destination with a fresh final export
   if no records have already been imported there. Since imports deliberately do
   not overwrite, a new export does not synchronize already imported changes.
   Keep the final source frozen throughout cutover.

The test suite checks repeated import counts, invalid relationships, historical
audience behavior and a full imported-account password-reset/sign-in transition.
It captures mail through a test transport; actual SMTP delivery is a separate
deployment check. No live source export or Atlas destination was available during
development, so no production migration has been executed.
