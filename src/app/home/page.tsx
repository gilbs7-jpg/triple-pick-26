import Link from 'next/link'
import { Clock, Globe, Swords, Users, Trophy, Crown, ArrowRight } from 'lucide-react'
import { PageShell } from '@/components/page-shell'
import { Countdown } from '@/components/countdown'
import { PickSelector } from '@/components/pick-selector'
import {
  CURRENT_GAMEWEEK,
  CURRENT_USER,
  getLockTime,
  SEASON_LEADERBOARD,
  PRO_FIXTURE,
} from '@/lib/data'

const quickLinks = [
  { href: '/season', label: 'Season', icon: Globe, desc: 'Global leaderboard' },
  { href: '/pro', label: 'Pro', icon: Swords, desc: 'Head-to-head divisions' },
  { href: '/private', label: 'Private', icon: Users, desc: 'Your custom leagues' },
  { href: '/trophy-room', label: 'Trophy Room', icon: Trophy, desc: 'Your silverware' },
  { href: '/hall-of-fame', label: 'Hall of Fame', icon: Crown, desc: 'All-time greats' },
]

export default function HomePage() {
  const userRow = SEASON_LEADERBOARD.find((r) => r.isUser)

  return (
    <PageShell>
      {/* Gameweek banner */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Welcome back, {CURRENT_USER.username}
            </p>
            <h1 className="mt-2 font-heading text-5xl font-bold uppercase tracking-tight sm:text-6xl">
              Gameweek {CURRENT_GAMEWEEK}
            </h1>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4 text-primary" />
              Picks lock in
            </p>
          </div>
          <Countdown target={getLockTime()} />
        </div>
      </section>

      {/* Picks */}
      <section className="mb-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-bold uppercase tracking-tight">
              Your picks
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose three teams. 3 points for a win, 1 for a draw.
            </p>
          </div>
        </div>
        <PickSelector initialPicks={CURRENT_USER.picks} />
      </section>

      {/* Standing snapshot */}
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

      {/* Quick nav */}
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
                <p className="font-heading text-lg font-bold uppercase leading-none">
                  {label}
                </p>
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

function SnapshotCard({
  label,
  value,
  sub,
  href,
}: {
  label: string
  value: string
  sub: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-heading text-3xl font-bold uppercase tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </Link>
  )
}
