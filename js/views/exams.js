// Épreuves et planning : format de chaque épreuve, date d'examen, compte à rebours, rythme conseillé.
import { h } from '../ui/dom.js';
import { hrefs } from '../ui/router.js';
import { dailyTarget, phaseFor } from '../core/planning.js';
import { daysBetween, today } from '../core/dates.js';
import { isDue, isNew } from '../core/srs.js';

const FIELDS = [
  ['nature', 'Nature'], ['duree', 'Durée'], ['coefficient', 'Coefficient'],
  ['heures_ects', 'Volume et crédits'], ['premiere_session', 'Première session'],
];

export function examsView(ctx) {
  const { cat, state } = ctx;
  const now = ctx.now();

  const blocks = cat.ueKeys.map((ue) => {
    const ep = cat.epreuves[ue] || {};
    const date = state.exams[ue] || '';
    const days = date ? daysBetween(today(now), date) : null;
    const cards = cat.cardsFor(ue, '', state.custom);
    const unseen = cards.filter((c) => isNew(state.progress, c.id)).length;
    const due = cards.filter((c) => isDue(state.progress, c.id, now)).length;

    const input = h('input', { type: 'date', value: date, 'aria-label': 'Date de l\'épreuve UE ' + ue,
      onchange: (e) => {
        if (e.target.value) state.exams[ue] = e.target.value; else delete state.exams[ue];
        ctx.store.save();
        ctx.reroute();
      } });

    let plan = null;
    if (days != null && days >= 0) {
      const phase = phaseFor(days);
      const per = dailyTarget(days, unseen);
      plan = h('div', { class: 'plan' },
        h('div', { class: 'plan-days' }, days === 0 ? 'C\'est aujourd\'hui !' : 'J-' + days),
        h('div', null, h('strong', null, phase.label), ' — ', phase.tip),
        h('div', { class: 'muted' }, unseen + ' carte' + (unseen > 1 ? 's' : '') + ' encore jamais vue' + (unseen > 1 ? 's' : '') +
          (per ? ' · ≈ ' + per + ' nouvelle' + (per > 1 ? 's' : '') + ' par jour conseillée' + (per > 1 ? 's' : '') : '') + ' · ' + due + ' à revoir'));
    } else if (days != null) {
      plan = h('p', { class: 'muted' }, 'Cette date est passée : choisis la prochaine session.');
    }

    const rows = FIELDS.filter(([k]) => ep[k]).map(([k, label]) => h('div', { class: 'kv' }, h('span', { class: 'k' }, label), h('span', null, ep[k])));
    return h('details', { class: 'add exam', open: days != null && days >= 0 },
      h('summary', null, 'UE ' + ue + ' · ' + cat.ues[ue] + (days != null && days >= 0 ? ' · J-' + days : '')),
      h('div', { class: 'exam-body' },
        ep.intitule ? h('p', null, h('strong', null, ep.intitule)) : null,
        rows,
        ep.certitude === 'a_verifier' ? h('p', { class: 'muted small' }, '⚠️ Informations à confirmer sur le site officiel de ton établissement ou de l\'Ordre.') : null,
        ep.format_sujets ? h('p', null, h('strong', null, 'Format des sujets : '), ep.format_sujets) : null,
        (ep.conseils || []).length ? h('div', null, h('strong', null, 'Conseils de méthode'), h('ul', { class: 'syn-list' }, ep.conseils.map((c) => h('li', null, c)))) : null,
        h('label', { class: 'date-field' }, 'Date de mon épreuve ', input),
        plan,
        h('div', { class: 'ue-actions' },
          h('a', { class: 'btn', href: hrefs.review(ue, '') }, 'Flashcards'),
          h('a', { class: 'btn', href: hrefs.quiz('exam', ue) }, 'Examen blanc'),
          h('a', { class: 'btn', href: hrefs.cases(ue) }, 'Cas pratiques'))));
  });

  ctx.render(h('div', null,
    h('h1', { class: 'page-title' }, 'Épreuves et planning'),
    h('p', { class: 'muted' }, 'Saisis la date de chaque épreuve pour obtenir un compte à rebours et un rythme de révision. Vérifie toujours le format officiel auprès de ton établissement.'),
    blocks));
  return {};
}
