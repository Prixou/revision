// Lecture et écriture des fichiers de données (data/), au format canonique : un élément par ligne.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DATA = path.join(ROOT, 'data');

// Collections par UE, dans l'ordre de chargement du manifeste.
export const COLLECTIONS = ['notes', 'cards', 'qcm', 'cases', 'synth', 'glossary'];
export const GLOBAL = ['meta.json', 'epreuves.json', 'links.json'];

export function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

// Tableau JSON : un élément par ligne (diffs lisibles, correction ligne par ligne).
export function formatCollection(items) {
  return items.length ? '[\n' + items.map((x) => '  ' + JSON.stringify(x)).join(',\n') + '\n]\n' : '[]\n';
}

export function writeCollection(file, items) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, formatCollection(items));
}

export function ueDirs() {
  return fs.readdirSync(DATA).filter((d) => /^ue\d+$/.test(d)).sort((a, b) => Number(a.slice(2)) - Number(b.slice(2)));
}

export function collectionFile(ue, kind) { return path.join(DATA, 'ue' + ue, kind + '.json'); }

// Charge toutes les données : { meta, epreuves, links, collections: { ue: { kind: [...] } } }
export function loadAll() {
  const out = { meta: null, epreuves: {}, links: [], collections: {} };
  const metaFile = path.join(DATA, 'meta.json');
  if (fs.existsSync(metaFile)) out.meta = readJson(metaFile);
  const ep = path.join(DATA, 'epreuves.json');
  if (fs.existsSync(ep)) out.epreuves = readJson(ep);
  const ln = path.join(DATA, 'links.json');
  if (fs.existsSync(ln)) out.links = readJson(ln);
  ueDirs().forEach((d) => {
    const ue = Number(d.slice(2));
    out.collections[ue] = {};
    COLLECTIONS.forEach((k) => {
      const f = path.join(DATA, d, k + '.json');
      out.collections[ue][k] = fs.existsSync(f) ? readJson(f) : [];
    });
  });
  return out;
}

// Cherche un élément par id dans toutes les collections.
export function findById(all, id) {
  for (const ue of Object.keys(all.collections)) {
    for (const kind of COLLECTIONS) {
      const list = all.collections[ue][kind];
      const i = list.findIndex((x) => x.id === id);
      if (i !== -1) return { ue: Number(ue), kind, list, index: i, item: list[i] };
    }
  }
  return null;
}

export function saveCollection(all, ue, kind) {
  writeCollection(collectionFile(ue, kind), all.collections[ue][kind]);
}
