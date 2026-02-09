/**
 * InnoDeck — Générateur PDF
 * Utilise Puppeteer pour générer les PDF à partir des données JSON
 * Les images sont référencées via file:// (pas de base64) pour éviter les crash mémoire
 *
 * Sorties :
 *   output/pdf/   — PDF par catégorie + complet
 *   output/print/ — PDF A4 avec repères de coupe
 *
 * Usage : node scripts/generate-pdf.js
 * Prérequis : node scripts/generate-cards.js (optionnel, les HTML sont pour preview navigateur)
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// ── Chemins ──
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const CSS_DIR = path.join(ROOT, 'cards', 'css');
const ILLUS_DIR = path.join(ROOT, 'cards', 'assets', 'illustrations');
const PDF_DIR = path.join(ROOT, 'output', 'pdf');
const PRINT_DIR = path.join(ROOT, 'output', 'print');
const TMP_DIR = path.join(ROOT, '.tmp-puppeteer');

// ── Données ──
const exercises = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'exercises.json'), 'utf-8'));
const scenariosPerso = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'scenarios-perso.json'), 'utf-8'));
const scenariosPro = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'scenarios-pro.json'), 'utf-8'));

// ── CSS ──
const cssVariables = fs.readFileSync(path.join(CSS_DIR, 'variables.css'), 'utf-8');
const cssBase = fs.readFileSync(path.join(CSS_DIR, 'card-base.css'), 'utf-8').replace("@import url('./variables.css');", '');
const cssExercise = fs.readFileSync(path.join(CSS_DIR, 'card-exercise.css'), 'utf-8');
const cssScenario = fs.readFileSync(path.join(CSS_DIR, 'card-scenario.css'), 'utf-8');
const allCss = `${cssVariables}\n${cssBase}\n${cssExercise}\n${cssScenario}`;

// ── Helpers ──
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatTime(t) {
  return t.replace(/minutes?/gi, 'min').replace(/\s+/g, ' ').trim();
}

function illusUrl(filename) {
  const abs = path.join(ILLUS_DIR, filename).replace(/\\/g, '/');
  return `file:///${abs}`;
}

// ── SVG Icons ──
const ICONS = {
  empathie: '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>',
  definition: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>',
  ideation: '<path d="M7 2v11h3v9l7-12h-4l4-8z"/>',
  deblocage: '<path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>',
  convergence: '<path d="M19 3H5L2 9l10 12L22 9l-3-6zM12 17.92L5.51 10h12.98L12 17.92zM4.27 8L6.1 5h11.8l1.83 3H4.27z"/>',
  prototypage: '<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>',
  retrospective: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.51-3.49L17.5 6.5 9.99 9.99 6.5 17.5zm5.5-6.6c.61 0 1.1.49 1.1 1.1s-.49 1.1-1.1 1.1-1.1-.49-1.1-1.1.49-1.1 1.1-1.1z"/>',
  debut: '<path d="M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>',
  milieu: '<path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.8 5.6 21.2 8 14 2 9.2h7.6z"/>',
  fin: '<path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6h-5.6z"/>',
  tout: '<path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 10.66 9.17 8.15C8.2 7.18 6.84 6.62 5.4 6.62 2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53L12 13.34l2.83 2.51c.97.97 2.33 1.53 3.77 1.53 2.98 0 5.4-2.42 5.4-5.38s-2.42-5.38-5.4-5.38zm-13.2 8.76C3.57 15.38 2 13.87 2 12s1.57-3.38 3.4-3.38c.86 0 1.68.34 2.28.94l2.83 2.51-2.83 2.37c-.6.6-1.42.94-2.28.94zm13.2 0c-.86 0-1.68-.34-2.28-.94l-2.83-2.51 2.83-2.37c.6-.6 1.42-.94 2.28-.94 1.83 0 3.4 1.51 3.4 3.38s-1.57 3.38-3.4 3.38z"/>',
  time: '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>',
  participants: '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
  starFilled: '<path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.8 5.6 21.2 8 14 2 9.2h7.6z"/>',
  starEmpty: '<path d="M12 2l2.4 7.2H22l-6 4.8 2.4 7.2L12 16.8 5.6 21.2 8 14 2 9.2h7.6z"/>',
  home: '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>',
  briefcase: '<path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4C8.9 3 8 3.9 8 5v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z"/>',
  industry: '<path d="M2 20h20v2H2v-2zm1-1h4V7H3v12zm6 0h4V4H9v15zm6 0h4v-8h-4v8z"/>',
};

const MOMENT_LABELS = { debut: 'Début', milieu: 'Milieu', fin: 'Fin', tout: 'Tout moment' };
const PHASE_ILLUS = { empathie: 'phase-empathie.png', definition: 'phase-definition.png', ideation: 'phase-ideation.png', deblocage: 'phase-deblocage.png', convergence: 'phase-convergence.png', prototypage: 'phase-prototypage.png', retrospective: 'phase-retrospective.png' };
const CAT_ILLUS = { perso: 'cat-perso.png', 'pro-services': 'cat-pro-services.png', 'pro-industrie': 'cat-pro-industrie.png' };
const CAT_ICONS = { perso: 'home', 'pro-services': 'briefcase', 'pro-industrie': 'industry' };

function svg(name) { return `<svg viewBox="0 0 24 24" fill="currentColor">${ICONS[name]}</svg>`; }

function starSvg(filled) {
  if (filled) return `<svg viewBox="0 0 24 24" fill="#d4a44c" style="width:2.5mm;height:2.5mm">${ICONS.starFilled}</svg>`;
  return `<svg viewBox="0 0 24 24" fill="none" stroke="#8a7e6b" stroke-width="1.5" style="width:2.5mm;height:2.5mm;opacity:0.3">${ICONS.starEmpty}</svg>`;
}

function diffStars(n) { return Array.from({length:3}, (_,i) => starSvg(i<n)).join(''); }

// ══════════════════════════════════════════
// Génération des cartes HTML (avec file:// pour images)
// ══════════════════════════════════════════

function cardExFront(ex) {
  const imgSrc = illusUrl(PHASE_ILLUS[ex.phase]);
  const moments = ex.moments.map(m => `<span class="badge badge--moment"><span class="badge__icon">${svg(m)}</span>${MOMENT_LABELS[m]}</span>`).join('');
  return `<div class="card card--exercise card--${ex.phase}">
    <div class="card__background"></div><div class="card__border"></div>
    <div class="card__inner">
      <div class="card__illustration">
        <img src="${imgSrc}" alt="${ex.phaseLabel}">
        <div class="card__category-banner"><span class="card__category-icon">${svg(ex.phase)}</span>${ex.phaseLabel}</div>
        <div class="card__illustration-overlay"></div>
      </div>
      <div class="card__title-zone"><h1 class="card__title">${escapeHtml(ex.title)}</h1></div>
      <div class="card__badges">${moments}</div>
      <div class="card__meta">
        <span class="card__meta-item"><span class="card__meta-icon">${svg('time')}</span>${formatTime(ex.time)}</span>
        <span class="card__meta-item"><span class="card__meta-icon">${svg('participants')}</span>${ex.participants}</span>
        <span class="card__meta-item card__difficulty">${diffStars(ex.difficulty)}</span>
      </div>
      <div class="card__separator"></div>
      <div class="card__objective"><p>${escapeHtml(ex.objective)}</p></div>
      <div class="card__footer">InnoDeck</div>
    </div>
  </div>`;
}

function cardExBack(ex) {
  return `<div class="card card--exercise card--${ex.phase} card--back">
    <div class="card__background"></div><div class="card__border"></div>
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
      <div class="card__material"><span class="card__material-label">Matériel :</span> ${escapeHtml(ex.material)}</div>
      <div class="card__footer">InnoDeck</div>
    </div>
  </div>`;
}

function cardScFront(sc, num) {
  const cat = sc.category;
  const imgSrc = illusUrl(CAT_ILLUS[cat]);
  const iconKey = CAT_ICONS[cat] || 'home';
  const numStr = String(num).padStart(2, '0');
  return `<div class="card card--scenario card--${cat}">
    <div class="card__background"></div><div class="card__border"></div>
    <div class="card__inner">
      <div class="card__illustration">
        <img src="${imgSrc}" alt="${escapeHtml(sc.categoryLabel)}">
        <div class="card__category-banner"><span class="card__category-icon">${svg(iconKey)}</span>${escapeHtml(sc.categoryLabel)}</div>
        <div class="card__illustration-overlay"></div>
      </div>
      <div class="card__title-zone"><h1 class="card__title">${escapeHtml(sc.title)}</h1></div>
      <div class="card__separator"></div>
      <div class="card__situation"><p>${escapeHtml(sc.situation)}</p></div>
      <div class="card__footer">InnoDeck</div>
      <span class="card__number">#${numStr}</span>
    </div>
  </div>`;
}

// ══════════════════════════════════════════
// Assemblage HTML multi-cartes
// ══════════════════════════════════════════

function wrapPage(cards, css, pageSize = '100mm 150mm') {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<style>${css}
@page { size: ${pageSize}; margin: 0; }
body { margin:0; padding:0; background:transparent; }
.card { page-break-after: always; margin:0; box-shadow:none; }
.card:last-child { page-break-after: auto; }
</style></head><body>
${cards.join('\n')}
</body></html>`;
}

function wrapA4(cards, css) {
  const pages = cards.map(c => `
    <div class="print-page">
      <div class="crop-tl"></div><div class="crop-tr"></div>
      <div class="crop-bl"></div><div class="crop-br"></div>
      <div class="card-wrap">${c}</div>
    </div>`).join('\n');

  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<style>${css}
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
body { margin:0; padding:0; background:white; }
.print-page {
  width:210mm; height:297mm; position:relative;
  display:flex; align-items:center; justify-content:center;
  page-break-after:always; overflow:hidden;
}
.print-page:last-child { page-break-after:auto; }
.card-wrap { position:relative; }
.card { box-shadow:none; margin:0; }
.crop-tl,.crop-tr,.crop-bl,.crop-br { position:absolute; width:8mm; height:8mm; }
.crop-tl { top:calc(50% - 75mm - 5mm); left:calc(50% - 50mm - 5mm); border-top:0.5pt solid #999; border-left:0.5pt solid #999; }
.crop-tr { top:calc(50% - 75mm - 5mm); right:calc(50% - 50mm - 5mm); border-top:0.5pt solid #999; border-right:0.5pt solid #999; }
.crop-bl { bottom:calc(50% - 75mm - 5mm); left:calc(50% - 50mm - 5mm); border-bottom:0.5pt solid #999; border-left:0.5pt solid #999; }
.crop-br { bottom:calc(50% - 75mm - 5mm); right:calc(50% - 50mm - 5mm); border-bottom:0.5pt solid #999; border-right:0.5pt solid #999; }
</style></head><body>
${pages}
</body></html>`;
}

// ══════════════════════════════════════════
// PDF via Puppeteer
// ══════════════════════════════════════════

async function htmlToPdf(browser, html, outPath, pageSize = { width: '100mm', height: '150mm' }) {
  const page = await browser.newPage();
  const tmpFile = path.join(TMP_DIR, `tmp-${Date.now()}-${Math.random().toString(36).slice(2,8)}.html`);
  fs.writeFileSync(tmpFile, html, 'utf-8');

  try {
    await page.goto(`file:///${tmpFile.replace(/\\/g, '/')}`, {
      waitUntil: 'networkidle0',
      timeout: 120000,
    });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({
      path: outPath,
      width: pageSize.width,
      height: pageSize.height,
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  } finally {
    await page.close();
    try { fs.unlinkSync(tmpFile); } catch(e) {}
  }
}

// ══════════════════════════════════════════
// Main
// ══════════════════════════════════════════

async function main() {
  console.log('=== InnoDeck — Génération des PDF ===\n');

  ensureDir(PDF_DIR);
  ensureDir(PRINT_DIR);
  ensureDir(TMP_DIR);

  // Préparer les données
  const proServices = scenariosPro.filter(s => s.subCategory === 'services');
  const proIndustrie = scenariosPro.filter(s => s.subCategory === 'industrie');

  // Cartes HTML (avec file:// pour images)
  const exRectoCards = exercises.map(ex => cardExFront(ex));
  const exVersoCards = exercises.map(ex => cardExBack(ex));
  const scPersoCards = scenariosPerso.map((sc, i) => cardScFront(sc, i + 1));
  const scServicesCards = proServices.map((sc, i) => cardScFront(sc, i + 1));
  const scIndustrieCards = proIndustrie.map((sc, i) => cardScFront(sc, i + 1));

  const exCss = `${cssVariables}\n${cssBase}\n${cssExercise}`;
  const scCss = `${cssVariables}\n${cssBase}\n${cssScenario}`;

  console.log('Lancement de Puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    userDataDir: path.join(TMP_DIR, 'chrome-profile'),
  });

  try {
    const cardSize = { width: '100mm', height: '150mm' };
    const a4Size = { width: '210mm', height: '297mm' };

    // ── PDF par catégorie ──
    console.log('\n── PDF par catégorie ──');

    let html = wrapPage(exRectoCards, exCss);
    await htmlToPdf(browser, html, path.join(PDF_DIR, 'innodeck-exercices-recto.pdf'), cardSize);
    console.log(`  ✓ innodeck-exercices-recto.pdf (${exRectoCards.length} cartes)`);

    html = wrapPage(exVersoCards, exCss);
    await htmlToPdf(browser, html, path.join(PDF_DIR, 'innodeck-exercices-verso.pdf'), cardSize);
    console.log(`  ✓ innodeck-exercices-verso.pdf (${exVersoCards.length} cartes)`);

    html = wrapPage(scPersoCards, scCss);
    await htmlToPdf(browser, html, path.join(PDF_DIR, 'innodeck-scenarios-perso.pdf'), cardSize);
    console.log(`  ✓ innodeck-scenarios-perso.pdf (${scPersoCards.length} cartes)`);

    html = wrapPage(scServicesCards, scCss);
    await htmlToPdf(browser, html, path.join(PDF_DIR, 'innodeck-scenarios-pro-services.pdf'), cardSize);
    console.log(`  ✓ innodeck-scenarios-pro-services.pdf (${scServicesCards.length} cartes)`);

    html = wrapPage(scIndustrieCards, scCss);
    await htmlToPdf(browser, html, path.join(PDF_DIR, 'innodeck-scenarios-pro-industrie.pdf'), cardSize);
    console.log(`  ✓ innodeck-scenarios-pro-industrie.pdf (${scIndustrieCards.length} cartes)`);

    // ── PDF complet (recto/verso intercalés + scénarios) ──
    console.log('\n── PDF complet ──');
    const allCards = [];
    for (let i = 0; i < exercises.length; i++) {
      allCards.push(exRectoCards[i]);
      allCards.push(exVersoCards[i]);
    }
    allCards.push(...scPersoCards, ...scServicesCards, ...scIndustrieCards);

    html = wrapPage(allCards, allCss);
    await htmlToPdf(browser, html, path.join(PDF_DIR, 'innodeck-complet.pdf'), cardSize);
    console.log(`  ✓ innodeck-complet.pdf (${allCards.length} pages)`);

    // ── PDF impression A4 ──
    console.log('\n── PDF impression A4 (repères de coupe) ──');
    html = wrapA4(allCards, allCss);
    await htmlToPdf(browser, html, path.join(PRINT_DIR, 'innodeck-print-a4.pdf'), a4Size);
    console.log(`  ✓ innodeck-print-a4.pdf (${allCards.length} pages A4)`);

  } finally {
    await browser.close();
    try { fs.rmSync(TMP_DIR, { recursive: true, force: true, maxRetries: 3, retryDelay: 1000 }); }
    catch(e) { console.log('Note : dossier temporaire non supprimé.'); }
  }

  console.log('\n=== Génération terminée ===');
  console.log(`  output/pdf/   → PDF par catégorie + complet`);
  console.log(`  output/print/ → PDF A4 avec repères de coupe`);
}

main().catch(err => {
  console.error('Erreur :', err.message);
  process.exit(1);
});
