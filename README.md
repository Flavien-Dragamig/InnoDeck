# InnoDeck

**Un jeu de 61 cartes pour animer vos sessions de Design Thinking et de résolution de problèmes Lean.**

InnoDeck est un outil de facilitation au format carte (10 x 15 cm), conçu pour rendre les ateliers d'innovation accessibles, concrets et engageants. Inspirée de l'univers des jeux de cartes à collectionner, chaque carte guide les participants pas à pas à travers les phases du Design Thinking et les méthodes Lean.

---

## Le deck

| Type | Quantité | Description |
|------|----------|-------------|
| **Exercices créatifs** | 21 cartes | Méthodes de créativité et de résolution de problèmes classées par phase (Empathie, Définition, Idéation, Déblocage, Convergence, Prototypage, Rétrospective, Lean) |
| **Scénarios Vie Perso** | 20 cartes | Mises en situation du quotidien pour s'entraîner de façon ludique |
| **Scénarios Entreprise - Services** | 10 cartes | Défis professionnels dans le secteur des services |
| **Scénarios Entreprise - Industrie** | 10 cartes | Défis professionnels dans le commerce et l'industrie |

### Cartes Exercice (recto / verso)

- **Recto** : illustration de la phase, titre, badges (phase + moment du projet), métadonnées (durée, participants, difficulté), objectif
- **Verso** : déroulé détaillé, "pourquoi ça marche", matériel nécessaire

### Cartes Scénario (recto / verso)

- **Recto** : illustration de la catégorie, titre de la mise en situation
- **Verso** : description de la situation concrète, invitation à choisir un exercice adapté

---

## Les 8 phases

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

---

## Utilisation en atelier

1. **Choisir un scénario** : piochez une carte scénario adaptée au contexte (perso ou pro)
2. **Sélectionner un exercice** : parcourez les cartes exercice et choisissez la méthode la plus adaptée grâce aux badges de phase et de moment
3. **Animer** : retournez la carte exercice et suivez le déroulé au verso
4. **Itérer** : enchaînez les exercices pour couvrir différentes phases du Design Thinking

---

## Structure du projet

```
InnoDeck/
  data/                  # Données JSON (exercices, scénarios)
  cards/
    css/                 # Styles des cartes (variables, base, exercice, scénario)
    assets/              # Illustrations, badges, icônes, textures
  scripts/               # Scripts de génération (HTML, PDF 10x15, PDF A4)
  PRODUCTION/V1/         # Fichiers générés prêts à imprimer
    html/                # 122 fichiers HTML (recto + verso)
    pdf/10x15/           # 61 PDF au format carte (100 x 150 mm)
    pdf/a4/              # 31 PDF A4 paysage (doublettes avec marques de coupe)
  SOURCES/               # Contenu source et illustrations originales
```

---

## Génération des cartes

```bash
# Installer les dépendances
npm install

# Générer HTML + PDF 10x15 + PDF A4
npm run generate

# Ou séparément
npm run generate:html
npm run generate:pdf
npm run generate:pdf-a4
```

---

## Impression

Deux formats sont disponibles dans `PRODUCTION/V1/pdf/` :

- **10x15/** : un PDF par carte, prêt pour impression directe sur papier 10 x 15 cm (services d'impression en ligne ou imprimante photo)
- **a4/** : deux cartes par page A4 paysage avec marques de coupe, pour impression maison recto-verso

---

## Stack technique

- **Design** : HTML / CSS (rendu visuel style carte à collectionner)
- **Données** : JSON
- **Génération** : Node.js + Puppeteer (HTML vers PDF)
- **Versioning** : Git + GitHub

---

## Licence

Projet personnel de Flavien (Dragamig). Tous droits réservés.
