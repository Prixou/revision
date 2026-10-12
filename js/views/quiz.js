// QCM : rapide, examen blanc chronométré, mes erreurs.
import { h, vibrate } from '../ui/dom.js';
import { ueChips, seg, datedNote, progressBar } from '../ui/components.js';
import { hrefs } from '../ui/router.js';
import { isWeak, recordAnswer, scoreExam, withShuffledChoices } from '../core/quiz.js';
import { logReview } from '../core/srs.js';
import { pad } from '../core/dates.js';
import { shuffle } from '../core/random.js';
import { EXAM_MINUTES, EXAM_SIZE, QUIZ_SIZE } from '../config.js';

const MODES = ['quick', 'exam', 'errors'];

export function quizView(ctx, params) {
  const { cat, state } = ctx;
  const ue = cat.hasUe(params.ue) ? params.ue : '';
  const mode = MODES.includes(params.mode) ? params.mode : 'quick';
  const exam = mode === 'exam';

  const head = h('div', null,
    seg([
      { label: 'QCM rapide', on: mode === 'quick', href: hrefs.quiz('quick', ue) },
      { label: 'Examen blanc', on: exam, href: hrefs.quiz('exam', ue) },
      { label: 'Mes erreurs', on: mode === 'errors', href: hrefs.quiz('errors', ue) }]),
    ueChips(cat, ue, (val) => { location.hash = hrefs.quiz(mode, val); }));

  let pool = cat.qcmFor(ue);
  if (mode === 'errors') pool = pool.filter((q) => isWeak(state.qcm[q.id]));
  if (!pool.length) {
    ctx.render(h('div', null, head, h('div', { class: 'card-empty' }, mode === 'errors'
      ? 'Aucune erreur à retravailler pour le moment : bravo, ou fais d\'abord quelques QCM.'
      : 'Pas encore de QCM pour cette UE.')));
    return {};
  }

  const z = {
    qs: shuffle(pool).slice(0, exam ? EXAM_SIZE : QUIZ_SIZE).map((q) => withShuffledChoices(q)),
    i: 0, score: 0, picked: null, answers: [], phase: exam ? 'intro' : 'run', deadline: 0,
  };
  let timer = null;
  const stopTimer = () => { if (timer) { clearInterval(timer); timer = null; } };

  function record(q, idx) {
    const good = recordAnswer(state.qcm, q, idx);
    logReview(state.log, ctx.now());
    return good;
  }

  function startExam() {
    z.phase = 'run';
    z.deadline = Date.now() + EXAM_MINUTES * 60000;
    stopTimer();
    timer = setInterval(tick, 1000);
    drawQuestion();
  }

  function tick() {
    if (z.phase !== 'run' || !exam) { stopTimer(); return; }
    const left = Math.max(0, z.deadline - Date.now());
    const el = document.getElementById('timer');
    if (el) el.textContent = '⏱ ' + pad(Math.floor(left / 60000)) + ':' + pad(Math.floor(left / 1000) % 60);
    if (left <= 0) finishExam();
  }

  function drawQuestion() {
    if (z.i >= z.qs.length) { if (exam) finishExam(); else drawEnd(); return; }
    const q = z.qs[z.i];

    const opts = q.choices.map((c, idx) => {
      let cls = 'choice';
      if (exam) {
        if (z.picked === idx) cls += ' sel';
      } else if (z.picked != null) {
        if (idx === q.answer) cls += ' right';
        else if (idx === z.picked) cls += ' wrong';
      }
      return h('button', { class: cls, disabled: !exam && z.picked != null, onclick: () => pick(idx) },
        h('span', { class: 'letter' }, String.fromCharCode(65 + idx)), h('span', null, c));
    });

    let feedback = null, dock = null;
    if (exam) {
      dock = h('div', { class: 'dock' },
        h('button', { class: 'btn primary big block', disabled: z.picked == null, onclick: validateExam },
          z.i + 1 < z.qs.length ? 'Valider et continuer' : 'Valider et terminer'));
    } else if (z.picked != null) {
      const ok = z.picked === q.answer;
      feedback = h('div', { class: 'feedback ' + (ok ? 'ok' : 'ko') }, h('strong', null, ok ? 'Bonne réponse ! ' : 'Raté. '), q.expl, datedNote(q));
      dock = h('div', { class: 'dock' },
        h('button', { class: 'btn primary big block', onclick: next }, z.i + 1 < z.qs.length ? 'Question suivante' : 'Voir le score'));
    }

    ctx.render(h('div', null,
      exam ? null : head,
      h('div', { class: 'progress-line' },
        progressBar(Math.round(100 * z.i / z.qs.length)),
        exam ? h('span', { class: 'timer', id: 'timer' }, '⏱ …') : null,
        h('span', { class: 'muted' }, (z.i + 1) + '/' + z.qs.length)),
      h('div', { class: 'flash-ue' }, cat.ueLabel(q.ue)),
      h('div', { class: 'quiz-q' }, q.q),
      h('div', { class: 'choices' }, opts),
      feedback, dock), true);
    if (exam) tick();
  }

  function pick(idx) {
    if (exam) { z.picked = idx; drawQuestion(); return; }
    const q = z.qs[z.i];
    z.picked = idx;
    if (record(q, idx)) { z.score++; vibrate(10); } else { vibrate(40); }
    ctx.store.save();
    drawQuestion();
    const fb = document.querySelector('.feedback');
    if (fb && fb.scrollIntoView) fb.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function next() { z.i++; z.picked = null; drawQuestion(); window.scrollTo(0, 0); }

  function validateExam() {
    if (z.picked == null) return;
    const q = z.qs[z.i];
    z.answers.push({ q, picked: z.picked });
    if (record(q, z.picked)) z.score++;
    ctx.store.save();
    z.i++; z.picked = null;
    drawQuestion();
    window.scrollTo(0, 0);
  }

  function finishExam() {
    if (z.phase === 'end') return;
    stopTimer();
    z.phase = 'end';
    // Questions non répondues (temps écoulé) : comptées fausses, sans toucher aux statistiques.
    const answered = z.answers.length;
    const rows = z.qs.map((q, i) => (i < answered ? z.answers[i] : { q, picked: null }));
    const { total, byUe, mistakes, note20 } = scoreExam(rows);

    ctx.render(h('div', null,
      h('div', { class: 'center end' },
        h('div', { class: 'big-emoji' }, total === rows.length ? '🎯' : '📊'),
        h('h1', null, total + ' / ' + rows.length),
        h('p', { class: 'muted' }, 'Soit ' + note20 + ' / 20' + (answered < rows.length ? ' · temps écoulé' : ''))),
      h('h2', null, 'Détail par UE'),
      h('div', { class: 'ue-list' }, Object.keys(byUe).map((k) =>
        h('div', { class: 'ue-row' }, h('div', { class: 'ue-head' },
          h('div', { class: 'ue-name' }, h('strong', null, 'UE ' + k), ' ', cat.ues[k]),
          h('div', { class: 'ue-pct' }, byUe[k].ok + '/' + byUe[k].n))))),
      mistakes.length ? h('h2', null, 'Corrections (' + mistakes.length + ')') : null,
      h('div', { class: 'card-list' }, mistakes.map((r) =>
        h('div', { class: 'row' }, h('div', { class: 'row-main' },
          h('div', { class: 'flash-ue' }, cat.ueLabel(r.q.ue)),
          h('div', null, h('strong', null, r.q.q)),
          h('div', { class: 'wrong-line' }, r.picked != null ? 'Ta réponse : ' + r.q.choices[r.picked] : 'Sans réponse'),
          h('div', { class: 'right-line' }, 'Bonne réponse : ' + r.q.choices[r.q.answer]),
          h('div', { class: 'muted' }, r.q.expl),
          datedNote(r.q))))),
      h('div', { class: 'stack' },
        h('a', { class: 'btn primary big block', href: hrefs.quiz('exam', ue), onclick: () => setTimeout(ctx.reroute, 0) }, 'Refaire un examen'),
        h('a', { class: 'btn block', href: hrefs.quiz('errors', ue) }, 'Retravailler mes erreurs'),
        h('a', { class: 'btn block', href: hrefs.home() }, 'Accueil'))));
  }

  function drawEnd() {
    ctx.render(h('div', { class: 'center end' },
      h('div', { class: 'big-emoji' }, z.score === z.qs.length ? '🎯' : '📊'),
      h('h1', null, 'Score : ' + z.score + ' / ' + z.qs.length),
      h('p', { class: 'muted' }, z.score === z.qs.length ? 'Sans faute !' : 'Refais un QCM ou travaille tes erreurs pour fixer les notions.'),
      h('div', { class: 'stack' },
        h('a', { class: 'btn primary big block', href: hrefs.quiz(mode, ue), onclick: () => setTimeout(ctx.reroute, 0) }, 'Nouveau QCM'),
        h('a', { class: 'btn block', href: hrefs.quiz('errors', ue) }, 'Mes erreurs'),
        h('a', { class: 'btn block', href: hrefs.home() }, 'Accueil'))));
  }

  if (exam) {
    ctx.render(h('div', null, head,
      h('div', { class: 'intro' },
        h('h1', null, 'Examen blanc'),
        h('p', null, z.qs.length + ' questions · ' + EXAM_MINUTES + ' minutes · ' + (ue ? cat.ueLabel(ue) : 'toutes les UE')),
        h('p', { class: 'muted' }, 'Pas de correction pendant l\'épreuve : tu verras ton score, le détail par UE et les corrections à la fin.')),
      h('div', { class: 'dock' }, h('button', { class: 'btn primary big block', onclick: startExam }, 'Commencer'))));
  } else {
    drawQuestion();
  }

  return {
    dispose: stopTimer,
    keydown(e) {
      if (z.phase !== 'run' || z.i >= z.qs.length) return;
      const idx = e.key.length === 1 ? e.key.toLowerCase().charCodeAt(0) - 97 : -1;
      const n = z.qs[z.i].choices.length;
      if (exam) {
        if (idx >= 0 && idx < n) pick(idx);
        else if ((e.key === 'Enter' || e.key === ' ') && z.picked != null) { e.preventDefault(); validateExam(); }
      } else if (z.picked == null) {
        if (idx >= 0 && idx < n) pick(idx);
      } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); }
    },
  };
}
