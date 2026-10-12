// Session de flashcards : révélation, notation (boutons, clavier, balayage).
import { h, vibrate } from '../ui/dom.js';
import { chipRow, ueChips, datedNote, clozeNodes, progressBar } from '../ui/components.js';
import { hrefs } from '../ui/router.js';
import { buildQueue, nextProgress, logReview } from '../core/srs.js';
import { kindOf } from '../core/catalog.js';
import { shuffle } from '../core/random.js';
import { AGAIN_OFFSET, KINDS, KIND_BADGE, NEW_PER_DAY, SESSION_SIZE, SWIPE_MIN } from '../config.js';

// Cartes « difficiles » : vues au moins 2 fois avec moins de la moitié de réussites.
function hardCards(cards, progress) {
  return cards.filter((c) => {
    const p = progress[c.id];
    return p && p.seen >= 2 && p.ok / p.seen < 0.5;
  });
}

export function reviewView(ctx, params) {
  const { cat, state } = ctx;
  const ue = cat.hasUe(params.ue) ? params.ue : '';
  const kind = params.kind || '';
  const hard = params.mode === 'hard';

  const cards = cat.cardsFor(ue, kind, state.custom);
  let due, freshTotal = 0;
  if (hard) {
    due = shuffle(hardCards(cards, state.progress));
  } else {
    const q = buildQueue(cards, state.progress, { now: ctx.now() });
    due = shuffle(q.reviews).concat(q.fresh); // les révisions d'abord, puis les nouvelles
    freshTotal = q.freshTotal;
  }

  // Rangée de types, limitée aux types qui existent pour cette UE
  const kindOpts = KINDS.filter((k) => !k.key || cat.cardsFor(ue, k.key, state.custom).length);
  const go = (u, k) => { location.hash = hrefs.review(u, k, hard ? 'hard' : ''); };
  const head = h('div', null,
    ueChips(cat, ue, (val) => go(val, kind)),
    kindOpts.length > 2 ? chipRow(kindOpts, kind, (val) => go(ue, val)) : null);

  if (!due.length) {
    ctx.render(h('div', null, head,
      h('div', { class: 'card-empty' }, hard
        ? 'Aucune carte difficile pour le moment : continue tes révisions, elles apparaîtront ici si tu les rates plusieurs fois.'
        : freshTotal
          ? 'Objectif du jour atteint (' + NEW_PER_DAY + ' nouvelles cartes). Reviens demain, ou fais un QCM.'
          : 'Aucune carte à réviser ici pour le moment. Reviens demain, ou choisis une autre UE ou un autre type.'),
      h('p', null, h('a', { class: 'btn', href: hrefs.home() }, 'Retour à l\'accueil'))));
    return {};
  }

  const s = {
    queue: due.slice(0, SESSION_SIZE), shown: false, showNote: false,
    done: 0, total: Math.min(due.length, SESSION_SIZE), good: 0,
  };

  function reveal() { s.shown = true; draw(); }

  function answer(g) {
    if (!s.shown || !s.queue.length) return;
    const card = s.queue.shift();
    state.progress[card.id] = nextProgress(state.progress[card.id], g, ctx.now());
    logReview(state.log, ctx.now());
    ctx.store.save();
    vibrate(g === 'good' ? 10 : 25);
    if (g === 'again') {
      s.queue.splice(Math.min(AGAIN_OFFSET, s.queue.length), 0, card); // la carte ratée revient bientôt
    } else {
      s.done++;
      if (g === 'good') s.good++;
    }
    s.shown = false;
    s.showNote = false;
    draw();
  }

  // Balayage sur la carte (réponse visible) : droite = su, gauche = à revoir
  function attachSwipe(el) {
    let x0 = 0, y0 = 0, tracking = false;
    const reset = () => { el.style.transform = ''; el.classList.remove('swipe-good', 'swipe-bad'); };
    el.addEventListener('touchstart', (e) => {
      if (!s.shown || e.touches.length !== 1) return;
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; tracking = true;
    }, { passive: true });
    el.addEventListener('touchmove', (e) => {
      if (!tracking) return;
      const dx = e.touches[0].clientX - x0;
      el.style.transform = 'translateX(' + Math.max(-120, Math.min(120, dx)) + 'px) rotate(' + dx / 30 + 'deg)';
      el.classList.toggle('swipe-good', dx > SWIPE_MIN);
      el.classList.toggle('swipe-bad', dx < -SWIPE_MIN);
    }, { passive: true });
    el.addEventListener('touchend', (e) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - x0, dy = t.clientY - y0;
      if (Math.abs(dx) > SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * 1.5) answer(dx > 0 ? 'good' : 'again');
      else reset();
    });
    el.addEventListener('touchcancel', () => { tracking = false; reset(); });
  }

  function draw() {
    if (!s.queue.length) { drawEnd(); return; }
    const card = s.queue[0];
    const note = card.n ? cat.note(card.n) : null;
    const badge = KIND_BADGE[kindOf(card)];

    const body = card.cloze
      ? [h('div', { class: 'flash-q' }, clozeNodes(card.t, s.shown)),
         s.shown ? datedNote(card) : h('div', { class: 'flash-hint' }, 'Touche la carte pour compléter les trous')]
      : [h('div', { class: 'flash-q' }, card.q),
         s.shown ? h('div', { class: 'flash-a' }, card.a, datedNote(card)) : h('div', { class: 'flash-hint' }, 'Touche la carte pour voir la réponse')];

    const face = h('div', {
      class: 'flash' + (s.shown ? ' open' : ''), role: 'button', tabindex: '0',
      'aria-label': s.shown ? 'Réponse affichée' : 'Toucher pour voir la réponse',
      onclick: () => { if (!s.shown) reveal(); },
    },
      h('div', { class: 'flash-ue' }, cat.ueLabel(card.ue) + (badge ? ' · ' + badge : '')),
      body,
      s.shown && note ? h('div', { class: 'note-box' },
        h('button', { class: 'btn small', type: 'button', onclick: (e) => { e.stopPropagation(); s.showNote = !s.showNote; draw(); } },
          s.showNote ? 'Masquer la fiche de cours' : '📖 Fiche de cours'),
        s.showNote ? h('div', { class: 'note-text' }, h('strong', null, note.q), h('div', null, note.a), datedNote(note)) : null) : null);
    attachSwipe(face);

    const dock = s.shown
      ? h('div', { class: 'dock grades' },
          h('button', { class: 'btn again', onclick: () => answer('again') }, 'À revoir', h('kbd', null, '1')),
          h('button', { class: 'btn hard', onclick: () => answer('hard') }, 'Hésitant', h('kbd', null, '2')),
          h('button', { class: 'btn good', onclick: () => answer('good') }, 'Je savais', h('kbd', null, '3')))
      : h('div', { class: 'dock' },
          h('button', { class: 'btn primary big block', onclick: reveal }, 'Afficher la réponse', h('kbd', null, 'Espace')));

    ctx.render(h('div', null, head,
      h('div', { class: 'progress-line' }, progressBar(Math.round(100 * s.done / s.total)), h('span', { class: 'muted' }, s.done + '/' + s.total)),
      face,
      s.shown ? h('p', { class: 'muted center small' }, 'Glisse à droite : je savais · à gauche : à revoir') : null,
      dock), true);
  }

  function drawEnd() {
    ctx.render(h('div', { class: 'center end' },
      h('div', { class: 'big-emoji' }, '✅'),
      h('h1', null, 'Session terminée'),
      h('p', null, s.good + ' cartes sues du premier coup sur ' + s.total + '.'),
      h('div', { class: 'stack' },
        h('a', { class: 'btn primary big block', href: hrefs.review(ue, kind, hard ? 'hard' : ''), onclick: () => setTimeout(ctx.reroute, 0) }, 'Continuer'),
        h('a', { class: 'btn block', href: hrefs.home() }, 'Accueil'))));
  }

  draw();
  return {
    keydown(e) {
      if (!s.queue.length) return;
      if (!s.shown && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); reveal(); }
      else if (s.shown) {
        if (e.key === '1') answer('again');
        else if (e.key === '2') answer('hard');
        else if (e.key === '3') answer('good');
      }
    },
  };
}
