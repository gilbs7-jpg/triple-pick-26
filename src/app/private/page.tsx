import { Copy, Trophy, UserPlus } from 'lucide-react'
import { PageShell, PageHeader } from '@/components/page-shell'
import { FixturesList } from '@/components/fixtures-list'
import {
  CURRENT_GAMEWEEK,
  PRIVATE_LEAGUE,
  PRIVATE_TABLE,
  WEEK_FIXTURES,
} from '@/lib/data'
import { cn } from '@/lib/utils'

export default function PrivatePage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Custom league"
        title={PRIVATE_LEAGUE.name}
        description="Your private league for bragging rights with the people who matter. Same scoring, smaller circle, bigger banter."
      >
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <UserPlus className="size-4" />
          Invite players
        </button>
      </PageHeader>

      {/* Meta strip */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Members
            </p>
            <p className="font-heading text-2xl font-bold">{PRIVATE_LEAGUE.members}</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Gameweek
            </p>
            <p className="font-heading text-2xl font-bold">{CURRENT_GAMEWEEK}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-border px-4 py-2.5">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Join code
            </p>
            <p className="font-heading text-lg font-bold tracking-widest text-primary">
              {PRIVATE_LEAGUE.code}
            </p>
          </div>
          <button
            type="button"
            aria-label="Copy join code"
            className="flex size-9 items-center justify-center rounded-md bg-secondary text-muted-foreground transition-colors hover:text-foreground"
          >
            <Copy className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Standings */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight">
              Standings
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">#</th>
                  <th className="px-5 py-3 font-semibold">Player</th>
                  <th className="px-4 py-3 text-center font-semibold">
                    <Trophy className="mx-auto size-3.5" />
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">GW</th>
                  <th className="px-5 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {PRIVATE_TABLE.map((row) => (
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
                          'inline-flex size-7 items-center justify-center rounded-md font-heading text-sm font-bold tabular-nums',
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
                    <td className="px-4 py-3.5 text-center tabular-nums text-muted-foreground">
                      {row.trophies}
                    </td>
                    <td className="px-4 py-3.5 text-right font-heading font-bold tabular-nums text-primary">
                      +{row.gwScore}
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

        {/* Fixtures */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-heading text-xl font-bold uppercase tracking-tight">
              This week
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Gameweek {CURRENT_GAMEWEEK} fixtures
            </p>
          </div>
          <FixturesList fixtures={WEEK_FIXTURES} />
        </div>
      </div>
    </PageShell>
  )
}
