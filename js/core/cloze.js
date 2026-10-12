// Cartes à trous : le texte source marque les réponses avec {{...}}.

const re = () => /\{\{([\s\S]*?)\}\}/g;

export function maskCloze(text) { return text.replace(re(), '[…]'); }

export function revealCloze(text) { return text.replace(re(), '$1'); }

// Découpe en morceaux : { text } pour le texte libre, { blank } pour un trou.
export function clozeParts(text) {
  const out = [];
  let last = 0, m;
  const r = re();
  while ((m = r.exec(text)) !== null) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) });
    out.push({ blank: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last) });
  return out;
}

export function countBlanks(text) { return (text.match(re()) || []).length; }
