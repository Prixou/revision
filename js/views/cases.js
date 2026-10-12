// Cas pratiques corrigés : énoncé, questions, correction à la demande, auto-évaluation.
import { h } from '../ui/dom.js';
import { chipRow, ueChips, datedNote, tableNode, paragraphs, emptyBox } from '../ui/components.js';
import { hrefs } from '../ui/router.js';
import { today } from '../core/dates.js';

const LEVELS = { 1: 'Facile', 2: 'Moyen', 3: 'Difficile' };
const levelLabel = (n) => LEVELS[n] || 'Moyen';

export function casesView(ctx, params) {
  const { cat, state } = ctx;
  const c = params.id ? cat.cases.find((x) => x.id === params.id) : null;
  if (c) return detail(ctx, c);

  const ue = cat.hasUe(params.ue) ? params.ue : '';
  const level = params.level || '';
  const go = (u, l) => { location.hash = '#/cases' + (u || l ? '?' + [u && 'ue=' + u, l && 'level=' + l].filter(Boolean).join('&') : ''); };
  const list = cat.casesFor(ue).filter((x) => !level || String(x.level) === level);
  const done = list.filter((x) => state.cases[x.id] && state.cases[x.id].ok).length;

  ctx.render(h('div', null,
    h('h1', { class: 'page-title' }, 'Cas pratiques'),
    ueChips(cat, ue, (val) => go(val, level)),
    chipRow([{ key: '', label: 'Tous niveaux' }, { key: '1', label: 'Facile' }, { key: '2', label: 'Moyen' }, { key: '3', label: 'Difficile' }], level, (val) => go(ue, val)),
    list.length ? h('p', { class: 'muted small' }, list.length + ' cas · ' + done + ' réussi' + (done > 1 ? 's' : '')) : null,
    list.length
      ? h('div', { class: 'card-list' }, list.map((x) => {
          const r = state.cases[x.id];
          return h('a', { class: 'row link', href: hrefs.cases(x.ue, x.id) },
            h('div', { class: 'row-main' },
              h('div', { class: 'flash-ue' }, cat.ueLabel(x.ue) + ' · ' + levelLabel(x.level) + (x.minutes ? ' · ' + x.minutes + ' min' : '')),
              h('div', null, h('strong', null, (r ? (r.ok ? '✅ ' : '🔁 ') : '') + x.title)),
              x.theme ? h('div', { class: 'muted' }, x.theme) : null));
        }))
      : emptyBox('Pas encore de cas pratique pour cette sélection.')));
  return {};
}

function detail(ctx, c) {
  const { state } = ctx;
  const open = new Set();
  const rec = () => state.cases[c.id];

  function mark(ok) {
    const prev = rec() || { tries: 0 };
    state.cases[c.id] = { ok, tries: prev.tries + 1, last: today(ctx.now()) };
    ctx.store.save();
    draw();
  }

  function draw() {
    const r = rec();
    ctx.render(h('div', null,
      h('a', { class: 'back', href: hrefs.cases(c.ue) }, '← Tous les cas'),
      h('div', { class: 'flash-ue' }, ctx.cat.ueLabel(c.ue) + ' · ' + levelLabel(c.level) + (c.minutes ? ' · ' + c.minutes + ' min' : '')),
      h('h1', { class: 'page-title' }, c.title),
      h('div', { class: 'case-text' }, paragraphs(c.enonce)),
      (c.tables || []).map(tableNode),
      datedNote(c),
      h('h2', null, 'Questions'),
      c.questions.map((q, i) => h('div', { class: 'case-q' },
        h('div', { class: 'case-qt' }, h('strong', null, (i + 1) + '. '), q.q, q.points ? h('span', { class: 'muted' }, ' (' + q.points + ' pt' + (q.points > 1 ? 's' : '') + ')') : null),
        open.has(i)
          ? h('div', { class: 'case-a' }, paragraphs(q.a))
          : h('button', { class: 'btn small', type: 'button', onclick: () => { open.add(i); draw(); } }, 'Voir la correction'))),
      c.conseil ? h('div', { class: 'info' }, h('strong', null, '💡 Pièges et conseils'), h('div', null, c.conseil)) : null,
      h('h2', null, 'Bilan'),
      r ? h('p', { class: 'muted' }, 'Dernier essai : ' + (r.ok ? 'réussi' : 'à retravailler') + ' · ' + r.tries + ' essai' + (r.tries > 1 ? 's' : '')) : null,
      h('div', { class: 'dock grades two' },
        h('button', { class: 'btn again', onclick: () => mark(false) }, '🔁 À retravailler'),
        h('button', { class: 'btn good', onclick: () => mark(true) }, '✅ Réussi'))), true);
  }
  draw();
  window.scrollTo(0, 0);
  return {};
}
