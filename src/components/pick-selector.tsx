'use client'

import { useState, useTransition } from 'react'
import { Check, Lock, Pencil, Zap, AlertCircle } from 'lucide-react'
import { TeamBadge } from '@/components/brand'
import { teamById, type Fixture } from '@/lib/data'
import { cn } from '@/lib/utils'
import { submitPicks } from '@/app/actions/picks'

type Pick = { teamId: string; teamUuid: string; fixtureIdx: number }
type InitialPick = { teamId: string; teamUuid: string }

export function PickSelector({
  initialPicks,
  fixtures = [],
  gameweekId,
  leagueId,
}: {
  initialPicks: InitialPick[]
  fixtures?: Fixture[]
  gameweekId: string
  leagueId: string
}) {
  const [picks, setPicks] = useState<Pick[]>(
    initialPicks.map((p) => {
      const fixtureIdx = fixtures.findIndex(
        (f) => f.home === p.teamId || f.away === p.teamId
      )
      return { teamId: p.teamId, teamUuid: p.teamUuid, fixtureIdx }
    })
  )
  const [editing, setEditing] = useState(initialPicks.length === 0)
  const [confirmed, setConfirmed] = useState(initialPicks.length > 0)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function selectTeam(teamId: string, teamUuid: string, fixtureIdx: number) {
    setConfirmed(false)
    setError(null)
    setPicks((prev) => {
      const withoutFixture = prev.filter((p) => p.fixtureIdx !== fixtureIdx)
      const existing = prev.find((p) => p.fixtureIdx === fixtureIdx)
      if (existing?.teamId === teamId) return withoutFixture
      if (withoutFixture.length >= 3) return prev
      return [...withoutFixture, { teamId, teamUuid, fixtureIdx }]
    })
  }

  function pickForFixture(fixtureIdx: number) {
    return picks.find((p) => p.fixtureIdx === fixtureIdx)
  }

  function handleConfirm() {
    setError(null)
    startTransition(async () => {
      const result = await submitPicks(
        gameweekId,
        leagueId,
        picks.map((p) => p.teamUuid)
      )
      if (result.success) {
        setConfirmed(true)
        setEditing(false)
      } else {
        setError(result.error ?? 'Something went wrong. Try again.')
      }
    })
  }

  const pickCount = picks.length

  if (!editing && confirmed) {
    return (
      <div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {picks.map(({ teamId }, i) => {
            const team = teamById(teamId)
            return (
              <div
                key={teamId}
                className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/10 p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(123,108,246,0.12) 0%, rgba(255,255,255,0.02) 100%)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 0 0 1px rgba(123,108,246,0.2), 0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                <span className="relative font-heading text-3xl font-bold text-white/15">{i + 1}</span>
                <TeamBadge id={teamId} size="lg" className="relative" />
                <div className="relative">
                  <p className="font-heading text-lg font-bold uppercase leading-none tracking-wide">{team?.short}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-white/40">
                    <Check className="size-3 text-primary" />
                    Locked in
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white/60 transition-all hover:border-primary/50 hover:text-primary"
        >
          <Pencil className="size-3.5" />
          Change picks
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-white/50">
          <span className="font-heading text-2xl font-bold text-white">{pickCount}</span>
          <span className="ml-1">of 3 selected</span>
        </p>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'h-1 w-10 rounded-full transition-all duration-300',
                i < pickCount ? 'bg-primary' : 'bg-white/10',
              )}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fixtures.map((fixture, idx) => {
          const home = teamById(fixture.home)
          const away = teamById(fixture.away)
          const currentPick = pickForFixture(idx)
          const homePicked = currentPick?.teamId === fixture.home
          const awayPicked = currentPick?.teamId === fixture.away
          const fixturePickOrder = currentPick
            ? picks.findIndex((p) => p.fixtureIdx === idx) + 1
            : null
          const canPick = !!currentPick || pickCount < 3

          return (
            <div
              key={idx}
              className="relative overflow-hidden rounded-2xl transition-all duration-300"
              style={{
                background: currentPick
                  ? 'linear-gradient(135deg, rgba(123,108,246,0.12) 0%, rgba(255,255,255,0.03) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
                backdropFilter: 'blur(16px)',
                boxShadow: currentPick
                  ? '0 0 0 1px rgba(123,108,246,0.35), 0 8px 32px rgba(0,0,0,0.4)'
                  : '0 0 0 1px rgba(255,255,255,0.07), 0 4px 16px rgba(0,0,0,0.3)',
              }}
            >
              {currentPick && (
                <div
                  className="absolute inset-x-0 top-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(123,108,246,0.9), transparent)' }}
                />
              )}

              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span className="font-heading text-xs font-bold uppercase tracking-widest text-white">
                  {fixture.date}
                </span>
                <div className="flex items-center gap-2">
                  {fixturePickOrder && (
                    <span
                      className="flex size-5 items-center justify-center rounded-full font-heading text-xs font-bold text-white"
                      style={{ background: '#7b6cf6', boxShadow: '0 0 8px rgba(123,108,246,0.6)' }}
                    >
                      {fixturePickOrder}
                    </span>
                  )}
                  <span className="font-heading text-xs font-bold uppercase tracking-widest text-white">
                    KO {fixture.time}
                  </span>
                </div>
              </div>

              <div className="flex items-stretch px-3 pb-4 pt-1">
                <button
                  type="button"
                  disabled={!canPick && !homePicked}
                  onClick={() => selectTeam(fixture.home, fixture.homeTeamId ?? '', idx)}
                  className={cn(
                    'group relative flex flex-1 flex-col items-center gap-2.5 rounded-xl px-3 py-3 transition-all duration-200',
                    homePicked
                      ? 'bg-primary/15 ring-1 ring-primary/40'
                      : canPick
                      ? 'hover:bg-white/5'
                      : 'opacity-30 cursor-not-allowed',
                  )}
                >
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Home</span>
                  <TeamBadge id={fixture.home} size="lg" />
                  <span className="font-heading text-sm font-bold uppercase tracking-wide leading-none">
                    {home?.short}
                  </span>
                  {homePicked && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-primary">
                      <Check className="size-3" /> Selected
                    </span>
                  )}
                </button>

                <div className="flex flex-col items-center justify-center px-2 gap-1">
                  <div className="h-8 w-px bg-white/8" />
                  <span className="font-heading text-[10px] font-bold tracking-widest text-white/20">VS</span>
                  <div className="h-8 w-px bg-white/8" />
                </div>

                <button
                  type="button"
                  disabled={!canPick && !awayPicked}
                  onClick={() => selectTeam(fixture.away, fixture.awayTeamId ?? '', idx)}
                  className={cn(
                    'group relative flex flex-1 flex-col items-center gap-2.5 rounded-xl px-3 py-3 transition-all duration-200',
                    awayPicked
                      ? 'bg-primary/15 ring-1 ring-primary/40'
                      : canPick
                      ? 'hover:bg-white/5'
                      : 'opacity-30 cursor-not-allowed',
                  )}
                >
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Away</span>
                  <TeamBadge id={fixture.away} size="lg" />
                  <span className="font-heading text-sm font-bold uppercase tracking-wide leading-none">
                    {away?.short}
                  </span>
                  {awayPicked && (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-primary">
                      <Check className="size-3" /> Selected
                    </span>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        disabled={pickCount !== 3 || isPending}
        onClick={handleConfirm}
        className={cn(
          'mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 font-heading text-sm font-bold uppercase tracking-widest transition-all duration-200 sm:w-auto',
          pickCount === 3 && !isPending
            ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25'
            : 'cursor-not-allowed bg-white/5 text-white/20',
        )}
      >
        {isPending ? (
          <>Saving…</>
        ) : pickCount === 3 ? (
          <><Zap className="size-4" />Confirm picks</>
        ) : (
          <><Lock className="size-4" />Select {3 - pickCount} more</>
        )}
      </button>
    </div>
  )
}