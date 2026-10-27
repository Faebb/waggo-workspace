'use strict';
const L = require('./lib');
const M = require('./map');
const { view, mapScreen, plain, metric } = require('./compose');
const { W, H, t, para, rect, circle, g, icon, button, field, chips, banner, row, section, card, pill } = L;

const PK = M.PTS.pickup;

// ---------- Inicio del dueño ----------
function hero(C, y, compact = false) {
  const h = compact ? 84 : 128;
  let s = rect(24, y, W - 48, h, C.primary, { rx: 20 });
  if (compact) s += t(44, y + 38, '¿Quién sale a pasear hoy?', 'subtitle', C.primaryText);
  else s += t(44, y + 44, '¿Quién sale a', 'title', C.primaryText) + t(44, y + 74, 'pasear hoy?', 'title', C.primaryText);
  s += t(44, y + (compact ? 62 : 104), 'Elige a tus perros, la hora y listo.', 'caption', C.primaryText, { opacity: 0.9 });
  s += circle(W - 64, y + h / 2, 24, C.primaryText) + icon('chevronR', W - 76, y + h / 2 - 12, 24, C.primary, { sw: 2.5 });
  return g('HeroRequestCard', s);
}

function miniMap(C, x, y, w, h, o = {}) {
  const v = { ox: o.ox, oy: o.oy, z: o.z };
  let inner = M.baseMap(C, v, x, y, w, h, { labelX: 20 });
  const vv = { ...v, x0: x, y0: y };
  if (o.route) inner += M.route(C, vv, o.route, 'walked');
  const [px, py] = M.P(vv, ...PK);
  inner += M.pinHome(C, px, py);
  if (o.walker) { const [wx, wy] = M.P(vv, ...o.walker); inner += M.walkerLive(C, wx, wy, { heading: 20, pulse: false }); }
  const id = `clip${Math.round(x)}${Math.round(y)}${C.name}${o.key || ''}`;
  return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14"/></clipPath><g id="MiniMap" clip-path="url(#${id})">${inner}</g>` + rect(x, y, w, h, 'none', { rx: 14, stroke: C.border });
}

function home(C, state) {
  let s = t(24, 92, 'Hola, Valentina', 'title', C.text);
  s += L.bell(C, W - 68, 60, state === 'active' ? 2 : 0);
  let y = 124;
  if (state === 'loading') {
    s += L.skeleton(C, 24, y, W - 48, 112, 20) + L.skeleton(C, 24, y + 140, 120, 14) + L.skeleton(C, 24, y + 166, W - 48, 250, 14) + L.skeleton(C, 24, y + 440, W - 48, 64, 14);
  } else if (state === 'first') {
    s += hero(C, y); y += 152;
    let c = card(C, 24, y, W - 48, 176, { fill: C.surface2, stroke: false });
    c += icon('paw', 44, y + 24, 36, C.primary);
    c += t(92, y + 48, 'Primero, cuéntanos de tu perro', 'bodyB', C.text);
    c += para(44, y + 86, 'Lo registras una vez y lo eliges en segundos cada vez que pidas un paseo.', 'caption', C.muted, W - 88).svg;
    c += button(C, 44, y + 116, 190, 'Agregar mi perro', 'primary', { h: 44 });
    s += g('FirstRunCard', c); y += 204;
    s += section(C, 24, y, 'Así funciona'); y += 14;
    [['shield', 'Paseadores verificados', 'Revisamos su identidad.'], ['route', 'Paseo en vivo', 'Sigue la ruta en el mapa.'], ['wallet', 'Pagas al final', 'Solo se cobra si el paseo ocurre.']].forEach(([ic, a, b]) => {
      const rw = row(C, 24, y, W - 48, a, b, { icon: ic, iconColor: C.primary, h: 64 }); s += rw.svg; y += rw.h;
    });
  } else {
    s += section(C, 24, y + 4, 'Ahora'); y += 18;
    let c = card(C, 24, y, W - 48, 300, { shadow: true });
    c += miniMap(C, 32, y + 8, W - 64, 160, { ox: 378, oy: 714, z: 0.38, route: M.PTS.walked, walker: M.PTS.walker });
    c += pill(C, 40, y + 184, 'En curso', 'primary', { dot: true, pulse: true });
    c += t(40, y + 234, 'Luna con Bruno C.', 'subtitle', C.text);
    c += t(40, y + 256, '1,2 km · 24 de 60 min · actualizado hace 10 s', 'caption', C.muted);
    c += button(C, W - 156, y + 184, 116, 'Ver en vivo', 'primary', { h: 40 });
    s += g('WalkCard/active', c); y += 320;
    s += hero(C, y, true); y += 108;
    s += section(C, 24, y, 'Próximos'); y += 6;
    const rw = row(C, 24, y, W - 48, 'Mañana, 8:00 a. m.', 'Max · Grupal · 45 min', { icon: 'calendar', right: '$ 11.800', rightSub: 'Buscando', chevron: true }); s += rw.svg;
  }
  s += L.tabBar(C, 'owner', 'Inicio');
  return plain(C, s, { noHome: true });
}

// ---------- Mascotas (RF-004) ----------
function pets(C, state) {
  let s = t(24, 92, 'Mis perros', 'title', C.text);
  if (state === 'list') s += g('AddButton', rect(W - 132, 64, 108, 40, C.surface, { rx: 20, stroke: C.borderStrong }) + icon('plus', W - 120, 74, 20, C.primary) + t(W - 94, 89, 'Agregar', 'captionB', C.text));
  if (state === 'empty') {
    s += L.emptyState(C, 300, '', 'Aún no tienes perros', 'Agrégalos una vez y elígelos en segundos cada vez que pidas un paseo.', { iconPaw: true }).svg;
    s += button(C, 24, 500, W - 48, 'Agregar mi primer perro');
  } else if (state === 'error') {
    s += L.emptyState(C, 300, 'wifiOff', 'No pudimos cargar tus perros', 'Revisa tu conexión e intenta de nuevo.', { iconColor: C.warningText }).svg;
    s += button(C, 24, 500, W - 48, 'Intentar de nuevo', 'secondary', { icon: 'refresh' });
  } else {
    let y = 128;
    [['L', 'Luna', 'Criolla · Mediana · 14,5 kg', 'Alérgica al pollo'], ['M', 'Max', 'Beagle · Pequeño · 9 kg', '']].forEach(([a, n, d, med]) => {
      let c = card(C, 24, y, W - 48, 96, { shadow: true });
      c += L.avatar(C, 64, y + 48, 26, a, { bg: C.surface2, fg: C.primary });
      c += t(104, y + 40, n, 'subtitle', C.text) + t(104, y + 62, d, 'caption', C.muted);
      if (med) c += icon('lock', 104, y + 70, 14, C.muted) + t(122, y + 82, 'Notas médicas privadas', 'micro', C.muted);
      c += icon('chevronR', W - 60, y + 37, 22, C.muted);
      s += g(`PetRow/${n}`, c); y += 112;
    });
    s += t(24, y + 14, '2 de 10 perros', 'caption', C.muted);
  }
  s += L.tabBar(C, 'owner', 'Mascotas');
  return plain(C, s, { noHome: true });
}

function addPet(C, state) {
  let s = L.navRow(C, { back: true, title: 'Agregar perro' });
  let y = 108;
  if (state === 'limit') { const b = banner(C, 24, y, W - 48, 'warning', 'Llegaste al máximo de 10 perros.', 'Para agregar otro, escríbenos desde Ayuda.'); s += b.svg; y += b.h + 12; }
  const err = state === 'errors';
  let f = field(C, 24, y, W - 48, 'Nombre', err ? '' : 'Luna', err ? { state: 'error', error: 'Escribe el nombre de tu perro.' } : {}); s += f.svg; y += f.h + 14;
  s += t(24, y + 14, 'Tamaño', 'captionM', C.muted); y += 22;
  const c = chips(C, 24, y, W - 48, ['Pequeño · <10 kg', { label: 'Mediano · 10–25 kg', selected: true }, 'Grande · >25 kg']); s += c.svg; y += c.h + 14;
  f = field(C, 24, y, W - 48, 'Raza (opcional)', 'Criolla'); s += f.svg; y += f.h + 14;
  const half = (W - 60) / 2;
  f = field(C, 24, y, half, 'Nacimiento (opcional)', '10/05/2021', { trailingIcon: 'calendar' }); s += f.svg;
  const f2 = field(C, 36 + half, y, half, 'Peso kg (opcional)', err ? '120' : '14,5', err ? { state: 'error', error: 'Entre 0,5 y 100 kg.' } : {}); s += f2.svg; y += Math.max(f.h, f2.h) + 14;
  f = field(C, 24, y, W - 48, 'Notas médicas (opcional)', 'Alérgica al pollo. Toma pastilla a las 8 a. m.', { multiline: true, h: 84, help: 'Se guardan cifradas. Hoy solo tú las ves.' }); s += f.svg;
  s += L.actionFooter(C, button(C, 24, H - 100, W - 48, 'Guardar perro', 'primary', { state: state === 'limit' ? 'disabled' : 'default' }), 120);
  return plain(C, s, { noHome: true });
}

function petDetail(C) {
  let s = L.navRow(C, { back: true });
  s += L.avatar(C, W / 2, 150, 48, 'L', { bg: C.surface2, fg: C.primary });
  s += t(W / 2, 236, 'Luna', 'title', C.text, { anchor: 'middle' });
  s += t(W / 2, 260, 'Criolla · 5 años', 'body', C.muted, { anchor: 'middle' });
  let y = 290;
  [['Raza', 'Criolla'], ['Tamaño', 'Mediano'], ['Nacimiento', '10 may 2021'], ['Peso', '14,5 kg']].forEach(([a, b]) => {
    s += t(24, y + 32, a, 'body', C.muted) + t(W - 24, y + 32, b, 'bodyM', C.text, { anchor: 'end' }) + rect(24, y + 48, W - 48, 1, C.border); y += 50;
  });
  y += 20;
  s += g('MedicalNotesCard', card(C, 24, y, W - 48, 112, { fill: C.surface2, stroke: false }) + icon('lock', 44, y + 18, 20, C.muted) + t(72, y + 34, 'Notas médicas', 'bodyB', C.text) + t(44, y + 66, 'Alérgica al pollo.', 'body', C.text) + t(44, y + 92, 'Cifradas. Hoy solo tú las ves.', 'caption', C.muted));
  s += L.actionFooter(C, button(C, 24, H - 100, W - 48, 'Pedir paseo con Luna'), 120);
  return plain(C, s, { noHome: true });
}

// ---------- Pedir paseo: paso 1, ¿Dónde? (RF-007 + mapa) ----------
function where(C, state) {
  const v = view(PK[0], PK[1], 1, 195, 330);
  const top = state === 'search' ? 844 : 560;
  const overlays = (vv) => {
    let o = '';
    const [px, py] = M.P(vv, ...PK);
    if (state === 'approx') o += circle(px + 30, py - 40, 150, C.map.accuracy, { stroke: C.primary, sw: 1, dash: '4 4' });
    if (state !== 'denied') o += M.userDot(C, px + 30, py - 40, { accuracy: state === 'approx' ? 30 : 24 });
    return o;
  };
  let extra = '';
  // fixed centre pin
  const pinY = 330 + 0;
  if (state !== 'search') extra += M.pinHome(C, 195, pinY, { lifted: state === 'moving', id: 'Marker/Pickup/centered' });
  if (state === 'moving') extra += g('PinHint', rect(195 - 104, pinY - 96, 208, 30, C.text, { rx: 15 }) + t(195, pinY - 76, 'Suelta para elegir este punto', 'microB', C.background, { anchor: 'middle' }));
  // search bar
  let sb = rect(16, 56, W - 32, 52, C.surface, { rx: 26, filter: 'shFab', stroke: state === 'search' ? C.primary : null, sw: 2 });
  sb += icon('back', 28, 70, 24, C.text);
  sb += t(64, 88, state === 'search' ? 'Calle 45 # 7' : '¿Dónde recogemos a tus perros?', 'body', state === 'search' ? C.text : C.muted);
  if (state === 'search') sb += rect(64 + L.textWidth('Calle 45 # 7', 'body') + 2, 72, 2, 22, C.primary) + icon('close', W - 56, 70, 22, C.muted);
  else sb += icon('search', W - 56, 70, 22, C.muted);
  sb += t(W - 26, 132, 'Paso 1 de 3', 'microB', C.text, { anchor: 'end', halo: C.map.land });
  let bnr = '';
  if (state === 'denied') bnr = banner(C, 16, 146, W - 32, 'warning', 'No tenemos acceso a tu ubicación.', 'Escribe la dirección o actívala en Ajustes.', { action: 'Abrir Ajustes', shadow: true }).svg;
  if (state === 'approx') bnr = banner(C, 16, 146, W - 32, 'info', 'Tu ubicación es aproximada.', 'Mueve el pin hasta tu puerta o activa "Ubicación precisa".', { shadow: true }).svg;
  const content = (tp) => {
    let c = t(24, tp + 44, 'Recogida', 'eyebrow', C.muted, { upper: true });
    if (state === 'moving') {
      c += L.skeleton(C, 24, tp + 60, 220, 22) + L.skeleton(C, 24, tp + 92, 160, 14);
    } else {
      c += t(24, tp + 76, 'Calle 45 # 7-20', 'title', C.text);
      c += t(24, tp + 100, 'Chapinero, Bogotá', 'body', C.muted);
    }
    c += t(24, tp + 138, 'Mueve el mapa para ajustar el punto exacto.', 'caption', C.muted);
    c += button(C, 24, tp + 162, W - 48, 'Confirmar recogida', 'primary', { state: state === 'moving' ? 'disabled' : 'default' });
    return c;
  };
  if (state === 'search') {
    let list = rect(0, 0, W, H, C.background) + sb;
    let y = 128;
    const it = (ic, a, b, col) => { const rw = row(C, 24, y, W - 48, a, b, { icon: ic, iconColor: col || C.text, divider: true, h: 64 }); list += rw.svg; y += rw.h; };
    it('locate', 'Usar mi ubicación actual', 'Chapinero, Bogotá', C.primary);
    it('pin', 'Calle 45 # 7-20', 'Chapinero, Bogotá');
    it('pin', 'Calle 45 # 7-02', 'Chapinero, Bogotá');
    it('pin', 'Carrera 7 # 45-10', 'Chapinero, Bogotá');
    it('clock', 'Calle 53 # 13-40', 'Reciente');
    y += 8;
    list += icon('pin', 24, y + 6, 22, C.primary) + t(56, y + 23, 'Elegir en el mapa', 'bodyB', C.primary);
    list += t(W - 24, y + 23, 'Búsqueda: Mapbox', 'micro', C.muted, { anchor: 'end' });
    let kb = rect(0, 560, W, 284, C.name === 'light' ? '#D7D9DE' : '#2B2F36');
    const keys = ['qwertyuiop', 'asdfghjklñ', 'zxcvbnm'];
    keys.forEach((k, i) => { [...k].forEach((ch, j) => { const kx = 6 + j * 37.8 + (i === 2 ? 56 : 0); kb += rect(kx, 572 + i * 54, 33, 44, C.name === 'light' ? '#FFFFFF' : '#4A4F57', { rx: 6 }) + t(kx + 16.5, 600 + i * 54, ch, 'body', C.name === 'light' ? '#16212E' : '#FFFFFF', { anchor: 'middle' }); }); });
    kb += rect(96, 734, 198, 44, C.name === 'light' ? '#FFFFFF' : '#4A4F57', { rx: 6 }) + t(195, 762, 'espacio', 'caption', C.name === 'light' ? '#16212E' : '#FFFFFF', { anchor: 'middle' });
    list += g('Keyboard/system', kb);
    return list + L.statusBar(C) + L.homeIndicator(C);
  }
  return mapScreen(C, { view: v, overlays, sheetTop: top, content, extra: extra + sb + bnr, fabs: (tp) => L.fab(C, W - 64, tp - 112, 'locate', { color: state === 'denied' ? C.muted : C.primary }) });
}

// ---------- Paso 2: ¿Quién y cuánto? ----------
function details(C, state) {
  let s = L.navRow(C, { back: true, step: 'Paso 2 de 3' });
  s += t(24, 136, '¿Quién sale y cuánto?', 'title', C.text);
  let y = 164;
  s += section(C, 24, y, 'Perros'); y += 10;
  if (state === 'nopets') {
    let c = card(C, 24, y, W - 48, 96, { fill: C.surface2, stroke: false }) + icon('paw', 44, y + 22, 28, C.primary) + t(84, y + 40, 'Agrega a tu perro para pedir', 'bodyB', C.text) + t(84, y + 62, 'Solo toma un minuto.', 'caption', C.muted);
    c += button(C, W - 150, y + 26, 110, 'Agregar', 'secondary', { h: 44 });
    s += g('NoPetsCard', c); y += 116;
  } else {
    const c = chips(C, 24, y, W - 48, [{ label: 'Luna', selected: true, avatar: true }, { label: 'Max', avatar: true }]); s += c.svg; y += c.h + 6;
    s += t(24, y + 14, 'Hasta 3 perros por paseo.', 'caption', C.muted); y += 34;
  }
  s += section(C, 24, y, 'Tipo de paseo'); y += 10;
  let c = chips(C, 24, y, W - 48, [{ label: 'Individual', selected: true }, 'Grupal']); s += c.svg; y += c.h + 22;
  s += section(C, 24, y, 'Duración'); y += 10;
  c = chips(C, 24, y, W - 48, ['30 min', '45 min', { label: '60 min', selected: true }, '90 min', '120 min']); s += c.svg; y += c.h + 22;
  s += section(C, 24, y, '¿Cuándo?'); y += 10;
  c = chips(C, 24, y, W - 48, [{ label: 'Ahora', selected: true }, 'En 1 hora', 'Mañana 8:00', 'Mañana 17:00', 'Otra fecha']); s += c.svg; y += c.h + 18;
  const f = field(C, 24, y, W - 48, 'Indicaciones para el paseador (opcional)', 'Timbre dañado, llamar al llegar'); s += f.svg;
  let foot = t(24, H - 116, 'Total', 'caption', C.muted) + t(24, H - 90, state === 'nopets' ? '—' : '$ 23.000', 'title', C.text) + t(W - 24, H - 96, 'Individual · 60 min', 'caption', C.muted, { anchor: 'end' });
  foot += button(C, 24, H - 76, W - 48, 'Continuar', 'primary', { state: state === 'nopets' ? 'disabled' : 'default' });
  s += L.actionFooter(C, foot, 146);
  return plain(C, s, { noHome: true });
}

// ---------- Paso 3: Confirmar y pagar (RF-019 + RF-015) ----------
function confirm(C, state) {
  let s = L.navRow(C, { back: true, step: 'Paso 3 de 3' });
  s += t(24, 136, 'Confirma tu paseo', 'title', C.text);
  let y = 156;
  if (state === 'declined') { const b = banner(C, 24, y, W - 48, 'danger', 'Tu método de pago fue rechazado.', 'No creamos el paseo. Prueba con otro método o revisa con tu banco.', { action: 'Cambiar método de pago' }); s += b.svg; y += b.h + 12; }
  s += miniMap(C, 24, y, W - 48, 96, { ox: PK[0] - 171, oy: PK[1] - 70, z: 1, key: state });
  y += 108;
  [['Perros', 'Luna'], ['Paseo', 'Individual · 60 min'], ['Cuándo', 'Ahora'], ['Recogida', 'Calle 45 # 7-20'], ['Indicaciones', 'Timbre dañado, llamar…']].forEach(([a, b]) => {
    s += t(24, y + 24, a, 'caption', C.muted) + t(W - 24, y + 24, b, 'captionM', C.text, { anchor: 'end' }); y += 32;
  });
  y += 8;
  let pc = card(C, 24, y, W - 48, 150);
  pc += t(44, y + 30, 'Total', 'caption', C.muted) + t(W - 44, y + 34, '$ 23.000', 'title', C.text, { anchor: 'end' });
  pc += t(44, y + 56, 'Incluye la comisión de Waggo ($ 4.600)', 'caption', C.muted);
  pc += rect(44, y + 72, W - 88, 1, C.border);
  pc += icon('card', 44, y + 90, 22, C.text) + t(76, y + 106, 'Visa •••• 4242', 'bodyM', C.text) + t(W - 44, y + 106, 'Cambiar', 'captionB', C.primary, { anchor: 'end' });
  pc += t(76, y + 128, 'Método de pago por defecto', 'micro', C.muted);
  s += g('PaymentCard', pc); y += 162;
  if (y < 650) s += g('EscrowNote', icon('shield', 24, y, 20, C.secondary) + para(52, y + 15, 'Retenemos $ 23.000 y solo se cobra si el paseo ocurre. Si cancelas antes de que empiece, se libera.', 'caption', C.muted, W - 76).svg);
  s += L.actionFooter(C, button(C, 24, H - 100, W - 48, state === 'sending' ? 'Pidiendo…' : state === 'declined' ? 'Intentar de nuevo' : 'Pedir paseo · $ 23.000', 'primary', { state: state === 'sending' ? 'loading' : 'default' }), 120);
  return plain(C, s, { noHome: true });
}

// ---------- Estado del paseo: buscando / aceptado (RF-007) ----------
function searching(C, state) {
  const v = view(PK[0], PK[1], 0.8, 195, 300);
  const overlays = (vv) => {
    const [px, py] = M.P(vv, ...PK);
    let o = '';
    if (state !== 'none') o += circle(px, py - 26, 120, C.primary, { opacity: 0.06 }) + circle(px, py - 26, 80, C.primary, { opacity: 0.08 }) + circle(px, py - 26, 44, C.primary, { opacity: 0.12 });
    o += M.pinHome(C, px, py);
    return o;
  };
  const top = 470;
  const content = (tp) => {
    let c = '';
    if (state === 'none') {
      c += pill(C, 24, tp + 28, 'Buscando paseador', 'warning', { dot: true });
      c += t(24, tp + 86, 'Nadie ha aceptado todavía', 'title', C.text);
      c += para(24, tp + 114, 'Llevamos 15 minutos buscando. Puedes seguir esperando o programarlo para más tarde.', 'body', C.muted, W - 48).svg;
      c += button(C, 24, tp + 196, W - 48, 'Seguir buscando');
      c += button(C, 24, tp + 260, W - 48, 'Programar para más tarde', 'secondary');
      c += t(W / 2, tp + 346, 'Cancelar paseo', 'captionB', C.primary, { anchor: 'middle' });
      return c;
    }
    c += pill(C, 24, tp + 28, 'Buscando paseador', 'primary', { dot: true, pulse: true });
    c += t(W - 24, tp + 45, 'Hace 2 min', 'caption', C.muted, { anchor: 'end' });
    c += t(24, tp + 90, 'Buscando un paseador cerca', 'title', C.text);
    c += t(24, tp + 116, 'Te avisamos apenas alguien acepte.', 'body', C.muted);
    c += rect(24, tp + 136, W - 48, 4, C.surface2, { rx: 2 }) + rect(24 + 90, tp + 136, 120, 4, C.primary, { rx: 2 });
    c += rect(24, tp + 160, W - 48, 1, C.border);
    c += L.avatar(C, 48, tp + 196, 20, 'L', { fg: C.primary }) + t(80, tp + 192, 'Luna · Individual · 60 min', 'bodyM', C.text) + t(80, tp + 212, 'Ahora · Calle 45 # 7-20', 'caption', C.muted);
    c += t(W - 24, tp + 192, '$ 23.000', 'bodyB', C.text, { anchor: 'end' }) + t(W - 24, tp + 212, 'Retenido', 'caption', C.muted, { anchor: 'end' });
    c += button(C, 24, tp + 250, W - 48, 'Cancelar paseo', 'secondary');
    return c;
  };
  let extra = '';
  if (state === 'cancel') extra = L.confirmSheet(C, '¿Cancelar el paseo?', 'Aún nadie lo ha aceptado. Liberamos los $ 23.000 retenidos en tu método de pago.', [{ label: 'Sí, cancelar paseo' }, { label: 'No, seguir buscando', variant: 'secondary' }], { top: 520 });
  return mapScreen(C, { view: v, overlays, sheetTop: top, content, topBar: L.topBarFloating(C, 'Tu paseo', { bell: 0 }), extra, noHome: state === 'cancel' });
}

function accepted(C, state) {
  const v = view(PK[0], PK[1], 0.8, 195, state === 'expanded' ? 60 : 280);
  const overlays = (vv) => { const [px, py] = M.P(vv, ...PK); return M.pinHome(C, px, py); };
  const top = state === 'expanded' ? 150 : 430;
  const content = (tp) => {
    let c = pill(C, 24, tp + 28, 'Aceptado', 'success', { dot: true });
    c += t(24, tp + 88, 'Bruno va en camino', 'title', C.text);
    c += t(24, tp + 112, 'Recoge a Luna en Calle 45 # 7-20.', 'body', C.muted);
    let y = tp + 136;
    let wc = card(C, 24, y, W - 48, 84, { fill: C.surface2, stroke: false });
    wc += L.avatar(C, 66, y + 42, 24, 'B', { bg: C.surface, verified: true });
    wc += t(104, y + 38, 'Bruno C.', 'bodyB', C.text) + icon('shield', 104, y + 48, 16, C.secondary) + t(124, y + 61, 'Paseador verificado', 'captionM', C.secondary);
    wc += g('IconButton/chat', circle(W - 70, y + 42, 24, C.primary) + icon('chat', W - 81, y + 31, 22, C.primaryText));
    c += g('WalkerCard', wc); y += 104;
    if (state === 'expanded') {
      [['Perros', 'Luna'], ['Paseo', 'Individual · 60 min'], ['Cuándo', 'Hoy, 3:00 p. m.'], ['Recogida', 'Calle 45 # 7-20'], ['Indicaciones', 'Timbre dañado, llamar al llegar']].forEach(([a, b]) => {
        c += t(24, y + 24, a, 'body', C.muted) + t(W - 24, y + 24, b, 'bodyM', C.text, { anchor: 'end' }) + rect(24, y + 40, W - 48, 1, C.border); y += 48;
      });
      y += 12;
      c += g('PaymentSummary', rect(24, y, W - 48, 72, C.surface2, { rx: 14 }) + icon('wallet', 40, y + 14, 22, C.text) + t(72, y + 30, 'Pago · $ 23.000', 'bodyB', C.text) + t(72, y + 52, 'Retenido: se cobra al terminar', 'caption', C.muted)); y += 96;
      c += button(C, 24, y, W - 48, 'Cancelar paseo', 'secondary');
      c += t(W / 2, y + 84, 'Cancelar es gratis hasta que el paseo empiece.', 'caption', C.muted, { anchor: 'middle' });
    } else {
      c += t(24, y + 10, 'Pago retenido · $ 23.000 · se cobra al terminar', 'caption', C.muted);
      c += t(W / 2, y + 56, 'Ver detalles y cancelar', 'captionB', C.primary, { anchor: 'middle' });
    }
    return c;
  };
  return mapScreen(C, { view: v, overlays, sheetTop: top, sheetState: state === 'expanded' ? 'expanded' : 'medium', content, topBar: state === 'expanded' ? '' : L.topBarFloating(C, 'Tu paseo', { bell: 1 }), fabs: (tp) => state === 'expanded' ? '' : L.sosFab(C, W - 92, tp - 104) });
}

// ---------- Paseo en vivo (RF-008) ----------
function live(C, state) {
  const z = 0.68;
  const collapsed = state === 'collapsed';
  const expanded = state === 'expanded';
  const stale = state === 'stale';
  const v = stale ? view(M.PTS.walker[0] - 60, M.PTS.walker[1], 0.58, 195, 250) : view(M.PTS.walker[0] - 60, M.PTS.walker[1], z, 195, expanded ? 46 : collapsed ? 260 : 196);
  const overlays = (vv) => {
    let o = M.geofence(C, vv, ...PK, 937);
    o += M.route(C, vv, M.PTS.walked, 'walked');
    const [sx, sy] = M.P(vv, ...PK);
    o += M.pinHome(C, sx, sy);
    const [wx, wy] = M.P(vv, ...M.PTS.walker);
    o += M.walkerLive(C, wx, wy, { heading: 15, stale, label: stale ? 'Hace 3 min' : 'Hace 10 s' });
    return o;
  };
  const top = expanded ? 84 : collapsed ? 712 : 474;
  const content = (tp) => {
    if (collapsed) {
      let c = pill(C, 24, tp + 26, 'En curso', 'primary', { dot: true, pulse: true });
      c += t(24, tp + 78, '1,2 km · 24 de 60 min', 'subtitle', C.text);
      c += t(24, tp + 100, 'Desliza para ver más', 'caption', C.muted);
      c += g('IconButton/chat', circle(W - 48, tp + 64, 24, C.primary) + icon('chat', W - 59, tp + 53, 22, C.primaryText));
      return c;
    }
    let c = pill(C, 24, tp + 28, 'En curso', 'primary', { dot: true, pulse: true });
    c += t(W - 24, tp + 45, stale ? 'Última posición hace 3 min' : 'Actualizado hace 10 s', 'caption', stale ? C.warningText : C.muted, { anchor: 'end' });
    c += t(24, tp + 90, 'Luna está paseando con Bruno', 'subtitle', C.text);
    c += metric(C, 24, tp + 122, 'Distancia', '1,2 km', { big: true });
    c += metric(C, 150, tp + 122, 'Tiempo', '24 min', { big: true });
    c += metric(C, 268, tp + 122, 'Termina', '4:10 p. m.', { big: true });
    c += rect(24, tp + 172, W - 48, 6, C.surface2, { rx: 3 }) + rect(24, tp + 172, (W - 48) * 0.4, 6, C.primary, { rx: 3 });
    c += t(24, tp + 196, '24 de 60 min', 'micro', C.muted);
    c += button(C, 24, tp + 214, (W - 60) / 2, 'Mensajes', 'secondary', { icon: 'chat', h: 48 });
    c += button(C, 36 + (W - 60) / 2, tp + 214, (W - 60) / 2, 'Detalles', 'secondary', { h: 48 });
    if (expanded) {
      let y = tp + 290;
      let wc = card(C, 24, y, W - 48, 76, { fill: C.surface2, stroke: false });
      wc += L.avatar(C, 62, y + 38, 22, 'B', { bg: C.surface, verified: true }) + t(98, y + 34, 'Bruno C.', 'bodyB', C.text) + t(98, y + 56, 'Paseador verificado', 'captionM', C.secondary);
      c += g('WalkerCard', wc); y += 96;
      [['Perros', 'Luna'], ['Inició', '3:10 p. m.'], ['Recogida', 'Calle 45 # 7-20'], ['Zona acordada', '1,5 km desde la recogida']].forEach(([a, b]) => {
        c += t(24, y + 22, a, 'body', C.muted) + t(W - 24, y + 22, b, 'bodyM', C.text, { anchor: 'end' }) + rect(24, y + 36, W - 48, 1, C.border); y += 44;
      });
      y += 12;
      c += g('PaymentSummary', rect(24, y, W - 48, 68, C.surface2, { rx: 14 }) + icon('wallet', 40, y + 14, 22, C.text) + t(72, y + 30, 'Pago · $ 23.000', 'bodyB', C.text) + t(72, y + 50, 'Retenido: se cobra al terminar', 'caption', C.muted)); y += 88;
      c += icon('alert', 24, y, 22, C.danger) + t(56, y + 17, 'Reportar una emergencia', 'bodyB', C.danger);
      c += t(W - 24, y + 17, 'Alertas: ninguna', 'caption', C.muted, { anchor: 'end' });
    }
    return c;
  };
  let bnr = '';
  if (stale) bnr = banner(C, 16, 112, W - 32, 'info', 'Bruno perdió la señal.', 'Su teléfono guarda la ruta y la enviará al reconectarse.', { shadow: true }).svg;
  const mapError = state === 'maperror';
  const mapErrorContent = mapError ? g('MapErrorState', circle(195, 250, 36, C.surface) + icon('layers', 177, 232, 36, C.muted) + t(195, 322, 'No pudimos cargar el mapa', 'subtitle', C.text, { anchor: 'middle' }) + t(195, 346, 'El paseo sigue. Te mostramos los datos abajo.', 'caption', C.muted, { anchor: 'middle' }) + button(C, 120, 370, 150, 'Reintentar', 'surface', { h: 44 })) : '';
  return mapScreen(C, {
    view: v, overlays, sheetTop: top, sheetState: state, content, mapError, mapErrorContent,
    topBar: expanded ? '' : L.topBarFloating(C, 'Paseo en curso', { bell: 0 }), banner: bnr,
    fabs: (tp) => expanded ? '' : mapError ? L.sosFab(C, W - 92, tp - 104) : L.fab(C, W - 64, tp - 164, 'locate', { color: C.primary, id: 'recenter/following' }) + L.sosFab(C, W - 92, tp - 104),
  });
}

// ---------- Alertas automáticas (RF-009, RF-010) ----------
function alerts(C, state) {
  const geo = state === 'geofence';
  const z = geo ? 0.26 : 0.72;
  const v = geo ? view(PK[0] + 120, PK[1] - 520, z, 195, 380) : view(M.PTS.walker[0] - 60, M.PTS.walker[1], z, 195, 290);
  const overlays = (vv) => {
    let o = M.geofence(C, vv, ...PK, 937, geo);
    const [sx, sy] = M.P(vv, ...PK);
    if (geo) {
      o += M.route(C, vv, M.PTS.outside, 'walked');
      o += M.pinHome(C, sx, sy);
      const exit = M.P(vv, M.vx(10), M.hy(16) - 937);
      o += M.alertMarker(C, exit[0], exit[1] + 4);
      const last = M.PTS.outside[M.PTS.outside.length - 1];
      const [wx, wy] = M.P(vv, ...last);
      o += M.walkerLive(C, wx, wy, { heading: 60, pulse: false });
    } else {
      o += M.route(C, vv, M.PTS.walked, 'walked');
      o += M.pinHome(C, sx, sy);
      const [wx, wy] = M.P(vv, ...M.PTS.walker);
      o += M.alertMarker(C, wx - 40, wy + 34, { kind: 'warning' });
      o += M.walkerLive(C, wx, wy, { label: 'Detenido 10 min' });
    }
    return o;
  };
  const bnr = geo
    ? banner(C, 16, 112, W - 32, 'danger', 'El paseo salió de la zona acordada', 'Luna y Bruno están a 1,8 km de la recogida · hace 1 min', { solid: true, shadow: true }).svg
    : banner(C, 16, 112, W - 32, 'warning', 'El paseo lleva 10 minutos detenido', 'Puede ser una pausa para jugar. Escríbele a Bruno si te preocupa.', { shadow: true, icon: 'clock' }).svg;
  const top = 560;
  const content = (tp) => {
    let c = pill(C, 24, tp + 28, geo ? 'Fuera de la zona' : 'Detenido', geo ? 'danger' : 'warning', { dot: true });
    c += t(24, tp + 86, geo ? '¿Todo bien con Luna?' : 'Bruno está quieto hace 10 min', 'subtitle', C.text);
    c += t(24, tp + 110, geo ? 'Escríbele a Bruno para saber dónde están.' : 'Última posición: Parque Los Alisos.', 'caption', C.muted);
    c += button(C, 24, tp + 134, W - 48, 'Escribir a Bruno', 'primary', { icon: 'chat' });
    c += button(C, 24, tp + 198, W - 48, 'Reportar una emergencia', 'dangerOutline', { icon: 'alert' });
    return c;
  };
  return mapScreen(C, { view: v, overlays, sheetTop: top, content, topBar: L.topBarFloating(C, 'Paseo en curso', { bell: 1 }), banner: bnr });
}

// ---------- Resumen (RF-011 + RF-016) ----------
function summary(C, state) {
  const done = state === 'done';
  const v = view(M.vx(9), M.hy(12) + 40, 0.62, 195, 250);
  const overlays = (vv) => {
    let o = '';
    if (done) { o += M.route(C, vv, M.PTS.full, 'walked'); }
    const [sx, sy] = M.P(vv, ...PK);
    o += M.pinHome(C, sx, sy, done ? {} : { color: C.muted });
    return o;
  };
  const top = 440;
  const content = (tp) => {
    let c = pill(C, 24, tp + 28, done ? 'Terminado' : 'Cancelado', done ? 'success' : 'muted');
    c += t(24, tp + 88, done ? 'Luna volvió a casa' : 'Cancelaste este paseo', 'title', C.text);
    if (done) {
      c += metric(C, 24, tp + 120, 'Distancia', '2,8 km', { big: true }) + metric(C, 150, tp + 120, 'Duración', '58 min', { big: true }) + metric(C, 268, tp + 120, 'Recogida', '3:10 p. m.');
      c += t(268, tp + 168, 'Entrega 4:08 p. m.', 'micro', C.muted);
      c += g('PaymentSummary/captured', rect(24, tp + 186, W - 48, 64, L.KIND(C).success.bg, { rx: 14 }) + icon('check', 40, tp + 206, 22, C.success) + t(72, tp + 214, 'Pagado · $ 23.000', 'bodyB', C.text) + t(72, tp + 236, 'Se cobró al terminar el paseo.', 'caption', C.muted));
      c += g('RatingCard', t(24, tp + 284, 'Califica a Bruno', 'bodyB', C.text) + [0, 1, 2, 3, 4].map((i) => icon('star', 24 + i * 46, tp + 296, 34, C.borderStrong)).join(''));
      c += button(C, 24, tp + 340, W - 48, 'Pedir otro paseo');
    } else {
      c += para(24, tp + 120, 'Liberado: no se cobró. Los $ 23.000 retenidos vuelven a tu método de pago en el plazo de tu banco.', 'body', C.muted, W - 48).svg;
      c += rect(24, tp + 200, W - 48, 1, C.border);
      c += t(24, tp + 232, 'Luna · Individual · 60 min', 'bodyM', C.text) + t(24, tp + 254, 'Hoy, 3:00 p. m. · Calle 45 # 7-20', 'caption', C.muted);
      c += button(C, 24, tp + 290, W - 48, 'Pedir de nuevo');
    }
    return c;
  };
  return mapScreen(C, { view: v, overlays, sheetTop: top, content, topBar: L.topBarFloating(C, done ? 'Resumen del paseo' : 'Paseo cancelado') });
}

// ---------- Mis paseos (RF-007) ----------
function walks(C, state) {
  let s = t(24, 92, 'Mis paseos', 'title', C.text);
  if (state === 'empty') {
    s += L.emptyState(C, 320, 'route', 'Aún no has pedido paseos', 'Cuando pidas uno, aquí verás los activos, los programados y tu historial.').svg;
    s += button(C, 24, 510, W - 48, 'Pedir un paseo');
  } else {
    let y = 124;
    s += section(C, 24, y, 'En curso'); y += 8;
    let c = card(C, 24, y, W - 48, 84, { shadow: true }) + L.avatar(C, 64, y + 42, 22, 'L', { fg: C.primary }) + t(98, y + 36, 'Luna con Bruno C.', 'bodyB', C.text) + t(98, y + 58, '1,2 km · 24 de 60 min', 'caption', C.muted) + pill(C, W - 44, y + 18, 'En curso', 'primary', { dot: true, alignEnd: true }) + icon('chevronR', W - 66, y + 46, 22, C.muted);
    s += g('WalkRow/active', c); y += 108;
    s += section(C, 24, y, 'Programados'); y += 6;
    let rw = row(C, 24, y, W - 48, 'Max · Grupal · 45 min', 'Mañana, 8:00 a. m.', { icon: 'calendar', right: '$ 11.800', rightSub: 'Buscando', chevron: true, divider: true }); s += rw.svg; y += rw.h + 24;
    s += section(C, 24, y, 'Historial'); y += 6;
    [['Luna · Individual · 60 min', '22 oct · 2,8 km', '$ 23.000', 'Terminado'], ['Max · Individual · 30 min', '20 oct', '$ 15.500', 'Cancelado'], ['Luna y Max · Grupal · 45 min', '18 oct · 2,1 km', '$ 11.800', 'Terminado']].forEach(([a, b, p, st]) => {
      rw = row(C, 24, y, W - 48, a, b, { right: p, rightSub: st, rightSubColor: st === 'Cancelado' ? C.muted : C.success, chevron: true, divider: true }); s += rw.svg; y += rw.h;
    });
  }
  s += L.tabBar(C, 'owner', 'Paseos');
  return plain(C, s, { noHome: true });
}

module.exports = [
  { file: 'dueno-inicio-tab', title: 'Inicio del dueño (RF-007, RF-014)', frames: [['Primer uso (sin perros)', 'light', (C) => home(C, 'first')], ['Con paseo en curso', 'light', (C) => home(C, 'active')], ['Cargando', 'light', (C) => home(C, 'loading')], ['Con paseo en curso', 'dark', (C) => home(C, 'active')]] },
  { file: 'dueno-mascotas-lista', title: 'Mis perros (RF-004)', frames: [['Con perros', 'light', (C) => pets(C, 'list')], ['Vacía', 'light', (C) => pets(C, 'empty')], ['Error', 'light', (C) => pets(C, 'error')]] },
  { file: 'dueno-mascotas-agregar', title: 'Agregar perro (RF-004)', frames: [['Formulario', 'light', (C) => addPet(C, 'form')], ['Errores de validación', 'light', (C) => addPet(C, 'errors')], ['Límite alcanzado', 'light', (C) => addPet(C, 'limit')]] },
  { file: 'dueno-mascotas-detalle', title: 'Detalle del perro (RF-004)', frames: [['Detalle', 'light', petDetail], ['Detalle', 'dark', petDetail]] },
  { file: 'dueno-pedir-paseo-donde', title: 'Pedir paseo · 1 ¿Dónde? (RF-007, mapa)', frames: [['Pin en mi ubicación', 'light', (C) => where(C, 'default')], ['Buscar dirección', 'light', (C) => where(C, 'search')], ['Moviendo el pin', 'light', (C) => where(C, 'moving')], ['Ubicación denegada', 'light', (C) => where(C, 'denied')], ['Ubicación aproximada', 'light', (C) => where(C, 'approx')], ['Pin en mi ubicación', 'dark', (C) => where(C, 'default')]] },
  { file: 'dueno-pedir-paseo-detalles', title: 'Pedir paseo · 2 ¿Quién y cuánto? (RF-007, RF-019)', frames: [['Con precio en vivo', 'light', (C) => details(C, 'default')], ['Sin perros registrados', 'light', (C) => details(C, 'nopets')]] },
  { file: 'dueno-pedir-paseo-confirmar', title: 'Pedir paseo · 3 Confirmar y pagar (RF-019, RF-015)', frames: [['Resumen y pago', 'light', (C) => confirm(C, 'default')], ['Pidiendo', 'light', (C) => confirm(C, 'sending')], ['Pago rechazado', 'light', (C) => confirm(C, 'declined')]] },
  { file: 'dueno-paseo-buscando', title: 'Buscando paseador (RF-007, RF-006)', frames: [['Buscando', 'light', (C) => searching(C, 'searching')], ['Confirmar cancelación', 'light', (C) => searching(C, 'cancel')], ['Nadie aceptó (nueva, requiere spec)', 'light', (C) => searching(C, 'none')]] },
  { file: 'dueno-paseo-aceptado', title: 'Paseo aceptado (RF-007)', frames: [['Sheet medio', 'light', (C) => accepted(C, 'medium')], ['Sheet expandido', 'light', (C) => accepted(C, 'expanded')]] },
  { file: 'dueno-paseo-en-vivo', title: 'Paseo en vivo, vista del dueño (RF-008, RF-011)', frames: [['Sheet medio', 'light', (C) => live(C, 'medium')], ['Sheet colapsado', 'light', (C) => live(C, 'collapsed')], ['Sheet expandido', 'light', (C) => live(C, 'expanded')], ['Señal perdida', 'light', (C) => live(C, 'stale')], ['Mapa no carga', 'light', (C) => live(C, 'maperror')], ['Sheet medio', 'dark', (C) => live(C, 'medium')]] },
  { file: 'dueno-paseo-alertas', title: 'Alertas automáticas, vista del dueño (RF-009, RF-010)', frames: [['Salió de la zona', 'light', (C) => alerts(C, 'geofence')], ['Detenido 10 min', 'light', (C) => alerts(C, 'anomaly')], ['Salió de la zona', 'dark', (C) => alerts(C, 'geofence')]] },
  { file: 'dueno-paseo-resumen', title: 'Resumen del paseo (RF-011, RF-016)', frames: [['Terminado y pagado', 'light', (C) => summary(C, 'done')], ['Cancelado (liberado)', 'light', (C) => summary(C, 'cancelled')]] },
  { file: 'dueno-paseos-lista', title: 'Mis paseos (RF-007)', frames: [['Con paseos', 'light', (C) => walks(C, 'list')], ['Vacía', 'light', (C) => walks(C, 'empty')]] },
];
