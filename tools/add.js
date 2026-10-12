// Ajoute de nouveaux éléments à une collection ; les ids manquants sont attribués automatiquement.
//   node tools/add.js <ue> <notes|cards|qcm|cases|synth|glossary> nouveaux.json [--dry]
// Une carte à trous s'écrit { "kind": "cloze", "t": "Texte avec {{trou}}", "n": "ue2-01" }.
import { COLLECTIONS, loadAll, readJson, saveCollection } from './lib/io.js';
import { validate } from './lib/validate.js';

const [ue, kind, file] = process.argv.slice(2);
const dry = process.argv.includes('--dry');
if (!ue || !COLLECTIONS.includes(kind) || !file) {
  console.error('usage : node tools/add.js <ue> <' + COLLECTIONS.join('|') + '> nouveaux.json [--dry]');
  process.exit(2);
}

const PREFIX = { notes: 'ue' + ue + '-', cards: 'f' + ue + '-', qcm: 'q-ue' + ue + '-', cases: 'cp' + ue + '-', synth: 'sy' + ue + '-', glossary: 'g' + ue + '-' };
const all = loadAll();
if (!all.collections[ue]) { console.error('UE inconnue : ' + ue); process.exit(2); }
const list = all.collections[ue][kind];
const items = readJson(file);
const lastNum = (prefix) => Math.max(0, ...list.filter((x) => x.id.startsWith(prefix)).map((x) => Number(x.id.slice(prefix.length)) || 0));
const counters = {};
const skipDup = process.argv.includes('--skip-duplicates');
const norm = (x) => String(x || '').toLowerCase().replace(/\s+/g, ' ').trim();
const seen = new Set(list.map((x) => norm(x.q || x.t || x.term || x.title)));
let skipped = 0, added = 0;

for (const raw of items) {
  const it = Object.assign({}, raw, { ue: Number(ue) });
  if (kind === 'cards' && it.kind === 'q') delete it.kind;   // simple question : pas de champ kind
  const key = norm(it.q || it.t || it.term || it.title);
  if (skipDup && key && seen.has(key)) { skipped++; continue; }
  seen.add(key);
  if (kind === 'cards' && it.kind === 'cloze') { delete it.q; delete it.a; }
  if (!it.id) {
    const prefix = kind === 'cards' && it.kind === 'cloze' ? 'c' + ue + '-' : PREFIX[kind];
    counters[prefix] = (counters[prefix] || lastNum(prefix)) + 1;
    it.id = prefix + String(counters[prefix]).padStart(kind === 'notes' ? 2 : 3, '0');
  }
  // Ordre canonique des champs : id, ue en tête
  const { id, ue: u, ...rest } = it;
  list.push({ id, ue: u, ...rest });
  added++;
}

const { errors } = validate(all);
if (errors.length) { errors.slice(0, 30).forEach((e) => console.error('ERREUR : ' + e)); console.error('Aucune écriture (' + errors.length + ' erreur(s)).'); process.exit(1); }
if (!dry) saveCollection(all, Number(ue), kind);
console.log((dry ? '[simulation] ' : '') + added + ' élément(s) ajouté(s)' + (skipped ? ' (' + skipped + ' doublon(s) ignoré(s))' : '') + ' à UE ' + ue + ' / ' + kind + '. Pense à lancer « node tools/build.js ».');
