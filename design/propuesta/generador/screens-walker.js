'use strict';
const L = require('./lib');
const M = require('./map');
const { view, mapScreen, plain, metric } = require('./compose');
const { W, H, t, para, rect, circle, g, icon, button, field, chips, banner, row, section, card, pill } = L;

const PK = M.PTS.pickup;

// ---------- Hazte paseador (RF-002) ----------
function become(C, state) {
  const err = state === 'errors';
  let s = L.navRow(C, { back: true });
  s += t(24, 134, 'Modo paseador', 'eyebrow', C.muted, { upper: true });
  s += t(24, 166, 'Hazte paseador', 'title', C.text);
  s += para(24, 192, 'Completa tus datos. Un administrador los revisa antes de tu primer paseo.', 'body', C.muted, W - 48).svg;
  let y = 246;
  let f = field(C, 24, y, W - 48, 'Nombre completo', err ? 'An' : 'Andrés Gómez', err ? { state: 'error', error: 'Escribe tu nombre completo (mínimo 3 letras).' } : {}); s += f.svg; y += f.h + 12;
  s += t(24, y + 14, 'Tipo de documento', 'captionM', C.muted); y += 22;
  const c = chips(C, 24, y, W - 48, [{ label: 'Cédula', selected: true }, 'Cédula de extranjería', 'Pasaporte']); s += c.svg; y += c.h + 12;
  f = field(C, 24, y, W - 48, 'Número de documento', err ? '1020.30A' : '1020304050', err ? { state: 'error', error: 'El documento solo lleva números (5 a 15).' } : { help: 'Se guarda cifrado. Solo verás los últimos 4 dígitos.' }); s += f.svg; y += f.h + 12;
  f = field(C, 24, y, W - 48, 'Celular', err ? '300 123' : '300 123 4567', err ? { state: 'error', error: 'El celular debe tener 10 dígitos.' } : {}); s += f.svg; y += f.h + 12;
  if (y < 640) { f = field(C, 24, y, W - 48, 'Experiencia con perros (opcional)', '3 años con perros grandes', { trailing: '25/500' }); s += f.svg; }
  s += L.actionFooter(C, button(C, 24, H - 100, W - 48, 'Enviar para verificación'), 120);
  return plain(C, s, { noHome: true });
}

// ---------- Verificación (RF-003) ----------
function verification(C, state) {
  let s = L.navRow(C, {});
  const cfg = {
    pending: ['clock', 'info', 'Estamos verificando tu perfil', 'Te avisaremos aquí apenas terminemos. No tienes que hacer nada más.'],
    rejected: ['alert', 'warning', 'No pudimos verificar tu perfil', 'Si crees que es un error, escríbenos por soporte y lo revisamos contigo.'],
    approved: ['shield', 'success', '¡Ya eres paseador verificado!', 'Desde ahora ves las solicitudes cerca de ti y puedes aceptarlas.'],
  }[state];
  const k = L.KIND(C)[cfg[1]];
  s += t(24, 130, 'Modo paseador', 'eyebrow', C.muted, { upper: true });
  s += circle(64, 196, 40, k.bg) + icon(cfg[0], 44, 176, 40, k.fg);
  s += t(24, 280, cfg[2], 'title', C.text);
  s += para(24, 308, cfg[3], 'body', C.muted, W - 48).svg;
  let y = 370;
  if (state === 'pending') {
    const steps = [['Datos enviados', '24 oct, 9:12 a. m.', 'done'], ['Revisión del administrador', 'En curso', 'current'], ['Listo para recibir paseos', '', 'todo']];
    steps.forEach(([a, b, st], i) => {
      const cy = y + i * 64;
      if (i < steps.length - 1) s += rect(35, cy + 12, 2, 52, st === 'done' ? C.primary : C.border);
      s += circle(36, cy, 11, st === 'todo' ? C.surface : C.primary, { stroke: st === 'todo' ? C.borderStrong : C.primary, sw: 2 });
      if (st === 'done') s += icon('check', 29, cy - 7, 14, C.primaryText, { sw: 3 });
      if (st === 'current') s += circle(36, cy, 4, C.primaryText);
      s += t(60, cy + 2, a, 'bodyM', st === 'todo' ? C.muted : C.text) + (b ? t(60, cy + 22, b, 'caption', C.muted) : '');
    });
    y += 200;
    s += g('ProfileSummary', card(C, 24, y, W - 48, 110) + t(44, y + 32, 'Andrés Gómez', 'bodyB', C.text) + t(44, y + 56, 'Cédula •••• 4050', 'caption', C.muted) + t(44, y + 78, 'Celular 300 123 4567', 'caption', C.muted));
    s += L.actionFooter(C, button(C, 24, H - 100, W - 48, 'Revisar de nuevo', 'secondary', { icon: 'refresh' }), 120);
  } else if (state === 'rejected') {
    s += g('RejectionReason', card(C, 24, y, W - 48, 88, { fill: L.KIND(C).warning.bg, stroke: false }) + t(44, y + 32, 'Motivo', 'captionB', C.warningText) + t(44, y + 60, 'Documento ilegible', 'bodyM', C.text));
    s += L.actionFooter(C, button(C, 24, H - 100, W - 48, 'Escribir a soporte', 'primary', { icon: 'chat' }), 120);
  } else {
    s += g('NextSteps', row(C, 24, y, W - 48, 'Comparte tu ubicación', 'Así verás primero las solicitudes cercanas', { icon: 'locate', iconColor: C.primary, divider: true }).svg + row(C, 24, y + 68, W - 48, 'Acepta con un toque', 'El primero que acepta se queda con el paseo', { icon: 'check', iconColor: C.primary, divider: true }).svg + row(C, 24, y + 136, W - 48, 'Cobra al terminar', 'El pago llega automático', { icon: 'wallet', iconColor: C.primary }).svg);
    s += L.actionFooter(C, button(C, 24, H - 100, W - 48, 'Ver solicitudes'), 120);
  }
  return plain(C, s, { noHome: true });
}

// ---------- Inicio del paseador: solicitudes (RF-007, RF-006) ----------
const REQ = [
  { at: [M.vx(8), M.hy(16)], price: '$ 18.400' },
  { at: [M.vx(11), M.hy(12)], price: '$ 9.440' },
  { at: [M.vx(6), M.hy(20)], price: '$ 12.400' },
];
function requests(C, state) {
  const me = [M.vx(9), M.hy(18)];
  const v = view(844, 918, 0.3, 195, 250);
  const noLoc = state === 'noloc';
  const overlays = (vv) => {
    let o = '';
    if (state !== 'empty') {
      REQ.forEach((rq, i) => {
        const [x, y] = M.P(vv, ...rq.at);
        o += M.pricePill(C, x, y, rq.price, i === 0 && state === 'default', { taken: i === 0 && state === 'taken' });
      });
      const [cx, cy] = M.P(vv, M.vx(12), M.hy(8));
      o += M.cluster(C, cx, cy, 3, C.primary);
    }
    if (!noLoc) { const [mx, my] = M.P(vv, ...me); o += M.userDot(C, mx, my); }
    return o;
  };
  const top = 420;
  const tabTop = H - 83;
  const content = (tp) => {
    let c = '';
    if (state === 'empty') {
      c += t(24, tp + 44, 'Solicitudes cerca', 'eyebrow', C.muted, { upper: true });
      c += circle(W / 2, tp + 110, 30, L.KIND(C).primary.bg) + circle(W / 2, tp + 110, 10, C.primary);
      c += t(W / 2, tp + 176, 'No hay solicitudes cerca por ahora', 'subtitle', C.text, { anchor: 'middle' });
      c += t(W / 2, tp + 200, 'Te mostramos las nuevas apenas lleguen.', 'caption', C.muted, { anchor: 'middle' });
      c += t(W / 2, tp + 236, 'Radio de búsqueda: 5 km', 'micro', C.muted, { anchor: 'middle' });
      return c;
    }
    c += t(24, tp + 44, noLoc ? 'Solicitudes por hora · 3' : 'Solicitudes cerca · 3', 'eyebrow', C.muted, { upper: true });
    c += t(W - 24, tp + 44, state === 'offline' ? 'Sin conexión' : 'Hace 5 s', 'caption', state === 'offline' ? C.warningText : C.muted, { anchor: 'end' });
    const offers = [
      ['$ 18.400', 'Individual · 60 min · 1 perro', noLoc ? 'Chapinero · Hoy 3:30 p. m.' : 'Chapinero · a 1,2 km · Hoy 3:30 p. m.'],
      ['$ 9.440', 'Grupal · 45 min · 2 perros', noLoc ? 'Teusaquillo · Mañana 8:00 a. m.' : 'Teusaquillo · a 3,4 km · Mañana 8:00 a. m.'],
    ];
    let y = tp + 60;
    offers.forEach(([p, a, b], i) => {
      const taken = state === 'taken' && i === 0;
      let oc = card(C, 16, y, W - 32, 112, { fill: taken ? C.surface2 : C.surface, stroke: i === 0 && state === 'default' ? C.primary : C.border });
      oc += t(32, y + 32, 'Ganas', 'micro', C.muted) + t(32, y + 60, p, 'title', taken ? C.muted : C.text);
      oc += t(32, y + 82, a, 'captionM', C.text) + t(32, y + 100, b, 'caption', C.muted);
      if (taken) oc += pill(C, W - 32, y + 20, 'Ya no disponible', 'muted', { alignEnd: true });
      else oc += button(C, W - 138, y + 24, 106, 'Aceptar', 'primary', { h: 44, state: state === 'offline' ? 'disabled' : 'default' });
      c += g(`OfferCard/${taken ? 'taken' : 'default'}`, oc, { opacity: state === 'offline' ? 0.7 : undefined });
      y += 124;
    });
    return c;
  };
  let bnr = '';
  if (noLoc) bnr = banner(C, 16, 112, W - 32, 'warning', 'Comparte tu ubicación', 'Verás primero las solicitudes más cercanas.', { action: 'Compartir ubicación', shadow: true, icon: 'locate' }).svg;
  if (state === 'taken') bnr = banner(C, 16, 112, W - 32, 'danger', 'Otro paseador la aceptó antes.', 'Elige otra solicitud de la lista.', { shadow: true }).svg;
  if (state === 'offline') bnr = banner(C, 16, 112, W - 32, 'warning', 'Sin conexión.', 'Las solicitudes pueden no estar al día. Reintentamos solos.', { shadow: true, icon: 'wifiOff' }).svg;
  let tb = rect(16, 52, W - 32, 48, C.surface, { rx: 24, filter: 'shFab' }) + t(36, 82, 'Modo paseador', 'subtitle', C.text) + circle(W - 140, 76, 5, C.success) + t(W - 128, 81, 'Disponible', 'captionM', C.text) + icon('bell', W - 58, 64, 24, C.text);
  return mapScreen(C, { view: v, overlays, sheetTop: top, sheetBottom: tabTop, content, topBar: g('TopBar/walker', tb), banner: bnr, tabs: L.tabBar(C, 'walker', 'Inicio'), fabs: (tp) => L.fab(C, W - 64, tp - 104, 'locate', { color: noLoc ? C.muted : C.primary }) });
}

// ---------- Paseo asignado: camino a la recogida (RF-007) ----------
function assigned(C, state) {
  const cancelled = state === 'cancelled';
  const v = view(920, 1218, 0.75, 180, 300);
  const overlays = (vv) => {
    let o = '';
    if (!cancelled) o += M.route(C, vv, M.PTS.toPickup, 'pending');
    const [px, py] = M.P(vv, ...PK);
    o += M.pinHome(C, px, py, cancelled ? { color: C.muted } : {});
    if (!cancelled) {
      o += g('EtaLabel', rect(px - 62, py - 82, 124, 26, C.surface, { rx: 13, filter: 'shCard' }) + t(px, py - 64, 'A 6 min · 450 m', 'microB', C.text, { anchor: 'middle' }));
    }
    const [mx, my] = M.P(vv, ...M.PTS.walkerStart);
    o += M.userDot(C, mx, my, { heading: -30 });
    return o;
  };
  const top = 430;
  const content = (tp) => {
    let c = '';
    if (cancelled) {
      c += pill(C, 24, tp + 28, 'Cancelado', 'muted');
      c += t(24, tp + 88, 'Valentina canceló el paseo', 'title', C.text);
      c += para(24, tp + 116, 'No tienes que ir. No hay cobro para nadie y la solicitud ya no aparece.', 'body', C.muted, W - 48).svg;
      c += button(C, 24, tp + 200, W - 48, 'Ver otras solicitudes');
      return c;
    }
    c += pill(C, 24, tp + 28, 'Aceptado', 'success', { dot: true });
    c += t(W - 24, tp + 45, 'Ganas $ 18.400', 'captionB', C.text, { anchor: 'end' });
    c += t(24, tp + 88, 'Recoge a Luna', 'title', C.text);
    c += t(24, tp + 112, 'Calle 45 # 7-20, Chapinero', 'bodyM', C.text);
    c += t(W - 24, tp + 112, 'Abrir en Maps', 'captionB', C.primary, { anchor: 'end' });
    c += g('NotesCard', rect(24, tp + 128, W - 48, 64, C.surface2, { rx: 14 }) + t(40, tp + 154, 'Indicaciones', 'micro', C.muted) + t(40, tp + 176, 'Timbre dañado, llamar al llegar', 'bodyM', C.text));
    c += row(C, 24, tp + 200, W - 48, 'Luna', 'Criolla · Mediana · 14,5 kg', { avatar: 'L', avatarFg: C.primary, h: 60 }).svg;
    c += button(C, 24, tp + 268, 64, '', 'secondary', { h: 52 }) + icon('chat', 45, tp + 283, 22, C.text);
    c += button(C, 100, tp + 268, W - 124, 'Iniciar paseo');
    c += t(W / 2, tp + 346, 'Tócalo cuando tengas a Luna contigo.', 'caption', C.muted, { anchor: 'middle' });
    return c;
  };
  return mapScreen(C, { view: v, overlays, sheetTop: top, content, topBar: L.topBarFloating(C, cancelled ? 'Paseo cancelado' : 'Paseo aceptado'), banner: cancelled ? banner(C, 16, 112, W - 32, 'info', 'Valentina canceló el paseo.', 'Te avisamos también en Avisos.', { shadow: true }).svg : '', fabs: (tp) => cancelled ? '' : L.sosFab(C, W - 92, tp - 104) });
}

// ---------- Paseo en curso, paseador (RF-008) ----------
function walking(C, state) {
  const v = view(M.PTS.walker[0] - 60, M.PTS.walker[1], 0.68, 195, 220);
  const overlays = (vv) => {
    let o = M.geofence(C, vv, ...PK, 937);
    const pts = M.PTS.walked;
    if (state === 'nosignal') { o += M.route(C, vv, pts.slice(0, 6), 'walked') + M.route(C, vv, pts.slice(5), 'stale'); }
    else o += M.route(C, vv, pts, 'walked');
    const [sx, sy] = M.P(vv, ...PK);
    o += M.pinHome(C, sx, sy);
    const [wx, wy] = M.P(vv, ...M.PTS.walker);
    o += M.walkerLive(C, wx, wy, { heading: 15, letter: 'A' });
    return o;
  };
  const top = 470;
  const content = (tp) => {
    let c = pill(C, 24, tp + 28, 'En curso', 'primary', { dot: true, pulse: true });
    c += g('SharingChip', icon('battery', W - 190, tp + 30, 18, C.muted) + t(W - 24, tp + 45, 'Compartiendo cada 15 s', 'micro', C.muted, { anchor: 'end' }));
    c += metric(C, 24, tp + 76, 'Tiempo', '24:10', { big: true }) + t(110, tp + 102, 'de 60 min', 'caption', C.muted);
    c += metric(C, 220, tp + 76, 'Distancia', '1,2 km', { big: true });
    c += rect(24, tp + 126, W - 48, 6, C.surface2, { rx: 3 }) + rect(24, tp + 126, (W - 48) * 0.4, 6, C.primary, { rx: 3 });
    c += button(C, 24, tp + 156, 64, '', 'secondary') + icon('chat', 45, tp + 171, 22, C.text);
    c += button(C, 100, tp + 156, W - 124, 'Terminar paseo');
    c += t(W / 2, tp + 234, 'Tócalo al entregar a Luna en casa.', 'caption', C.muted, { anchor: 'middle' });
    c += t(W / 2, tp + 262, 'Calle 45 # 7-20 · Ganas $ 18.400', 'caption', C.muted, { anchor: 'middle' });
    return c;
  };
  let bnr = '';
  if (state === 'foreground') bnr = banner(C, 16, 112, W - 32, 'warning', 'Si bloqueas el teléfono, dejaremos de compartir tu ruta.', 'Permite la ubicación "Siempre" para que Valentina te siga.', { action: 'Abrir Ajustes', shadow: true }).svg;
  if (state === 'nosignal') bnr = banner(C, 16, 112, W - 32, 'info', 'Sin señal.', 'Guardamos 3 posiciones y las enviaremos al reconectar.', { shadow: true, icon: 'wifiOff' }).svg;
  let extra = '';
  if (state === 'finish') extra = L.confirmSheet(C, '¿Terminar el paseo?', 'Confirma que entregaste a Luna en Calle 45 # 7-20. Al terminar se cobra el pago y recibes $ 18.400.', [{ label: 'Sí, terminar paseo' }, { label: 'Seguir paseando', variant: 'secondary' }], { top: 430, extra: (y) => banner(C, 24, y - 8, W - 48, 'warning', 'Estás a 1,1 km de la recogida.', '¿Seguro que ya la entregaste?').svg, extraH: 84 });
  return mapScreen(C, { view: v, overlays, sheetTop: top, content, topBar: L.topBarFloating(C, 'Paseo en curso'), banner: bnr, extra, noHome: state === 'finish', fabs: (tp) => L.fab(C, W - 64, tp - 164, 'locate', { color: C.primary }) + L.sosFab(C, W - 92, tp - 104) });
}

// ---------- Terminado (RF-011, RF-017) ----------
function finished(C) {
  const v = view(M.vx(9), M.hy(12) + 40, 0.62, 195, 250);
  const overlays = (vv) => M.route(C, vv, M.PTS.full, 'walked') + M.pinHome(C, ...M.P(vv, ...PK));
  const content = (tp) => {
    let c = circle(48, tp + 52, 24, L.KIND(C).success.bg) + icon('check', 36, tp + 40, 24, C.success);
    c += t(84, tp + 60, '¡Paseo terminado!', 'title', C.text);
    c += t(24, tp + 110, 'Ganaste', 'caption', C.muted) + t(24, tp + 148, '$ 18.400', 'display', C.success);
    c += pill(C, W - 24, tp + 120, 'Pagado a tu cuenta', 'success', { alignEnd: true });
    c += metric(C, 24, tp + 186, 'Distancia', '2,8 km') + metric(C, 150, tp + 186, 'Duración', '58 min') + metric(C, 268, tp + 186, 'Entrega', '4:08 p. m.');
    c += button(C, 24, tp + 250, W - 48, 'Ver más solicitudes');
    c += t(W / 2, tp + 330, 'El chat con Valentina queda solo para leer.', 'caption', C.muted, { anchor: 'middle' });
    return c;
  };
  return mapScreen(C, { view: v, overlays, sheetTop: 440, content, topBar: L.topBarFloating(C, 'Resumen del paseo') });
}

// ---------- Ganancias (RF-017) ----------
function earnings(C, state) {
  let s = t(24, 92, 'Ganancias', 'title', C.text);
  if (state === 'empty') {
    s += L.emptyState(C, 320, 'wallet', 'Aún no tienes ganancias', 'Cuando termines tu primer paseo, verás aquí lo que ganaste.').svg;
    s += button(C, 24, 500, W - 48, 'Ver solicitudes');
  } else {
    let y = 120;
    let c = rect(24, y, W - 48, 150, C.primary, { rx: 20 });
    c += t(44, y + 38, 'Total ganado', 'eyebrow', C.primaryText, { upper: true });
    c += t(44, y + 86, '$ 46.240', 'display', C.primaryText);
    c += t(44, y + 120, '3 paseos cobrados', 'caption', C.primaryText, { opacity: 0.9 });
    s += g('EarningsCard', c); y += 178;
    s += section(C, 24, y, 'Paseos cobrados'); y += 6;
    [['Luna · Individual · 60 min', 'Hoy, 4:08 p. m.', '$ 18.400'], ['Max y Toby · Grupal · 45 min', 'Ayer, 9:02 a. m.', '$ 9.440'], ['Rocky · Individual · 60 min', '22 oct, 5:15 p. m.', '$ 18.400']].forEach(([a, b, p]) => {
      const rw = row(C, 24, y, W - 48, a, b, { right: p, rightSub: 'Pagado', rightSubColor: C.success, divider: true }); s += rw.svg; y += rw.h;
    });
    y += 20;
    s += banner(C, 24, y, W - 48, 'info', '¿Cómo recibes los pagos?', 'Pronto podrás registrar la cuenta donde te llega el dinero.').svg;
  }
  s += L.tabBar(C, 'walker', 'Ganancias');
  return plain(C, s, { noHome: true });
}

// ---------- Tus paseos (RF-007 assigned) ----------
function myWalks(C) {
  let s = t(24, 92, 'Tus paseos', 'title', C.text);
  let y = 124;
  s += section(C, 24, y, 'Hoy'); y += 6;
  let rw = row(C, 24, y, W - 48, 'Luna · Individual · 60 min', '3:30 p. m. · Chapinero', { avatar: 'L', avatarFg: C.primary, pill: { label: 'Aceptado', kind: 'success' }, chevron: true, divider: true }); s += rw.svg; y += rw.h;
  s += section(C, 24, y + 30, 'Próximos'); y += 36;
  rw = row(C, 24, y, W - 48, 'Max y Toby · Grupal · 45 min', 'Mañana, 8:00 a. m. · Teusaquillo', { avatar: 'M', avatarFg: C.primary, pill: { label: 'Aceptado', kind: 'success' }, chevron: true, divider: true }); s += rw.svg; y += rw.h;
  s += section(C, 24, y + 30, 'Historial'); y += 36;
  [['Rocky · Individual · 60 min', '22 oct · 2,9 km', 'Terminado', 'success'], ['Kira · Individual · 30 min', '21 oct', 'Cancelado', 'muted']].forEach(([a, b, p, k]) => {
    rw = row(C, 24, y, W - 48, a, b, { pill: { label: p, kind: k }, chevron: true, divider: true }); s += rw.svg; y += rw.h;
  });
  s += L.tabBar(C, 'walker', 'Paseos');
  return plain(C, s, { noHome: true });
}

module.exports = [
  { file: 'paseador-onboarding-hazte-paseador', title: 'Hazte paseador (RF-002)', frames: [['Formulario', 'light', (C) => become(C, 'form')], ['Errores de validación', 'light', (C) => become(C, 'errors')]] },
  { file: 'paseador-onboarding-verificacion', title: 'Verificación del paseador (RF-003)', frames: [['Verificando', 'light', (C) => verification(C, 'pending')], ['Rechazado', 'light', (C) => verification(C, 'rejected')], ['Aprobado', 'light', (C) => verification(C, 'approved')]] },
  { file: 'paseador-inicio-solicitudes', title: 'Solicitudes cerca, inicio del paseador (RF-007, RF-006)', frames: [['Mapa y lista', 'light', (C) => requests(C, 'default')], ['Sin ubicación', 'light', (C) => requests(C, 'noloc')], ['Sin solicitudes', 'light', (C) => requests(C, 'empty')], ['Otro la aceptó (409)', 'light', (C) => requests(C, 'taken')], ['Sin conexión', 'light', (C) => requests(C, 'offline')], ['Mapa y lista', 'dark', (C) => requests(C, 'default')]] },
  { file: 'paseador-paseo-asignado', title: 'Paseo aceptado, camino a la recogida (RF-007)', frames: [['Camino a la recogida', 'light', (C) => assigned(C, 'default')], ['El dueño canceló', 'light', (C) => assigned(C, 'cancelled')]] },
  { file: 'paseador-paseo-en-curso', title: 'Paseo en curso, vista del paseador (RF-008)', frames: [['Compartiendo ubicación', 'light', (C) => walking(C, 'default')], ['Permiso solo mientras se usa', 'light', (C) => walking(C, 'foreground')], ['Sin señal', 'light', (C) => walking(C, 'nosignal')], ['Confirmar terminar', 'light', (C) => walking(C, 'finish')], ['Compartiendo ubicación', 'dark', (C) => walking(C, 'default')]] },
  { file: 'paseador-paseo-terminado', title: 'Paseo terminado, paseador (RF-011, RF-017)', frames: [['Pagado', 'light', finished]] },
  { file: 'paseador-ganancias-tab', title: 'Ganancias (RF-017)', frames: [['Con ganancias', 'light', (C) => earnings(C, 'list')], ['Vacía', 'light', (C) => earnings(C, 'empty')], ['Con ganancias', 'dark', (C) => earnings(C, 'list')]] },
  { file: 'paseador-paseos-tab', title: 'Tus paseos, paseador (RF-007)', frames: [['Lista', 'light', myWalks]] },
];
