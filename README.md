# InnoDeck

**Un jeu de 56 cartes pour animer vos sessions de Design Thinking.**

InnoDeck est un outil de facilitation au format carte (10 x 15 cm), concu pour rendre les ateliers d'innovation accessibles, concrets et engageants. Inspiree de l'univers des jeux de cartes a collectionner, chaque carte guide les participants pas a pas a travers les phases du Design Thinking.

---

## Le deck

| Type | Quantite | Description |
|------|----------|-------------|
| **Exercices creatifs** | 16 cartes | Methodes de creativite classees par phase (Empathie, Definition, Ideation, Deblocage, Convergence, Prototypage, Retrospective) |
| **Scenarios Vie Perso** | 20 cartes | Mises en situation du quotidien pour s'entrainer de facon ludique |
| **Scenarios Entreprise - Services** | 10 cartes | Defis professionnels dans le secteur des services |
| **Scenarios Entreprise - Industrie** | 10 cartes | Defis professionnels dans le commerce et l'industrie |

### Cartes Exercice (recto / verso)

- **Recto** : illustration de la phase, titre, badges (phase + moment du projet), metadonnees (duree, participants, difficulte), objectif
- **Verso** : deroule detaille, "pourquoi ca marche", materiel necessaire

### Cartes Scenario (recto / verso)

- **Recto** : illustration de la categorie, titre de la mise en situation
- **Verso** : description de la situation concrete, invitation a choisir un exercice adapte

---

## Les 7 phases du Design Thinking

| Phase | Description |
|-------|-------------|
| Empathie | Observer et comprendre les besoins reels |
| Definition | Reformuler le probleme de facon actionnable |
| Ideation | Generer un maximum d'idees sans filtre |
| Deblocage | Relancer la creativite quand le groupe stagne |
| Convergence | Trier, prioriser et selectionner les meilleures idees |
| Prototypage | Rendre les idees tangibles rapidement |
| Retrospective | Prendre du recul et capitaliser sur l'experience |

---

## Utilisation en atelier

1. **Choisir un scenario** : piochez une carte scenario adaptee au contexte (perso ou pro)
2. **Selectionner un exercice** : parcourez les cartes exercice et choisissez la methode la plus adaptee grace aux badges de phase et de moment
3. **Animer** : retournez la carte exercice et suivez le deroule au verso
4. **Iterer** : enchainez les exercices pour couvrir differentes phases du Design Thinking

---

## Structure du projet

```
InnoDeck/
  data/                  # Donnees JSON (exercices, scenarios)
  cards/
    css/                 # Styles des cartes (variables, base, exercice, scenario)
    assets/              # Illustrations, badges, icones, textures
  scripts/               # Scripts de generation (HTML, PDF 10x15, PDF A4)
  PRODUCTION/V1/         # Fichiers generes prets a imprimer
    html/                # 112 fichiers HTML (recto + verso)
    pdf/10x15/           # 56 PDF au format carte (100 x 150 mm)
    pdf/a4/              # 28 PDF A4 paysage (doublettes avec marques de coupe)
  SOURCES/               # Contenu source et illustrations originales
```

---

## Generation des cartes

```bash
# Installer les dependances
npm install

# Generer HTML + PDF 10x15 + PDF A4
npm run generate

# Ou separement
npm run generate:html
npm run generate:pdf
npm run generate:pdf-a4
```

---

## Impression

Deux formats sont disponibles dans `PRODUCTION/V1/pdf/` :

- **10x15/** : un PDF par carte, pret pour impression directe sur papier 10 x 15 cm (services d'impression en ligne ou imprimante photo)
- **a4/** : deux cartes par page A4 paysage avec marques de coupe, pour impression maison recto-verso

---

## Stack technique

- **Design** : HTML / CSS (rendu visuel style carte a collectionner)
- **Donnees** : JSON
- **Generation** : Node.js + Puppeteer (HTML vers PDF)
- **Versioning** : Git + GitHub

---

## Licence

Projet personnel de Flavien (Dragamig). Tous droits reserves.
