/**
 * InnoDeck — Générateur de cartes HTML
 * Génère les 56 cartes (16 exercices recto/verso + 20 perso + 10 services + 10 industrie)
 */

const fs = require('fs');
const path = require('path');

// ── Chemins ──
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const CSS_DIR = path.join(ROOT, 'cards', 'css');
const ILLUS_DIR = path.join(ROOT, 'cards', 'assets', 'illustrations');
const OUTPUT_DIR = path.join(ROOT, 'PRODUCTION', 'html');

// ── Données ──
const exercises = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'exercises.json'), 'utf-8'));
const scenariosPerso = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'scenarios-perso.json'), 'utf-8'));
const scenariosPro = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'scenarios-pro.json'), 'utf-8'));

// ── CSS (inline pour fichiers autonomes) ──
const cssVariables = fs.readFileSync(path.join(CSS_DIR, 'variables.css'), 'utf-8');
const cssBase = fs.readFileSync(path.join(CSS_DIR, 'card-base.css'), 'utf-8')
  .replace("@import url('./variables.css');", ''); // déjà inclus
const cssExercise = fs.readFileSync(path.join(CSS_DIR, 'card-exercise.css'), 'utf-8');
const cssScenario = fs.readFileSync(path.join(CSS_DIR, 'card-scenario.css'), 'utf-8');

// ── SVG Icons (inline) ──
const ICONS = {
  // Phases
  empathie: '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>',
  definition: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>',
  ideation: '<path d="M7 2v11h3v9l7-12h-4l4-8z"/>',
  deblocage: '<path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>',
  convergence: '<path d="M19 3H5L2 9l10 12L22 9l-3-6zM12 17.92L5.51 10h12.98L12 17.92zM4.27 8L6.1 5h11.8l1.83 3H4.27z"/>',
  prototypage: '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>',
  retrospective: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/>',
  // Moments
  debut: '<path d="M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>',
  milieu: '<path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.8 5.6 21.2 8 14 2 9.2h7.6z"/>',
  fin: '<path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z"/>',
  tout: '<path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 10.66 9.17 8.15C8.2 7.18 6.84 6.62 5.4 6.62 2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53L12 13.34l2.83 2.51c.97.97 2.33 1.53 3.77 1.53 2.98 0 5.4-2.42 5.4-5.38s-2.42-5.38-5.4-5.38zm-13.2 8.76C3.57 15.38 2 13.87 2 12s1.57-3.38 3.4-3.38c.86 0 1.68.34 2.28.94l2.83 2.51-2.83 2.37c-.6.6-1.42.94-2.28.94zm13.2 0c-.86 0-1.68-.34-2.28-.94l-2.83-2.51 2.83-2.37c.6-.6 1.42-.94 2.28-.94 1.83 0 3.4 1.51 3.4 3.38s-1.57 3.38-3.4 3.38z"/>',
  // Méta
  time: '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>',
  participants: '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
  starFilled: '<path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.8 5.6 21.2 8 14 2 9.2h7.6z"/>',
  starEmpty: '<path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.8 5.6 21.2 8 14 2 9.2h7.6z"/>',
  // Catégories
  home: '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>',
  briefcase: '<path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4C8.9 3 8 3.9 8 5v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z"/>',
  industry: '<path d="M2 20h20v2H2v-2zm1-1h4V7H3v12zm6 0h4V4H9v15zm6 0h4v-8h-4v8z"/>',
};

// ── Labels moments ──
const MOMENT_LABELS = {
  debut: 'Début',
  milieu: 'Milieu',
  fin: 'Fin',
  tout: 'Tout moment'
};

// ── Mapping phase → illustration ──
const PHASE_ILLUSTRATIONS = {
  empathie: 'phase-empathie.png',
  definition: 'phase-definition.png',
  ideation: 'phase-ideation.png',
  deblocage: 'phase-deblocage.png',
  convergence: 'phase-convergence.png',
  prototypage: 'phase-prototypage.png',
  retrospective: 'phase-retrospective.png',
};

// ── Mapping catégorie → illustration ──
const CAT_ILLUSTRATIONS = {
  perso: 'cat-perso.png',
  'pro-services': 'cat-pro-services.png',
  'pro-industrie': 'cat-pro-industrie.png',
};

// ── Mapping catégorie → icône bannière ──
const CAT_ICONS = {
  perso: 'home',
  'pro-services': 'briefcase',
  'pro-industrie': 'industry',
};

// ══════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════

function svgIcon(name, viewBox = '0 0 24 24') {
  return `<svg viewBox="${viewBox}" fill="currentColor">${ICONS[name]}</svg>`;
}

function getIllustrationBase64(filename) {
  const filePath = path.join(ILLUS_DIR, filename);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return `data:image/png;base64,${data.toString('base64')}`;
  }
  return '';
}

function starSvg(filled) {
  if (filled) {
    return `<svg viewBox="0 0 24 24" fill="#d4a44c" style="width:2.5mm;height:2.5mm">${ICONS.starFilled}</svg>`;
  }
  return `<svg viewBox="0 0 24 24" fill="none" stroke="#8a7e6b" stroke-width="1.5" style="width:2.5mm;height:2.5mm;opacity:0.3">${ICONS.starEmpty}</svg>`;
}

function difficultyStars(level) {
  return Array.from({ length: 3 }, (_, i) => starSvg(i < level)).join('\n          ');
}

function corners() {
  // Coins désactivés (display:none en CSS), mais on garde le HTML pour cohérence
  const svg = `<svg viewBox="0 0 60 60" fill="none"><path d="M2 2 C2 2, 8 2, 12 4 C16 6, 18 10, 20 16 C22 22, 20 28, 18 32" stroke="#d4a44c" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/><path d="M2 2 C2 2, 2 8, 4 12 C6 16, 10 18, 16 20 C22 22, 28 20, 32 18" stroke="#d4a44c" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/><circle cx="4" cy="4" r="1.5" fill="#d4a44c" opacity="0.6"/></svg>`;
  return ['tl', 'tr', 'bl', 'br'].map(pos =>
    `    <div class="card__corner card__corner--${pos}">${svg}</div>`
  ).join('\n');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Formatage du temps (retirer "minutes" → "min") ──
function formatTime(t) {
  return t.replace(/minutes?/gi, 'min').replace(/\s+/g, ' ').trim();
}

// ══════════════════════════════════════════
// Templates HTML
// ══════════════════════════════════════════

function htmlWrapper(title, cssType, bodyContent, illustrationBase64Map = {}) {
  const cssContent = cssType === 'exercise'
    ? `${cssVariables}\n${cssBase}\n${cssExercise}`
    : `${cssVariables}\n${cssBase}\n${cssScenario}`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>InnoDeck — ${title}</title>
  <style>${cssContent}</style>
</head>
<body>
${bodyContent}
</body>
</html>`;
}

// ── Exercice Recto ──
function exerciseFront(ex, illustrationSrc) {
  const momentBadges = ex.moments.map(m => `
        <span class="badge badge--moment">
          <span class="badge__icon">${svgIcon(m)}</span>
          ${MOMENT_LABELS[m]}
        </span>`).join('');

  return `
  <div class="card card--exercise card--${ex.phase}">
    <div class="card__background"></div>
    <div class="card__border"></div>
${corners()}

    <div class="card__inner">
      <div class="card__illustration">
        <img src="${illustrationSrc}" alt="${ex.phaseLabel}">
        <div class="card__category-banner">
          <span class="card__category-icon">${svgIcon(ex.phase)}</span>
          ${ex.phaseLabel}
        </div>
        <div class="card__illustration-overlay"></div>
      </div>

      <div class="card__title-zone">
        <h1 class="card__title">${escapeHtml(ex.title)}</h1>
      </div>

      <div class="card__badges">${momentBadges}
      </div>

      <div class="card__meta">
        <span class="card__meta-item">
          <span class="card__meta-icon">${svgIcon('time')}</span>
          ${formatTime(ex.time)}
        </span>
        <span class="card__meta-item">
          <span class="card__meta-icon">${svgIcon('participants')}</span>
          ${ex.participants}
        </span>
        <span class="card__meta-item card__difficulty">
          ${difficultyStars(ex.difficulty)}
        </span>
      </div>

      <div class="card__separator"></div>

      <div class="card__objective">
        <p>${escapeHtml(ex.objective)}</p>
      </div>

      <div class="card__footer">InnoDeck</div>
    </div>
  </div>`;
}

// ── Exercice Verso ──
function exerciseBack(ex) {
  return `
  <div class="card card--exercise card--${ex.phase} card--back">
    <div class="card__background"></div>
    <div class="card__border"></div>
${corners()}

    <div class="card__inner">
      <div class="card__back-title">${escapeHtml(ex.title)}</div>

      <div class="card__section" style="flex:2">
        <div class="card__section-title">Déroulé</div>
        <div class="card__section-content card__section-content--small">${escapeHtml(ex.process)}</div>
      </div>

      <div class="card__separator"></div>

      <div class="card__section" style="flex:1.5">
        <div class="card__section-title">Pourquoi ça marche</div>
        <div class="card__section-content card__section-content--small">${escapeHtml(ex.whyItWorks)}</div>
      </div>

      <div class="card__separator"></div>

      <div class="card__material">
        <span class="card__material-label">Matériel :</span> ${escapeHtml(ex.material)}
      </div>

      <div class="card__footer">InnoDeck</div>
    </div>
  </div>`;
}

// ── Scénario Recto (image + titre uniquement) ──
function scenarioFront(sc, illustrationSrc, number) {
  const catClass = sc.category;
  const catIconKey = CAT_ICONS[catClass] || 'home';
  const numStr = String(number).padStart(2, '0');

  return `
  <div class="card card--scenario card--${catClass} card--scenario-visual">
    <div class="card__background"></div>
    <div class="card__border"></div>
${corners()}

    <div class="card__inner">
      <div class="card__illustration card__illustration--large">
        <img src="${illustrationSrc}" alt="${escapeHtml(sc.categoryLabel)}">
        <div class="card__category-banner">
          <span class="card__category-icon">${svgIcon(catIconKey)}</span>
          ${escapeHtml(sc.categoryLabel)}
        </div>
        <div class="card__illustration-overlay card__illustration-overlay--large"></div>
      </div>

      <div class="card__title-zone card__title-zone--centered">
        <h1 class="card__title">${escapeHtml(sc.title)}</h1>
      </div>

      <div class="card__footer">InnoDeck</div>

      <span class="card__number">#${numStr}</span>
    </div>
  </div>`;
}

// ── Scénario Verso (détail + mise en situation) ──
function scenarioBack(sc, number) {
  const catClass = sc.category;
  const catIconKey = CAT_ICONS[catClass] || 'home';
  const numStr = String(number).padStart(2, '0');

  return `
  <div class="card card--scenario card--${catClass} card--back">
    <div class="card__background"></div>
    <div class="card__border"></div>
${corners()}

    <div class="card__inner">
      <div class="card__back-title">${escapeHtml(sc.title)}</div>

      <div class="card__section card__section--scenario-main">
        <div class="card__section-title">Mise en situation</div>
        <div class="card__section-content">${escapeHtml(sc.situation)}</div>
      </div>

      <div class="card__separator"></div>

      <div class="card__section card__section--scenario-hint">
        <div class="card__section-title">Objectif</div>
        <div class="card__section-content card__section-content--small">Utilisez les cartes Exercice pour résoudre ce défi ! Choisissez la méthode adaptée et appliquez-la à cette situation concrète.</div>
      </div>

      <div class="card__footer">InnoDeck</div>

      <span class="card__number">#${numStr}</span>
    </div>
  </div>`;
}

// ══════════════════════════════════════════
// Génération
// ══════════════════════════════════════════

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function generate() {
  console.log('=== InnoDeck — Génération des cartes ===\n');

  // Arborescence de sortie
  const dirs = {
    exRecto: path.join(OUTPUT_DIR, 'exercices', 'recto'),
    exVerso: path.join(OUTPUT_DIR, 'exercices', 'verso'),
    scPersoRecto: path.join(OUTPUT_DIR, 'scenarios', 'perso', 'recto'),
    scPersoVerso: path.join(OUTPUT_DIR, 'scenarios', 'perso', 'verso'),
    scProServicesRecto: path.join(OUTPUT_DIR, 'scenarios', 'pro-services', 'recto'),
    scProServicesVerso: path.join(OUTPUT_DIR, 'scenarios', 'pro-services', 'verso'),
    scProIndustrieRecto: path.join(OUTPUT_DIR, 'scenarios', 'pro-industrie', 'recto'),
    scProIndustrieVerso: path.join(OUTPUT_DIR, 'scenarios', 'pro-industrie', 'verso'),
  };
  Object.values(dirs).forEach(ensureDir);

  // Charger les illustrations en base64 pour fichiers autonomes
  console.log('Chargement des illustrations en base64...');
  const illusCache = {};
  const allIllus = { ...PHASE_ILLUSTRATIONS, ...CAT_ILLUSTRATIONS };
  for (const [key, filename] of Object.entries(allIllus)) {
    const b64 = getIllustrationBase64(filename);
    illusCache[key] = b64;
    console.log(`  ${b64 ? '✓' : '✗'} ${filename}`);
  }

  let count = 0;

  // ── Exercices ──
  console.log('\n── Exercices (16 recto + 16 verso) ──');
  for (const ex of exercises) {
    const illusSrc = illusCache[ex.phase] || '';

    // Recto
    const frontHtml = htmlWrapper(
      `${ex.title} (Recto)`,
      'exercise',
      exerciseFront(ex, illusSrc)
    );
    const frontPath = path.join(dirs.exRecto, `${ex.slug}.html`);
    fs.writeFileSync(frontPath, frontHtml, 'utf-8');
    count++;

    // Verso
    const backHtml = htmlWrapper(
      `${ex.title} (Verso)`,
      'exercise',
      exerciseBack(ex)
    );
    const backPath = path.join(dirs.exVerso, `${ex.slug}.html`);
    fs.writeFileSync(backPath, backHtml, 'utf-8');
    count++;

    console.log(`  ✓ ${ex.title}`);
  }

  // ── Scénarios Perso ──
  console.log('\n── Scénarios Vie Perso (20 recto + 20 verso) ──');
  for (let i = 0; i < scenariosPerso.length; i++) {
    const sc = scenariosPerso[i];
    const illusSrc = illusCache['perso'] || '';

    // Recto
    const frontHtml = htmlWrapper(
      `${sc.title} (Recto)`,
      'scenario',
      scenarioFront(sc, illusSrc, i + 1)
    );
    fs.writeFileSync(path.join(dirs.scPersoRecto, `${sc.slug}.html`), frontHtml, 'utf-8');
    count++;

    // Verso
    const backHtml = htmlWrapper(
      `${sc.title} (Verso)`,
      'scenario',
      scenarioBack(sc, i + 1)
    );
    fs.writeFileSync(path.join(dirs.scPersoVerso, `${sc.slug}.html`), backHtml, 'utf-8');
    count++;

    console.log(`  ✓ #${String(i + 1).padStart(2, '0')} ${sc.title}`);
  }

  // ── Scénarios Pro ──
  const proServices = scenariosPro.filter(s => s.subCategory === 'services');
  const proIndustrie = scenariosPro.filter(s => s.subCategory === 'industrie');

  console.log('\n── Scénarios En Entreprise — Services (10 recto + 10 verso) ──');
  for (let i = 0; i < proServices.length; i++) {
    const sc = proServices[i];
    const illusSrc = illusCache['pro-services'] || '';

    // Recto
    const frontHtml = htmlWrapper(
      `${sc.title} (Recto)`,
      'scenario',
      scenarioFront(sc, illusSrc, i + 1)
    );
    fs.writeFileSync(path.join(dirs.scProServicesRecto, `${sc.slug}.html`), frontHtml, 'utf-8');
    count++;

    // Verso
    const backHtml = htmlWrapper(
      `${sc.title} (Verso)`,
      'scenario',
      scenarioBack(sc, i + 1)
    );
    fs.writeFileSync(path.join(dirs.scProServicesVerso, `${sc.slug}.html`), backHtml, 'utf-8');
    count++;

    console.log(`  ✓ #${String(i + 1).padStart(2, '0')} ${sc.title}`);
  }

  console.log('\n── Scénarios En Entreprise — Commerce & Industrie (10 recto + 10 verso) ──');
  for (let i = 0; i < proIndustrie.length; i++) {
    const sc = proIndustrie[i];
    const illusSrc = illusCache['pro-industrie'] || '';

    // Recto
    const frontHtml = htmlWrapper(
      `${sc.title} (Recto)`,
      'scenario',
      scenarioFront(sc, illusSrc, i + 1)
    );
    fs.writeFileSync(path.join(dirs.scProIndustrieRecto, `${sc.slug}.html`), frontHtml, 'utf-8');
    count++;

    // Verso
    const backHtml = htmlWrapper(
      `${sc.title} (Verso)`,
      'scenario',
      scenarioBack(sc, i + 1)
    );
    fs.writeFileSync(path.join(dirs.scProIndustrieVerso, `${sc.slug}.html`), backHtml, 'utf-8');
    count++;

    console.log(`  ✓ #${String(i + 1).padStart(2, '0')} ${sc.title}`);
  }

  console.log(`\n=== ${count} fichiers HTML générés dans PRODUCTION/html/ ===`);
}

generate();
