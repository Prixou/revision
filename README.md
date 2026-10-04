# Révision DCG

Application de révision pour les 6 UE du DCG à repasser, **pensée d'abord pour le téléphone** :

| UE | Matière |
|----|---------|
| 2  | Droit des sociétés |
| 4  | Droit fiscal |
| 6  | Finance d'entreprise |
| 7  | Management |
| 10 | Comptabilité approfondie |
| 11 | Contrôle de gestion |

Aucune installation ni compte : HTML/JS statique. La progression est enregistrée dans le navigateur
(`localStorage`) et l'app fonctionne hors ligne une fois ouverte.

## Utiliser sur téléphone

1. Héberge le dossier (GitHub Pages, Netlify, Cloudflare Pages… tout hébergeur statique en HTTPS).
2. Ouvre l'adresse sur le téléphone, puis « Ajouter à l'écran d'accueil » : l'app s'ouvre en plein écran et marche hors ligne.

En local : `npx serve .` (ou `python3 -m http.server 8000`).

## Fonctionnalités

- **Fiches** (182) à répétition espacée (boîtes de Leitner : revues à J+1, 3, 7, 14, 30, 60).
  Touche la carte pour voir la réponse, puis note-toi avec les boutons ou **glisse** la carte
  (droite = je savais, gauche = à revoir). Clavier : `Espace`, `1` / `2` / `3`.
- **QCM** (81) avec explication, ordre des choix mélangé à chaque fois. Clavier : `A`–`D`.
- **Accueil** : cartes à revoir, série de jours, progression par UE.
- **Mes cartes** : recherche, ajout de tes propres fiches, export/import JSON de la sauvegarde.
- Barre d'onglets en bas, filtres d'UE défilants, grandes zones tactiles, mode sombre automatique.

## Contenu

Le contenu est dans `js/data.js` (`DCG_CARDS` et `DCG_QCM`). Il a été rédigé sans tes cours :
**relis-le avec ton programme et ton année** — les taux, seuils et plafonds changent avec les lois
de finances (signalés « à vérifier » quand c'est le cas). Pour en ajouter, complète ces tableaux
avec un `id` unique.
