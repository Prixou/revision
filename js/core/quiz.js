// Logique des QCM (sans DOM) : mélange des choix, difficulté, notation de l'examen blanc.
import { shuffle } from './random.js';

// On mélange l'ordre des choix : sinon la bonne réponse se devine à sa position.
export function withShuffledChoices(q, rng = Math.random) {
  const order = shuffle(q.choices.map((_, i) => i), rng);
  return Object.assign({}, q, {
    choices: order.map(i => q.choices[i]),
    answer: order.indexOf(q.answer),
  });
}

// Une question est « fragile » quand l'utilisateur l'a plus souvent ratée que réussie.
export function isWeak(rec) { return !!rec && rec.ko > rec.ok; }

export function recordAnswer(qcmState, q, idx) {
  const rec = qcmState[q.id] || { ok: 0, ko: 0 };
  const good = idx === q.answer;
  if (good) rec.ok++; else rec.ko++;
  qcmState[q.id] = rec;
  return good;
}

// rows : [{ q, picked }] — picked null = sans réponse. Note sur 20, détail par UE, erreurs.
export function scoreExam(rows) {
  const byUe = {};
  rows.forEach(r => {
    const k = r.q.ue;
    byUe[k] = byUe[k] || { ok: 0, n: 0 };
    byUe[k].n++;
    if (r.picked === r.q.answer) byUe[k].ok++;
  });
  const total = rows.filter(r => r.picked === r.q.answer).length;
  return {
    total,
    byUe,
    mistakes: rows.filter(r => r.picked !== r.q.answer),
    note20: rows.length ? Math.round(20 * total / rows.length * 10) / 10 : 0,
  };
}
