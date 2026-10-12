// Composants d'interface partagés par les vues.
import { h } from './dom.js';
import { clozeParts } from '../core/cloze.js';

// Pastille « règle datée » : précise l'année ou le texte de loi auquel le chiffre s'applique.
export function datedNote(item) {
  return item && item.d ? h('div', { class: 'dated' }, '📅 ' + item.d) : null;
}

export function chipRow(options, selected, onPick) {
  const box = h('div', { class: 'chips' });
  options.forEach((o) => {
    const on = String(selected) === String(o.key);
    box.appendChild(h('button', {
      class: 'chip' + (on ? ' on' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false',
      onclick: () => { if (!on) onPick(o.key); },
    }, o.label));
  });
  return box;
}

// Rangée de pastilles défilante pour filtrer par UE (adaptée au pouce).
export function ueChips(cat, selected, onPick) {
  const opts = [{ key: '', label: 'Toutes' }];
  cat.ueKeys.forEach((k) => opts.push({ key: k, label: 'UE ' + k + ' · ' + (cat.short[k] || cat.ues[k]) }));
  return chipRow(opts, selected, onPick);
}

export function ueSelect(cat, id, selected) {
  const sel = h('select', { id });
  cat.ueKeys.forEach((k) => sel.appendChild(h('option', { value: k, selected: String(selected) === k }, cat.ueLabel(k))));
  return sel;
}

// Onglets segmentés (liens).
export function seg(items) {
  return h('div', { class: 'seg seg' + items.length }, items.map((it) =>
    h('a', { class: 'seg-btn' + (it.on ? ' on' : ''), href: it.href }, it.label)));
}

export function tile(value, label) {
  return h('div', { class: 'tile' }, h('div', { class: 'tile-v' }, String(value)), h('div', { class: 'tile-l' }, label));
}

export function progressBar(pct, label) {
  return h('div', { class: 'bar', role: 'img', 'aria-label': label || pct + ' %' }, h('span', { style: 'width:' + pct + '%' }));
}

// Texte à trous : masqué ([…]) avant la réponse, mis en évidence après.
export function clozeNodes(text, reveal) {
  return clozeParts(text).map((p) => {
    if (p.text != null) return p.text;
    return h('span', { class: reveal ? 'cloze-hit' : 'cloze-blank' }, reveal ? p.blank : '[…]');
  });
}

// Tableau comparatif défilant horizontalement sur mobile.
export function tableNode(t) {
  return h('div', { class: 'tbl-wrap' },
    t.caption ? h('div', { class: 'tbl-cap' }, t.caption) : null,
    h('div', { class: 'tbl-scroll' },
      h('table', { class: 'tbl' },
        h('thead', null, h('tr', null, t.header.map((c) => h('th', null, c)))),
        h('tbody', null, t.rows.map((r) => h('tr', null, r.map((c, i) => h(i === 0 ? 'th' : 'td', null, c))))))));
}

// Paragraphes séparés par des retours à la ligne.
export function paragraphs(text) {
  return String(text || '').split('\n').filter(Boolean).map((p) => h('p', null, p));
}

export function emptyBox(text) { return h('div', { class: 'card-empty' }, text); }
