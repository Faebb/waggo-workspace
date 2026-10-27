'use strict';
const L = require('./lib');
const M = require('./map');
const { view, mapScreen, plain } = require('./compose');
const { W, H, t, para, rect, circle, g, icon, button, field, chips, banner, row, section, card, pill } = L;

// ---------- Bienvenida (UX-001) ----------
function welcome(C) {
  let s = '';
  // Brand hero (head + "Waggo" lettering). On dark it sits on a cream badge so the eyes keep their contrast.
  s += C.name === 'dark' ? L.logoBadge(W / 2, 106, 132) : L.logoHero(W / 2 - 75, 30, 150);
  const dy = 30;
  s += t(24, 170 + dy, 'Paseadores verificados, en vivo', 'eyebrow', C.muted, { upper: true });
  s += t(24, 214 + dy, 'Paseos', 'display', C.text);
  s += t(140, 214 + dy, 'seguros', 'display', C.primary);
  s += t(24, 252 + dy, 'para tu perro', 'display', C.text);
  s += para(24, 290 + dy, 'Pide un paseo como pides un viaje: ves al paseador en el mapa y pagas al final.', 'body', C.muted, W - 48).svg;
  const pillars = [
    ['shield', 'Paseadores verificados', 'Revisamos su identidad antes de su primer paseo.'],
    ['route', 'Paseo en vivo', 'Sigue la ruta en el mapa, minuto a minuto.'],
    ['wallet', 'Pagas al final', 'Retenemos el pago y solo se cobra si el paseo ocurre.'],
  ];
  let y = 360 + dy;
  pillars.forEach(([ic, ti, de]) => {
    s += g(`ValueCard/${ti}`, rect(24, y, 44, 44, C.surface2, { rx: 22 }) + icon(ic, 35, y + 11, 22, C.primary) + t(84, y + 18, ti, 'bodyB', C.text) + para(84, y + 40, de, 'caption', C.muted, W - 110).svg);
    y += 80;
  });
  s += button(C, 24, 640, W - 48, 'Pedir un paseo');
  s += button(C, 24, 704, W - 48, 'Quiero ser paseador', 'secondary');
  s += t(W / 2, 792, 'Ya tengo cuenta · Iniciar sesión', 'captionB', C.primary, { anchor: 'middle' });
  return plain(C, s);
}

// ---------- Login (RF-005 + social) ----------
function socialButtons(C, y) {
  let s = '';
  s += g('Button/social/google', rect(24, y, W - 48, 52, C.surface, { rx: 26, stroke: C.borderStrong }) + circle(64, y + 26, 11, '#FFFFFF', { stroke: '#DADCE0' }) + t(64, y + 31, 'G', 'captionB', '#4285F4', { anchor: 'middle' }) + t(W / 2 + 10, y + 32, 'Continuar con Google', 'bodyM', C.text, { anchor: 'middle' }));
  y += 64;
  s += g('Button/social/microsoft', rect(24, y, W - 48, 52, C.surface, { rx: 26, stroke: C.borderStrong }) + rect(54, y + 16, 9, 9, '#F25022') + rect(65, y + 16, 9, 9, '#7FBA00') + rect(54, y + 27, 9, 9, '#00A4EF') + rect(65, y + 27, 9, 9, '#FFB900') + t(W / 2 + 10, y + 32, 'Continuar con Microsoft', 'bodyM', C.text, { anchor: 'middle' }));
  y += 76;
  s += rect(24, y, 110, 1, C.border) + t(W / 2, y + 5, 'o con tu correo', 'caption', C.muted, { anchor: 'middle' }) + rect(W - 134, y, 110, 1, C.border);
  return s;
}

function authBrand(C) {
  return C.name === 'dark' ? L.logoBadge(W - 48, 72, 44) : L.logoHead(W - 24 - 32, 50, 44);
}

function login(C, state) {
  let s = L.navRow(C, { back: true }) + authBrand(C);
  s += t(24, 140, 'Inicia sesión', 'title', C.text);
  s += t(24, 166, 'Sigue el paseo de tu perro en vivo.', 'body', C.muted);
  let y = 190;
  if (state === 'error') { const b = banner(C, 24, y, W - 48, 'danger', 'Correo o contraseña incorrectos.', 'Revisa que estén bien escritos o recupera tu contraseña.'); s += b.svg; y += b.h + 16; }
  if (state === 'locked') { const b = banner(C, 24, y, W - 48, 'warning', 'Demasiados intentos.', 'Por seguridad, espera 14:32 min para volver a intentarlo.', { icon: 'clock' }); s += b.svg; y += b.h + 16; }
  if (state === 'unconfirmed') { const b = banner(C, 24, y, W - 48, 'info', 'Confirma tu correo antes de iniciar sesión.', 'Te enviamos un enlace a valentina@correo.com.', { action: 'Reenviar enlace', icon: 'mail' }); s += b.svg; y += b.h + 16; }
  if (state === 'social') { const b = banner(C, 24, y, W - 48, 'danger', 'No pudimos validar tu cuenta de Google.', 'Intenta de nuevo o entra con tu correo.'); s += b.svg; y += b.h + 16; }
  if (state === 'expired') { const b = banner(C, 24, y, W - 48, 'info', 'Tu sesión expiró.', 'Inicia sesión de nuevo para seguir.'); s += b.svg; y += b.h + 16; }
  const compact = y > 230;
  if (!compact) { s += socialButtons(C, y); y += 150; } else { s += g('Button/social/compact', rect(24, y, (W - 56) / 2, 48, C.surface, { rx: 24, stroke: C.borderStrong }) + t(24 + (W - 56) / 4, y + 30, 'Google', 'captionB', C.text, { anchor: 'middle' }) + rect(32 + (W - 56) / 2, y, (W - 56) / 2, 48, C.surface, { rx: 24, stroke: C.borderStrong }) + t(32 + (W - 56) * 0.75, y + 30, 'Microsoft', 'captionB', C.text, { anchor: 'middle' })); y += 72; }
  const errState = state === 'error' ? 'error' : undefined;
  const f1 = field(C, 24, y, W - 48, 'Correo', 'valentina@correo.com', { state: errState, leading: 'mail' });
  s += f1.svg; y += f1.h + 16;
  const f2 = field(C, 24, y, W - 48, 'Contraseña', state === 'default' ? '' : '••••••••', { state: state === 'default' ? 'focus' : errState, leading: 'lock', trailing: 'Mostrar' });
  s += f2.svg; y += f2.h + 14;
  s += t(W - 24, y + 6, '¿Olvidaste tu contraseña?', 'captionB', C.primary, { anchor: 'end' });
  const disabled = state === 'locked';
  s += L.actionFooter(C, button(C, 24, H - 120, W - 48, state === 'loading' ? 'Entrando…' : 'Entrar', 'primary', { state: disabled ? 'disabled' : state === 'loading' ? 'loading' : 'default' }) + t(W / 2, H - 42, '¿No tienes cuenta? Crear cuenta', 'captionB', C.primary, { anchor: 'middle' }), 140);
  return plain(C, s, { noHome: true });
}

// ---------- Registro (RF-001) ----------
function register(C, state) {
  let s = L.navRow(C, { back: true }) + authBrand(C);
  s += t(24, 140, 'Crea tu cuenta', 'title', C.text);
  s += t(24, 166, 'Una sola cuenta para pedir paseos o pasear.', 'body', C.muted);
  let y = 190;
  s += socialButtons(C, y); y += 150;
  const f1 = field(C, 24, y, W - 48, 'Correo', 'valentina@correo.com', state === 'taken' ? { state: 'error', error: 'Ese correo ya tiene una cuenta. ¿Olvidaste tu contraseña?', leading: 'mail' } : { leading: 'mail' });
  s += f1.svg; y += f1.h + 16;
  const f2 = field(C, 24, y, W - 48, 'Contraseña', 'Paseo2', { state: state === 'typing' ? 'focus' : 'filled', leading: 'lock', trailing: 'Mostrar' });
  s += f2.svg; y += f2.h + 14;
  const rules = state === 'typing' ? [['Al menos 8 caracteres', false], ['Una mayúscula', true], ['Un número', true]] : [['Al menos 8 caracteres', true], ['Una mayúscula', true], ['Un número', true]];
  let rs = '';
  rules.forEach(([label, ok], i) => {
    const c = ok ? C.success : C.muted;
    rs += circle(34, y + 10 + i * 26, 9, ok ? C.success : 'none', { stroke: c, sw: 1.5 });
    if (ok) rs += icon('check', 28, y + 4 + i * 26, 12, '#FFFFFF', { sw: 3 });
    rs += t(52, y + 15 + i * 26, label, 'caption', ok ? C.text : C.muted);
  });
  s += g('PasswordRules', rs);
  y += 88;
  s += para(24, y, 'Al crear tu cuenta aceptas los Términos y la Política de privacidad.', 'caption', C.muted, W - 48).svg;
  s += L.actionFooter(C, button(C, 24, H - 100, W - 48, state === 'sending' ? 'Creando cuenta…' : 'Crear cuenta', 'primary', { state: state === 'sending' ? 'loading' : state === 'typing' ? 'disabled' : 'default' }), 120);
  return plain(C, s, { noHome: true });
}

// ---------- Confirmar correo (RF-001) ----------
function confirmEmail(C, state) {
  let s = L.navRow(C, { back: state === 'sent' });
  const cfg = {
    sent: ['mail', 'primary', 'Revisa tu correo', 'Te enviamos un enlace a valentina@correo.com. Ábrelo desde este teléfono para activar tu cuenta. El enlace vence en 24 horas.', [['Abrir mi correo', 'primary'], ['Ya lo confirmé, iniciar sesión', 'secondary']], '¿No llegó? Revisa la carpeta de spam o reenvíalo.'],
    ok: ['check', 'success', '¡Cuenta confirmada!', 'Ya puedes iniciar sesión y registrar a tu perro.', [['Iniciar sesión', 'primary']], ''],
    expired: ['clock', 'warning', 'El enlace venció', 'Los enlaces duran 24 horas. Pide uno nuevo y ábrelo pronto.', [['Enviar un enlace nuevo', 'primary'], ['Volver al inicio', 'secondary']], ''],
    invalid: ['alert', 'danger', 'Este enlace ya no sirve', 'Puede que ya lo hayas usado. Intenta iniciar sesión; si no puedes, pide un enlace nuevo.', [['Iniciar sesión', 'primary'], ['Enviar un enlace nuevo', 'secondary']], ''],
  }[state];
  const k = L.KIND(C)[cfg[1]];
  s += circle(W / 2, 250, 56, k.bg) + icon(cfg[0], W / 2 - 26, 224, 52, k.fg);
  s += t(W / 2, 360, cfg[2], 'title', C.text, { anchor: 'middle' });
  s += para(W / 2, 394, cfg[3], 'body', C.muted, W - 64, { anchor: 'middle' }).svg;
  let y = H - 64 * cfg[4].length - 60;
  cfg[4].forEach(([label, v]) => { s += button(C, 24, y, W - 48, label, v); y += 64; });
  if (cfg[5]) s += t(W / 2, 560, cfg[5], 'caption', C.muted, { anchor: 'middle' });
  return plain(C, s);
}

// ---------- Cotizador público (RF-019) ----------
function quote(C, state) {
  let s = L.navRow(C, { back: true });
  s += t(24, 140, 'Cotizar paseo', 'title', C.text);
  s += t(24, 166, 'Mira el precio antes de crear tu cuenta.', 'body', C.muted);
  let y = 200;
  s += section(C, 24, y, 'Tipo de paseo'); y += 12;
  const c1 = chips(C, 24, y, W - 48, [{ label: 'Individual', selected: true }, 'Grupal']); s += c1.svg; y += c1.h + 28;
  s += section(C, 24, y, 'Duración'); y += 12;
  const c2 = chips(C, 24, y, W - 48, ['30 min', '45 min', { label: '60 min', selected: true }, '90 min', '120 min']); s += c2.svg; y += c2.h + 28;
  if (state === 'error') {
    s += banner(C, 24, y, W - 48, 'danger', 'No pudimos calcular el precio.', 'Revisa tu conexión e intenta de nuevo.', { action: 'Intentar de nuevo' }).svg;
  } else if (state === 'loading') {
    s += card(C, 24, y, W - 48, 190) + L.skeleton(C, 44, y + 24, 120, 14) + L.skeleton(C, 44, y + 50, 180, 34) + L.skeleton(C, 44, y + 110, W - 88, 14) + L.skeleton(C, 44, y + 140, W - 88, 14);
  } else {
    let cs = card(C, 24, y, W - 48, 196);
    cs += t(44, y + 34, 'Total', 'eyebrow', C.muted, { upper: true });
    cs += t(44, y + 76, '$ 23.000', 'display', C.text);
    cs += t(W - 44, y + 76, 'COP', 'captionM', C.muted, { anchor: 'end' });
    cs += rect(44, y + 98, W - 88, 1, C.border);
    cs += t(44, y + 130, 'Para el paseador', 'caption', C.muted) + t(W - 44, y + 130, '$ 18.400', 'captionB', C.text, { anchor: 'end' });
    cs += t(44, y + 160, 'Comisión de Waggo', 'caption', C.muted) + t(W - 44, y + 160, '$ 4.600', 'captionB', C.text, { anchor: 'end' });
    s += g('FareQuoteCard', cs);
  }
  s += L.actionFooter(C, button(C, 24, H - 100, W - 48, 'Pedir este paseo'), 120);
  return plain(C, s, { noHome: true });
}

// ---------- Chat (RF-013) ----------
function bubble(C, mine, y, text, time, o = {}) {
  const maxW = 260;
  const p = para(0, 0, text, 'body', C.text, maxW - 28);
  const lines = p.lines;
  const w = Math.min(maxW, Math.max(80, L.textWidth(text, 'body') + 28));
  const h = lines * 24 + 34;
  const x = mine ? W - 16 - w : 16;
  let s = rect(x, y, w, h, mine ? C.primary : C.surface, { rx: 18, stroke: mine ? null : C.border });
  s += para(x + 14, y + 26, text, 'body', mine ? C.primaryText : C.text, w - 28).svg;
  s += t(x + w - 14, y + h - 10, time, 'micro', mine ? C.primaryText : C.muted, { anchor: 'end', opacity: 0.85 });
  if (o.failed) {
    s = `<g opacity="0.7">${s}</g>`;
    s += icon('alert', x - 26, y + h / 2 - 9, 18, C.danger);
    s += t(W - 16, y + h + 18, 'No se envió. Toca para reintentar.', 'captionB', C.danger, { anchor: 'end' });
  }
  return { svg: g(`MessageBubble/${mine ? 'mine' : 'theirs'}${o.failed ? '/failed' : ''}`, s), h: h + (o.failed ? 26 : 0) };
}

function chat(C, state) {
  let s = '';
  let hd = rect(0, 0, W, 108, C.background) + L.navRow(C, { back: true });
  hd += L.avatar(C, 86, 72, 20, 'B', { bg: C.surface2, verified: true });
  hd += t(116, 68, 'Bruno C.', 'bodyB', C.text) + t(116, 88, state === 'readonly' ? 'Paseo terminado' : 'Tu paseador · En curso', 'caption', C.muted);
  hd += rect(0, 107, W, 1, C.border);
  let y = 132;
  if (state === 'empty') {
    s += L.emptyState(C, 320, 'chat', 'Coordina la recogida', 'Escríbele a Bruno si necesitas darle una indicación. El chat se cierra al terminar el paseo.').svg;
    s += chips(C, 24, 520, W - 48, ['Ya bajo', 'Timbre dañado, llámame', '¿Cuánto te falta?']).svg;
  } else {
    s += g('SystemMessage', rect(W / 2 - 100, y, 200, 26, C.surface2, { rx: 13 }) + t(W / 2, y + 18, 'Paseo aceptado · 2:48 p. m.', 'micro', C.muted, { anchor: 'middle' })); y += 44;
    let b = bubble(C, false, y, 'Hola, voy llegando a la portería.', '3:02 p. m.'); s += b.svg; y += b.h + 10;
    b = bubble(C, true, y, '¡Perfecto! Luna ya tiene el arnés puesto.', '3:03 p. m.'); s += b.svg; y += b.h + 16;
    s += g('SystemMessage', rect(W / 2 - 100, y, 200, 26, C.surface2, { rx: 13 }) + t(W / 2, y + 18, 'Paseo iniciado · 3:10 p. m.', 'micro', C.muted, { anchor: 'middle' })); y += 44;
    b = bubble(C, false, y, 'Luna tomó agua en el parque y está feliz.', '3:31 p. m.'); s += b.svg; y += b.h + 10;
    b = bubble(C, true, y, 'Gracias, ¿puedes darle otra vuelta corta?', '3:32 p. m.', { failed: state === 'failed' }); s += b.svg; y += b.h + 10;
  }
  if (state === 'readonly') {
    s += L.actionFooter(C, banner(C, 16, H - 104, W - 32, 'muted', 'El paseo terminó.', 'El chat queda solo para leer.', { icon: 'lock' }).svg, 120);
  } else {
    let comp = rect(0, H - 100, W, 100, C.background) + rect(0, H - 100, W, 1, C.border);
    comp += rect(16, H - 88, W - 84, 48, C.surface, { rx: 24, stroke: C.borderStrong });
    comp += t(36, H - 58, 'Escribe un mensaje', 'body', C.muted);
    comp += L.circle(W - 40, H - 64, 24, C.primary) + icon('send', W - 51, H - 75, 22, C.primaryText);
    s += g('Composer', comp) + L.homeIndicator(C);
  }
  return plain(C, s + hd, { noHome: true });
}

// ---------- Bandeja de avisos (RF-014) ----------
function notifications(C, state, role = 'owner') {
  let s = L.navRow(C, { back: true });
  s += t(24, 140, 'Avisos', 'title', C.text);
  if (state === 'empty') {
    s += L.emptyState(C, 360, 'bell', 'No tienes avisos', 'Te avisaremos cuando acepten, empiecen o terminen tu paseo, y si pasa algo durante el recorrido.').svg;
    return plain(C, s);
  }
  if (state === 'error') {
    s += L.emptyState(C, 360, 'wifiOff', 'No pudimos cargar tus avisos', 'Revisa tu conexión e intenta de nuevo.', { iconColor: C.warningText }).svg;
    s += button(C, 24, 560, W - 48, 'Intentar de nuevo', 'secondary');
    return plain(C, s);
  }
  let y = 176;
  s += section(C, 24, y, 'Hoy'); y += 14;
  const items = [
    { urgent: true, title: 'El paseo salió de la zona acordada', sub: 'Luna · a 1,8 km de la recogida · hace 2 min', unread: true },
    { title: 'Tu paseo empezó', sub: 'Bruno recogió a Luna · 3:10 p. m.', unread: true, icon: 'route' },
    { title: 'Tu paseo fue aceptado', sub: 'Bruno C. va en camino · 2:48 p. m.', icon: 'check' },
  ];
  const yesterday = [
    { title: 'Tu paseo terminó', sub: 'Max · 2,8 km · 58 min · Pagado', icon: 'wallet' },
    { title: 'Tu paseo fue aceptado', sub: 'Max · 7:52 a. m.', icon: 'check' },
  ];
  const draw = (it) => {
    const h = 84;
    let r0 = it.urgent ? rect(16, y, W - 32, h - 8, L.KIND(C).danger.bg, { rx: 14 }) : '';
    r0 += rect(28, y + 14, 40, 40, it.urgent ? C.danger : C.surface2, { rx: 20 }) + icon(it.urgent ? 'alert' : it.icon, 37, y + 23, 22, it.urgent ? C.dangerText : C.primary);
    let ty = y + 26;
    if (it.urgent) { r0 += t(82, y + 22, 'Urgente', 'microB', C.danger, { upper: true }); ty = y + 42; }
    r0 += t(82, ty, it.title, 'bodyB', C.text) + t(82, ty + 20, it.sub, 'caption', C.muted);
    if (it.unread) r0 += circle(W - 32, y + 34, 5, C.primary);
    s += g(`NotificationRow/${it.urgent ? 'urgent' : 'normal'}/${it.unread ? 'unread' : 'read'}`, r0);
    y += h;
  };
  items.forEach(draw);
  y += 12; s += section(C, 24, y, 'Ayer'); y += 14;
  yesterday.forEach(draw);
  s += t(W / 2, y + 30, 'Mostramos los últimos 50 avisos.', 'caption', C.muted, { anchor: 'middle' });
  return plain(C, s);
}

// ---------- Configuración / cuenta (perfil Borrador) ----------
function settings(C, state) {
  if (state === 'delete') return settings(C, 'account') + L.confirmSheet(C, '¿Eliminar tu cuenta?', 'Se borran tus perros, tus métodos de entrada y tu historial de paseos. No podrás deshacerlo.', [{ label: 'Eliminar cuenta', variant: 'danger', state: 'disabled' }, { label: 'Cancelar', variant: 'secondary' }], { top: 392, icon: 'trash', iconKind: 'danger', extra: (y) => field(C, 24, y, W - 48, 'Escribe ELIMINAR para confirmar', '', { placeholder: 'ELIMINAR' }).svg, extraH: 90 });
  if (state === 'account') {
    let s = L.navRow(C, { back: true, title: 'Cuenta y seguridad' });
    let y = 120;
    s += section(C, 24, y, 'Datos de entrada'); y += 10;
    let rw = row(C, 24, y, W - 48, 'Correo', 'valentina@correo.com', { right: 'Cambiar', rightColor: C.primary, rightSt: 'captionB', divider: true }); s += rw.svg; y += rw.h;
    rw = row(C, 24, y, W - 48, 'Contraseña', '••••••••', { right: 'Cambiar', rightColor: C.primary, rightSt: 'captionB', divider: true }); s += rw.svg; y += rw.h + 26;
    s += section(C, 24, y, 'Métodos para entrar'); y += 10;
    rw = row(C, 24, y, W - 48, 'Correo y contraseña', 'Siempre activo', { icon: 'mail', pill: { label: 'Activo', kind: 'success' }, divider: true }); s += rw.svg; y += rw.h;
    rw = row(C, 24, y, W - 48, 'Google', 'Vinculado el 24 oct', { icon: 'user', right: 'Desvincular', rightColor: C.primary, rightSt: 'captionB', divider: true }); s += rw.svg; y += rw.h;
    rw = row(C, 24, y, W - 48, 'Microsoft', 'No vinculado', { icon: 'user', right: 'Vincular', rightColor: C.primary, rightSt: 'captionB', divider: true }); s += rw.svg; y += rw.h + 26;
    s += section(C, 24, y, 'Paseador'); y += 10;
    rw = row(C, 24, y, W - 48, 'No eres paseador', 'Gana dinero paseando perros cerca de ti', { icon: 'shield', chevron: true, divider: true }); s += rw.svg; y += rw.h + 30;
    s += g('DangerZone', icon('trash', 24, y - 2, 22, C.danger) + t(56, y + 15, 'Eliminar mi cuenta', 'bodyB', C.danger));
    return plain(C, s);
  }
  let s = '';
  s += t(24, 100, 'Configuración', 'title', C.text);
  let y = 124;
  s += g('ProfileCard', card(C, 24, y, W - 48, 84) + L.avatar(C, 68, y + 42, 24, 'V', { bg: C.surface2 }) + t(104, y + 38, 'Valentina Ruiz', 'bodyB', C.text) + t(104, y + 58, 'valentina@correo.com', 'caption', C.muted) + icon('chevronR', W - 64, y + 31, 22, C.muted));
  y += 112;
  s += section(C, 24, y, 'Tu cuenta'); y += 8;
  let rw = row(C, 24, y, W - 48, 'Información personal', 'Nombre y celular', { icon: 'user', chevron: true, divider: true }); s += rw.svg; y += rw.h;
  rw = row(C, 24, y, W - 48, 'Cuenta y seguridad', 'Correo, contraseña, Google y Microsoft', { icon: 'lock', chevron: true, divider: true }); s += rw.svg; y += rw.h + 22;
  s += section(C, 24, y, 'Preferencias'); y += 8;
  rw = row(C, 24, y, W - 48, 'Tema', '', { icon: C.name === 'light' ? 'sun' : 'moon', divider: true, h: 60 }); s += rw.svg;
  s += g('ThemeToggle', rect(W - 184, y + 10, 160, 40, C.surface2, { rx: 20 }) + rect(W - 180, y + 14, 76, 32, C.name === 'light' ? C.surface : 'transparent', { rx: 16 }) + t(W - 142, y + 35, 'Claro', 'captionB', C.text, { anchor: 'middle' }) + rect(W - 102, y + 14, 74, 32, C.name === 'dark' ? C.surface : 'transparent', { rx: 16 }) + t(W - 65, y + 35, 'Oscuro', 'captionB', C.text, { anchor: 'middle' }));
  y += rw.h;
  rw = row(C, 24, y, W - 48, 'Notificaciones', 'Avisos del recorrido', { icon: 'bell', chevron: true, divider: true }); s += rw.svg; y += rw.h + 22;
  s += section(C, 24, y, 'Ayuda'); y += 8;
  rw = row(C, 24, y, W - 48, 'Centro de ayuda', '', { icon: 'help', chevron: true, divider: true }); s += rw.svg; y += rw.h;
  rw = row(C, 24, y, W - 48, 'Términos y privacidad', '', { icon: 'doc', chevron: true }); s += rw.svg; y += rw.h + 10;
  s += button(C, 24, Math.min(y, 686), W - 48, 'Cerrar sesión', 'secondary', { icon: 'logout' });
  s += L.tabBar(C, 'owner', 'Configuración');
  return plain(C, s, { noHome: true });
}

// ---------- Emergencia (RF-012) ----------
function emergency(C, state) {
  const v = view(M.PTS.walker[0], M.PTS.walker[1] + 80, 0.72, 195, 300);
  const overlays = (vv) => {
    let o = M.route(C, vv, M.PTS.walked, 'walked');
    const [hx, hy] = M.P(vv, ...M.PTS.pickup);
    o += M.pinHome(C, hx, hy);
    const [wx, wy] = M.P(vv, ...M.PTS.walker);
    if (state === 'confirm') o += M.walkerLive(C, wx, wy, { heading: 20 });
    else o += M.alertMarker(C, wx, wy) + M.walkerLive(C, wx + 46, wy + 20, { heading: 20, pulse: false });
    return o;
  };
  if (state === 'confirm') {
    const extra = (y) => {
      let e = t(24, y + 2, '¿Qué pasa?', 'captionM', C.muted);
      e += chips(C, 24, y + 12, W - 48, [{ label: 'Se soltó', selected: true }, 'Se lastimó', 'Otro']).svg;
      e += field(C, 24, y + 70, W - 48, '', 'Luna se soltó cerca del parque', { state: 'filled' }).svg;
      return e;
    };
    return mapScreen(C, { view: v, overlays, sheetTop: 844, topBar: M ? '' : '', extra: L.confirmSheet(C, '¿Es una emergencia?', 'Avisaremos de inmediato a Valentina con tu ubicación actual.', [{ label: 'Sí, es una emergencia', variant: 'danger' }, { label: 'No, volver', variant: 'secondary' }], { top: 300, icon: 'alert', iconKind: 'danger', extra, extraH: 150 }), noHome: true });
  }
  const sent = state === 'sent';
  const top = 560;
  const bnr = banner(C, 16, 112, W - 32, 'danger', sent ? 'Reportaste una emergencia · 3:42 p. m.' : 'Bruno reportó una emergencia', sent ? 'Luna se soltó cerca del parque. Avisamos a Valentina.' : 'Luna se soltó cerca del parque · hace 1 min', { solid: true, shadow: true });
  const content = (tp) => {
    let c = t(24, tp + 48, sent ? 'Mantén la calma' : 'Bruno necesita ayuda', 'title', C.text);
    c += para(24, tp + 76, sent ? 'Tu ubicación quedó registrada. Si alguien corre peligro, llama al 123.' : 'Su última ubicación está en el mapa. Si alguien corre peligro, llama al 123.', 'body', C.muted, W - 48).svg;
    c += button(C, 24, tp + 140, W - 48, sent ? 'Escribir a Valentina' : 'Escribir a Bruno', 'primary', { icon: 'chat' });
    c += button(C, 24, tp + 204, W - 48, 'Llamar al 123', 'dangerOutline', { icon: 'phone' });
    return c;
  };
  return mapScreen(C, { view: v, overlays, sheetTop: top, content, topBar: L ? require('./lib').topBarFloating(C, 'Paseo en curso') : '', banner: bnr.svg, fabs: (tp) => L.fab(C, W - 64, tp - 104, 'locate', { color: C.primary }) });
}

module.exports = [
  { file: 'comun-onboarding-bienvenida', title: 'Bienvenida (UX-001)', frames: [['Claro', 'light', welcome], ['Oscuro', 'dark', welcome]] },
  { file: 'comun-auth-login', title: 'Iniciar sesión (RF-005 + login social)', frames: [['Por defecto', 'light', (C) => login(C, 'default')], ['Credenciales incorrectas', 'light', (C) => login(C, 'error')], ['Demasiados intentos', 'light', (C) => login(C, 'locked')], ['Cuenta sin confirmar', 'light', (C) => login(C, 'unconfirmed')], ['Error de Google o Microsoft', 'light', (C) => login(C, 'social')], ['Sesión expirada', 'light', (C) => login(C, 'expired')], ['Entrando', 'dark', (C) => login(C, 'loading')]] },
  { file: 'comun-auth-registro', title: 'Crear cuenta (RF-001)', frames: [['Escribiendo (reglas en vivo)', 'light', (C) => register(C, 'typing')], ['Correo ya registrado', 'light', (C) => register(C, 'taken')], ['Enviando', 'light', (C) => register(C, 'sending')]] },
  { file: 'comun-auth-confirmar-correo', title: 'Confirmar correo (RF-001)', frames: [['Enlace enviado', 'light', (C) => confirmEmail(C, 'sent')], ['Confirmada', 'light', (C) => confirmEmail(C, 'ok')], ['Enlace vencido', 'light', (C) => confirmEmail(C, 'expired')], ['Enlace inválido o usado', 'light', (C) => confirmEmail(C, 'invalid')]] },
  { file: 'comun-cotizar-tarifa', title: 'Cotizador público (RF-019)', frames: [['Con precio', 'light', (C) => quote(C, 'default')], ['Cargando', 'light', (C) => quote(C, 'loading')], ['Error', 'light', (C) => quote(C, 'error')]] },
  { file: 'comun-paseo-chat', title: 'Chat del paseo (RF-013)', frames: [['Conversación activa', 'light', (C) => chat(C, 'active')], ['Sin mensajes', 'light', (C) => chat(C, 'empty')], ['Mensaje no enviado', 'light', (C) => chat(C, 'failed')], ['Solo lectura', 'light', (C) => chat(C, 'readonly')], ['Oscuro', 'dark', (C) => chat(C, 'active')]] },
  { file: 'comun-avisos-bandeja', title: 'Bandeja de avisos (RF-014)', frames: [['Con urgentes', 'light', (C) => notifications(C, 'list')], ['Vacía', 'light', (C) => notifications(C, 'empty')], ['Error', 'light', (C) => notifications(C, 'error')], ['Oscuro', 'dark', (C) => notifications(C, 'list')]] },
  { file: 'comun-configuracion-cuenta', title: 'Configuración y cuenta (RF-001/RF-005 perfil, Borrador)', frames: [['Configuración (dueño)', 'light', (C) => settings(C, 'home')], ['Cuenta y seguridad', 'light', (C) => settings(C, 'account')], ['Eliminar cuenta', 'light', (C) => settings(C, 'delete')], ['Configuración oscuro', 'dark', (C) => settings(C, 'home')]] },
  { file: 'comun-paseo-emergencia', title: 'Emergencia (RF-012)', frames: [['Confirmar (paseador)', 'light', (C) => emergency(C, 'confirm')], ['Enviada (paseador)', 'light', (C) => emergency(C, 'sent')], ['Recibida (dueño)', 'light', (C) => emergency(C, 'received')], ['Recibida oscuro', 'dark', (C) => emergency(C, 'received')]] },
];
