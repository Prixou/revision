// Statistiques du contenu ; --readme met à jour le tableau du README (entre les repères stats).
import fs from 'node:fs';
import path from 'node:path';
import { COLLECTIONS, ROOT, loadAll } from './lib/io.js';

const all = loadAll();
const ues = Object.keys(all.collections);
const row = (ue) => {
  const c = all.collections[ue];
  const kinds = {};
  c.cards.forEach((x) => { const k = x.kind || 'q'; kinds[k] = (kinds[k] || 0) + 1; });
  return { ue, name: all.meta.ues[ue], notes: c.notes.length, cards: c.cards.length, qcm: c.qcm.length, cases: c.cases.length, synth: c.synth.length, glossary: c.glossary.length, kinds };
};
const rows = ues.map(row);
const sum = (k) => rows.reduce((a, r) => a + r[k], 0);
const kindTotal = (k) => rows.reduce((a, r) => a + (r.kinds[k] || 0), 0);

const table = [
  '| UE | Matière | Flashcards | Fiches de cours | QCM | Cas pratiques | Synthèses | Lexique |',
  '|----|---------|-----------:|----------------:|----:|--------------:|----------:|--------:|',
  ...rows.map((r) => `| ${r.ue} | ${r.name} | ${r.cards} | ${r.notes} | ${r.qcm} | ${r.cases} | ${r.synth} | ${r.glossary} |`),
  `| | **Total** | **${sum('cards')}** | **${sum('notes')}** | **${sum('qcm')}** | **${sum('cases')}** | **${sum('synth')}** | **${sum('glossary')}** |`,
].join('\n');
const kinds = `Types de flashcards : ${kindTotal('q')} questions, ${kindTotal('cloze')} à trous, ${kindTotal('calc')} calculs, ${kindTotal('ecr')} écritures et méthodes, ${kindTotal('formule')} formules.`;
const block = `<!-- stats:start -->\n${table}\n\n${kinds}\n<!-- stats:end -->`;

if (process.argv.includes('--readme')) {
  const f = path.join(ROOT, 'README.md');
  const text = fs.readFileSync(f, 'utf8');
  if (!/<!-- stats:start -->[\s\S]*<!-- stats:end -->/.test(text)) { console.error('Repères stats absents du README.'); process.exit(1); }
  fs.writeFileSync(f, text.replace(/<!-- stats:start -->[\s\S]*<!-- stats:end -->/, block));
  console.log('README mis à jour.');
} else {
  console.log(block);
  void COLLECTIONS;
}
