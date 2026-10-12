// Création d'éléments DOM. On passe par textContent : aucun contenu n'est interprété comme du HTML.

export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    Object.keys(attrs).forEach((k) => {
      const v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (k === 'value') el.value = v;
      else el.setAttribute(k, v === true ? '' : v);
    });
  }
  children.forEach((c) => append(el, c));
  return el;
}

export function append(el, child) {
  if (child == null || child === false) return;
  if (Array.isArray(child)) child.forEach((c) => append(el, c));
  else el.appendChild(child.nodeType ? child : document.createTextNode(String(child)));
}

// Remplace le contenu de la zone principale ; recentre la pastille active des rangées défilantes.
export function createRenderer(app) {
  return function render(node, keepScroll) {
    app.textContent = '';
    app.appendChild(node);
    if (!keepScroll) window.scrollTo(0, 0);
    app.querySelectorAll('.chips').forEach((row) => {
      const on = row.querySelector('.chip.on');
      if (on) row.scrollLeft = on.offsetLeft - (row.clientWidth - on.offsetWidth) / 2;
    });
  };
}

export function vibrate(ms) {
  try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* ignore */ }
}
