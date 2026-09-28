# InnoDeck

**Un jeu de 70 cartes pour animer vos sessions de Design Thinking, la résolution de problèmes Lean et vos rituels d'équipe agile.**

InnoDeck est un outil de facilitation au format carte (10 x 15 cm), conçu pour rendre les ateliers d'innovation accessibles, concrets et engageants. Inspirée de l'univers des jeux de cartes à collectionner, chaque carte guide les participants pas à pas à travers les phases du Design Thinking et les méthodes Lean.

---

## Le deck

| Type | Quantité | Description |
|------|----------|-------------|
| **Exercices créatifs** | 26 cartes | Méthodes de créativité, de résolution de problèmes et d'animation d'équipe classées par phase (Empathie, Définition, Idéation, Déblocage, Convergence, Prototypage, Rétrospective, Lean, Animation) |
| **Scénarios Vie Perso** | 20 cartes | Mises en situation du quotidien pour s'entraîner de façon ludique |
| **Scénarios Entreprise - Services** | 10 cartes | Défis professionnels dans le secteur des services |
| **Scénarios Entreprise - Industrie** | 10 cartes | Défis professionnels dans le commerce et l'industrie |

### Cartes Exercice (recto / verso)

- **Recto** : illustration de la phase, titre en version originale avec sa traduction française en sous-titre (complétée du nom japonais pour les outils d'origine japonaise comme 5 Whys ou Fishbone Diagram), badges (phase + moment du projet), métadonnées (durée, participants, difficulté), objectif
- **Verso** : titre VO et traduction en rappel, déroulé détaillé, "pourquoi ça marche", matériel nécessaire

### Cartes Scénario (recto / verso)

- **Recto** : illustration de la catégorie, titre de la mise en situation
- **Verso** : description de la situation concrète, invitation à choisir un exercice adapté

---

## Les 9 phases

| Phase | Description |
|-------|-------------|
| Empathie | Observer et comprendre les besoins réels |
| Définition | Reformuler le problème de façon actionnable |
| Idéation | Générer un maximum d'idées sans filtre |
| Déblocage | Relancer la créativité quand le groupe stagne |
| Convergence | Trier, prioriser et sélectionner les meilleures idées |
| Prototypage | Rendre les idées tangibles rapidement |
| Rétrospective | Prendre du recul et capitaliser sur l'expérience |
| Lean | Résoudre les problèmes par les faits et l'amélioration continue (5 Pourquoi, Ishikawa, A3, QRQC, Pareto) |
| Animation | Rythmer les rituels d'équipe et entretenir l'énergie du collectif (Météo d'équipe, Walk the Board) |

---

## Utilisation en atelier

1. **Choisir un scénario** : piochez une carte scénario adaptée au contexte (perso ou pro)
2. **Sélectionner un exercice** : parcourez les cartes exercice et choisissez la méthode la plus adaptée grâce aux badges de phase et de moment
3. **Animer** : retournez la carte exercice et suivez le déroulé au verso
4. **Itérer** : enchaînez les exercices pour couvrir différentes phases du Design Thinking

---

## Contenu de ce dépôt

Ce dépôt public héberge uniquement les livrables prêts à l'emploi : ce README et les PDF finaux. La chaîne de génération (données JSON, HTML, scripts Node.js/Puppeteer, illustrations sources) est développée dans un environnement privé et n'est pas publiée ici.

```
InnoDeck/
  README.md
  PRODUCTION/
    V_ecran/pdf/            # Variante fond sombre premium (référence écran)
      10x15/                  # 70 PDF au format carte (100 x 150 mm), un par carte
      a4/                     # 35 PDF A4 paysage (doublettes avec marques de coupe)
    V_impression/pdf/       # Variante fond clair, économe en encre (impression maison)
      10x15/                  # 70 PDF au format carte (100 x 150 mm), un par carte
      a4/                     # 35 PDF A4 paysage (doublettes avec marques de coupe)
```

---

## Deux variantes

- **V_ecran** : fond sombre navy, texte doré. Pensée pour une lecture à l'écran ou une impression professionnelle en couleur.
- **V_impression** : même contenu, fond clair. Pensée pour l'impression maison (bien moins d'encre consommée sur les grands aplats), avec les bandeaux de phase et de catégorie qui restent sombres pour la lisibilité.

## Impression

Deux formats sont disponibles pour chaque variante, dans `PRODUCTION/V_ecran/pdf/` et `PRODUCTION/V_impression/pdf/` :

- **10x15/** : un PDF par carte, prêt pour impression directe sur papier 10 x 15 cm (services d'impression en ligne ou imprimante photo)
- **a4/** : deux cartes par page A4 paysage avec marques de coupe, pour impression maison recto-verso

---

## Licence

Projet personnel de Flavien (Dragamig). Tous droits réservés.
