/*
 * Contenu de départ. À relire et compléter avec TES cours : les barèmes
 * (taux, seuils) changent selon les lois de finances et les programmes.
 * Tu peux aussi ajouter tes propres cartes depuis l'onglet « Mes cartes ».
 *
 * Fiches : { id, ue, q, a }
 * QCM    : { id, ue, q, choices: [...], answer: indexBonneReponse, expl }
 */
window.DCG_UES = {
  1: 'Introduction au droit',
  2: 'Droit des sociétés',
  3: 'Droit social',
  4: 'Droit fiscal',
  5: 'Économie',
  6: 'Finance d\'entreprise',
  7: 'Management',
  8: 'Systèmes d\'information de gestion',
  9: 'Introduction à la comptabilité',
  10: 'Comptabilité approfondie',
  11: 'Contrôle de gestion',
  12: 'Anglais appliqué aux affaires',
  13: 'Communication professionnelle'
};

window.DCG_CARDS = [
  // UE 2 — Droit des sociétés
  { id: 'ue2-01', ue: 2, q: 'Capital minimum d\'une SA ?', a: '37 000 €.' },
  { id: 'ue2-02', ue: 2, q: 'Nombre minimum d\'actionnaires d\'une SA non cotée / cotée ?', a: '2 pour une SA non cotée, 7 pour une SA cotée.' },
  { id: 'ue2-03', ue: 2, q: 'Capital minimum d\'une SARL et d\'une SAS ?', a: 'Aucun : le capital est librement fixé par les statuts (1 € possible).' },
  { id: 'ue2-04', ue: 2, q: 'Quelles sont les 3 conditions de fond du contrat de société ?', a: 'Les apports, l\'affectio societatis (volonté de s\'associer) et la participation aux bénéfices et aux pertes.' },

  // UE 3 — Droit social
  { id: 'ue3-01', ue: 3, q: 'Quelle est la forme de droit commun du contrat de travail ?', a: 'Le CDI (contrat à durée indéterminée). Le CDD est une exception encadrée par la loi.' },
  { id: 'ue3-02', ue: 3, q: 'Durée maximale de la période d\'essai d\'un CDI (renouvellement compris) ?', a: 'Initiale : 2 mois (ouvriers/employés), 3 mois (agents de maîtrise/techniciens), 4 mois (cadres). Renouvelable une fois si accord de branche et clause expresse : 4, 6 et 8 mois au maximum.' },
  { id: 'ue3-03', ue: 3, q: 'Quelles sont les deux grandes catégories de licenciement ?', a: 'Le licenciement pour motif personnel (faute ou non) et le licenciement pour motif économique. Il doit reposer sur une cause réelle et sérieuse.' },

  // UE 4 — Droit fiscal
  { id: 'ue4-01', ue: 4, q: 'Taux normal de l\'impôt sur les sociétés (IS) ?', a: '25 %. Taux réduit de 15 % jusqu\'à 42 500 € de bénéfice pour les PME remplissant les conditions (CA < 10 M€, capital entièrement libéré et détenu à 75 % par des personnes physiques).' },
  { id: 'ue4-02', ue: 4, q: 'Taux de TVA en France métropolitaine ?', a: 'Taux normal 20 %, taux réduits 10 % et 5,5 %, taux super-réduit 2,1 %.' },
  { id: 'ue4-03', ue: 4, q: 'Fait générateur et exigibilité de la TVA pour une vente de biens ?', a: 'Fait générateur : la livraison. Exigibilité : la livraison (TVA sur les débits).' },
  { id: 'ue4-04', ue: 4, q: 'Différence entre impôt direct et indirect ?', a: 'L\'impôt direct est payé directement par le contribuable qui le supporte (IR, IS). L\'impôt indirect est supporté par le consommateur mais reversé par un intermédiaire (TVA).' },

  // UE 5 — Économie
  { id: 'ue5-01', ue: 5, q: 'Définition du PIB ?', a: 'Somme des valeurs ajoutées créées sur un territoire par les unités productrices résidentes, sur une période donnée (+ impôts sur les produits − subventions).' },
  { id: 'ue5-02', ue: 5, q: 'Que mesure l\'inflation ?', a: 'La hausse générale et durable du niveau des prix, mesurée par l\'indice des prix à la consommation (IPC).' },
  { id: 'ue5-03', ue: 5, q: 'Quels sont les 4 objectifs du « carré magique » de Kaldor ?', a: 'Croissance économique, plein emploi, stabilité des prix et équilibre extérieur.' },

  // UE 6 — Finance d'entreprise
  { id: 'ue6-01', ue: 6, q: 'Formule du fonds de roulement net global (FRNG) ?', a: 'FRNG = Ressources stables − Emplois stables (ou Actif circulant − Dettes à court terme).' },
  { id: 'ue6-02', ue: 6, q: 'Formule du BFR d\'exploitation ?', a: 'BFR = Actif circulant d\'exploitation (stocks + créances clients) − Passif circulant d\'exploitation (dettes fournisseurs, fiscales et sociales).' },
  { id: 'ue6-03', ue: 6, q: 'Relation entre FRNG, BFR et trésorerie nette ?', a: 'Trésorerie nette = FRNG − BFR.' },
  { id: 'ue6-04', ue: 6, q: 'Comment calcule-t-on la VAN d\'un investissement ?', a: 'VAN = Σ flux nets de trésorerie actualisés − capital investi. Un projet est rentable si VAN > 0.' },
  { id: 'ue6-05', ue: 6, q: 'Qu\'est-ce que la capacité d\'autofinancement (CAF) ?', a: 'Ressource interne issue de l\'activité : résultat net + charges calculées (dotations) − produits calculés (reprises) ± plus/moins-values de cession.' },

  // UE 7 — Management
  { id: 'ue7-01', ue: 7, q: 'Les 5 forces concurrentielles de Porter ?', a: 'Rivalité entre concurrents existants, menace des nouveaux entrants, menace des produits de substitution, pouvoir de négociation des clients, pouvoir de négociation des fournisseurs.' },
  { id: 'ue7-02', ue: 7, q: 'Que signifie SWOT ?', a: 'Strengths (forces), Weaknesses (faiblesses), Opportunities (opportunités), Threats (menaces) : diagnostic interne (forces/faiblesses) et externe (opportunités/menaces).' },
  { id: 'ue7-03', ue: 7, q: 'Les 3 stratégies génériques de Porter ?', a: 'Domination par les coûts, différenciation, concentration (focalisation).' },

  // UE 8 — SIG
  { id: 'ue8-01', ue: 8, q: 'Que signifie ERP ?', a: 'Enterprise Resource Planning (PGI en français) : progiciel de gestion intégré couvrant plusieurs fonctions de l\'entreprise avec une base de données unique.' },
  { id: 'ue8-02', ue: 8, q: 'Que garantit le RGPD ?', a: 'La protection des données personnelles : licéité, finalité, minimisation, durée de conservation limitée, droits des personnes (accès, rectification, effacement, opposition).' },

  // UE 9 — Introduction à la comptabilité
  { id: 'ue9-01', ue: 9, q: 'Équation fondamentale du bilan ?', a: 'Actif = Passif, soit Actif = Capitaux propres + Dettes.' },
  { id: 'ue9-02', ue: 9, q: 'Les 7 classes de comptes du PCG ?', a: '1 capitaux · 2 immobilisations · 3 stocks et en-cours · 4 tiers · 5 financiers · 6 charges · 7 produits.' },
  { id: 'ue9-03', ue: 9, q: 'Un compte d\'actif est débité ou crédité pour une augmentation ?', a: 'Débité (augmentation au débit, diminution au crédit). Inversement pour les comptes de passif.' },
  { id: 'ue9-04', ue: 9, q: 'Un compte de charge est débité ou crédité pour une augmentation ?', a: 'Débité. Les comptes de produits sont crédités pour une augmentation.' },
  { id: 'ue9-05', ue: 9, q: 'Formule de l\'amortissement linéaire ?', a: 'Annuité = Base amortissable ÷ Durée d\'utilisation (taux = 1 ÷ durée). Au prorata temporis la première année.' },
  { id: 'ue9-06', ue: 9, q: 'Coefficients de l\'amortissement dégressif ?', a: '1,25 si durée de 3 ou 4 ans · 1,75 si 5 ou 6 ans · 2,25 si plus de 6 ans. Taux dégressif = taux linéaire × coefficient.' },
  { id: 'ue9-07', ue: 9, q: 'Écriture d\'achat de marchandises avec TVA déductible (à crédit) ?', a: 'Débit 607 Achats de marchandises (HT) + Débit 44566 TVA déductible sur ABS · Crédit 401 Fournisseurs (TTC).' },
  { id: 'ue9-08', ue: 9, q: 'Écriture de vente de marchandises avec TVA collectée (à crédit) ?', a: 'Débit 411 Clients (TTC) · Crédit 707 Ventes de marchandises (HT) + Crédit 44571 TVA collectée.' },

  // UE 10 — Comptabilité approfondie
  { id: 'ue10-01', ue: 10, q: 'Principe d\'indépendance des exercices ?', a: 'Chaque exercice comptabilise uniquement ses charges et produits : on enregistre les charges constatées d\'avance, produits constatés d\'avance, charges à payer et produits à recevoir.' },
  { id: 'ue10-02', ue: 10, q: 'Principe de prudence ?', a: 'Ne pas comptabiliser de produits non réalisés, mais provisionner les risques et pertes probables (dépréciations, provisions).' },
  { id: 'ue10-03', ue: 10, q: 'Différence entre amortissement et dépréciation ?', a: 'L\'amortissement constate la perte de valeur certaine et irréversible (usure, obsolescence). La dépréciation constate une perte de valeur probable et réversible.' },
  { id: 'ue10-04', ue: 10, q: 'Quand constitue-t-on une provision pour risques et charges ?', a: 'Quand il existe une obligation à l\'égard d\'un tiers, dont il est probable ou certain qu\'elle provoquera une sortie de ressources sans contrepartie au moins équivalente, et dont le montant est estimable avec fiabilité.' },
  { id: 'ue10-05', ue: 10, q: 'Résultat de cession d\'une immobilisation ?', a: 'Prix de cession − Valeur nette comptable (VNC). Plus-value si positif, moins-value si négatif. VNC = valeur d\'origine − amortissements cumulés.' },

  // UE 11 — Contrôle de gestion
  { id: 'ue11-01', ue: 11, q: 'Formule de la marge sur coût variable (MCV) ?', a: 'MCV = Chiffre d\'affaires − Charges variables. Taux de MCV = MCV ÷ CA.' },
  { id: 'ue11-02', ue: 11, q: 'Formule du seuil de rentabilité (en valeur) ?', a: 'SR = Charges fixes ÷ Taux de MCV. En quantité : Charges fixes ÷ MCV unitaire.' },
  { id: 'ue11-03', ue: 11, q: 'Comment calcule-t-on la marge de sécurité ?', a: 'Marge de sécurité = CA − Seuil de rentabilité (ou en % : (CA − SR) ÷ CA).' },
  { id: 'ue11-04', ue: 11, q: 'Que sont les charges incorporables et les charges supplétives ?', a: 'Charges incorporables = charges de la comptabilité générale retenues dans les coûts. Charges supplétives = charges non comptabilisées mais intégrées aux coûts (ex. rémunération de l\'exploitant).' },
  { id: 'ue11-05', ue: 11, q: 'Coût de production d\'un produit fini ?', a: 'Coût d\'achat des matières consommées + charges directes de production + charges indirectes de production.' }
];

window.DCG_QCM = [
  { id: 'q-ue2-01', ue: 2, q: 'Quel est le capital minimum d\'une SA ?', choices: ['1 €', '8 000 €', '37 000 €', '100 000 €'], answer: 2, expl: 'Le capital minimum d\'une société anonyme est de 37 000 €.' },
  { id: 'q-ue2-02', ue: 2, q: 'Dans une SARL, la responsabilité des associés est…', choices: ['Illimitée et solidaire', 'Limitée aux apports', 'Illimitée mais non solidaire', 'Limitée au double des apports'], answer: 1, expl: 'Les associés de SARL ne supportent les pertes qu\'à concurrence de leurs apports.' },
  { id: 'q-ue3-01', ue: 3, q: 'Quelle est la forme normale du contrat de travail ?', choices: ['CDD', 'CDI', 'Intérim', 'Contrat de chantier'], answer: 1, expl: 'Le CDI est la forme de droit commun de la relation de travail.' },
  { id: 'q-ue4-01', ue: 4, q: 'Quel est le taux normal de TVA en France métropolitaine ?', choices: ['5,5 %', '10 %', '19,6 %', '20 %'], answer: 3, expl: 'Taux normal : 20 %. Les taux réduits sont 10 %, 5,5 % et 2,1 %.' },
  { id: 'q-ue4-02', ue: 4, q: 'La TVA est un impôt…', choices: ['Direct sur le revenu', 'Indirect sur la consommation', 'Direct sur le patrimoine', 'Sur les bénéfices'], answer: 1, expl: 'Elle est supportée par le consommateur final et reversée à l\'État par les entreprises.' },
  { id: 'q-ue5-01', ue: 5, q: 'Un taux d\'inflation positif signifie que…', choices: ['Les prix baissent', 'Les prix augmentent', 'Le chômage augmente', 'Le PIB baisse'], answer: 1, expl: 'L\'inflation est la hausse générale et durable des prix.' },
  { id: 'q-ue6-01', ue: 6, q: 'Trésorerie nette = ?', choices: ['FRNG + BFR', 'FRNG − BFR', 'BFR − FRNG', 'Actif − Passif'], answer: 1, expl: 'TN = FRNG − BFR.' },
  { id: 'q-ue6-02', ue: 6, q: 'Un projet d\'investissement est jugé rentable si sa VAN est…', choices: ['Négative', 'Nulle uniquement', 'Positive', 'Inférieure au taux d\'actualisation'], answer: 2, expl: 'VAN > 0 : les flux actualisés couvrent le capital investi.' },
  { id: 'q-ue7-01', ue: 7, q: 'Laquelle n\'est PAS l\'une des 5 forces de Porter ?', choices: ['Pouvoir des fournisseurs', 'Menace des substituts', 'Taux de change', 'Menace des nouveaux entrants'], answer: 2, expl: 'Le taux de change relève de l\'analyse PESTEL (environnement économique), pas du modèle de Porter.' },
  { id: 'q-ue9-01', ue: 9, q: 'Dans quelle classe du PCG se trouvent les charges ?', choices: ['Classe 4', 'Classe 5', 'Classe 6', 'Classe 7'], answer: 2, expl: 'Classe 6 : charges. Classe 7 : produits.' },
  { id: 'q-ue9-02', ue: 9, q: 'Un achat à crédit de marchandises (HT 1 000 €, TVA 20 %) crédite le compte 401 de…', choices: ['1 000 €', '1 200 €', '200 €', '800 €'], answer: 1, expl: 'Le fournisseur est crédité du montant TTC : 1 000 + 200 = 1 200 €.' },
  { id: 'q-ue9-03', ue: 9, q: 'Un bien de 12 000 € amorti linéairement sur 5 ans : annuité ?', choices: ['1 200 €', '2 000 €', '2 400 €', '3 000 €'], answer: 2, expl: '12 000 ÷ 5 = 2 400 €.' },
  { id: 'q-ue9-04', ue: 9, q: 'Quel est le coefficient dégressif pour une durée de 5 ans ?', choices: ['1,25', '1,75', '2,25', '3'], answer: 1, expl: '1,25 (3-4 ans), 1,75 (5-6 ans), 2,25 (> 6 ans).' },
  { id: 'q-ue9-05', ue: 9, q: 'Le compte 411 Clients est un compte…', choices: ['De charge', 'De produit', 'D\'actif', 'De capitaux propres'], answer: 2, expl: 'Les créances clients figurent à l\'actif du bilan.' },
  { id: 'q-ue10-01', ue: 10, q: 'Un bien acheté 20 000 € et amorti de 12 000 € est cédé 9 500 €. Résultat de cession ?', choices: ['Plus-value de 1 500 €', 'Moins-value de 1 500 €', 'Plus-value de 9 500 €', 'Moins-value de 8 000 €'], answer: 0, expl: 'VNC = 20 000 − 12 000 = 8 000 €. 9 500 − 8 000 = +1 500 € (plus-value).' },
  { id: 'q-ue10-02', ue: 10, q: 'Quel principe impose de provisionner un risque probable ?', choices: ['Continuité d\'exploitation', 'Prudence', 'Permanence des méthodes', 'Coût historique'], answer: 1, expl: 'Principe de prudence : on tient compte des risques et pertes probables, pas des gains latents.' },
  { id: 'q-ue10-03', ue: 10, q: 'Une charge constatée d\'avance correspond à une charge…', choices: ['Payée sur l\'exercice et relative à l\'exercice suivant', 'À payer relative à l\'exercice', 'Exceptionnelle', 'Non déductible'], answer: 0, expl: 'On la retire des charges de l\'exercice N (compte 486) car elle concerne N+1.' },
  { id: 'q-ue11-01', ue: 11, q: 'CA = 100 000 €, charges variables = 60 000 €, charges fixes = 30 000 €. Seuil de rentabilité ?', choices: ['30 000 €', '50 000 €', '75 000 €', '90 000 €'], answer: 2, expl: 'Taux de MCV = 40 %. SR = 30 000 ÷ 0,40 = 75 000 €.' },
  { id: 'q-ue11-02', ue: 11, q: 'La marge sur coût variable se calcule par…', choices: ['CA − charges fixes', 'CA − charges variables', 'Résultat + charges variables', 'CA − coût complet'], answer: 1, expl: 'MCV = CA − charges variables.' }
];
