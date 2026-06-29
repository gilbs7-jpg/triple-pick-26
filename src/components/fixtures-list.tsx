import { TeamBadge } from '@/components/brand'
import { teamById, type Fixture } from '@/lib/data'

export function FixturesList({ fixtures }: { fixtures: Fixture[] }) {
  return (
    <ul className="divide-y divide-border/60">
      {fixtures.map((f, i) => (
        <li key={i} className="flex items-center gap-4 px-5 py-3.5">
          <div className="flex flex-1 items-center justify-end gap-2.5">
            <span className="hidden text-sm font-semibold sm:inline">
              {teamById(f.home)?.short}
            </span>
            <TeamBadge id={f.home} size="sm" />
          </div>
          <div className="flex flex-col items-center">
            <span className="font-heading text-xs font-bold tabular-nums text-muted-foreground">
              {f.time}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {f.date}
            </span>
          </div>
          <div className="flex flex-1 items-center gap-2.5">
            <TeamBadge id={f.away} size="sm" />
            <span className="hidden text-sm font-semibold sm:inline">
              {teamById(f.away)?.short}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
