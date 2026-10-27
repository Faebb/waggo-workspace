// Stylized base map (plausible street grid) + Waggo markers, route and geofence. Not real geography.
'use strict';
const L = require('./lib');
const { W, H, t, r, rect, circle, g, icon } = L;

// City in "map units" (1 unit ~ 1.6 m). Irregular grid like a Latin American city, plus an avenue, a canal and parks.
const HR = [];
const VR = [];
(function build() {
  let y = 0;
  let i = 0;
  while (y < 2600) {
    HR.push({ y, major: i % 5 === 2, name: `Calle ${92 - i * 2}` });
    y += 60 + ((i * 37) % 19);
    i++;
  }
  let x = 0;
  let j = 0;
  while (x < 2000) {
    VR.push({ x, major: j % 4 === 1, name: `Carrera ${j * 2 + 1}` });
    x += 84 + ((j * 53) % 23);
    j++;
  }
})();
const hy = (i) => HR[i].y;
const vx = (j) => VR[j].x;

const PARKS = [
  { i: 12, j: 6, di: 3, dj: 2, name: 'Parque Los Alisos' },
  { i: 19, j: 11, di: 2, dj: 2, name: 'Parque El Retiro' },
  { i: 7, j: 2, di: 1, dj: 1, name: '' },
  { i: 24, j: 4, di: 2, dj: 2, name: 'Parque La Pradera' },
  { i: 4, j: 13, di: 2, dj: 1, name: '' },
];
const CANAL = [[-50, 520], [200, 470], [420, 560], [640, 500], [900, 600], [1150, 540], [1400, 640], [1700, 600], [2050, 680]];
const AVENUE = [[-100, 2400], [2100, 700]];
const POIS = [
  { i: 15, j: 8, kind: 'vet', name: 'Veterinaria Huellitas' },
  { i: 10, j: 10, kind: 'pet', name: 'Tienda Mascotas & Co' },
  { i: 18, j: 5, kind: 'bus', name: 'Estación Calle 56' },
];

/** view: { ox, oy, z } map point shown at frame (x0, y0). */
function P(view, mx, my) {
  return [view.x0 + (mx - view.ox) * view.z, view.y0 + (my - view.oy) * view.z];
}

function baseMap(C, view, x0, y0, w, h, o = {}) {
  const M = C.map;
  const v = { ...view, x0, y0 };
  const z = v.z;
  const minorW = Math.max(3, 9 * z);
  const majorW = Math.max(5, 15 * z);
  const vis = (mx, my, pad = 60) => {
    const [sx, sy] = P(v, mx, my);
    return sx > x0 - pad * 3 && sx < x0 + w + pad * 3 && sy > y0 - pad * 3 && sy < y0 + h + pad * 3;
  };
  let s = rect(x0, y0, w, h, M.land, { id: 'Map/Land' });
  // blocks with buildings (only at street zoom)
  let blocks = '';
  if (z >= 0.6) {
    for (let i = 0; i < HR.length - 1; i++) {
      for (let j = 0; j < VR.length - 1; j++) {
        if (!vis(vx(j), hy(i)) && !vis(vx(j + 1), hy(i + 1))) continue;
        const [ax, ay] = P(v, vx(j), hy(i));
        const [bx, by] = P(v, vx(j + 1), hy(i + 1));
        const inset = minorW / 2 + 4;
        if (bx - ax - 2 * inset < 6 || by - ay - 2 * inset < 6) continue;
        blocks += rect(ax + inset, ay + inset, bx - ax - 2 * inset, by - ay - 2 * inset, M.building, { rx: 3 });
      }
    }
  }
  s += g('Map/Buildings', blocks);
  // parks
  let parks = '';
  let parkLabels = '';
  for (const p of PARKS) {
    const [ax, ay] = P(v, vx(p.j), hy(p.i));
    const [bx, by] = P(v, vx(p.j + p.dj), hy(p.i + p.di));
    parks += rect(ax, ay, bx - ax, by - ay, M.park, { rx: 4 });
    if (p.name && z >= 0.5) parkLabels += t((ax + bx) / 2, (ay + by) / 2 + 4, p.name, 'mapLabel', C.name === 'light' ? '#3F6B48' : '#7FB08A', { anchor: 'middle', halo: M.park });
  }
  s += g('Map/Parks', parks);
  // canal
  const canal = CANAL.map(([mx, my]) => P(v, mx, my));
  let cd = `M${r(canal[0][0])} ${r(canal[0][1])}`;
  for (let k = 1; k < canal.length; k++) {
    const [px, py] = canal[k - 1];
    const [qx, qy] = canal[k];
    cd += ` Q${r(px + (qx - px) * 0.5)} ${r(py)} ${r((px + qx) / 2)} ${r((py + qy) / 2)}`;
  }
  cd += ` L${r(canal[canal.length - 1][0])} ${r(canal[canal.length - 1][1])}`;
  s += g('Map/Water', `<path d="${cd}" fill="none" stroke="${M.water}" stroke-width="${r(Math.max(8, 26 * z))}" stroke-linecap="round"/>`);
  // roads: casing then fill
  let casing = '';
  let fill = '';
  let labels = '';
  for (const hr of HR) {
    const [ax, ay] = P(v, -50, hr.y);
    const [bx] = P(v, 2100, hr.y);
    if (ay < y0 - 20 || ay > y0 + h + 20) continue;
    const rw = hr.major ? majorW : minorW;
    if (!hr.major && z < 0.3) continue;
    casing += `<line x1="${r(ax)}" y1="${r(ay)}" x2="${r(bx)}" y2="${r(ay)}" stroke="${M.roadCasing}" stroke-width="${r(rw + 2)}"/>`;
    fill += `<line x1="${r(ax)}" y1="${r(ay)}" x2="${r(bx)}" y2="${r(ay)}" stroke="${hr.major ? M.roadArterial : M.roadMinor}" stroke-width="${r(rw)}"/>`;
    if (hr.major || z >= 0.9) {
      const lx = x0 + (o.labelX || 70) + ((hr.y * 7) % 120);
      labels += t(lx, ay + 4, hr.name, 'mapLabel', M.label, { halo: hr.major ? M.roadArterial : M.roadMinor });
    }
  }
  for (const vr of VR) {
    const [ax, ay] = P(v, vr.x, -50);
    const [, by] = P(v, vr.x, 2700);
    if (ax < x0 - 20 || ax > x0 + w + 20) continue;
    const rw = vr.major ? majorW : minorW;
    if (!vr.major && z < 0.3) continue;
    casing += `<line x1="${r(ax)}" y1="${r(ay)}" x2="${r(ax)}" y2="${r(by)}" stroke="${M.roadCasing}" stroke-width="${r(rw + 2)}"/>`;
    fill += `<line x1="${r(ax)}" y1="${r(ay)}" x2="${r(ax)}" y2="${r(by)}" stroke="${vr.major ? M.roadArterial : M.roadMinor}" stroke-width="${r(rw)}"/>`;
    if (vr.major || z >= 0.9) {
      const ly = y0 + 180 + ((vr.x * 5) % 260);
      labels += t(ax + 4, ly, vr.name, 'mapLabel', M.label, { halo: vr.major ? M.roadArterial : M.roadMinor, rotate: -90 });
    }
  }
  const [a1x, a1y] = P(v, AVENUE[0][0], AVENUE[0][1]);
  const [a2x, a2y] = P(v, AVENUE[1][0], AVENUE[1][1]);
  casing += `<line x1="${r(a1x)}" y1="${r(a1y)}" x2="${r(a2x)}" y2="${r(a2y)}" stroke="${M.roadCasing}" stroke-width="${r(majorW + 6)}"/>`;
  fill += `<line x1="${r(a1x)}" y1="${r(a1y)}" x2="${r(a2x)}" y2="${r(a2y)}" stroke="${M.roadArterial}" stroke-width="${r(majorW + 4)}"/>`;
  {
    // avenue label near the frame centre
    const ang = (Math.atan2(a2y - a1y, a2x - a1x) * 180) / Math.PI;
    const tt = Math.min(1, Math.max(0, ((x0 + w * 0.3) - a1x) / (a2x - a1x)));
    const lx = a1x + (a2x - a1x) * tt;
    const ly = a1y + (a2y - a1y) * tt;
    if (ly > y0 + 20 && ly < y0 + h - 20) labels += t(lx, ly + 4, 'Avenida Los Cerros', 'mapLabel', M.label, { halo: M.roadArterial, rotate: r(ang) });
  }
  s += g('Map/Roads', `<g stroke-linecap="butt">${casing}${fill}</g>`);
  // POIs (only relevant categories)
  let pois = '';
  if (z >= 0.75) {
    for (const p of POIS) {
      const [px, py] = P(v, (vx(p.j) + vx(p.j + 1)) / 2, (hy(p.i) + hy(p.i + 1)) / 2);
      if (px < x0 || px > x0 + w || py < y0 || py > y0 + h) continue;
      pois += circle(px, py, 9, M.poi, { stroke: M.land, sw: 1.5 });
      const glyph = p.kind === 'vet' ? '<path d="M-3.5 0h7M0 -3.5v7" stroke="#fff" stroke-width="2"/>' : p.kind === 'bus' ? '<rect x="-3.5" y="-4" width="7" height="7" rx="1.5" fill="#fff"/>' : '<circle r="3" fill="#fff"/>';
      pois += `<g transform="translate(${r(px)} ${r(py)})">${glyph}</g>`;
      pois += t(px + 14, py + 4, p.name, 'mapLabel', M.label, { halo: M.land });
    }
  }
  s += g('Map/POIs', pois);
  s += g('Map/Labels', labels + parkLabels);
  return g(`MapView/${C.name}`, s);
}

// ---------- overlays (all in frame coords; use P(view,...) to place) ----------
function routePath(view, pts) {
  return pts.map(([mx, my], k) => {
    const [x, y] = P(view, mx, my);
    return `${k ? 'L' : 'M'}${r(x)} ${r(y)}`;
  }).join(' ');
}

function route(C, view, pts, kind = 'walked') {
  const d = routePath(view, pts);
  if (kind === 'walked') {
    return g('Route/walked', `<path d="${d}" fill="none" stroke="${C.map.routeCasing}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${C.primary}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`);
  }
  if (kind === 'stale') {
    return g('Route/unsent', `<path d="${d}" fill="none" stroke="${C.muted}" stroke-width="4" stroke-dasharray="2 8" stroke-linecap="round" stroke-linejoin="round"/>`);
  }
  return g('Route/pending', `<path d="${d}" fill="none" stroke="${C.primary}" stroke-width="4" stroke-dasharray="2 9" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>`);
}

function geofence(C, view, mx, my, radiusUnits, alert = false) {
  const [x, y] = P(view, mx, my);
  const rr = radiusUnits * view.z;
  return g(`Geofence/${alert ? 'alert' : 'normal'}`, circle(x, y, rr, alert ? C.map.geofenceAlertFill : C.map.geofenceFill, { stroke: alert ? C.danger : C.secondary, sw: alert ? 3 : 2, dash: alert ? undefined : '8 6' }));
}

function pinHome(C, x, y, o = {}) {
  const color = o.color || C.primary;
  let s = '';
  if (o.lifted) s += `<ellipse cx="${x}" cy="${y + 2}" rx="8" ry="3" fill="#16212E" opacity="0.25"/>`;
  const yy = o.lifted ? y - 14 : y;
  s += `<path d="M${x} ${yy} L${x - 10} ${yy - 14} A16 16 0 1 1 ${x + 10} ${yy - 14} Z" fill="${color}" stroke="#FFFFFF" stroke-width="2.5" filter="url(#shFab)"/>`;
  s += icon(o.icon || 'home', x - 9, yy - 35, 18, '#FFFFFF', { sw: 2.4 });
  return g(o.id || 'Marker/Pickup', s);
}

function userDot(C, x, y, o = {}) {
  let s = circle(x, y, o.accuracy || 26, C.map.accuracy, { stroke: o.accuracy > 40 ? C.primary : undefined, sw: 1, opacity: 1 });
  if (o.heading !== undefined) s += `<path d="M${x} ${y} L${x - 14} ${y - 30} A32 32 0 0 1 ${x + 14} ${y - 30} Z" fill="${C.primary}" opacity="0.30" transform="rotate(${o.heading} ${x} ${y})"/>`;
  s += circle(x, y, 10, '#FFFFFF', { filter: 'shFab' }) + circle(x, y, 7, C.primary);
  return g('Marker/MyLocation', s);
}

function walkerLive(C, x, y, o = {}) {
  const stale = o.stale;
  const col = stale ? C.muted : C.primary;
  let s = '';
  if (!stale && o.pulse !== false) s += circle(x, y, 34, col, { opacity: 0.14 });
  if (o.heading !== undefined && !stale) s += `<path d="M${x} ${y} L${x - 16} ${y - 40} A42 42 0 0 1 ${x + 16} ${y - 40} Z" fill="${col}" opacity="0.35" transform="rotate(${o.heading} ${x} ${y})"/>`;
  s += circle(x, y, 20, col, { stroke: '#FFFFFF', sw: 3, filter: 'shFab' });
  s += t(x, y + 6.5, o.letter || 'B', 'subtitle', stale ? '#FFFFFF' : C.primaryText, { anchor: 'middle' });
  if (o.dog !== false) {
    s += circle(x + 18, y + 16, 12, C.surface, { stroke: col, sw: 2 });
    s += icon('paw', x + 11, y + 9, 14, col);
  }
  if (o.label) {
    const lw = L.textWidth(o.label, 'microB') + 16;
    s += rect(x - lw / 2, y - 52, lw, 22, stale ? C.muted : C.surface, { rx: 11, filter: 'shCard' });
    s += t(x, y - 37, o.label, 'microB', stale ? '#FFFFFF' : C.text, { anchor: 'middle' });
  }
  return g(stale ? 'Marker/WalkerLive/stale' : 'Marker/WalkerLive', s);
}

function startDot(C, x, y) {
  return g('Marker/RouteStart', circle(x, y, 7, C.surface, { stroke: C.primary, sw: 3 }));
}

function cluster(C, x, y, n, color) {
  return g(`Marker/Cluster/${n}`, circle(x, y, 20, color || C.secondary, { opacity: 0.25 }) + circle(x, y, 15, color || C.secondary, { stroke: '#FFFFFF', sw: 2.5, filter: 'shFab' }) + t(x, y + 5, String(n), 'captionB', '#FFFFFF', { anchor: 'middle' }));
}

function walkerSmall(C, x, y, o = {}) {
  const col = o.color || C.secondary;
  return g('Marker/NearbyWalker', circle(x, y, 13, col, { stroke: '#FFFFFF', sw: 2.5, filter: 'shFab' }) + icon('user', x - 8, y - 8, 16, '#FFFFFF', { sw: 2.4 }));
}

function pricePill(C, x, y, label, selected = false, o = {}) {
  const w = L.textWidth(label, 'captionB') + 22;
  const bg = o.taken ? C.surface2 : selected ? C.primary : C.surface;
  const fg = o.taken ? C.muted : selected ? C.primaryText : C.text;
  let s = rect(x - w / 2, y - 40, w, 30, bg, { rx: 15, stroke: selected ? '#FFFFFF' : C.border, sw: selected ? 2 : 1, filter: 'shFab' });
  s += `<path d="M${x - 6} ${y - 11} L${x} ${y - 3} L${x + 6} ${y - 11} Z" fill="${bg}"/>`;
  s += t(x, y - 20, label, 'captionB', fg, { anchor: 'middle' });
  return g(`Marker/Request/${selected ? 'selected' : o.taken ? 'taken' : 'default'}`, s);
}

function alertMarker(C, x, y, o = {}) {
  const col = o.kind === 'warning' ? C.warning : C.danger;
  let s = circle(x, y, 26, col, { opacity: 0.18 });
  s += `<rect x="${x - 13}" y="${y - 13}" width="26" height="26" rx="4" fill="${col}" stroke="#FFFFFF" stroke-width="2.5" transform="rotate(45 ${x} ${y})" filter="url(#shFab)"/>`;
  if (o.kind === 'warning') s += icon('clock', x - 8, y - 8, 16, '#FFFFFF', { sw: 2.4 });
  else s += t(x, y + 6, '!', 'subtitle', '#FFFFFF', { anchor: 'middle' });
  return g(`Marker/Alert/${o.kind || 'danger'}`, s);
}

function attribution(C, y, o = {}) {
  const provider = o.provider || 'mapbox';
  let s = rect(10, y, provider === 'google' ? 58 : 64, 20, C.name === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(22,33,46,0.85)', { rx: 4 });
  s += t(18, y + 14.5, provider === 'google' ? 'Google' : 'mapbox', 'microB', C.name === 'light' ? '#16212E' : '#FFF0E9');
  s += circle(W - 22, y + 10, 10, C.name === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(22,33,46,0.85)');
  s += t(W - 22, y + 14.5, 'i', 'microB', C.name === 'light' ? '#16212E' : '#FFF0E9', { anchor: 'middle' });
  return g(`MapAttribution/${provider}`, s);
}

// Canonical points (map units)
const PTS = {
  pickup: [vx(8), hy(16)],
  walked: [[vx(8), hy(16)], [vx(8), hy(14)], [vx(7), hy(14)], [vx(7), hy(12)], [vx(8), hy(12)], [vx(9), hy(12)], [vx(9), hy(11)], [vx(10), hy(11)], [vx(10), (hy(10) + hy(11)) / 2]],
  walker: [vx(10), (hy(10) + hy(11)) / 2],
  full: [[vx(8), hy(16)], [vx(8), hy(14)], [vx(7), hy(14)], [vx(7), hy(12)], [vx(8), hy(12)], [vx(9), hy(12)], [vx(9), hy(11)], [vx(10), hy(11)], [vx(10), hy(9)], [vx(11), hy(9)], [vx(11), hy(13)], [vx(10), hy(13)], [vx(10), hy(16)], [vx(8), hy(16)]],
  walkerStart: [vx(11), hy(19)],
  toPickup: [[vx(11), hy(19)], [vx(11), hy(18)], [vx(10), hy(18)], [vx(10), hy(16)], [vx(8), hy(16)]],
  outside: [[vx(8), hy(16)], [vx(8), hy(12)], [vx(10), hy(12)], [vx(10), hy(6)], [vx(12), hy(6)], [vx(12), hy(1)], [vx(13), hy(1)]],
};

module.exports = { HR, VR, hy, vx, P, baseMap, route, geofence, pinHome, userDot, walkerLive, startDot, cluster, walkerSmall, pricePill, alertMarker, attribution, PTS };
