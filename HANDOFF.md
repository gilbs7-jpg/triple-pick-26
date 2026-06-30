# Triple Pick PL — Handoff Prompt

Use this as the opening message when continuing in Claude Projects or a new session.

---

## Handoff Prompt (copy & paste this)

I'm continuing work on **Triple Pick PL**, a Premier League head-to-head prediction game. Here's the full context:

### Repositories & Deployments
- **GitHub:** `github.com/gilbs7-jpg/triple-pick-26`
- **Vercel project:** `triple-pick-26` (ID: `prj_6wIX734Ekq4KRrjg0n1T0aX7hhqo`, team: `jason-gilbert-s-projects1`)
- **Live URL:** `https://triple-pick-26.vercel.app`
- **Supabase project:** `sdegptnzaujmpbrewopw` (region: eu-central-1)

### Stack
- **Next.js 16.2.9** (App Router, Turbopack) — local path `/home/coder/triple-pick-26`
- **Supabase** — auth, database, edge functions
- **Vercel** — hosting + cron jobs
- **Tailwind CSS** + custom design system (dark theme, purple primary `#7b6cf6`)
- **football-data.org API** — fixture/result data (key stored in env vars)

### What's built
1. **Landing page** (`/`) — marketing page with Pick/Play/Win hero, how-it-works section with VS demo cards showing scoring system, testimonials, CTA
2. **Home page** (`/home`) — gameweek banner (countdown to lock, next GW opens date), pick selector (fixture cards showing home vs away, select one team per fixture), standings snapshot, quick nav
3. **Season, Pro, Private, Trophy Room, Hall of Fame pages** — shells with mock data
4. **Team badge system** — SVG hexagon tokens for all 23 teams including Coventry (cov), Hull (hul), Leeds (lee) — defined in `src/lib/team-tokens.ts`
5. **Supabase schema** — `seasons`, `gameweeks`, `fixtures`, `teams`, `team_pools`, `picks`, `results`, `leagues`, `profiles`, `h2h_fixtures`, and more
6. **Fixture sync** — two mechanisms:
   - Vercel cron at 05:00 UTC daily → `/api/cron/sync-fixtures` → full season sync from football-data.org
   - Supabase edge function `sync-live-scores` → runs every 5 min via pg_cron → updates scores for today's matches only
7. **Google Auth** via Supabase (middleware at `src/middleware.ts`)

### Database state
- Season: "Premier League 2026/27" (`is_active = true`)
- 38 gameweeks seeded (all `upcoming`)
- GW1: 10 fixtures, Fri 21 Aug – Mon 24 Aug 2026
- GW2: 10 fixtures, all Sat 29 Aug 2026 at 15:00
- All 380 fixtures seeded from football-data.org
- 23 teams with `short_code` + `external_id` columns

### Key files
- `src/app/page.tsx` — landing page
- `src/app/home/page.tsx` — main game home (async server component, reads from Supabase)
- `src/lib/db.ts` — Supabase data fetching (`getCurrentGameweek`, `getNextGameweek`, `getGameweekFixtures`)
- `src/lib/data.ts` — static mock data (leaderboards, user, PRO fixtures — not yet wired to DB)
- `src/lib/team-tokens.ts` — SVG badge generator
- `src/components/pick-selector.tsx` — fixture card UI, accepts `fixtures` prop
- `src/components/brand.tsx` — Logo + TeamBadge components
- `src/app/api/cron/sync-fixtures/route.ts` — full season sync route
- `vercel.json` — Vercel cron config (05:00 UTC daily)

### Environment variables (in .env.local + Vercel production)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FOOTBALL_DATA_API_KEY` (also set as Supabase edge function secret)
- `CRON_SECRET`

### Open issues / next tasks
- **GW1 not showing in pick selector** — the data is correct in DB (10 fixtures, all `upcoming`), page returns 200 with no errors. Fixed `.single()` → `.maybeSingle()` in `getCurrentGameweek()`. Needs verification after latest deploy.
- **Static mock data** — `src/lib/data.ts` still has hardcoded leaderboards, PRO fixtures, user picks. These need to be wired to Supabase as users start playing.
- **Auth flow** — Google sign-in button exists (`src/components/google-button.tsx`) but post-auth redirect and profile creation not fully wired.
- **Picks submission** — `PickSelector` has UI for selecting/confirming picks but doesn't write to the `picks` table yet.
- **Results processing** — when a gameweek completes, scores need to be calculated from `results` and written to picks/standings.

### Vercel deployment command
```bash
cd ~/triple-pick-26 && npx vercel --prod --yes
```

### Testing the sync endpoints
```bash
# Full season sync (Vercel)
curl -X GET https://triple-pick-26.vercel.app/api/cron/sync-fixtures \
  -H "Authorization: Bearer $CRON_SECRET"

# Live score sync (Supabase edge function)
curl -X POST https://sdegptnzaujmpbrewopw.supabase.co/functions/v1/sync-live-scores \
  -H "Content-Type: application/json" -d '{}'
```
