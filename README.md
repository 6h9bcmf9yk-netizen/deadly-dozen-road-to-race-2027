# DEADLY DOZEN — Road to Race 2027

Mobile-first team training PWA for two athletes preparing for the Women’s Doubles Deadly Sprint in Sindelfingen on 20 March 2027. **Version 1.1.1** · The 11-week specific plan starts Monday, 4 January 2027.

## Version 1.1.1

- Replaced the former 16-week calendar with an 11-week periodization from 4 January to race day. Before 4 January the dashboard counts down to training start; optional logs and tests remain available.
- Added station-by-station strategies with any number of athlete segments, exact workload validation, named variants, a qualitative fatigue/safety/next-run assessment, and tested-versus-planned status.
- Added segment and strategy trials with load, exact repetitions or distance, fatigue context, previous work, RPE for both partners, grip/shoulder fatigue, switch time and run impact. Strategy comparisons require matched conditions and repeated trials; there is no linear extrapolation from partial reps.
- Expanded Race Mode for live athlete changes, section workload, remaining reps/metres, switch timing, spontaneous changes and planned-versus-actual simulation records.
- Kept the data shape additive. Existing local records, race settings and accounts are retained; the new strategy fields live in the existing JSON payload. No database schema migration is needed.
- Added persistent top navigation for tablet and desktop while retaining the bottom navigation on phones.
- Updated service-worker cache version to refresh the installed PWA.

## Development and checks

- `npm ci`
- `npm run dev`
- `npm run build`
- `npm test`

## GitHub Pages deployment

The existing repository is `6h9bcmf9yk-netizen/deadly-dozen-road-to-race-2027`. Its `main` branch deploys through `.github/workflows/deploy.yml` using the repository-specific Vite base path. The published URL remains <https://6h9bcmf9yk-netizen.github.io/deadly-dozen-road-to-race-2027/>.

## Shared Supabase setup

Two-phone synchronization requires the team’s own Supabase project. The existing SQL migration `supabase/migrations/202611250001_team_sync.sql` creates the two-person team, membership, record tables and RLS policies. Version 1.1.0 uses those same tables and keeps new strategy/simulation fields in existing JSON payloads, so do not reset the project or rerun schema changes against production data.

1. Create a Supabase project.
2. If this is a new project, run the SQL migration in Supabase SQL Editor. If the project was already configured for version 1.0.0, keep it as is.
3. In **Project Settings → API**, copy the Project URL and public anon/publishable key. Never use a service-role key in the app.
4. On each phone, enter URL/key in app Settings, register or sign in, then one athlete creates the team and privately shares the invite code. The other athlete joins that team.
5. The header sync badge reports local, pending or synchronized state. Use **Sync now** while online if needed.

Until a Supabase project, accounts and team membership are configured, records stay in that browser’s local storage. GitHub Pages serves only the public app shell; it does not contain private training data. Keep JSON backups before device changes. JSON import merges by record ID.

## Offline use and iPhone installation

The service worker caches the application shell and assets. A previously opened app can display the plan offline; edits are stored locally and sync after connection returns. On iPhone, open the published link in Safari → **Share** → **Add to Home Screen** → **Add**. iOS may suspend scripts in the background; Race Mode derives elapsed time from timestamps when the app resumes.

## Official event rules

- Event-specific Sprint page: <https://deadlydozen.de/sprint> — 12 × 200 m (2.4 km), Sprint Women’s loads and half the standard reps/distances.
- Current rulebook: <https://www.deadlydozen.com/rulebook>.
- Official Judge Pack movement notes and Pairs handling: <https://www.deadlydozen.com/judgepack>.

The event page says Pairs share the Labour work flexibly and run together. The international Judge Pack says pairs remain together, stay stationary during rests and place equipment on the floor instead of handing it over. We found no official requirement for the exact partner-exchange point within a Labour; local race briefings and the current rulebook take precedence. The app records this uncertainty instead of asserting a made-up rule.
