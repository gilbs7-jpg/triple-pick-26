import { Crown, Trophy, Medal, Award, Gamepad2, Target, Swords, Zap } from 'lucide-react'
import { PageShell, PageHeader } from '@/components/page-shell'
import { TeamBadge } from '@/components/brand'
import {
  CAREER_STATS,
  CURRENT_USER,
  SEASON_HISTORY,
  TROPHIES,
  teamById,
} from '@/lib/data'
import { cn } from '@/lib/utils'

const trophyCards = [
  { icon: Crown, label: 'Crowns', value: TROPHIES.crown, accent: 'text-primary', desc: 'Premier Division titles' },
  { icon: Trophy, label: 'Gold', value: TROPHIES.gold, accent: 'text-yellow-400', desc: 'Top 3 season finishes' },
  { icon: Medal, label: 'Silver', value: TROPHIES.silver, accent: 'text-slate-300', desc: 'League runner-ups' },
  { icon: Award, label: 'Bronze', value: TROPHIES.bronze, accent: 'text-amber-600', desc: 'Monthly podiums' },
]

export default function TrophyRoomPage() {
  const total = TROPHIES.crown + TROPHIES.gold + TROPHIES.silver + TROPHIES.bronze

  return (
    <PageShell>
      <PageHeader
        eyebrow={`${CURRENT_USER.username} · Joined ${CURRENT_USER.joined}`}
        title="Trophy Room"
        description="Every piece of silverware you have earned across the seasons. The proof of a life well managed."
      >
        <div className="text-right">
          <p className="font-heading text-5xl font-bold leading-none text-primary">
            {total}
          </p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Total trophies
          </p>
        </div>
      </PageHeader>

      {/* Trophy cabinet */}
      <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {trophyCards.map((t) => (
          <div
            key={t.label}
            className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 text-center"
          >
            <t.icon className={cn('size-10', t.accent)} />
            <p className="mt-4 font-heading text-4xl font-bold tabular-nums">
              {t.value}
            </p>
            <p className="font-heading text-sm font-bold uppercase tracking-tight">
              {t.label}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{t.desc}</p>
          </div>
        ))}
      </section>

      {/* Career stats */}
      <section className="mb-8">
        <h2 className="mb-4 font-heading text-2xl font-bold uppercase tracking-tight">
          Career stats
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CareerStat icon={Gamepad2} label="Games played" value={CAREER_STATS.gamesPlayed.toLocaleString()} />
          <CareerStat icon={Target} label="Total points" value={CAREER_STATS.totalPoints.toLocaleString()} />
          <CareerStat icon={Zap} label="Best gameweek" value={`${CAREER_STATS.bestGameweek} pts`} />
          <CareerStat icon={Swords} label="H2H win rate" value={`${CAREER_STATS.h2hWinRate}%`} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* Favourite teams */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-heading text-xl font-bold uppercase tracking-tight">
            Favourite picks
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Your most-backed teams of all time
          </p>
          <ul className="mt-5 space-y-3">
            {CAREER_STATS.favouriteTeams.map((id, i) => (
              <li key={id} className="flex items-center gap-3">
                <span className="font-heading text-lg font-bold text-primary/40">
                  {i + 1}
                </span>
                <TeamBadge id={id} size="md" />
                <span className="font-semibold">{teamById(id)?.name}</span>
                <span className="ml-auto text-sm text-muted-foreground">
                  {[68, 54, 41][i]} picks
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Season history */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight">
              Season history
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3 font-semibold">Season</th>
                  <th className="px-4 py-3 font-semibold">Pro result</th>
                  <th className="px-4 py-3 text-center font-semibold">Season rank</th>
                  <th className="px-4 py-3 text-center font-semibold">Trophies</th>
                  <th className="px-6 py-3 text-right font-semibold">Pts</th>
                </tr>
              </thead>
              <tbody>
                {SEASON_HISTORY.map((s) => (
                  <tr key={s.season} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-3.5 font-heading font-bold">{s.season}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{s.proResult}</td>
                    <td className="px-4 py-3.5 text-center tabular-nums">#{s.seasonRank}</td>
                    <td className="px-4 py-3.5 text-center tabular-nums">{s.trophies}</td>
                    <td className="px-6 py-3.5 text-right font-heading font-bold tabular-nums">
                      {s.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </PageShell>
  )
}

function CareerStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gamepad2
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <Icon className="size-5 text-primary" />
      <p className="mt-4 font-heading text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
    </div>
  )
}
