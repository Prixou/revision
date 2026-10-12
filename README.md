# Révision DCG

Application de révision pour les 6 UE du DCG à repasser, **pensée d'abord pour le téléphone**, alignée sur
le **programme réformé** (arrêté du 4 août 2025 : enseigné depuis la rentrée 2026, première session d'examen en 2027).

Aucune installation ni compte : site statique (HTML, CSS, JavaScript natif, aucune dépendance). La progression est enregistrée
dans le navigateur (`localStorage`) et l'app fonctionne hors ligne une fois ouverte.

<!-- stats:start -->
| UE | Matière | Flashcards | Fiches de cours | QCM | Cas pratiques | Synthèses | Lexique |
|----|---------|-----------:|----------------:|----:|--------------:|----------:|--------:|
| 2 | Droit des affaires | 345 | 107 | 39 | 0 | 0 | 0 |
| 4 | Droit fiscal | 322 | 85 | 40 | 0 | 0 | 0 |
| 6 | Finance d'entreprise | 298 | 86 | 41 | 0 | 0 | 0 |
| 7 | Management des organisations | 304 | 100 | 36 | 0 | 0 | 0 |
| 10 | Comptabilité approfondie | 341 | 88 | 35 | 0 | 0 | 0 |
| 11 | Contrôle de gestion | 268 | 90 | 50 | 0 | 0 | 0 |
| | **Total** | **1878** | **556** | **241** | **0** | **0** | **0** |

Types de flashcards : 1231 questions, 276 à trous, 210 calculs, 79 écritures et méthodes, 82 formules.
<!-- stats:end -->

## Utiliser sur téléphone

Le site est publié avec GitHub Pages (`https://prixou.github.io/revision/`). Sur le téléphone : « Ajouter à l'écran d'accueil »
(iPhone : Partager → Sur l'écran d'accueil ; Android : menu ⋮ → Installer l'application).

## Fonctionnalités

- **Flashcards** à répétition espacée (boîtes de Leitner : J+1, 3, 7, 14, 30, 60). Touche la carte pour voir la réponse, puis note-toi
  avec les boutons ou **glisse** la carte (droite = je savais, gauche = à revoir). 20 nouvelles cartes par jour au plus.
  Filtres par UE et par type (questions, à trous, calculs, écritures, formules), mode **cartes difficiles**.
- **QCM** avec explication, ordre des choix mélangé ; **examen blanc** (20 questions, 30 min, note /20 et détail par UE) ;
  mode **Mes erreurs**.
- **Ressources** : fiches de cours, synthèses et tableaux comparatifs, cas pratiques corrigés, formulaire, lexique,
  recherche globale, sources officielles, épreuves et planning (date d'épreuve, compte à rebours, rythme conseillé).
- **Pastille 📅** : toute règle chiffrée qui dépend d'une année ou d'un texte de loi indique sa date de référence.
- **Mes cartes** : ajout de tes propres cartes, export/import JSON de la sauvegarde.

## Organisation du code

```
index.html, sw.js, manifest.webmanifest   enveloppe PWA (service worker : réseau d'abord, cache en secours)
css/style.css                             styles (mobile d'abord)
js/main.js                                démarrage : chargement du contenu, routage, clavier
js/config.js                              constantes (intervalles, tailles de session…)
js/core/                                  logique pure, sans DOM, testée : srs, quiz, catalog, store, cloze, dates, planning…
js/ui/                                    briques d'interface : dom (h), composants, routeur
js/views/                                 une vue par écran (accueil, review, quiz, listes, synthèses, cas, épreuves…)
data/                                     tout le contenu, en JSON (voir ci-dessous)
tools/                                    outils Node sans dépendance : check, build, patch, add, stats
tests/                                    tests unitaires (`node --test`)
```

## Le contenu (`data/`)

```
data/meta.json              UE, noms courts, date de vérification
data/epreuves.json          format de chaque épreuve (durée, coefficient, conseils)
data/links.json             sources officielles
data/ue<N>/notes.json       fiches de cours      { id, ue, q, a, d? }
data/ue<N>/cards.json       flashcards           { id, ue, q, a, n?, d?, kind? }   (kind : calc | ecr | formule | cloze)
data/ue<N>/qcm.json        QCM                  { id, ue, q, choices[], answer, expl, d? }
data/ue<N>/cases.json       cas pratiques        { id, ue, title, level 1-3, minutes, theme, enonce, tables?, questions[{q,a,points?}], conseil?, d? }
data/ue<N>/synth.json       synthèses            { id, ue, title, summary?, sections[{h,items[]}], tables?[{caption,header[],rows[][]}], notes?[], d? }
data/ue<N>/glossary.json    lexique              { id, ue, term, def, d?, n? }
data/manifest.json          généré par `node tools/build.js` (liste des fichiers + version)
```

Règles :

- **Les ids sont explicites et ne changent jamais** : la progression de chaque utilisateur y est rattachée. On peut corriger
  le texte d'une carte ; pour la supprimer, on la supprime, mais on ne réutilise jamais un id.
- Une carte à trous s'écrit `{ "kind": "cloze", "t": "Le SR = {{charges fixes}} ÷ taux de MCV" }` (q et a sont dérivés).
- `d` (facultatif) : règle datée — année ou texte de loi auquel le chiffre s'applique (affichée en pastille 📅).
- `n` renvoie à l'id d'une fiche de cours (peut être d'une autre UE).
- Un élément par ligne dans les JSON (diffs lisibles) : utiliser les outils ci-dessous plutôt que d'éditer à la main.

## Outils

```bash
node tools/check.js            # valide le contenu (schémas, ids, liens, réponses de QCM) et le manifeste
node tools/build.js            # régénère data/manifest.json (à relancer après toute modification de data/ ou de js/, css/)
node tools/add.js 4 qcm nouveaux.json     # ajoute des éléments (ids attribués automatiquement)
node tools/patch.js corrections.json      # corrige des éléments existants par id
node tools/stats.js --readme   # met à jour le tableau de ce README
npm test                       # tests unitaires (node --test)
npm run serve                  # serveur local sur http://localhost:8000
```

Le workflow GitHub `ci.yml` exécute `check` et les tests à chaque push.

## Contenu et dates

Le contenu a été vérifié par recherche en octobre 2026 sur les sources officielles (BOFiP-Impôts, Légifrance, ANC, Ordre des
experts-comptables) : seuils et taux de l'IS, de la TVA, des régimes micro, barème de l'IR, PFU 2026, seuils de commissaire
aux comptes, facturation électronique, plan comptable 2025 (règlement ANC 2022-06), loi de simplification de mai 2026 (bail
commercial), CSRD après Omnibus, AI Act…

Il a été rédigé **sans tes cours** : confronte-le à ton programme et à ton enseignant. Les points signalés « à vérifier » le sont
parce qu'une source officielle n'a pas pu être consultée directement.
