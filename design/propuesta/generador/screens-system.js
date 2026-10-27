'use strict';
const L = require('./lib');
const M = require('./map');
const { view, mapScreen, plain } = require('./compose');
const { W, H, t, para, rect, circle, g, icon, button, field, chips, banner, row, section, card, pill } = L;

const CW = 820;
const CH = 1480;

function components(C) {
  let s = rect(0, 0, CW, CH, C.background);
  s += t(32, 48, 'Componentes', 'title', C.text) + t(32, 72, `Tema ${C.name === 'light' ? 'claro' : 'oscuro'} · tokens de theme.ts + roles PROPUESTA`, 'caption', C.muted);
  // colour swatches
  let y = 100;
  s += section(C, 32, y, 'Color'); y += 14;
  const sw = ['primary', 'primaryText', 'secondary', 'info', 'warning', 'danger', 'success', 'text', 'muted', 'surface', 'surface2', 'background', 'border', 'dangerText', 'borderStrong', 'warningText'];
  sw.forEach((k, i) => {
    const x = 32 + (i % 8) * 96;
    const yy = y + Math.floor(i / 8) * 84;
    s += g(`Swatch/${k}`, rect(x, yy, 84, 44, C[k], { rx: 10, stroke: C.border }) + t(x, yy + 60, k, 'microB', C.text) + t(x, yy + 74, C[k], 'micro', C.muted));
  });
  y += 184;
  // typography
  s += section(C, 32, y, 'Tipografía'); y += 12;
  [['display', 'Display 34 · Baloo 2'], ['title', 'Title 24 · Baloo 2'], ['subtitle', 'Subtitle 18 · Baloo 2'], ['body', 'Body 16 · Inter'], ['caption', 'Caption 14 · Inter'], ['eyebrow', 'EYEBROW 13 · INTER BOLD'], ['micro', 'Micro 12 · Inter Medium']].forEach(([st, label]) => {
    y += L.TYPE[st].lh + 8; s += t(32, y, label, st, C.text);
  });
  y += 34;
  // buttons
  s += section(C, 32, y, 'Button'); y += 16;
  const states = ['default', 'pressed', 'focus', 'disabled', 'loading'];
  ['primary', 'secondary', 'danger'].forEach((v) => {
    states.forEach((st, i) => { s += button(C, 36 + i * 154, y, 138, st === 'loading' ? 'Cargando' : 'Pedir paseo', v, { state: st, h: 48 }); });
    y += 64;
  });
  states.forEach((st, i) => { s += t(36 + i * 154 + 69, y + 4, st, 'micro', C.muted, { anchor: 'middle' }); });
  y += 30;
  // fields
  s += section(C, 32, y, 'TextField'); y += 10;
  const fs = [['default', '', 'Correo', { placeholder: 'tu@correo.com' }], ['focus', 'valentina@', 'Correo', { state: 'focus' }], ['filled', 'valentina@correo.com', 'Correo', {}], ['error', 'valentina@', 'Correo', { state: 'error', error: 'Escribe un correo válido.' }]];
  fs.forEach(([st, val, lab, o], i) => { s += field(C, 32 + (i % 2) * 384, y + Math.floor(i / 2) * 110, 360, `${lab} · ${st}`, val, o).svg; });
  y += 230;
  // chips + pills
  s += section(C, 32, y, 'Chip · StatusPill'); y += 12;
  s += chips(C, 32, y, 380, [{ label: 'Luna', selected: true, avatar: true }, { label: 'Max', avatar: true }, '60 min', { label: 'Ahora', selected: true }]).svg;
  let px = 440;
  [['Buscando paseador', 'primary', true], ['Aceptado', 'success'], ['En curso', 'primary', true], ['Detenido', 'warning'], ['Fuera de la zona', 'danger'], ['Cancelado', 'muted']].forEach(([l, k, d], i) => {
    s += pill(C, px + (i % 2) * 180, y + 4 + Math.floor(i / 2) * 32, l, k, { dot: !!d || k !== 'muted', pulse: d });
  });
  y += 120;
  // banners
  s += section(C, 32, y, 'Banner'); y += 12;
  s += banner(C, 32, y, 370, 'info', 'Bruno perdió la señal.', 'Su teléfono guarda la ruta y la enviará al reconectarse.').svg;
  s += banner(C, 418, y, 370, 'warning', 'Sin conexión.', 'Mostramos lo último que recibimos.', { icon: 'wifiOff' }).svg;
  y += 92;
  s += banner(C, 32, y, 370, 'danger', 'El paseo salió de la zona acordada', 'Luna · a 1,8 km · hace 1 min', { solid: true }).svg;
  s += banner(C, 418, y, 370, 'success', 'Pagado · $ 23.000', 'Se cobró al terminar el paseo.').svg;
  y += 100;
  // rows + empty
  s += section(C, 32, y, 'Row · Avatar · Toast'); y += 6;
  s += row(C, 32, y, 370, 'Información personal', 'Nombre y celular', { icon: 'user', chevron: true, divider: true }).svg;
  s += L.avatar(C, 460, y + 34, 24, 'B', { verified: true }) + L.avatar(C, 530, y + 34, 24, 'L', { fg: C.primary });
  s += `<g transform="translate(400 ${y + 70 - 760})">${L.toast(C, 760, 'Aprobaste a Andrés Gómez.', 'success')}</g>`;
  y += 150;
  // map fabs
  s += section(C, 32, y, 'MapFab · Marcadores'); y += 14;
  s += L.fab(C, 32, y, 'locate', { color: C.primary }) + L.fab(C, 96, y, 'compass') + L.sosFab(C, 160, y);
  s += M.pinHome(C, 300, y + 48) + M.userDot(C, 360, y + 24) + M.walkerLive(C, 440, y + 30, { heading: 30, pulse: false }) + M.cluster(C, 520, y + 26, 8) + M.pricePill(C, 610, y + 46, '$ 18.400', true) + M.alertMarker(C, 710, y + 26) + M.alertMarker(C, 770, y + 26, { kind: 'warning' });
  return s;
}

function mapBoard(C) {
  const v = view(M.PTS.walker[0] - 20, M.PTS.walker[1] + 120, 0.8, 195, 330);
  const overlays = (vv) => {
    let o = M.geofence(C, vv, ...M.PTS.pickup, 260);
    o += M.route(C, vv, M.PTS.walked, 'walked');
    o += M.route(C, vv, [M.PTS.walker, [M.vx(10), M.hy(9)], [M.vx(11), M.hy(9)]], 'pending');
    const [sx, sy] = M.P(vv, ...M.PTS.pickup); o += M.pinHome(C, sx, sy);
    const [wx, wy] = M.P(vv, ...M.PTS.walker); o += M.walkerLive(C, wx, wy, { heading: 20, label: 'Hace 10 s' });
    const [ux, uy] = M.P(vv, M.vx(6), M.hy(17)); o += M.userDot(C, ux, uy);
    const [cx, cy] = M.P(vv, M.vx(6), M.hy(10)); o += M.cluster(C, cx, cy, 4);
    const [nx, ny] = M.P(vv, M.vx(11), M.hy(14)); o += M.walkerSmall(C, nx, ny);
    return o;
  };
  const content = (tp) => {
    let c = t(24, tp + 44, 'Leyenda', 'eyebrow', C.muted, { upper: true });
    const items = [
      ['Recorrido', `<path d="M24 0h32" stroke="${C.primary}" stroke-width="6" stroke-linecap="round"/>`],
      ['Pendiente', `<path d="M24 0h32" stroke="${C.primary}" stroke-width="4" stroke-dasharray="2 9" stroke-linecap="round" opacity="0.6"/>`],
      ['Zona acordada', `<path d="M24 0h32" stroke="${C.secondary}" stroke-width="2" stroke-dasharray="8 6"/>`],
      ['Zona en alerta', `<path d="M24 0h32" stroke="${C.danger}" stroke-width="3"/>`],
    ];
    items.forEach(([l, d], i) => {
      const x = (i % 2) * 180;
      const y = tp + 76 + Math.floor(i / 2) * 32;
      c += `<g transform="translate(${x} ${y})">${d}</g>` + t(x + 68, y + 5, l, 'caption', C.text);
    });
    c += para(24, tp + 160, 'El mapa base es una ilustración plausible, no geografía real. El estilo final se arma en Mapbox Studio o en el Map ID de Google con los tokens map.* de tokens.json.', 'caption', C.muted, W - 48).svg;
    return c;
  };
  return mapScreen(C, { view: v, overlays, sheetTop: 600, content, fabs: (tp) => L.fab(C, W - 64, tp - 112, 'locate', { color: C.primary }) + L.fab(C, W - 64, tp - 172, 'compass') });
}

function tabsBoard(C) {
  let s = rect(0, 0, W, H, C.background);
  s += t(24, 60, 'Barras de pestañas', 'title', C.text);
  s += para(24, 88, 'Dueño: igual a ADR-019. Paseador: PROPUESTA de 4 pestañas (hoy solo Inicio y Configuración).', 'caption', C.muted, W - 48).svg;
  const bar = (y, role, active, badge) => {
    const inner = L.tabBar(C, role, active, { badge });
    return `<g transform="translate(0 ${y - (H - 83)})">${inner}</g>`;
  };
  let y = 150;
  s += t(24, y, 'Dueño · Inicio activo', 'captionB', C.text); s += bar(y + 12, 'owner', 'Inicio'); y += 120;
  s += t(24, y, 'Dueño · Paseos activo, con paseo en curso', 'captionB', C.text); s += bar(y + 12, 'owner', 'Paseos', { Paseos: 1 }); y += 120;
  s += t(24, y, 'Paseador · Inicio activo', 'captionB', C.text); s += bar(y + 12, 'walker', 'Inicio'); y += 120;
  s += t(24, y, 'Paseador · Ganancias activo', 'captionB', C.text); s += bar(y + 12, 'walker', 'Ganancias'); y += 120;
  s += para(24, y + 4, 'La barra se oculta en pantallas de detalle (paseo en vivo, chat, pedir paseo), como define ADR-019. El contador usa primary, no rojo: el rojo es solo para errores y emergencias.', 'caption', C.muted, W - 48).svg;
  return s;
}

function walkerSettings(C) {
  let s = t(24, 100, 'Configuración', 'title', C.text);
  let y = 124;
  s += g('ProfileCard', card(C, 24, y, W - 48, 84) + L.avatar(C, 68, y + 42, 24, 'A', { bg: C.surface2, verified: true }) + t(104, y + 38, 'Andrés Gómez', 'bodyB', C.text) + t(104, y + 58, 'Paseador verificado', 'captionM', C.secondary) + icon('chevronR', W - 64, y + 31, 22, C.muted));
  y += 112;
  s += section(C, 24, y, 'Paseador'); y += 8;
  let rw = row(C, 24, y, W - 48, 'Mis datos de paseador', 'Documento •••• 4050 · 300 123 4567', { icon: 'shield', chevron: true, divider: true }); s += rw.svg; y += rw.h;
  rw = row(C, 24, y, W - 48, 'Cuenta para recibir pagos', 'Pronto', { icon: 'wallet', divider: true }); s += rw.svg; y += rw.h;
  rw = row(C, 24, y, W - 48, 'Ubicación', 'Siempre · necesaria durante el paseo', { icon: 'locate', chevron: true, divider: true }); s += rw.svg; y += rw.h + 22;
  s += section(C, 24, y, 'Cuenta y preferencias'); y += 8;
  rw = row(C, 24, y, W - 48, 'Cuenta y seguridad', 'Correo, contraseña, Google y Microsoft', { icon: 'lock', chevron: true, divider: true }); s += rw.svg; y += rw.h;
  rw = row(C, 24, y, W - 48, 'Tema', 'Claro', { icon: 'sun', chevron: true, divider: true }); s += rw.svg; y += rw.h;
  rw = row(C, 24, y, W - 48, 'Usar Waggo como dueño', 'Pide paseos para tus perros', { icon: 'paw', chevron: true }); s += rw.svg; y += rw.h + 16;
  s += button(C, 24, Math.min(y, 686), W - 48, 'Cerrar sesión', 'secondary', { icon: 'logout' });
  s += L.tabBar(C, 'walker', 'Configuración');
  return plain(C, s, { noHome: true });
}

// ---------- Marca ----------
function brandBoard(C) {
  const dark = C.name === 'dark';
  let s = rect(0, 0, W, H, C.background);
  s += t(24, 60, 'Marca', 'title', C.text);
  s += para(24, 86, 'Boceto del fundador recoloreado a la paleta. El logo final se redibuja en vector.', 'caption', C.muted, W - 48).svg;
  // full logo
  s += card(C, 24, 124, W - 48, 216, { fill: dark ? C.surface : C.surface2, stroke: false });
  s += dark ? L.logoBadge(W / 2, 232, 168) : L.logoHero(W / 2 - 96, 132, 192);
  s += t(36, 156, 'Logo completo', 'captionB', C.muted);
  // head + app icons
  let y = 368;
  s += section(C, 24, y, 'Cabeza e íconos de app'); y += 16;
  s += dark ? L.logoBadge(60, y + 40, 76) : L.logoHead(34, y, 80);
  s += L.appIcon(108, y + 8, 64) + L.appIcon(184, y + 8, 64, { dark: true }) + L.appIcon(260, y + 8, 64, { round: true });
  s += t(140, y + 96, 'Zafiro', 'micro', C.muted, { anchor: 'middle' }) + t(216, y + 96, 'Oscuro', 'micro', C.muted, { anchor: 'middle' }) + t(292, y + 96, 'Adaptativo', 'micro', C.muted, { anchor: 'middle' });
  y += 126;
  // size test
  s += section(C, 24, y, 'Prueba de tamaño'); y += 16;
  [72, 48, 32, 24].forEach((h, i) => {
    const x = 36 + i * 84;
    s += dark ? L.logoBadge(x + 28, y + 38, h + 12) : L.logoHead(x, y + 76 - h, h);
    s += t(x + 28, y + 100, `${h} px`, 'micro', C.muted, { anchor: 'middle' });
  });
  y += 130;
  // colour roles
  s += section(C, 24, y, 'Colores de la marca'); y += 12;
  [['Trazo', '#16212E'], ['Rótulo', '#3059A4'], ['Fondo', '#FFF0E9'], ['Collar', C.secondary]].forEach(([n, c], i) => {
    const x = 24 + i * 88;
    s += g(`Swatch/brand/${n}`, rect(x, y, 80, 36, c, { rx: 10, stroke: C.border }) + t(x, y + 54, n, 'microB', C.text) + t(x, y + 68, c, 'micro', C.muted));
  });
  y += 96;
  s += para(24, y, 'Margen mínimo = altura de una oreja. Cabeza sola desde 32 px; por debajo, versión simplificada (pendiente). En oscuro y sobre zafiro siempre sobre el círculo crema.', 'caption', C.muted, W - 48).svg;
  return plain(C, s, { noHome: true });
}

function splash(C) {
  const dark = C.name === 'dark';
  let s = rect(0, 0, W, H, C.background);
  s += dark ? L.logoBadge(W / 2, 316, 220) : L.logoHero(W / 2 - 130, 190, 260);
  s += t(W / 2, 520, 'Waggo', 'display', C.text, { anchor: 'middle' });
  s += t(W / 2, 550, 'Paseo seguro de perros', 'body', C.muted, { anchor: 'middle' });
  s += g('Spinner', circle(W / 2, 700, 14, 'none', { stroke: C.border, sw: 3 }) + `<path d="M${W / 2} 686a14 14 0 0 1 14 14" fill="none" stroke="${C.primary}" stroke-width="3" stroke-linecap="round"/>`);
  return s;
}

module.exports = [
  { file: '00-sistema-marca', title: 'Marca · logo, ícono de app, tamaños y splash', frames: [['Tablero claro', 'light', brandBoard], ['Tablero oscuro', 'dark', brandBoard], ['Splash claro', 'light', splash], ['Splash oscuro', 'dark', splash]] },
  { file: '00-sistema-componentes', title: 'Sistema de diseño · componentes y estados', frameW: CW, frameH: CH, frames: [['Claro', 'light', components], ['Oscuro', 'dark', components]] },
  { file: '00-sistema-mapa', title: 'Sistema de mapas · estilo base, marcadores, ruta y geocerca', frames: [['Mapa base claro', 'light', mapBoard], ['Mapa base oscuro', 'dark', mapBoard]] },
  { file: 'comun-navegacion-tabs', title: 'Navegación · pestañas de ambos roles (ADR-019)', frames: [['Variantes claro', 'light', tabsBoard], ['Variantes oscuro', 'dark', tabsBoard], ['Configuración del paseador', 'light', walkerSettings]] },
];
