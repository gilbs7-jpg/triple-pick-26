import { Users, Coins, CalendarClock } from 'lucide-react'
import { PageShell, PageHeader } from '@/components/page-shell'
import { TeamBadge } from '@/components/brand'
import {
  CURRENT_GAMEWEEK,
  SEASON_LEADERBOARD,
  SEASON_STATS,
} from '@/lib/data'
import { cn } from '@/lib/utils'

export default function SeasonPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Free to play"
        title="Season"
        description="The global leaderboard. Every player, every gameweek, ranked by total points across the whole campaign."
      />

      {/* Stat strip */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatTile icon={Users} label="Players" value={SEASON_STATS.players.toLocaleString()} />
        <StatTile icon={Coins} label="Prize pool" value={SEASON_STATS.prizePool} />
        <StatTile icon={CalendarClock} label="Gameweeks left" value={String(SEASON_STATS.gameweeksLeft)} />
      </div>

      {/* Leaderboard */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-heading text-xl font-bold uppercase tracking-tight">
            Global leaderboard
          </h2>
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Gameweek {CURRENT_GAMEWEEK}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-semibold">Rank</th>
                <th className="px-5 py-3 font-semibold">Player</th>
                <th className="px-5 py-3 font-semibold">GW picks</th>
                <th className="px-5 py-3 text-right font-semibold">GW</th>
                <th className="px-5 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {SEASON_LEADERBOARD.map((row) => (
                <tr
                  key={row.username}
                  className={cn(
                    'border-b border-border/60 transition-colors last:border-0',
                    row.isUser ? 'bg-primary/10' : 'hover:bg-secondary/40',
                  )}
                >
                  <td className="px-5 py-3.5">
                    <RankBadge rank={row.rank} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{row.username}</span>
                      {row.isUser && (
                        <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                          You
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1">
                      {row.picks.map((p) => (
                        <TeamBadge key={p} id={p} size="sm" />
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span
                      className={cn(
                        'font-heading text-base font-bold tabular-nums',
                        row.gwScore >= 6 ? 'text-primary' : 'text-foreground',
                      )}
                    >
                      +{row.gwScore}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-heading text-base font-bold tabular-nums">
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="font-heading text-2xl font-bold tracking-tight">{value}</p>
      </div>
    </div>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const medal =
    rank === 1
      ? 'bg-primary text-primary-foreground'
      : rank <= 3
        ? 'bg-secondary text-foreground ring-1 ring-primary/40'
        : 'bg-secondary text-muted-foreground'
  return (
    <span
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md font-heading text-sm font-bold tabular-nums',
        medal,
      )}
    >
      {rank}
    </span>
  )
}
