export function parseTime(value) {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : 0;
  const parts = String(value ?? '').trim().split(':');
  if (parts.length !== 2 || !parts.every(x => /^\d+$/.test(x))) return 0;
  const [minutes, seconds] = parts.map(Number);
  return seconds >= 60 ? 0 : minutes * 60 + seconds;
}

export function formatTime(value) {
  if (!Number.isFinite(+value)) return '—';
  const seconds = Math.max(0, Math.floor(+value));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function formatPace(secondsPerKm) {
  if (!Number.isFinite(+secondsPerKm) || secondsPerKm <= 0) return '—';
  const rounded = Math.round(secondsPerKm);
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, '0')} /km`;
}

export function improvementPercent(firstSeconds, bestSeconds) {
  if (!(firstSeconds > 0) || !(bestSeconds >= 0) || bestSeconds > firstSeconds) return null;
  return Math.round((firstSeconds - bestSeconds) / firstSeconds * 1000) / 10;
}

export function trainingWeekIndex(date, start = '2027-01-04', weeks = 11) {
  const day = new Date(date);
  const first = new Date(`${start}T00:00:00`);
  day.setHours(0, 0, 0, 0);
  first.setHours(0, 0, 0, 0);
  if (!Number.isFinite(day.getTime()) || day < first) return 0;
  return Math.min(weeks, Math.floor((day - first) / 604800000) + 1);
}

export function validateSegments(segments, expected, unit) {
  const clean = (segments || []).map(x => ({ athlete: Number(x.athlete), amount: Number(x.amount) }));
  const validRows = clean.length > 0 && clean.every(x => [0, 1].includes(x.athlete) && Number.isFinite(x.amount) && x.amount > 0);
  const total = clean.reduce((sum, x) => sum + x.amount, 0);
  const tolerance = unit === 'm' ? 0.001 : 0;
  return { valid: validRows && Math.abs(total - Number(expected)) <= tolerance, total, expected: Number(expected), unit, segments: clean };
}

export function compareStrategyTrials(tests, stationIndex) {
  const candidates = (tests || []).filter(t => t.station === stationIndex && t.testType === 'strategy' && t.valid !== false && t.strategyId && t.seconds > 0 && t.load && t.workValue > 0);
  const groups = new Map();
  for (const test of candidates) {
    const key = [test.load, test.workValue, test.unit, test.condition || 'isolated', String(test.priorLoad || '').trim().toLowerCase()].join('|');
    if (!groups.has(key)) groups.set(key, new Map());
    const byStrategy = groups.get(key);
    if (!byStrategy.has(test.strategyId)) byStrategy.set(test.strategyId, []);
    byStrategy.get(test.strategyId).push(test);
  }
  const comparisons = [];
  for (const [key, strategies] of groups) {
    if (strategies.size < 2) continue;
    const results = [...strategies].map(([strategyId, rows]) => ({
      strategyId,
      name: rows.at(-1).strategyName || strategyId,
      count: rows.length,
      averageSeconds: Math.round(rows.reduce((n, x) => n + x.seconds, 0) / rows.length),
      bestSeconds: Math.min(...rows.map(x => x.seconds)),
      averageRpe: rows.filter(x => Number.isFinite(x.rpe)).length ? rows.reduce((n, x) => n + (Number(x.rpe) || 0), 0) / rows.filter(x => Number.isFinite(x.rpe)).length : null,
      averagePartnerRpe: rows.filter(x => Number.isFinite(x.partnerRpe)).length ? rows.reduce((n, x) => n + (Number(x.partnerRpe) || 0), 0) / rows.filter(x => Number.isFinite(x.partnerRpe)).length : null,
      averageSwitchSeconds: rows.reduce((n, x) => n + (Number(x.switchSeconds) || 0), 0) / rows.length,
      averageGripFatigue: rows.filter(x => Number.isFinite(x.gripFatigue)).length ? rows.reduce((n, x) => n + (Number(x.gripFatigue) || 0), 0) / rows.filter(x => Number.isFinite(x.gripFatigue)).length : null,
      averageShoulderFatigue: rows.filter(x => Number.isFinite(x.shoulderFatigue)).length ? rows.reduce((n, x) => n + (Number(x.shoulderFatigue) || 0), 0) / rows.filter(x => Number.isFinite(x.shoulderFatigue)).length : null,
      averageRunImpact: rows.filter(x => Number.isFinite(x.runImpact)).length ? rows.reduce((n, x) => n + (Number(x.runImpact) || 0), 0) / rows.filter(x => Number.isFinite(x.runImpact)).length : null,
      conditionKey: key
    })).sort((a, b) => a.averageSeconds - b.averageSeconds);
    comparisons.push({ conditionKey: key, results, sampleCount: results.reduce((n, x) => n + x.count, 0), reliable: results.every(x => x.count >= 2) });
  }
  return comparisons;
}

export function calculateAssignments(stations, tests, variant = 'A') {
  const sums = [0, 0];
  let missing = 0;
  for (const station of stations) {
    const entries = tests.filter(t => t.testType !== 'segment' && t.testType !== 'strategy' && t.station === station.index && t.valid !== false && t.load === station.load && t.work === station.work);
    const byAthlete = [0, 1].map(athlete => entries.filter(t => t.athlete === athlete).map(t => t.seconds).filter(Number.isFinite));
    if (!byAthlete[0].length || !byAthlete[1].length) { missing++; continue; }
    const times = byAthlete.map(xs => Math.min(...xs));
    if (variant === 'C') sums[times[0] <= times[1] ? 0 : 1] += Math.min(...times);
    else {
      const first = station.index % 2 === 0 ? 0 : 1;
      const assigned = variant === 'A' ? first : 1 - first;
      sums[assigned] += times[assigned];
    }
  }
  return { athlete1: sums[0], athlete2: sums[1], total: sums[0] + sums[1], missing };
}
