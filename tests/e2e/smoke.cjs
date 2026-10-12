// Test de bout en bout (facultatif, hors CI) : parcourt l'application dans un Chromium mobile.
//   npm i -g playwright   puis   python3 -m http.server 8000 &   puis   NODE_PATH=$(npm root -g) node tests/e2e/smoke.cjs
// Variables : BASE (défaut http://localhost:8000/), CHROMIUM (chemin d'un exécutable Chromium, facultatif).
const { chromium } = require('playwright');

(async () => {
  const base = process.env.BASE || 'http://localhost:8000/';
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console ' + m.text()); });
  page.on('requestfailed', (r) => errors.push('requête échouée ' + r.url()));

  const text = async () => (await page.innerText('#app')).replace(/\n+/g, ' | ');
  const expect = (cond, msg) => { if (!cond) errors.push('ÉCHEC : ' + msg); };

  await page.goto(base);
  await page.waitForSelector('.tiles');

  for (const hash of ['#/res', '#/notes', '#/formulas', '#/glossary', '#/cards', '#/synth', '#/cases', '#/exams', '#/links', '#/search?q=tva', '#/quiz', '#/review?mode=hard']) {
    await page.goto(base + hash);
    await page.waitForTimeout(300);
    expect((await text()).length > 20, hash + ' vide');
  }

  // Flashcard : révéler, noter (bouton puis clavier)
  const progress = () => page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('dcg-revision-v1')).progress).length);
  await page.goto(base + '#/review?ue=11&kind=cloze');
  await page.waitForSelector('.flash');
  await page.click('.flash');
  await page.waitForSelector('.dock.grades');
  await page.click('.btn.good');
  expect((await progress()) === 1, 'la progression doit être enregistrée');
  await page.keyboard.press(' ');
  await page.keyboard.press('3');
  expect((await progress()) === 2, 'le clavier doit noter la carte');

  // QCM rapide puis examen blanc
  await page.goto(base + '#/quiz?ue=4');
  await page.waitForSelector('.choice');
  await page.click('.choice >> nth=0');
  await page.waitForSelector('.feedback');
  await page.goto(base + '#/quiz?mode=exam');
  await page.click('text=Commencer');
  await page.waitForSelector('.timer');
  for (let i = 0; i < 20; i++) { await page.click('.choice >> nth=1'); await page.click('.dock .btn'); }
  await page.waitForSelector('text=Détail par UE');

  console.log(errors.length ? errors.join('\n') : 'Parcours OK, aucune erreur.');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
