# Fiche Projet — InnoDeck

## Informations générales

| Champ | Valeur |
|-------|--------|
| **Nom** | InnoDeck |
| **Type** | Produit physique / Outil de facilitation |
| **Porteur** | Flavien (Dragamig) |
| **Date de début** | 2026-02-09 |
| **Statut** | En cours — POC |
| **Repo** | https://github.com/Flavien-Dragamig/InnoDeck |

---

## Objectif

Créer un jeu de 56 cartes Bristol (10x15 cm) pour animer des sessions de créativité en Design Thinking. Le jeu doit être prêt à imprimer (POC) et utilisable immédiatement en atelier.

**Critères de succès :**
- 56 cartes designées et imprimables
- Identité visuelle forte (style Magic: The Gathering)
- Système de badges clair permettant un choix rapide en atelier
- PDF prêts pour impression maison ou service en ligne

---

## Contexte

Les ateliers de Design Thinking nécessitent des outils tangibles pour guider les participants. Les supports existants sont souvent trop corporate, peu engageants visuellement, ou nécessitent une formation préalable. InnoDeck propose un format carte ludique et immersif qui :
- Permet de choisir un exercice en un coup d'oeil (recto)
- Guide l'animation pas à pas (verso)
- Propose des mises en situation concrètes pour s'entraîner

---

## Périmètre

### Inclus (POC)
- 16 cartes exercices créatifs
- 20 cartes mises en situation vie perso
- 20 cartes mises en situation entreprise (10 services + 10 commerce/industrie)
- Système de badges par phase Design Thinking + moment projet
- Identité visuelle style Magic: The Gathering
- Templates HTML/CSS pour chaque type de carte
- PDF prêts à imprimer (A4 recto-verso + format 10x15 direct)

### Exclu (POC)
- Cartes templates d'ateliers (Partie 4 du contenu source — potentiel v2)
- Cartes règles d'animation (potentiel v2)
- Illustrations custom par carte (POC = design graphique CSS uniquement)
- Boîte / packaging
- Application mobile compagnon
- Vente en ligne

---

## Stack technique

| Composant | Choix |
|-----------|-------|
| **Design** | HTML/CSS (style Magic) |
| **Données** | JSON (parsé depuis Markdown source) |
| **Génération** | Node.js (scripts de génération) |
| **Impression** | PDF via navigateur (Ctrl+P) |
| **Versioning** | Git + GitHub (privé) |

---

## Contenu source

| Type | Quantité | Source |
|------|----------|--------|
| Exercices créatifs | 16 | SOURCES/exercices-creativite-design-thinking.md (Partie 1) |
| Scénarios vie perso | 20 | Idem (Partie 2) |
| Scénarios entreprise | 20 | Idem (Partie 3) |
| Templates ateliers | 7 | Idem (Partie 4) — réservé v2 |

---

## Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Texte trop long pour le verso 10x15 | Haute | Moyenne | Adapter la taille de police, résumer si nécessaire |
| Rendu impression différent de l'écran | Moyenne | Haute | Tester impression dès les premières maquettes |
| Alignement recto-verso imprécis | Moyenne | Moyenne | Marques de coupe + test sur imprimante réelle |

---

## Liens

- [Repo GitHub](https://github.com/Flavien-Dragamig/InnoDeck)
- [Contenu source](../../SOURCES/exercices-creativite-design-thinking.md)
- [Plan d'implémentation](../../.claude/plans/greedy-pondering-nebula.md)
