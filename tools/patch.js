// Applique des corrections à des éléments existants, repérés par leur id.
//   node tools/patch.js corrections.json [--dry]
// Format : [{ "id": "f4-012", "set": { "a": "Nouvelle réponse" } }, { "id": "q-ue4-030", "delete": true }]
// (forme courte acceptée : { "id": "...", "field": "a", "value": "..." })
import { loadAll, findById, saveCollection, readJson } from './lib/io.js';
import { validate } from './lib/validate.js';

const file = process.argv[2];
const dry = process.argv.includes('--dry');
if (!file) { console.error('usage : node tools/patch.js corrections.json [--dry]'); process.exit(2); }

const ops = readJson(file);
const all = loadAll();
const touched = new Set();
let applied = 0, missing = 0;

for (const op of ops) {
  const hit = findById(all, op.id);
  if (!hit) { console.error('introuvable : ' + op.id); missing++; continue; }
  if (op.delete) {
    hit.list.splice(hit.index, 1);
  } else {
    const set = op.set || { [op.field]: op.value };
    for (const [k, v] of Object.entries(set)) {
      if (k === 'id' || k === 'ue') { console.error('champ protégé (' + k + ') ignoré pour ' + op.id); continue; }
      if (v === null) delete hit.item[k]; else hit.item[k] = v;
    }
  }
  touched.add(hit.ue + '/' + hit.kind);
  applied++;
}

const { errors } = validate(all);
if (errors.length) { errors.forEach((e) => console.error('ERREUR : ' + e)); console.error('Aucune écriture : corrige les erreurs.'); process.exit(1); }
if (!dry) touched.forEach((t) => { const [ue, kind] = t.split('/'); saveCollection(all, Number(ue), kind); });
console.log((dry ? '[simulation] ' : '') + applied + ' correction(s) appliquée(s), ' + missing + ' introuvable(s) — fichiers : ' + [...touched].join(', '));
if (!dry) console.log('Pense à lancer « node tools/build.js ».');
