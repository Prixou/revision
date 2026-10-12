// Constantes de l'application (réglages de révision, tailles de session, clés de stockage).

export const STORAGE_KEY = 'dcg-revision-v1';

// Répétition espacée (boîtes de Leitner) : jours avant la prochaine revue, par boîte.
export const INTERVALS = [0, 1, 3, 7, 14, 30, 60];
export const MASTERED_BOX = 4;       // boîte à partir de laquelle une carte est « maîtrisée »
export const SESSION_SIZE = 20;      // cartes par session
export const NEW_PER_DAY = 20;       // nouvelles cartes introduites par jour
export const AGAIN_OFFSET = 3;       // une carte ratée revient après N cartes

export const PAGE = 60;              // éléments par page dans les listes
export const QUIZ_SIZE = 10;         // questions d'un QCM rapide
export const EXAM_SIZE = 20;         // questions d'un examen blanc
export const EXAM_MINUTES = 30;      // durée de l'examen blanc
export const SWIPE_MIN = 70;         // px, seuil de balayage d'une carte

export const MANIFEST_URL = 'data/manifest.json';

// Types de flashcards : '' (question), 'cloze' (à trous), 'calc', 'ecr', 'formule'
export const KINDS = [
  { key: '', label: 'Tous les types' },
  { key: 'q', label: 'Questions' },
  { key: 'cloze', label: '📝 À trous' },
  { key: 'calc', label: '🧮 Calculs' },
  { key: 'ecr', label: '✍️ Écritures' },
  { key: 'formule', label: '🧩 Formules' },
];
export const KIND_BADGE = { cloze: '📝 À trous', calc: '🧮 Calcul', ecr: '✍️ Écriture', formule: '🧩 Formule' };
