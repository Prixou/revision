// Synthèses et tableaux comparatifs : liste puis page de détail.
import { h } from '../ui/dom.js';
import { ueChips, datedNote, tableNode, emptyBox } from '../ui/components.js';
import { hrefs } from '../ui/router.js';

export function synthView(ctx, params) {
  const { cat } = ctx;
  const s = params.id ? cat.synth.find((x) => x.id === params.id) : null;
  if (s) return detail(ctx, s);

  const ue = cat.hasUe(params.ue) ? params.ue : '';
  const list = cat.synthFor(ue);
  ctx.render(h('div', null,
    h('h1', { class: 'page-title' }, 'Synthèses et tableaux'),
    ueChips(cat, ue, (val) => { location.hash = hrefs.synth(val); }),
    list.length
      ? h('div', { class: 'card-list' }, list.map((x) => h('a', { class: 'row link', href: hrefs.synth(x.ue, x.id) },
          h('div', { class: 'row-main' },
            h('div', { class: 'flash-ue' }, cat.ueLabel(x.ue)),
            h('div', null, h('strong', null, x.title)),
            x.summary ? h('div', { class: 'muted' }, x.summary) : null))))
      : emptyBox('Pas encore de synthèse pour cette UE.')));
  return {};
}

function detail(ctx, s) {
  ctx.render(h('div', null,
    h('a', { class: 'back', href: hrefs.synth(s.ue) }, '← Toutes les synthèses'),
    h('div', { class: 'flash-ue' }, ctx.cat.ueLabel(s.ue)),
    h('h1', { class: 'page-title' }, s.title),
    s.summary ? h('p', { class: 'muted' }, s.summary) : null,
    datedNote(s),
    (s.sections || []).map((sec) => h('section', { class: 'syn-sec' },
      h('h2', null, sec.h),
      h('ul', { class: 'syn-list' }, sec.items.map((it) => h('li', null, it))))),
    (s.tables || []).map(tableNode),
    (s.notes || []).length ? h('div', { class: 'syn-links' },
      h('strong', null, 'Pour approfondir : '),
      s.notes.map((id) => ctx.cat.note(id)).filter(Boolean).map((n) => h('a', { class: 'chip-link', href: hrefs.notes(n.ue, n.q.split(' ').slice(0, 3).join(' ')) }, n.q))) : null));
  return {};
}
