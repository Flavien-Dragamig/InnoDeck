#!/usr/bin/env node
'use strict';

var path = require('path');
var fs   = require('fs');
var { execSync } = require('child_process');

var PDF_ROOT = path.join(__dirname, '..', 'PRODUCTION', 'V1', 'pdf');

// Ghostscript : qualité impression 300 DPI
var GS_ARGS = [
  '-sDEVICE=pdfwrite',
  '-dCompatibilityLevel=1.4',
  '-dPDFSETTINGS=/printer',
  '-dNOPAUSE',
  '-dQUIET',
  '-dBATCH',
  '-dColorImageResolution=300',
  '-dGrayImageResolution=300',
].join(' ');

function findPdfs(dir) {
  var results = [];
  if (!fs.existsSync(dir)) return results;
  var entries = fs.readdirSync(dir, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var full  = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findPdfs(full));
    } else if (entry.name.endsWith('.pdf')) {
      results.push(full);
    }
  }
  return results;
}

function main() {
  console.log('=== InnoDeck — Compression PDF (Ghostscript) ===\n');

  // Vérifier que gs est disponible
  try {
    execSync('gs --version', { stdio: 'pipe' });
  } catch (e) {
    console.error('Erreur : Ghostscript (gs) n\'est pas installé.');
    console.error('  Ubuntu/Debian : sudo apt install ghostscript');
    console.error('  macOS         : brew install ghostscript');
    process.exit(1);
  }

  var pdfs = findPdfs(PDF_ROOT);
  if (pdfs.length === 0) {
    console.log('Aucun PDF trouvé dans ' + PDF_ROOT);
    return;
  }

  console.log(pdfs.length + ' fichiers PDF trouvés.\n');

  var totalBefore = 0;
  var totalAfter  = 0;
  var compressed  = 0;
  var skipped     = 0;

  for (var i = 0; i < pdfs.length; i++) {
    var pdfPath = pdfs[i];
    var tmpPath = pdfPath + '.tmp';
    var relPath = path.relative(PDF_ROOT, pdfPath);

    var sizeBefore = fs.statSync(pdfPath).size;
    totalBefore += sizeBefore;

    try {
      execSync(
        'gs ' + GS_ARGS + ' -sOutputFile="' + tmpPath + '" "' + pdfPath + '"',
        { stdio: 'pipe', timeout: 60000 }
      );

      var sizeAfter = fs.statSync(tmpPath).size;

      if (sizeAfter < sizeBefore) {
        // Le fichier compressé est plus petit : on remplace
        fs.renameSync(tmpPath, pdfPath);
        totalAfter += sizeAfter;
        compressed++;
        var reduction = ((1 - sizeAfter / sizeBefore) * 100).toFixed(1);
        console.log(
          '  ✓ ' + relPath.padEnd(55) +
          (sizeBefore / 1024 / 1024).toFixed(2) + ' → ' +
          (sizeAfter  / 1024 / 1024).toFixed(2) + ' MB  (-' + reduction + '%)'
        );
      } else {
        // Pas de gain : on garde l'original
        try { fs.unlinkSync(tmpPath); } catch (e) {}
        totalAfter += sizeBefore;
        skipped++;
        console.log('  – ' + relPath.padEnd(55) + 'déjà optimal');
      }
    } catch (err) {
      try { fs.unlinkSync(tmpPath); } catch (e) {}
      totalAfter += sizeBefore;
      skipped++;
      console.log('  ✗ ' + relPath.padEnd(55) + 'erreur gs');
    }
  }

  console.log('\n── Résumé ──');
  console.log('  Fichiers compressés : ' + compressed + '/' + pdfs.length);
  console.log('  Ignorés (déjà opt.) : ' + skipped);
  console.log('  Avant  : ' + (totalBefore / 1024 / 1024).toFixed(1) + ' MB');
  console.log('  Après  : ' + (totalAfter  / 1024 / 1024).toFixed(1) + ' MB');
  if (totalBefore > 0) {
    console.log('  Gain   : -' + ((1 - totalAfter / totalBefore) * 100).toFixed(1) + '%');
  }
}

main();
