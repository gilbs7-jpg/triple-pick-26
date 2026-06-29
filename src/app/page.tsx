import Image from 'next/image'
import Link from 'next/link'
import { ListChecks, Target, TrendingUp, Quote } from 'lucide-react'
import { Logo } from '@/components/brand'
import { GoogleButton } from '@/components/google-button'
import { SEASON_STATS, TESTIMONIALS } from '@/lib/data'

const steps = [
  {
    icon: Target,
    title: 'Pick three teams',
    body: 'Every gameweek, choose three Premier League sides you back to win. Picks lock at the first kickoff.',
  },
  {
    icon: ListChecks,
    title: 'Score the points',
    body: '3 points for a win, 1 for a draw, nothing for a loss. Nine points is the perfect gameweek.',
  },
  {
    icon: TrendingUp,
    title: 'Climb the table',
    body: 'Rise up the global Season ladder, win head-to-head in Pro, and chase silverware in private leagues.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-foreground/80 md:flex">
            <Link href="#how" className="transition-colors hover:text-primary">
              How it works
            </Link>
            <Link href="#players" className="transition-colors hover:text-primary">
              Players
            </Link>
            <Link href="/season" className="transition-colors hover:text-primary">
              Leaderboard
            </Link>
          </nav>
          <Link
            href="/home"
            className="rounded-md border border-border bg-background/40 px-4 py-2 text-sm font-semibold backdrop-blur transition-colors hover:border-primary hover:text-primary"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <Image
          src="/images/hero-player.png"
          alt="A footballer with a ball under his arm staring into a floodlit stadium"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />

        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              The Premier League prediction game
            </span>
            <h1 className="mt-5 font-heading text-6xl font-bold uppercase leading-[0.92] tracking-tight text-balance sm:text-7xl md:text-8xl">
              Three picks.
              <br />
              <span className="text-primary">One weekend.</span>
              <br />
              Bragging rights.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground text-pretty">
              Back three teams every gameweek. Bank points for wins and draws.
              Climb the leaderboard, win your head-to-head, and fill the trophy
              room. Free to play.
            </p>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <GoogleButton />
              <Link
                href="#how"
                className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                See how it works →
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Stat value={SEASON_STATS.players.toLocaleString()} label="Active players" />
              <div className="hidden h-10 w-px bg-border sm:block" />
              <Stat value={SEASON_STATS.prizePool} label="Season prize pool" />
              <div className="hidden h-10 w-px bg-border sm:block" />
              <Stat value="38" label="Gameweeks a season" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              How it works
            </p>
            <h2 className="mt-3 font-heading text-4xl font-bold uppercase tracking-tight sm:text-5xl">
              Three steps to glory
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-7"
              >
                <span className="font-heading text-6xl font-bold text-primary/15">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="mt-2 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-heading text-2xl font-bold uppercase tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section id="players" className="border-t border-border bg-card/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Loved by the terraces
              </p>
              <h2 className="mt-3 font-heading text-4xl font-bold uppercase tracking-tight sm:text-5xl">
                Join {SEASON_STATS.players.toLocaleString()} managers
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              From the office sweepstake to the Sunday league lads, Triple Pick
              keeps every gameweek interesting.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.handle}
                className="flex flex-col rounded-xl border border-border bg-card p-7"
              >
                <Quote className="size-7 text-primary" />
                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-pretty">
                  {`“${t.quote}”`}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary font-heading font-bold text-primary-foreground">
                    {t.name.slice(0, 1)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.handle}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-heading text-4xl font-bold uppercase tracking-tight text-balance sm:text-6xl">
            Your <span className="text-primary">three picks</span> are waiting
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Sign in, make your gameweek picks in seconds, and start climbing.
          </p>
          <div className="mt-8 flex justify-center">
            <GoogleButton />
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <Logo />
          <p className="text-center text-xs text-muted-foreground sm:text-right">
            Triple Pick is an independent prediction game and is not affiliated
            with the Premier League.
          </p>
        </div>
      </footer>
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-heading text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  )
}
