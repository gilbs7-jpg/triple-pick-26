import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  PICKS_URL, STATE_URL, JSONBIN_API_KEY,
  ROUNDS, ROUND_LABELS, ROUND_SHORT, ADMIN_USER, fixtureQuery,
  PLAYER_SLUGS, ALL_PLAYERS, H2H_FIXTURES,
  basePoints, calcPlayerScore, captainWon, calcRoundH2H, buildLeagueTable,
} from './scoring.js';

// ── TLA → FLAG EMOJI ──────────────────────────────────────────────────────────
// Static reference data covering all 48 World Cup 2026 nations.
// Keyed by football-data.org TLA codes. Country→flag never changes, so this is
// the only hardcoded fixture-related data — actual fixtures come live from the API.
const TLA_TO_FLAG = {
  // Hosts
  USA:'🇺🇸', MEX:'🇲🇽', CAN:'🇨🇦',
  // Europe (16)
  ENG:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', FRA:'🇫🇷', CRO:'🇭🇷', NOR:'🇳🇴', POR:'🇵🇹', GER:'🇩🇪',
  NED:'🇳🇱', SUI:'🇨🇭', SCO:'🏴󠁧󠁢󠁳󠁣󠁴󠁿', ESP:'🇪🇸', AUT:'🇦🇹', BEL:'🇧🇪',
  BIH:'🇧🇦', SWE:'🇸🇪', TUR:'🇹🇷', CZE:'🇨🇿',
  // South America (6)
  ARG:'🇦🇷', BRA:'🇧🇷', COL:'🇨🇴', ECU:'🇪🇨', PAR:'🇵🇾', URU:'🇺🇾',
  // Africa (9)
  MAR:'🇲🇦', RSA:'🇿🇦', TUN:'🇹🇳', ALG:'🇩🇿', EGY:'🇪🇬', GHA:'🇬🇭',
  CIV:'🇨🇮', SEN:'🇸🇳', CPV:'🇨🇻',
  // Asia (8)
  JPN:'🇯🇵', KOR:'🇰🇷', IRN:'🇮🇷', AUS:'🇦🇺', SAU:'🇸🇦', QAT:'🇶🇦',
  JOR:'🇯🇴', UZB:'🇺🇿',
  // CONCACAF (3 non-host)
  PAN:'🇵🇦', HAI:'🇭🇹', CUW:'🇨🇼',
  // Oceania (1)
  NZL:'🇳🇿',
  // Common alternate codes football-data.org may use
  KSA:'🇸🇦', // Saudi Arabia alt
  IRR:'🇮🇷', // Iran alt
  TRK:'🇹🇷', // Türkiye alt
  NLD:'🇳🇱', // Netherlands alt
  IRQ:'🇮🇶', // Iraq
  COD:'🇨🇩', // Congo DR
  CGO:'🇨🇬', // Congo Republic
  URY:'🇺🇾', // Uruguay alt (ISO code)
  SVK:'🇸🇰', SRB:'🇷🇸', // safety extras in case of playoff entrants
};
const flagFor = (tla) => (tla && TLA_TO_FLAG[tla.toUpperCase()]) || '🏳️';

// Format an ISO UTC date to a friendly BST string + time
function formatFixtureDate(utcDate) {
  try {
    const d = new Date(utcDate);
    const day  = d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', timeZone:'Europe/London' });
    const time = d.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', timeZone:'Europe/London' });
    return { date: day, time: `${time} BST` };
  } catch {
    return { date: '', time: '' };
  }
}

// Build cumulative league points per player per gameweek, for the performance chart.
// Returns [{ gw:'GW1', 'Jason Gilbert':4, 'Gemma D':1, ... }, ...]
function buildPerformanceData(allPicks, allResults) {
  const cumulative = {};
  ALL_PLAYERS.forEach(p => { cumulative[p] = 0; });
  const rows = [];
  ROUNDS.forEach(gw => {
    const results = allResults?.[gw];
    if (!results) return; // only include calculated gameweeks
    const h2h = calcRoundH2H(allPicks, results, gw);
    Object.entries(h2h).forEach(([player, data]) => {
      if (cumulative[player] !== undefined) cumulative[player] += data.h2hPts;
    });
    const row = { gw: ROUND_SHORT[gw] };
    ALL_PLAYERS.forEach(p => { row[p] = cumulative[p]; });
    rows.push(row);
  });
  return rows;
}

// Compute fun-stat awards from picks + results across all calculated gameweeks.
// Returns { captainFantastic:{name,value}, crystalBall:{...}, ... } or null if no data.
function buildAwards(allPicks, allResults) {
  const calculatedGws = ROUNDS.filter(gw => allResults?.[gw]);
  if (calculatedGws.length === 0) return null;

  const stat = {};
  ALL_PLAYERS.forEach(p => {
    stat[p] = {
      captainWins: 0,      // captain pick won
      captainLosses: 0,    // captain pick did not win (and player didn't forfeit)
      outrightWins: 0,     // any pick that won
      uniquePicks: 0,      // picks nobody else made that gw
      bestGw: null,        // highest single gw score
      gwScores: [],        // all gw scores
      oneeptLosses: 0,     // fixtures lost by exactly 1
      forfeits: 0,         // missed deadlines
    };
  });

  calculatedGws.forEach(gw => {
    const results = allResults[gw];
    const h2h = calcRoundH2H(allPicks, results, gw);

    // count how many players picked each nation this gw (for uniqueness)
    const pickCounts = {};
    ALL_PLAYERS.forEach(p => {
      (allPicks?.[gw]?.[p]?.picks ?? []).forEach(pick => {
        pickCounts[pick.id] = (pickCounts[pick.id] || 0) + 1;
      });
    });

    ALL_PLAYERS.forEach(p => {
      const picks = allPicks?.[gw]?.[p]?.picks ?? [];
      const data = h2h[p];
      if (!picks.length) {
        if (data?.forfeited) stat[p].forfeits++;
        return;
      }
      // captain
      const cap = picks.find(pk => pk.isArmband);
      if (cap) {
        if (results[cap.id] === 'W') stat[p].captainWins++;
        else stat[p].captainLosses++;
      }
      // outright wins + uniqueness
      picks.forEach(pick => {
        if (results[pick.id] === 'W') stat[p].outrightWins++;
        if (pickCounts[pick.id] === 1) stat[p].uniquePicks++;
      });
      // gw score
      const score = calcPlayerScore(picks, results);
      if (score !== null) {
        stat[p].gwScores.push(score);
        if (stat[p].bestGw === null || score > stat[p].bestGw) stat[p].bestGw = score;
      }
    });

    // one-point losses: examine each H2H pair
    (H2H_FIXTURES[gw] || []).forEach(([p1, p2]) => {
      const s1 = calcPlayerScore(allPicks?.[gw]?.[p1]?.picks ?? null, results);
      const s2 = calcPlayerScore(allPicks?.[gw]?.[p2]?.picks ?? null, results);
      if (s1 !== null && s2 !== null) {
        if (s1 - s2 === 1) stat[p2].oneeptLosses++;
        else if (s2 - s1 === 1) stat[p1].oneeptLosses++;
      }
    });
  });

  // helper: pick the player maximising a value (returns {name, value} or null if all zero)
  const leader = (getVal, opts = {}) => {
    let best = null;
    ALL_PLAYERS.forEach(p => {
      const v = getVal(stat[p]);
      if (v === null || v === undefined) return;
      if (best === null || (opts.min ? v < best.value : v > best.value)) {
        best = { name: p, value: v };
      }
    });
    return best;
  };

  // consistency: smallest spread (best-worst), only for players with 2+ gameweeks
  const consistency = () => {
    let best = null;
    ALL_PLAYERS.forEach(p => {
      const s = stat[p].gwScores;
      if (s.length < 2) return;
      const spread = Math.max(...s) - Math.min(...s);
      if (best === null || spread < best.value) best = { name: p, value: spread };
    });
    return best;
  };

  return {
    captainFantastic: leader(s => s.captainWins),
    crystalBall:      leader(s => s.outrightWins),
    maverick:         leader(s => s.uniquePicks),
    banker:           leader(s => s.bestGw),
    consistent:       consistency(),
    heartbreaker:     leader(s => s.oneeptLosses),
    forfeitKing:      leader(s => s.forfeits),
    captainChaos:     leader(s => s.captainLosses),
  };
}

// Distinct colors for chart lines
const CHART_COLORS = ['#007AFF','#FF3B30','#34C759','#FF9500','#5856D6','#AF52DE','#FF2D55','#5AC8FA','#FFCC00','#8E8E93'];

// 1 hour before the earliest kickoff. Returns null if no fixtures cached.
function deadlineFromFixtures(fixtures) {
  if (!fixtures || fixtures.length === 0) return null;
  const kickoffs = fixtures.map(f => new Date(f.utcDate).getTime()).filter(t => !isNaN(t));
  if (kickoffs.length === 0) return null;
  return Math.min(...kickoffs) - 60 * 60 * 1000;
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [currentTab,     setCurrentTab]     = useState('picks');
  const [activeRound,    setActiveRound]    = useState('GW1');
  const [currentUser,    setCurrentUser]    = useState(null);
  const [invalidUser,    setInvalidUser]    = useState(false);
  const [showRules,      setShowRules]      = useState(false);
  const [exampleStep,    setExampleStep]    = useState(1);
  const [selectedSlot,   setSelectedSlot]   = useState(0);
  const [selections,     setSelections]     = useState([null,null,null]);
  const [armbandSlot,    setArmbandSlot]    = useState(0);
  const [isFormLocked,   setIsFormLocked]   = useState(false);
  const [isSaving,       setIsSaving]       = useState(false);
  const [timeLeft,       setTimeLeft]       = useState({days:0,hours:0,minutes:0,seconds:0});

  const [allPicks,       setAllPicks]       = useState({});
  const [allResults,     setAllResults]     = useState({});
  const [allFixtures,    setAllFixtures]    = useState({}); // { GW1: [ {id,name,flag,...} ], ... }
  const [leagueTable,    setLeagueTable]    = useState([]);
  const [isLoadingData,  setIsLoadingData]  = useState(true);

  // Admin state
  const [roundResults,   setRoundResults]   = useState({});
  const [isCalculating,  setIsCalculating]  = useState(false);
  const [isFetchingAPI,  setIsFetchingAPI]  = useState(false);
  const [isFetchingFix,  setIsFetchingFix]  = useState(false);
  const [fetchStatus,    setFetchStatus]    = useState(null);
  const [fetchMessage,   setFetchMessage]   = useState('');

  const isAdmin = currentUser === ADMIN_USER;

  // Deadlines derived from cached fixtures
  const deadlines = {};
  ROUNDS.forEach(gw => { deadlines[gw] = deadlineFromFixtures(allFixtures[gw]); });
  const deadline = deadlines[activeRound];
  const deadlinePassed = deadline !== null && Date.now() >= deadline;

  // A gameweek is "open" if it's GW1, or the previous gameweek's deadline has passed
  const isRoundOpen = (gw) => {
    const idx = ROUNDS.indexOf(gw);
    if (idx === 0) return true;
    const prev = ROUNDS[idx-1];
    const prevDeadline = deadlines[prev];
    return prevDeadline !== null && Date.now() >= prevDeadline;
  };

  // ── URL param → user ──────────────────────────────────────────────────────
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('player');
    if (p && PLAYER_SLUGS[p])  { setCurrentUser(PLAYER_SLUGS[p]); }
    else if (!p)                { setCurrentUser(PLAYER_SLUGS['you']); }
    else                        { setInvalidUser(true); }
  }, []);

  // ── Load all data ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    async function loadAll() {
      setIsLoadingData(true);
      try {
        const [pr, sr] = await Promise.all([
          fetch(PICKS_URL, {headers:{'X-Master-Key':JSONBIN_API_KEY}}),
          fetch(STATE_URL, {headers:{'X-Master-Key':JSONBIN_API_KEY}}),
        ]);
        const pd = await pr.json();
        const sd = await sr.json();
        const picks    = pd.record?.playerPicks ?? {};
        const results  = sd.record?.results     ?? {};
        const fixtures = sd.record?.fixtures    ?? {};
        setAllPicks(picks);
        setAllResults(results);
        setAllFixtures(fixtures);
        setLeagueTable(buildLeagueTable(picks, results));
        const my = picks?.[activeRound]?.[currentUser];
        if (my?.picks?.length === 3) {
          setSelections(my.picks.map(p => ({id:p.id,name:p.name,flag:p.flag})));
          const ab = my.picks.findIndex(p => p.isArmband);
          setArmbandSlot(ab !== -1 ? ab : 0);
          setIsFormLocked(true);
        }
        setRoundResults(results?.[activeRound] ?? {});
      } catch(e) {
        console.error('Load failed', e);
        setLeagueTable(ALL_PLAYERS.map(name => ({name,played:0,w:0,d:0,l:0,h2hPts:0,totalScore:0,winsSelected:0})));
      } finally {
        setIsLoadingData(false);
      }
    }
    loadAll();
  }, [currentUser]); // eslint-disable-line

  // ── Re-restore picks on round change ─────────────────────────────────────
  useEffect(() => {
    if (!currentUser || isLoadingData) return;
    const my = allPicks?.[activeRound]?.[currentUser];
    if (my?.picks?.length === 3) {
      setSelections(my.picks.map(p => ({id:p.id,name:p.name,flag:p.flag})));
      const ab = my.picks.findIndex(p => p.isArmband);
      setArmbandSlot(ab !== -1 ? ab : 0);
      setIsFormLocked(true);
    } else {
      setSelections([null,null,null]);
      setArmbandSlot(0);
      setIsFormLocked(false);
    }
    setSelectedSlot(0);
    setRoundResults(allResults?.[activeRound] ?? {});
    setFetchStatus(null);
    setFetchMessage('');
  }, [activeRound]); // eslint-disable-line

  // ── Countdown ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      if (deadline === null) { setTimeLeft({days:0,hours:0,minutes:0,seconds:0}); return; }
      const diff = deadline - Date.now();
      if (diff <= 0) {
        setTimeLeft({days:0,hours:0,minutes:0,seconds:0});
        setIsFormLocked(true);
      } else {
        setTimeLeft({
          days:    Math.floor(diff / 86400000),
          hours:   Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000)  / 60000),
          seconds: Math.floor((diff % 60000)    / 1000),
        });
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [deadline]);

  // ── Save picks ────────────────────────────────────────────────────────────
  const handleFinalizeAndSave = async () => {
    if (isFormLocked) { setIsFormLocked(false); return; }
    if (selections.includes(null)) { alert('Please fill all 3 slots before locking.'); return; }
    try {
      setIsSaving(true);
      const res  = await fetch(PICKS_URL, {headers:{'X-Master-Key':JSONBIN_API_KEY}});
      const data = await res.json();
      const master = data.record || {playerPicks:{}};
      if (!master.playerPicks) master.playerPicks = {};
      if (!master.playerPicks[activeRound]) master.playerPicks[activeRound] = {};
      master.playerPicks[activeRound][currentUser] = {
        picks: selections.map((s,idx) => ({name:s.name,flag:s.flag,id:s.id,isArmband:armbandSlot===idx})),
        timestamp: new Date().toISOString(),
      };
      await fetch(PICKS_URL, {
        method:'PUT',
        headers:{'Content-Type':'application/json','X-Master-Key':JSONBIN_API_KEY},
        body: JSON.stringify(master),
      });
      setAllPicks(master.playerPicks);
      setIsFormLocked(true);
      alert(`✅ Picks locked for ${currentUser}!`);
    } catch(e) {
      alert('Save failed — screenshot your picks and tell the Commissioner.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Admin: refresh fixtures from API (cache to Bin 2) ─────────────────────
  const handleRefreshFixtures = async () => {
    const query = fixtureQuery(activeRound);
    if (!query) { setFetchStatus('error'); setFetchMessage('No fixture mapping for this gameweek.'); return; }
    try {
      setIsFetchingFix(true);
      setFetchStatus(null); setFetchMessage('');
      const res  = await fetch(`/api/results?${query}&mode=fixtures`);
      const data = await res.json();
      if (!res.ok) { setFetchStatus('error'); setFetchMessage(data.error || 'Fixture fetch failed.'); return; }
      if (!data.fixtures || data.fixtures.length === 0) {
        const hint = data.availableStages?.length ? ` (API reports stages: ${data.availableStages.join(', ')})` : '';
        setFetchStatus('error'); setFetchMessage(`No fixtures returned for this gameweek yet.${hint}`); return;
      }

      // Build pool: one entry per nation (each match yields 2 selectable nations)
      const pool = [];
      data.fixtures.forEach(fx => {
        const dt = formatFixtureDate(fx.utcDate);
        pool.push({
          matchId: fx.matchId,
          utcDate: fx.utcDate,
          date: dt.date, time: dt.time,
          home: { id: fx.homeTeam.tla?.toLowerCase(), tla: fx.homeTeam.tla, name: fx.homeTeam.name, flag: flagFor(fx.homeTeam.tla) },
          away: { id: fx.awayTeam.tla?.toLowerCase(), tla: fx.awayTeam.tla, name: fx.awayTeam.name, flag: flagFor(fx.awayTeam.tla) },
        });
      });

      // Save to Bin 2 under fixtures[gw]
      const sres = await fetch(STATE_URL, {headers:{'X-Master-Key':JSONBIN_API_KEY}});
      const sdata = await sres.json();
      const state = sdata.record || {results:{},fixtures:{},leagueTable:{}};
      if (!state.fixtures) state.fixtures = {};
      state.fixtures[activeRound] = pool;
      await fetch(STATE_URL, {
        method:'PUT',
        headers:{'Content-Type':'application/json','X-Master-Key':JSONBIN_API_KEY},
        body: JSON.stringify(state),
      });

      setAllFixtures(prev => ({ ...prev, [activeRound]: pool }));
      const dl = deadlineFromFixtures(pool);
      const dlStr = dl ? new Date(dl).toLocaleString('en-GB',{timeZone:'Europe/London'}) : 'n/a';
      setFetchStatus('success');
      setFetchMessage(`Cached ${pool.length} nations across ${data.fixtures.length} matches. Deadline auto-set to ${dlStr} BST.`);
    } catch(e) {
      setFetchStatus('error'); setFetchMessage(`Error: ${e.message}`);
    } finally {
      setIsFetchingFix(false);
    }
  };

  // ── Admin: fetch results from API ─────────────────────────────────────────
  const handleFetchResults = async () => {
    const query = fixtureQuery(activeRound);
    if (!query) { setFetchStatus('error'); setFetchMessage('No fixture mapping for this gameweek.'); return; }
    try {
      setIsFetchingAPI(true);
      setFetchStatus(null); setFetchMessage('');
      const res  = await fetch(`/api/results?${query}`);
      const data = await res.json();
      if (!res.ok) { setFetchStatus('error'); setFetchMessage(data.error || 'API fetch failed.'); return; }
      if (!data.matches || data.matches.length === 0) {
        setFetchStatus('error'); setFetchMessage('No matches returned. Matches may not have started.'); return;
      }
      const fetched = {};
      let mapped = 0;
      data.matches.forEach(match => {
        const homeId = match.homeTeam.tla?.toLowerCase();
        const awayId = match.awayTeam.tla?.toLowerCase();
        if (homeId && match.homeResult) { fetched[homeId] = match.homeResult; mapped++; }
        if (awayId && match.awayResult) { fetched[awayId] = match.awayResult; mapped++; }
      });
      const total    = data.matches.length;
      const finished = data.matches.filter(m => m.status === 'FINISHED').length;
      setRoundResults(prev => ({ ...prev, ...fetched }));
      setFetchStatus('success');
      setFetchMessage(`Fetched ${total} matches — ${finished} finished. ${mapped} results populated. Review then Calculate.`);
    } catch(e) {
      setFetchStatus('error'); setFetchMessage(`Fetch error: ${e.message}`);
    } finally {
      setIsFetchingAPI(false);
    }
  };

  // ── Admin: calculate round ────────────────────────────────────────────────
  const handleCalculateRound = async () => {
    if (Object.keys(roundResults).length === 0) { alert('No results to calculate. Fetch or enter first.'); return; }
    try {
      setIsCalculating(true);
      const res  = await fetch(STATE_URL, {headers:{'X-Master-Key':JSONBIN_API_KEY}});
      const data = await res.json();
      const state = data.record || {results:{},fixtures:{},leagueTable:{}};
      if (!state.results) state.results = {};
      state.results[activeRound] = roundResults;
      const newTable = buildLeagueTable(allPicks, state.results);
      state.leagueTable = newTable;
      await fetch(STATE_URL, {
        method:'PUT',
        headers:{'Content-Type':'application/json','X-Master-Key':JSONBIN_API_KEY},
        body: JSON.stringify(state),
      });
      setAllResults(state.results);
      setLeagueTable(newTable);
      alert(`✅ ${ROUND_LABELS[activeRound]} calculated and table updated!`);
    } catch(e) {
      console.error(e);
      alert('Calculation failed — check console.');
    } finally {
      setIsCalculating(false);
    }
  };

  // ── Pick helpers ──────────────────────────────────────────────────────────
  const getUsageMetrics = (teamId) => {
    let count = 0;
    // Caps accrue across the whole tournament: count locked picks in every
    // other gameweek, then add the current (possibly unsaved) working slots.
    ROUNDS.forEach(gw => {
      if (gw === activeRound) return;
      (allPicks?.[gw]?.[currentUser]?.picks ?? []).forEach(pick => {
        if (pick?.id === teamId) count++;
      });
    });
    selections.forEach(s => { if (s?.id === teamId) count++; });
    return count;
  };

  const handleSelectNation = (nation) => {
    if (isFormLocked) return;
    const dup = selections.findIndex(s => s?.id===nation.id);
    if (dup !== -1 && dup !== selectedSlot) return;
    if (getUsageMetrics(nation.id) >= 2 && selections[selectedSlot]?.id !== nation.id) {
      alert(`${nation.name} has reached the 2-cap limit.`); return;
    }
    const updated = [...selections];
    updated[selectedSlot] = { id:nation.id, name:nation.name, flag:nation.flag };
    setSelections(updated);
    if (selectedSlot < 2 && !updated[selectedSlot+1]) setSelectedSlot(selectedSlot+1);
  };

  const handleClearSlot = (idx, e) => {
    e.stopPropagation();
    if (isFormLocked) return;
    const updated = [...selections];
    updated[idx] = null;
    setSelections(updated);
    setSelectedSlot(idx);
  };

  // ── Share picks ───────────────────────────────────────────────────────────
  const handleSharePicks = async () => {
    const fixture = (H2H_FIXTURES[activeRound] || []).find(([p1,p2]) => p1===currentUser || p2===currentUser);
    const opponent = fixture ? (fixture[0]===currentUser ? fixture[1] : fixture[0]) : null;
    const flags = selections.map((s,idx) => s ? (armbandSlot===idx ? `${s.flag}Ⓒ` : s.flag) : '').join(' ');
    const oppLine = opponent ? `\nFacing ${opponent} this ${ROUND_LABELS[activeRound]} — bring it on! 👊` : '';
    const text = `⚽ My Triple Pick World Cup '26 picks for ${ROUND_LABELS[activeRound]}:\n${flags}${oppLine}\n\nPlay at: https://triple-pick.vercel.app`;
    if (navigator.share) {
      try { await navigator.share({ title:'Triple Pick World Cup \'26', text }); } catch(e) {}
    } else {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard — paste into WhatsApp, Facebook or X!');
    }
  };

  // ── Arena helpers ─────────────────────────────────────────────────────────
  const getPlayerPicksDisplay = (playerName, gw) => {
    const saved = allPicks?.[gw]?.[playerName];
    const dl = deadlines[gw];
    const roundClosed = dl !== null && Date.now() >= dl;
    const isJason = currentUser === ADMIN_USER;
    if (!saved?.picks?.length) return {status:'pending', display:null};
    if (!roundClosed && !isJason) return {status:'submitted', display:null};
    return {status:'revealed', display:saved.picks};
  };

  const getPlayerScore = (playerName, gw) => {
    const results = allResults?.[gw];
    if (!results) return null;
    return calcPlayerScore(allPicks?.[gw]?.[playerName]?.picks ?? null, results);
  };

  // ── Guard screens ─────────────────────────────────────────────────────────
  if (invalidUser) return (
    <div className="min-h-screen bg-[#F4F4F9] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#FF3B30]/20 p-6 max-w-sm w-full shadow-xl text-center">
        <div className="w-12 h-12 bg-[#FF3B30]/10 rounded-full flex items-center justify-center mx-auto text-xl">⚠️</div>
        <h2 className="text-base font-bold text-[#1C1C1E] mt-4">Invalid Link</h2>
        <p className="text-xs text-[#8E8E93] mt-2">Request your link from the League Commissioner.</p>
      </div>
    </div>
  );
  if (!currentUser) return (
    <div className="min-h-screen bg-[#F4F4F9] flex items-center justify-center">
      <p className="text-xs text-[#8E8E93] font-mono animate-pulse">Loading...</p>
    </div>
  );

  const roundOpen = isRoundOpen(activeRound);
  const currentPool = allFixtures[activeRound] || [];

  return (
    <div className="min-h-screen bg-[#F4F4F9] text-[#1C1C1E] antialiased p-4 md:p-6 font-sans">

      {/* HEADER */}
      <header className="max-w-4xl mx-auto mb-6 bg-white rounded-2xl p-4 border border-[#E5E5EA] flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-[#1C1C1E]">Triple Pick League</h1>
            <span className="bg-[#007AFF] text-white text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md uppercase">World Cup '26</span>
          </div>
          <p className="text-[10px] text-[#007AFF] font-bold uppercase tracking-wider mt-0.5">Authenticated Manager: {currentUser}</p>
        </div>
        <div className="bg-[#E5E5EA] p-0.5 rounded-xl flex gap-0.5 w-full sm:w-auto">
          {[['picks','🎯 Strategy Desk'],['league','⚽ Arena & Standings']].map(([tab,label]) => (
            <button key={tab} onClick={() => setCurrentTab(tab)}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${currentTab===tab ? 'bg-white text-[#1C1C1E] shadow-sm' : 'text-[#636366]'}`}>
              {label}
            </button>
          ))}
          {isAdmin && (
            <button onClick={() => setCurrentTab('admin')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${currentTab==='admin' ? 'bg-white text-[#FF3B30] shadow-sm' : 'text-[#636366]'}`}>
              Admin ⚙️
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto">

        {/* ════════ STRATEGY DESK ════════ */}
        {currentTab === 'picks' && (
          <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-[#E5E5EA] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#007AFF] to-[#5AC8FA]" />
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <div>
                  <h2 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">Your Picks — {ROUND_LABELS[activeRound]}</h2>
                  <p className="text-[11px] text-[#636366] mt-0.5">{currentUser}</p>
                </div>
                <div className="bg-[#FF9500]/10 border border-[#FF9500]/20 rounded-xl px-3 py-1.5 flex items-center gap-2 self-start sm:self-center">
                  <span className={`w-1.5 h-1.5 rounded-full ${deadlinePassed ? 'bg-[#FF3B30]' : 'bg-[#FF9500] animate-pulse'}`} />
                  <span className={`text-[10px] font-black uppercase ${deadlinePassed ? 'text-[#FF3B30]' : 'text-[#FF9500]'}`}>
                    {deadline === null ? 'Awaiting fixtures' : deadlinePassed ? 'Deadline Passed' : 'Lockout In:'}
                  </span>
                  {deadline !== null && (
                    <span className="font-mono text-xs font-bold text-[#1C1C1E]">
                      {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                    </span>
                  )}
                </div>
              </div>

              {isFormLocked && (
                <div className="mb-4 px-3 py-2 bg-[#34C759]/10 border border-[#34C759]/30 rounded-xl flex items-center gap-2">
                  <span className="text-[#34C759] text-sm">✓</span>
                  <p className="text-xs font-semibold text-[#34C759]">Picks locked and saved. Tap the green button to edit before the deadline.</p>
                </div>
              )}

              {/* Gameweek selector */}
              <div className="flex gap-1 mb-4 flex-wrap">
                {ROUNDS.map(gw => {
                  const open = isRoundOpen(gw);
                  return (
                    <button key={gw} onClick={() => open && setActiveRound(gw)} disabled={!open}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${activeRound===gw ? 'bg-[#007AFF] text-white' : open ? 'bg-[#F2F2F7] text-[#636366] hover:bg-[#E5E5EA]' : 'bg-[#F2F2F7] text-[#C7C7CC] cursor-not-allowed'}`}>
                      {open ? ROUND_SHORT[gw] : `🔒 ${ROUND_SHORT[gw]}`}
                    </button>
                  );
                })}
              </div>

              {!roundOpen ? (
                <div className="text-center py-8 px-4">
                  <p className="text-2xl mb-2">🔒</p>
                  <p className="text-sm font-semibold text-[#1C1C1E]">{ROUND_LABELS[activeRound]} isn't open yet</p>
                  <p className="text-xs text-[#8E8E93] mt-1">It unlocks automatically once the previous gameweek's deadline passes.</p>
                </div>
              ) : currentPool.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <p className="text-sm font-semibold text-[#1C1C1E]">Fixtures loading…</p>
                  <p className="text-xs text-[#8E8E93] mt-1">{isAdmin ? 'Go to Admin → Refresh Fixtures to load this gameweek\'s matches.' : 'The Commissioner is setting up this gameweek. Check back shortly.'}</p>
                </div>
              ) : (
                <>
                  {/* Slots */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                    {selections.map((nation, idx) => {
                      const isActive  = selectedSlot===idx;
                      const isArmband = armbandSlot===idx;
                      return (
                        <div key={idx} onClick={() => !isFormLocked && setSelectedSlot(idx)}
                          className={`p-4 rounded-xl border-2 flex flex-col justify-between h-28 transition-all cursor-pointer relative ${isActive ? 'border-[#007AFF] bg-[#007AFF]/5' : 'border-[#E5E5EA] bg-white hover:border-[#D1D1D6]'}`}>
                          <div className="flex justify-between items-start w-full">
                            <span className="text-[10px] font-black uppercase text-[#8E8E93]">Slot 0{idx+1}</span>
                            {nation && !isFormLocked && (
                              <button onClick={(e) => handleClearSlot(idx,e)} className="text-[10px] font-bold text-[#FF3B30] bg-[#FF3B30]/10 px-2 py-0.5 rounded-md">Clear</button>
                            )}
                          </div>
                          <div className="my-auto flex items-center gap-3">
                            {nation ? (
                              <><span className="text-3xl">{nation.flag}</span>
                              <div><p className="text-sm font-bold text-[#1C1C1E]">{nation.name}</p>
                              <p className="text-[10px] font-mono text-[#8E8E93]">Caps Used: {getUsageMetrics(nation.id)}/2</p></div></>
                            ) : <p className="text-xs italic text-[#AEAEB2] font-medium">Click to assign team...</p>}
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-dashed border-[#E5E5EA]">
                            <span className="text-[9px] font-bold text-[#8E8E93]">Armband Option</span>
                            <input type="radio" name="armband" disabled={isFormLocked} checked={isArmband}
                              onChange={() => setArmbandSlot(idx)} onClick={(e) => e.stopPropagation()}
                              className="accent-[#007AFF] h-3.5 w-3.5" />
                          </div>
                          {isArmband && (
                            <span className="absolute -top-2.5 -right-2 bg-[#1C1C1E] text-white text-[8px] font-black tracking-wide py-0.5 px-2 rounded-md border border-white">Ⓒ ARMBAND (+1)</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button disabled={isSaving||deadlinePassed} onClick={handleFinalizeAndSave}
                    className={`w-full py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${isFormLocked ? 'bg-[#34C759] text-white hover:bg-[#28a745]' : 'bg-[#1C1C1E] text-white hover:bg-black disabled:opacity-50'}`}>
                    {isSaving ? <span className="animate-pulse">🌐 Syncing...</span>
                      : isFormLocked ? '🔓 Reopen Sheets for Adjustments'
                      : '🔒 Finalize Sheet Configuration'}
                  </button>

                  {isFormLocked && selections.every(s => s !== null) && (
                    <button onClick={handleSharePicks}
                      className="w-full mt-2 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 bg-[#F2F2F7] text-[#1C1C1E] hover:bg-[#E5E5EA] border border-[#E5E5EA]">
                      📣 Share My Picks
                    </button>
                  )}
                </>
              )}
            </section>

            {/* Rules */}
            <section className="bg-white rounded-2xl border border-[#E5E5EA] shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
              <button onClick={() => setShowRules(!showRules)}
                className="w-full p-4 flex justify-between items-center bg-[#F2F2F7]/50 hover:bg-[#F2F2F7] transition-all text-left">
                <div className="flex items-center gap-2">
                  <span className="text-sm">📜</span>
                  <h3 className="text-xs font-black text-[#1C1C1E] uppercase tracking-wider">How to Play &amp; Rules</h3>
                </div>
                <span className="text-xs font-bold text-[#007AFF]">{showRules ? 'Hide ▲' : 'Show ▼'}</span>
              </button>
              {showRules && (
                <div className="p-5 border-t border-[#E5E5EA] bg-white space-y-4 text-xs text-[#636366] leading-relaxed">

                  {/* How to play intro */}
                  <div className="bg-gradient-to-br from-[#007AFF]/5 to-[#5AC8FA]/5 border border-[#007AFF]/15 rounded-xl p-4">
                    <h4 className="font-black text-[#1C1C1E] mb-2 text-sm">⚽ How to Play</h4>
                    <p className="mb-2">Triple Pick is a head-to-head game played across the whole World Cup. Here's the idea:</p>
                    <ul className="space-y-1.5 ml-1">
                      <li className="flex gap-2"><span>🎯</span><span>Each gameweek you pick <strong>3 nations</strong> from that round's matches.</span></li>
                      <li className="flex gap-2"><span>🆚</span><span>You're drawn against <strong>one opponent</strong> each gameweek — a different manager every round.</span></li>
                      <li className="flex gap-2"><span>📊</span><span>Your nations earn points on their results. Add them up for your <strong>gameweek score</strong>.</span></li>
                      <li className="flex gap-2"><span>🏆</span><span>Beat your opponent's score and you win the fixture — earning <strong>league points</strong>.</span></li>
                      <li className="flex gap-2"><span>©️</span><span>Nominate one pick as your <strong>captain</strong> for a bonus if they win.</span></li>
                      <li className="flex gap-2"><span>📈</span><span>League points build up over the tournament. Top of the table after the final wins it all.</span></li>
                    </ul>
                    <p className="mt-2 text-[#8E8E93]">It's simple to play, but the captain calls, the 2-cap limit, and who you're drawn against each week make it a proper tactical battle.</p>
                  </div>

                  <div><h4 className="font-bold text-[#1C1C1E] mb-1">1. Triple Pick</h4><p>Select exactly 3 nations from the active match pool each gameweek.</p></div>
                  <div><h4 className="font-bold text-[#1C1C1E] mb-1">2. 2-Cap Limit</h4><p>Any nation can only be selected <span className="font-bold text-black">up to 2 times</span> across the entire tournament.</p></div>
                  <div><h4 className="font-bold text-[#1C1C1E] mb-1">3. Armband Ⓒ</h4><p>Nominate one pick as captain. If that nation <strong>wins</strong>, you earn a <span className="font-bold text-[#34C759]">+1 bonus point</span> toward your gameweek score. A draw does not trigger the bonus.</p></div>
                  <div><h4 className="font-bold text-[#1C1C1E] mb-1">4. Head-to-Head</h4>
                    <p className="mb-1">Your gameweek score is compared against your opponent's to decide the fixture:</p>
                    <ul className="list-disc list-inside mt-1 ml-2 space-y-0.5 font-mono text-[11px]">
                      <li><span className="font-bold text-[#34C759]">3 pts</span> — Win &nbsp;<span className="font-bold text-[#8E8E93]">1 pt</span> — Draw &nbsp;<span className="font-bold text-[#FF3B30]">0 pts</span> — Loss</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1C1C1E] mb-1">5. Captain bonus league point</h4>
                    <p className="mb-2">If your Armband captain <strong>wins their match</strong>, you get an extra <span className="font-bold text-[#34C759]">+1 league point</span> &#8212; on top of the fixture result. This applies <strong>even if you lose your fixture.</strong></p>
                    <div className="bg-[#F2F2F7] rounded-lg overflow-hidden">
                      <table className="w-full text-[11px] font-mono">
                        <thead>
                          <tr className="text-[#8E8E93] border-b border-[#E5E5EA]">
                            <th className="text-left py-1.5 px-2 font-bold">Fixture</th>
                            <th className="text-left py-1.5 px-2 font-bold">Captain</th>
                            <th className="text-right py-1.5 px-2 font-bold">League pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-[#E5E5EA]"><td className="py-1.5 px-2">Win</td><td className="py-1.5 px-2">Wins</td><td className="text-right py-1.5 px-2 font-bold text-[#34C759]">3 + 1 = 4</td></tr>
                          <tr className="border-b border-[#E5E5EA]"><td className="py-1.5 px-2">Win</td><td className="py-1.5 px-2">Doesn't win</td><td className="text-right py-1.5 px-2">3</td></tr>
                          <tr className="border-b border-[#E5E5EA]"><td className="py-1.5 px-2">Draw</td><td className="py-1.5 px-2">Wins</td><td className="text-right py-1.5 px-2 font-bold text-[#34C759]">1 + 1 = 2</td></tr>
                          <tr className="border-b border-[#E5E5EA]"><td className="py-1.5 px-2">Loss</td><td className="py-1.5 px-2">Wins</td><td className="text-right py-1.5 px-2 font-bold text-[#34C759]">0 + 1 = 1</td></tr>
                          <tr><td className="py-1.5 px-2">Loss</td><td className="py-1.5 px-2">Doesn't win</td><td className="text-right py-1.5 px-2">0</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Worked example slider */}
                  <div>
                    <h4 className="font-bold text-[#1C1C1E] mb-2">Worked example</h4>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] font-bold text-[#8E8E93] uppercase">Step</span>
                      <input type="range" min="1" max="4" step="1" value={exampleStep}
                        onChange={(e) => setExampleStep(parseInt(e.target.value))}
                        className="flex-1 accent-[#007AFF]" />
                      <span className="text-[11px] font-bold text-[#007AFF] min-w-[88px] text-right">
                        {exampleStep===1 && '1. The picks'}
                        {exampleStep===2 && '2. GW score'}
                        {exampleStep===3 && '3. The fixture'}
                        {exampleStep===4 && '4. League pts'}
                      </span>
                    </div>

                    {exampleStep === 1 && (
                      <div>
                        <p className="mb-2">Each player picks 3 nations. One is nominated Armband captain (Ⓒ).</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="bg-white border border-[#E5E5EA] rounded-xl p-3">
                            <p className="font-bold text-[#1C1C1E] mb-2">Jason</p>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2"><span className="text-lg">🇺🇸</span><span>USA</span></div>
                              <div className="flex items-center gap-2"><span className="text-lg">🇩🇪</span><span>Germany</span><span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FF9500]/10 text-[#FF9500] font-bold">Ⓒ</span></div>
                              <div className="flex items-center gap-2"><span className="text-lg">🇧🇷</span><span>Brazil</span></div>
                            </div>
                          </div>
                          <div className="bg-white border border-[#E5E5EA] rounded-xl p-3">
                            <p className="font-bold text-[#1C1C1E] mb-2">Gemma</p>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2"><span className="text-lg">🇦🇺</span><span>Australia</span><span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FF9500]/10 text-[#FF9500] font-bold">Ⓒ</span></div>
                              <div className="flex items-center gap-2"><span className="text-lg">🇧🇷</span><span>Brazil</span></div>
                              <div className="flex items-center gap-2"><span className="text-lg">🇭🇹</span><span>Haiti</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {exampleStep === 2 && (
                      <div>
                        <p className="mb-2">Win = 3, Draw = 1, Loss = 0. Captain Ⓒ adds +1 to the gameweek score if their nation wins.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="bg-white border border-[#E5E5EA] rounded-xl p-3">
                            <p className="font-bold text-[#1C1C1E] mb-2">Jason</p>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">🇺🇸</span><span>USA</span><span className="text-[#AEAEB2]">Won</span></div><span className="font-bold">3</span></div>
                              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">🇩🇪</span><span>Germany</span><span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FF9500]/10 text-[#FF9500] font-bold">Ⓒ</span><span className="text-[#AEAEB2]">Won</span></div><span className="font-bold">3+1</span></div>
                              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">🇧🇷</span><span>Brazil</span><span className="text-[#AEAEB2]">Drew</span></div><span className="font-bold">1</span></div>
                            </div>
                            <div className="border-t border-dashed border-[#E5E5EA] mt-2 pt-2 flex justify-between items-baseline">
                              <span className="text-[#8E8E93]">Gameweek score</span><span className="text-lg font-bold text-[#1C1C1E]">8</span>
                            </div>
                          </div>
                          <div className="bg-white border border-[#E5E5EA] rounded-xl p-3">
                            <p className="font-bold text-[#1C1C1E] mb-2">Gemma</p>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">🇦🇺</span><span>Australia</span><span className="text-[9px] px-1.5 py-0.5 rounded bg-[#FF9500]/10 text-[#FF9500] font-bold">Ⓒ</span><span className="text-[#AEAEB2]">Won</span></div><span className="font-bold">3+1</span></div>
                              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">🇧🇷</span><span>Brazil</span><span className="text-[#AEAEB2]">Drew</span></div><span className="font-bold">1</span></div>
                              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">🇭🇹</span><span>Haiti</span><span className="text-[#AEAEB2]">Lost</span></div><span className="font-bold">0</span></div>
                            </div>
                            <div className="border-t border-dashed border-[#E5E5EA] mt-2 pt-2 flex justify-between items-baseline">
                              <span className="text-[#8E8E93]">Gameweek score</span><span className="text-lg font-bold text-[#1C1C1E]">5</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-[#AEAEB2] mt-2">Jason scores 8, Gemma scores 5.</p>
                      </div>
                    )}
                    {exampleStep === 3 && (
                      <div>
                        <p className="mb-2">Jason and Gemma are head-to-head opponents this gameweek. Higher score wins.</p>
                        <div className="bg-white border border-[#E5E5EA] rounded-xl p-4">
                          <div className="flex items-center justify-between mb-1"><span className="font-bold text-[#1C1C1E]">Jason</span><span className="text-2xl font-bold">8</span></div>
                          <div className="text-center text-[#AEAEB2] my-1">vs</div>
                          <div className="flex items-center justify-between mb-3"><span className="font-bold text-[#1C1C1E]">Gemma</span><span className="text-2xl font-bold">5</span></div>
                          <div className="border-t border-[#E5E5EA] pt-2 flex items-center gap-2"><span className="text-[#34C759]">🏆</span><span>Jason wins the fixture &#8212; 8 beats 5. Gemma loses.</span></div>
                        </div>
                      </div>
                    )}
                    {exampleStep === 4 && (
                      <div>
                        <p className="mb-2">League points combine the fixture result with each player's captain bonus.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                          <div className="bg-[#F2F2F7] rounded-lg p-3">
                            <p className="text-[#8E8E93] mb-1">Jason &#8212; won fixture</p>
                            <div className="flex items-baseline gap-1.5"><span className="text-[#8E8E93]">Fixture win</span><span className="font-bold">3</span></div>
                            <div className="flex items-baseline gap-1.5"><span className="text-[#8E8E93]">Captain Ⓒ won</span><span className="font-bold">+1</span></div>
                            <div className="border-t border-[#E5E5EA] mt-1.5 pt-1.5"><span className="text-xl font-bold">4</span> <span className="text-[#8E8E93]">league pts</span></div>
                          </div>
                          <div className="bg-[#F2F2F7] rounded-lg p-3">
                            <p className="text-[#8E8E93] mb-1">Gemma &#8212; lost fixture</p>
                            <div className="flex items-baseline gap-1.5"><span className="text-[#8E8E93]">Fixture loss</span><span className="font-bold">0</span></div>
                            <div className="flex items-baseline gap-1.5"><span className="text-[#8E8E93]">Captain Ⓒ won</span><span className="font-bold">+1</span></div>
                            <div className="border-t border-[#E5E5EA] mt-1.5 pt-1.5"><span className="text-xl font-bold text-[#34C759]">1</span> <span className="text-[#8E8E93]">league pt</span></div>
                          </div>
                        </div>
                        <p className="text-[11px] text-[#AEAEB2]">Even though Gemma lost the fixture, her captain won &#8212; so she still banks 1 league point.</p>
                      </div>
                    )}
                  </div>

                  <div><h4 className="font-bold text-[#1C1C1E] mb-1">6. Forfeit</h4><p>Miss the deadline and you score 0. Your opponent gets 3 league points automatically. No captain bonus is possible without picks.</p></div>
                  <div className="bg-[#F2F2F7] p-3 rounded-xl border border-[#E5E5EA]">
                    <span className="font-bold text-[#1C1C1E] block mb-0.5">⚠️ Deadline</span>
                    Picks lock 1 hour before the first match of each gameweek. The next gameweek opens automatically once the current one locks.
                  </div>
                </div>
              )}
            </section>

            {/* Fixture pool */}
            {roundOpen && currentPool.length > 0 && (
              <section className="bg-white rounded-2xl border border-[#E5E5EA] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-4">Available Matchday Pool — {ROUND_LABELS[activeRound]}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentPool.map((match) => {
                    const homeUsage = getUsageMetrics(match.home.id);
                    const awayUsage = getUsageMetrics(match.away.id);
                    const homeMaxed = homeUsage>=2 && !selections.some(s=>s?.id===match.home.id);
                    const awayMaxed = awayUsage>=2 && !selections.some(s=>s?.id===match.away.id);
                    const slotOwnsHome = selections[selectedSlot]?.id===match.home.id;
                    const slotOwnsAway = selections[selectedSlot]?.id===match.away.id;
                    return (
                      <div key={match.matchId} className="bg-white border border-[#E5E5EA] rounded-xl p-3 flex flex-col justify-between relative overflow-hidden pl-4">
                        <div className="absolute top-0 bottom-0 left-0 w-[3px] bg-[#E5E5EA]" />
                        <div className="flex items-center justify-between w-full">
                          <button disabled={isFormLocked||homeMaxed} onClick={() => handleSelectNation(match.home)}
                            className={`flex-1 p-2 rounded-lg flex items-center gap-2.5 transition-all text-left ${slotOwnsHome ? 'bg-[#007AFF]/10 border border-[#007AFF]/30 font-bold' : homeMaxed ? 'opacity-30' : 'hover:bg-[#F2F2F7]'}`}>
                            <span className="text-2xl">{match.home.flag}</span>
                            <div className="truncate"><p className="text-xs font-bold text-[#1C1C1E] truncate">{match.home.name}</p><p className="text-[9px] font-mono text-[#8E8E93]">Caps: {homeUsage}/2</p></div>
                          </button>
                          <div className="px-3 text-[10px] font-black text-[#AEAEB2] font-mono">VS</div>
                          <button disabled={isFormLocked||awayMaxed} onClick={() => handleSelectNation(match.away)}
                            className={`flex-1 p-2 rounded-lg flex items-center justify-end gap-2.5 transition-all text-right ${slotOwnsAway ? 'bg-[#007AFF]/10 border border-[#007AFF]/30 font-bold' : awayMaxed ? 'opacity-30' : 'hover:bg-[#F2F2F7]'}`}>
                            <div className="truncate"><p className="text-xs font-bold text-[#1C1C1E] truncate">{match.away.name}</p><p className="text-[9px] font-mono text-[#8E8E93]">Caps: {awayUsage}/2</p></div>
                            <span className="text-2xl">{match.away.flag}</span>
                          </button>
                        </div>
                        <div className="w-full text-center mt-2 pt-1.5 border-t border-[#F2F2F7] flex justify-center gap-1.5 items-center">
                          <span className="text-[10px] font-semibold text-[#636366]">{match.date}</span>
                          <span className="text-[9px] font-bold font-mono text-[#8E8E93] bg-[#F2F2F7] px-1.5 py-0.5 rounded">{match.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ════════ ⚽ ARENA & STANDINGS ════════ */}
        {currentTab === 'league' && (
          <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-[#E5E5EA] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-[4px] h-full bg-[#007AFF]" />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-3 border-b border-[#F2F2F7]">
                <h2 className="text-base font-bold text-[#1C1C1E] tracking-tight">⚽ H2H Matchday Arena</h2>
                <div className="bg-[#E5E5EA]/70 p-0.5 rounded-xl flex flex-wrap gap-0.5">
                  {ROUNDS.map(gw => (
                    <button key={gw} onClick={() => setActiveRound(gw)}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${activeRound===gw ? 'bg-white text-[#007AFF] shadow-sm' : 'text-[#636366]'}`}>
                      {ROUND_SHORT[gw]}
                    </button>
                  ))}
                </div>
              </div>

              {isLoadingData ? (
                <p className="text-center py-6 text-xs text-[#8E8E93] font-mono animate-pulse">Loading arena data...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(H2H_FIXTURES[activeRound]||[]).map(([p1name,p2name], index) => {
                    const isUserMatch  = p1name===currentUser || p2name===currentUser;
                    const dl = deadlines[activeRound];
                    const roundClosed = dl !== null && Date.now() >= dl;
                    const p1data = getPlayerPicksDisplay(p1name, activeRound);
                    const p2data = getPlayerPicksDisplay(p2name, activeRound);
                    const score1 = getPlayerScore(p1name, activeRound);
                    const score2 = getPlayerScore(p2name, activeRound);
                    const p1forfeited = roundClosed && !allPicks?.[activeRound]?.[p1name]?.picks?.length;
                    const p2forfeited = roundClosed && !allPicks?.[activeRound]?.[p2name]?.picks?.length;

                    const renderPicks = (pd, forfeited) => {
                      if (forfeited) return <span className="text-[10px] font-bold text-[#FF3B30] bg-[#FF3B30]/10 px-1.5 py-0.5 rounded">FORFEIT</span>;
                      if (pd.status==='pending')   return <span className="text-[10px] italic text-[#AEAEB2]">Pending</span>;
                      if (pd.status==='submitted') return <span className="text-[10px] font-semibold text-[#34C759]">Submitted ✓</span>;
                      return (
                        <div className="flex gap-1 flex-wrap">
                          {pd.display.map((pick,pIdx) => (
                            <span key={pIdx} title={pick.name}
                              className={`px-1.5 py-0.5 rounded text-[13px] bg-[#F2F2F7] flex items-center gap-0.5 ${pick.isArmband ? 'ring-1 ring-[#FF9500]' : ''}`}>
                              {pick.flag}{pick.isArmband && <span className="text-[9px] text-[#FF9500] font-black">Ⓒ</span>}
                            </span>
                          ))}
                        </div>
                      );
                    };

                    return (
                      <div key={index}
                        className={`border rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden transition-all ${isUserMatch ? 'border-[#007AFF] bg-[#007AFF]/5 ring-1 ring-[#007AFF]/20' : 'border-[#E5E5EA] bg-white hover:border-[#D1D1D6]'}`}>
                        {isUserMatch && <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#007AFF]" />}
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black tracking-wider text-[#8E8E93] uppercase font-mono">Match {index+1}{isUserMatch && ' • YOUR MATCH'}</span>
                          {isUserMatch && <span className="bg-[#007AFF] text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Live</span>}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p1name===currentUser ? 'bg-[#007AFF]' : 'bg-transparent'}`} />
                            <p className={`text-xs truncate ${p1name===currentUser ? 'font-bold' : 'font-medium'}`}>{p1name}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {renderPicks(p1data,p1forfeited)}
                            <span className="font-mono text-sm font-bold text-[#1C1C1E] min-w-[20px] text-right">{score1!==null?score1:'—'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-[1px] bg-[#F2F2F7]" />
                          <span className="text-[9px] font-black text-[#AEAEB2] font-mono">VS</span>
                          <div className="flex-1 h-[1px] bg-[#F2F2F7]" />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p2name===currentUser ? 'bg-[#007AFF]' : 'bg-transparent'}`} />
                            <p className={`text-xs truncate ${p2name===currentUser ? 'font-bold' : 'font-medium'}`}>{p2name}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {renderPicks(p2data,p2forfeited)}
                            <span className="font-mono text-sm font-bold text-[#1C1C1E] min-w-[20px] text-right">{score2!==null?score2:'—'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* League table */}
            <section className="bg-white rounded-2xl border border-[#E5E5EA] shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="p-4 border-b border-[#E5E5EA]">
                <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">Official Tournament Standings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F2F2F7] text-[#636366] text-[10px] font-bold uppercase tracking-wider border-b border-[#E5E5EA]">
                      <th className="py-2.5 px-4 text-center w-12">Pos</th>
                      <th className="py-2.5 px-4">Manager</th>
                      <th className="py-2.5 px-4 text-center">P</th>
                      <th className="py-2.5 px-4 text-center">W</th>
                      <th className="py-2.5 px-4 text-center">D</th>
                      <th className="py-2.5 px-4 text-center">L</th>
                      <th className="py-2.5 px-4 text-center font-bold text-[#1C1C1E]">League Pts</th>
                      <th className="py-2.5 px-4 text-center text-[#8E8E93]">GW Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5EA] text-xs font-medium text-[#1C1C1E]">
                    {leagueTable.map((row,idx) => (
                      <tr key={row.name} className={`hover:bg-[#F2F2F7]/40 ${row.name===currentUser ? 'bg-[#007AFF]/5 font-semibold' : ''}`}>
                        <td className="py-3 px-4 text-center font-mono font-bold text-[#636366]">{idx+1}</td>
                        <td className="py-3 px-4 font-bold">
                          <div className="flex items-center gap-1.5">
                            {row.name}
                            {row.name===currentUser && <span className="bg-[#007AFF] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">YOU</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[#636366]">{row.played}</td>
                        <td className="py-3 px-4 text-center font-mono text-[#34C759]">{row.w}</td>
                        <td className="py-3 px-4 text-center font-mono text-[#8E8E93]">{row.d}</td>
                        <td className="py-3 px-4 text-center font-mono text-[#FF3B30]">{row.l}</td>
                        <td className="py-3 px-4 text-center font-mono font-black text-sm text-[#007AFF]">{row.h2hPts}</td>
                        <td className="py-3 px-4 text-center font-mono text-[#636366]">{row.totalScore} pts · <span className="text-gray-400">{row.winsSelected}W</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Performance Chart */}
            {(() => {
              const perfData = buildPerformanceData(allPicks, allResults);
              if (perfData.length === 0) {
                return (
                  <section className="bg-white rounded-2xl border border-[#E5E5EA] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-2">Performance Tracker</h3>
                    <p className="text-xs text-[#8E8E93] italic">The race chart appears here once the first gameweek has been scored.</p>
                  </section>
                );
              }
              return (
                <section className="bg-white rounded-2xl border border-[#E5E5EA] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                  <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-1">📈 Performance Tracker</h3>
                  <p className="text-[11px] text-[#8E8E93] mb-4">Cumulative league points across the tournament. Your line is highlighted.</p>
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer>
                      <LineChart data={perfData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F7" />
                        <XAxis dataKey="gw" tick={{ fontSize: 10, fill: '#8E8E93' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#8E8E93' }} allowDecimals={false} />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E5EA' }} />
                        {ALL_PLAYERS.map((player, i) => {
                          const isMe = player === currentUser;
                          return (
                            <Line key={player} type="monotone" dataKey={player}
                              stroke={CHART_COLORS[i % CHART_COLORS.length]}
                              strokeWidth={isMe ? 3.5 : 1.5}
                              strokeOpacity={isMe ? 1 : 0.35}
                              dot={false}
                              activeDot={{ r: isMe ? 5 : 3 }} />
                          );
                        })}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 justify-center">
                    {ALL_PLAYERS.map((player, i) => (
                      <div key={player} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length], opacity: player===currentUser ? 1 : 0.4 }} />
                        <span className={`text-[9px] ${player===currentUser ? 'font-bold text-[#1C1C1E]' : 'text-[#8E8E93]'}`}>{player}</span>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })()}

            {/* Fun Stats / Awards */}
            {(() => {
              const awards = buildAwards(allPicks, allResults);
              const AWARD_DEFS = [
                { key:'captainFantastic', emoji:'🧢', title:'Captain Fantastic', desc:'Most winning captain picks',  suffix:'wins' },
                { key:'crystalBall',      emoji:'🔮', title:'Crystal Ball',      desc:'Most outright wins picked',   suffix:'wins' },
                { key:'maverick',         emoji:'🃏', title:'The Maverick',       desc:'Most picks no one else made', suffix:'unique' },
                { key:'banker',           emoji:'💰', title:'Banker',             desc:'Highest single gameweek score', suffix:'pts' },
                { key:'consistent',       emoji:'📊', title:'Mr Consistent',      desc:'Smallest gap, best to worst GW', suffix:'spread' },
                { key:'heartbreaker',     emoji:'💔', title:'Heartbreaker',       desc:'Most fixtures lost by 1 point', suffix:'losses' },
                { key:'forfeitKing',      emoji:'🥄', title:'Wooden Spoon',       desc:'Most missed deadlines',       suffix:'forfeits' },
                { key:'captainChaos',     emoji:'🌪️', title:'Captain Chaos',      desc:'Worst armband luck',          suffix:'fails' },
              ];
              return (
                <section className="bg-white rounded-2xl border border-[#E5E5EA] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                  <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-1">🏅 Hall of Fame</h3>
                  <p className="text-[11px] text-[#8E8E93] mb-4">Fun awards from across the tournament so far.</p>
                  {!awards ? (
                    <p className="text-xs text-[#8E8E93] italic">Awards unlock once the first gameweek has been scored.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {AWARD_DEFS.map(def => {
                        const winner = awards[def.key];
                        const hasWinner = winner && winner.value > 0;
                        return (
                          <div key={def.key} className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E5EA] bg-[#F2F2F7]/40">
                            <span className="text-2xl flex-shrink-0">{def.emoji}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-[#1C1C1E]">{def.title}</p>
                              <p className="text-[10px] text-[#8E8E93] truncate">{def.desc}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              {hasWinner ? (
                                <>
                                  <p className={`text-xs font-bold ${winner.name===currentUser ? 'text-[#007AFF]' : 'text-[#1C1C1E]'}`}>{winner.name}</p>
                                  <p className="text-[10px] text-[#8E8E93] font-mono">{winner.value} {def.suffix}</p>
                                </>
                              ) : (
                                <p className="text-[10px] text-[#AEAEB2] italic">TBD</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })()}
          </div>
        )}
        {currentTab === 'admin' && isAdmin && (
          <div className="space-y-6">
            <div className="flex gap-1 flex-wrap">
              {ROUNDS.map(gw => (
                <button key={gw} onClick={() => setActiveRound(gw)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${activeRound===gw ? 'bg-[#007AFF] text-white' : 'bg-white border border-[#E5E5EA] text-[#636366] hover:bg-[#F2F2F7]'}`}>
                  {ROUND_SHORT[gw]}
                </button>
              ))}
            </div>

            {/* Fixtures management */}
            <section className="bg-white rounded-2xl border border-[#E5E5EA] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-1">Fixtures — {ROUND_LABELS[activeRound]}</h3>
              <p className="text-[11px] text-[#8E8E93] mb-3">Pull this gameweek's matches live from football-data.org. This sets the pick pool and auto-calculates the deadline (1hr before first kickoff).</p>
              <button onClick={handleRefreshFixtures} disabled={isFetchingFix}
                className="w-full py-2.5 bg-[#1C1C1E] text-white rounded-xl font-bold text-xs transition-all hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2">
                {isFetchingFix ? <span className="animate-pulse">🌐 Fetching fixtures...</span> : `🔄 Refresh Fixtures (${ROUND_SHORT[activeRound]})`}
              </button>
              {(allFixtures[activeRound]?.length > 0) && (
                <p className="text-[11px] text-[#34C759] font-semibold mt-2">✓ {allFixtures[activeRound].length} nations cached. Deadline: {deadlines[activeRound] ? new Date(deadlines[activeRound]).toLocaleString('en-GB',{timeZone:'Europe/London'}) + ' BST' : 'n/a'}</p>
              )}
            </section>

            {/* Submission status */}
            <section className="bg-white rounded-2xl border border-[#E5E5EA] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-4">Submission Status — {ROUND_LABELS[activeRound]}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_PLAYERS.map(player => {
                  const submitted = !!(allPicks?.[activeRound]?.[player]?.picks?.length);
                  const picks     = allPicks?.[activeRound]?.[player]?.picks ?? [];
                  const dl = deadlines[activeRound];
                  const isForfeit = !submitted && dl !== null && Date.now() >= dl;
                  return (
                    <div key={player}
                      className={`flex items-center justify-between p-3 rounded-xl border ${submitted ? 'border-[#34C759]/30 bg-[#34C759]/5' : isForfeit ? 'border-[#FF3B30]/30 bg-[#FF3B30]/5' : 'border-[#E5E5EA] bg-[#F2F2F7]/50'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${submitted ? 'text-[#34C759]' : isForfeit ? 'text-[#FF3B30]' : 'text-[#AEAEB2]'}`}>
                          {submitted ? '✓' : isForfeit ? '✗' : '○'}
                        </span>
                        <span className="text-xs font-semibold text-[#1C1C1E]">{player}</span>
                      </div>
                      {submitted ? (
                        <div className="flex items-center gap-1">
                          {picks.map((pick,pIdx) => (
                            <span key={pIdx} title={pick.name} className={`text-base ${pick.isArmband ? 'ring-1 ring-[#FF9500] rounded px-0.5' : ''}`}>
                              {pick.flag}{pick.isArmband && <span className="text-[9px] text-[#FF9500]">Ⓒ</span>}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className={`text-[10px] font-bold ${isForfeit ? 'text-[#FF3B30]' : 'text-[#AEAEB2]'}`}>
                          {isForfeit ? 'FORFEIT' : 'Not submitted'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Results entry + API fetch */}
            <section className="bg-white rounded-2xl border border-[#E5E5EA] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-1">Match Results — {ROUND_LABELS[activeRound]}</h3>
              <p className="text-[11px] text-[#8E8E93] mb-4">Fetch results from the API after matches finish, review, then Calculate.</p>
              <button onClick={handleFetchResults} disabled={isFetchingAPI}
                className="w-full mb-3 py-2.5 bg-[#5AC8FA] text-white rounded-xl font-bold text-xs transition-all hover:bg-[#32ADE6] disabled:opacity-50 flex items-center justify-center gap-2">
                {isFetchingAPI ? <span className="animate-pulse">🌐 Fetching results...</span> : `🌐 Fetch Results from API (${ROUND_SHORT[activeRound]})`}
              </button>
              {fetchStatus && (
                <div className={`mb-4 p-3 rounded-xl border text-xs font-semibold ${fetchStatus==='success' ? 'bg-[#34C759]/10 border-[#34C759]/30 text-[#34C759]' : 'bg-[#FF3B30]/10 border-[#FF3B30]/30 text-[#FF3B30]'}`}>
                  {fetchStatus==='success' ? '✓ ' : '⚠️ '}{fetchMessage}
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-[1px] bg-[#E5E5EA]" />
                <span className="text-[10px] font-bold text-[#8E8E93] uppercase">or enter manually</span>
                <div className="flex-1 h-[1px] bg-[#E5E5EA]" />
              </div>
              {(allFixtures[activeRound]?.length > 0) ? (
                <div className="space-y-2">
                  {allFixtures[activeRound].map(match => (
                    <div key={match.matchId} className="p-3 bg-[#F2F2F7]/50 rounded-xl border border-[#E5E5EA]">
                      <div className="flex flex-col sm:flex-row gap-2">
                        {[match.home, match.away].map(nation => (
                          <div key={nation.id} className="flex items-center gap-2 flex-1">
                            <span className="text-xl">{nation.flag}</span>
                            <span className="text-xs font-semibold text-[#1C1C1E] flex-1 truncate">{nation.name}</span>
                            <div className="flex gap-1">
                              {['W','D','L'].map(r => (
                                <button key={r} onClick={() => setRoundResults(prev => ({...prev,[nation.id]:r}))}
                                  className={`w-8 h-8 rounded-lg text-[11px] font-black transition-all border ${
                                    roundResults[nation.id]===r
                                      ? r==='W' ? 'bg-[#34C759] text-white border-[#34C759]'
                                        : r==='D' ? 'bg-[#FF9500] text-white border-[#FF9500]'
                                        : 'bg-[#FF3B30] text-white border-[#FF3B30]'
                                      : 'bg-white border-[#E5E5EA] text-[#636366] hover:bg-[#E5E5EA]'
                                  }`}>
                                  {r}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8E8E93] italic">No fixtures cached yet. Refresh fixtures above first.</p>
              )}
              <button onClick={handleCalculateRound} disabled={isCalculating}
                className="mt-5 w-full py-3 bg-[#007AFF] text-white rounded-xl font-bold text-sm transition-all hover:bg-[#0062CC] disabled:opacity-50 flex items-center justify-center gap-2">
                {isCalculating ? '⚙️ Calculating...' : `⚽ Calculate ${ROUND_SHORT[activeRound]} & Update League Table`}
              </button>
            </section>
          </div>
        )}

      </main>
    </div>
  );
}