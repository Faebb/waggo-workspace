// Shared screen compositions (map screen with sheet, list screen chrome).
'use strict';
const L = require('./lib');
const M = require('./map');
const { W, H, t, rect, g } = L;

function view(mx, my, z, cx = 195, cy = 280) {
  return { ox: mx - cx / z, oy: my - cy / z, z, x0: 0, y0: 0 };
}

/**
 * Full-screen map + bottom sheet pattern (04-mapas.md).
 * o: { view, overlays(v), sheetTop, sheetBottom, content(top), topBar, fabs(top), banner(y)->{svg}, tabs, provider, mapError }
 */
function mapScreen(C, o) {
  const v = o.view;
  let s = '';
  if (o.mapError) {
    s += rect(0, 0, W, H, C.surface2, { id: 'Map/Error' });
    let grid = '';
    for (let x = 0; x < W; x += 40) grid += rect(x, 0, 1, H, C.border);
    for (let y = 0; y < H; y += 40) grid += rect(0, y, W, 1, C.border);
    s += g('Map/ErrorGrid', grid, { opacity: 0.6 });
  } else {
    s += M.baseMap(C, v, 0, 0, W, H, o.mapOpts || {});
  }
  if (o.overlays && !o.mapError) s += g('Map/Overlays', o.overlays(v));
  if (o.mapError && o.mapErrorContent) s += o.mapErrorContent;
  const sheetTop = o.sheetTop;
  if (!o.mapError) s += M.attribution(C, sheetTop - 30, { provider: o.provider });
  if (o.fabs) s += o.fabs(sheetTop);
  if (o.overSheetScrim) s += o.overSheetScrim;
  if (sheetTop < H) s += L.sheet(C, sheetTop, o.sheetBottom || H, { state: o.sheetState || 'medium' });
  if (o.content) s += g('SheetContent', o.content(sheetTop));
  if (o.topBar) s += o.topBar;
  if (o.banner) s += o.banner;
  if (o.tabs) s += o.tabs;
  if (o.extra) s += o.extra;
  s += L.statusBar(C);
  if (!o.tabs && !o.noHome) s += L.homeIndicator(C);
  return s;
}

/** Screen with background + status bar; content is a string. */
function plain(C, content, o = {}) {
  let s = L.background(C) + content;
  s += L.statusBar(C);
  if (!o.noHome) s += L.homeIndicator(C);
  return s;
}

function metric(C, x, y, label, value, o = {}) {
  return g(`Metric/${label}`, t(x, y, label, 'micro', C.muted) + t(x, y + 26, value, o.big ? 'title' : 'subtitle', o.color || C.text));
}

module.exports = { view, mapScreen, plain, metric };
