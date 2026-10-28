// Genera presentaciones/comercial/index.html a partir de los datos de las láminas de este archivo y de los marcos
// de presentaciones/comercial/assets/pantallas/*.svg. Uso: node construir-comercial.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const destino = path.resolve(aqui, '../comercial');
const pantallasDir = path.join(destino, 'assets/pantallas');

const ICONOS = {
  escudo: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  ruta: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 000-6h-4a3 3 0 010-6h6"/>',
  tarjeta: '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10.5h18M7 15h4"/>',
  pin: '<path d="M12 21s-6-5.3-6-10a6 6 0 1112 0c0 4.7-6 10-6 10z"/><circle cx="12" cy="11" r="2"/>',
  pata: '<circle cx="12" cy="15.5" r="3.6"/><circle cx="6" cy="10" r="1.8"/><circle cx="9.5" cy="6" r="1.8"/><circle cx="14.5" cy="6" r="1.8"/><circle cx="18" cy="10" r="1.8"/>',
  campana: '<path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 004 0"/>',
  alerta: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
  chat: '<path d="M5 5h14a2 2 0 012 2v8a2 2 0 01-2 2H10l-5 4v-4a2 2 0 01-2-2V7a2 2 0 012-2z"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  telefono: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>',
  lista: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  candado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  tacto: '<path d="M9 11V5a2 2 0 014 0v6"/><path d="M13 9a2 2 0 014 0v4a6 6 0 01-6 6h-1a5 5 0 01-4-2l-3-4a1.6 1.6 0 012.4-2L9 14"/>',
  moneda: '<circle cx="12" cy="12" r="9"/><path d="M14.5 9.2A3 3 0 0012 8c-1.7 0-3 .9-3 2.2 0 3 6 1.4 6 4.3 0 1.2-1.3 2-3 2a3.4 3.4 0 01-2.8-1.3M12 6v2m0 8v2"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  mapa: '<path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
  calendario: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
};
const ico = (n) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONOS[n]}</svg>`;

const punto = (p, paso) =>
  `<li class="punto"${paso > 0 ? ` data-paso="${paso}"` : ''}><span class="medallon">${ico(p.i)}</span><div><h3>${p.t}</h3><p>${p.d}</p></div></li>`;

const pie = (seccion) =>
  `<div class="marca-pie"><span class="medalla" style="width:52px;height:52px"><img src="assets/brand/logo-head.png" alt=""></span><span>Waggo</span><span class="sec">${seccion}</span></div>`;

const notas = (arr) => `<aside class="notas">${arr.map((n) => `<p>${n}</p>`).join('')}</aside>`;

/** Lámina con teléfono: texto a la izquierda, puntos a la derecha. */
function laminaTel(l) {
  const desde = l.desdeUno ? 1 : 0;
  const items = l.puntos.map((p, j) => punto(p, j + desde)).join('');
  return `
<section class="lamina" data-titulo="${l.corto}" data-pasos="${Math.max(l.puntos.length - 1 + desde, 0)}">
  <div class="contenido-lamina">
    <div class="col-izq">
      ${l.rol ? `<span class="pastilla primaria etiqueta-rol">${ico('pata')} ${l.rol}</span>` : `<span class="eyebrow">${l.eyebrow}</span>`}
      <h2 class="titulo">${l.titulo}</h2>
      <p class="texto">${l.texto}</p>
      ${l.chip ? `<span class="chip-estado" data-estado="${l.chip}" role="status"><span class="punto-estado" aria-hidden="true"></span><span class="texto-estado">${l.chip}</span></span>` : ''}
    </div>
    <ul class="col-der">${items}</ul>
    ${l.nota ? `<p class="nota-pie">${l.nota}</p>` : ''}
    ${pie(l.seccion)}
  </div>
  <p class="motor-solo-lector">Pantalla de la app en el teléfono: ${l.pantalla}</p>
  ${notas(l.notas)}
</section>`;
}

const LAMINAS = [];

// 1. Portada
LAMINAS.push(`
<section class="lamina portada" data-titulo="Waggo, paseos seguros">
  <div class="contenido-lamina">
    <div class="manchas" aria-hidden="true"></div>
    <img class="logo-grande" src="assets/brand/logo-full.png" alt="Waggo: un corgi sonriente con el nombre Waggo">
    <div class="bloque">
      <span class="eyebrow">Para dueños de perros y paseadores</span>
      <h1 class="titulo-grande">Paseos <em>seguros</em> para tu perro</h1>
      <p class="texto-grande suave" style="max-width:860px">Pide un paseo como pides un viaje: ves al paseador en el mapa y pagas al final.</p>
      <div class="fila separar"><span class="pastilla primaria">${ico('escudo')} Paseadores verificados</span><span class="pastilla">${ico('ruta')} En vivo</span></div>
    </div>
  </div>
  ${notas([
    'Abrir con calma: esta presentación se recorre como la app. Cada paso del teléfono reproduce lo que se hace en la aplicación real.',
    'Mensaje central, tomado de la pantalla de bienvenida de la app: "Paseos seguros para tu perro. Pide un paseo como pides un viaje: ves al paseador en el mapa y pagas al final."',
    'Recorrido: el problema, cómo se pide un paseo, el paseo en vivo, seguridad, pago y la mitad de los paseadores. Termina con el enlace para probar la app.',
  ])}
</section>`);

// 2. Problema
LAMINAS.push(`
<section class="lamina oscuro" data-titulo="El problema" data-pasos="3">
  <div class="contenido-lamina">
    <div class="col-izq" style="left:110px;width:1500px;top:110px;bottom:auto;gap:18px">
      <span class="eyebrow">El problema</span>
      <h2 class="titulo" style="font-size:84px;max-width:1500px">Dejar a tu perro con un desconocido da miedo</h2>
    </div>
    <div class="pregunta-grid">
      <div class="pregunta" data-paso="1"><span class="q">¿Quién es?</span><span class="a">${ico('escudo')}<span><b>Paseadores verificados.</b> Un administrador revisa su documento antes del primer paseo.</span></span></div>
      <div class="pregunta" data-paso="2"><span class="q">¿Dónde está ahora?</span><span class="a">${ico('ruta')}<span><b>Paseo en vivo.</b> Sigues la ruta en el mapa, minuto a minuto.</span></span></div>
      <div class="pregunta" data-paso="3"><span class="q">¿Y si pasa algo?</span><span class="a">${ico('alerta')}<span><b>Emergencia con un toque</b> y alertas automáticas durante el paseo.</span></span></div>
    </div>
    ${pie('El problema')}
  </div>
  ${notas([
    'Tres preocupaciones de cualquier dueño: quién es la persona, dónde está mi perro, qué pasa si algo sale mal. No usamos cifras de mercado en esta presentación: es para personas, no para inversionistas.',
    'Cada pregunta se responde con algo que la app ya hace hoy; las siguientes láminas lo muestran en pantalla.',
  ])}
</section>`);

// 3-15: con teléfono
const TEL = [
  {
    corto: 'Bienvenida', seccion: 'Dueños', eyebrow: 'Así empieza', titulo: 'Paseos seguros para tu perro',
    texto: 'Pide un paseo como pides un viaje: ves al paseador en el mapa y pagas al final.',
    desdeUno: true,
    puntos: [
      { i: 'escudo', t: 'Paseadores verificados', d: 'Revisamos su identidad antes de su primer paseo.' },
      { i: 'ruta', t: 'Paseo en vivo', d: 'Sigue la ruta en el mapa, minuto a minuto.' },
      { i: 'tarjeta', t: 'Pagas al final', d: 'Retenemos el pago y solo se cobra si el paseo ocurre.' },
    ],
    pantalla: 'pantalla de bienvenida con los botones Pedir un paseo y Quiero ser paseador.',
    notas: [
      'El teléfono entra desde abajo: a partir de aquí lo que se ve son pantallas reales del diseño de la app (Seashell & Sapphire).',
      'Los tres pilares son los textos de la bienvenida de la app: paseadores verificados, paseo en vivo, pagas al final.',
      'Dos caminos desde el primer toque: "Pedir un paseo" (dueños) y "Quiero ser paseador".',
    ],
  },
  {
    corto: 'Tu perro', seccion: 'Dueños', eyebrow: 'Primero, tu perro', titulo: 'Cuéntanos de tu perro',
    texto: 'Lo registras una vez y lo eliges en segundos cada vez que pidas un paseo.',
    puntos: [
      { i: 'pata', t: 'Un perfil por perro', d: 'Nombre, tamaño, raza y fecha de nacimiento.' },
      { i: 'candado', t: 'Notas médicas cifradas', d: 'Alergias o cuidados para el paseador; se guardan cifradas.' },
      { i: 'lista', t: 'Hasta 10 perros', d: 'Los ves en “Mis perros” y eliges con quién sale cada paseo.' },
    ],
    pantalla: 'inicio sin perros, formulario para agregar un perro y lista Mis perros.',
    notas: [
      'Se ve el recorrido real: Inicio → Agregar mi perro → formulario → Guardar perro → Mis perros. El botón se presiona y la pantalla se desliza como en la app.',
      'Dato verificable: el límite de 10 perros por dueño está en la spec RF-004 (ejemplo 13). Las notas médicas se guardan cifradas (RNF-003).',
      'Los nombres y datos de las pantallas (Luna, Max) son datos de ejemplo del diseño.',
    ],
  },
  {
    corto: 'Pedir un paseo', seccion: 'Dueños', eyebrow: 'Pedir un paseo', titulo: 'Pide un paseo en tres pasos',
    texto: 'Dónde, quién y cuánto. Confirmas y buscamos un paseador cerca de ti.',
    puntos: [
      { i: 'pin', t: '1 · ¿Dónde?', d: 'Mueve el pin al punto de recogida o busca una dirección.' },
      { i: 'calendario', t: '2 · ¿Quién y cuánto?', d: 'Tus perros, tipo de paseo, duración y hora. El precio se ve al instante.' },
      { i: 'tarjeta', t: '3 · Confirma y paga', d: 'Retenemos el pago; solo se cobra si el paseo ocurre. Cancelar es gratis antes de empezar.' },
      { i: 'campana', t: 'Listo', d: 'Buscamos un paseador cerca de ti y te avisamos apenas alguien acepte.' },
    ],
    pantalla: 'pedir paseo: mapa con el punto de recogida, perros y duración con precio, y confirmación con el pago.',
    nota: 'Precios de ejemplo: las tarifas del piloto están por confirmar.',
    notas: [
      'Los tres pasos son los de la pantalla de pedir paseo: ¿Dónde? (mapa de OpenStreetMap), ¿Quién y cuánto? (con precio en vivo) y Confirma tu paseo.',
      'Cada toque presiona el botón real: "Confirmar recogida", "Continuar", "Pedir paseo".',
      'El precio de ejemplo ($ 23.000 COP por 60 minutos individuales) sale del diseño; las tarifas de la spec RF-019 son provisionales hasta confirmarlas con el piloto.',
      'El pago se retiene al pedir y se cobra al terminar (spec RF-015 a RF-018). En esta versión la pasarela de pago es simulada.',
    ],
  },
  {
    corto: 'Paseador verificado', seccion: 'Dueños', eyebrow: 'Alguien acepta', titulo: 'Un paseador verificado va por tu perro',
    texto: 'Ves quién es, que va camino a la recogida y todo el detalle del paseo.',
    puntos: [
      { i: 'reloj', t: 'Buscando un paseador cerca', d: 'La solicitud llega a los paseadores aprobados que están cerca.' },
      { i: 'escudo', t: 'Paseador verificado', d: 'Un administrador revisó su documento antes de su primer paseo.' },
      { i: 'lista', t: 'Todo a la vista', d: 'Dirección, hora, indicaciones y pago retenido. Cancelar es gratis hasta que el paseo empiece.' },
    ],
    pantalla: 'buscando paseador, paseador en camino y la hoja de detalles que sube.',
    notas: [
      'La hoja inferior sube desde el borde, igual que en la app, y muestra los detalles del paseo.',
      'Verificación honesta: hoy la hace un administrador a mano (spec RF-002/RF-003). El documento del paseador se guarda cifrado. La verificación biométrica y de antecedentes depende de elegir un proveedor y no está implementada.',
      'El emparejamiento por cercanía usa PostgreSQL + PostGIS (RF-006): solo ven la solicitud los paseadores aprobados y cercanos.',
    ],
  },
  {
    corto: 'Paseo en vivo', seccion: 'Dueños', eyebrow: 'Durante el paseo', titulo: 'Míralo pasear, en vivo',
    texto: 'La ruta se dibuja en el mapa mientras el paseo avanza.',
    puntos: [
      { i: 'ruta', t: 'Ruta en el mapa', d: 'El marcador del paseador recorre el camino y la ruta queda trazada.' },
      { i: 'reloj', t: 'Distancia y tiempo', d: 'Cuánto han caminado y cuánto llevan, al abrir los detalles.' },
      { i: 'chat', t: 'Mensajes y detalles', d: 'A un toque del mapa, sin salir de la pantalla del paseo.' },
    ],
    pantalla: 'mapa con la ruta y el marcador del paseador en movimiento, hoja inferior con distancia y tiempo.',
    nota: 'Ruta y datos de ejemplo.',
    notas: [
      'Mirar el marcador: se mueve por la ruta y la línea se va dibujando. En la app el paseador envía su posición cada unos 15 segundos y la pantalla del dueño se actualiza sola (spec RF-008).',
      'Después se sube la hoja inferior con la distancia y el tiempo del paseo (RF-011).',
      'El mapa es OpenStreetMap con la atribución "© OpenStreetMap contributors" siempre visible.',
    ],
  },
  {
    corto: 'Alertas', seccion: 'Seguridad', eyebrow: 'Seguridad', titulo: 'Si algo se sale de lo normal, lo sabes',
    texto: 'Waggo vigila el paseo y te avisa en la pantalla del paseo y en tu bandeja de avisos.',
    puntos: [
      { i: 'mapa', t: 'Salió de la zona acordada', d: 'Si el paseo se aleja más de lo acordado desde la recogida.' },
      { i: 'reloj', t: 'Lleva rato detenido', d: 'Si el paseador se queda en el mismo lugar varios minutos.' },
      { i: 'campana', t: 'Bandeja de avisos', d: 'Las urgentes primero. También: paseo aceptado, iniciado y terminado.' },
    ],
    pantalla: 'alerta roja en el mapa por salir de la zona y bandeja de avisos con urgentes.',
    nota: 'Los avisos se ven dentro de la app; las notificaciones push llegan después.',
    notas: [
      'Alertas automáticas (specs RF-009 y RF-010): geocerca de 1,5 km desde la recogida y detención de 10 minutos. Ambos umbrales están marcados como provisionales en la spec.',
      'La bandeja de avisos (RF-014) funciona dentro de la app y se actualiza cada 15 s. Las notificaciones push al teléfono todavía no existen: no las prometemos.',
      'Se toca la campana arriba a la derecha y la bandeja entra deslizándose.',
    ],
  },
  {
    corto: 'Emergencia', seccion: 'Seguridad', eyebrow: 'Seguridad', titulo: 'Emergencia con un toque',
    texto: 'Dueño o paseador pueden levantarla durante el paseo. Aquí, desde la pantalla del paseador.',
    puntos: [
      { i: 'tacto', t: 'Un toque y confirmas', d: 'Eliges qué pasa (se soltó, se lastimó, otro) y, si quieres, escribes un mensaje.' },
      { i: 'pin', t: 'Queda registrada', d: 'Con quién la levantó, la hora y tu ubicación.' },
      { i: 'telefono', t: 'Llamar al 123', d: 'Desde la misma hoja puedes llamar o escribirle a la otra persona.' },
    ],
    pantalla: 'mapa del paseo, hoja “¿Es una emergencia?” que sube y hoja “Mantén la calma” con Llamar al 123.',
    nota: 'La otra persona la ve de inmediato en la pantalla del paseo.',
    notas: [
      'La hoja sube con un velo sobre el mapa. Primero se confirma (“Sí, es una emergencia”); luego la misma hoja cambia a “Mantén la calma” con “Llamar al 123”.',
      'Spec RF-012: queda registrada con quién la levantó, mensaje y ubicación, y ambos la ven. Todavía no hay notificación push ni un contacto de emergencia: son preguntas abiertas para el PO.',
    ],
  },
  {
    corto: 'Chat del paseo', seccion: 'Seguridad', eyebrow: 'Coordinar', titulo: 'Hablen sin salir de la app',
    texto: 'Un chat entre el dueño y el paseador, solo para ese paseo.',
    puntos: [
      { i: 'chat', t: 'Mientras el paseo está en marcha', d: 'Desde que se acepta hasta que termina.' },
      { i: 'candado', t: 'Solo ustedes dos', d: 'Nadie más lee ni escribe en el chat del paseo.' },
      { i: 'lista', t: 'Al terminar, solo lectura', d: 'La conversación queda para consultarla, no para escribir.' },
    ],
    pantalla: 'conversación del paseo con mensajes del paseador y del dueño.',
    notas: [
      'Spec RF-013: el chat funciona con el paseo aceptado o en curso; al terminar o cancelar queda de solo lectura. Solo texto, hasta 1.000 caracteres; la app consulta cada 3 s.',
      'No se comparte el teléfono: los mensajes viajan dentro de la app.',
    ],
  },
  {
    corto: 'Termina y se cobra', seccion: 'Dueños', eyebrow: 'Al final', titulo: 'Termina el paseo y recién ahí se cobra',
    texto: 'El paseador devuelve a tu perro y marca el paseo como terminado.',
    chip: 'En curso',
    puntos: [
      { i: 'check', t: 'Resumen del paseo', d: 'Distancia, duración y hora de entrega.' },
      { i: 'tarjeta', t: 'Pago al final', d: 'Se cobra al terminar. Si cancelas antes de empezar, liberamos el dinero retenido.' },
      { i: 'pata', t: 'Pedir otro paseo', d: 'Un toque y vuelves a empezar.' },
    ],
    pantalla: 'el paseo en vivo pasa a Terminado con el resumen: distancia, duración y pago.',
    nota: 'Versión de prueba: el cobro es simulado hasta conectar la pasarela de pagos. No guardamos datos de tarjeta.',
    notas: [
      'El estado cambia de “En curso” a “Terminado” y el mapa muestra la ruta completa.',
      'Pagos (RF-015 a RF-018): se retiene al pedir, se cobra al terminar y se libera si se cancela. La pasarela está simulada mientras el PO elige proveedor (Stripe o MercadoPago); no se guarda ningún dato de tarjeta.',
      'Quitamos de la pantalla la calificación al paseador porque todavía no existe en la app.',
    ],
  },
  {
    corto: 'Precio claro', seccion: 'Dueños y paseadores', eyebrow: 'Transparencia', titulo: 'Precio claro, sin sorpresas',
    texto: 'Ves cuánto pagas, cuánto recibe el paseador y cuánto es la comisión de Waggo.',
    puntos: [
      { i: 'moneda', t: 'Cotizador público', d: 'Eliges tipo y duración, y ves el total sin registrarte.' },
      { i: 'lista', t: 'Desglose claro', d: 'Cuánto es para el paseador y cuánto es la comisión de Waggo.' },
      { i: 'candado', t: 'El precio no cambia', d: 'El valor que ves al pedir queda congelado para ese paseo.' },
    ],
    pantalla: 'cotizador con el total, el pago al paseador y la comisión de Waggo.',
    nota: 'Valores de ejemplo: tarifas y comisión del piloto por confirmar.',
    notas: [
      'Spec RF-019: tarifa individual $8.000 base + $250/min; grupal $5.000 base + $150/min; comisión 20 %, redondeo a $100. TODOS provisionales hasta validarlos en el piloto: por eso aquí se llaman "de ejemplo".',
      'El valor se congela al pedir el paseo (RF-007).',
    ],
  },
  {
    corto: 'Hazte paseador', rol: 'Para paseadores', seccion: 'Paseadores', titulo: '¿Paseas perros? Hazte paseador',
    texto: 'Completa tus datos. Un administrador los revisa antes de tu primer paseo.',
    puntos: [
      { i: 'usuario', t: 'Regístrate con tu documento', d: 'Se guarda cifrado; solo verás los últimos 4 dígitos.' },
      { i: 'reloj', t: 'Revisión del administrador', d: 'Te avisamos en la app apenas terminemos.' },
      { i: 'escudo', t: '¡Ya eres paseador verificado!', d: 'Desde ahora ves las solicitudes cerca de ti y puedes aceptarlas.' },
    ],
    pantalla: 'formulario Hazte paseador, estado Estamos verificando tu perfil y aprobación.',
    notas: [
      'Spec RF-002/RF-003: el paseador envía nombre, documento (cifrado), celular y experiencia; un administrador lo aprueba o rechaza con motivo. Solo un paseador aprobado ve solicitudes.',
      'La verificación automática (biometría y antecedentes) no está implementada: hoy es revisión manual.',
    ],
  },
  {
    corto: 'Solicitudes cerca', rol: 'Para paseadores', seccion: 'Paseadores', titulo: 'Elige tus paseos en el mapa',
    texto: 'Ves las solicitudes cerca de ti con lo que ganas. El primero que acepta se queda con el paseo.',
    puntos: [
      { i: 'mapa', t: 'Mapa y lista', d: 'Solicitudes cercanas con el precio que ganas por cada una.' },
      { i: 'tacto', t: 'Acepta con un toque', d: 'Ves la dirección, las indicaciones y el camino a la recogida.' },
      { i: 'pata', t: 'Inicia al recoger', d: 'Cuando tienes a los perros contigo, inicias el paseo.' },
    ],
    pantalla: 'mapa y lista de solicitudes cerca, paseo aceptado camino a la recogida y paseo en curso.',
    notas: [
      'Spec RF-007 (paseador) y RF-006: la búsqueda de solicitudes cercanas la hace PostgreSQL con PostGIS (índice GiST). Si otro paseador acepta primero, la app lo avisa.',
      'Quitamos de la pantalla el cálculo de tiempo estimado de llegada porque aún no existe en la app.',
    ],
  },
  {
    corto: 'Pasea y cobra', rol: 'Para paseadores', seccion: 'Paseadores', titulo: 'Pasea, termina y cobra',
    texto: 'Tu ubicación se comparte solo durante el paseo.',
    chip: 'En curso',
    puntos: [
      { i: 'ruta', t: 'Compartes tu ruta', d: 'El dueño te sigue en el mapa mientras caminas.' },
      { i: 'tacto', t: 'Terminas con confirmación', d: '“¿Terminar el paseo?” evita toques por error.' },
      { i: 'moneda', t: 'Ves lo que ganaste', d: 'Al terminar, el pago de ese paseo queda registrado.' },
      { i: 'lista', t: 'Tus ganancias', d: 'El total y cada paseo cobrado, el más reciente primero.' },
    ],
    pantalla: 'paseo en curso con el marcador en movimiento, hoja para terminar el paseo, paseo terminado y ganancias.',
    nota: 'Cobro simulado en esta versión; la cuenta donde recibes el dinero se define con la pasarela de pagos.',
    notas: [
      'El estado pasa de “En curso” a “Terminado” al confirmar. Spec RF-015 a RF-018: la comisión de Waggo (20 %, provisional) se descuenta y el resto es el pago al paseador.',
      'Quitamos de la pantalla de ganancias el aviso sobre registrar la cuenta bancaria porque aún no está en la app; es una pregunta abierta para el PO.',
    ],
  },
];

const NUMEROS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
TEL.forEach((l) => LAMINAS.push(laminaTel(l)));

// 16. Tranquilidad
const TRANQ = [
  { i: 'escudo', t: 'Paseadores verificados', d: 'Revisión manual del documento por un administrador antes del primer paseo.' },
  { i: 'ruta', t: 'Paseo en vivo', d: 'Ruta en el mapa, distancia y tiempo mientras el paseo avanza.' },
  { i: 'mapa', t: 'Alertas automáticas', d: 'Aviso si el paseo sale de la zona acordada o se detiene demasiado.' },
  { i: 'alerta', t: 'Emergencia con un toque', d: 'Queda registrada con tu ubicación y puedes llamar al 123.' },
  { i: 'chat', t: 'Chat del paseo', d: 'Dueño y paseador se escriben dentro de la app mientras dura el paseo.' },
  { i: 'tarjeta', t: 'Pago al final', d: 'Se retiene al pedir y se cobra al terminar; sin efectivo y sin guardar tarjetas.' },
];
LAMINAS.push(`
<section class="lamina" data-titulo="Lo que ya funciona" data-pasos="1">
  <div class="contenido-lamina">
    <div class="col-izq" style="left:110px;width:1500px;top:90px;bottom:auto;gap:18px">
      <span class="eyebrow">Tranquilidad</span>
      <h2 class="titulo" style="font-size:78px">Lo que ya funciona hoy</h2>
    </div>
    <ul class="rejilla-6" style="list-style:none;margin:0;padding:0">
      ${TRANQ.map((p, j) => `<li class="punto" data-paso="1" style="transition-delay:${j * 0.09}s"><span class="medallon">${ico(p.i)}</span><div><h3>${p.t}</h3><p>${p.d}</p></div></li>`).join('')}
    </ul>
    <p class="nota-pie" style="max-width:900px">Cobro simulado y notificaciones push: pendientes. Calificaciones: aún no existen.</p>
    ${pie('Resumen')}
  </div>
  ${notas([
    'Resumen: seis cosas que existen hoy en la app (todas con spec en estado Implementada). El teléfono se va para dejar espacio.',
    'Lo que no se promete: notificaciones push, inicio de sesión con Google o Microsoft (la spec está en estado Lista, aún no implementada en la app), calificaciones y cobro real con tarjeta (la pasarela está simulada).',
  ])}
</section>`);

// 17. Capturas reales
const realFoto = (archivo, mapa, alt) => `<figure class="real"><div class="real-marco"><img src="assets/real/${archivo}" alt="${alt}"><img class="difuminada" src="assets/real/${archivo}" alt="" aria-hidden="true" style="clip-path:inset(${mapa})"></div></figure>`;
LAMINAS.push(`
<section class="lamina" data-titulo="En un celular real" data-pasos="1">
  <div class="contenido-lamina">
    <div class="col-izq" style="width:560px">
      <span class="eyebrow">Capturas reales</span>
      <h2 class="titulo" style="font-size:64px">Ya funciona en un celular real</h2>
      <p class="texto">Versión actual de la app en un Samsung Galaxy A35: el inicio con el paseo en camino y la pantalla del paseo.</p>
      <ul class="lista-real"><li>Paseador verificado</li><li>Botón de emergencia siempre a mano</li><li>Cancelar el paseo desde la misma pantalla</li></ul>
    </div>
    <div class="reales" data-paso="1">
      ${realFoto('01-inicio.png', '20.35% 10.3% 65.15% 10.7% round 14px', 'Inicio de la app con la tarjeta Paseador en camino; el mapa está difuminado')}
      ${realFoto('04-ver-paseo.png', '14% 6.3% 52.4% 6.3% round 14px', 'Pantalla del paseo: Tu paseador va en camino, Paseador verificado y botones Emergencia y Cancelar paseo; el mapa está difuminado')}
    </div>
    <p class="nota-pie" style="left:110px;right:auto;text-align:left;bottom:150px;max-width:560px">Mapas difuminados para proteger la ubicación real de quien probó la app.</p>
    ${pie('Producto')}
  </div>
  ${notas([
    'Capturas reales de la versión final de la app en un Samsung Galaxy A35 (la barra de estado se borró). Las tomó el equipo; archivos en presentaciones/_capturas/.',
    'El mapa muestra la zona de recogida real de quien probó la app (Bogotá): por eso se difumina en la presentación. No usar las capturas sin difuminar en material público.',
    'Aquí se ve que la app real tiene un botón "Emergencia" propio y la insignia "Paseador verificado". Algunas pantallas del teléfono animado son el diseño aprobado y pueden diferir en detalles de texto.',
  ])}
</section>`);

// 18. Llamada a la acción
LAMINAS.push(`
<section class="lamina zafiro cta" data-titulo="Pruébala hoy">
  <div class="contenido-lamina">
    <div class="col-izq">
      <span class="medalla" style="width:132px;height:132px"><img src="assets/brand/logo-head.png" alt="Waggo"></span>
      <h2 class="titulo" style="font-size:84px">Pruébala hoy</h2>
      <p class="texto" style="color:#e6eefb">Entra desde el navegador, crea tu cuenta y pide tu primer paseo, o hazte paseador.</p>
      <a class="enlace" href="https://app.mywaggo.com" style="align-self:flex-start">app.mywaggo.com</a>
    </div>
    <ul class="col-der">
      <li class="punto"><span class="medallon">${ico('pata')}</span><div><h3>Si tienes perro</h3><p>Toca “Pedir un paseo”.</p></div></li>
      <li class="punto"><span class="medallon">${ico('escudo')}</span><div><h3>Si paseas perros</h3><p>Toca “Quiero ser paseador”.</p></div></li>
    </ul>
    <p class="nota-pie" style="color:#e6eefb;left:110px;right:auto;text-align:left;bottom:60px;max-width:560px">Disponible hoy en la web. Apps para iOS y Android: fecha por confirmar. Pantallas y datos de ejemplo.</p>
  </div>
  ${notas([
    'Enlace verificado: https://app.mywaggo.com responde 200 (comprobado el 2026-10-28). Es el único enlace real que se usa.',
    'No hay lista de espera ni tiendas de aplicaciones publicadas: no se inventan enlaces. Pendiente de confirmar con el PO: canal de contacto y fecha de las apps de iOS y Android.',
  ])}
</section>`);

// ---------- Ensamblado ----------

const plantillas = fs
  .readdirSync(pantallasDir)
  .filter((f) => f.endsWith('.svg'))
  .map((f) => `<template id="pant-${f.replace(/\.svg$/, '')}">${fs.readFileSync(path.join(pantallasDir, f), 'utf8')}</template>`)
  .join('\n');

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Waggo, paseos seguros para tu perro</title>
<meta name="description" content="Presentación comercial de Waggo: cómo se pide, se sigue y se paga un paseo seguro, y cómo hacerse paseador.">
<link rel="icon" href="assets/brand/logo-head.png">
<link rel="stylesheet" href="../_motor/motor.css">
<link rel="stylesheet" href="../_motor/tema.css">
<link rel="stylesheet" href="assets/comercial.css">
</head>
<body>
<main class="visor" aria-label="Presentación comercial de Waggo">
  <div class="lienzo">
${LAMINAS.join('\n')}
    <div class="capa-tel fuera" aria-hidden="true"></div>
  </div>
</main>
${plantillas}
<script src="../_motor/motor.js"></script>
<script src="assets/telefono.js"></script>
</body>
</html>
`;
fs.writeFileSync(path.join(destino, 'index.html'), html);
console.log(`index.html: ${(html.length / 1024).toFixed(0)} KB, ${LAMINAS.length} láminas`);
