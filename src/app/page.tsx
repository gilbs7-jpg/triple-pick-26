import Link from 'next/link'
import { ListChecks, Target, TrendingUp, Quote, Zap } from 'lucide-react'
import { Logo } from '@/components/brand'
import { GoogleButton } from '@/components/google-button'
import { SEASON_STATS, TESTIMONIALS } from '@/lib/data'
import { cn } from '@/lib/utils'

const steps = [
  {
    icon: Target,
    title: 'Pick three teams',
    body: 'Every gameweek choose three Premier League sides. Picks lock at the first kickoff — no changing your mind.',
  },
  {
    icon: ListChecks,
    title: 'Score the points',
    body: 'Away win = 4pts. Home win = 3pts. Draw = 1pt. The away win premium rewards bold calls.',
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
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-foreground/80 md:flex">
            <Link href="#how" className="transition-colors hover:text-primary">How it works</Link>
            <Link href="#players" className="transition-colors hover:text-primary">Players</Link>
            <Link href="/season" className="transition-colors hover:text-primary">Leaderboard</Link>
          </nav>
          <Link
            href="/home"
            className="rounded-md border border-primary bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/80 hover:border-primary/80"
          >
            Sign in
          </Link>
        </div>
      </header>

      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />

        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl items-end px-4 pb-16 pt-24">
          <div className="flex w-full flex-col items-end gap-10 lg:flex-row lg:items-end">
            {/* Left: text */}
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                The ultimate Head to Head game
                <span className="text-base leading-none">⚽</span>
              </span>

              <h1 className="mt-3 font-heading font-bold uppercase leading-[0.88] tracking-tight">
                <span className="block text-6xl text-white sm:text-7xl md:text-8xl">Pick.</span>
                <span className="block text-6xl text-white sm:text-7xl md:text-8xl">Play.</span>
                <span className="block text-6xl text-primary sm:text-7xl md:text-8xl">Win.</span>
              </h1>

              <div className="mt-6 max-w-lg space-y-1 text-base leading-relaxed text-muted-foreground">
                <p>Pick 3 teams &amp; go head to head every gameweek.</p>
                <p>Climb the table &amp; turn points into trophies.</p>
              </div>

              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <GoogleButton />
                <Link href="#how" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
                  See how it works →
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <Stat value={SEASON_STATS.players.toLocaleString()} label="Active players" />
                <div className="hidden h-10 w-px bg-border sm:block" />
                <Stat value="38" label="Gameweeks a season" />
                <div className="hidden h-10 w-px bg-border sm:block" />
                <Stat value="FA Cup · UCL" label="Feature tournaments" />
              </div>
            </div>

            {/* Right: phone mockup */}
            <div className="relative hidden shrink-0 lg:flex lg:items-end lg:justify-center" style={{ width: 300, paddingBottom: 4 }}>
              {/* glow under phone */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2"
                style={{
                  width: 200,
                  height: 120,
                  background: 'radial-gradient(ellipse at 50% 100%, rgba(123,108,246,0.45) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                }}
              />
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="border-t border-border py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">How it works</p>
            <h2 className="mt-3 font-heading text-4xl font-bold uppercase tracking-tight sm:text-5xl">
              Three steps to glory
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="group relative overflow-hidden rounded-2xl p-7"
                style={{
                  background: 'linear-gradient(135deg, rgba(123,108,246,0.08) 0%, rgba(255,255,255,0.02) 100%)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 0 0 1px rgba(123,108,246,0.3), 0 0 32px rgba(123,108,246,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(123,108,246,0.8), transparent)' }}
                />
                <span
                  className="font-heading text-6xl font-bold"
                  style={{ color: '#7b6cf6', textShadow: '0 0 20px rgba(123,108,246,0.6)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="mt-2 flex size-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <step.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-heading text-2xl font-bold uppercase tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>

          <div
            className="mt-8 flex flex-wrap items-center justify-center gap-4 rounded-2xl px-8 py-5"
            style={{
              background: 'linear-gradient(135deg, rgba(123,108,246,0.1) 0%, rgba(255,255,255,0.02) 100%)',
              boxShadow: '0 0 0 1px rgba(123,108,246,0.25)',
            }}
          >
            {[
              { label: 'Away win', pts: '4pts', highlight: true },
              { label: 'Home win', pts: '3pts', highlight: false },
              { label: 'Draw',     pts: '1pt',  highlight: false },
              { label: 'Loss',     pts: '0pts', highlight: false },
            ].map(({ label, pts, highlight }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-sm text-white/50">{label}</span>
                <span
                  className="font-heading text-xl font-bold"
                  style={highlight ? { color: '#7b6cf6', textShadow: '0 0 12px rgba(123,108,246,0.5)' } : { color: 'white' }}
                >
                  {pts}
                </span>
                {highlight && <Zap className="size-3.5 text-primary" />}
              </div>
            ))}
          </div>

          {/* Two-stage demo */}
          <div className="mt-10 grid gap-5 lg:grid-cols-2">

            {/* ── Stage 1: Head-to-head picks ── */}
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(123,108,246,0.09) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 0 0 1px rgba(123,108,246,0.28), 0 16px 48px rgba(0,0,0,0.35)',
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(123,108,246,0.9), transparent)' }} />
              <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-[10px] font-bold text-primary">STAGE 01</span>
                  <span className="text-white/20">·</span>
                  <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/30">GW29 Picks</span>
                </div>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 font-heading text-[10px] font-bold text-primary">Head to Head</span>
              </div>

              <div className="grid grid-cols-[1fr_36px_1fr]">
                {/* Player 1 — Marcus */}
                <div className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 font-heading text-xs font-bold text-primary ring-1 ring-primary/40">M</div>
                    <p className="truncate font-heading text-xs font-bold">Marcus_89</p>
                  </div>
                  <div className="space-y-1.5">
                    {([
                      { pick: 'Arsenal',   opp: 'Man Utd',  venue: 'Away', result: 'away-win', pts: 4 },
                      { pick: 'Chelsea',   opp: 'Brighton', venue: 'Home', result: 'home-win', pts: 3 },
                      { pick: 'Liverpool', opp: 'Everton',  venue: 'Away', result: 'loss',     pts: 0 },
                    ] as const).map((p) => (
                      <div key={p.pick} className="flex items-center gap-1.5 rounded-lg px-2.5 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-heading text-[11px] font-bold leading-none text-primary">{p.pick}</p>
                          <p className="mt-0.5 truncate text-[9px] leading-none text-white/30">vs {p.opp} · {p.venue}</p>
                        </div>
                        <ResultBadge result={p.result} pts={p.pts} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-heading text-3xl font-bold text-white">7</span>
                    <span className="text-[10px] uppercase tracking-wider text-white/30">pts</span>
                  </div>
                </div>

                {/* VS spine */}
                <div className="flex flex-col items-center justify-center border-x border-white/6">
                  <div className="h-8 w-px bg-white/6" />
                  <span className="py-2 font-heading text-xs font-bold tracking-widest text-white/15">VS</span>
                  <div className="h-8 w-px bg-white/6" />
                </div>

                {/* Player 2 — TheGaffer */}
                <div className="p-4">
                  <div className="mb-3 flex flex-row-reverse items-center gap-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/20 font-heading text-xs font-bold text-primary ring-1 ring-primary/40">T</div>
                    <p className="truncate text-right font-heading text-xs font-bold">TheGaffer</p>
                  </div>
                  <div className="space-y-1.5">
                    {([
                      { pick: 'Spurs',     opp: 'Wolves',   venue: 'Home', result: 'draw',     pts: 1 },
                      { pick: 'Man City',  opp: 'Bournem.', venue: 'Away', result: 'away-win', pts: 4 },
                      { pick: 'Newcastle', opp: 'West Ham', venue: 'Home', result: 'home-win', pts: 3 },
                    ] as const).map((p) => (
                      <div key={p.pick} className="flex flex-row-reverse items-center gap-1.5 rounded-lg px-2.5 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="min-w-0 flex-1 text-right">
                          <p className="truncate font-heading text-[11px] font-bold leading-none text-primary">{p.pick}</p>
                          <p className="mt-0.5 truncate text-[9px] leading-none text-white/30">vs {p.opp} · {p.venue}</p>
                        </div>
                        <ResultBadge result={p.result} pts={p.pts} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-baseline justify-end gap-1">
                    <Zap className="size-3 text-primary" />
                    <span className="font-heading text-3xl font-bold" style={{ color: '#7b6cf6', textShadow: '0 0 16px rgba(123,108,246,0.5)' }}>8</span>
                    <span className="text-[10px] uppercase tracking-wider text-white/30">pts</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/6 px-4 py-2.5 text-center">
                <p className="text-[10px] text-white/30">TheGaffer wins GW29 · <span className="text-primary font-semibold">season points awarded →</span></p>
              </div>
            </div>

            {/* ── Stage 2: Winner → Season Table ── */}
            <div
              className="relative overflow-hidden rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(123,108,246,0.09) 0%, rgba(255,255,255,0.02) 100%)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 0 0 1px rgba(123,108,246,0.28), 0 16px 48px rgba(0,0,0,0.35)',
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(123,108,246,0.9), transparent)' }} />
              <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-[10px] font-bold text-primary">STAGE 02</span>
                  <span className="text-white/20">·</span>
                  <span className="font-heading text-[10px] font-bold uppercase tracking-widest text-white/30">Season Table</span>
                </div>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 font-heading text-[10px] font-bold text-primary">GW29 Result</span>
              </div>

              <div className="p-4">
                {/* H2H outcome — emphasise the 3-pt prize, not the game score */}
                <div className="mb-4 space-y-2">
                  <div
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{
                      background: 'linear-gradient(90deg, rgba(123,108,246,0.18), rgba(123,108,246,0.04))',
                      boxShadow: '0 0 0 1px rgba(123,108,246,0.28)',
                    }}
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/25 font-heading text-xs font-bold text-primary ring-1 ring-primary/50">T</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm font-bold text-white">TheGaffer</p>
                      <p className="text-[10px] text-white/40">Wins the head-to-head</p>
                    </div>
                    <div className="flex items-baseline gap-0.5">
                      <span className="font-heading text-2xl font-bold" style={{ color: '#7b6cf6', textShadow: '0 0 12px rgba(123,108,246,0.6)' }}>+3</span>
                      <span className="text-[10px] text-white/40 uppercase tracking-wide ml-1">season pts</span>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.03)', boxShadow: '0 0 0 1px rgba(255,255,255,0.06)' }}
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/5 font-heading text-xs font-bold text-white/25 ring-1 ring-white/10">M</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-sm font-bold text-white/35">Marcus_89</p>
                      <p className="text-[10px] text-white/25">Loses the head-to-head</p>
                    </div>
                    <div className="flex items-baseline gap-0.5">
                      <span className="font-heading text-2xl font-bold text-white/20">+0</span>
                      <span className="text-[10px] text-white/15 uppercase tracking-wide ml-1">season pts</span>
                    </div>
                  </div>

                  <p className="pt-1 text-center text-[10px] text-white/30">
                    Every gameweek is a contest for{' '}
                    <span className="font-semibold text-white/50">3 season points</span>
                    {' '}— winner takes all.
                  </p>
                </div>

                {/* Table header */}
                <div className="mb-1.5 grid grid-cols-[20px_1fr_40px_32px] gap-2 px-3">
                  <span className="font-heading text-[9px] font-bold uppercase tracking-wider text-white/20">#</span>
                  <span className="font-heading text-[9px] font-bold uppercase tracking-wider text-white/20">Player</span>
                  <span className="text-right font-heading text-[9px] font-bold uppercase tracking-wider text-white/20">GW</span>
                  <span className="text-right font-heading text-[9px] font-bold uppercase tracking-wider text-white/20">Pts</span>
                </div>

                {/* Table rows */}
                <div className="space-y-1">
                  {([
                    { pos: 1, name: 'TopPickr',   gw: '—',  pts: 71, up: false, highlight: false, dim: false },
                    { pos: 2, name: 'TheGaffer',  gw: '+3', pts: 67, up: true,  highlight: true,  dim: false },
                    { pos: 3, name: 'SoccerSage', gw: '—',  pts: 60, up: false, highlight: false, dim: false },
                    { pos: 4, name: 'GWKing',     gw: '—',  pts: 56, up: false, highlight: false, dim: false },
                    { pos: 5, name: 'Marcus_89',  gw: '+0', pts: 53, up: false, highlight: false, dim: true  },
                  ]).map(({ pos, name, gw, pts, up, highlight, dim }) => (
                    <div
                      key={name}
                      className="grid grid-cols-[20px_1fr_40px_32px] items-center gap-2 rounded-lg px-3 py-2"
                      style={{
                        background: highlight
                          ? 'linear-gradient(90deg, rgba(123,108,246,0.15), rgba(123,108,246,0.04))'
                          : 'rgba(255,255,255,0.03)',
                        boxShadow: highlight ? '0 0 0 1px rgba(123,108,246,0.22)' : 'none',
                      }}
                    >
                      <span className={cn('font-heading text-xs font-bold text-center', highlight ? 'text-primary' : 'text-white/20')}>{pos}</span>
                      <span className={cn('font-heading text-xs font-bold truncate', highlight ? 'text-white' : dim ? 'text-white/35' : 'text-white/60')}>{name}</span>
                      <span className={cn('text-right font-heading text-[10px] font-bold', up ? 'text-emerald-400' : 'text-white/20')}>{gw}</span>
                      <span className={cn('text-right font-heading text-xs font-bold', highlight ? 'text-primary' : 'text-white/40')}>{pts}</span>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-center text-[9px] uppercase tracking-wider text-white/20">Win = 3pts · Draw = 1pt · Loss = 0pts</p>
              </div>
            </div>

          </div>

        </div>
      </section>

      <section id="players" className="border-t border-border bg-card/40 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Loved by the terraces</p>
              <h2 className="mt-3 font-heading text-4xl font-bold uppercase tracking-tight sm:text-5xl">
                Join {SEASON_STATS.players.toLocaleString()} managers
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              From the office sweepstake to the Sunday league lads, Triple Pick keeps every gameweek interesting.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.handle}
                className="relative flex flex-col rounded-2xl p-7"
                style={{
                  background: 'linear-gradient(135deg, rgba(123,108,246,0.07) 0%, rgba(255,255,255,0.02) 100%)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 0 0 1px rgba(123,108,246,0.25), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-px rounded-t-2xl"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(123,108,246,0.6), transparent)' }}
                />
                <Quote className="size-7 text-primary" />
                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-pretty">
                  {`"${t.quote}"`}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-white/8 pt-5">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 font-heading font-bold text-primary ring-1 ring-primary/40">
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
            This application is 100% unofficial and is not affiliated with, endorsed by, or associated with any official football club, league, or governing body.
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
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  )
}

type ResultType = 'away-win' | 'home-win' | 'draw' | 'loss'

const RESULT_STYLES: Record<ResultType, { label: string; color: string; bg: string }> = {
  'away-win': { label: 'Away win', color: '#7b6cf6', bg: 'rgba(123,108,246,0.18)' },
  'home-win': { label: 'Home win', color: '#ffffff', bg: 'rgba(255,255,255,0.10)' },
  'draw':     { label: 'Draw',     color: '#f59e0b', bg: 'rgba(245,158,11,0.14)' },
  'loss':     { label: 'Loss',     color: 'rgba(255,255,255,0.28)', bg: 'rgba(255,255,255,0.04)' },
}

function ResultBadge({ result, pts }: { result: ResultType; pts: number }) {
  const s = RESULT_STYLES[result]
  return (
    <div
      className="flex w-[72px] shrink-0 flex-col items-center rounded-md py-1"
      style={{ background: s.bg }}
    >
      <span className="font-heading text-sm font-bold leading-none" style={{ color: s.color }}>
        {pts}pt{pts !== 1 ? 's' : ''}
      </span>
      <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide" style={{ color: s.color, opacity: 0.65 }}>
        {s.label}
      </span>
    </div>
  )
}

function PhoneMockup() {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: 240,
        height: 490,
        borderRadius: 40,
        background: '#0a0a14',
        border: '2px solid rgba(255,255,255,0.13)',
        boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 48px 96px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.07)',
      }}
    >
      {/* status bar */}
      <div className="flex items-center justify-between px-5 pt-3.5">
        <span className="font-heading text-[10px] font-bold text-white">9:41</span>
        <div style={{ width: 56, height: 11, borderRadius: 10, background: '#0a0a14', border: '1.5px solid rgba(255,255,255,0.12)' }} />
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', letterSpacing: 2 }}>●●●</span>
      </div>

      <div className="px-4 pt-3">
        {/* app header */}
        <div className="mb-4 flex items-center justify-between">
          <span className="font-heading text-sm font-bold uppercase tracking-wide text-white">Triple Pick</span>
          <span
            className="font-heading text-[9px] font-bold"
            style={{ background: 'rgba(123,108,246,0.22)', color: '#7b6cf6', borderRadius: 99, padding: '2px 9px', border: '1px solid rgba(123,108,246,0.35)' }}
          >
            GW 1 · OPEN
          </span>
        </div>

        {/* score card */}
        <div
          className="mb-2.5 rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 4 }}>Your Score</p>
          <p className="font-heading font-bold text-white" style={{ fontSize: 42, lineHeight: 1 }}>7</p>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.38)', marginTop: 4 }}>pts · 3 picks made</p>
        </div>

        {/* picks card */}
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>
            Your Picks · GW1
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { team: 'Arsenal',   label: 'AWAY WIN · 4PTS', green: true  },
              { team: 'Liverpool', label: 'HOME WIN · 3PTS', green: true  },
              { team: 'Man City',  label: 'PENDING',         green: false },
            ].map(({ team, label, green }) => (
              <div key={team} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="font-heading font-bold text-white" style={{ fontSize: 13 }}>{team}</span>
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    padding: '3px 7px',
                    borderRadius: 6,
                    color: green ? '#4ade80' : 'rgba(255,255,255,0.35)',
                    background: green ? 'rgba(74,222,128,0.10)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${green ? 'rgba(74,222,128,0.22)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="mt-3 flex w-full items-center justify-center rounded-2xl font-heading font-bold text-white"
          style={{ background: '#7b6cf6', padding: '11px 0', fontSize: 11, letterSpacing: '0.1em', boxShadow: '0 4px 20px rgba(123,108,246,0.45)' }}
        >
          Change Picks
        </div>
      </div>

      {/* bottom nav */}
      <div
        className="absolute inset-x-0 bottom-0 flex items-end justify-around px-2 pb-4 pt-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
      >
        {[
          { label: 'Home',    active: true  },
          { label: 'Picks',   active: false },
          { label: 'Table',   active: false },
          { label: 'Profile', active: false },
        ].map(({ label, active }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: active ? 'rgba(123,108,246,0.35)' : 'rgba(255,255,255,0.08)', border: `1.5px solid ${active ? '#7b6cf6' : 'rgba(255,255,255,0.12)'}` }} />
            <span style={{ fontSize: 8, color: active ? '#7b6cf6' : 'rgba(255,255,255,0.25)', fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
