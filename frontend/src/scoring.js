// ── SHARED CORE ───────────────────────────────────────────────────────────────
// Constants + scoring engine shared by the React app (App.jsx) and the automated
// Vercel cron job (api/cron-update.js). Keep this framework-free (no React/Vite)
// so it imports cleanly in both the browser bundle and the Node serverless runtime.

// ── JSONBIN CONFIG ────────────────────────────────────────────────────────────
export const JSONBIN_PICKS_ID = "6a289e9dda38895dfea3718d";
export const JSONBIN_STATE_ID = "6a29f4e7f5f4af5e29db9b7d";
export const JSONBIN_API_KEY  = "$2a$10$SM58O3uX4Dttskq/9geD5OytFCpgoclTLo8BWMo6gvk4QBQI5y9Ri";
export const PICKS_URL        = `https://api.jsonbin.io/v3/b/${JSONBIN_PICKS_ID}`;
export const STATE_URL        = `https://api.jsonbin.io/v3/b/${JSONBIN_STATE_ID}`;

export const ROUNDS       = ['GW1','GW2','GW3','GW4','GW5','GW6','GW7','GW8'];
export const ROUND_LABELS = { GW1:'Gameweek 1', GW2:'Gameweek 2', GW3:'Gameweek 3', GW4:'Gameweek 4', GW5:'Gameweek 5', GW6:'Gameweek 6', GW7:'Gameweek 7', GW8:'Gameweek 8' };
export const ROUND_SHORT  = { GW1:'GW 1', GW2:'GW 2', GW3:'GW 3', GW4:'GW 4', GW5:'GW 5', GW6:'GW 6', GW7:'GW 7', GW8:'GW 8' };
export const ADMIN_USER   = 'Jason Gilbert';

// Maps each gameweek to how it's addressed on football-data.org.
// The group stage is addressable by matchday (1–3); the knockout rounds are
// NOT — football-data.org only exposes them via the `stage` field, so those
// gameweeks fetch the whole competition and filter by stage instead.
//   GW4 → Round of 32, GW5 → Round of 16, GW6 → QF, GW7 → SF,
//   GW8 → Final + 3rd-place playoff (4 teams, so 3 picks are still possible).
export const GW_TO_QUERY = {
  GW1: { matchday: 1 },
  GW2: { matchday: 2 },
  GW3: { matchday: 3 },
  GW4: { stage: 'LAST_32' },
  GW5: { stage: 'LAST_16' },
  GW6: { stage: 'QUARTER_FINALS' },
  GW7: { stage: 'SEMI_FINALS' },
  GW8: { stage: 'FINAL,THIRD_PLACE' },
};

// Build the football-data.org query string for a gameweek's mapping.
export const fixtureQuery = (gw) => {
  const q = GW_TO_QUERY[gw];
  if (!q) return null;
  return q.matchday ? `matchday=${q.matchday}` : `stage=${encodeURIComponent(q.stage)}`;
};

// ── PLAYERS ───────────────────────────────────────────────────────────────────
export const PLAYER_SLUGS = {
  you:       'Jason Gilbert',
  jona_m:    'Jona Moore',
  adam_b:    'Adam Brand',
  jamie_b:   'Jamie Brown',
  richard_l: 'Richard Lee',
  lianne_c:  'Lianne Conway',
  mark_b:    'Mark Bentley',
  kieran_s:  'Kieran Smyth',
  amelia_a:  'Amelia Wood',
  gemma_d:   'Gemma D',
};
export const ALL_PLAYERS = Object.values(PLAYER_SLUGS);

// ── H2H FIXTURE SCHEDULE ──────────────────────────────────────────────────────
export const H2H_FIXTURES = {
  GW1: [['Jason Gilbert','Gemma D'],['Jona Moore','Adam Brand'],['Jamie Brown','Richard Lee'],['Lianne Conway','Mark Bentley'],['Kieran Smyth','Amelia Wood']],
  GW2: [['Jason Gilbert','Amelia Wood'],['Gemma D','Kieran Smyth'],['Mark Bentley','Jamie Brown'],['Richard Lee','Jona Moore'],['Adam Brand','Lianne Conway']],
  GW3: [['Jason Gilbert','Mark Bentley'],['Amelia Wood','Richard Lee'],['Kieran Smyth','Adam Brand'],['Gemma D','Lianne Conway'],['Jona Moore','Jamie Brown']],
  GW4: [['Jason Gilbert','Richard Lee'],['Mark Bentley','Gemma D'],['Lianne Conway','Kieran Smyth'],['Adam Brand','Jamie Brown'],['Jona Moore','Amelia Wood']],
  GW5: [['Jason Gilbert','Adam Brand'],['Richard Lee','Lianne Conway'],['Gemma D','Jona Moore'],['Kieran Smyth','Jamie Brown'],['Amelia Wood','Mark Bentley']],
  GW6: [['Jason Gilbert','Lianne Conway'],['Adam Brand','Amelia Wood'],['Richard Lee','Mark Bentley'],['Jona Moore','Kieran Smyth'],['Jamie Brown','Gemma D']],
  GW7: [['Jason Gilbert','Jona Moore'],['Lianne Conway','Jamie Brown'],['Adam Brand','Gemma D'],['Amelia Wood','Richard Lee'],['Mark Bentley','Kieran Smyth']],
  // GW8 (Final week) — auto-generated, all five pairings are new vs GW1–GW7.
  // Confirm/adjust to match the intended league schedule.
  GW8: [['Jason Gilbert','Kieran Smyth'],['Gemma D','Richard Lee'],['Jona Moore','Lianne Conway'],['Adam Brand','Mark Bentley'],['Jamie Brown','Amelia Wood']],
};

// ── SCORING ENGINE ────────────────────────────────────────────────────────────
export function basePoints(result) {
  if (result === 'W') return 3;
  if (result === 'D') return 1;
  return 0;
}

export function calcPlayerScore(picks, results) {
  if (!picks || picks.length === 0) return null;
  return picks.reduce((sum, pick) => {
    const result = results?.[pick.id] ?? null;
    let pts = basePoints(result);
    if (pick.isArmband && result === 'W') pts += 1;
    return sum + pts;
  }, 0);
}

export function captainWon(picks, results) {
  if (!picks || picks.length === 0) return false;
  const cap = picks.find(p => p.isArmband);
  if (!cap) return false;
  return (results?.[cap.id] ?? null) === 'W';
}

export function calcRoundH2H(allPicks, results, gwKey) {
  const fixtures = H2H_FIXTURES[gwKey] || [];
  const out = {};
  fixtures.forEach(([p1, p2]) => {
    const picks1 = allPicks?.[gwKey]?.[p1]?.picks ?? null;
    const picks2 = allPicks?.[gwKey]?.[p2]?.picks ?? null;
    const score1 = calcPlayerScore(picks1, results);
    const score2 = calcPlayerScore(picks2, results);
    const f1 = score1 === null, f2 = score2 === null;
    let h1 = 0, h2 = 0;
    let o1 = 'L', o2 = 'L';
    if (!f1 && !f2) {
      if (score1 > score2)      { h1=3; o1='W'; o2='L'; }
      else if (score2 > score1) { h2=3; o1='L'; o2='W'; }
      else                      { h1=1; h2=1; o1='D'; o2='D'; }
    }
    else if (f1 && !f2) { h2=3; o1='L'; o2='W'; }
    else if (!f1 && f2) { h1=3; o1='W'; o2='L'; }
    if (!f1 && captainWon(picks1, results)) h1 += 1;
    if (!f2 && captainWon(picks2, results)) h2 += 1;
    out[p1] = { h2hPts:h1, score:score1??0, forfeited:f1, outcome:o1 };
    out[p2] = { h2hPts:h2, score:score2??0, forfeited:f2, outcome:o2 };
  });
  return out;
}

export function buildLeagueTable(allPicks, allResults) {
  const table = {};
  ALL_PLAYERS.forEach(p => { table[p] = {name:p,played:0,w:0,d:0,l:0,h2hPts:0,totalScore:0,winsSelected:0}; });
  ROUNDS.forEach(gw => {
    const results = allResults?.[gw];
    if (!results) return;
    const h2h = calcRoundH2H(allPicks, results, gw);
    Object.entries(h2h).forEach(([player, data]) => {
      if (!table[player]) return;
      table[player].played++;
      table[player].h2hPts    += data.h2hPts;
      table[player].totalScore += data.score;
      if (data.outcome==='W') table[player].w++;
      else if (data.outcome==='D') table[player].d++;
      else table[player].l++;
      (allPicks?.[gw]?.[player]?.picks ?? []).forEach(pick => {
        if (results[pick.id]==='W') table[player].winsSelected++;
      });
    });
  });
  return Object.values(table).sort((a,b) => b.h2hPts-a.h2hPts || b.totalScore-a.totalScore || b.winsSelected-a.winsSelected);
}
