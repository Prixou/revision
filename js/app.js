(function () {
  'use strict';

  var STORAGE_KEY = 'dcg-revision-v1';
  var INTERVALS = [0, 1, 3, 7, 14, 30, 60]; // jours avant la prochaine revue, par "boîte"
  var MASTERED_BOX = 4;
  var SESSION_SIZE = 20;
  var NEW_PER_DAY = 20; // nouvelles cartes introduites par jour (évite d'afficher des centaines de cartes « à réviser »)
  var PAGE = 60; // cartes affichées par page dans « Mes cartes »
  var QUIZ_SIZE = 10;
  var SWIPE_MIN = 70; // px

  var UES = window.DCG_UES;
  var SHORT = window.DCG_UE_SHORT || {};
  var app = document.getElementById('app');

  // ---------- Stockage ----------

  function emptyState() {
    return { custom: [], progress: {}, qcm: {}, log: {} };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return Object.assign(emptyState(), JSON.parse(raw));
    } catch (e) { /* stockage indisponible : on travaille en mémoire */ }
    return emptyState();
  }

  var state = load();

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  // ---------- Utilitaires ----------

  function pad(n) { return String(n).padStart(2, '0'); }
  function dayStr(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function today() { return dayStr(new Date()); }
  function inDays(n) { var d = new Date(); d.setDate(d.getDate() + n); return dayStr(d); }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function vibrate(ms) {
    try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* ignore */ }
  }

  // Création d'éléments DOM (textContent => pas d'injection HTML avec le contenu utilisateur)
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') el.className = v;
        else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
        else if (k === 'value') el.value = v;
        else el.setAttribute(k, v === true ? '' : v);
      });
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }

  function append(el, child) {
    if (child == null || child === false) return;
    if (Array.isArray(child)) child.forEach(function (c) { append(el, c); });
    else el.appendChild(child.nodeType ? child : document.createTextNode(String(child)));
  }

  function render(node, keepScroll) {
    app.textContent = '';
    app.appendChild(node);
    if (!keepScroll) window.scrollTo(0, 0);
    // Centre la pastille active dans la rangée défilante
    var on = app.querySelector('.chip.on');
    if (on && on.parentNode) on.parentNode.scrollLeft = on.offsetLeft - (on.parentNode.clientWidth - on.offsetWidth) / 2;
  }

  function ueLabel(ue) { return UES[ue] ? 'UE ' + ue + ' · ' + UES[ue] : 'UE ' + ue; }

  // Pastille « règle datée » : précise l'année/le texte à laquelle le chiffre s'applique
  function datedNote(item) {
    return item.d ? h('div', { class: 'dated' }, '📅 ' + item.d) : null;
  }

  // Rangée de pastilles défilante pour filtrer par UE (adaptée au pouce)
  function ueChips(selected, onPick) {
    var box = h('div', { class: 'chips' });
    function chip(val, label) {
      var on = String(selected) === String(val);
      return h('button', { class: 'chip' + (on ? ' on' : ''), type: 'button', 'aria-pressed': on ? 'true' : 'false', onclick: function () { if (!on) onPick(val); } }, label);
    }
    box.appendChild(chip('', 'Toutes'));
    Object.keys(UES).forEach(function (k) {
      box.appendChild(chip(k, 'UE ' + k + ' · ' + (SHORT[k] || UES[k])));
    });
    return box;
  }

  function ueSelect(id, selected) {
    var sel = h('select', { id: id });
    Object.keys(UES).forEach(function (k) {
      sel.appendChild(h('option', { value: k, selected: String(selected) === k }, ueLabel(k)));
    });
    return sel;
  }

  // ---------- Données ----------

  // Seules les UE suivies sont proposées (on ignore d'éventuelles cartes d'autres UE)
  function allCards() {
    return window.DCG_CARDS.concat(state.custom).filter(function (c) { return UES[c.ue]; });
  }

  function cardsFor(ue) {
    return allCards().filter(function (c) { return !ue || String(c.ue) === String(ue); });
  }

  function isReviewDue(card) {
    var p = state.progress[card.id];
    return !!p && p.due <= today();
  }

  function isNewCard(card) { return !state.progress[card.id]; }

  function newIntroducedToday() {
    var t = today();
    return Object.keys(state.progress).filter(function (id) { return state.progress[id].first === t; }).length;
  }

  // File du jour : révisions échues + nouvelles cartes dans la limite quotidienne
  function queueFor(ue) {
    var list = cardsFor(ue);
    var allowed = Math.max(0, NEW_PER_DAY - newIntroducedToday());
    var fresh = list.filter(isNewCard);
    return {
      reviews: list.filter(isReviewDue),
      fresh: shuffle(fresh).slice(0, allowed),
      freshTotal: fresh.length
    };
  }

  function logReview() {
    var t = today();
    state.log[t] = (state.log[t] || 0) + 1;
  }

  function streak() {
    var n = 0;
    var d = new Date();
    if (!state.log[dayStr(d)]) d.setDate(d.getDate() - 1); // la série n'est pas cassée tant que la journée n'est pas finie
    while (state.log[dayStr(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }

  // Répétition espacée (boîtes de Leitner) : grade = 'again' | 'hard' | 'good'
  function grade(card, g) {
    var p = state.progress[card.id] || { box: 0, due: today(), seen: 0, ok: 0, first: today() };
    p.seen++;
    if (g === 'again') p.box = 0;
    else if (g === 'good') { p.box = Math.min(p.box + 1, INTERVALS.length - 1); p.ok++; }
    // 'hard' : on reste dans la même boîte
    p.due = g === 'again' ? today() : inDays(Math.max(INTERVALS[p.box], 1));
    state.progress[card.id] = p;
    logReview();
    save();
  }

  // ---------- Accueil ----------

  function viewHome() {
    var cards = allCards();
    var q = queueFor('');
    var dueCount = q.reviews.length + q.fresh.length;
    var seenToday = state.log[today()] || 0;

    var tiles = h('div', { class: 'tiles' },
      tile(dueCount, 'à réviser'),
      tile(seenToday, 'faites aujourd\'hui'),
      tile(streak(), streak() > 1 ? 'jours d\'affilée' : 'jour d\'affilée'),
      tile(cards.length, 'cartes au total')
    );

    var detail = dueCount
      ? h('p', { class: 'muted small center' }, q.reviews.length + ' révision' + (q.reviews.length > 1 ? 's' : '') + ' + ' + q.fresh.length + ' nouvelle' + (q.fresh.length > 1 ? 's' : '') + ' (' + NEW_PER_DAY + ' nouvelles max. par jour)')
      : null;

    var cta = dueCount
      ? h('a', { class: 'btn primary big block', href: '#/review' }, 'Réviser maintenant · ' + Math.min(dueCount, SESSION_SIZE) + ' cartes')
      : h('p', { class: 'muted' }, q.freshTotal ? 'Objectif du jour atteint 🎉 Fais un QCM ou reviens demain pour de nouvelles cartes.' : 'Rien à réviser pour le moment 🎉 Fais un QCM ou ajoute des cartes.');

    var rows = Object.keys(UES).map(function (k) {
      var list = cardsFor(k);
      var mastered = list.filter(function (c) {
        var p = state.progress[c.id];
        return p && p.box >= MASTERED_BOX;
      }).length;
      var pct = list.length ? Math.round(100 * mastered / list.length) : 0;
      var dueN = list.filter(isReviewDue).length;
      var newN = list.filter(isNewCard).length;
      return h('div', { class: 'ue-row' },
        h('div', { class: 'ue-head' },
          h('div', { class: 'ue-name' }, h('strong', null, 'UE ' + k), ' ', UES[k]),
          h('div', { class: 'ue-pct' }, pct + ' %')),
        h('div', { class: 'bar', role: 'img', 'aria-label': pct + ' % maîtrisé' }, h('span', { style: 'width:' + pct + '%' })),
        h('div', { class: 'ue-meta' }, list.length ? (mastered + '/' + list.length + ' maîtrisées · ' + dueN + ' à revoir · ' + newN + ' nouvelles') : 'Aucune carte'),
        h('div', { class: 'ue-actions' },
          list.length ? h('a', { class: 'btn', href: '#/review?ue=' + k }, 'Fiches') : null,
          qcmFor(k).length ? h('a', { class: 'btn', href: '#/quiz?ue=' + k }, 'QCM') : null
        )
      );
    });

    var meta = window.DCG_META || {};
    var info = meta.verifiedOn
      ? h('div', { class: 'info' },
          h('strong', null, '📅 Contenu vérifié le ' + meta.verifiedOn),
          h('div', null, meta.programme),
          h('div', null, 'Les points chiffrés qui changent avec les années portent une pastille 📅 avec la date de la règle.'))
      : null;

    render(h('div', null,
      tiles, cta, detail,
      h('h2', null, 'Progression par UE'),
      h('div', { class: 'ue-list' }, rows),
      info
    ));
  }

  function tile(value, label) {
    return h('div', { class: 'tile' }, h('div', { class: 'tile-v' }, String(value)), h('div', { class: 'tile-l' }, label));
  }

  // ---------- Fiches (répétition espacée) ----------

  var session = null;

  function params() {
    var q = location.hash.split('?')[1] || '';
    var out = {};
    q.split('&').forEach(function (kv) {
      if (!kv) return;
      var p = kv.split('=');
      out[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || '');
    });
    return out;
  }

  function goUe(base) {
    return function (val) { location.hash = base + (val ? '?ue=' + val : ''); };
  }

  function viewReview() {
    var ue = params().ue || '';
    if (ue && !UES[ue]) ue = '';
    var q = queueFor(ue);
    var due = shuffle(q.reviews).concat(q.fresh); // les révisions d'abord, puis les nouvelles
    var chips = ueChips(ue, goUe('#/review'));

    if (!due.length) {
      session = null;
      render(h('div', null,
        chips,
        h('div', { class: 'card-empty' }, q.freshTotal
          ? 'Objectif du jour atteint (' + NEW_PER_DAY + ' nouvelles cartes). Reviens demain, ou fais un QCM.'
          : 'Aucune carte à réviser ici pour le moment. Reviens demain, ou choisis une autre UE.'),
        h('p', null, h('a', { class: 'btn', href: '#/' }, 'Retour à l\'accueil'))
      ));
      return;
    }

    session = { queue: due.slice(0, SESSION_SIZE), shown: false, done: 0, total: Math.min(due.length, SESSION_SIZE), good: 0, ue: ue, chips: chips };
    renderCard();
  }

  function renderCard() {
    var s = session;
    if (!s.queue.length) { renderSessionEnd(); return; }
    var card = s.queue[0];
    var pct = Math.round(100 * s.done / s.total);

    var face = h('div', { class: 'flash' + (s.shown ? ' open' : ''), role: 'button', tabindex: '0',
        'aria-label': s.shown ? 'Réponse affichée' : 'Toucher pour voir la réponse', onclick: function () { if (!session.shown) reveal(); } },
      h('div', { class: 'flash-ue' }, ueLabel(card.ue)),
      h('div', { class: 'flash-q' }, card.q),
      s.shown ? h('div', { class: 'flash-a' }, card.a, datedNote(card)) : h('div', { class: 'flash-hint' }, 'Touche la carte pour voir la réponse')
    );
    attachSwipe(face);

    var dock = s.shown
      ? h('div', { class: 'dock grades' },
          h('button', { class: 'btn again', onclick: function () { answer('again'); } }, 'À revoir', h('kbd', null, '1')),
          h('button', { class: 'btn hard', onclick: function () { answer('hard'); } }, 'Hésitant', h('kbd', null, '2')),
          h('button', { class: 'btn good', onclick: function () { answer('good'); } }, 'Je savais', h('kbd', null, '3')))
      : h('div', { class: 'dock' },
          h('button', { class: 'btn primary big block', onclick: reveal }, 'Afficher la réponse', h('kbd', null, 'Espace')));

    render(h('div', null,
      s.chips,
      h('div', { class: 'progress-line' },
        h('div', { class: 'bar' }, h('span', { style: 'width:' + pct + '%' })),
        h('span', { class: 'muted' }, s.done + '/' + s.total)),
      face,
      s.shown ? h('p', { class: 'muted center small' }, 'Glisse à droite : je savais · à gauche : à revoir') : null,
      dock
    ), true);
  }

  // Balayage sur la carte (réponse visible) : droite = su, gauche = à revoir
  function attachSwipe(el) {
    var x0 = 0, y0 = 0, tracking = false;
    el.addEventListener('touchstart', function (e) {
      if (!session || !session.shown || e.touches.length !== 1) return;
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; tracking = true;
    }, { passive: true });
    el.addEventListener('touchmove', function (e) {
      if (!tracking) return;
      var dx = e.touches[0].clientX - x0;
      el.style.transform = 'translateX(' + Math.max(-120, Math.min(120, dx)) + 'px) rotate(' + dx / 30 + 'deg)';
      el.classList.toggle('swipe-good', dx > SWIPE_MIN);
      el.classList.toggle('swipe-bad', dx < -SWIPE_MIN);
    }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var t = e.changedTouches[0];
      var dx = t.clientX - x0, dy = t.clientY - y0;
      if (Math.abs(dx) > SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * 1.5) answer(dx > 0 ? 'good' : 'again');
      else { el.style.transform = ''; el.classList.remove('swipe-good', 'swipe-bad'); }
    });
    el.addEventListener('touchcancel', function () {
      tracking = false; el.style.transform = ''; el.classList.remove('swipe-good', 'swipe-bad');
    });
  }

  function reveal() { session.shown = true; renderCard(); }

  function answer(g) {
    var s = session;
    if (!s || !s.shown || !s.queue.length) return;
    var card = s.queue.shift();
    grade(card, g);
    vibrate(g === 'good' ? 10 : 25);
    if (g === 'again') {
      var at = Math.min(3, s.queue.length); // la carte ratée revient dans quelques cartes
      s.queue.splice(at, 0, card);
    } else {
      s.done++;
      if (g === 'good') s.good++;
    }
    s.shown = false;
    renderCard();
  }

  function renderSessionEnd() {
    var s = session;
    session = null;
    render(h('div', { class: 'center end' },
      h('div', { class: 'big-emoji' }, '✅'),
      h('h1', null, 'Session terminée'),
      h('p', null, s.good + ' cartes sues du premier coup sur ' + s.total + '.'),
      h('div', { class: 'stack' },
        h('a', { class: 'btn primary big block', href: '#/review' + (s.ue ? '?ue=' + s.ue : ''), onclick: function () { setTimeout(route, 0); } }, 'Continuer'),
        h('a', { class: 'btn block', href: '#/' }, 'Accueil'))
    ));
  }

  // ---------- QCM ----------

  var quiz = null;

  function qcmFor(ue) {
    return window.DCG_QCM.filter(function (q) { return UES[q.ue] && (!ue || String(q.ue) === String(ue)); });
  }

  function viewQuiz() {
    var ue = params().ue || '';
    if (ue && !UES[ue]) ue = '';
    var pool = qcmFor(ue);
    var chips = ueChips(ue, goUe('#/quiz'));

    if (!pool.length) {
      quiz = null;
      render(h('div', null, chips, h('div', { class: 'card-empty' }, 'Pas encore de QCM pour cette UE.')));
      return;
    }

    // On mélange aussi l'ordre des choix : sinon la bonne réponse se devine à sa position
    var qs = shuffle(pool).slice(0, QUIZ_SIZE).map(function (q) {
      var order = shuffle(q.choices.map(function (_, i) { return i; }));
      return Object.assign({}, q, {
        choices: order.map(function (i) { return q.choices[i]; }),
        answer: order.indexOf(q.answer)
      });
    });
    quiz = { qs: qs, i: 0, score: 0, picked: null, chips: chips, ue: ue };
    renderQuestion();
  }

  function renderQuestion() {
    var z = quiz;
    if (z.i >= z.qs.length) { renderQuizEnd(); return; }
    var q = z.qs[z.i];
    var pct = Math.round(100 * z.i / z.qs.length);

    var opts = q.choices.map(function (c, idx) {
      var cls = 'choice';
      if (z.picked != null) {
        if (idx === q.answer) cls += ' right';
        else if (idx === z.picked) cls += ' wrong';
      }
      return h('button', { class: cls, disabled: z.picked != null, onclick: function () { pick(idx); } },
        h('span', { class: 'letter' }, String.fromCharCode(65 + idx)), h('span', null, c));
    });

    var feedback = null, dock = null;
    if (z.picked != null) {
      var ok = z.picked === q.answer;
      feedback = h('div', { class: 'feedback ' + (ok ? 'ok' : 'ko') }, h('strong', null, ok ? 'Bonne réponse ! ' : 'Raté. '), q.expl, datedNote(q));
      dock = h('div', { class: 'dock' },
        h('button', { class: 'btn primary big block', onclick: next }, z.i + 1 < z.qs.length ? 'Question suivante' : 'Voir le score'));
    }

    render(h('div', null,
      z.chips,
      h('div', { class: 'progress-line' },
        h('div', { class: 'bar' }, h('span', { style: 'width:' + pct + '%' })),
        h('span', { class: 'muted' }, (z.i + 1) + '/' + z.qs.length)),
      h('div', { class: 'flash-ue' }, ueLabel(q.ue)),
      h('div', { class: 'quiz-q' }, q.q),
      h('div', { class: 'choices' }, opts),
      feedback, dock
    ), true);
  }

  function pick(idx) {
    var q = quiz.qs[quiz.i];
    quiz.picked = idx;
    var rec = state.qcm[q.id] || { ok: 0, ko: 0 };
    if (idx === q.answer) { quiz.score++; rec.ok++; vibrate(10); } else { rec.ko++; vibrate(40); }
    state.qcm[q.id] = rec;
    logReview();
    save();
    renderQuestion();
    var fb = app.querySelector('.feedback');
    if (fb && fb.scrollIntoView) fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function next() { quiz.i++; quiz.picked = null; renderQuestion(); window.scrollTo(0, 0); }

  function renderQuizEnd() {
    var z = quiz;
    quiz = null;
    render(h('div', { class: 'center end' },
      h('div', { class: 'big-emoji' }, z.score === z.qs.length ? '🎯' : '📊'),
      h('h1', null, 'Score : ' + z.score + ' / ' + z.qs.length),
      h('p', { class: 'muted' }, z.score === z.qs.length ? 'Sans faute !' : 'Refais un QCM pour fixer les notions.'),
      h('div', { class: 'stack' },
        h('a', { class: 'btn primary big block', href: '#/quiz' + (z.ue ? '?ue=' + z.ue : ''), onclick: function () { setTimeout(route, 0); } }, 'Nouveau QCM'),
        h('a', { class: 'btn block', href: '#/' }, 'Accueil'))
    ));
  }

  // ---------- Mes cartes ----------

  function viewCards() {
    var filterUe = params().ue || '';
    if (filterUe && !UES[filterUe]) filterUe = '';
    var search = '';

    var list = h('div', { class: 'card-list' });
    var searchBox = h('input', { type: 'search', placeholder: 'Rechercher une carte…', 'aria-label': 'Rechercher une carte' });

    var shown = PAGE;

    function renderList() {
      list.textContent = '';
      var term = search.toLowerCase();
      var items = cardsFor(filterUe).filter(function (c) {
        return !term || (c.q + ' ' + c.a).toLowerCase().indexOf(term) !== -1;
      });
      list.appendChild(h('p', { class: 'muted small' }, items.length + ' carte' + (items.length > 1 ? 's' : '')));
      if (!items.length) list.appendChild(h('div', { class: 'card-empty' }, 'Aucune carte.'));
      items.slice(0, shown).forEach(function (c) {
        var custom = isCustom(c);
        var p = state.progress[c.id];
        list.appendChild(h('div', { class: 'row' },
          h('div', { class: 'row-main' },
            h('div', { class: 'flash-ue' }, ueLabel(c.ue) + (custom ? ' · perso' : '') + (p ? ' · boîte ' + p.box : ' · nouvelle')),
            h('div', null, h('strong', null, c.q)),
            h('div', { class: 'muted' }, c.a),
            datedNote(c)),
          custom ? h('button', { class: 'btn small danger', onclick: function () { removeCard(c.id); } }, 'Supprimer') : null));
      });
      if (items.length > shown) {
        list.appendChild(h('button', { class: 'btn block', onclick: function () { shown += PAGE; renderList(); } },
          'Afficher plus (' + (items.length - shown) + ' restantes)'));
      }
    }

    searchBox.addEventListener('input', function () { search = searchBox.value; shown = PAGE; renderList(); });

    // Formulaire d'ajout (replié par défaut pour garder la liste accessible)
    var fUe = ueSelect('new-ue', filterUe || 10);
    var fQ = h('textarea', { rows: 2, required: true, placeholder: 'Question (ex. Formule du BFR ?)' });
    var fA = h('textarea', { rows: 3, required: true, placeholder: 'Réponse' });
    var form = h('form', { class: 'form', onsubmit: function (e) {
      e.preventDefault();
      var q = fQ.value.trim(), a = fA.value.trim();
      if (!q || !a) return;
      state.custom.push({ id: 'c-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), ue: Number(fUe.value), q: q, a: a });
      save();
      fQ.value = ''; fA.value = '';
      renderList();
      fQ.focus();
    } }, fUe, fQ, fA, h('button', { class: 'btn primary big block', type: 'submit' }, 'Ajouter la carte'));
    var add = h('details', { class: 'add' }, h('summary', null, '➕ Ajouter ma propre carte'), form);

    // Sauvegarde / import
    var fileInput = h('input', { type: 'file', accept: 'application/json', hidden: true });
    fileInput.addEventListener('change', function () {
      var f = fileInput.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        try {
          var d = JSON.parse(r.result);
          if (!d || typeof d !== 'object' || !Array.isArray(d.custom)) throw new Error('format');
          if (!confirm('Remplacer toute ta progression et tes cartes par ce fichier ?')) return;
          state = Object.assign(emptyState(), d);
          save();
          alert('Sauvegarde importée.');
          route();
        } catch (e) { alert('Fichier invalide.'); }
      };
      r.readAsText(f);
    });

    var tools = h('details', { class: 'add' },
      h('summary', null, '💾 Sauvegarde et réinitialisation'),
      h('div', { class: 'stack' },
        h('button', { class: 'btn block', onclick: exportData }, 'Exporter ma sauvegarde'),
        h('button', { class: 'btn block', onclick: function () { fileInput.click(); } }, 'Importer une sauvegarde'),
        fileInput,
        h('button', { class: 'btn block danger', onclick: resetProgress }, 'Réinitialiser la progression')));

    render(h('div', null,
      ueChips(filterUe, goUe('#/cards')),
      searchBox, add, list, tools));
    renderList();
  }

  function isCustom(c) { return state.custom.some(function (x) { return x.id === c.id; }); }

  function removeCard(id) {
    if (!confirm('Supprimer cette carte ?')) return;
    state.custom = state.custom.filter(function (c) { return c.id !== id; });
    delete state.progress[id];
    save();
    route();
  }

  function exportData() {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    var a = h('a', { href: URL.createObjectURL(blob), download: 'revision-dcg-' + today() + '.json' });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function resetProgress() {
    if (!confirm('Effacer toute la progression (tes cartes perso sont conservées) ?')) return;
    state.progress = {}; state.qcm = {}; state.log = {};
    save();
    route();
  }

  // ---------- Routage & clavier ----------

  function route() {
    session = null; // une session abandonnée ne doit plus capter le clavier
    quiz = null;
    var name = (location.hash.replace(/^#\/?/, '').split('?')[0]) || 'home';
    var views = { home: viewHome, review: viewReview, quiz: viewQuiz, cards: viewCards };
    (views[name] || viewHome)();
    Array.prototype.forEach.call(document.querySelectorAll('#nav a'), function (a) {
      a.classList.toggle('active', a.getAttribute('data-route') === (views[name] ? name : 'home'));
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (session && session.queue.length) {
      if (!session.shown && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); reveal(); }
      else if (session.shown) {
        if (e.key === '1') answer('again');
        else if (e.key === '2') answer('hard');
        else if (e.key === '3') answer('good');
      }
    } else if (quiz && quiz.picked == null && quiz.i < quiz.qs.length) {
      var idx = e.key.toLowerCase().charCodeAt(0) - 97;
      if (e.key.length === 1 && idx >= 0 && idx < quiz.qs[quiz.i].choices.length) pick(idx);
    } else if (quiz && quiz.picked != null && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault(); next();
    }
  });

  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(function () { /* hors ligne non critique */ });
  }
})();
