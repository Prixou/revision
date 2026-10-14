// Accueil : objectif du jour, raccourcis, progression par UE.
import { h } from '../ui/dom.js';
import { tile, progressBar } from '../ui/components.js';
import { hrefs } from '../ui/router.js';
import { buildQueue, isDue, isNew, streak } from '../core/srs.js';
import { daysBetween, today } from '../core/dates.js';
import { MASTERED_BOX, NEW_PER_DAY, SESSION_SIZE } from '../config.js';

export function homeView(ctx) {
  const { cat, state } = ctx;
  const now = ctx.now();
  const cards = cat.cardsFor('', '', state.custom);
  const q = buildQueue(cards, state.progress, { now });
  const dueCount = q.reviews.length + q.fresh.length;
  const seenToday = state.log[today(now)] || 0;
  const run = streak(state.log, now);

  const tiles = h('div', { class: 'tiles' },
    tile(dueCount, 'à réviser'),
    tile(seenToday, 'faites aujourd\'hui'),
    tile(run, run > 1 ? 'jours d\'affilée' : 'jour d\'affilée'),
    tile(cards.length, 'cartes au total'));

  const detail = dueCount
    ? h('p', { class: 'muted small center' },
        q.reviews.length + ' révision' + (q.reviews.length > 1 ? 's' : '') + ' + ' + q.fresh.length +
        ' nouvelle' + (q.fresh.length > 1 ? 's' : '') + ' (' + NEW_PER_DAY + ' nouvelles max. par jour)')
    : null;

  const cta = dueCount
    ? h('a', { class: 'btn primary big block', href: hrefs.review('', '') }, 'Réviser mes flashcards · ' + Math.min(dueCount, SESSION_SIZE))
    : h('p', { class: 'muted' }, q.freshTotal
        ? 'Objectif du jour atteint 🎉 Fais un QCM ou reviens demain pour de nouvelles cartes.'
        : 'Rien à réviser pour le moment 🎉 Fais un QCM ou ajoute des cartes.');

  const quick = h('div', { class: 'quick' },
    h('a', { class: 'btn', href: hrefs.review('', 'cloze') }, '📝 À trous'),
    h('a', { class: 'btn', href: hrefs.review('', 'calc') }, '🧮 Calculs'),
    h('a', { class: 'btn', href: hrefs.review('', 'ecr') }, '✍️ Écritures'),
    h('a', { class: 'btn', href: hrefs.review('', '', 'hard') }, '🔥 Cartes difficiles'),
    h('a', { class: 'btn', href: hrefs.quiz('exam', '') }, '⏱️ Examen blanc'),
    h('a', { class: 'btn', href: hrefs.quiz('errors', '') }, '🎯 Mes erreurs'),
    cat.cases.length ? h('a', { class: 'btn', href: hrefs.cases('', '') }, '📚 Cas pratiques') : null,
    h('a', { class: 'btn', href: hrefs.formulas('') }, '🧩 Formulaire'));

  const rows = cat.ueKeys.map((k) => {
    const list = cat.cardsFor(k, '', state.custom);
    const mastered = list.filter((c) => { const p = state.progress[c.id]; return p && p.box >= MASTERED_BOX; }).length;
    const pct = list.length ? Math.round(100 * mastered / list.length) : 0;
    const dueN = list.filter((c) => isDue(state.progress, c.id, now)).length;
    const newN = list.filter((c) => isNew(state.progress, c.id)).length;
    return h('div', { class: 'ue-row' },
      h('div', { class: 'ue-head' },
        h('div', { class: 'ue-name' }, h('strong', null, 'UE ' + k), ' ', cat.ues[k]),
        h('div', { class: 'ue-pct' }, pct + ' %')),
      progressBar(pct, pct + ' % maîtrisé'),
      h('div', { class: 'ue-meta' }, list.length
        ? mastered + '/' + list.length + ' maîtrisées · ' + dueN + ' à revoir · ' + newN + ' nouvelles'
        : 'Aucune carte'),
      h('div', { class: 'ue-actions' },
        list.length ? h('a', { class: 'btn', href: hrefs.review(k, '') }, 'Flashcards') : null,
        cat.qcmFor(k).length ? h('a', { class: 'btn', href: hrefs.quiz('quick', k) }, 'QCM') : null,
        h('a', { class: 'btn', href: hrefs.resources(k) }, 'Ressources')));
  });

  // Compte à rebours vers les examens que l'utilisateur a saisis dans « Épreuves et planning »
  const upcoming = Object.keys(state.exams || {})
    .map((ue) => ({ ue, days: daysBetween(today(now), state.exams[ue]) }))
    .filter((x) => x.days != null && x.days >= 0 && cat.hasUe(x.ue))
    .sort((a, b) => a.days - b.days)
    .slice(0, 3);
  const countdown = upcoming.length
    ? h('a', { class: 'info link', href: hrefs.exams() },
        h('strong', null, '⏳ Prochaines épreuves'),
        upcoming.map((x) => h('div', null, 'UE ' + x.ue + ' · ' + (cat.short[x.ue] || cat.ues[x.ue]) + ' : J-' + x.days)))
    : null;

  const meta = cat.meta;
  const info = meta.verifiedOn
    ? h('div', { class: 'info' },
        h('strong', null, '📅 Contenu vérifié le ' + meta.verifiedOn),
        h('div', null, meta.programme),
        meta.verificationNote ? h('div', null, meta.verificationNote) : null,
        h('div', null, 'Les points chiffrés qui changent avec les années portent une pastille 📅 avec la date de la règle.'))
    : null;

  ctx.render(h('div', null, tiles, cta, detail, quick, countdown,
    h('h2', null, 'Progression par UE'), h('div', { class: 'ue-list' }, rows), info));
}
