// Recherche plein texte simple, insensible à la casse et aux accents.

export function normalize(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Tous les mots de la requête doivent apparaître dans le texte.
export function matches(text, query) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const hay = normalize(text);
  return words.every(w => hay.indexOf(w) !== -1);
}
