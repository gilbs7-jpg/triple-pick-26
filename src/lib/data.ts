// ── Types ──────────────────────────────────────────────────────────────────

export type Fixture = {
  home: string
  away: string
  time?: string
  date?: string
  homeScore?: number
  awayScore?: number
  status: 'scheduled' | 'live' | 'finished'
}

// ── Current user ───────────────────────────────────────────────────────────

export const CURRENT_USER = {
  username: 'Jason',
  email: 'jason.gilbert672@gmail.com',
  picks: [] as string[],
  joined: 'Aug 2026',
}

// ── Gameweek ───────────────────────────────────────────────────────────────

export const CURRENT_GAMEWEEK = 1

export function getLockTime() {
  return new Date('2026-08-21T18:00:00Z')
}

// ── Season stats (landing page) ────────────────────────────────────────────

export const SEASON_STATS = {
  players: 1247,
  prizePool: '£0',
}

// ── Testimonials ───────────────────────────────────────────────────────────

export const TESTIMONIALS = [
  {
    name: 'Marcus T',
    handle: '@marcus_picks',
    quote: 'Finally a prediction game that rewards knowledge over luck. Away wins at 4 points is a masterstroke.',
  },
  {
    name: 'Sarah K',
    handle: '@sarah_football',
    quote: 'Our office league on Triple Pick Private has made every gameweek unmissable. Even the Monday night games.',
  },
  {
    name: 'Dev P',
    handle: '@devpatel_fc',
    quote: 'The team usage limit forces you to actually think strategically. You cannot just pick Man City every week.',
  },
]

// ── Season leaderboard ─────────────────────────────────────────────────────

export const SEASON_LEADERBOARD = [
  { rank: 1, username: 'TopPickerFC', total: 0, gwScore: 0, isUser: false, picks: [] as string[] },
  { rank: 2, username: 'Jason', total: 0, gwScore: 0, isUser: true, picks: [] as string[] },
]

// ── Pro ────────────────────────────────────────────────────────────────────

export const PRO_DIVISION = 'Newbie Division'

export const PRO_FIXTURE = {
  home: { username: 'Jason', record: '0W 0D 0L', isUser: true },
  away: { username: 'TikiTakaTom', record: '0W 0D 0L', isUser: false },
}

export const PRO_TABLE = [
  { rank: 1, username: 'Jason', played: 0, wins: 0, draws: 0, losses: 0, points: 0, isUser: true, form: [] as string[] },
  { rank: 2, username: 'TikiTakaTom', played: 0, wins: 0, draws: 0, losses: 0, points: 0, isUser: false, form: [] as string[] },
]

// ── Private league ─────────────────────────────────────────────────────────

export const PRIVATE_LEAGUE = {
  name: 'The Office League',
  code: 'TIGER-42',
  members: 4,
}

export const PRIVATE_TABLE = [
  { rank: 1, username: 'Jason', played: 0, won: 0, drawn: 0, lost: 0, points: 0, gwScore: 0, trophies: 0, total: 0, isUser: true },
  { rank: 2, username: 'ColleagueFC', played: 0, won: 0, drawn: 0, lost: 0, points: 0, gwScore: 0, trophies: 0, total: 0, isUser: false },
]

export const WEEK_FIXTURES: Fixture[] = [
  { home: 'ars', away: 'mci', time: '12:30', date: 'Sat 16 Aug', status: 'scheduled' },
  { home: 'liv', away: 'mnu', time: '17:30', date: 'Sat 16 Aug', status: 'scheduled' },
  { home: 'che', away: 'tot', time: '14:00', date: 'Sun 17 Aug', status: 'scheduled' },
]

// ── Trophy room ────────────────────────────────────────────────────────────

export const TROPHIES = {
  crown: 0,
  gold: 0,
  silver: 0,
  bronze: 0,
}

export const CAREER_STATS = {
  gamesPlayed: 0,
  totalPoints: 0,
  bestGameweek: 0,
  h2hWinRate: 0,
  avgScore: 0,
  favouriteTeams: ['ars', 'liv', 'mci'],
}

export const SEASON_HISTORY = [
  { season: '2026/27', proResult: 'Newbie Division', seasonRank: 2, trophies: 0, points: 0 },
]

// ── Hall of Fame ───────────────────────────────────────────────────────────

export const CHAMPIONS = [
  { season: '2026/27', seasonChamp: 'TBC', crownWinner: 'TBC', points: 0 },
]

export const TROPHY_LEADERBOARD: {
  rank: number
  username: string
  crowns: number
  gold: number
  silver: number
  bronze: number
  total: number
  isUser: boolean
}[] = []

// ── Teams ──────────────────────────────────────────────────────────────────

export const TEAMS = [
  { id: 'ars', name: 'Arsenal', abbr: 'ARS', short: 'Arsenal', color: '#EF0107' },
  { id: 'avl', name: 'Aston Villa', abbr: 'AVL', short: 'Villa', color: '#95BFE5' },
  { id: 'bou', name: 'Bournemouth', abbr: 'BOU', short: 'Bmouth', color: '#DA291C' },
  { id: 'bre', name: 'Brentford', abbr: 'BRE', short: 'Brentfd', color: '#E30613' },
  { id: 'bha', name: 'Brighton', abbr: 'BHA', short: 'Brighton', color: '#0057B8' },
  { id: 'che', name: 'Chelsea', abbr: 'CHE', short: 'Chelsea', color: '#034694' },
  { id: 'cry', name: 'Crystal Palace', abbr: 'CRY', short: 'C Palace', color: '#1B458F' },
  { id: 'eve', name: 'Everton', abbr: 'EVE', short: 'Everton', color: '#003399' },
  { id: 'ful', name: 'Fulham', abbr: 'FUL', short: 'Fulham', color: '#CC0000' },
  { id: 'ips', name: 'Ipswich', abbr: 'IPS', short: 'Ipswich', color: '#0044A9' },
  { id: 'lei', name: 'Leicester', abbr: 'LEI', short: 'Leicester', color: '#003090' },
  { id: 'liv', name: 'Liverpool', abbr: 'LIV', short: 'Liverpool', color: '#C8102E' },
  { id: 'mci', name: 'Man City', abbr: 'MCI', short: 'Man City', color: '#6CABDD' },
  { id: 'mnu', name: 'Man United', abbr: 'MNU', short: 'Man Utd', color: '#DA291C' },
  { id: 'new', name: 'Newcastle', abbr: 'NEW', short: 'Newcastle', color: '#241F20' },
  { id: 'nfo', name: 'Nott Forest', abbr: 'NFO', short: 'Forest', color: '#DD0000' },
  { id: 'sou', name: 'Southampton', abbr: 'SOU', short: 'Soton', color: '#D71920' },
  { id: 'tot', name: 'Tottenham', abbr: 'TOT', short: 'Spurs', color: '#132257' },
  { id: 'whu', name: 'West Ham', abbr: 'WHU', short: 'West Ham', color: '#7A263A' },
  { id: 'wol', name: 'Wolves', abbr: 'WOL', short: 'Wolves', color: '#FDB913' },
]

export function teamById(id: string) {
  return TEAMS.find(t => t.id === id) ?? null
}