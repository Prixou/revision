// Génère data/manifest.json : liste des fichiers à charger / mettre en cache + empreinte de version.
//   node tools/build.js          écrit le manifeste
//   node tools/build.js --check  échoue si le manifeste n'est pas à jour
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { COLLECTIONS, DATA, GLOBAL, ROOT, ueDirs } from './lib/io.js';

function walk(dir, ext) {
  return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((e) => {
    const rel = dir + '/' + e.name;
    if (e.isDirectory()) return walk(rel, ext);
    return ext.some((x) => e.name.endsWith(x)) ? [rel] : [];
  }).sort();
}

export function buildManifest() {
  const files = [];
  GLOBAL.forEach((g) => { if (fs.existsSync(path.join(DATA, g))) files.push('data/' + g); });
  ueDirs().forEach((d) => COLLECTIONS.forEach((k) => {
    if (fs.existsSync(path.join(DATA, d, k + '.json'))) files.push('data/' + d + '/' + k + '.json');
  }));
  const shell = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png']
    .concat(walk('css', ['.css']), walk('js', ['.js']));
  const hash = crypto.createHash('sha1');
  files.concat(shell.filter((f) => f !== './')).forEach((f) => hash.update(f).update(fs.readFileSync(path.join(ROOT, f))));
  return { version: hash.digest('hex').slice(0, 10), shell, files };
}

const target = path.join(DATA, 'manifest.json');
const text = (m) => JSON.stringify(m, null, 1) + '\n';

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const m = buildManifest();
  if (process.argv.includes('--check')) {
    const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '';
    if (current !== text(m)) { console.error('data/manifest.json n\'est pas à jour : lance « node tools/build.js ».'); process.exit(1); }
    console.log('manifeste à jour (version ' + m.version + ')');
  } else {
    fs.writeFileSync(target, text(m));
    console.log('manifeste écrit : ' + m.files.length + ' fichiers de données, ' + m.shell.length + ' fichiers d\'application (version ' + m.version + ')');
  }
}
