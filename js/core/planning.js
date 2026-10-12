// Aide à la planification des révisions avant une épreuve (fonctions pures).

export const PHASES = [
  { min: 29, key: 'learn', label: 'Apprentissage', tip: 'Couvre tout le programme : nouvelles cartes chaque jour, fiches de cours, un cas pratique par semaine.' },
  { min: 14, key: 'consolidate', label: 'Consolidation', tip: 'Révise les cartes échues, refais les cartes difficiles et enchaîne les cas pratiques.' },
  { min: 7, key: 'train', label: 'Entraînement', tip: 'QCM et cas pratiques chronométrés, formulaire, méthode de l\'épreuve.' },
  { min: 0, key: 'final', label: 'Dernière ligne droite', tip: 'Examens blancs, mes erreurs, relecture du formulaire et des synthèses. Pas de nouveau chapitre.' },
];

export function phaseFor(daysLeft) {
  return PHASES.find((p) => daysLeft >= p.min) || PHASES[PHASES.length - 1];
}

// Rythme conseillé : nouvelles cartes par jour pour tout voir une semaine avant l'épreuve.
export function dailyTarget(daysLeft, unseen) {
  if (unseen <= 0) return 0;
  const window = Math.max(1, daysLeft - 7);
  return Math.ceil(unseen / window);
}
