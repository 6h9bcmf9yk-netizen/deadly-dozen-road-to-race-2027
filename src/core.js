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
export function calculateAssignments(stations, tests, variant = 'A') {
  const sums = [0, 0];
  let missing = 0;
  for (const station of stations) {
    const entries = tests.filter(t => t.station === station.index && t.valid !== false && t.load === station.load && t.work === station.work);
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
