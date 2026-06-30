import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CalendarDays, Clock, Globe, Swords, Users, Trophy, Crown, ArrowRight } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { Countdown } from '@/components/countdown'
import { PickSelector } from '@/components/pick-selector'
import { SEASON_LEADERBOARD, PRO_FIXTURE } from '@/lib/data'
import { createClient } from '@/lib/supabase/server'
import {
  getCurrentGameweek,
  getNextGameweek,
  getGameweekFixtures,
  getTPSeasonLeagueId,
  getUserPicksForGameweek,
} from '@/lib/db'

const quickLinks = [
  { href: '/season',      label: 'Season',       icon: Globe,   desc: 'Global leaderboard' },
  { href: '/pro',         label: 'Pro',           icon: Swords,  desc: 'Head-to-head divisions' },
  { href: '/private',     label: 'Private',       icon: Users,   desc: 'Your custom leagues' },
  { href: '/trophy-room', label: 'Trophy Room',   icon: Trophy,  desc: 'Your silverware' },
  { href: '/hall-of-fame',label: 'Hall of Fame',  icon: Crown,   desc: 'All-time greats' },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle()

  const userRow  = SEASON_LEADERBOARD.find((r) => r.isUser)
  const gw       = await getCurrentGameweek()
  const nextGW   = gw ? await getNextGameweek(gw.number) : null
  const fixtures = gw ? await getGameweekFixtures(gw.id) : []
  const leagueId = await getTPSeasonLeagueId()
  const existingPicks = gw && leagueId
    ? await getUserPicksForGameweek(user.id, gw.id, leagueId)
    : []

  const initialPicks = existingPicks.map((p) => ({
    teamId: p.teamShortCode,
    teamUuid: p.teamId,
  }))

  const lockTime   = gw     ? new Date(gw.pick_deadline)          : new Date()
  const nextGWOpen = nextGW ? formatDate(nextGW.selection_opens_at) : null

  return (
    <PageShell>
      <section className="mb-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Welcome back, {profile?.username ?? 'Player'}
            </p>
            <h1 className="mt-2 font-heading text-5xl font-bold uppercase tracking-tight sm:text-6xl">
              Gameweek {gw?.number ?? '—'}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4 text-primary" />
              Picks lock in
            </p>
            {nextGWOpen && (
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4 text-primary/60" />
                GW{(gw?.number ?? 0) + 1} opens {nextGWOpen}
              </p>
            )}
          </div>
          <Countdown target={lockTime} />
        </div>
      </section>

      <section className="mb-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-bold uppercase tracking-tight">
              Your picks
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose three teams. Away win = 4pts · Home win = 3pts · Draw = 1pt.
            </p>
          </div>
        </div>
        {gw && leagueId ? (
          <PickSelector
            initialPicks={initialPicks}
            fixtures={fixtures}
            gameweekId={gw.id}
            leagueId={leagueId}
          />
        ) : (
          <p className="text-sm text-muted-foreground">No active gameweek right now.</p>
        )}
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <SnapshotCard
          label="Season rank"
          value={`#${userRow?.rank ?? '—'}`}
          sub={`${userRow?.total ?? 0} pts total`}
          href="/season"
        />
        <SnapshotCard
          label="This GW score"
          value={`${userRow?.gwScore ?? 0} pts`}
          sub="2 wins, 0 draws so far"
          href="/season"
        />
        <SnapshotCard
          label="Pro fixture"
          value="vs TikiTakaTom"
          sub={`${PRO_FIXTURE.home.record} record`}
          href="/pro"
        />
      </section>

      <section>
        <h2 className="mb-4 font-heading text-2xl font-bold uppercase tracking-tight">
          Jump to
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
            >
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div className="flex-1">
                <p className="font-heading text-lg font-bold uppercase leading-none">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              </div>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  )
}

function SnapshotCard({ label, value, sub, href }: {
  label: string; value: string; sub: string; href: string
}) {
  return (
    <Link href={href} className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-heading text-3xl font-bold uppercase tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </Link>
  )
}