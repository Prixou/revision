// Répétition espacée (boîtes de Leitner) — fonctions pures, sans accès au DOM ni au stockage.
import { INTERVALS, NEW_PER_DAY } from '../config.js';
import { today as todayOf, inDays, dayStr } from './dates.js';
import { shuffle } from './random.js';

// grade : 'again' | 'hard' | 'good'. Retourne la nouvelle entrée de progression.
export function nextProgress(prev, g, now = new Date()) {
  const t = todayOf(now);
  const p = Object.assign({ box: 0, due: t, seen: 0, ok: 0, first: t }, prev);
  p.seen++;
  if (g === 'again') p.box = 0;
  else if (g === 'good') { p.box = Math.min(p.box + 1, INTERVALS.length - 1); p.ok++; }
  // 'hard' : on reste dans la même boîte
  p.due = g === 'again' ? t : inDays(Math.max(INTERVALS[p.box], 1), now);
  return p;
}

export function isDue(progress, id, now = new Date()) {
  const p = progress[id];
  return !!p && p.due <= todayOf(now);
}

export function isNew(progress, id) { return !progress[id]; }

export function newIntroducedToday(progress, now = new Date()) {
  const t = todayOf(now);
  return Object.keys(progress).filter(id => progress[id].first === t).length;
}

// File du jour : révisions échues + nouvelles cartes dans la limite quotidienne.
export function buildQueue(cards, progress, { now = new Date(), newPerDay = NEW_PER_DAY, rng = Math.random } = {}) {
  const allowed = Math.max(0, newPerDay - newIntroducedToday(progress, now));
  const fresh = cards.filter(c => isNew(progress, c.id));
  return {
    reviews: cards.filter(c => isDue(progress, c.id, now)),
    fresh: shuffle(fresh, rng).slice(0, allowed),
    freshTotal: fresh.length,
  };
}

export function logReview(log, now = new Date()) {
  const t = todayOf(now);
  log[t] = (log[t] || 0) + 1;
}

// Jours consécutifs révisés (la série n'est pas cassée tant que la journée n'est pas finie).
export function streak(log, now = new Date()) {
  let n = 0;
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!log[dayStr(d)]) d.setDate(d.getDate() - 1);
  while (log[dayStr(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
