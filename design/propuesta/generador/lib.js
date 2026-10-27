// Waggo design proposal: SVG primitives. Tokens mirror waggo-mobile/src/shared/ui/theme.ts (ADR-018).
'use strict';
const fs = require('fs');
const pathMod = require('path');

const W = 390;
const H = 844;

// Brand rasters from the founder's sketch (marca/generar-marca.js). The final logo must be re-drawn as a vector.
const BRAND = JSON.parse(fs.readFileSync(pathMod.join(__dirname, 'brand-assets.json'), 'utf8'));
const CREAM = '#FFF0E9';
const brandUsed = { hero: false, head: false };

const THEMES = {
  light: {
    name: 'light',
    primary: '#3059A4', primaryText: '#FFFFFF', secondary: '#006E87', info: '#2E9EC4', warning: '#C97A2B',
    text: '#16212E', muted: '#3A4A5C', surface: '#FFFFFF', surface2: '#FBE2D3', background: '#FFF0E9',
    border: '#E8D2C3', danger: '#C23B3B', success: '#1F7A52',
    // proposed roles (03-sistema-de-diseno.md)
    dangerText: '#FFFFFF', borderStrong: '#8C7B70', warningText: '#9A5A17', scrim: 'rgba(22,33,46,0.40)',
    map: {
      land: '#F7EFE9', building: '#EEE2D8', park: '#DDEBD8', water: '#CFE2F2', roadMinor: '#FFFFFF',
      roadMajor: '#FFFFFF', roadCasing: '#E5D3C6', roadArterial: '#FCE6D8', label: '#5C6B7A', labelHalo: '#F7EFE9',
      routeCasing: '#FFFFFF', geofenceFill: 'rgba(0,110,135,0.08)', geofenceAlertFill: 'rgba(194,59,59,0.10)',
      accuracy: 'rgba(48,89,164,0.15)', poi: '#7B8A99',
    },
  },
  dark: {
    name: 'dark',
    primary: '#5B9BD5', primaryText: '#16212E', secondary: '#3FA3BD', info: '#7FD4EC', warning: '#F2A65A',
    text: '#FFF0E9', muted: '#8FA5B8', surface: '#1C2733', surface2: '#22303E', background: '#16212E',
    border: '#2A3B4D', danger: '#FF7A7A', success: '#4CC38A',
    dangerText: '#16212E', borderStrong: '#5E7488', warningText: '#F2A65A', scrim: 'rgba(11,17,24,0.60)',
    map: {
      land: '#1A2531', building: '#1F2B38', park: '#1D3330', water: '#14304A', roadMinor: '#283646',
      roadMajor: '#33465A', roadCasing: '#16212E', roadArterial: '#3B4F63', label: '#8FA5B8', labelHalo: '#1A2531',
      routeCasing: '#16212E', geofenceFill: 'rgba(63,163,189,0.10)', geofenceAlertFill: 'rgba(255,122,122,0.12)',
      accuracy: 'rgba(91,155,213,0.20)', poi: '#6E8396',
    },
  },
};

const HEADING = "'Baloo 2', 'Baloo2', sans-serif";
const BODY = "'Inter', sans-serif";
const TYPE = {
  display: { f: HEADING, s: 34, w: 700, lh: 38, ls: -0.5 },
  title: { f: HEADING, s: 24, w: 700, lh: 30 },
  subtitle: { f: HEADING, s: 18, w: 700, lh: 24 },
  body: { f: BODY, s: 16, w: 400, lh: 24 },
  bodyB: { f: BODY, s: 16, w: 700, lh: 24 },
  bodyM: { f: BODY, s: 16, w: 500, lh: 24 },
  caption: { f: BODY, s: 14, w: 400, lh: 20 },
  captionB: { f: BODY, s: 14, w: 700, lh: 20 },
  captionM: { f: BODY, s: 14, w: 500, lh: 20 },
  eyebrow: { f: BODY, s: 13, w: 700, lh: 16, ls: 0.8 },
  micro: { f: BODY, s: 12, w: 500, lh: 16 },
  microB: { f: BODY, s: 12, w: 700, lh: 16 },
  mapLabel: { f: BODY, s: 11, w: 500, lh: 14 },
};

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function textWidth(str, st) {
  const k = TYPE[st].f === HEADING ? 0.5 : 0.55;
  return String(str).length * TYPE[st].s * k;
}

function t(x, y, str, st, fill, o = {}) {
  const ty = TYPE[st];
  const anchor = o.anchor ? ` text-anchor="${o.anchor}"` : '';
  const ls = ty.ls ? ` letter-spacing="${ty.ls}"` : '';
  const op = o.opacity !== undefined ? ` opacity="${o.opacity}"` : '';
  const halo = o.halo ? ` stroke="${o.halo}" stroke-width="3" stroke-linejoin="round" paint-order="stroke"` : '';
  const tr = o.rotate ? ` transform="rotate(${o.rotate} ${x} ${y})"` : '';
  const id = o.id ? ` id="${esc(o.id)}"` : '';
  const s = o.upper ? String(str).toUpperCase() : str;
  return `<text${id} x="${r(x)}" y="${r(y)}" font-family="${ty.f}" font-size="${ty.s}" font-weight="${ty.w}" fill="${fill}"${anchor}${ls}${op}${halo}${tr}>${esc(s)}</text>`;
}

/** Wraps text by an estimated character budget. Returns { svg, h, lines }. */
function para(x, y, str, st, fill, maxW, o = {}) {
  const ty = TYPE[st];
  const maxChars = Math.max(8, Math.floor(maxW / (ty.s * (ty.f === HEADING ? 0.5 : 0.55))));
  const words = String(str).split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  let svg = '';
  lines.forEach((ln, i) => {
    svg += t(x, y + i * ty.lh, ln, st, fill, o);
  });
  return { svg, h: lines.length * ty.lh, lines: lines.length };
}

function r(n) {
  return Math.round(n * 10) / 10;
}

function rect(x, y, w, h, fill, o = {}) {
  const rx = o.rx !== undefined ? ` rx="${o.rx}"` : '';
  const st = o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || 1}"` : '';
  const op = o.opacity !== undefined ? ` opacity="${o.opacity}"` : '';
  const f = o.filter ? ` filter="url(#${o.filter})"` : '';
  const dash = o.dash ? ` stroke-dasharray="${o.dash}"` : '';
  const id = o.id ? ` id="${esc(o.id)}"` : '';
  return `<rect${id} x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}"${rx} fill="${fill}"${st}${op}${f}${dash}/>`;
}

function circle(cx, cy, rr, fill, o = {}) {
  const st = o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || 1}"` : '';
  const op = o.opacity !== undefined ? ` opacity="${o.opacity}"` : '';
  const f = o.filter ? ` filter="url(#${o.filter})"` : '';
  const dash = o.dash ? ` stroke-dasharray="${o.dash}"` : '';
  return `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(rr)}" fill="${fill}"${st}${op}${f}${dash}/>`;
}

function g(id, inner, o = {}) {
  const tr = o.transform ? ` transform="${o.transform}"` : '';
  const op = o.opacity !== undefined ? ` opacity="${o.opacity}"` : '';
  return `<g id="${esc(id)}"${tr}${op}>${inner}</g>`;
}

// ---------- icons (24-unit line icons, same style as src/shared/ui/icons) ----------
const ICONS = {
  home: '<path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9a1 1 0 0 0 1 1h4v-6h2v6h4a1 1 0 0 0 1-1v-9"/>',
  route: '<path d="M4 18c3 0 3-4 6-4s3 4 6 4"/><path d="M18 4a3 3 0 0 1 3 3c0 2.2-3 5-3 5s-3-2.8-3-5a3 3 0 0 1 3-3z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>',
  shield: '<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="m9 15 2 2 4-4"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  chevronR: '<path d="m9 6 6 6-6 6"/>',
  chevronUp: '<path d="m6 15 6-6 6 6"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
  locate: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M12 6l2.5 6h-5z" fill="currentColor"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4"/><path d="M12 17v.5"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  wifiOff: '<path d="M2 8.5a15 15 0 0 1 20 0"/><path d="M5 12a10 10 0 0 1 14 0"/><path d="M8.5 15.5a5 5 0 0 1 7 0"/><path d="M3 3l18 18"/>',
  battery: '<rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 11v2"/><path d="M5 10v4M8 10v4"/>',
  pin: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  send: '<path d="M4 12 20 4l-5 16-3-7z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7.5v.5"/>',
  card: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h4"/>',
  trash: '<path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13"/>',
  logout: '<path d="M15 4h4v16h-4"/><path d="m10 8-4 4 4 4"/><path d="M6 12h10"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
  moon: '<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  calendar: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  layers: '<path d="m12 4 9 5-9 5-9-5z"/><path d="m3 14 9 5 9-5"/>',
  external: '<path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7"/><path d="M12 17v.5"/>',
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
};

function icon(name, x, y, size, color, o = {}) {
  const sc = size / 24;
  const sw = o.sw || 2;
  if (name === 'paw') {
    return `<g transform="translate(${r(x)} ${r(y)}) scale(${r(sc * 100) / 100})" fill="${color}"><circle cx="12" cy="15.5" r="3.6"/><circle cx="6" cy="10" r="1.8"/><circle cx="9.5" cy="6" r="1.8"/><circle cx="14.5" cy="6" r="1.8"/><circle cx="18" cy="10" r="1.8"/></g>`;
  }
  const body = (ICONS[name] || ICONS.info).replace(/currentColor/g, color);
  const fill = o.fill ? o.fill : 'none';
  return `<g transform="translate(${r(x)} ${r(y)}) scale(${r(sc * 1000) / 1000})" fill="${fill}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;
}

function defs() {
  return `<defs>
  <filter id="shCard" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#16212E" flood-opacity="0.10"/></filter>
  <filter id="shSheet" x="-10%" y="-20%" width="120%" height="140%"><feDropShadow dx="0" dy="-4" stdDeviation="12" flood-color="#16212E" flood-opacity="0.16"/></filter>
  <filter id="shFab" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#16212E" flood-opacity="0.22"/></filter>
</defs>`;
}

// ---------- chrome ----------
function statusBar(C, o = {}) {
  const c = o.color || C.text;
  return g('StatusBar', [
    t(34, 34, '9:41', 'bodyB', c),
    `<g fill="${c}"><rect x="292" y="24" width="3" height="5" rx="1"/><rect x="297" y="22" width="3" height="7" rx="1"/><rect x="302" y="20" width="3" height="9" rx="1"/><rect x="307" y="18" width="3" height="11" rx="1"/></g>`,
    `<path d="M318 23a9 9 0 0 1 13 0M321 26a5 5 0 0 1 7 0" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`,
    rect(338, 18, 24, 12, 'none', { rx: 3.5, stroke: c, sw: 1.2, opacity: 0.6 }),
    rect(340, 20, 18, 8, c, { rx: 2 }),
  ].join(''));
}

function homeIndicator(C, o = {}) {
  return rect(128, 830, 134, 5, o.color || C.text, { rx: 2.5, id: 'HomeIndicator' });
}

function background(C) {
  return rect(0, 0, W, H, C.background, { id: 'Background' });
}

/** Nav row (44 high targets). */
function navRow(C, o = {}) {
  let s = '';
  if (o.back) s += g('BackButton', rect(12, 50, 44, 44, 'transparent', { rx: 22 }) + icon('back', 22, 60, 24, C.text));
  if (o.title) s += t(W / 2, 79, o.title, 'subtitle', C.text, { anchor: 'middle' });
  if (o.step) s += t(W - 24, 78, o.step, 'captionM', C.muted, { anchor: 'end' });
  if (o.bell !== undefined) s += bell(C, W - 60, 50, o.bell);
  if (o.right) s += o.right;
  return g('NavBar', s);
}

function bell(C, x, y, count) {
  let s = rect(x, y, 44, 44, C.surface, { rx: 22, stroke: C.border }) + icon('bell', x + 10, y + 10, 24, C.text);
  if (count) {
    s += circle(x + 34, y + 10, 10, C.primary, { stroke: C.background, sw: 2 });
    s += t(x + 34, y + 14.5, String(count), 'microB', C.primaryText, { anchor: 'middle' });
  }
  return g(count ? `NotificationBell/badge=${count}` : 'NotificationBell', s);
}

function largeTitle(C, y, title, o = {}) {
  let s = '';
  if (o.eyebrow) s += t(24, y - 34, o.eyebrow, 'eyebrow', o.eyebrowColor || C.muted, { upper: true });
  s += t(24, y, title, o.size || 'title', C.text);
  return g('Title', s);
}

function button(C, x, y, w, label, variant = 'primary', o = {}) {
  const h = o.h || 52;
  const state = o.state || 'default';
  let fill = C.primary;
  let fg = C.primaryText;
  let stroke = null;
  if (variant === 'secondary') { fill = 'transparent'; fg = C.text; stroke = C.text; }
  if (variant === 'danger') { fill = C.danger; fg = C.dangerText; }
  if (variant === 'dangerOutline') { fill = 'transparent'; fg = C.danger; stroke = C.danger; }
  if (variant === 'tertiary') { fill = 'transparent'; fg = variant === 'tertiary' && o.color ? o.color : C.primary; }
  if (variant === 'surface') { fill = C.surface; fg = C.text; stroke = C.borderStrong; }
  const op = state === 'disabled' ? 0.5 : state === 'pressed' ? 0.85 : 1;
  let s = '';
  if (state === 'focus') s += rect(x - 4, y - 4, w + 8, h + 8, 'none', { rx: (h + 8) / 2, stroke: C.primary, sw: 2 });
  s += rect(x, y, w, h, fill, { rx: h / 2, stroke, sw: 1.5 });
  const st = h < 48 ? 'captionB' : 'subtitle';
  const baseY = y + h / 2 + (st === 'subtitle' ? 6.5 : 5);
  let lx = x + w / 2;
  if (state === 'loading') {
    const lw = textWidth(label, st);
    const sx = lx - lw / 2 - 14;
    s += `<circle cx="${r(sx)}" cy="${r(y + h / 2)}" r="8" fill="none" stroke="${fg}" stroke-width="2.5" stroke-dasharray="34 50" stroke-linecap="round" opacity="0.9"/>`;
    lx += 10;
  }
  if (o.icon) {
    const lw = textWidth(label, st);
    s += icon(o.icon, lx - lw / 2 - 30, y + h / 2 - 11, 22, o.iconColor || fg);
    lx += 14;
  }
  s += t(lx, baseY, label, st, fg, { anchor: 'middle' });
  return g(`Button/${variant}/${state}`, s, { opacity: op === 1 ? undefined : op });
}

function field(C, x, y, w, label, value, o = {}) {
  const h = o.h || 48;
  const state = o.state || (value ? 'filled' : 'default');
  let s = '';
  if (label) s += t(x, y + 14, label, 'captionM', C.muted);
  const by = label ? y + 22 : y;
  const stroke = state === 'error' ? C.danger : state === 'focus' ? C.primary : C.borderStrong;
  const sw = state === 'error' || state === 'focus' ? 2 : 1;
  s += rect(x, by, w, h, o.disabled ? C.surface2 : C.surface, { rx: 14, stroke, sw });
  let tx = x + 16;
  if (o.leading) {
    s += icon(o.leading, x + 14, by + h / 2 - 11, 22, C.muted);
    tx = x + 46;
  }
  if (value) {
    if (o.multiline) s += para(tx, by + 28, value, 'body', C.text, w - 32).svg;
    else s += t(tx, by + h / 2 + 6, value, 'body', C.text);
  } else if (o.placeholder) {
    s += t(tx, by + (o.multiline ? 28 : h / 2 + 6), o.placeholder, 'body', C.muted, { opacity: 0.8 });
  }
  if (state === 'focus' && !o.multiline) {
    const cx = tx + (value ? textWidth(value, 'body') + 2 : 0);
    s += rect(cx, by + 14, 2, 20, C.primary);
  }
  if (o.trailing) s += t(x + w - 16, by + h / 2 + 5, o.trailing, 'captionB', C.primary, { anchor: 'end' });
  if (o.trailingIcon) s += icon(o.trailingIcon, x + w - 38, by + h / 2 - 11, 22, C.muted);
  let total = (by - y) + h;
  if (state === 'error' && o.error) {
    s += icon('alert', x, by + h + 8, 16, C.danger);
    const p = para(x + 22, by + h + 21, o.error, 'caption', C.danger, w - 22);
    s += p.svg;
    total += 12 + p.h;
  } else if (o.help) {
    const p = para(x, by + h + 20, o.help, 'caption', C.muted, w);
    s += p.svg;
    total += 10 + p.h;
  }
  return { svg: g(`TextField/${state}`, s), h: total };
}

function chips(C, x, y, w, items, o = {}) {
  let cx = x;
  let cy = y;
  const h = 44;
  let s = '';
  for (const it of items) {
    const label = typeof it === 'string' ? it : it.label;
    const sel = typeof it === 'object' && it.selected;
    const dis = typeof it === 'object' && it.disabled;
    const hasAvatar = typeof it === 'object' && it.avatar;
    const cw = textWidth(label, 'captionM') + 32 + (hasAvatar ? 30 : 0);
    if (cx + cw > x + w) { cx = x; cy += h + 8; }
    let c = rect(cx, cy, cw, h, sel ? C.primary : C.surface, { rx: 22, stroke: sel ? C.primary : C.border, sw: 1 });
    let lx = cx + 16;
    if (hasAvatar) {
      c += circle(cx + 24, cy + h / 2, 13, sel ? C.primaryText : C.surface2);
      c += t(cx + 24, cy + h / 2 + 5, label[0], 'captionB', sel ? C.primary : C.text, { anchor: 'middle' });
      lx += 30;
    }
    c += t(lx, cy + h / 2 + 5, label, 'captionM', sel ? C.primaryText : C.text);
    s += g(`Chip/${sel ? 'selected' : dis ? 'disabled' : 'default'}`, c, { opacity: dis ? 0.5 : undefined });
    cx += cw + 8;
  }
  return { svg: g('ChipGroup', s), h: cy - y + h };
}

function section(C, x, y, label) {
  return t(x, y, label, 'eyebrow', C.muted, { upper: true });
}

function card(C, x, y, w, h, o = {}) {
  return rect(x, y, w, h, o.fill || C.surface, { rx: o.rx !== undefined ? o.rx : 14, stroke: o.stroke === false ? null : (o.stroke || C.border), filter: o.shadow ? 'shCard' : undefined });
}

function row(C, x, y, w, title, sub, o = {}) {
  const h = o.h || (sub ? 68 : 56);
  let s = '';
  if (o.bg) s += rect(x, y, w, h, o.bg, { rx: 14 });
  let tx = x + (o.bg ? 16 : 0);
  if (o.icon) {
    s += rect(tx, y + h / 2 - 20, 40, 40, o.iconBg || C.surface2, { rx: 20 });
    s += icon(o.icon, tx + 9, y + h / 2 - 11, 22, o.iconColor || C.text);
    tx += 54;
  }
  if (o.avatar) {
    s += circle(tx + 20, y + h / 2, 20, o.avatarBg || C.surface2);
    s += t(tx + 20, y + h / 2 + 6, o.avatar, 'subtitle', o.avatarFg || C.text, { anchor: 'middle' });
    tx += 54;
  }
  const ty = sub ? y + h / 2 - 3 : y + h / 2 + 6;
  s += t(tx, ty, title, o.titleSt || 'bodyM', o.titleColor || C.text);
  if (sub) s += t(tx, ty + 21, sub, 'caption', C.muted);
  const rx = x + w - (o.bg ? 16 : 0);
  if (o.right) s += t(rx - (o.chevron ? 26 : 0), y + h / 2 + (o.rightSub ? -3 : 6), o.right, o.rightSt || 'bodyB', o.rightColor || C.text, { anchor: 'end' });
  if (o.rightSub) s += t(rx - (o.chevron ? 26 : 0), y + h / 2 + 18, o.rightSub, 'caption', o.rightSubColor || C.muted, { anchor: 'end' });
  if (o.pill) s += pill(C, rx - (o.chevron ? 26 : 0), y + h / 2 - 12, o.pill.label, o.pill.kind, { alignEnd: true });
  if (o.chevron) s += icon('chevronR', rx - 22, y + h / 2 - 11, 22, C.muted);
  if (o.divider) s += rect(x, y + h, w, 1, C.border);
  if (o.dot) s += circle(x - 10, y + h / 2, 5, C.primary);
  return { svg: g(o.id || 'Row', s), h };
}

const KIND = (C) => ({
  info: { fg: C.name === 'light' ? C.secondary : C.info, bg: C.name === 'light' ? 'rgba(46,158,196,0.14)' : 'rgba(127,212,236,0.14)', icon: 'info' },
  warning: { fg: C.warningText, bg: C.name === 'light' ? 'rgba(201,122,43,0.16)' : 'rgba(242,166,90,0.16)', icon: 'alert' },
  danger: { fg: C.danger, bg: C.name === 'light' ? 'rgba(194,59,59,0.12)' : 'rgba(255,122,122,0.16)', icon: 'alert' },
  success: { fg: C.success, bg: C.name === 'light' ? 'rgba(31,122,82,0.12)' : 'rgba(76,195,138,0.16)', icon: 'check' },
  primary: { fg: C.primary, bg: C.name === 'light' ? 'rgba(48,89,164,0.12)' : 'rgba(91,155,213,0.16)', icon: 'info' },
  muted: { fg: C.muted, bg: C.surface2, icon: 'info' },
});

function banner(C, x, y, w, kind, title, body, o = {}) {
  const k = KIND(C)[kind];
  const solid = o.solid;
  const fg = solid ? (kind === 'danger' ? C.dangerText : C.primaryText) : k.fg;
  const textC = solid ? fg : C.text;
  const tp = title ? para(x + 48, y + 26, title, 'captionB', solid ? fg : C.text, w - 64) : { svg: '', h: 0 };
  const bp = body ? para(x + 48, y + 26 + tp.h, body, 'caption', solid ? fg : C.muted, w - 64) : { svg: '', h: 0 };
  let h = 22 + tp.h + bp.h + (o.action ? 30 : 0);
  h = Math.max(h, 56);
  let s = rect(x, y, w, h, solid ? (kind === 'danger' ? C.danger : k.fg) : k.bg, { rx: 14, filter: o.shadow ? 'shCard' : undefined, stroke: solid ? null : null });
  if (!solid && C.name === 'dark') s = rect(x, y, w, h, C.surface, { rx: 14, filter: o.shadow ? 'shCard' : undefined }) + rect(x, y, w, h, k.bg, { rx: 14 });
  else if (!solid && o.shadow) s = rect(x, y, w, h, C.surface, { rx: 14, filter: 'shCard' }) + rect(x, y, w, h, k.bg, { rx: 14 });
  s += rect(x, y, 4, h, solid ? 'transparent' : k.fg, { rx: 2 });
  s += icon(o.icon || k.icon, x + 16, y + 14, 22, fg);
  s += tp.svg + bp.svg;
  if (o.action) s += t(x + 48, y + h - 14, o.action, 'captionB', solid ? fg : k.fg);
  if (o.dismiss) s += icon('close', x + w - 34, y + 12, 20, textC);
  return { svg: g(`Banner/${kind}`, s), h };
}

function pill(C, x, y, label, kind = 'primary', o = {}) {
  const k = KIND(C)[kind];
  const w = textWidth(label, 'microB') + (o.dot ? 34 : 20);
  const px = o.alignEnd ? x - w : x;
  let s = rect(px, y, w, 24, k.bg, { rx: 12 });
  let tx = px + 10;
  if (o.dot) {
    if (o.pulse) s += circle(px + 15, y + 12, 8, k.fg, { opacity: 0.25 });
    s += circle(px + 15, y + 12, 4, k.fg);
    tx += 14;
  }
  s += t(tx, y + 16.5, label, 'microB', k.fg);
  return g(`StatusPill/${label}`, s);
}

function tabBar(C, role, active, o = {}) {
  const items = role === 'owner'
    ? [['home', 'Inicio'], ['route', 'Paseos'], ['paw', 'Mascotas'], ['user', 'Configuración']]
    : [['home', 'Inicio'], ['route', 'Paseos'], ['wallet', 'Ganancias'], ['user', 'Configuración']];
  const y = H - 83;
  let s = rect(0, y, W, 83, C.surface) + rect(0, y, W, 1, C.border);
  const cw = W / items.length;
  items.forEach(([ic, label], i) => {
    const cx = cw * i + cw / 2;
    const c = label === active ? C.primary : C.muted;
    s += icon(ic, cx - 12, y + 8, 24, c);
    s += t(cx, y + 46, label, label === active ? 'microB' : 'micro', c, { anchor: 'middle' });
    if (o.badge && o.badge[label]) {
      s += circle(cx + 12, y + 10, 9, C.primary, { stroke: C.surface, sw: 2 });
      s += t(cx + 12, y + 14, String(o.badge[label]), 'microB', C.primaryText, { anchor: 'middle' });
    }
  });
  s += homeIndicator(C);
  return g(`TabBar/${role}/${active}`, s);
}

function actionFooter(C, inner, h) {
  const y = H - h;
  return g('ActionFooter', rect(0, y, W, h, C.background) + rect(0, y, W, 1, C.border) + inner + homeIndicator(C));
}

function sheet(C, top, bottom = H, o = {}) {
  const R = 20;
  const p = `M0 ${top + R} Q0 ${top} ${R} ${top} L${W - R} ${top} Q${W} ${top} ${W} ${top + R} L${W} ${bottom} L0 ${bottom} Z`;
  let s = `<path d="${p}" fill="${C.surface}" filter="url(#shSheet)"/>`;
  s += rect(W / 2 - 18, top + 8, 36, 5, C.border, { rx: 2.5, id: 'SheetHandle' });
  return g(`BottomSheet/${o.state || 'medium'}`, s);
}

function scrim(C) {
  return rect(0, 0, W, H, C.scrim, { id: 'Scrim' });
}

function fab(C, x, y, name, o = {}) {
  let s = circle(x + 24, y + 24, 24, o.fill || C.surface, { filter: 'shFab' });
  s += icon(name, x + 12, y + 12, 24, o.color || C.text, { fill: o.iconFill });
  return g(`MapFab/${o.id || name}`, s);
}

function sosFab(C, x, y) {
  let s = rect(x, y, 76, 48, C.danger, { rx: 24, filter: 'shFab' });
  s += icon('alert', x + 12, y + 13, 22, C.dangerText);
  s += t(x + 40, y + 30, 'SOS', 'captionB', C.dangerText);
  return g('MapFab/SOS', s);
}

function topBarFloating(C, title, o = {}) {
  let s = rect(16, 52, W - 32, 48, C.surface, { rx: 24, filter: 'shFab' });
  s += icon('back', 26, 64, 24, C.text);
  s += t(W / 2, 82, title, 'subtitle', C.text, { anchor: 'middle' });
  if (o.bell !== undefined) {
    s += icon('bell', W - 58, 64, 24, C.text);
    if (o.bell) { s += circle(W - 38, 64, 8, C.primary, { stroke: C.surface, sw: 2 }); s += t(W - 38, 68, String(o.bell), 'microB', C.primaryText, { anchor: 'middle' }); }
  }
  return g('TopBar/floating', s);
}

function toast(C, y, msg, kind = 'success') {
  const k = KIND(C)[kind];
  const w = W - 32;
  let s = rect(16, y, w, 52, C.text, { rx: 14, filter: 'shCard' });
  s += icon(k.icon, 30, y + 15, 22, C.background);
  s += t(62, y + 31, msg, 'captionM', C.background);
  return g(`Toast/${kind}`, s);
}

function skeleton(C, x, y, w, h, rx = 8) {
  return rect(x, y, w, h, C.surface2, { rx, id: 'Skeleton' });
}

function emptyState(C, cy, ic, title, body, o = {}) {
  let s = circle(W / 2, cy, 44, o.iconBg || C.surface2);
  s += o.iconPaw ? icon('paw', W / 2 - 22, cy - 22, 44, o.iconColor || C.primary) : icon(ic, W / 2 - 20, cy - 20, 40, o.iconColor || C.primary);
  s += t(W / 2, cy + 84, title, 'subtitle', C.text, { anchor: 'middle' });
  const p = para(W / 2, cy + 112, body, 'body', C.muted, W - 80, { anchor: 'middle' });
  s += p.svg;
  return { svg: g(o.id || 'EmptyState', s), bottom: cy + 112 + p.h };
}

function confirmSheet(C, title, body, buttons, o = {}) {
  const top = o.top || 520;
  let s = scrim(C) + sheet(C, top, H, { state: 'dialog' });
  let y = top + 44;
  if (o.icon) {
    const k = KIND(C)[o.iconKind || 'primary'];
    s += circle(48, y + 4, 24, k.bg) + icon(o.icon, 36, y - 8, 24, k.fg);
    y += 52;
  }
  s += t(24, y + 8, title, 'title', C.text);
  y += 24;
  const p = para(24, y + 16, body, 'body', C.muted, W - 48);
  s += p.svg;
  y += p.h + 24;
  if (o.extra) { s += o.extra(y); y += o.extraH || 0; }
  for (const b of buttons) {
    s += button(C, 24, y, W - 48, b.label, b.variant || 'primary', { state: b.state });
    y += 64;
  }
  s += homeIndicator(C);
  return g('ConfirmSheet', s);
}

function avatar(C, cx, cy, rr, letter, o = {}) {
  let s = circle(cx, cy, rr, o.bg || C.surface2, { stroke: o.ring, sw: o.ring ? 2 : undefined });
  s += t(cx, cy + rr * 0.32, letter, rr > 24 ? 'title' : 'subtitle', o.fg || C.text, { anchor: 'middle' });
  if (o.verified) {
    s += circle(cx + rr * 0.72, cy + rr * 0.72, 11, C.secondary, { stroke: C.surface, sw: 2 });
    s += icon('check', cx + rr * 0.72 - 7, cy + rr * 0.72 - 7, 14, '#FFFFFF', { sw: 3 });
  }
  return g('Avatar', s);
}

/** Full logo: corgi head + "Waggo" lettering, square. Ink on transparent; use on cream/light surfaces. */
function logoHero(x, y, size) {
  brandUsed.hero = true;
  return g('Logo/hero', `<use href="#brand-hero" x="${r(x)}" y="${r(y)}" width="${r(size)}" height="${r(size)}"/>`);
}

/** Head only (no lettering), ink on transparent. Height-based. */
function logoHead(x, y, h) {
  const w = (h * BRAND.headW) / BRAND.headH;
  brandUsed.head = true;
  return g('Logo/head', `<use href="#brand-head" x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}"/>`);
}

/** Head on a cream circle: the version for dark and sapphire surfaces. `d` is the diameter. */
function logoBadge(cx, cy, d, o = {}) {
  const h = d * 0.74;
  const w = (h * BRAND.headW) / BRAND.headH;
  const ring = o.ring ? ` stroke="${o.ring}" stroke-width="1"` : '';
  brandUsed.head = true;
  return g('Logo/badge', `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(d / 2)}" fill="${CREAM}"${ring}/><use href="#brand-head" x="${r(cx - w / 2)}" y="${r(cy - h / 2 + d * 0.02)}" width="${r(w)}" height="${r(h)}"/>`);
}

/** `<defs>` with the raster symbols the frames just built reference. Call once per file, after building its frames. */
function brandDefs() {
  let s = '';
  if (brandUsed.hero) s += `<symbol id="brand-hero" viewBox="0 0 ${BRAND.heroW} ${BRAND.heroH}"><image href="${BRAND.hero}" width="${BRAND.heroW}" height="${BRAND.heroH}"/></symbol>`;
  if (brandUsed.head) s += `<symbol id="brand-head" viewBox="0 0 ${BRAND.headW} ${BRAND.headH}"><image href="${BRAND.head}" width="${BRAND.headW}" height="${BRAND.headH}"/></symbol>`;
  brandUsed.hero = false;
  brandUsed.head = false;
  return s ? `<defs>${s}</defs>` : '';
}

/** App icon: sapphire (or ink) rounded square with the cream badge. */
function appIcon(x, y, size, o = {}) {
  const bg = o.dark ? '#16212E' : '#3059A4';
  const rx = o.round ? size / 2 : size * 0.225;
  return g('AppIcon', rect(x, y, size, size, bg, { rx }) + logoBadge(x + size / 2, y + size / 2, size * 0.8));
}

module.exports = {
  logoHero, logoHead, logoBadge, appIcon, brandDefs, CREAM,
  W, H, THEMES, TYPE, esc, t, para, r, rect, circle, g, icon, defs, statusBar, homeIndicator, background, navRow, bell,
  largeTitle, button, field, chips, section, card, row, banner, pill, tabBar, actionFooter, sheet, scrim, fab, sosFab,
  topBarFloating, toast, skeleton, emptyState, confirmSheet, avatar, textWidth, KIND,
};
