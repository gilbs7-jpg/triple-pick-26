'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { teamById } from '@/lib/data'
import { TEAM_TOKENS, generateTokenSVG } from '@/lib/team-tokens'

export function Logo({
  className,
  href = '/',
}: {
  className?: string
  href?: string
}) {
  return (
    <Link
      href={href}
      className={cn('flex items-center gap-2 select-none', className)}
      aria-label="Triple Pick home"
    >
      <span className="flex items-center gap-0.5" aria-hidden="true">
        <span className="h-5 w-2 rounded-sm bg-primary" />
        <span className="h-5 w-2 rounded-sm bg-primary/60" />
        <span className="h-5 w-2 rounded-sm bg-primary/30" />
      </span>
      <span className="font-heading text-xl font-bold uppercase tracking-tight leading-none">
        Triple<span className="text-primary">Pick</span>
      </span>
    </Link>
  )
}

const BADGE_PX = { sm: 28, md: 36, lg: 48 }

export function TeamBadge({
  id,
  size = 'md',
  className,
}: {
  id: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const team = teamById(id)
  if (!team) return null

  const token = TEAM_TOKENS[id.toLowerCase()]

  if (!token) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-md font-heading font-bold text-white ring-1 ring-inset ring-white/15 shadow-sm',
          size === 'sm' ? 'size-7 text-[10px]' : size === 'lg' ? 'size-12 text-sm' : 'size-9 text-xs',
          className,
        )}
        style={{ backgroundColor: team.color }}
        title={team.name}
      >
        {team.abbr}
      </span>
    )
  }

  return (
    <span
      className={cn('inline-flex shrink-0', className)}
      title={team.name}
      dangerouslySetInnerHTML={{ __html: generateTokenSVG(token, team.abbr, BADGE_PX[size]) }}
    />
  )
}
