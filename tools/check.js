// Vérifie le contenu (schémas, ids, liens, QCM) et que le manifeste est à jour.
//   node tools/check.js            contrôle complet
import { execFileSync } from 'node:child_process';
import { loadAll } from './lib/io.js';
import { validate } from './lib/validate.js';

const { errors, warnings, counts } = validate(loadAll());
console.log('contenu :', JSON.stringify(counts));
if (warnings.length && process.argv.includes('--warnings')) warnings.forEach((w) => console.warn('  avertissement : ' + w));
else if (warnings.length) console.log(warnings.length + ' avertissement(s) (voir --warnings)');
if (errors.length) { errors.forEach((e) => console.error('  ERREUR : ' + e)); console.error(errors.length + ' erreur(s)'); process.exit(1); }

try {
  execFileSync(process.execPath, [new URL('./build.js', import.meta.url).pathname, '--check'], { stdio: 'inherit' });
} catch (e) { process.exit(1); }
console.log('OK');
