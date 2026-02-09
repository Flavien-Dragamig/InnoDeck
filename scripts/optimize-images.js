#!/usr/bin/env node
'use strict';

var sharp = require('sharp');
var path  = require('path');
var fs    = require('fs');

var SRC_DIR  = path.join(__dirname, '..', 'cards', 'assets', 'illustrations');
var DEST_DIR = path.join(__dirname, '..', 'cards', 'assets', 'illustrations-optimized');

// 300 DPI pour 100mm de large = 1181 px
var TARGET_WIDTH = 1181;
var JPEG_QUALITY = 85;

async function main() {
  console.log('=== InnoDeck — Optimisation des illustrations ===\n');

  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }

  var files = fs.readdirSync(SRC_DIR).filter(function(f) {
    return /\.(png|jpg|jpeg)$/i.test(f);
  });

  if (files.length === 0) {
    console.log('Aucune image trouvée dans ' + SRC_DIR);
    return;
  }

  var totalBefore = 0;
  var totalAfter  = 0;

  for (var i = 0; i < files.length; i++) {
    var file    = files[i];
    var srcPath = path.join(SRC_DIR, file);
    var outName = file.replace(/\.(png|jpg|jpeg)$/i, '.jpg');
    var outPath = path.join(DEST_DIR, outName);

    var srcSize = fs.statSync(srcPath).size;
    totalBefore += srcSize;

    await sharp(srcPath)
      .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .toFile(outPath);

    var outSize = fs.statSync(outPath).size;
    totalAfter += outSize;

    var reduction = ((1 - outSize / srcSize) * 100).toFixed(1);
    console.log(
      '  ✓ ' + file.padEnd(30) +
      (srcSize / 1024 / 1024).toFixed(1) + ' MB → ' +
      (outSize / 1024 / 1024).toFixed(1) + ' MB  (-' + reduction + '%)'
    );
  }

  console.log('\n── Résumé ──');
  console.log('  Avant  : ' + (totalBefore / 1024 / 1024).toFixed(1) + ' MB');
  console.log('  Après  : ' + (totalAfter  / 1024 / 1024).toFixed(1) + ' MB');
  console.log('  Gain   : -' + ((1 - totalAfter / totalBefore) * 100).toFixed(1) + '%');
  console.log('\nImages optimisées dans : ' + DEST_DIR);
}

main().catch(function(err) {
  console.error('Erreur :', err);
  process.exit(1);
});
