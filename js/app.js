(function () {
  'use strict';

  var STORAGE_KEY = 'dcg-revision-v1';
  var INTERVALS = [0, 1, 3, 7, 14, 30, 60]; // jours avant la prochaine revue, par "boîte"
  var MASTERED_BOX = 4;
  var SESSION_SIZE = 20;
  var QUIZ_SIZE = 10;

  var UES = window.DCG_UES;
  var app = document.getElementById('app');

  // ---------- Stockage ----------

  function emptyState() {
    return { custom: [], progress: {}, qcm: {}, log: {} };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        return Object.assign(emptyState(), s);
      }
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

  function render(node) {
    app.textContent = '';
    app.appendChild(node);
    window.scrollTo(0, 0);
  }

  function ueLabel(ue) { return 'UE ' + ue + ' · ' + UES[ue]; }

  function ueSelect(id, withAll, selected) {
    var sel = h('select', { id: id });
    if (withAll) sel.appendChild(h('option', { value: '' }, 'Toutes les UE'));
    Object.keys(UES).forEach(function (k) {
      sel.appendChild(h('option', { value: k, selected: String(selected) === k }, ueLabel(k)));
    });
    return sel;
  }

  // ---------- Données ----------

  function allCards() { return window.DCG_CARDS.concat(state.custom); }

  function cardsFor(ue) {
    return allCards().filter(function (c) { return !ue || String(c.ue) === String(ue); });
  }

  function isDue(card) {
    var p = state.progress[card.id];
    return !p || p.due <= today();
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
    var p = state.progress[card.id] || { box: 0, due: today(), seen: 0, ok: 0 };
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
    var due = cards.filter(isDue);
    var seenToday = state.log[today()] || 0;

    var tiles = h('div', { class: 'tiles' },
      tile(due.length, 'à réviser aujourd\'hui'),
      tile(seenToday, 'révisées aujourd\'hui'),
      tile(streak(), streak() > 1 ? 'jours d\'affilée' : 'jour d\'affilée'),
      tile(cards.length, 'cartes au total')
    );

    var cta = due.length
      ? h('a', { class: 'btn primary big', href: '#/review' }, 'Commencer la révision (' + Math.min(due.length, SESSION_SIZE) + ' cartes)')
      : h('p', { class: 'muted' }, 'Rien à réviser pour le moment 🎉 Tu peux faire un QCM ou ajouter des cartes.');

    var rows = Object.keys(UES).map(function (k) {
      var list = cardsFor(k);
      var mastered = list.filter(function (c) {
        var p = state.progress[c.id];
        return p && p.box >= MASTERED_BOX;
      }).length;
      var pct = list.length ? Math.round(100 * mastered / list.length) : 0;
      var dueN = list.filter(isDue).length;
      return h('div', { class: 'ue-row' },
        h('div', { class: 'ue-name' }, h('strong', null, 'UE ' + k), ' ', UES[k]),
        h('div', { class: 'bar', role: 'img', 'aria-label': pct + ' % maîtrisé' }, h('span', { style: 'width:' + pct + '%' })),
        h('div', { class: 'ue-meta' }, list.length ? (mastered + '/' + list.length + ' maîtrisées · ' + dueN + ' à revoir') : 'Aucune carte'),
        h('div', { class: 'ue-actions' },
          list.length ? h('a', { class: 'btn small', href: '#/review?ue=' + k }, 'Fiches') : null,
          qcmFor(k).length ? h('a', { class: 'btn small', href: '#/quiz?ue=' + k }, 'QCM') : null
        )
      );
    });

    render(h('div', null,
      h('h1', null, 'Bonjour 👋'),
      tiles, cta,
      h('h2', null, 'Progression par UE'),
      h('div', { class: 'ue-list' }, rows)
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

  function viewReview() {
    var ue = params().ue || '';
    var due = shuffle(cardsFor(ue).filter(isDue));

    var picker = ueSelect('ue-pick', true, ue);
    picker.addEventListener('change', function () {
      location.hash = '#/review' + (picker.value ? '?ue=' + picker.value : '');
    });

    if (!due.length) {
      session = null;
      render(h('div', null,
        h('h1', null, 'Fiches'),
        h('div', { class: 'toolbar' }, picker),
        h('div', { class: 'card-empty' }, 'Aucune carte à réviser ici pour le moment. Reviens demain, ou choisis une autre UE.'),
        h('p', null, h('a', { class: 'btn', href: '#/' }, 'Retour à l\'accueil'))
      ));
      return;
    }

    session = { queue: due.slice(0, SESSION_SIZE), shown: false, done: 0, total: Math.min(due.length, SESSION_SIZE), good: 0, ue: ue, picker: picker };
    renderCard();
  }

  function renderCard() {
    var s = session;
    if (!s.queue.length) { renderSessionEnd(); return; }
    var card = s.queue[0];
    var pct = Math.round(100 * s.done / s.total);

    var face = h('div', { class: 'flash' },
      h('div', { class: 'flash-ue' }, ueLabel(card.ue)),
      h('div', { class: 'flash-q' }, card.q),
      s.shown ? h('div', { class: 'flash-a' }, card.a) : null
    );

    var controls = s.shown
      ? h('div', { class: 'grades' },
          h('button', { class: 'btn again', onclick: function () { answer('again'); } }, 'À revoir ', h('kbd', null, '1')),
          h('button', { class: 'btn hard', onclick: function () { answer('hard'); } }, 'Hésitant ', h('kbd', null, '2')),
          h('button', { class: 'btn good', onclick: function () { answer('good'); } }, 'Je savais ', h('kbd', null, '3')))
      : h('button', { class: 'btn primary big', id: 'reveal', onclick: reveal }, 'Afficher la réponse ', h('kbd', null, 'Espace'));

    render(h('div', null,
      h('h1', null, 'Fiches'),
      h('div', { class: 'toolbar' }, s.picker),
      h('div', { class: 'bar' }, h('span', { style: 'width:' + pct + '%' })),
      h('p', { class: 'muted' }, s.done + ' / ' + s.total + ' · ' + s.queue.length + ' restante(s)'),
      face, controls
    ));
  }

  function reveal() { session.shown = true; renderCard(); }

  function answer(g) {
    var s = session;
    var card = s.queue.shift();
    grade(card, g);
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
    render(h('div', { class: 'center' },
      h('h1', null, 'Session terminée ✅'),
      h('p', null, s.good + ' cartes sues du premier coup sur ' + s.total + '.'),
      h('p', null,
        h('a', { class: 'btn primary', href: '#/review' + (s.ue ? '?ue=' + s.ue : ''), onclick: function () { setTimeout(route, 0); } }, 'Continuer'), ' ',
        h('a', { class: 'btn', href: '#/' }, 'Accueil'))
    ));
  }

  // ---------- QCM ----------

  var quiz = null;

  function qcmFor(ue) {
    return window.DCG_QCM.filter(function (q) { return !ue || String(q.ue) === String(ue); });
  }

  function viewQuiz() {
    var ue = params().ue || '';
    var pool = qcmFor(ue);

    var picker = ueSelect('quiz-ue', true, ue);
    picker.addEventListener('change', function () {
      location.hash = '#/quiz' + (picker.value ? '?ue=' + picker.value : '');
    });

    if (!pool.length) {
      quiz = null;
      render(h('div', null,
        h('h1', null, 'QCM'),
        h('div', { class: 'toolbar' }, picker),
        h('div', { class: 'card-empty' }, 'Pas encore de QCM pour cette UE.')
      ));
      return;
    }

    quiz = { qs: shuffle(pool).slice(0, QUIZ_SIZE), i: 0, score: 0, picked: null, picker: picker, ue: ue };
    renderQuestion();
  }

  function renderQuestion() {
    var z = quiz;
    if (z.i >= z.qs.length) { renderQuizEnd(); return; }
    var q = z.qs[z.i];

    var opts = q.choices.map(function (c, idx) {
      var cls = 'choice';
      if (z.picked != null) {
        if (idx === q.answer) cls += ' right';
        else if (idx === z.picked) cls += ' wrong';
      }
      return h('button', { class: cls, disabled: z.picked != null, onclick: function () { pick(idx); } },
        h('span', { class: 'letter' }, String.fromCharCode(65 + idx)), c);
    });

    var feedback = null;
    if (z.picked != null) {
      var ok = z.picked === q.answer;
      feedback = h('div', { class: 'feedback ' + (ok ? 'ok' : 'ko') },
        h('strong', null, ok ? 'Bonne réponse ! ' : 'Raté. '), q.expl,
        h('div', null, h('button', { class: 'btn primary', onclick: next }, z.i + 1 < z.qs.length ? 'Question suivante' : 'Voir le score')));
    }

    render(h('div', null,
      h('h1', null, 'QCM'),
      h('div', { class: 'toolbar' }, z.picker),
      h('p', { class: 'muted' }, 'Question ' + (z.i + 1) + ' / ' + z.qs.length + ' · ' + ueLabel(q.ue)),
      h('div', { class: 'flash-q quiz-q' }, q.q),
      h('div', { class: 'choices' }, opts),
      feedback
    ));
  }

  function pick(idx) {
    var q = quiz.qs[quiz.i];
    quiz.picked = idx;
    var rec = state.qcm[q.id] || { ok: 0, ko: 0 };
    if (idx === q.answer) { quiz.score++; rec.ok++; } else { rec.ko++; }
    state.qcm[q.id] = rec;
    logReview();
    save();
    renderQuestion();
  }

  function next() { quiz.i++; quiz.picked = null; renderQuestion(); }

  function renderQuizEnd() {
    var z = quiz;
    quiz = null;
    render(h('div', { class: 'center' },
      h('h1', null, 'Score : ' + z.score + ' / ' + z.qs.length),
      h('p', { class: 'muted' }, z.score === z.qs.length ? 'Sans faute 🎯' : 'Refais un QCM pour fixer les notions.'),
      h('p', null,
        h('a', { class: 'btn primary', href: '#/quiz' + (z.ue ? '?ue=' + z.ue : ''), onclick: function () { setTimeout(route, 0); } }, 'Nouveau QCM'), ' ',
        h('a', { class: 'btn', href: '#/' }, 'Accueil'))
    ));
  }

  // ---------- Mes cartes ----------

  function viewCards() {
    var filterUe = params().ue || '';
    var search = '';

    var list = h('div', { class: 'card-list' });
    var filterSel = ueSelect('filter-ue', true, filterUe);
    var searchBox = h('input', { type: 'search', placeholder: 'Rechercher…', 'aria-label': 'Rechercher une carte' });

    function renderList() {
      list.textContent = '';
      var term = search.toLowerCase();
      var items = cardsFor(filterSel.value).filter(function (c) {
        return !term || (c.q + ' ' + c.a).toLowerCase().indexOf(term) !== -1;
      });
      if (!items.length) list.appendChild(h('div', { class: 'card-empty' }, 'Aucune carte.'));
      items.forEach(function (c) {
        var custom = isCustom(c);
        var p = state.progress[c.id];
        list.appendChild(h('div', { class: 'row' },
          h('div', { class: 'row-main' },
            h('div', { class: 'flash-ue' }, ueLabel(c.ue) + (custom ? ' · perso' : '') + (p ? ' · boîte ' + p.box : ' · nouvelle')),
            h('div', null, h('strong', null, c.q)),
            h('div', { class: 'muted' }, c.a)),
          custom ? h('button', { class: 'btn small danger', onclick: function () { removeCard(c.id); } }, 'Supprimer') : null));
      });
    }

    filterSel.addEventListener('change', renderList);
    searchBox.addEventListener('input', function () { search = searchBox.value; renderList(); });

    // Formulaire d'ajout
    var fUe = ueSelect('new-ue', false, filterUe || 9);
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
    } },
      h('h2', null, 'Ajouter une carte'),
      fUe, fQ, fA,
      h('button', { class: 'btn primary', type: 'submit' }, 'Ajouter'));

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

    var tools = h('div', { class: 'toolbar' },
      h('button', { class: 'btn', onclick: exportData }, 'Exporter ma sauvegarde'),
      h('button', { class: 'btn', onclick: function () { fileInput.click(); } }, 'Importer'),
      fileInput,
      h('button', { class: 'btn danger', onclick: resetProgress }, 'Réinitialiser la progression'));

    render(h('div', null,
      h('h1', null, 'Mes cartes'),
      h('div', { class: 'toolbar' }, filterSel, searchBox),
      list, form, h('h2', null, 'Sauvegarde'), tools));
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
