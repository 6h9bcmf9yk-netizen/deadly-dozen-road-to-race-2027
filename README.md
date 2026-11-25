# DEADLY DOZEN — Road to Race 2027

Mobile-first team training PWA for two athletes preparing for the Deadly Sprint in Sindelfingen on 20 March 2027. The 16-week plan begins 30 November 2026.

## Development

- `npm ci`
- `npm run dev`
- `npm run build`
- `npm test`

## Host on GitHub Pages

Create a **public** repository named `deadly-dozen-road-to-race-2027`, push this project to branch `main`, then open **Settings → Pages** and select **GitHub Actions** as the source. `.github/workflows/deploy.yml` builds and publishes the app on each push. The build uses the repository-specific base path. When the Pages workflow succeeds the URL is `https://<your-github-login>.github.io/deadly-dozen-road-to-race-2027/`.

## Shared Supabase setup (free tier, account actions required)

A hosted Supabase project is required for two-phone synchronization. Current Supabase Free includes Auth and a Postgres database (500 MB, 50,000 MAU); inactive free projects can pause after one week. Review current terms at <https://supabase.com/pricing>.

1. Create a Supabase project.
2. In SQL Editor, run `supabase/migrations/202611250001_team_sync.sql`.
3. In **Project Settings → API**, copy the Project URL and the public anon/publishable key. Never use a service-role key in the app.
4. In app Settings, enter URL/key and save. Create an account for each athlete, confirm email if required, sign in, then one athlete creates the team and shares the generated invite code privately. The other signs in and joins with the code.
5. Use **Settings → Sync now** or re-open the app while online to fetch data.

The migration limits each team to two members, protects all records with RLS, and exposes no data to anonymous visitors. Invite codes are random and should only be sent directly to the training partner. GitHub Pages is public hosting for the application shell; training data is not committed to the repository.

## Data & offline use

Records save immediately in browser local storage and export to JSON or CSV. The service worker caches the plan/app shell, so the plan opens offline. Locally recorded changes remain on the device while offline and sync after reconnection. For team use, sign into Supabase on each phone; make regular JSON exports as independent backups. Import merges records by ID.

The current client prepares per-record synchronization and does not upload data until a signed-in user has joined a team. Review Supabase's RLS policies before changing the schema. No secrets are stored in source.

## PWA install (iPhone)

Open the deployed link in Safari → Share → **Add to Home Screen** → Add. The service worker and manifest provide the app shell; iOS may limit background execution, but timers compute elapsed time from system timestamps after returning to the app.

## Competition rules

Official German event page: <https://deadlydozen.de/sprint>. Official current rulebook: <https://www.deadlydozen.com/rulebook>. The event page lists the 12 × 200 m runs, women's loads and half reps/distances. Check the current book for movement standards, penalties and exact equipment rules before race day. Parameters can be changed in the app as event details evolve.
