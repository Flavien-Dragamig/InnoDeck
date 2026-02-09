/**
 * InnoDeck — Générateur PDF A4 paysage
 *
 * Génère des fichiers PDF au format A4 paysage (297×210mm) :
 *   - 2 cartes 10×15cm côte à côte par page
 *   - Marges de coupe de 5mm tout autour de chaque carte
 *   - P1 : rectos des 2 cartes / P2 : versos des 2 cartes
 *   - 1 fichier par doublette (paire de cartes)
 *
 * Sortie :
 *   PRODUCTION/pdf/a4/
 *     exercices/
 *       doublette-01-02.pdf          (P1: recto carte 1 + recto carte 2, P2: verso carte 1 + verso carte 2)
 *       ...
 *     scenarios-perso/
 *       doublette-01-02.pdf
 *       ...
 *     scenarios-pro-services/
 *       doublette-01-02.pdf
 *       ...
 *     scenarios-pro-industrie/
 *       doublette-01-02.pdf
 *       ...
 *
 * Usage : node scripts/generate-pdf-a4.js
 */

var fs = require('fs');
var path = require('path');
var puppeteer = require('puppeteer');

// ── Chemins ──
var ROOT = path.resolve(__dirname, '..');
var DATA_DIR = path.join(ROOT, 'data');
var CSS_DIR = path.join(ROOT, 'cards', 'css');
var ILLUS_DIR = path.join(ROOT, 'cards', 'assets', 'illustrations');
var ILLUS_OPT_DIR = path.join(ROOT, 'cards', 'assets', 'illustrations-optimized');
var PDF_DIR = path.join(ROOT, 'PRODUCTION', 'V1', 'pdf', 'a4');
var TMP_DIR = path.join(ROOT, '.tmp-puppeteer');

// ── Données ──
var exercises = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'exercises.json'), 'utf-8'));
var scenariosPerso = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'scenarios-perso.json'), 'utf-8'));
var scenariosPro = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'scenarios-pro.json'), 'utf-8'));

// ── CSS ──
var cssVariables = fs.readFileSync(path.join(CSS_DIR, 'variables.css'), 'utf-8');
var cssBase = fs.readFileSync(path.join(CSS_DIR, 'card-base.css'), 'utf-8').replace("@import url('./variables.css');", '');
var cssExercise = fs.readFileSync(path.join(CSS_DIR, 'card-exercise.css'), 'utf-8');
var cssScenario = fs.readFileSync(path.join(CSS_DIR, 'card-scenario.css'), 'utf-8');

// ── Helpers ──
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtTime(t) { return t.replace(/minutes?/gi, 'min').replace(/\s+/g, ' ').trim(); }

function illusUrl(f) {
  // Priorité : image optimisée (JPEG) > image originale
  var optName = f.replace(/\.(png|jpg|jpeg)$/i, '.jpg');
  var optPath = path.join(ILLUS_OPT_DIR, optName);
  if (fs.existsSync(optPath)) {
    return 'file:///' + optPath.replace(/\\/g, '/');
  }
  return 'file:///' + path.join(ILLUS_DIR, f).replace(/\\/g, '/');
}

// ── SVG Icons ──
var I = {
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

var ML = { debut: 'Debut', milieu: 'Milieu', fin: 'Fin', tout: 'Tout moment' };
var PI = { empathie: 'phase-empathie.png', definition: 'phase-definition.png', ideation: 'phase-ideation.png', deblocage: 'phase-deblocage.png', convergence: 'phase-convergence.png', prototypage: 'phase-prototypage.png', retrospective: 'phase-retrospective.png' };
var CI = { perso: 'cat-perso.png', 'pro-services': 'cat-pro-services.png', 'pro-industrie': 'cat-pro-industrie.png' };
var CK = { perso: 'home', 'pro-services': 'briefcase', 'pro-industrie': 'industry' };

function sv(n) { return '<svg viewBox="0 0 24 24" fill="currentColor">' + I[n] + '</svg>'; }
function starSvg(f) { return f ? '<svg viewBox="0 0 24 24" fill="#d4a44c" style="width:2.5mm;height:2.5mm">' + I.starFilled + '</svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="#8a7e6b" stroke-width="1.5" style="width:2.5mm;height:2.5mm;opacity:0.3">' + I.starEmpty + '</svg>'; }
function starsHtml(n) { return [0,1,2].map(function(i) { return starSvg(i < n); }).join(''); }

// ══════════════════════════════════════════
// Card HTML (mêmes fonctions que generate-pdf.js)
// ══════════════════════════════════════════

function exFront(ex) {
  var img = illusUrl(PI[ex.phase]);
  var mom = ex.moments.map(function(m) { return '<span class="badge badge--moment"><span class="badge__icon">' + sv(m) + '</span>' + ML[m] + '</span>'; }).join('');
  return '<div class="card card--exercise card--' + ex.phase + '">' +
    '<div class="card__background"></div><div class="card__border"></div>' +
    '<div class="card__inner">' +
      '<div class="card__illustration"><img src="' + img + '" alt="' + ex.phaseLabel + '">' +
        '<div class="card__category-banner"><span class="card__category-icon">' + sv(ex.phase) + '</span>' + ex.phaseLabel + '</div>' +
        '<div class="card__illustration-overlay"></div></div>' +
      '<div class="card__title-zone"><h1 class="card__title">' + esc(ex.title) + '</h1></div>' +
      '<div class="card__badges">' + mom + '</div>' +
      '<div class="card__meta">' +
        '<span class="card__meta-item"><span class="card__meta-icon">' + sv('time') + '</span>' + fmtTime(ex.time) + '</span>' +
        '<span class="card__meta-item"><span class="card__meta-icon">' + sv('participants') + '</span>' + ex.participants + '</span>' +
        '<span class="card__meta-item card__difficulty">' + starsHtml(ex.difficulty) + '</span></div>' +
      '<div class="card__separator"></div>' +
      '<div class="card__objective"><p>' + esc(ex.objective) + '</p></div>' +
      '<div class="card__footer">InnoDeck</div>' +
    '</div></div>';
}

function exBack(ex) {
  return '<div class="card card--exercise card--' + ex.phase + ' card--back">' +
    '<div class="card__background"></div><div class="card__border"></div>' +
    '<div class="card__inner">' +
      '<div class="card__back-title">' + esc(ex.title) + '</div>' +
      '<div class="card__section" style="flex:2"><div class="card__section-title">D\u00e9roul\u00e9</div>' +
        '<div class="card__section-content card__section-content--small">' + esc(ex.process) + '</div></div>' +
      '<div class="card__separator"></div>' +
      '<div class="card__section" style="flex:1.5"><div class="card__section-title">Pourquoi \u00e7a marche</div>' +
        '<div class="card__section-content card__section-content--small">' + esc(ex.whyItWorks) + '</div></div>' +
      '<div class="card__separator"></div>' +
      '<div class="card__material"><span class="card__material-label">Mat\u00e9riel :</span> ' + esc(ex.material) + '</div>' +
      '<div class="card__footer">InnoDeck</div>' +
    '</div></div>';
}

function scFront(sc, num) {
  var img = illusUrl(CI[sc.category]);
  var ik = CK[sc.category] || 'home';
  var numStr = String(num).padStart(2, '0');
  return '<div class="card card--scenario card--' + sc.category + ' card--scenario-visual">' +
    '<div class="card__background"></div><div class="card__border"></div>' +
    '<div class="card__inner">' +
      '<div class="card__illustration card__illustration--large"><img src="' + img + '" alt="' + esc(sc.categoryLabel) + '">' +
        '<div class="card__category-banner"><span class="card__category-icon">' + sv(ik) + '</span>' + esc(sc.categoryLabel) + '</div>' +
        '<div class="card__illustration-overlay card__illustration-overlay--large"></div></div>' +
      '<div class="card__title-zone card__title-zone--centered"><h1 class="card__title">' + esc(sc.title) + '</h1></div>' +
      '<div class="card__footer">InnoDeck</div>' +
      '<span class="card__number">#' + numStr + '</span>' +
    '</div></div>';
}

function scBack(sc, num) {
  var numStr = String(num).padStart(2, '0');
  return '<div class="card card--scenario card--' + sc.category + ' card--back">' +
    '<div class="card__background"></div><div class="card__border"></div>' +
    '<div class="card__inner">' +
      '<div class="card__back-title">' + esc(sc.title) + '</div>' +
      '<div class="card__section card__section--scenario-main"><div class="card__section-title">Mise en situation</div>' +
        '<div class="card__section-content">' + esc(sc.situation) + '</div></div>' +
      '<div class="card__separator"></div>' +
      '<div class="card__section card__section--scenario-hint"><div class="card__section-title">Objectif</div>' +
        '<div class="card__section-content card__section-content--small">Utilisez les cartes Exercice pour r\u00e9soudre ce d\u00e9fi ! Choisissez la m\u00e9thode adapt\u00e9e et appliquez-la \u00e0 cette situation concr\u00e8te.</div></div>' +
      '<div class="card__footer">InnoDeck</div>' +
      '<span class="card__number">#' + numStr + '</span>' +
    '</div></div>';
}

// ══════════════════════════════════════════
// A4 paysage : 2 cartes côte à côte avec marques de coupe
// ══════════════════════════════════════════

/**
 * Layout A4 paysage (297 × 210 mm) :
 *
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │  5mm marge                                                  │
 *  │    ┌─ marque de coupe ──────┐    ┌─ marque de coupe ──────┐ │
 *  │    │                        │    │                        │ │
 *  │    │   Carte 1 (100×150)    │    │   Carte 2 (100×150)    │ │
 *  │    │                        │    │                        │ │
 *  │    └────────────────────────┘    └────────────────────────┘ │
 *  │  5mm marge                                                  │
 *  └─────────────────────────────────────────────────────────────┘
 *
 * Calcul horizontal : 297mm total
 *   - marge gauche 5mm + marque coupe 5mm = 10mm
 *   - carte 100mm
 *   - marque coupe 5mm + espace central + marque coupe 5mm
 *   - carte 100mm
 *   - marque coupe 5mm + marge droite 5mm = 10mm
 *   Total cartes + marques = 10 + 100 + 10 + X + 10 + 100 + 10 = 240 + X = 297 → X = 57mm
 *   Mais c'est trop d'espace. Simplifions :
 *   Les marges de coupe de 5mm sont des repères visuels (lignes) autour de chaque carte.
 *   Disposition : centré, avec un gap entre les deux cartes.
 *
 * Vertical : 210mm total
 *   - carte 150mm → reste 60mm → 30mm en haut/bas
 */

function wrapA4(leftCard, rightCard, css) {
  // Marques de coupe = petites lignes aux coins de chaque carte
  var cropMark = function(top, left) {
    // Lignes de 5mm autour des coins
    var styles = 'position:absolute;';
    styles += top ? 'top:-5mm;' : 'bottom:-5mm;';
    styles += left ? 'left:-5mm;' : 'right:-5mm;';
    var hLine = '<div style="position:absolute;' + (top ? 'top:0;' : 'bottom:0;') + (left ? 'left:0;' : 'right:0;') +
      'width:5mm;height:0;border-top:0.3mm solid #999;"></div>';
    var vLine = '<div style="position:absolute;' + (top ? 'top:0;' : 'bottom:0;') + (left ? 'left:0;' : 'right:0;') +
      'width:0;height:5mm;border-left:0.3mm solid #999;"></div>';
    return '<div style="' + styles + 'width:5mm;height:5mm;">' + hLine + vLine + '</div>';
  };

  var cropMarks = cropMark(true, true) + cropMark(true, false) + cropMark(false, true) + cropMark(false, false);

  return '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">' +
    '<style>' + css + '\n' +
    '@page { size: 297mm 210mm; margin: 0; }\n' +
    'html, body { margin: 0; padding: 0; width: 297mm; height: 210mm; background: white; }\n' +
    '.a4-page { width: 297mm; height: 210mm; display: flex; align-items: center; justify-content: center; gap: 20mm; page-break-after: always; break-after: page; position: relative; }\n' +
    '.a4-page:last-child { page-break-after: auto; break-after: auto; }\n' +
    '.card-slot { position: relative; flex-shrink: 0; }\n' +
    '.card { box-shadow: none; margin: 0; page-break-after: auto; break-after: auto; }\n' +
    '</style></head><body>\n' +
    '<div class="a4-page">' +
      '<div class="card-slot">' + cropMarks + leftCard + '</div>' +
      (rightCard ? '<div class="card-slot">' + cropMarks + rightCard + '</div>' : '') +
    '</div>\n' +
    '</body></html>';
}

function wrapA4TwoPages(leftFront, rightFront, leftBack, rightBack, css) {
  var cropMark = function(top, left) {
    var styles = 'position:absolute;';
    styles += top ? 'top:-5mm;' : 'bottom:-5mm;';
    styles += left ? 'left:-5mm;' : 'right:-5mm;';
    var hLine = '<div style="position:absolute;' + (top ? 'top:0;' : 'bottom:0;') + (left ? 'left:0;' : 'right:0;') +
      'width:5mm;height:0;border-top:0.3mm solid #999;"></div>';
    var vLine = '<div style="position:absolute;' + (top ? 'top:0;' : 'bottom:0;') + (left ? 'left:0;' : 'right:0;') +
      'width:0;height:5mm;border-left:0.3mm solid #999;"></div>';
    return '<div style="' + styles + 'width:5mm;height:5mm;">' + hLine + vLine + '</div>';
  };

  var cropMarks = cropMark(true, true) + cropMark(true, false) + cropMark(false, true) + cropMark(false, false);

  return '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">' +
    '<style>' + css + '\n' +
    '@page { size: 297mm 210mm; margin: 0; }\n' +
    'html, body { margin: 0; padding: 0; width: 297mm; background: white; display: block; min-height: auto; }\n' +
    '.a4-page { width: 297mm; height: 210mm; display: flex; align-items: center; justify-content: center; gap: 20mm; page-break-after: always; break-after: page; }\n' +
    '.a4-page:last-child { page-break-after: auto; break-after: auto; }\n' +
    '.card-slot { position: relative; flex-shrink: 0; }\n' +
    '.card { box-shadow: none; margin: 0; page-break-after: auto !important; break-after: auto !important; page-break-inside: avoid !important; }\n' +
    '</style></head><body>\n' +
    '<!-- Page 1 : Rectos -->\n' +
    '<div class="a4-page">' +
      '<div class="card-slot">' + cropMarks + leftFront + '</div>' +
      (rightFront ? '<div class="card-slot">' + cropMarks + rightFront + '</div>' : '') +
    '</div>\n' +
    '<!-- Page 2 : Versos (V1 | V2) -->\n' +
    '<div class="a4-page">' +
      '<div class="card-slot">' + cropMarks + leftBack + '</div>' +
      (rightBack ? '<div class="card-slot">' + cropMarks + rightBack + '</div>' : '') +
    '</div>\n' +
    '</body></html>';
}

// ══════════════════════════════════════════
// Puppeteer
// ══════════════════════════════════════════

async function toPdf(browser, html, outPath) {
  var page = await browser.newPage();
  var tmpFile = path.join(TMP_DIR, 'tmp-' + Date.now() + '-' + Math.random().toString(36).slice(2,8) + '.html');
  fs.writeFileSync(tmpFile, html, 'utf-8');
  try {
    await page.goto('file:///' + tmpFile.replace(/\\/g, '/'), { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.evaluate(function() {
      return Promise.all(Array.from(document.images).map(function(img) {
        if (img.complete) return Promise.resolve();
        return new Promise(function(r) { img.onload = r; img.onerror = r; });
      }));
    });
    await page.evaluate(function() { return document.fonts.ready; });
    await page.pdf({
      path: outPath,
      width: '297mm',
      height: '210mm',
      printBackground: true,
      preferCSSPageSize: true,
      landscape: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  } finally {
    await page.close();
    try { fs.unlinkSync(tmpFile); } catch(e) {}
  }
}

// ══════════════════════════════════════════
// Grouper par paires (doublettes)
// ══════════════════════════════════════════

function pairs(arr) {
  var result = [];
  for (var i = 0; i < arr.length; i += 2) {
    result.push([arr[i], arr[i + 1] || null]);
  }
  return result;
}

// ══════════════════════════════════════════
// Main
// ══════════════════════════════════════════

async function main() {
  console.log('=== InnoDeck \u2014 G\u00e9n\u00e9ration PDF A4 paysage ===\n');

  var exDir = path.join(PDF_DIR, 'exercices');
  var scPDir = path.join(PDF_DIR, 'scenarios-perso');
  var scSDir = path.join(PDF_DIR, 'scenarios-pro-services');
  var scIDir = path.join(PDF_DIR, 'scenarios-pro-industrie');
  [exDir, scPDir, scSDir, scIDir].forEach(ensureDir);
  ensureDir(TMP_DIR);

  var proServices = scenariosPro.filter(function(s) { return s.subCategory === 'services'; });
  var proIndustrie = scenariosPro.filter(function(s) { return s.subCategory === 'industrie'; });

  var exCss = cssVariables + '\n' + cssBase + '\n' + cssExercise;
  var scCss = cssVariables + '\n' + cssBase + '\n' + cssScenario;

  console.log('Lancement de Puppeteer...\n');
  var browser = await puppeteer.launch({
    headless: 'new',
    protocolTimeout: 300000,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    userDataDir: path.join(TMP_DIR, 'chrome-profile'),
  });

  try {
    // ── Exercices (8 doublettes) ──
    console.log('\u2500\u2500 Exercices (8 doublettes A4) \u2500\u2500');
    var exPairs = pairs(exercises);
    for (var p = 0; p < exPairs.length; p++) {
      var pair = exPairs[p];
      var a = pair[0], b = pair[1];
      var n1 = String(p * 2 + 1).padStart(2, '0');
      var n2 = b ? String(p * 2 + 2).padStart(2, '0') : null;
      var filename = 'doublette-' + n1 + (n2 ? '-' + n2 : '') + '.pdf';

      var html = wrapA4TwoPages(
        exFront(a),
        b ? exFront(b) : '',
        exBack(a),
        b ? exBack(b) : '',
        exCss
      );
      await toPdf(browser, html, path.join(exDir, filename));
      console.log('  \u2713 ' + filename);
    }

    // ── Scénarios Perso (10 doublettes) ──
    console.log('\n\u2500\u2500 Sc\u00e9narios Perso (10 doublettes A4) \u2500\u2500');
    var scPPairs = pairs(scenariosPerso);
    for (var p = 0; p < scPPairs.length; p++) {
      var pair = scPPairs[p];
      var a = pair[0], b = pair[1];
      var n1 = String(p * 2 + 1).padStart(2, '0');
      var n2 = b ? String(p * 2 + 2).padStart(2, '0') : null;
      var filename = 'doublette-' + n1 + (n2 ? '-' + n2 : '') + '.pdf';

      var html = wrapA4TwoPages(
        scFront(a, p * 2 + 1),
        b ? scFront(b, p * 2 + 2) : '',
        scBack(a, p * 2 + 1),
        b ? scBack(b, p * 2 + 2) : '',
        scCss
      );
      await toPdf(browser, html, path.join(scPDir, filename));
      console.log('  \u2713 ' + filename);
    }

    // ── Scénarios Services (5 doublettes) ──
    console.log('\n\u2500\u2500 Sc\u00e9narios Services (5 doublettes A4) \u2500\u2500');
    var scSPairs = pairs(proServices);
    for (var p = 0; p < scSPairs.length; p++) {
      var pair = scSPairs[p];
      var a = pair[0], b = pair[1];
      var n1 = String(p * 2 + 1).padStart(2, '0');
      var n2 = b ? String(p * 2 + 2).padStart(2, '0') : null;
      var filename = 'doublette-' + n1 + (n2 ? '-' + n2 : '') + '.pdf';

      var html = wrapA4TwoPages(
        scFront(a, p * 2 + 1),
        b ? scFront(b, p * 2 + 2) : '',
        scBack(a, p * 2 + 1),
        b ? scBack(b, p * 2 + 2) : '',
        scCss
      );
      await toPdf(browser, html, path.join(scSDir, filename));
      console.log('  \u2713 ' + filename);
    }

    // ── Scénarios Industrie (5 doublettes) ──
    console.log('\n\u2500\u2500 Sc\u00e9narios Industrie (5 doublettes A4) \u2500\u2500');
    var scIPairs = pairs(proIndustrie);
    for (var p = 0; p < scIPairs.length; p++) {
      var pair = scIPairs[p];
      var a = pair[0], b = pair[1];
      var n1 = String(p * 2 + 1).padStart(2, '0');
      var n2 = b ? String(p * 2 + 2).padStart(2, '0') : null;
      var filename = 'doublette-' + n1 + (n2 ? '-' + n2 : '') + '.pdf';

      var html = wrapA4TwoPages(
        scFront(a, p * 2 + 1),
        b ? scFront(b, p * 2 + 2) : '',
        scBack(a, p * 2 + 1),
        b ? scBack(b, p * 2 + 2) : '',
        scCss
      );
      await toPdf(browser, html, path.join(scIDir, filename));
      console.log('  \u2713 ' + filename);
    }

  } finally {
    await browser.close();
    try { fs.rmSync(TMP_DIR, { recursive: true, force: true, maxRetries: 3, retryDelay: 1000 }); }
    catch(e) { console.log('Note : dossier temporaire non supprim\u00e9.'); }
  }

  var totalDoublettes = Math.ceil(exercises.length / 2) + Math.ceil(scenariosPerso.length / 2) + Math.ceil(proServices.length / 2) + Math.ceil(proIndustrie.length / 2);
  console.log('\n=== ' + totalDoublettes + ' PDF A4 g\u00e9n\u00e9r\u00e9s dans PRODUCTION/V1/pdf/a4/ ===');
  console.log('  exercices/              \u2192 ' + Math.ceil(exercises.length / 2) + ' doublettes (2 pages : P1 rectos + P2 versos)');
  console.log('  scenarios-perso/        \u2192 ' + Math.ceil(scenariosPerso.length / 2) + ' doublettes');
  console.log('  scenarios-pro-services/ \u2192 ' + Math.ceil(proServices.length / 2) + ' doublettes');
  console.log('  scenarios-pro-industrie/\u2192 ' + Math.ceil(proIndustrie.length / 2) + ' doublettes');
}

main().catch(function(err) { console.error('Erreur :', err.message); process.exit(1); });
