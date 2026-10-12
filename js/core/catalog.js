// Catalogue du contenu : cartes, fiches, QCM, cas pratiques, synthèses, lexique.
// Le contenu vit dans data/ (JSON). Ce module le charge et fournit les requêtes de lecture.
import { maskCloze, revealCloze } from './cloze.js';

const UE_COLLECTIONS = ['notes', 'cards', 'qcm', 'cases', 'synth', 'glossary'];
const GLOBAL_FILES = { 'meta.json': 'meta', 'epreuves.json': 'epreuves', 'links.json': 'links' };

// Une carte à trous est stockée sous forme de texte source (t) ; q et a en sont dérivés.
export function normalizeCard(raw) {
  if (raw.kind !== 'cloze') return Object.assign({}, raw);
  return Object.assign({}, raw, { cloze: true, q: maskCloze(raw.t), a: revealCloze(raw.t) });
}

export function kindOf(c) { return c.cloze ? 'cloze' : (c.kind || ''); }

export function matchesKind(c, kind) {
  if (!kind) return true;
  if (kind === 'q') return !kindOf(c);
  return kindOf(c) === kind;
}

// Lit data/manifest.json puis tous les fichiers qu'il liste. `fetchJson(path)` renvoie le JSON.
// Les fichiers sont lus en parallèle mais fusionnés dans l'ordre du manifeste (ordre stable).
export async function loadRaw(fetchJson, manifestUrl) {
  const manifest = await fetchJson(manifestUrl);
  const files = await Promise.all(manifest.files.map(async (path) => ({ path, data: await fetchJson(path) })));
  const raw = { meta: null, epreuves: {}, links: [] };
  UE_COLLECTIONS.forEach(k => { raw[k] = []; });
  files.forEach(({ path, data }) => {
    const base = path.split('/').pop();
    if (GLOBAL_FILES[base]) { raw[GLOBAL_FILES[base]] = data; return; }
    const kind = base.replace(/\.json$/, '');
    if (UE_COLLECTIONS.includes(kind)) raw[kind].push(...data);
  });
  return { raw, version: manifest.version };
}

export function createCatalog(raw) {
  const meta = raw.meta || { ues: {}, short: {} };
  const ues = meta.ues || {};
  const known = (x) => !!ues[x.ue];
  const cards = (raw.cards || []).map(normalizeCard).filter(known);
  const notes = (raw.notes || []).filter(known);
  const qcm = (raw.qcm || []).filter(known);
  const cases = (raw.cases || []).filter(known);
  const synth = (raw.synth || []).filter(known);
  const glossary = (raw.glossary || []).filter(known);
  const noteIndex = new Map(notes.map(n => [n.id, n]));
  const byUe = (list, ue) => (ue ? list.filter(x => String(x.ue) === String(ue)) : list);

  return {
    meta,
    ues,
    short: meta.short || {},
    epreuves: raw.epreuves || {},
    links: raw.links || [],
    notes, cards, qcm, cases, synth, glossary,
    ueKeys: Object.keys(ues),
    ueLabel(ue) { return ues[ue] ? 'UE ' + ue + ' · ' + ues[ue] : 'UE ' + ue; },
    hasUe(ue) { return !!ues[ue]; },
    note(id) { return noteIndex.get(id) || null; },
    notesFor: (ue) => byUe(notes, ue),
    qcmFor: (ue) => byUe(qcm, ue),
    casesFor: (ue) => byUe(cases, ue),
    synthFor: (ue) => byUe(synth, ue),
    glossaryFor: (ue) => byUe(glossary, ue),
    // Les cartes personnelles (stockées dans la progression) s'ajoutent aux cartes du catalogue.
    cardsFor(ue, kind, custom = []) {
      return byUe(cards.concat(custom.filter(known)), ue).filter(c => matchesKind(c, kind));
    },
  };
}
