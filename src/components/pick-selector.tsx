'use client'

import { useState } from 'react'
import { Check, Lock, Pencil } from 'lucide-react'
import { TeamBadge } from '@/components/brand'
import { TEAMS, teamById } from '@/lib/data'
import { cn } from '@/lib/utils'

export function PickSelector({ initialPicks }: { initialPicks: string[] }) {
  const [picks, setPicks] = useState<string[]>(initialPicks)
  const [editing, setEditing] = useState(initialPicks.length === 0)
  const [confirmed, setConfirmed] = useState(initialPicks.length > 0)

  function toggle(id: string) {
    setConfirmed(false)
    setPicks((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id)
      if (prev.length >= 3) return prev
      return [...prev, id]
    })
  }

  if (!editing && confirmed) {
    return (
      <div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {picks.map((id, i) => {
            const team = teamById(id)
            return (
              <div
                key={id}
                className="flex items-center gap-4 rounded-xl border border-border bg-secondary/60 p-4"
              >
                <span className="font-heading text-2xl font-bold text-primary/40">
                  {i + 1}
                </span>
                <TeamBadge id={id} size="lg" />
                <div>
                  <p className="font-heading text-lg font-bold uppercase leading-none">
                    {team?.short}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Pick locked in</p>
                </div>
              </div>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-5 inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
        >
          <Pencil className="size-4" />
          Change picks
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Selected{' '}
          <span className="font-semibold text-foreground">{picks.length}</span> of 3
        </p>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 w-8 rounded-full',
                i < picks.length ? 'bg-primary' : 'bg-border',
              )}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {TEAMS.map((team) => {
          const selected = picks.includes(team.id)
          const order = picks.indexOf(team.id) + 1
          const disabled = !selected && picks.length >= 3
          return (
            <button
              key={team.id}
              type="button"
              onClick={() => toggle(team.id)}
              disabled={disabled}
              className={cn(
                'relative flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all',
                selected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-muted-foreground/40',
                disabled && 'opacity-40',
              )}
            >
              <TeamBadge id={team.id} size="sm" />
              <span className="truncate text-sm font-semibold">{team.short}</span>
              {selected && (
                <span className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-primary font-heading text-xs font-bold text-primary-foreground">
                  {order}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        disabled={picks.length !== 3}
        onClick={() => {
          setConfirmed(true)
          setEditing(false)
        }}
        className={cn(
          'mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md px-6 py-3.5 text-sm font-semibold transition-colors sm:w-auto',
          picks.length === 3
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'cursor-not-allowed bg-secondary text-muted-foreground',
        )}
      >
        {picks.length === 3 ? (
          <>
            <Check className="size-4" />
            Confirm picks
          </>
        ) : (
          <>
            <Lock className="size-4" />
            Select {3 - picks.length} more
          </>
        )}
      </button>
    </div>
  )
}
