'use client'

import { useEffect, useState } from 'react'

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now())
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  }
}

export function Countdown({ target }: { target: Date }) {
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    setMounted(true)
    setTime(diff(target))
    const id = setInterval(() => setTime(diff(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  const units = [
    { label: 'Days', value: time.days },
    { label: 'Hours', value: time.hours },
    { label: 'Mins', value: time.minutes },
    { label: 'Secs', value: time.seconds },
  ]

  if (!mounted) return null

  return (
    <div className="flex items-center gap-2 sm:gap-3" aria-label="Time until picks lock">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-2 sm:gap-3">
          <div className="flex w-16 flex-col items-center rounded-lg border border-border bg-secondary py-3 sm:w-20">
            <span className="font-heading text-3xl font-bold tabular-nums leading-none sm:text-4xl">
              {String(u.value).padStart(2, '0')}
            </span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {u.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="font-heading text-2xl font-bold text-primary/60">:</span>
          )}
        </div>
      ))}
    </div>
  )
}