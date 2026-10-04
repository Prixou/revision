/*
 * Données de révision — 6 UE du DCG.
 *
 * Le contenu est réparti en un fichier par UE (js/ue2.js, ue4.js, ue6.js, ue7.js, ue10.js, ue11.js),
 * qui ajoutent leurs fiches à DCG_CARDS et leurs QCM à DCG_QCM.
 *
 * Flashcard : { id, ue, q, a, n?, d? }   (n = id d'une fiche de cours détaillée)
 * Fiche de cours : { id, ue, q (titre), a (texte), d? }
 * QCM   : { id, ue, q, choices: [...], answer: indexBonneReponse, expl, d? }
 *   d = (facultatif) règle datée : année ou texte de loi à laquelle le chiffre s'applique.
 *       Affichée avec une pastille 📅 pour rappeler de vérifier la date.
 *
 * Règles : id unique et stable (la progression y est rattachée) ; contenu à confronter à TON cours.
 */
window.DCG_META = {
  verifiedOn: '04/10/2026',
  programme: 'Programme du DCG réformé (arrêté du 4 août 2025) : enseigné depuis la rentrée 2026, première session d\'examen en 2027.'
};

window.DCG_UES = {
  2: 'Droit des affaires',
  4: 'Droit fiscal',
  6: 'Finance d\'entreprise',
  7: 'Management des organisations',
  10: 'Comptabilité approfondie',
  11: 'Contrôle de gestion'
};

// Noms courts pour les pastilles de filtre (affichage mobile)
window.DCG_UE_SHORT = {
  2: 'Droit des affaires',
  4: 'Fiscal',
  6: 'Finance',
  7: 'Management',
  10: 'Compta',
  11: 'Gestion'
};

// Flashcards (une carte = un fait : question courte, réponse courte)
window.DCG_CARDS = [];
// Fiches de cours détaillées (lecture), reliées aux flashcards par le champ n
window.DCG_NOTES = [];
window.DCG_QCM = [];

/*
 * Ajoute des flashcards pour une UE. Chaque ligne : [question, réponse, noteId?, dateRegle?]
 * Les ids sont générés dans l'ordre (f<ue>-001, f<ue>-002...) : ne JAMAIS réordonner ni supprimer
 * de lignes existantes (la progression y est rattachée) ; ajouter uniquement à la fin d'un fichier.
 */
(function () {
  var counters = {};
  window.DCG_FLASH = function (ue, rows) {
    rows.forEach(function (r) {
      counters[ue] = (counters[ue] || 0) + 1;
      var n = String(counters[ue]);
      while (n.length < 3) n = '0' + n;
      var card = { id: 'f' + ue + '-' + n, ue: ue, q: r[0], a: r[1] };
      if (r[2]) card.n = r[2];
      if (r[3]) card.d = r[3];
      window.DCG_CARDS.push(card);
    });
  };
})();
