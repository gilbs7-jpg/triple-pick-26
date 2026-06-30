import { createClient } from '@/lib/supabase/server'
import type { Fixture } from '@/lib/data'

export type GameweekRow = {
  id: string
  number: number
  status: string
  first_kickoff: string
  pick_deadline: string
  selection_opens_at: string
}

export async function getCurrentGameweek(): Promise<GameweekRow | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('gameweeks')
    .select('id, number, status, first_kickoff, pick_deadline, selection_opens_at')
    .in('status', ['open', 'upcoming'])
    .order('number', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (!data) return null
  return data as GameweekRow
}

export async function getNextGameweek(currentNumber: number): Promise<GameweekRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gameweeks')
    .select('id, number, status, first_kickoff, pick_deadline, selection_opens_at')
    .eq('number', currentNumber + 1)
    .single()
  if (error || !data) return null
  return data as GameweekRow
}

export async function getGameweekFixtures(gameweekId: string): Promise<Fixture[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('fixtures')
    .select(`
      kickoff_at,
      status,
      home_score,
      away_score,
      home_team:teams!fixtures_home_team_id_fkey ( id, short_code ),
      away_team:teams!fixtures_away_team_id_fkey ( id, short_code )
    `)
    .eq('gameweek_id', gameweekId)
    .order('kickoff_at', { ascending: true })

  if (error || !data) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((f) => ({
    home: f.home_team?.short_code ?? '',
    away: f.away_team?.short_code ?? '',
    homeTeamId: f.home_team?.id ?? '',
    awayTeamId: f.away_team?.id ?? '',
    time: new Date(f.kickoff_at).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/London',
    }),
    date: new Date(f.kickoff_at).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'Europe/London',
    }),
    homeScore: f.home_score ?? undefined,
    awayScore: f.away_score ?? undefined,
    status: f.status as 'scheduled' | 'live' | 'finished',
  }))
}

export async function getTPSeasonLeagueId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('slug', 'tp-season')
    .maybeSingle()
  if (!product) return null

  const { data: league } = await supabase
    .from('leagues')
    .select('id')
    .eq('product_id', product.id)
    .maybeSingle()

  return league?.id ?? null
}

export type UserPick = { teamShortCode: string; teamId: string }

export async function getUserPicksForGameweek(
  userId: string,
  gameweekId: string,
  leagueId: string
): Promise<UserPick[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('picks')
    .select('team_id, teams ( short_code )')
    .eq('user_id', userId)
    .eq('gameweek_id', gameweekId)
    .eq('league_id', leagueId)

  if (error || !data) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((p) => ({
    teamId: p.team_id,
    teamShortCode: p.teams?.short_code ?? '',
  }))
}
