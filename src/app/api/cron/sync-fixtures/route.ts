import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// football-data.org status → our DB status
const STATUS_MAP: Record<string, string> = {
  SCHEDULED: 'scheduled',
  TIMED:     'scheduled',
  IN_PLAY:   'live',
  PAUSED:    'live',
  FINISHED:  'finished',
  POSTPONED: 'scheduled',
  SUSPENDED: 'scheduled',
  CANCELLED: 'scheduled',
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export async function GET(req: Request) {
  // Vercel cron sends Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY!
  const season = new Date().getFullYear() // 2026 → season that started in 2026

  const res = await fetch(
    `https://api.football-data.org/v4/competitions/PL/matches?season=${season}`,
    { headers: { 'X-Auth-Token': apiKey }, next: { revalidate: 0 } },
  )

  if (!res.ok) {
    const text = await res.text()
    return NextResponse.json({ error: `football-data.org ${res.status}`, detail: text }, { status: 502 })
  }

  const json = await res.json()
  const matches: FDMatch[] = json.matches ?? []

  if (!matches.length) {
    return NextResponse.json({ synced: 0, message: 'No matches returned' })
  }

  const supabase = adminClient()

  // ── 1. Ensure all teams have a short_code (new promotions etc.) ───────────
  const teamSet = new Map<number, { name: string; shortName: string }>()
  for (const m of matches) {
    teamSet.set(m.homeTeam.id, { name: m.homeTeam.name, shortName: m.homeTeam.shortName })
    teamSet.set(m.awayTeam.id, { name: m.awayTeam.name, shortName: m.awayTeam.shortName })
  }

  // ── 2. Load season row ────────────────────────────────────────────────────
  const { data: seasonRow } = await supabase
    .from('seasons')
    .select('id')
    .eq('is_active', true)
    .single()

  if (!seasonRow) {
    return NextResponse.json({ error: 'No active season found' }, { status: 500 })
  }

  // ── 3. Group matches by matchday ──────────────────────────────────────────
  const byMatchday = new Map<number, FDMatch[]>()
  for (const m of matches) {
    if (!byMatchday.has(m.matchday)) byMatchday.set(m.matchday, [])
    byMatchday.get(m.matchday)!.push(m)
  }

  // ── 4. Load existing gameweeks + teams (for ID mapping) ──────────────────
  const { data: gwRows } = await supabase
    .from('gameweeks')
    .select('id, number')
    .eq('season_id', seasonRow.id)

  const gwByNumber = new Map((gwRows ?? []).map((g) => [g.number, g.id]))

  const { data: teamRows } = await supabase
    .from('teams')
    .select('id, external_id, short_code')

  const teamByExtId = new Map((teamRows ?? []).map((t) => [t.external_id, t]))

  // ── 5. Upsert each matchday ───────────────────────────────────────────────
  let fixtureCount = 0

  for (const [matchday, dayMatches] of byMatchday) {
    const kickoffs = dayMatches.map((m) => new Date(m.utcDate).getTime())
    const firstKO  = new Date(Math.min(...kickoffs))
    const lastKO   = new Date(Math.max(...kickoffs))

    // pick deadline = first kick-off; selection opens 4 days before
    const deadline  = firstKO
    const opensAt   = new Date(firstKO.getTime() - 4 * 24 * 60 * 60 * 1000)
    // GW "ends" when last game finishes (~2h after last KO)
    const endsAt    = new Date(lastKO.getTime() + 2 * 60 * 60 * 1000)

    // Determine status from matches
    const statuses  = dayMatches.map((m) => STATUS_MAP[m.status] ?? 'scheduled')
    const gwStatus  = statuses.every((s) => s === 'finished')
      ? 'completed'
      : statuses.some((s) => s === 'live')
      ? 'open'
      : firstKO < new Date()
      ? 'open'
      : 'upcoming'

    let gwId = gwByNumber.get(matchday)

    if (!gwId) {
      const { data: inserted } = await supabase
        .from('gameweeks')
        .insert({
          season_id:          seasonRow.id,
          number:             matchday,
          first_kickoff:      firstKO.toISOString(),
          selection_opens_at: opensAt.toISOString(),
          pick_deadline:      deadline.toISOString(),
          status:             gwStatus,
        })
        .select('id')
        .single()

      if (!inserted) continue
      gwId = inserted.id
      gwByNumber.set(matchday, gwId)
    } else {
      // Update status + timing in case kickoffs shifted
      await supabase
        .from('gameweeks')
        .update({
          first_kickoff:      firstKO.toISOString(),
          selection_opens_at: opensAt.toISOString(),
          pick_deadline:      deadline.toISOString(),
          status:             gwStatus,
        })
        .eq('id', gwId)
    }

    // ── 6. Upsert fixtures for this matchday ─────────────────────────────
    for (const m of dayMatches) {
      const homeTeam = teamByExtId.get(String(m.homeTeam.id))
      const awayTeam = teamByExtId.get(String(m.awayTeam.id))
      if (!homeTeam || !awayTeam) continue

      const fixtureStatus = STATUS_MAP[m.status] ?? 'scheduled'
      const homeScore = m.score?.fullTime?.home ?? null
      const awayScore = m.score?.fullTime?.away ?? null

      await supabase
        .from('fixtures')
        .upsert(
          {
            gameweek_id:  gwId,
            home_team_id: homeTeam.id,
            away_team_id: awayTeam.id,
            kickoff_at:   m.utcDate,
            status:       fixtureStatus,
            home_score:   homeScore,
            away_score:   awayScore,
          },
          { onConflict: 'gameweek_id,home_team_id,away_team_id' },
        )

      fixtureCount++
    }

    // ── 7. Ensure team_pool covers all playing teams this GW ─────────────
    const poolInserts = dayMatches.flatMap((m) => {
      const home = teamByExtId.get(String(m.homeTeam.id))
      const away = teamByExtId.get(String(m.awayTeam.id))
      return [home, away]
        .filter(Boolean)
        .map((t) => ({ gameweek_id: gwId!, team_id: t!.id }))
    })

    if (poolInserts.length) {
      await supabase.from('team_pools').upsert(poolInserts, { onConflict: 'gameweek_id,team_id' })
    }
  }

  return NextResponse.json({
    ok: true,
    gameweeks: byMatchday.size,
    fixtures: fixtureCount,
  })
}

// ── Types ──────────────────────────────────────────────────────────────────
interface FDMatch {
  utcDate:  string
  status:   string
  matchday: number
  homeTeam: { id: number; name: string; shortName: string; tla: string }
  awayTeam: { id: number; name: string; shortName: string; tla: string }
  score: {
    fullTime: { home: number | null; away: number | null }
  }
}
