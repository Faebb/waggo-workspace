'use strict';
const fs = require('fs');
const path = require('path');
const L = require('./lib');

const OUT = process.argv[2];
const only = process.argv[3];
fs.mkdirSync(OUT, { recursive: true });

const GAP = 48;
const MARGIN = 40;
const TOP = 96;

const groups = [
  ...require('./screens-common'),
  ...safe('./screens-owner'),
  ...safe('./screens-walker'),
  ...safe('./screens-admin'),
  ...safe('./screens-system'),
];

function safe(p) {
  try { return require(p); } catch (e) { if (e.code === 'MODULE_NOT_FOUND' && e.message.includes(p.slice(2))) return []; throw e; }
}

function slug(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const index = [];
for (const grp of groups) {
  if (only && !grp.file.includes(only)) continue;
  const fw = grp.frameW || L.W;
  const fh = grp.frameH || L.H;
  const n = grp.frames.length;
  const width = MARGIN * 2 + n * fw + (n - 1) * GAP;
  const height = TOP + fh + MARGIN;
  let body = '';
  body += `<rect width="${width}" height="${height}" fill="#E9E3DE"/>`;
  body += L.t(MARGIN, 40, grp.title, 'title', '#16212E');
  body += L.t(MARGIN, 64, `${grp.file}.svg · ${n} estado${n > 1 ? 's' : ''} · ${fw}×${fh} · Waggo propuesta 2026-10`, 'caption', '#3A4A5C');
  grp.frames.forEach(([state, theme, fn], i) => {
    const x = MARGIN + i * (fw + GAP);
    const C = L.THEMES[theme];
    const id = `${grp.file}--${slug(state)}${theme === 'dark' && !/oscuro/i.test(state) ? '-oscuro' : ''}`;
    body += L.t(x, TOP - 12, `${state}${theme === 'dark' && !/oscuro/i.test(state) ? ' · oscuro' : ''}`, 'captionB', '#16212E');
    body += `<svg id="${id}" x="${x}" y="${TOP}" width="${fw}" height="${fh}" viewBox="0 0 ${fw} ${fh}" overflow="hidden">${fn(C)}</svg>`;
    body += `<rect x="${x - 0.5}" y="${TOP - 0.5}" width="${fw + 1}" height="${fh + 1}" fill="none" stroke="#16212E" stroke-opacity="0.12"/>`;
  });
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n<title>${L.esc(grp.title)}</title>\n${L.defs()}\n${L.brandDefs()}\n${body}\n</svg>\n`;
  fs.writeFileSync(path.join(OUT, `${grp.file}.svg`), svg);
  index.push({ file: grp.file, title: grp.title, states: grp.frames.map((f) => f[0] + (f[1] === 'dark' && !/oscuro/i.test(f[0]) ? ' (oscuro)' : '')), bytes: svg.length });
}
if (process.env.WAGGO_INDEX) fs.writeFileSync(process.env.WAGGO_INDEX, JSON.stringify(index, null, 2));
console.log(index.map((i) => `${i.file} ${i.states.length} ${Math.round(i.bytes / 1024)}KB`).join('\n'));
console.log('files', index.length, 'states', index.reduce((a, b) => a + b.states.length, 0));
