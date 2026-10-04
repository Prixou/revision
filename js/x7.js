/* UE 7 — compléments : cas chiffrés, cartes à trous, méthode, lexique. Ajouter uniquement à la fin. */

// ===== Cas chiffrés et indicateurs =====
DCG_FLASH(7, [
  ["Entreprise de 8 salariés, CA de 1,5 M€ : catégorie ?", "Microentreprise (moins de 10 salariés et CA ou bilan ≤ 2 M€).", "ue7-103", "Décret n° 2008-1354 du 18/12/2008 (critères de la LME)", "calc"],
  ["Entreprise de 180 salariés, CA de 30 M€ : catégorie ?", "PME (moins de 250 salariés et CA ≤ 50 M€ ou bilan ≤ 43 M€).", "ue7-103", "Décret n° 2008-1354 du 18/12/2008 (critères de la LME)", "calc"],
  ["Entreprise de 300 salariés, CA de 400 M€ : catégorie ?", "ETI (moins de 5 000 salariés et CA ≤ 1,5 Md€ ou bilan ≤ 2 Md€).", "ue7-103", "Décret n° 2008-1354 du 18/12/2008 (critères de la LME)", "calc"],
  ["Notre CA sur le marché : 20 M€ ; celui du leader : 40 M€. Part de marché relative ?", "20 ÷ 40 = 0,5 : inférieure à 1, on n'est pas leader (le leader aurait une part relative > 1).", "ue7-17", null, "calc"],
  ["Marché de 10 M€ qui passe à 11,5 M€ : taux de croissance ?", "(11,5 − 10) ÷ 10 = 15 % : marché à forte croissance.", "ue7-17", null, "calc"],
  ["Activité : croissance du marché 15 %, part de marché relative 0,4 : catégorie BCG ?", "Dilemme (point d'interrogation) : forte croissance, part relative faible (seuils usuels : 10 % et 1).", "ue7-17", null, "calc"],
  ["Activité : croissance du marché 3 %, part de marché relative 1,8 : catégorie BCG ?", "Vache à lait : faible croissance, part relative forte.", "ue7-17", null, "calc"],
  ["PERT : A (3 j) puis B (4 j) et C (6 j) en parallèle, puis D (2 j) après B et C. Durée du projet ?", "Chemin critique A–C–D = 3 + 6 + 2 = 11 jours.", "ue7-154", null, "calc"],
  ["Même projet : marge libre (marge sur B) ?", "B se termine au jour 7, C au jour 9 : B a une marge de 2 jours.", "ue7-154", null, "calc"],
  ["120 jours d'absence sur l'année pour 50 salariés qui devraient travailler 220 jours : taux d'absentéisme ?", "120 ÷ (50 × 220) = 1,09 %.", "ue7-146", null, "calc"],
  ["Effectif moyen 50, 6 entrées et 4 sorties : taux de rotation (turn-over) ?", "((6 + 4) ÷ 2) ÷ 50 = 10 % (formule usuelle ; vérifie celle de ton cours).", "ue7-146", null, "calc"],
  ["Dépenses de formation 30 000 €, masse salariale 1 500 000 € : taux d'effort de formation ?", "30 000 ÷ 1 500 000 = 2 % de la masse salariale.", "ue7-146", null, "calc"],
  ["1 200 unités produites par 8 salariés : productivité apparente du travail ?", "1 200 ÷ 8 = 150 unités par salarié.", "ue7-151", null, "calc"],
  ["Entreprise de 10 salariés : CSE obligatoire ? Et de 11 salariés pendant 12 mois consécutifs ?", "10 salariés : non ; 11 salariés sur 12 mois consécutifs : oui (attributions élargies à partir de 50).", "ue7-147", null, "calc"],
  ["Sanction maximale RGPD pour un CA mondial de 1 Md€ (plafond 20 M€ ou 4 % du CA, le plus élevé) ?", "4 % × 1 Md€ = 40 M€ > 20 M€ : plafond de 40 M€.", "ue7-157", "Règlement (UE) 2016/679, applicable depuis le 25/05/2018", "calc"]
]);

// ===== Cartes à trous =====
DCG_CLOZE(7, [
  ["Taylor : l'{{OST}} repose sur la division horizontale et verticale du travail, l'étude des temps et mouvements et le salaire au rendement.", "ue7-01"],
  ["Fayol décrit les fonctions de l'entreprise (technique, commerciale, financière, sécurité, comptable, {{administrative}}).", "ue7-02"],
  ["Weber décrit la {{bureaucratie}} rationnelle-légale : règles écrites, hiérarchie, spécialisation, impersonnalité.", "ue7-03"],
  ["Mayo, à Hawthorne, met en évidence l'importance des facteurs {{humains}} et du groupe sur la performance.", "ue7-04"],
  ["Maslow hiérarchise cinq niveaux de besoins : physiologiques, {{sécurité}}, appartenance, estime, {{accomplissement}}.", "ue7-05"],
  ["Herzberg distingue les facteurs d'{{hygiène}} (qui évitent l'insatisfaction) et les facteurs de {{motivation}}.", "ue7-06"],
  ["Pour McGregor, la théorie {{X}} suppose que l'individu évite le travail ; la théorie {{Y}} qu'il peut s'investir.", "ue7-07"],
  ["Mintzberg décrit cinq composantes : sommet stratégique, ligne hiérarchique, centre opérationnel, {{technostructure}}, fonctions de support logistique.", "ue7-08"],
  ["Les cinq configurations de Mintzberg : structure simple, bureaucratie {{mécaniste}}, bureaucratie {{professionnelle}}, divisionnalisée, adhocratie.", "ue7-09"],
  ["Les 5 forces de Porter : rivalité, nouveaux entrants, {{substituts}}, pouvoir des clients, pouvoir des {{fournisseurs}}.", "ue7-13"],
  ["Le PESTEL : Politique, {{Économique}}, Socioculturel, Technologique, {{Écologique}}, Légal.", "ue7-12"],
  ["La chaîne de valeur de Porter distingue les activités {{principales}} et les activités de {{soutien}}.", "ue7-14"],
  ["Le SWOT croise les forces et faiblesses (diagnostic {{interne}}) avec les opportunités et menaces (diagnostic {{externe}}).", "ue7-16"],
  ["Dans la matrice BCG, la {{vache à lait}} a une forte part relative et une faible croissance.", "ue7-17"],
  ["Porter distingue trois stratégies génériques : domination par les {{coûts}}, {{différenciation}} et concentration (focalisation).", "ue7-18"],
  ["Ansoff : {{pénétration}}, développement de marché, développement de produit, {{diversification}}.", "ue7-19"],
  ["La croissance peut être {{interne}}, {{externe}} (acquisition, fusion) ou conjointe (alliance, partenariat).", "ue7-20"],
  ["L'{{externalisation}} consiste à confier une activité à un prestataire extérieur.", "ue7-21"],
  ["Mintzberg distingue la stratégie {{délibérée}} et la stratégie {{émergente}}.", "ue7-119"],
  ["Le business model canvas comporte {{9}} blocs (Osterwalder).", "ue7-124"],
  ["La stratégie d'océan {{bleu}} crée un espace de marché sans concurrence (Kim et Mauborgne).", "ue7-123"],
  ["Porter et Kramer : la création de valeur {{partagée}} lie performance économique et progrès social.", "ue7-128"],
  ["La {{coopétition}} associe coopération et compétition entre concurrents.", "ue7-127"],
  ["Une structure {{matricielle}} repose sur un double rattachement hiérarchique, source de conflits d'autorité.", "ue7-22"],
  ["La délégation transfère une partie des {{pouvoirs}} au subordonné, qui reste responsable devant son supérieur.", "ue7-131"],
  ["Schein distingue trois niveaux de culture : artefacts, valeurs {{affichées}}, {{présupposés}} de base.", "ue7-23"],
  ["French et Raven distinguent cinq bases du pouvoir : de récompense, de coercition, légitime, de référence, d'{{expertise}}.", "ue7-24"],
  ["Tuckman : formation, tensions, {{normalisation}}, {{performance}}, puis dissolution.", "ue7-138"],
  ["Thomas-Kilmann : compétition, accommodation, évitement, {{compromis}}, {{collaboration}}.", "ue7-140"],
  ["Lewin : {{décristallisation}}, changement, {{recristallisation}}.", "ue7-27"],
  ["Pour Simon, la rationalité des décideurs est {{limitée}} : ils recherchent une solution satisfaisante et non optimale.", "ue7-26"],
  ["La {{GEPP}} (ex-GPEC) anticipe les besoins en emplois et compétences de l'organisation.", "ue7-29"],
  ["Le CSE est obligatoire à partir de {{11}} salariés ; ses attributions sont élargies à partir de {{50}}.", "ue7-147"],
  ["Les risques {{psychosociaux}} (stress, harcèlement, violences) relèvent de l'obligation de sécurité de l'employeur.", "ue7-148"],
  ["Le diagramme de {{Gantt}} planifie les tâches dans le temps ; le {{PERT}} identifie le chemin critique.", "ue7-154"],
  ["L'ISO {{9001}} porte sur la qualité, l'ISO {{14001}} sur l'environnement, l'ISO {{45001}} sur la santé et sécurité au travail.", "ue7-153"],
  ["Le {{RGPD}} protège les données personnelles ; la CNIL est l'autorité de contrôle en France.", "ue7-157"],
  ["Le {{DPO}} (délégué à la protection des données) conseille et contrôle la conformité au RGPD.", "ue7-157"],
  ["L'AI Act classe les systèmes d'IA selon une approche par les {{risques}}.", "ue7-161"],
  ["Les 5 composantes du COSO : environnement de contrôle, évaluation des risques, activités de contrôle, information-communication, {{pilotage}}.", "ue7-163"],
  ["La loi {{PACTE}} (2019) a modifié l'intérêt social (art. 1833 C. civ.) et créé la société à mission.", "ue7-108"],
  ["La {{RSE}} est la prise en compte volontaire des enjeux sociaux et environnementaux dans la stratégie et les activités de l'entreprise.", "ue7-107"],
  ["Les {{ODD}} sont 17 objectifs de développement durable fixés par l'ONU à l'horizon 2030.", "ue7-109"],
  ["Le devoir de {{vigilance}} (loi du 27 mars 2017) impose un plan de vigilance aux très grandes sociétés.", "ue7-166"],
  ["La {{théorie de l'agence}} décrit le conflit d'intérêts entre actionnaires (mandants) et dirigeants (mandataires).", "ue7-31"],
  ["Les parties prenantes (stakeholders) sont les individus ou groupes qui influencent l'organisation ou sont influencés par elle ; le terme est popularisé par {{Freeman}}.", "ue7-105"]
]);

// ===== Méthode et lexique =====
DCG_FLASH(7, [
  ["Méthode : étude de cas de management, comment procéder ?", "Lire le sujet et les annexes en entier ; repérer le contexte de l'organisation ; répondre à chaque question dans l'ordre ; s'appuyer sur des éléments précis du dossier ET sur des notions du cours ; conclure chaque réponse.", "ue7-169", null, "ecr"],
  ["Méthode : rédiger une note ou une dissertation de management ?", "Introduction (accroche, définition, problématique, annonce du plan), développement en 2 ou 3 parties équilibrées avec exemples, transitions, conclusion (réponse + ouverture). Argumenter plutôt que lister.", "ue7-169", null, "ecr"],
  ["Méthode : faire un diagnostic stratégique ?", "Diagnostic externe (PESTEL, 5 forces, FCS), diagnostic interne (chaîne de valeur, ressources et compétences, portefeuille d'activités), synthèse (SWOT), puis options stratégiques et critères de choix.", "ue7-32", null, "ecr"],
  ["Méthode : analyser une structure organisationnelle ?", "Identifier le mode de regroupement (fonction, produit, zone), le degré de centralisation, les mécanismes de coordination (Mintzberg), la configuration dominante et les limites en lien avec la stratégie et l'environnement.", "ue7-22", null, "ecr"],
  ["Méthode : conduire un projet de changement ?", "Diagnostic et urgence, vision, mobilisation des acteurs (Kotter), communication, formation, résultats rapides, consolidation ; anticiper les résistances (peur, perte de pouvoir, incompréhension).", "ue7-144", null, "ecr"],
  ["Méthode : citer des auteurs sans les réciter ?", "Un auteur doit servir l'argument : le nommer, résumer l'idée en une phrase, la relier aux faits du dossier, puis montrer sa pertinence ou ses limites.", "ue7-169", null, "ecr"],
  ["Qu'est-ce qu'une organisation (au sens du management) ?", "Ensemble structuré de personnes et de moyens coordonnés pour atteindre des objectifs communs, avec une division du travail, une coordination et une autorité.", "ue7-101"],
  ["Différence entre efficacité et efficience ?", "Efficacité : atteindre les objectifs fixés. Efficience : atteindre les objectifs avec le minimum de ressources (rapport résultats/moyens).", "ue7-106"],
  ["Qu'est-ce que la gouvernance d'entreprise ?", "Ensemble des mécanismes qui répartissent les pouvoirs et contrôlent les dirigeants : conseil d'administration, assemblées, comités, auditeurs, transparence.", "ue7-110"],
  ["Qu'est-ce qu'une compétence distinctive ?", "Ressource ou savoir-faire rare, difficile à imiter, source d'avantage concurrentiel durable (cadre VRIO / ressources de Barney).", "ue7-15"],
  ["Qu'est-ce qu'un avantage concurrentiel ?", "Atout qui permet à l'entreprise de se démarquer durablement de ses concurrents (coûts plus bas ou différenciation).", "ue7-18"],
  ["Qu'est-ce qu'un facteur clé de succès (FCS) ?", "Élément indispensable pour réussir dans un secteur donné (ex. réseau de distribution, innovation, coût).", "ue7-120"],
  ["Qu'est-ce qu'une barrière à l'entrée ?", "Obstacle qui limite l'arrivée de nouveaux concurrents : économies d'échelle, capital requis, réglementation, marque, accès à la distribution.", "ue7-13"],
  ["Qu'est-ce que la centralisation ?", "Concentration du pouvoir de décision au sommet de la hiérarchie. La décentralisation répartit ce pouvoir entre les niveaux.", "ue7-131"],
  ["Qu'est-ce que la technostructure ?", "Composante de Mintzberg qui standardise le travail des autres (analystes, planificateurs, contrôleurs de gestion).", "ue7-08"],
  ["Qu'est-ce que le lean management ?", "Démarche d'amélioration continue visant à éliminer les gaspillages (muda) et à créer de la valeur pour le client : flux tendus, juste-à-temps, kaizen.", "ue7-116"],
  ["Qu'est-ce que le kaizen ?", "Amélioration continue par petites étapes impliquant tous les salariés (philosophie japonaise, toyotisme).", "ue7-116"],
  ["Qu'est-ce que la motivation intrinsèque et extrinsèque ?", "Intrinsèque : l'activité est source de plaisir ou d'intérêt (autonomie, sens). Extrinsèque : motivation par une récompense externe (salaire, prime).", "ue7-137"],
  ["Qu'est-ce que le leadership ?", "Capacité à influencer et mobiliser un groupe vers un objectif. Styles : autocratique, démocratique, laisser-faire ; ou directif, persuasif, participatif, délégatif (Hersey et Blanchard).", "ue7-25"],
  ["Qu'est-ce que l'empowerment ?", "Donner aux salariés plus d'autonomie, de moyens et de responsabilités pour décider et agir.", "ue7-133"],
  ["Qu'est-ce que la QVCT ?", "Qualité de vie et des conditions de travail : démarche qui associe santé, organisation du travail, relations et sens du travail pour améliorer le bien-être et la performance.", "ue7-148"],
  ["Qu'est-ce que la GEPP ?", "Gestion des emplois et des parcours professionnels (ex-GPEC) : anticiper les évolutions des emplois et compétences et accompagner les parcours.", "ue7-29"],
  ["Qu'est-ce que l'asymétrie d'information ?", "Situation où une partie (le dirigeant, le vendeur) détient plus d'informations que l'autre : source du problème d'agence et du besoin de contrôle.", "ue7-31"],
  ["Qu'est-ce que le greenwashing ?", "Pratique qui consiste à communiquer de façon trompeuse sur ses engagements environnementaux ; il est réprimé comme pratique commerciale trompeuse.", "ue7-168"]
]);

// ===== QCM supplémentaires =====
window.DCG_QCM.push(
  { id: 'q-ue7-150', ue: 7, q: "Une entreprise de 180 salariés réalise 30 M€ de chiffre d'affaires. Elle est :", choices: ["Une microentreprise", "Une PME", "Une ETI", "Une grande entreprise"], answer: 1, expl: "PME : moins de 250 salariés et CA ≤ 50 M€ ou bilan ≤ 43 M€." },
  { id: 'q-ue7-151', ue: 7, q: "Pour la matrice BCG, une activité à forte croissance mais à faible part de marché relative est :", choices: ["Une vedette", "Une vache à lait", "Un dilemme", "Un poids mort"], answer: 2, expl: "Dilemme (ou point d'interrogation) : marché porteur mais position faible, qui exige des investissements." },
  { id: 'q-ue7-152', ue: 7, q: "Projet : A (3 j) puis B (4 j) et C (6 j) en parallèle, puis D (2 j). La durée minimale du projet est de :", choices: ["9 jours", "11 jours", "13 jours", "15 jours"], answer: 1, expl: "Chemin critique A–C–D = 3 + 6 + 2 = 11 jours ; B dispose de 2 jours de marge." },
  { id: 'q-ue7-153', ue: 7, q: "Selon Herzberg, quels facteurs évitent l'insatisfaction sans motiver réellement ?", choices: ["Les facteurs de motivation", "Les facteurs d'hygiène", "Les besoins d'accomplissement", "Les facteurs intrinsèques"], answer: 1, expl: "Hygiène (salaire, conditions de travail) : évitent l'insatisfaction ; motivation (reconnaissance, responsabilités) : créent la satisfaction." },
  { id: 'q-ue7-154', ue: 7, q: "Un plan de changement qui commence par créer le sentiment d'urgence et former une coalition renvoie au modèle de :", choices: ["Lewin", "Kotter", "Tuckman", "Ansoff"], answer: 1, expl: "Kotter : 8 étapes, la première étant l'urgence puis la coalition ; Lewin n'a que 3 étapes." },
  { id: 'q-ue7-155', ue: 7, q: "Le conflit d'intérêts entre actionnaires et dirigeants, lié à l'asymétrie d'information, relève de :", choices: ["La théorie des parties prenantes", "La théorie de l'agence", "La théorie de la contingence", "La théorie des besoins"], answer: 1, expl: "Théorie de l'agence (Jensen et Meckling, 1976) : mandants et mandataires ; solutions : contrôle et incitations." }
);
