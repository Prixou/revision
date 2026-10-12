import test from 'node:test';
import assert from 'node:assert/strict';
import { nextProgress, buildQueue, streak, isDue, newIntroducedToday } from '../js/core/srs.js';
import { inDays, today, daysBetween, dayStr } from '../js/core/dates.js';
import { clozeParts, maskCloze, revealCloze, countBlanks } from '../js/core/cloze.js';
import { withShuffledChoices, scoreExam, recordAnswer, isWeak } from '../js/core/quiz.js';
import { createStore, emptyState, isValidBackup } from '../js/core/store.js';
import { shuffle } from '../js/core/random.js';
import { matches, normalize } from '../js/core/search.js';
import { phaseFor, dailyTarget } from '../js/core/planning.js';
import { parseHash, hashOf, hrefs, legacyRedirect } from '../js/ui/router.js';

const NOW = new Date(2026, 9, 12, 10, 0, 0); // 12/10/2026

test('dates : jour local, décalage et écart', () => {
  assert.equal(today(NOW), '2026-10-12');
  assert.equal(inDays(3, NOW), '2026-10-15');
  assert.equal(inDays(30, NOW), '2026-11-11');
  assert.equal(daysBetween('2026-10-12', '2026-12-01'), 50);
  assert.equal(daysBetween('2026-10-12', '2026-10-10'), -2);
  assert.equal(daysBetween('x', '2026-10-10'), null);
});

test('srs : bonne réponse monte de boîte et espace la revue', () => {
  let p = nextProgress(undefined, 'good', NOW);
  assert.deepEqual([p.box, p.seen, p.ok, p.due, p.first], [1, 1, 1, '2026-10-13', '2026-10-12']);
  p = nextProgress(p, 'good', NOW);
  assert.equal(p.box, 2);
  assert.equal(p.due, '2026-10-15');
});

test('srs : « à revoir » repart de la boîte 0 et reste due aujourd\'hui', () => {
  const p = nextProgress({ box: 3, due: '2026-11-01', seen: 4, ok: 4, first: '2026-10-01' }, 'again', NOW);
  assert.equal(p.box, 0);
  assert.equal(p.due, '2026-10-12');
  assert.equal(p.ok, 4);
});

test('srs : « hésitant » garde la boîte et revoit demain au plus tôt', () => {
  const p = nextProgress({ box: 0, due: '2026-10-12', seen: 1, ok: 0, first: '2026-10-12' }, 'hard', NOW);
  assert.equal(p.box, 0);
  assert.equal(p.due, '2026-10-13');
});

test('srs : la boîte est plafonnée', () => {
  let p;
  for (let i = 0; i < 20; i++) p = nextProgress(p, 'good', NOW);
  assert.equal(p.box, 6);
});

test('srs : file du jour = révisions échues + nouvelles dans la limite quotidienne', () => {
  const cards = Array.from({ length: 50 }, (_, i) => ({ id: 'c' + i }));
  const progress = {
    c0: { box: 1, due: '2026-10-12', seen: 1, ok: 1, first: '2026-10-01' },
    c1: { box: 1, due: '2026-10-20', seen: 1, ok: 1, first: '2026-10-01' },
    c2: { box: 0, due: '2026-10-12', seen: 1, ok: 0, first: '2026-10-12' }, // introduite aujourd'hui
  };
  assert.equal(newIntroducedToday(progress, NOW), 1);
  assert.equal(isDue(progress, 'c1', NOW), false);
  const q = buildQueue(cards, progress, { now: NOW, newPerDay: 20, rng: () => 0.5 });
  assert.deepEqual(q.reviews.map((c) => c.id).sort(), ['c0', 'c2']);
  assert.equal(q.fresh.length, 19); // 20 - 1 déjà introduite aujourd'hui
  assert.equal(q.freshTotal, 47);
});

test('srs : série de jours consécutifs', () => {
  const log = { '2026-10-12': 3, '2026-10-11': 1, '2026-10-10': 5, '2026-10-08': 2 };
  assert.equal(streak(log, NOW), 3);
  assert.equal(streak({ '2026-10-11': 1, '2026-10-10': 1 }, NOW), 2); // journée en cours non encore commencée
  assert.equal(streak({}, NOW), 0);
});

test('cloze : masquage, révélation et découpage', () => {
  const t = 'Le SR = {{charges fixes}} ÷ taux de {{MCV}}.';
  assert.equal(maskCloze(t), 'Le SR = […] ÷ taux de […].');
  assert.equal(revealCloze(t), 'Le SR = charges fixes ÷ taux de MCV.');
  assert.equal(countBlanks(t), 2);
  assert.deepEqual(clozeParts(t).filter((p) => p.blank).map((p) => p.blank), ['charges fixes', 'MCV']);
  assert.equal(clozeParts('sans trou').length, 1);
});

test('qcm : le mélange conserve la bonne réponse', () => {
  const q = { id: 'x', choices: ['A', 'B', 'C', 'D'], answer: 2 };
  for (let s = 1; s <= 30; s++) {
    let seed = s;
    const rng = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const m = withShuffledChoices(q, rng);
    assert.equal(m.choices[m.answer], 'C');
    assert.deepEqual([...m.choices].sort(), ['A', 'B', 'C', 'D']);
  }
  assert.deepEqual(q.choices, ['A', 'B', 'C', 'D']); // l'original n'est pas modifié
});

test('qcm : notation de l\'examen blanc', () => {
  const rows = [
    { q: { ue: 2, answer: 1 }, picked: 1 },
    { q: { ue: 2, answer: 0 }, picked: 3 },
    { q: { ue: 4, answer: 2 }, picked: null },
    { q: { ue: 4, answer: 2 }, picked: 2 },
  ];
  const r = scoreExam(rows);
  assert.equal(r.total, 2);
  assert.equal(r.note20, 10);
  assert.deepEqual(r.byUe, { 2: { ok: 1, n: 2 }, 4: { ok: 1, n: 2 } });
  assert.equal(r.mistakes.length, 2);
  assert.equal(scoreExam([]).note20, 0);
});

test('qcm : suivi des erreurs', () => {
  const st = {};
  const q = { id: 'q1', answer: 1 };
  assert.equal(recordAnswer(st, q, 0), false);
  assert.equal(isWeak(st.q1), true);
  assert.equal(recordAnswer(st, q, 1), true);
  assert.equal(isWeak(st.q1), false); // 1 réussite, 1 échec
});

test('store : valeurs par défaut, sauvegarde, import et réinitialisation', () => {
  const mem = {};
  const storage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = v; } };
  const s = createStore(storage, 'k');
  assert.deepEqual(s.state, emptyState());
  s.state.progress.a = { box: 1 };
  s.save();
  assert.equal(createStore(storage, 'k').state.progress.a.box, 1);
  // une ancienne sauvegarde sans les nouvelles clés reste lisible
  mem.old = JSON.stringify({ custom: [], progress: {}, qcm: {}, log: {} });
  assert.deepEqual(createStore(storage, 'old').state.cases, {});
  s.resetProgress();
  assert.deepEqual(s.state.progress, {});
  assert.equal(isValidBackup({ custom: [] }), true);
  assert.equal(isValidBackup({ progress: {} }), false);
  mem.bad = '{pas du json';
  assert.deepEqual(createStore(storage, 'bad').state, emptyState());
  assert.deepEqual(createStore(null).state, emptyState());
});

test('random : shuffle conserve les éléments', () => {
  const a = [1, 2, 3, 4, 5];
  assert.deepEqual(shuffle(a).sort(), a);
  assert.deepEqual(a, [1, 2, 3, 4, 5]);
});

test('search : insensible à la casse et aux accents', () => {
  assert.equal(normalize('Société À Mission'), 'societe a mission');
  assert.equal(matches('Taux réduit de TVA', 'tva reduit'), true);
  assert.equal(matches('Taux réduit de TVA', 'is'), false);
  assert.equal(matches('abc', ''), true);
});

test('planning : phase et rythme', () => {
  assert.equal(phaseFor(60).key, 'learn');
  assert.equal(phaseFor(20).key, 'consolidate');
  assert.equal(phaseFor(10).key, 'train');
  assert.equal(phaseFor(3).key, 'final');
  assert.equal(dailyTarget(37, 300), 10); // 300 cartes en 30 jours
  assert.equal(dailyTarget(5, 40), 40);
  assert.equal(dailyTarget(30, 0), 0);
});

test('router : analyse et construction des adresses', () => {
  assert.deepEqual(parseHash('#/review?ue=11&kind=calc'), { name: 'review', params: { ue: '11', kind: 'calc' } });
  assert.deepEqual(parseHash(''), { name: 'home', params: {} });
  assert.equal(hashOf('#/x', { a: '1', b: '', c: 'é &' }), '#/x?a=1&c=%C3%A9%20%26');
  assert.equal(hrefs.quiz('quick', '4'), '#/quiz?ue=4');
  assert.equal(hrefs.quiz('exam', ''), '#/quiz?mode=exam');
  assert.equal(legacyRedirect('cards', { mode: 'notes', ue: '2' }), '#/notes?ue=2');
  assert.equal(legacyRedirect('cards', {}), null);
  assert.equal(dayStr(new Date(2026, 0, 5)), '2026-01-05');
});
