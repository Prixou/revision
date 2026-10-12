// Sources officielles et ressources externes (liste maintenue dans data/links.json).
import { h } from '../ui/dom.js';
import { ueChips, emptyBox } from '../ui/components.js';
import { hrefs } from '../ui/router.js';

export function linksView(ctx, params) {
  const { cat } = ctx;
  const ue = cat.hasUe(params.ue) ? params.ue : '';
  const items = cat.links.filter((l) => !ue || !l.ue || String(l.ue) === ue);
  const groups = {};
  items.forEach((l) => { (groups[l.cat || 'Autres'] = groups[l.cat || 'Autres'] || []).push(l); });

  ctx.render(h('div', null,
    h('h1', { class: 'page-title' }, 'Sources officielles'),
    h('p', { class: 'muted' }, 'Textes et sites de référence pour vérifier une règle. Ces liens ouvrent des sites externes.'),
    ueChips(cat, ue, (val) => { location.hash = hrefs.links() + (val ? '?ue=' + val : ''); }),
    items.length
      ? Object.keys(groups).map((g) => h('div', null,
          h('h2', null, g),
          h('div', { class: 'card-list' }, groups[g].map((l) => h('a', { class: 'row link', href: l.url, target: '_blank', rel: 'noopener noreferrer' },
            h('div', { class: 'row-main' },
              h('div', null, h('strong', null, l.titre)),
              l.description ? h('div', { class: 'muted' }, l.description) : null))))))
      : emptyBox('Aucune source enregistrée.')));
  return {};
}
