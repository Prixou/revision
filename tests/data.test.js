import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { loadAll, ROOT } from '../tools/lib/io.js';
import { validate } from '../tools/lib/validate.js';
import { buildManifest } from '../tools/build.js';
import { createCatalog, loadRaw, normalizeCard } from '../js/core/catalog.js';

test('le contenu respecte les schémas (ids, liens, QCM, tableaux)', () => {
  const { errors, counts } = validate(loadAll());
  assert.deepEqual(errors, []);
  assert.ok(counts.cards > 1800 && counts.notes > 500 && counts.qcm > 200);
});

test('le manifeste est à jour (lance « node tools/build.js » sinon)', () => {
  const current = fs.readFileSync(path.join(ROOT, 'data', 'manifest.json'), 'utf8');
  assert.equal(current, JSON.stringify(buildManifest(), null, 1) + '\n');
});

test('le catalogue se charge comme dans le navigateur', async () => {
  const fetchJson = async (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
  const { raw } = await loadRaw(fetchJson, 'data/manifest.json');
  const cat = createCatalog(raw);
  assert.deepEqual(cat.ueKeys, ['2', '4', '6', '7', '10', '11']);
  assert.ok(cat.cardsFor('11', 'calc').length > 20);
  assert.ok(cat.cardsFor('', 'cloze').every((c) => c.cloze && c.q.includes('[…]') && !c.a.includes('{{')));
  assert.ok(cat.note('ue11-01'));
  assert.equal(cat.cardsFor('99', '').length, 0);
});

test('normalizeCard dérive q et a des cartes à trous', () => {
  const c = normalizeCard({ id: 'c2-001', ue: 2, kind: 'cloze', t: 'La société est un {{contrat}}.' });
  assert.equal(c.q, 'La société est un […].');
  assert.equal(c.a, 'La société est un contrat.');
});

test('les ids de flashcards historiques sont conservés (la progression y est rattachée)', () => {
  // Quelques repères : si l'un d'eux change de contenu, la progression des utilisateurs serait faussée.
  const all = loadAll();
  const byId = Object.fromEntries(Object.values(all.collections).flatMap((c) => c.cards).map((c) => [c.id, c]));
  assert.ok(byId['f2-001'] && byId['f11-001'] && byId['c11-001'] && byId['f10-001']);
  assert.ok(Object.keys(byId).length >= 1878);
});
