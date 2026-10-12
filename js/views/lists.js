// Listes consultables et filtrables : mes cartes, fiches de cours, formulaire, lexique.
import { h } from '../ui/dom.js';
import { ueChips, ueSelect, datedNote } from '../ui/components.js';
import { hrefs } from '../ui/router.js';
import { matches } from '../core/search.js';
import { kindOf } from '../core/catalog.js';
import { isValidBackup } from '../core/store.js';
import { today } from '../core/dates.js';
import { KIND_BADGE, PAGE } from '../config.js';

// Fabrique d'une vue « recherche + filtre par UE + liste paginée ».
//   source(ctx, ue) -> éléments ; text(item) -> texte recherché ; row(ctx, item, refresh) -> nœud
//   hash(ue) -> adresse après changement d'UE ; extras(ctx, ue, refresh) -> { top, bottom }
function listView(cfg) {
  return function view(ctx, params) {
    const ue = ctx.cat.hasUe(params.ue) ? params.ue : '';
    let term = params.q || '';
    let shown = PAGE;

    const list = h('div', { class: 'card-list' });
    const box = h('input', { type: 'search', placeholder: cfg.placeholder, 'aria-label': 'Rechercher', value: term });

    function refresh() {
      list.textContent = '';
      const items = cfg.source(ctx, ue).filter((it) => matches(cfg.text(it), term));
      list.appendChild(h('p', { class: 'muted small' }, items.length + ' ' + cfg.unit + (items.length > 1 ? 's' : '')));
      if (!items.length) list.appendChild(h('div', { class: 'card-empty' }, 'Aucun résultat.'));
      items.slice(0, shown).forEach((it) => list.appendChild(cfg.row(ctx, it, refresh)));
      if (items.length > shown) {
        list.appendChild(h('button', { class: 'btn block', onclick: () => { shown += PAGE; refresh(); } },
          'Afficher plus (' + (items.length - shown) + ' restantes)'));
      }
    }
    box.addEventListener('input', () => { term = box.value; shown = PAGE; refresh(); });

    const extras = cfg.extras ? cfg.extras(ctx, ue, refresh) : {};
    ctx.render(h('div', null,
      h('h1', { class: 'page-title' }, cfg.title),
      ueChips(ctx.cat, ue, (val) => { location.hash = cfg.hash(val); }),
      box, extras.top, list, extras.bottom));
    refresh();
    return {};
  };
}

function plainRow(ctx, label, title, bodyNode, item) {
  return h('div', { class: 'row' },
    h('div', { class: 'row-main' },
      h('div', { class: 'flash-ue' }, label),
      title ? h('div', null, h('strong', null, title)) : null,
      bodyNode, datedNote(item)));
}

// ---------- Fiches de cours ----------

export const notesView = listView({
  title: 'Fiches de cours',
  placeholder: 'Rechercher dans les fiches de cours…',
  unit: 'fiche',
  hash: hrefs.notes,
  source: (ctx, ue) => ctx.cat.notesFor(ue),
  text: (n) => n.q + ' ' + n.a,
  row: (ctx, n) => plainRow(ctx, ctx.cat.ueLabel(n.ue), n.q, h('div', { class: 'note-body' }, n.a), n),
});

// ---------- Formulaire ----------

export const formulasView = listView({
  title: 'Formulaire',
  placeholder: 'Rechercher une formule…',
  unit: 'formule',
  hash: hrefs.formulas,
  source: (ctx, ue) => ctx.cat.cardsFor(ue, 'formule'),
  text: (c) => c.q + ' ' + c.a,
  row: (ctx, c) => plainRow(ctx, ctx.cat.ueLabel(c.ue), c.q, h('div', { class: 'formula' }, c.a), c),
});

// ---------- Lexique ----------

export const glossaryView = listView({
  title: 'Lexique',
  placeholder: 'Rechercher un terme…',
  unit: 'terme',
  hash: hrefs.glossary,
  source: (ctx, ue) => ctx.cat.glossaryFor(ue).slice().sort((a, b) => a.term.localeCompare(b.term, 'fr')),
  text: (g) => g.term + ' ' + g.def,
  row: (ctx, g) => plainRow(ctx, ctx.cat.ueLabel(g.ue), g.term, h('div', { class: 'muted' }, g.def), g),
});

// ---------- Mes cartes : toutes les flashcards, ajout, sauvegarde ----------

export const cardsView = listView({
  title: 'Mes cartes',
  placeholder: 'Rechercher une flashcard…',
  unit: 'flashcard',
  hash: hrefs.cards,
  source: (ctx, ue) => ctx.cat.cardsFor(ue, '', ctx.state.custom),
  text: (c) => c.q + ' ' + c.a,
  row(ctx, c, refresh) {
    const custom = ctx.state.custom.some((x) => x.id === c.id);
    const p = ctx.state.progress[c.id];
    const badge = KIND_BADGE[kindOf(c)];
    return h('div', { class: 'row' },
      h('div', { class: 'row-main' },
        h('div', { class: 'flash-ue' }, ctx.cat.ueLabel(c.ue) + (badge ? ' · ' + badge : '') + (custom ? ' · perso' : '') + (p ? ' · boîte ' + p.box : ' · nouvelle')),
        h('div', null, h('strong', null, c.q)),
        h('div', { class: 'muted' }, c.a),
        datedNote(c)),
      custom ? h('button', { class: 'btn small danger', onclick: () => removeCard(ctx, c.id) }, 'Supprimer') : null);
  },
  extras(ctx, ue, refresh) {
    return { top: addForm(ctx, ue, refresh), bottom: backupTools(ctx) };
  },
});

function addForm(ctx, ue, refresh) {
  const fUe = ueSelect(ctx.cat, 'new-ue', ue || ctx.cat.ueKeys[ctx.cat.ueKeys.length - 2]);
  const fQ = h('textarea', { rows: 2, required: true, placeholder: 'Question (ex. Formule du BFR ?)' });
  const fA = h('textarea', { rows: 3, required: true, placeholder: 'Réponse' });
  const form = h('form', {
    class: 'form',
    onsubmit: (e) => {
      e.preventDefault();
      const q = fQ.value.trim(), a = fA.value.trim();
      if (!q || !a) return;
      ctx.state.custom.push({ id: 'c-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ue: Number(fUe.value), q, a });
      ctx.store.save();
      fQ.value = ''; fA.value = '';
      refresh();
      fQ.focus();
    },
  }, fUe, fQ, fA, h('button', { class: 'btn primary big block', type: 'submit' }, 'Ajouter la carte'));
  return h('details', { class: 'add' }, h('summary', null, '➕ Ajouter ma propre carte'), form);
}

function removeCard(ctx, id) {
  if (!confirm('Supprimer cette carte ?')) return;
  ctx.state.custom = ctx.state.custom.filter((c) => c.id !== id);
  delete ctx.state.progress[id];
  ctx.store.save();
  ctx.reroute();
}

function backupTools(ctx) {
  const fileInput = h('input', { type: 'file', accept: 'application/json', hidden: true });
  fileInput.addEventListener('change', () => {
    const f = fileInput.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if (!isValidBackup(d)) throw new Error('format');
        if (!confirm('Remplacer toute ta progression et tes cartes par ce fichier ?')) return;
        ctx.store.replace(d);
        alert('Sauvegarde importée.');
        ctx.reroute();
      } catch (e) { alert('Fichier invalide.'); }
    };
    r.readAsText(f);
  });

  function exportData() {
    const blob = new Blob([JSON.stringify(ctx.state, null, 2)], { type: 'application/json' });
    const a = h('a', { href: URL.createObjectURL(blob), download: 'revision-dcg-' + today(ctx.now()) + '.json' });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function resetProgress() {
    if (!confirm('Effacer toute la progression (tes cartes perso sont conservées) ?')) return;
    ctx.store.resetProgress();
    ctx.reroute();
  }

  return h('details', { class: 'add' },
    h('summary', null, '💾 Sauvegarde et réinitialisation'),
    h('div', { class: 'stack' },
      h('button', { class: 'btn block', onclick: exportData }, 'Exporter ma sauvegarde'),
      h('button', { class: 'btn block', onclick: () => fileInput.click() }, 'Importer une sauvegarde'),
      fileInput,
      h('button', { class: 'btn block danger', onclick: resetProgress }, 'Réinitialiser la progression')));
}

