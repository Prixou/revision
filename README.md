# Révision DCG

Application de révision pour les 6 UE du DCG à repasser, **pensée d'abord pour le téléphone**, alignée sur
le **programme réformé** (arrêté du 4 août 2025 : enseigné depuis la rentrée 2026, première session d'examen en 2027).

| UE | Matière | Flashcards | Fiches de cours | QCM |
|----|---------|-----------|-----------------|-----|
| 2  | Droit des affaires | 345 | 107 | 39 |
| 4  | Droit fiscal | 322 | 85 | 40 |
| 6  | Finance d'entreprise | 298 | 86 | 41 |
| 7  | Management des organisations | 304 | 100 | 36 |
| 10 | Comptabilité approfondie | 341 | 88 | 35 |
| 11 | Contrôle de gestion | 268 | 90 | 50 |

**1 878 flashcards** : une carte = un fait (question courte, réponse courte), avec un lien vers la fiche de cours détaillée.
Plusieurs types de cartes : questions (1 231), **cartes à trous** (276), **calculs chiffrés** (210, tous vérifiés numériquement),
**écritures comptables et méthodes** (79) et **formules** (82). 241 QCM.

Aucune installation ni compte : HTML/JS statique. La progression est enregistrée dans le navigateur
(`localStorage`) et l'app fonctionne hors ligne une fois ouverte.

## Utiliser sur téléphone

Le site est publié avec GitHub Pages (`https://prixou.github.io/revision/`). Sur le téléphone : « Ajouter à l'écran d'accueil »
(iPhone : Partager → Sur l'écran d'accueil ; Android : menu ⋮ → Installer l'application).

En local : `npx serve .` (ou `python3 -m http.server 8000`).

## Fonctionnalités

- **Flashcards** à répétition espacée (boîtes de Leitner : J+1, 3, 7, 14, 30, 60). Touche la carte pour voir la réponse, puis note-toi
  avec les boutons ou **glisse** la carte (droite = je savais, gauche = à revoir). Limite de 20 nouvelles cartes par jour.
- **Filtres** par UE et par type de carte (à trous, calculs, écritures/méthode, formulaire).
- **QCM** avec explication, ordre des choix mélangé à chaque fois ; mode **examen blanc** (20 questions, 30 min, note /20 et détail par UE)
  et mode **Mes erreurs** (questions déjà ratées).
- **Formulaire** : toutes les formules de l'ensemble des UE sur une page (onglet Cartes → Formules).
- **Accueil** : cartes à revoir, série de jours, progression par UE.
- **Mes cartes** : recherche, ajout de tes propres fiches, export/import JSON de la sauvegarde.
- **Pastille 📅** : toute règle chiffrée qui dépend d'une année ou d'un texte de loi indique sa date de référence.

## Contenu et dates

Le contenu a été vérifié par recherche le **04/10/2026** (voir la pastille 📅 sur les cartes concernées) :
seuils et taux de l'IS, de la TVA, des régimes micro, barème de l'IR, PFU 2026, seuils de commissaire aux comptes,
facturation électronique, plan comptable 2025 (ANC 2022-06 : comptes 657/757/747, fin des transferts de charges),
loi de simplification du 26/05/2026 (bail commercial), CSRD après Omnibus, AI Act...

Il a été rédigé **sans tes cours** : confronte-le à ton programme et à ton enseignant. Certains points (consolidation,
numérotation détaillée du PCG 2025, peines pénales) sont signalés « à vérifier ».

Données : `js/data.js` (UE, métadonnées, aide `DCG_FLASH`), les flashcards dans `js/f<UE>.js` (cartes de base) et `js/x<UE>.js` (calculs, cartes à trous, méthode, lexique), les fiches de cours et QCM dans `js/ue<UE>.js`.
Les ids des flashcards sont générés dans l'ordre (`f6-001`...) : **ajouter uniquement à la fin d'un fichier**, ne jamais réordonner
(la progression y est rattachée).
