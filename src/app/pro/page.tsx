import { Shield } from 'lucide-react'
import { PageShell, PageHeader } from '@/components/page-shell'
import {
  CURRENT_GAMEWEEK,
  PRO_DIVISION,
  PRO_FIXTURE,
  PRO_TABLE,
} from '@/lib/data'
import { cn } from '@/lib/utils'

export default function ProPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Head-to-head"
        title="Pro"
        description="Promotion and relegation across divisions. Out-score your weekly opponent to bank 3 points and push for the title."
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
          <Shield className="size-4" />
          {PRO_DIVISION}
        </span>
      </PageHeader>

      {/* This week's fixture */}
      <section className="mb-8">
        <h2 className="mb-4 font-heading text-2xl font-bold uppercase tracking-tight">
          Your fixture · GW {CURRENT_GAMEWEEK}
        </h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-6 sm:p-10">
            <FixtureSide
              name={PRO_FIXTURE.home.username}
              record={PRO_FIXTURE.home.record}
              isUser={PRO_FIXTURE.home.isUser}
              align="right"
            />
            <div className="flex flex-col items-center">
              <span className="font-heading text-4xl font-bold text-primary sm:text-5xl">
                VS
              </span>
              <span className="mt-2 rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Locks Sat 12:30
              </span>
            </div>
            <FixtureSide
              name={PRO_FIXTURE.away.username}
              record={PRO_FIXTURE.away.record}
              align="left"
            />
          </div>
        </div>
      </section>

      {/* Division table */}
      <section>
        <h2 className="mb-4 font-heading text-2xl font-bold uppercase tracking-tight">
          {PRO_DIVISION} table
        </h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-semibold">#</th>
                  <th className="px-5 py-3 font-semibold">Player</th>
                  <th className="px-4 py-3 text-center font-semibold">P</th>
                  <th className="px-4 py-3 text-center font-semibold">W</th>
                  <th className="px-4 py-3 text-center font-semibold">D</th>
                  <th className="px-4 py-3 text-center font-semibold">L</th>
                  <th className="px-4 py-3 text-center font-semibold">Form</th>
                  <th className="px-5 py-3 text-right font-semibold">Pts</th>
                </tr>
              </thead>
              <tbody>
                {PRO_TABLE.map((row, idx) => {
                  const promo = idx < 2
                  const releg = idx >= PRO_TABLE.length - 2
                  return (
                    <tr
                      key={row.username}
                      className={cn(
                        'border-b border-border/60 transition-colors last:border-0',
                        row.isUser ? 'bg-primary/10' : 'hover:bg-secondary/40',
                      )}
                    >
                      <td className="px-5 py-3.5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-2 font-heading text-sm font-bold tabular-nums',
                          )}
                        >
                          <span
                            className={cn(
                              'h-5 w-1 rounded-full',
                              promo
                                ? 'bg-primary'
                                : releg
                                  ? 'bg-destructive'
                                  : 'bg-transparent',
                            )}
                          />
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
                        {row.played}
                      </td>
                      <td className="px-4 py-3.5 text-center tabular-nums">{row.wins}</td>
                      <td className="px-4 py-3.5 text-center tabular-nums">{row.draws}</td>
                      <td className="px-4 py-3.5 text-center tabular-nums">{row.losses}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-center gap-1">
                          {row.form.map((f, i) => (
                            <FormDot key={i} result={f} />
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right font-heading text-base font-bold tabular-nums">
                        {row.points}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-5 border-t border-border px-5 py-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="h-3 w-1 rounded-full bg-primary" /> Promotion
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-1 rounded-full bg-destructive" /> Relegation
            </span>
          </div>
        </div>
      </section>
    </PageShell>
  )
}

function FixtureSide({
  name,
  record,
  isUser,
  align,
}: {
  name: string
  record: string
  isUser?: boolean
  align: 'left' | 'right'
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        align === 'right' ? 'items-end text-right' : 'items-start text-left',
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-primary font-heading text-lg font-bold text-primary-foreground sm:size-16">
        {name.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="font-heading text-lg font-bold uppercase leading-none sm:text-xl">
            {name}
          </p>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">{record} (W-D-L)</p>
        {isUser && (
          <span className="mt-1 inline-block rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
            You
          </span>
        )}
      </div>
    </div>
  )
}

function FormDot({ result }: { result: 'W' | 'D' | 'L' }) {
  const styles = {
    W: 'bg-primary text-primary-foreground',
    D: 'bg-secondary text-muted-foreground ring-1 ring-border',
    L: 'bg-destructive/80 text-white',
  }
  return (
    <span
      className={cn(
        'inline-flex size-6 items-center justify-center rounded text-[10px] font-bold',
        styles[result],
      )}
    >
      {result}
    </span>
  )
}
