# Révision DCG

Application de révision pour le DCG : fiches à répétition espacée, QCM, suivi par UE.
Aucune installation ni compte : c'est du HTML/JS statique, la progression est sauvegardée dans le navigateur (`localStorage`) et l'app fonctionne hors ligne.

## Lancer

```sh
npx serve .        # ou : python3 -m http.server 8000
```

Puis ouvrir l'adresse affichée. (Ouvrir `index.html` directement fonctionne aussi, sans le mode hors ligne.)

## Fonctionnalités

- **Fiches** : boîtes de Leitner (revues à J+1, 3, 7, 14, 30, 60). Raccourcis : `Espace` pour retourner, `1` / `2` / `3` pour noter.
- **QCM** : 10 questions tirées au hasard, avec explication. Raccourcis : `A`–`D`, `Entrée`.
- **Accueil** : cartes à revoir, série de jours, progression par UE (13 UE du DCG).
- **Mes cartes** : ajouter/supprimer ses propres fiches, recherche, export/import JSON de la sauvegarde.

## Ajouter du contenu

Le contenu de départ est dans `js/data.js` (`DCG_CARDS` et `DCG_QCM`). Il est volontairement court
et **à relire avec tes cours** (taux et seuils évoluent avec les lois de finances). Chaque UE peut être
complétée en ajoutant des objets dans ces deux tableaux, avec un `id` unique.
