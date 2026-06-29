'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Home, Globe, Swords, Users, Trophy, Crown, Menu, X } from 'lucide-react'
import { Logo } from '@/components/brand'
import { CURRENT_USER } from '@/lib/data'
import { cn } from '@/lib/utils'

const links = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/season', label: 'Season', icon: Globe },
  { href: '/pro', label: 'Pro', icon: Swords },
  { href: '/private', label: 'Private', icon: Users },
  { href: '/trophy-room', label: 'Trophy Room', icon: Trophy },
  { href: '/hall-of-fame', label: 'Hall of Fame', icon: Crown },
]

export function AppNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo href="/home" />

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold">{CURRENT_USER.username}</p>
              <p className="text-xs text-muted-foreground">GW points: 6</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-full bg-primary font-heading font-bold text-primary-foreground">
              {CURRENT_USER.username.slice(0, 2).toUpperCase()}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex size-9 items-center justify-center rounded-md border border-border lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 py-3 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground',
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </header>
  )
}
