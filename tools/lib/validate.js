// Contrôles d'intégrité du contenu : schémas, ids, liens, doublons, réponses de QCM.
import { COLLECTIONS } from './io.js';

const KINDS = new Set(['cloze', 'calc', 'ecr', 'formule']);
const ID = {
  notes: /^ue(\d+)-\d+$/,
  cards: /^[fc](\d+)-\d{3,}$/,
  qcm: /^q-ue(\d+)-\d+$/,
  cases: /^cp(\d+)-\d{3,}$/,
  synth: /^sy(\d+)-\d{3,}$/,
  glossary: /^g(\d+)-\d{3,}$/,
};

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const words = (s) => String(s).trim().split(/\s+/).length;
const norm = (s) => String(s).toLowerCase().replace(/\s+/g, ' ').trim();

export function validate(all) {
  const errors = [], warnings = [];
  const err = (m) => errors.push(m);
  const warn = (m) => warnings.push(m);
  const ids = new Map();
  const counts = {};

  if (!all.meta || !all.meta.ues) err('data/meta.json : champ « ues » manquant');
  const ues = (all.meta && all.meta.ues) || {};

  // Les cartes peuvent renvoyer vers une fiche d'une autre UE (ex. réserve légale vue en UE 10 et en UE 2).
  const noteIds = new Set(Object.values(all.collections).flatMap((c) => c.notes.map((n) => n.id)));

  for (const ue of Object.keys(all.collections)) {
    if (!ues[ue]) err('UE ' + ue + ' : dossier présent mais absent de meta.json');
    const col = all.collections[ue];
    const seenQ = new Map();

    for (const kind of COLLECTIONS) {
      counts[kind] = (counts[kind] || 0) + col[kind].length;
      col[kind].forEach((it, i) => {
        const where = 'UE ' + ue + ' ' + kind + '[' + i + '] ' + (it.id || '(sans id)');
        if (!isStr(it.id)) { err(where + ' : id manquant'); return; }
        const m = ID[kind].exec(it.id);
        if (!m) err(where + ' : format d\'id invalide');
        else if (Number(m[1]) !== Number(ue)) err(where + ' : l\'id ne correspond pas à l\'UE ' + ue);
        if (ids.has(it.id)) err(where + ' : id en double (déjà dans ' + ids.get(it.id) + ')');
        ids.set(it.id, 'UE ' + ue + ' ' + kind);
        if (Number(it.ue) !== Number(ue)) err(where + ' : champ ue = ' + it.ue + ' mais fichier de l\'UE ' + ue);
        if (it.d != null && !isStr(it.d)) err(where + ' : champ d invalide');
        checkItem(kind, it, where, { err, warn, noteIds, seenQ });
      });
    }
  }

  // Épreuves et liens
  Object.keys(all.epreuves || {}).forEach((ue) => {
    if (!ues[ue]) err('epreuves.json : UE ' + ue + ' inconnue');
  });
  (all.links || []).forEach((l, i) => {
    if (!isStr(l.titre) || !/^https:\/\//.test(l.url || '')) err('links.json[' + i + '] : titre ou URL https invalide');
  });
  return { errors, warnings, counts };
}

function checkItem(kind, it, where, { err, warn, noteIds, seenQ }) {
  switch (kind) {
    case 'notes':
      if (!isStr(it.q) || !isStr(it.a)) err(where + ' : q/a manquant');
      break;
    case 'cards': {
      if (it.kind != null && !KINDS.has(it.kind)) err(where + ' : kind inconnu « ' + it.kind + ' »');
      if (it.kind === 'cloze') {
        if (!isStr(it.t)) { err(where + ' : texte à trous (t) manquant'); break; }
        if (!/\{\{[\s\S]+?\}\}/.test(it.t)) err(where + ' : aucun trou {{…}}');
        if ((it.t.match(/\{\{/g) || []).length !== (it.t.match(/\}\}/g) || []).length) err(where + ' : accolades déséquilibrées');
        if (it.q != null || it.a != null) warn(where + ' : q/a inutiles pour une carte à trous (dérivés de t)');
      } else {
        if (!isStr(it.q) || !isStr(it.a)) { err(where + ' : q/a manquant'); break; }
        const k = norm(it.q);
        if (seenQ.has(k)) err(where + ' : question en double avec ' + seenQ.get(k));
        else seenQ.set(k, it.id);
        if (words(it.q) > 28) warn(where + ' : question longue (' + words(it.q) + ' mots)');
        if (words(it.a) > 32) warn(where + ' : réponse longue (' + words(it.a) + ' mots)');
      }
      if (it.n != null && !noteIds.has(it.n)) err(where + ' : fiche liée introuvable (' + it.n + ')');
      break;
    }
    case 'qcm': {
      if (!isStr(it.q) || !isStr(it.expl)) err(where + ' : q/expl manquant');
      if (!Array.isArray(it.choices) || it.choices.length < 2 || it.choices.length > 6 || !it.choices.every(isStr)) { err(where + ' : choices invalide'); break; }
      if (new Set(it.choices.map(norm)).size !== it.choices.length) err(where + ' : choix en double');
      if (!Number.isInteger(it.answer) || it.answer < 0 || it.answer >= it.choices.length) err(where + ' : answer hors limites');
      break;
    }
    case 'cases': {
      if (!isStr(it.title) || !isStr(it.enonce)) err(where + ' : title/enonce manquant');
      if (![1, 2, 3].includes(it.level)) err(where + ' : level doit valoir 1, 2 ou 3');
      if (!Array.isArray(it.questions) || !it.questions.length) { err(where + ' : questions manquantes'); break; }
      it.questions.forEach((q, j) => { if (!isStr(q.q) || !isStr(q.a)) err(where + ' : question ' + (j + 1) + ' sans q/a'); });
      (it.tables || []).forEach((t, j) => checkTable(t, where + ' table ' + (j + 1), err));
      break;
    }
    case 'synth': {
      if (!isStr(it.title)) err(where + ' : title manquant');
      if (!(it.sections && it.sections.length) && !(it.tables && it.tables.length)) err(where + ' : ni sections ni tables');
      (it.sections || []).forEach((s, j) => { if (!isStr(s.h) || !Array.isArray(s.items) || !s.items.length || !s.items.every(isStr)) err(where + ' : section ' + (j + 1) + ' invalide'); });
      (it.tables || []).forEach((t, j) => checkTable(t, where + ' table ' + (j + 1), err));
      (it.notes || []).forEach((n) => { if (!noteIds.has(n)) err(where + ' : fiche liée introuvable (' + n + ')'); });
      break;
    }
    case 'glossary':
      if (!isStr(it.term) || !isStr(it.def)) err(where + ' : term/def manquant');
      break;
  }
}

function checkTable(t, where, err) {
  if (!Array.isArray(t.header) || !t.header.length || !Array.isArray(t.rows) || !t.rows.length) { err(where + ' : tableau invalide'); return; }
  t.rows.forEach((r, i) => { if (!Array.isArray(r) || r.length !== t.header.length) err(where + ' : ligne ' + (i + 1) + ' de largeur différente de l\'en-tête'); });
}
