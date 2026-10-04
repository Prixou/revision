/*
 * Données de révision — 6 UE du DCG.
 *
 * Le contenu est réparti en un fichier par UE (js/ue2.js, ue4.js, ue6.js, ue7.js, ue10.js, ue11.js),
 * qui ajoutent leurs fiches à DCG_CARDS et leurs QCM à DCG_QCM.
 *
 * Fiche : { id, ue, q, a, d? }
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

window.DCG_CARDS = [];
window.DCG_QCM = [];
