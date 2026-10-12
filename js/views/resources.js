// Hub des ressources de révision + recherche globale.
import { h } from '../ui/dom.js';
import { ueChips, emptyBox } from '../ui/components.js';
import { hrefs } from '../ui/router.js';
import { matches } from '../core/search.js';

// Une rubrique sans contenu est masquée (count === 0) ; count null = rubrique sans compteur.
function hubTile(href, icon, title, count, text) {
  if (count === 0) return null;
  return h('a', { class: 'hub-tile', href },
    h('span', { class: 'hub-ico', 'aria-hidden': 'true' }, icon),
    h('span', { class: 'hub-title' }, title, count != null ? h('span', { class: 'hub-count' }, String(count)) : null),
    h('span', { class: 'hub-text' }, text));
}

export function resourcesView(ctx, params) {
  const { cat, state } = ctx;
  const ue = cat.hasUe(params.ue) ? params.ue : '';
  const form = h('form', { class: 'search-form', onsubmit: (e) => {
    e.preventDefault();
    const q = box.value.trim();
    if (q) location.hash = hrefs.search(q);
  } });
  const box = h('input', { type: 'search', placeholder: 'Rechercher partout…', 'aria-label': 'Recherche globale' });
  form.appendChild(box);

  ctx.render(h('div', null,
    h('h1', { class: 'page-title' }, 'Ressources'),
    form,
    ueChips(cat, ue, (val) => { location.hash = hrefs.resources(val); }),
    h('div', { class: 'hub' },
      hubTile(hrefs.notes(ue), '📖', 'Fiches de cours', cat.notesFor(ue).length, 'Cours détaillés, reliés aux flashcards'),
      hubTile(hrefs.synth(ue), '🗺️', 'Synthèses et tableaux', cat.synthFor(ue).length, 'Comparatifs, schémas, à retenir'),
      hubTile(hrefs.cases(ue), '📚', 'Cas pratiques corrigés', cat.casesFor(ue).length, 'S\'entraîner comme à l\'examen'),
      hubTile(hrefs.formulas(ue), '🧩', 'Formulaire', cat.cardsFor(ue, 'formule').length, 'Toutes les formules'),
      hubTile(hrefs.glossary(ue), '🔤', 'Lexique', cat.glossaryFor(ue).length, 'Définitions de A à Z'),
      hubTile(hrefs.cards(ue), '🗂️', 'Mes cartes', cat.cardsFor(ue, '', state.custom).length, 'Toutes les flashcards, ajout, sauvegarde'),
      hubTile(hrefs.exams(), '⏳', 'Épreuves et planning', null, 'Format des épreuves, compte à rebours'),
      hubTile(hrefs.links(), '🔗', 'Sources officielles', cat.links.length || null, 'BOFiP, Légifrance, ANC, Ordre des experts-comptables'))));
  return {};
}

// Recherche globale : un bloc de résultats par type de ressource.
export function searchView(ctx, params) {
  const { cat, state } = ctx;
  const term = params.q || '';
  const box = h('input', { type: 'search', value: term, placeholder: 'Rechercher…', 'aria-label': 'Recherche globale' });
  const form = h('form', { class: 'search-form', onsubmit: (e) => {
    e.preventDefault();
    location.hash = hrefs.search(box.value.trim());
  } }, box);

  const LIMIT = 8;
  const groups = [
    { label: 'Fiches de cours', items: cat.notes.filter((n) => matches(n.q + ' ' + n.a, term)), title: (n) => n.q, sub: (n) => n.a, more: hrefs.notes('', term) },
    { label: 'Flashcards', items: cat.cardsFor('', '', state.custom).filter((c) => matches(c.q + ' ' + c.a, term)), title: (c) => c.q, sub: (c) => c.a, more: hrefs.cards('', term) },
    { label: 'Lexique', items: cat.glossary.filter((g) => matches(g.term + ' ' + g.def, term)), title: (g) => g.term, sub: (g) => g.def, more: hrefs.glossary('', term) },
    { label: 'Synthèses', items: cat.synth.filter((s) => matches(s.title + ' ' + (s.summary || ''), term)), title: (s) => s.title, sub: (s) => s.summary || '', href: (s) => hrefs.synth(s.ue, s.id) },
    { label: 'Cas pratiques', items: cat.cases.filter((c) => matches(c.title + ' ' + (c.theme || ''), term)), title: (c) => c.title, sub: (c) => c.theme || '', href: (c) => hrefs.cases(c.ue, c.id) },
  ];

  const blocks = term ? groups.filter((g) => g.items.length).map((g) => h('div', null,
    h('h2', null, g.label + ' (' + g.items.length + ')'),
    h('div', { class: 'card-list' },
      g.items.slice(0, LIMIT).map((it) => h(g.href ? 'a' : 'div', { class: 'row' + (g.href ? ' link' : ''), href: g.href ? g.href(it) : null },
        h('div', { class: 'row-main' },
          h('div', { class: 'flash-ue' }, cat.ueLabel(it.ue)),
          h('div', null, h('strong', null, g.title(it))),
          h('div', { class: 'muted clamp' }, g.sub(it))))),
      g.more && g.items.length > LIMIT ? h('a', { class: 'btn block', href: g.more }, 'Tout voir (' + g.items.length + ')') : null))) : [];

  ctx.render(h('div', null,
    h('h1', { class: 'page-title' }, 'Recherche'),
    form,
    term && !blocks.length ? emptyBox('Aucun résultat pour « ' + term + ' ».') : blocks));
  return {};
}
