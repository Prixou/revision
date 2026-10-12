// Routage par hash (#/route?cle=valeur) et constructeurs d'URL.

export function parseHash(hash) {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?');
  const params = {};
  query.split('&').forEach((kv) => {
    if (!kv) return;
    const p = kv.split('=');
    params[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
  });
  return { name: path || 'home', params };
}

export function hashOf(base, obj) {
  const q = [];
  Object.keys(obj).forEach((k) => { if (obj[k]) q.push(k + '=' + encodeURIComponent(obj[k])); });
  return base + (q.length ? '?' + q.join('&') : '');
}

export const hrefs = {
  review: (ue, kind, mode) => hashOf('#/review', { ue, kind, mode }),
  quiz: (mode, ue) => hashOf('#/quiz', { mode: mode === 'quick' ? '' : mode, ue }),
  cards: (ue, q) => hashOf('#/cards', { ue, q }),
  notes: (ue, q) => hashOf('#/notes', { ue, q }),
  formulas: (ue, q) => hashOf('#/formulas', { ue, q }),
  glossary: (ue, q) => hashOf('#/glossary', { ue, q }),
  synth: (ue, id) => hashOf('#/synth', { ue, id }),
  cases: (ue, id) => hashOf('#/cases', { ue, id }),
  exams: () => '#/exams',
  links: () => '#/links',
  search: (q) => hashOf('#/search', { q }),
  resources: (ue) => hashOf('#/res', { ue }),
  home: () => '#/',
};

// Redirige les anciennes adresses (#/cards?mode=notes...) vers les nouvelles pages.
export function legacyRedirect(name, params) {
  if (name === 'cards' && params.mode === 'notes') return hrefs.notes(params.ue);
  if (name === 'cards' && params.mode === 'formules') return hrefs.formulas(params.ue);
  return null;
}

// Onglet de la barre du bas qui correspond à une route.
export const TAB_OF = {
  home: 'home', review: 'review', quiz: 'quiz',
  res: 'res', cards: 'res', notes: 'res', formulas: 'res', glossary: 'res',
  synth: 'res', cases: 'res', exams: 'res', links: 'res', search: 'res',
};
