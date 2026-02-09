# Prompts Midjourney v7 — Illustrations InnoDeck

> **Ratio 4:3** = zone illustration de la carte (100mm × 75mm). L'image sera affichée en `object-fit: cover` donc sujet centré.

## Paramètres communs

```
--ar 4:3 --style raw --s 350 --exp 15 --no text watermark frame border signature letters words
```

- `--style raw` : rendu pictural sans le biais esthétique par défaut de MJ
- `--s 350` : stylisation modérée-haute, bon équilibre fidélité/artistique
- `--exp 15` : profondeur tonale et éclairage dramatique sans excès
- `--no` : supprime tout texte parasite et cadres indésirables

**Workflow** : générer en `--draft` d'abord, puis relancer les meilleurs avec `--q 4 --exp 25` pour le rendu final.

---

## Exercices — Par phase Design Thinking

### 1. Empathie
```
A mystical seer gazing into a luminous crystal orb reflecting dozens of human faces and emotions, deep blue atmosphere with ethereal glow, soft volumetric lighting from the orb illuminating the scene, empathy and deep understanding symbolism, collectible card game illustration, digital painting, rich jewel-tone palette --ar 4:3 --style raw --s 350 --exp 15 --no text watermark frame border signature letters words
```

### 2. Définition
```
A hooded scholar drawing a glowing arcane target symbol on an ancient world map with a golden compass, purple magical energy radiating from the compass point, scattered scrolls and instruments of precision, dramatic rim lighting, focus and clarity symbolism, collectible card game illustration, digital painting, rich jewel-tone palette --ar 4:3 --style raw --s 350 --exp 15 --no text watermark frame border signature letters words
```

### 3. Idéation
```
A storm of brilliant orange lightning bolts erupting from a massive open spellbook, sparks transforming into dozens of floating glowing orbs and crystallized ideas, creative explosion against a dark background, dramatic backlight, energy and divergent thinking symbolism, collectible card game illustration, digital painting, warm vibrant palette --ar 4:3 --style raw --s 350 --exp 15 --no text watermark frame border signature letters words
```

### 4. Déblocage
```
A powerful crimson flame shattering heavy iron chains and ancient locks, fragments of broken walls flying outward, liberation energy radiating in all directions, dramatic chiaroscuro lighting, breakthrough and freedom symbolism, collectible card game illustration, digital painting, intense red and gold palette --ar 4:3 --style raw --s 350 --exp 15 --no text watermark frame border signature letters words
```

### 5. Convergence
```
A gauntleted hand holding a brilliant emerald diamond that focuses dozens of scattered beams of colored light into a single powerful concentrated ray, selection and clarity symbolism, dark background with dramatic green glow, cinematic lighting, collectible card game illustration, digital painting, deep green and gold palette --ar 4:3 --style raw --s 350 --exp 15 --no text watermark frame border signature letters words
```

### 6. Prototypage
```
A master craftsman workbench covered with magical copper gears and clockwork mechanisms assembling themselves mid-air, glowing blueprints coming to life as miniature constructions, warm workshop atmosphere, golden hour lighting from a forge, building and testing symbolism, collectible card game illustration, digital painting, warm copper and bronze palette --ar 4:3 --style raw --s 350 --exp 15 --no text watermark frame border signature letters words
```

### 7. Rétrospective
```
A golden compass rose floating above an ancient open journal, luminous pages turning by themselves revealing illustrated past journeys, soft golden particles rising upward, wisdom and reflection symbolism, warm dramatic lighting, collectible card game illustration, digital painting, gold and amber palette --ar 4:3 --style raw --s 350 --exp 15 --no text watermark frame border signature letters words
```

---

## Scénarios — Par catégorie

### 8. Vie Perso
```
A cozy enchanted cottage kitchen interior bathed in warm indigo and amber light, everyday household objects floating and rearranging themselves magically, a glowing hearth in the background, daily life reimagined through a fantasy lens, intimate atmosphere, volumetric lighting, collectible card game illustration, digital painting, warm indigo and gold palette --ar 4:3 --style raw --s 350 --exp 15 --no text watermark frame border signature letters words
```

### 9. En Entreprise — Services
```
A grand burgundy-draped council chamber with floating luminous scrolls and quills writing by themselves, figures gathered around a glowing round table in discussion, service and professional collaboration symbolism, dramatic overhead lighting casting long shadows, collectible card game illustration, digital painting, deep burgundy and gold palette --ar 4:3 --style raw --s 350 --exp 15 --no text watermark frame border signature letters words
```

### 10. En Entreprise — Commerce & Industrie
```
A vast dark green industrial workshop with enchanted forges glowing emerald, magical supply chains of luminous crates and gears moving through the air on golden tracks, production and commerce symbolism, dramatic low-angle perspective, cinematic green and copper lighting, collectible card game illustration, digital painting, deep green and bronze palette --ar 4:3 --style raw --s 350 --exp 15 --no text watermark frame border signature letters words
```

---

## Instructions

1. Générer chaque image sur Midjourney avec `--draft` pour itérer rapidement
2. Choisir la meilleure variation
3. Relancer le prompt gagnant avec `--q 4 --exp 25` pour le rendu final
4. Upscale en haute résolution
5. Sauvegarder dans `cards/assets/illustrations/` avec le nommage :
   - `phase-empathie.png`
   - `phase-definition.png`
   - `phase-ideation.png`
   - `phase-deblocage.png`
   - `phase-convergence.png`
   - `phase-prototypage.png`
   - `phase-retrospective.png`
   - `cat-perso.png`
   - `cat-pro-services.png`
   - `cat-pro-industrie.png`
6. Format recommandé : PNG, ratio 4:3, minimum 1536x1152px

## Tips v7

- Utiliser `--sref` avec l'URL de la première image validée pour garder un style cohérent sur les 10 illustrations
- `--oref` si on veut un objet récurrent (ex: un symbole InnoDeck)
- `--chaos 20` pour explorer des variations plus diverses lors du draft
