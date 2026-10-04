# Révision DCG

Application de révision pour les 6 UE du DCG à repasser, **pensée d'abord pour le téléphone**, alignée sur
le **programme réformé** (arrêté du 4 août 2025 : enseigné depuis la rentrée 2026, première session d'examen en 2027).

| UE | Matière | Fiches | QCM |
|----|---------|--------|-----|
| 2  | Droit des affaires | 107 | 33 |
| 4  | Droit fiscal | 85 | 34 |
| 6  | Finance d'entreprise | 86 | 35 |
| 7  | Management des organisations | 100 | 30 |
| 10 | Comptabilité approfondie | 88 | 30 |
| 11 | Contrôle de gestion | 90 | 44 |

Aucune installation ni compte : HTML/JS statique. La progression est enregistrée dans le navigateur
(`localStorage`) et l'app fonctionne hors ligne une fois ouverte.

## Utiliser sur téléphone

Le site est publié avec GitHub Pages (`https://prixou.github.io/revision/`). Sur le téléphone : « Ajouter à l'écran d'accueil »
(iPhone : Partager → Sur l'écran d'accueil ; Android : menu ⋮ → Installer l'application).

En local : `npx serve .` (ou `python3 -m http.server 8000`).

## Fonctionnalités

- **Fiches** à répétition espacée (boîtes de Leitner : J+1, 3, 7, 14, 30, 60). Touche la carte pour voir la réponse, puis note-toi
  avec les boutons ou **glisse** la carte (droite = je savais, gauche = à revoir). Limite de 20 nouvelles cartes par jour.
- **QCM** avec explication, ordre des choix mélangé à chaque fois.
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

Données : `js/data.js` (UE, métadonnées) et un fichier par UE (`js/ue2.js` ... `js/ue11.js`). Chaque `id` est unique et stable
(la progression y est rattachée).
