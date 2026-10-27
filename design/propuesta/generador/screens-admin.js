'use strict';
const L = require('./lib');
const M = require('./map');
const { view, mapScreen, plain } = require('./compose');
const { W, H, t, para, rect, circle, g, icon, button, field, banner, row, section, card, pill } = L;

function segmented(C, y, active) {
  let s = rect(24, y, W - 48, 44, C.surface2, { rx: 22 });
  const half = (W - 56) / 2;
  ['Paseadores', 'Operación'].forEach((lbl, i) => {
    const x = 28 + i * half;
    if (lbl === active) s += rect(x, y + 4, half, 36, C.surface, { rx: 18, filter: 'shCard' });
    s += t(x + half / 2, y + 27, lbl, 'captionB', lbl === active ? C.text : C.muted, { anchor: 'middle' });
  });
  return g(`SegmentedControl/${active}`, s);
}

function walkerCard(C, y, name, doc, phone, exp, when) {
  let c = card(C, 24, y, W - 48, 208, { shadow: true });
  c += L.avatar(C, 64, y + 44, 22, name[0], { fg: C.primary });
  c += t(98, y + 40, name, 'bodyB', C.text) + t(98, y + 60, when, 'caption', C.muted);
  c += t(44, y + 96, 'Documento', 'micro', C.muted) + t(44, y + 116, doc, 'captionM', C.text) + icon('eye', 44 + L.textWidth(doc, 'captionM') + 8, y + 103, 18, C.primary);
  c += t(214, y + 96, 'Celular', 'micro', C.muted) + t(214, y + 116, phone, 'captionM', C.text);
  c += t(44, y + 142, `"${exp}"`, 'caption', C.muted);
  c += button(C, 44, y + 156, (W - 100) / 2, 'Rechazar', 'secondary', { h: 40 });
  c += button(C, 56 + (W - 100) / 2, y + 156, (W - 100) / 2, 'Aprobar', 'primary', { h: 40 });
  return g(`PendingWalkerCard/${name}`, c);
}

function queue(C, state) {
  let s = L.navRow(C, { back: true });
  s += t(24, 130, 'Administración', 'eyebrow', C.muted, { upper: true });
  s += t(24, 160, 'Verificación', 'title', C.text);
  s += segmented(C, 180, 'Paseadores');
  if (state === 'empty') {
    s += L.emptyState(C, 380, 'shield', 'No hay paseadores por verificar.', 'Cuando alguien envíe su perfil, aparecerá aquí.').svg;
    return plain(C, s);
  }
  if (state === 'error') {
    s += L.emptyState(C, 380, 'wifiOff', 'No pudimos cargar la cola', 'No pudimos cargar los paseadores pendientes. Revisa tu conexión e intenta de nuevo.', { iconColor: C.warningText }).svg;
    s += button(C, 24, 560, W - 48, 'Intentar de nuevo', 'secondary', { icon: 'refresh' });
    return plain(C, s);
  }
  let y = 244;
  s += t(24, y, 'Pendientes · 2', 'eyebrow', C.muted, { upper: true }); y += 14;
  s += walkerCard(C, y, 'Andrés Gómez', 'CC •••• 4050', '300 123 4567', '3 años con perros grandes', 'Enviado hace 2 días');
  s += walkerCard(C, y + 224, 'Camila Torres', 'CE •••• 7781', '310 555 0192', 'Paseo perros del edificio', 'Enviado hace 5 h');
  if (state === 'approved') s += L.toast(C, 760, 'Aprobaste a Andrés Gómez.', 'success');
  if (state === 'reject') {
    return plain(C, s) + L.confirmSheet(C, 'Rechazar a Andrés Gómez', 'Escribe el motivo. Andrés lo verá en su pantalla de verificación.', [{ label: 'Confirmar rechazo', state: 'disabled' }, { label: 'Cancelar', variant: 'secondary' }], {
      top: 420, extra: (yy) => field(C, 24, yy - 6, W - 48, 'Motivo del rechazo', 'Doc', { state: 'focus', help: 'Escribe al menos 5 caracteres.' }).svg, extraH: 100,
    });
  }
  return plain(C, s);
}

function queueWithShell(C, state) {
  if (state !== 'reject') return queue(C, state);
  return queue(C, 'reject');
}

function operations(C, state) {
  const v = view(M.vx(8), M.hy(12), 0.3, 195, 300);
  const pts = [[M.vx(3), M.hy(6)], [M.vx(12), M.hy(4)], [M.vx(5), M.hy(18)], [M.vx(13), M.hy(20)], [M.vx(9), M.hy(9)], [M.vx(2), M.hy(13)]];
  const overlays = (vv) => {
    let o = '';
    pts.forEach((p, i) => { const [x, y] = M.P(vv, ...p); o += M.walkerSmall(C, x, y, { color: C.primary }); });
    const [c1x, c1y] = M.P(vv, M.vx(14), M.hy(12)); o += M.cluster(C, c1x, c1y, 12, C.primary);
    const [c2x, c2y] = M.P(vv, M.vx(1), M.hy(22)); o += M.cluster(C, c2x, c2y, 5, C.primary);
    if (state === 'alerts') {
      const [ax, ay] = M.P(vv, ...M.PTS.walker); o += M.alertMarker(C, ax, ay);
      const [bx, by] = M.P(vv, M.vx(4), M.hy(8)); o += M.alertMarker(C, bx, by, { kind: 'warning' });
    }
    return o;
  };
  const content = (tp) => {
    let c = '';
    let y = tp + 40;
    if (state === 'alerts') {
      c += t(24, y, 'Emergencias activas · 1', 'eyebrow', C.danger, { upper: true }); y += 14;
      let e = card(C, 16, y, W - 32, 104, { fill: L.KIND(C).danger.bg, stroke: false }) + rect(16, y, 4, 104, C.danger, { rx: 2 });
      e += t(36, y + 30, 'Luna se soltó', 'bodyB', C.text) + t(W - 32, y + 30, 'hace 2 min', 'caption', C.muted, { anchor: 'end' });
      e += t(36, y + 52, 'Reportada por el paseador · Bruno C. / Valentina R.', 'caption', C.muted);
      e += button(C, 36, y + 62, 120, 'Ver paseo', 'primary', { h: 36 });
      c += g('AlertCard/emergency', e); y += 128;
      c += t(24, y, 'Alertas automáticas · 2', 'eyebrow', C.muted, { upper: true }); y += 6;
      c += row(C, 24, y, W - 48, 'Salió de la zona · Max', 'Paseo de Camila T. · hace 5 min', { icon: 'alert', iconColor: C.danger, chevron: true, divider: true, h: 62 }).svg; y += 62;
      c += row(C, 24, y, W - 48, 'Detenido 10 min · Toby', 'Paseo de Andrés G. · hace 8 min', { icon: 'clock', iconColor: C.warningText, chevron: true, h: 62 }).svg;
    } else {
      c += t(24, y, 'Paseos en curso · 18', 'eyebrow', C.muted, { upper: true }); y += 6;
      [['Luna · Bruno C.', 'Chapinero · 24 de 60 min · señal hace 10 s', 'En curso', 'primary'], ['Max · Camila T.', 'Teusaquillo · 12 de 45 min · señal hace 3 min', 'Sin señal', 'warning'], ['Rocky · Andrés G.', 'Usaquén · aceptado, por iniciar', 'Aceptado', 'success']].forEach(([a, b, p, k]) => {
        c += row(C, 24, y, W - 48, a, b, { pill: { label: p, kind: k }, divider: true, h: 66 }).svg; y += 66;
      });
    }
    return c;
  };
  let tb = rect(16, 52, W - 32, 48, C.surface, { rx: 24, filter: 'shFab' }) + icon('back', 26, 64, 24, C.text) + t(W / 2, 82, 'Operación', 'subtitle', C.text, { anchor: 'middle' }) + t(W - 36, 82, 'Admin', 'microB', C.muted, { anchor: 'end' });
  const seg = g('Segmented/overMap', rect(16, 112, W - 32, 40, C.surface, { rx: 20, filter: 'shFab' }) + rect(20, 116, (W - 40) / 2, 32, state === 'alerts' ? C.primary : 'transparent', { rx: 16 }) + t(20 + (W - 40) / 4, 137, 'Alertas', 'captionB', state === 'alerts' ? C.primaryText : C.text, { anchor: 'middle' }) + rect(20 + (W - 40) / 2, 116, (W - 40) / 2, 32, state !== 'alerts' ? C.primary : 'transparent', { rx: 16 }) + t(20 + (W - 40) * 0.75, 137, 'En curso', 'captionB', state !== 'alerts' ? C.primaryText : C.text, { anchor: 'middle' }));
  return mapScreen(C, { view: v, overlays, sheetTop: 470, content, topBar: g('TopBar/admin', tb) + seg });
}

// Tablet / web layout: list + map side by side (1024 x 768)
function operationsWide(C) {
  const FW = 1024;
  const FH = 768;
  let s = rect(0, 0, FW, FH, C.background);
  s += rect(0, 0, 360, FH, C.surface) + rect(360, 0, 1, FH, C.border);
  s += t(24, 48, 'Administración', 'eyebrow', C.muted, { upper: true }) + t(24, 80, 'Operación', 'title', C.text);
  s += rect(24, 100, 312, 40, C.surface2, { rx: 20 }) + rect(28, 104, 152, 32, C.surface, { rx: 16 }) + t(104, 125, 'Alertas', 'captionB', C.text, { anchor: 'middle' }) + t(258, 125, 'En curso · 18', 'captionB', C.muted, { anchor: 'middle' });
  let y = 168;
  s += t(24, y, 'Emergencias activas · 1', 'eyebrow', C.danger, { upper: true }); y += 12;
  s += rect(16, y, 328, 96, L.KIND(C).danger.bg, { rx: 14 }) + rect(16, y, 4, 96, C.danger, { rx: 2 }) + t(36, y + 30, 'Luna se soltó', 'bodyB', C.text) + t(36, y + 52, 'Bruno C. / Valentina R. · hace 2 min', 'caption', C.muted) + t(36, y + 78, 'Ver paseo', 'captionB', C.primary);
  y += 120;
  s += t(24, y, 'Alertas automáticas · 2', 'eyebrow', C.muted, { upper: true }); y += 6;
  s += row(C, 24, y, 312, 'Salió de la zona · Max', 'hace 5 min', { icon: 'alert', iconColor: C.danger, divider: true, h: 62 }).svg; y += 62;
  s += row(C, 24, y, 312, 'Detenido 10 min · Toby', 'hace 8 min', { icon: 'clock', iconColor: C.warningText, h: 62 }).svg;
  // map
  const v = { ox: M.vx(1), oy: M.hy(2), z: 0.42 };
  s += `<clipPath id="wideMap${C.name}"><rect x="361" y="0" width="${FW - 361}" height="${FH}"/></clipPath><g clip-path="url(#wideMap${C.name})">` + M.baseMap(C, v, 361, 0, FW - 361, FH);
  const vv = { ...v, x0: 361, y0: 0 };
  [[M.vx(3), M.hy(6)], [M.vx(12), M.hy(4)], [M.vx(5), M.hy(18)], [M.vx(13), M.hy(20)], [M.vx(9), M.hy(9)], [M.vx(2), M.hy(13)], [M.vx(7), M.hy(22)]].forEach((p) => { const [x, yy] = M.P(vv, ...p); s += M.walkerSmall(C, x, yy, { color: C.primary }); });
  const [ax, ay] = M.P(vv, ...M.PTS.walker); s += M.alertMarker(C, ax, ay);
  const [bx, by] = M.P(vv, M.vx(4), M.hy(8)); s += M.alertMarker(C, bx, by, { kind: 'warning' });
  s += '</g>';
  s += rect(371, FH - 30, 64, 20, 'rgba(255,255,255,0.85)', { rx: 4 }) + t(379, FH - 15.5, 'mapbox', 'microB', '#16212E');
  return s;
}

module.exports = [
  { file: 'admin-verificacion-cola', title: 'Panel de administración · Verificación de paseadores (RF-002, RF-003)', frames: [['Pendientes', 'light', (C) => queue(C, 'list')], ['Rechazar con motivo', 'light', (C) => queueWithShell(C, 'reject')], ['Aprobado (toast)', 'light', (C) => queue(C, 'approved')], ['Vacía', 'light', (C) => queue(C, 'empty')], ['Error', 'light', (C) => queue(C, 'error')]] },
  { file: 'admin-operacion-mapa', title: 'Panel de administración · Operación (RF-012, slices 2 y 3)', frames: [['Alertas activas', 'light', (C) => operations(C, 'alerts')], ['Paseos en curso', 'light', (C) => operations(C, 'live')], ['Alertas activas', 'dark', (C) => operations(C, 'alerts')]] },
  { file: 'admin-operacion-tablet-web', title: 'Panel de administración · Operación en tablet y web (1024×768)', frameW: 1024, frameH: 768, frames: [['Alertas activas', 'light', operationsWide], ['Alertas activas', 'dark', operationsWide]] },
];
