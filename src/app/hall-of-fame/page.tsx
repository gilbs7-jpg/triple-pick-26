import { Crown, Trophy, Medal, Award } from 'lucide-react'
import { PageShell, PageHeader } from '@/components/page-shell'
import { CHAMPIONS, TROPHY_LEADERBOARD } from '@/lib/data'
import { cn } from '@/lib/utils'

export default function HallOfFamePage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="The all-time greats"
        title="Hall of Fame"
        description="Season champions, Premier Division crown winners, and the most decorated managers in Triple Pick history."
      />

      {/* Champions */}
      <section className="mb-10">
        <h2 className="mb-4 font-heading text-2xl font-bold uppercase tracking-tight">
          Champions by season
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {CHAMPIONS.map((c, i) => (
            <div
              key={c.season}
              className={cn(
                'overflow-hidden rounded-2xl border bg-card p-6',
                i === 0 ? 'border-primary/50' : 'border-border',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-xl font-bold uppercase tracking-tight">
                  {c.season}
                </span>
                {i === 0 && (
                  <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                    Latest
                  </span>
                )}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Trophy className="size-5 shrink-0 text-yellow-400" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Season champion
                    </p>
                    <p className="font-heading text-lg font-bold leading-tight">
                      {c.seasonChamp}
                    </p>
                    <p className="text-xs text-primary">{c.points} pts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Crown className="size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Crown winner
                    </p>
                    <p className="font-heading text-lg font-bold leading-tight">
                      {c.crownWinner}
                    </p>
                    <p className="text-xs text-muted-foreground">Premier Div</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trophy leaderboard */}
      <section>
        <h2 className="mb-4 font-heading text-2xl font-bold uppercase tracking-tight">
          Trophy leaderboard
        </h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">#</th>
                  <th className="px-5 py-3 font-semibold">Player</th>
                  <th className="px-4 py-3 text-center font-semibold">
                    <Crown className="mx-auto size-4 text-primary" />
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    <Trophy className="mx-auto size-4 text-yellow-400" />
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    <Medal className="mx-auto size-4 text-slate-300" />
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    <Award className="mx-auto size-4 text-amber-600" />
                  </th>
                  <th className="px-5 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {TROPHY_LEADERBOARD.map((row) => (
                  <tr
                    key={row.username}
                    className={cn(
                      'border-b border-border/60 last:border-0',
                      row.isUser ? 'bg-primary/10' : 'hover:bg-secondary/40',
                    )}
                  >
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          'inline-flex size-8 items-center justify-center rounded-md font-heading text-sm font-bold tabular-nums',
                          row.rank === 1
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground',
                        )}
                      >
                        {row.rank}
                      </span>
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
                    <td className="px-4 py-3.5 text-center tabular-nums">{row.crowns}</td>
                    <td className="px-4 py-3.5 text-center tabular-nums">{row.gold}</td>
                    <td className="px-4 py-3.5 text-center tabular-nums">{row.silver}</td>
                    <td className="px-4 py-3.5 text-center tabular-nums">{row.bronze}</td>
                    <td className="px-5 py-3.5 text-right font-heading text-base font-bold tabular-nums text-primary">
                      {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
