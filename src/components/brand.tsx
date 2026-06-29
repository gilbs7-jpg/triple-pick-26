import Link from 'next/link'
import { cn } from '@/lib/utils'
import { teamById } from '@/lib/data'

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

const sizes = {
  sm: 'size-7 text-[10px]',
  md: 'size-9 text-xs',
  lg: 'size-12 text-sm',
}

export function TeamBadge({
  id,
  size = 'md',
  className,
}: {
  id: string
  size?: keyof typeof sizes
  className?: string
}) {
  const team = teamById(id)
  if (!team) return null
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md font-heading font-bold text-white ring-1 ring-inset ring-white/15 shadow-sm',
        sizes[size],
        className,
      )}
      style={{ backgroundColor: team.color }}
      title={team.name}
    >
      {team.abbr}
    </span>
  )
}
