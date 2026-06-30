export interface TeamToken {
  id: string
  c1: string
  c2: string
  c3: string
}

export const TEAM_TOKENS: Record<string, TeamToken> = {
  ars: { id: 'ars', c1: '#EF0107', c2: '#FFFFFF', c3: '#8B0000' },
  avl: { id: 'avl', c1: '#95BFE5', c2: '#670E36', c3: '#3A0720' },
  bou: { id: 'bou', c1: '#DA291C', c2: '#000000', c3: '#7A0A06' },
  bre: { id: 'bre', c1: '#E30613', c2: '#FFD700', c3: '#8B0000' },
  bha: { id: 'bha', c1: '#0057B8', c2: '#FFFFFF', c3: '#003A7A' },
  che: { id: 'che', c1: '#034694', c2: '#DBA111', c3: '#022A5A' },
  cry: { id: 'cry', c1: '#1B458F', c2: '#C4122E', c3: '#0F2856' },
  eve: { id: 'eve', c1: '#003399', c2: '#FFFFFF', c3: '#001F66' },
  ful: { id: 'ful', c1: '#CC0000', c2: '#FFFFFF', c3: '#1A1A1A' },
  ips: { id: 'ips', c1: '#0044A9', c2: '#FFFFFF', c3: '#002D72' },
  lei: { id: 'lei', c1: '#003090', c2: '#FDBE11', c3: '#001F60' },
  liv: { id: 'liv', c1: '#C8102E', c2: '#F6EB61', c3: '#7A0018' },
  mci: { id: 'mci', c1: '#6CABDD', c2: '#FFFFFF', c3: '#3A7AA8' },
  mnu: { id: 'mnu', c1: '#DA291C', c2: '#FFE500', c3: '#8B0000' },
  new: { id: 'new', c1: '#241F20', c2: '#FFFFFF', c3: '#41B6E6' },
  nfo: { id: 'nfo', c1: '#DD0000', c2: '#FFFFFF', c3: '#880000' },
  sou: { id: 'sou', c1: '#D71920', c2: '#FFFFFF', c3: '#8B0000' },
  sun: { id: 'sun', c1: '#EB172B', c2: '#FFFFFF', c3: '#8B0A0A' },
  tot: { id: 'tot', c1: '#132257', c2: '#FFFFFF', c3: '#0A1535' },
  whu: { id: 'whu', c1: '#7A263A', c2: '#1BB1E7', c3: '#4D1625' },
  cov: { id: 'cov', c1: '#59B2D5', c2: '#FFFFFF', c3: '#2A7A9E' },
  hul: { id: 'hul', c1: '#F5A12E', c2: '#000000', c3: '#8B5C10' },
  lee: { id: 'lee', c1: '#1D428A', c2: '#FFCD00', c3: '#0D2455' },
}

function lighten(hex: string, pct: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const f = pct / 100
  const nr = Math.min(255, Math.round(r + (255 - r) * f))
  const ng = Math.min(255, Math.round(g + (255 - g) * f))
  const nb = Math.min(255, Math.round(b + (255 - b) * f))
  return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
}

function hexPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30)
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }
  return pts.join(' ')
}

export function generateTokenSVG(token: TeamToken, abbr: string, size = 36): string {
  const cx = size / 2
  const cy = size / 2
  const sc = size / 36
  const R = 15 * sc
  const Rm = 10.5 * sc
  const Ri = 6.5 * sc
  const op = token.id === 'new' ? token.c3 : lighten(token.c1, 38)
  const fs = Math.round(7.5 * sc)
  const o = hexPoints(cx, cy, R)
  const m = hexPoints(cx, cy, Rm)
  const inn = hexPoints(cx, cy, Ri)
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${abbr}"><defs><radialGradient id="rg-${token.id}" cx="40%" cy="28%" r="65%"><stop offset="0%" stop-color="${op}"/><stop offset="52%" stop-color="${token.c1}"/><stop offset="100%" stop-color="${token.c3}"/></radialGradient><radialGradient id="gl-${token.id}" cx="45%" cy="18%" r="58%"><stop offset="0%" stop-color="rgba(255,255,255,0.52)"/><stop offset="60%" stop-color="rgba(255,255,255,0.08)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient><filter id="sh-${token.id}" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="${1.5*sc}" stdDeviation="${1.8*sc}" flood-color="${token.c3}" flood-opacity="0.65"/></filter><clipPath id="cp-${token.id}"><polygon points="${o}"/></clipPath></defs><polygon points="${o}" fill="${token.c3}" opacity="0.4" transform="translate(0,${1.8*sc})" filter="url(#sh-${token.id})"/><polygon points="${o}" fill="url(#rg-${token.id})"/><polygon points="${m}" fill="none" stroke="${token.c2}" stroke-width="${sc}" opacity="0.5"/><polygon points="${inn}" fill="${token.c2}" opacity="0.08"/><polygon points="${inn}" fill="none" stroke="${token.c2}" stroke-width="${0.6*sc}" opacity="0.4"/><polygon points="${o}" fill="url(#gl-${token.id})" clip-path="url(#cp-${token.id})"/><polygon points="${o}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="${0.6*sc}"/><text x="${cx}" y="${cy+fs*0.42}" text-anchor="middle" font-family="'Oswald','Bebas Neue',Impact,sans-serif" font-size="${fs}" font-weight="700" fill="${token.c2}" opacity="0.95">${abbr}</text></svg>`
}
