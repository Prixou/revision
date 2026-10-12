// Dates au format AAAA-MM-JJ (jour local). Toutes les fonctions acceptent une date « now » pour être testables.

export function pad(n) { return String(n).padStart(2, '0'); }

export function dayStr(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

export function today(now = new Date()) { return dayStr(now); }

export function inDays(n, now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  d.setDate(d.getDate() + n);
  return dayStr(d);
}

export function parseDay(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

// Nombre de jours entiers de `from` à `to` (négatif si `to` est passé).
export function daysBetween(from, to) {
  const a = parseDay(from), b = parseDay(to);
  if (!a || !b) return null;
  return Math.round((b - a) / 86400000);
}
