'use strict';
// Renders generar-marca.html in headless Chrome and stores the brand rasters in generador/brand-assets.json.
// Run: node design/propuesta/marca/generar-marca.js
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME = process.env.CHROME || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const page = path.join(__dirname, 'generar-marca.html');
const dom = execFileSync(
  CHROME,
  ['--headless=new', '--disable-gpu', '--allow-file-access-from-files', '--virtual-time-budget=20000', '--dump-dom', 'file:///' + page.replace(/\\/g, '/')],
  { maxBuffer: 64 * 1024 * 1024, encoding: 'utf8' },
);
const m = dom.match(/BRAND_JSON_START([\s\S]*?)BRAND_JSON_END/);
if (!m) throw new Error('El HTML no produjo los activos de marca.');
const assets = JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
fs.writeFileSync(path.join(__dirname, '..', 'generador', 'brand-assets.json'), JSON.stringify(assets));
console.log('head', assets.head.length, 'hero', assets.hero.length);
