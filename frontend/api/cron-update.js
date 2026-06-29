// Vercel Cron Job — automatically updates match results and recalculates the league
// table. Scheduled in vercel.json. This is the unattended equivalent of the Admin
// panel's "Fetch Results" + "Calculate" buttons.
//
// On each run it:
//   1. Loads the current state (results + fixtures) and everyone's picks from JSONBin.
//   2. Finds gameweeks that are in-progress or recently finished (from cached fixtures).
//   3. Fetches those matchdays from football-data.org and maps W/D/L per nation.
//   4. Merges results into the state, rebuilds the standings, and writes it all back —
//      but only if something actually changed (to stay within free-tier quotas).

import {
  ROUNDS, GW_TO_QUERY, PICKS_URL, STATE_URL, JSONBIN_API_KEY,
  buildLeagueTable,
} from '../src/scoring.js';

const FOOTBALL_API = 'https://api.football-data.org/v4/competitions/WC/matches';

// A gameweek is worth fetching if its matches have kicked off and the last kickoff
// was within this many days — i.e. it's live or recently finished. This keeps us
// inside football-data.org's free-tier rate limit (10 requests/min).
const RECENT_DAYS = 4;

function gwIsActive(fixtures, now) {
  const kickoffs = (fixtures || [])
    .map(f => new Date(f.utcDate).getTime())
    .filter(t => !isNaN(t));
  if (kickoffs.length === 0) return false;
  const earliest = Math.min(...kickoffs);
  const latest   = Math.max(...kickoffs);
  return now >= earliest && now <= latest + RECENT_DAYS * 24 * 60 * 60 * 1000;
}

// Map football-data.org matches to { nationId: 'W'|'D'|'L' }. Mirrors api/results.js.
function mapMatchesToResults(matches) {
  const results = {};
  matches.forEach(match => {
    const status = match.status;
    if (status !== 'FINISHED' && status !== 'IN_PLAY' && status !== 'PAUSED') return;
    const score = match.score;
    const homeGoals = score?.fullTime?.home ?? score?.regularTime?.home ?? null;
    const awayGoals = score?.fullTime?.away ?? score?.regularTime?.away ?? null;
    if (homeGoals === null || awayGoals === null) return;

    let homeResult, awayResult;
    if (homeGoals > awayGoals)      { homeResult = 'W'; awayResult = 'L'; }
    else if (awayGoals > homeGoals) { homeResult = 'L'; awayResult = 'W'; }
    else                            { homeResult = 'D'; awayResult = 'D'; }
    if (score.winner === 'HOME_TEAM')      { homeResult = 'W'; awayResult = 'L'; }
    else if (score.winner === 'AWAY_TEAM') { homeResult = 'L'; awayResult = 'W'; }

    const homeId = match.homeTeam?.tla?.toLowerCase();
    const awayId = match.awayTeam?.tla?.toLowerCase();
    if (homeId) results[homeId] = homeResult;
    if (awayId) results[awayId] = awayResult;
  });
  return results;
}

export default async function handler(req, res) {
  // Optional shared-secret guard. Set CRON_SECRET in Vercel to lock the endpoint;
  // Vercel Cron automatically sends it as a Bearer token. Leave unset to allow open
  // calls (handy for manual testing).
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'FOOTBALL_DATA_API_KEY not configured' });

  try {
    // 1. Load state + picks from JSONBin
    const [stateRes, picksRes] = await Promise.all([
      fetch(STATE_URL, { headers: { 'X-Master-Key': JSONBIN_API_KEY } }),
      fetch(PICKS_URL, { headers: { 'X-Master-Key': JSONBIN_API_KEY } }),
    ]);
    const stateData = await stateRes.json();
    const picksData = await picksRes.json();
    const state = stateData.record || { results: {}, fixtures: {}, leagueTable: {} };
    if (!state.results)  state.results  = {};
    if (!state.fixtures) state.fixtures = {};
    const allPicks = picksData.record?.playerPicks ?? {};

    const before = JSON.stringify(state.results);
    const now = Date.now();
    const processed = [];

    // 2 + 3. Fetch + merge results for each active gameweek
    for (const gw of ROUNDS) {
      if (!gwIsActive(state.fixtures[gw], now)) continue;
      const q = GW_TO_QUERY[gw];
      if (!q) continue;

      // Group stage filters by matchday; knockout rounds fetch all and filter by stage.
      const url = q.matchday ? `${FOOTBALL_API}?matchday=${q.matchday}` : FOOTBALL_API;
      const apiRes = await fetch(url, {
        headers: { 'X-Auth-Token': apiKey },
      });
      if (!apiRes.ok) { processed.push({ gw, ok: false, status: apiRes.status }); continue; }

      const apiData = await apiRes.json();
      let matches = apiData.matches || [];
      if (q.stage) {
        const wanted = q.stage.split(',').map(s => s.trim().toUpperCase());
        matches = matches.filter(m => wanted.includes((m.stage || '').toUpperCase()));
      }
      const fetched = mapMatchesToResults(matches);
      if (Object.keys(fetched).length === 0) { processed.push({ gw, ok: true, updated: 0 }); continue; }

      // Merge over existing results, preserving any manual Admin entries the API omits.
      state.results[gw] = { ...(state.results[gw] || {}), ...fetched };
      processed.push({ gw, ok: true, updated: Object.keys(fetched).length });
    }

    // 4. Only rebuild + write if results actually changed (conserve JSONBin quota)
    const changed = JSON.stringify(state.results) !== before;
    if (changed) {
      state.leagueTable = buildLeagueTable(allPicks, state.results);
      await fetch(STATE_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_API_KEY },
        body: JSON.stringify(state),
      });
    }

    return res.status(200).json({ ok: true, changed, processed, ranAt: new Date().toISOString() });
  } catch (err) {
    console.error('cron-update error:', err);
    return res.status(500).json({ error: err.message });
  }
}
