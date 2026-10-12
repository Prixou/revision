// Point d'entrée : charge le contenu, branche le routage et le clavier, enregistre le service worker.
import { MANIFEST_URL } from './config.js';
import { createCatalog, loadRaw } from './core/catalog.js';
import { createStore } from './core/store.js';
import { h, createRenderer } from './ui/dom.js';
import { TAB_OF, legacyRedirect, parseHash } from './ui/router.js';
import { homeView } from './views/home.js';
import { reviewView } from './views/review.js';
import { quizView } from './views/quiz.js';
import { cardsView, formulasView, glossaryView, notesView } from './views/lists.js';
import { resourcesView, searchView } from './views/resources.js';
import { synthView } from './views/synth.js';
import { casesView } from './views/cases.js';
import { examsView } from './views/exams.js';
import { linksView } from './views/links.js';

const VIEWS = {
  home: homeView, review: reviewView, quiz: quizView,
  res: resourcesView, search: searchView, cards: cardsView, notes: notesView,
  formulas: formulasView, glossary: glossaryView, synth: synthView, cases: casesView,
  exams: examsView, links: linksView,
};

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(path + ' : ' + res.status);
  return res.json();
}

async function start() {
  const app = document.getElementById('app');
  const render = createRenderer(app);
  app.textContent = 'Chargement du contenu…';

  let catalog;
  try {
    catalog = createCatalog((await loadRaw(fetchJson, MANIFEST_URL)).raw);
  } catch (e) {
    app.textContent = '';
    app.appendChild(h('div', { class: 'card-empty' }, 'Impossible de charger le contenu (' + e.message + '). Vérifie ta connexion puis recharge la page.'));
    return;
  }

  let storage = null;
  try { storage = window.localStorage; } catch (e) { /* stockage bloqué : mode mémoire */ }
  const store = createStore(storage);

  const ctx = {
    cat: catalog,
    store,
    get state() { return store.state; },
    render,
    now: () => new Date(),
    reroute: () => route(),
  };

  let current = {};
  function route() {
    if (current.dispose) current.dispose();
    current = {};
    const { name, params } = parseHash(location.hash);
    const redirect = legacyRedirect(name, params);
    if (redirect) { location.replace(redirect); return; }
    const view = VIEWS[name] || homeView;
    current = view(ctx, params) || {};
    const tab = TAB_OF[VIEWS[name] ? name : 'home'];
    document.querySelectorAll('#nav a').forEach((a) => a.classList.toggle('active', a.getAttribute('data-route') === tab));
  }

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || !current.keydown) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    current.keydown(e);
  });

  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* hors ligne non critique */ });
  }
}

start();
