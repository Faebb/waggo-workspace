// Genera presentaciones/inversionistas/index.html. Uso: node construir-inversionistas.mjs
// ÚNICA fuente de cifras de mercado y finanzas: negocio/mercado/*.md (consulta 2026-10-28). Cada cifra lleva su
// etiqueta (Dato, Cálculo, Supuesto) y su [n] de fuentes.md. Cifras de ingeniería: tecnica/guion.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const destino = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../inversionistas');
const frame = (id) => fs.readFileSync(path.join(destino, `assets/pantallas/${id}.svg`), 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const et = (t) => `<span class="et ${{ D: 'd', C: 'c', S: 's' }[t]}">${{ D: 'Dato', C: 'Cálculo', S: 'Supuesto' }[t]}</span>`;
const notas = (arr) => `<aside class="notas">${arr.map((n) => `<p>${n}</p>`).join('')}</aside>`;
const cab = (eyebrow, titulo) => `<header class="cab"><span class="eyebrow">${eyebrow}</span><h2 class="titulo">${titulo}</h2></header><div class="marca-esq"><span class="medalla"><img src="assets/brand/logo-head.png" alt=""></span>Waggo</div>`;
const pie = (t) => `<p class="pie-fuente">${t}</p>`;
const leyenda = `<div class="leyenda-et"><span><span class="et d">Dato</span>publicado</span><span><span class="et c">Cálculo</span>fórmula a la vista</span><span><span class="et s">Supuesto</span>a validar</span></div>`;

/* ---------- SVG ---------- */
const lin = (x, y, txt, cls, lh = 30) => String(txt).split('\n').map((l, i) => `<text x="${x}" y="${y + i * lh}" class="${cls}" text-anchor="middle">${esc(l)}</text>`).join('');
function caja(x, y, w, h, t, s = '', cls = '') {
  const nt = String(t).split('\n').length; const ns = s ? String(s).split('\n').length : 0;
  const y0 = y + (h - (nt * 32 + ns * 26)) / 2 + 26;
  return `<g class="d-caja ${cls}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16"/>${lin(x + w / 2, y0, t, 'd-t', 32)}${s ? lin(x + w / 2, y0 + nt * 32 - 2, s, 'd-s', 26) : ''}</g>`;
}
const defs = (n) => `<defs><marker id="fl${n}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="d-marca"/></marker></defs>`;
let nSvg = 0;
const svg = (w, h, inner, desc) => { nSvg++; return `<svg class="diagrama" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(desc)}">${defs(nSvg)}${inner.split('url(#fl)').join(`url(#fl${nSvg})`)}</svg>`; };
const flecha = (d) => `<path d="${d}" class="d-f" marker-end="url(#fl)"/>`;
const fmt = (n) => n.toLocaleString('es-CO');

function barrasH(datos, { ancho = 900, alto = 40, sep = 14, etq = 330, maxv, sufijo = '' } = {}) {
  const m = maxv ?? Math.max(...datos.map((d) => d[1]));
  const largo = ancho - etq - 150;
  const filas = datos.map(([n, v, c], i) => {
    const y = i * (alto + sep); const w = Math.max(5, (v / m) * largo);
    return `<text x="${etq - 14}" y="${y + alto / 2 + 9}" class="d-s" style="font-size:24px;fill:var(--texto)" text-anchor="end">${esc(n)}</text><rect x="${etq}" y="${y}" width="${w}" height="${alto}" rx="8" class="${c || 'd-barra'}"/><text x="${etq + w + 12}" y="${y + alto / 2 + 10}" class="d-t" style="font-size:26px">${fmt(v)}${sufijo}</text>`;
  }).join('');
  return `<svg class="diagrama" viewBox="0 0 ${ancho} ${datos.length * (alto + sep)}" role="img" aria-label="Gráfico: ${esc(datos.map((d) => `${d[0]} ${fmt(d[1])}${sufijo}`).join('; '))}">${filas}</svg>`;
}

const L = [];
const lam = (titulo, cuerpo, notasArr, { oscuro = false, zafiro = false, pasos = 0 } = {}) =>
  L.push(`<section class="lamina${oscuro ? ' oscuro' : ''}${zafiro ? ' zafiro' : ''}" data-titulo="${titulo}"${pasos ? ` data-pasos="${pasos}"` : ''}><div class="contenido-lamina">${cuerpo}</div>${notas(notasArr)}</section>`);

/* 1. Portada */
lam('Waggo para inversionistas', `
  <div style="position:absolute;inset:0;background:#3059a4"></div>
  <span class="medalla" style="position:absolute;left:130px;top:150px;width:300px;height:300px"><img src="assets/brand/logo-head.png" alt="Waggo"></span>
  <div style="position:absolute;left:520px;top:0;bottom:0;width:1300px;display:flex;flex-direction:column;justify-content:center;gap:26px;color:#fff">
    <span class="eyebrow" style="color:#e6eefb">Presentación para inversionistas</span>
    <h1 class="titulo-grande" style="font-size:104px;color:#fff">Waggo: paseos de perros con verificación y seguimiento</h1>
    <p class="texto-grande" style="color:#e6eefb;max-width:1100px">Lo construido, lo que sabemos del mercado de Bogotá y lo que el piloto debe demostrar. Con las cifras tal como salen del estudio, incluido el margen delgado.</p>
    <p class="pequeno" style="color:#e6eefb">Estudio de mercado consultado el 28 de octubre de 2026 · cada cifra dice si es Dato, Cálculo o Supuesto y de qué fuente sale.</p>
  </div>`, [
  'Presentación sobria, a pedido del PO: se muestran el margen delgado y el punto de equilibrio tal como salen del estudio, sin maquillarlos.',
  'No incluye valoración, monto de ronda ni retorno esperado. Tampoco usuarios o paseadores reales: hoy no hay usuarios medidos; el piloto de 12 semanas es lo que validará las hipótesis.',
  'Cada cifra lleva una etiqueta: Dato (publicado por una fuente), Cálculo (derivado, con fórmula) o Supuesto (decisión a validar). Las fuentes numeradas [n] están en la última lámina y en negocio/mercado/fuentes.md.',
], { zafiro: true });

/* 2. Resumen */
lam('Lo esencial', `
  ${cab('Resumen', 'Lo esencial, sin adornos')}
  <div class="cuerpo alto" style="top:215px">
    <ul class="lista" style="gap:16px">
      <li><span><b>Hay mercado, pero no sabemos cuánto paga por paseo.</b> ~806.200 hogares con perro en Bogotá ${et('C')}; no hay dato público de cuántos pagan paseador.</span></li>
      <li><span><b>El producto está construido y desplegado; no hay usuarios reales medidos.</b> El piloto validará las hipótesis.</span></li>
      <li><span><b>El margen por paseo es delgado:</b> $1.283 en un individual de 30 min y $464 en un grupal de 30 min, después de pasarela e IVA ${et('C')}.</span></li>
      <li><span><b>Punto de equilibrio operativo ≈ 2.800 paseos/mes (≈ 467 dueños activos)</b> ${et('C')}. El escenario base no lo alcanza en 24 meses.</span></li>
      <li><span><b>Capital de operación ≈ $47,5 M a 12 meses y ≈ $77,5 M a 24 meses</b> ${et('C')}, sin salarios de fundadores ni de desarrollo.</span></li>
      <li><span><b>Lo que mueve el resultado</b> es la frecuencia, los costos fijos y el margen por paseo (~$47–50 M); el volumen, solo ~$4 M ${et('C')}.</span></li>
    </ul>
  </div>
  ${pie('<b>Fuentes:</b> negocio/mercado/00-resumen.md y 03-viabilidad-financiera.md; [3][4] hogares con perro; precios y comisión del código (R1, R5). Los escenarios de capital usan supuestos (lámina 15).')}`, [
  'Seis mensajes. Los dos que más importan para decidir: el margen por paseo es delgado y el equilibrio operativo exige una frecuencia alta que hoy es un supuesto sin dato.',
  'Capital operativo de $47,5 M y $77,5 M: no es el monto de una ronda; es la necesidad de caja de operación del escenario base, sin salarios de fundadores ni de desarrollo.',
]);

/* 3. Problema */
lam('El problema', `
  ${cab('Problema', 'El paseo se contrata hoy de forma informal')}
  <div class="cuerpo alto" style="top:215px">
    <ul class="lista" style="gap:18px">
      <li><span><b>Informal y sin registro:</b> WhatsApp, conjuntos residenciales y avisos. No hay registro público de cuántos paseadores hay ${et('D')} [48][41]. El protocolo del Distrito es <b>no obligatorio</b>: máx. 8 perros, chaleco, mayoría de edad [48].</span></li>
      <li><span><b>La regla va a cambiar:</b> la Ley 2480 de 2025 pide registro de prestadores, certificado de primeros auxilios caninos y máx. 8 perros por paseador; reglamento técnico ~ene-2027 y transición ~jul-2027 ${et('D')} [41].</span></li>
      <li><span><b>Qué pasa sin control, en otros mercados:</b> reseñas recientes de Wag! (EE. UU.): «A confirmed walker three days prior never showed up» (3-oct-2026) ${et('D')} [29].</span></li>
      <li><span><b>La competencia local ya habla de confianza:</b> verificación de antecedentes [16], seguro SURA [18][20] y GPS [16][20]. Es requisito de entrada, no diferencial.</span></li>
    </ul>
    <p class="aviso" style="margin-top:30px"><b>Hipótesis de producto, no medida:</b> el dueño quiere saber dónde está su perro y qué pasa si algo sale mal. Es lo que el piloto debe confirmar.</p>
  </div>
  ${pie('<b>Fuentes:</b> [41] Ley 2480 de 2025; [48] protocolo IDPYBA (Res. 061 de 2019); [29] Trustpilot Wag!, consultado 2026-10-28; [16][18][20] fichas de competidores. «No encontré dato público» del número de paseadores informales (fuentes.md).')}`, [
  'El problema se describe con hechos verificables (informalidad, ley nueva, quejas en otros mercados). La necesidad del dueño es una hipótesis: no hay encuesta propia todavía.',
  'La Ley 2480 es una oportunidad (verificación como cumplimiento) y un riesgo (costo regulatorio); está en la lámina de riesgos.',
]);

/* 4. Solución */
const SOL = [
  ['Pedir en tres pasos', 'Dónde, quién y cuánto; precio visible antes de confirmar (RF-007, RF-019).'],
  ['Paseador verificado', 'Documento cifrado y aprobación manual de un administrador (RF-002/003).'],
  ['El más cercano acepta', 'Búsqueda por cercanía con PostGIS, a menos de 5 km (RF-006).'],
  ['Paseo en vivo', 'Ruta en el mapa, distancia y tiempo (RF-008, RF-011).'],
  ['Alertas y emergencia', 'Salida de zona (1,5 km), detención (10 min) y botón de emergencia (RF-009, 010, 012).'],
  ['Pago retenido', 'Se retiene al pedir y se cobra al terminar; pasarela simulada hoy (RF-015 a 018).'],
];
lam('La solución', `
  ${cab('Solución', 'Un paseo que se sigue y se paga al terminar')}
  <div class="cuerpo alto" style="top:215px">
    <div class="tres" style="gap:22px 26px">${SOL.map(([t, d]) => `<div class="tarjeta compacta"><h3 style="font-size:32px">${t}</h3><p style="font-size:25px">${d}</p></div>`).join('')}</div>
    <p class="texto" style="margin-top:26px">Todas son funciones con spec <b>Implementada</b>. Aún <b>no</b> hay: notificaciones push, cobro real con tarjeta, verificación automática de antecedentes ni calificaciones.</p>
  </div>
  ${pie('<b>Fuentes:</b> specs/ del repositorio (estado Implementada) y R6, R8, R9, R12, R13; ver lámina 6 para las cifras de ingeniería. Valores de umbrales (1,5 km, 10 min, 5 km) son provisionales en las specs.')}`, [
  'Cada tarjeta corresponde a una spec con estado Implementada. Los umbrales de alertas y el radio de búsqueda están marcados como provisionales en las specs.',
  'Dos limitaciones que un inversionista debe conocer: la pasarela de pago está simulada y la verificación es manual.',
]);

/* 5. Producto */
const marcoSvg = (id) => `<div class="tel-mini">${frame(id).replace(/ width="390" height="844"/, '')}</div>`;
const real = (f, clip, alt) => `<div class="tel-mini"><img src="assets/real/${f}" alt="${alt}"><img class="difuminada" src="assets/real/${f}" alt="" aria-hidden="true" style="clip-path:inset(${clip})"></div>`;
lam('El producto', `
  ${cab('Producto', 'La app: capturas reales y diseño aprobado')}
  <div class="cuerpo alto" style="top:205px;display:flex;gap:46px;align-items:flex-start">
    <div>${real('01-inicio.png', '20.35% 10.3% 65.15% 10.7% round 10px', 'Inicio de la app con la tarjeta Paseador en camino; mapa difuminado')}<p class="pie-tel"><b>Real</b> · Inicio</p></div>
    <div>${real('04-ver-paseo.png', '14% 6.3% 52.4% 6.3% round 10px', 'Pantalla del paseo con paseador verificado y botón Emergencia; mapa difuminado')}<p class="pie-tel"><b>Real</b> · Paseo en camino</p></div>
    <div>${marcoSvg('dueno-pedir-paseo-confirmar--resumen-y-pago')}<p class="pie-tel"><b>Diseño aprobado</b> · confirmar y pagar</p></div>
    <div>${marcoSvg('dueno-paseo-en-vivo--sheet-medio')}<p class="pie-tel"><b>Diseño aprobado</b> · paseo en vivo</p></div>
    <ul class="lista" style="gap:14px;width:380px;margin-top:20px"><li><span style="font-size:26px">Insignia <b>Paseador verificado</b></span></li><li><span style="font-size:26px">Botón <b>Emergencia</b> siempre a mano</span></li><li><span style="font-size:26px"><b>Precio y comisión</b> visibles antes de confirmar</span></li><li><span style="font-size:26px">Ruta, distancia y tiempo en vivo</span></li></ul>
  </div>
  ${pie('<b>Fuentes:</b> capturas del equipo en un Samsung Galaxy A35 (presentaciones/_capturas), con el mapa difuminado porque muestra una ubicación real; diseño: design/propuesta/pantallas. El diseño puede diferir en detalles de texto de la app desplegada. Datos de las pantallas: de ejemplo.')}`, [
  'Las dos capturas de la izquierda son de la app real; los mapas se difuminaron porque muestran la zona de recogida real de quien probó la app. Las dos de la derecha son el diseño aprobado, que en algunos detalles difiere de la app desplegada.',
  'Se ve la insignia Paseador verificado, el botón Emergencia y el precio con la comisión de Waggo visible antes de confirmar.',
]);

/* 6. Tracción: lo construido */
const CIF = [
  ['44', 'endpoints en 9 módulos'], ['21', 'specs; 18 implementadas'], ['626', 'métodos de prueba en la API'], ['466', 'pruebas en la app'],
  ['19', 'migraciones de base de datos'], ['82', 'commits en 30 días, en 3 repositorios'],
];
lam('Lo construido y desplegado', `
  ${cab('Estado del producto', 'Lo construido y lo que aún no existe')}
  <div class="cuerpo alto" style="top:215px">
    <div class="dos" style="grid-template-columns:1.25fr 1fr;gap:56px">
      <div>
        <div class="tres" style="grid-template-columns:1fr 1fr 1fr;gap:26px 22px">${CIF.map(([n, e]) => `<div class="dato"><span class="n" style="font-size:70px">${n}</span><span class="e">${e}</span></div>`).join('')}</div>
        <ul class="lista" style="gap:12px;margin-top:30px">
          <li><span><b>app.mywaggo.com</b> y <b>api.mywaggo.com</b> responden (200, comprobado el 2026-10-28)</span></li>
          <li><span>Despliegue automático a AWS en cada cambio a main; base PostgreSQL + PostGIS</span></li>
        </ul>
      </div>
      <div class="tarjeta" style="border-color:#c97a2b"><h3>Lo que hoy no hay</h3>
        <ul class="lista" style="gap:10px">
          <li><span><b>Usuarios reales medidos:</b> dueños, paseadores o paseos pagados</span></li>
          <li><span><b>Ingresos</b></span></li>
          <li><span>Pasarela de pago real, seguro y verificación automática</span></li>
        </ul>
        <p class="texto" style="margin-top:16px;font-size:26px">El piloto de 12 semanas medirá si las hipótesis se sostienen.</p>
      </div>
    </div>
  </div>
  ${pie('<b>Fuentes (Dato, contado del repositorio el 2026-10-28):</b> presentaciones/tecnica/guion.md (comando de cada cifra); specs/README.md; comprobación con curl. Son métodos de prueba definidos, no ejecuciones ni cobertura.')}`, [
  'Esto es lo único que la presentación presenta como «tracción»: lo construido. No hay usuarios ni ingresos reales medidos.',
  'Las cifras se contaron con comandos sobre los repositorios; el guion de la presentación técnica lista cada comando.',
]);

/* 7. Mercado: hogares y gasto */
lam('Mercado: hogares con perro', `
  ${cab('Mercado', 'Hogares con perro: hay; paseo pagado: sin dato')}
  <div class="cuerpo alto" style="top:215px">
    <div class="dos" style="gap:56px">
      <div>
        <div class="grande-num">27,8 %</div>
        <p class="texto" style="margin-bottom:22px">de los hogares de Bogotá tiene perro (2021: 26,6 %) ${et('D')} [3][4]</p>
        <div class="grande-num">~806.200</div>
        <p class="texto">hogares con perro: 2,9 M de hogares × 27,8 % ${et('C')} [3]. Con la proyección 2026 (3.125.885 hogares [5]): 868.996 ${et('C')}.</p>
      </div>
      <ul class="lista" style="gap:16px">
        <li><span>El sector de mascotas en Colombia vende <b>más de $6 billones al año</b> ${et('D')} [13][14], pero <b>80–90 %</b> es alimento y veterinaria ${et('D')} [14].</span></li>
        <li><span>Hogares con mascota: 44 % en 2025 (40,4 % en 2021) ${et('D')} [3][4].</span></li>
        <li><span><b>Sin dato público</b> de cuántos hogares pagan paseador. La única señal: 4 % de 402 propietarios usaba guardería, seguros o adiestramiento (encuesta antigua, ~2018–2019, muestra pequeña) ${et('D')} [12].</span></li>
      </ul>
    </div>
  </div>
  ${pie('<b>Fuentes:</b> [3] El Tiempo, 2026-10-28 y [4] Región Capital (prensa sobre la Encuesta Multipropósito 2025; el boletín oficial 2025 no se encontró); [5] SDP/DANE; [12] SDDE; [13] Agronegocios; [14] Infobae. Cálculo: 2.900.000 × 27,8 % = 806.200; 3.125.885 × 27,8 % = 868.996.')}`, [
  'El 27,8 % viene de dos medios que reportan la Encuesta Multipropósito 2025; no se encontró el boletín oficial. La cifra de hogares con perro es un cálculo propio.',
  'Un sector grande no implica demanda de paseo pagado: la mayor parte del gasto es alimento y veterinaria, y no hay cifra pública del tamaño del paseo en Bogotá.',
]);

/* 8. Segmento */
lam('Segmento inicial', `
  ${cab('Mercado', 'Del total de Bogotá al segmento inicial del piloto')}
  <div class="cuerpo alto" style="top:215px">
    ${barrasH([
      ['Hogares con perro, Bogotá', 806200, 'd-barra'],
      ['Estratos 4–6, 7 localidades candidatas', 188641, 'd-barra b2'],
      ['Usaquén + Chapinero, estratos 4–6', 64906, 'd-barra b2'],
      ['SOM medio (1,5 %)', 974, 'd-barra b3'],
      ['Piloto: hasta 500 dueños', 500, 'd-barra b3'],
    ], { ancho: 1700, alto: 52, sep: 22, etq: 560, maxv: 806200 })}
    <p class="texto" style="margin-top:20px">${et('C')} los tres primeros; SOM = 64.906 × 0,5 % / 1,5 % / 3 % = 325 / 974 / 1.947 hogares ${et('S')}; piloto: RNF-006 ${et('D')} (repo).</p>
    <p class="texto" style="font-size:27px;color:var(--suave)">Usaquén tiene 80,2 % de sus predios residenciales en estratos 4–6 y Chapinero 42,9 % en estrato 6 ${et('D')} [11]. La zona del piloto (5 UPZ): 101.053 hogares proyectados a 2026 ${et('D')} [6].</p>
  </div>
  ${pie('<b>Fuentes:</b> 02-mercado-y-demanda.md. [1][2] DANE EM 2021 (mascotas por localidad; 65,8 % de ellos con perro); [5] hogares 2026; [6] hogares por UPZ; [11] Catastro, Censo Inmobiliario 2025. Supuestos del cálculo: tenencia por localidad de 2021, 65,8 % de perros igual en todas, estrato del predio = estrato del hogar. No se usa el % de estratos de Suba (reconstruido, sin verificar).')}`, [
  'Cálculo: hogares 2026 × % de hogares con mascota 2021 × 65,8 % × % de predios en estratos 4–6. Tres supuestos explícitos que deben validarse con los microdatos de la Encuesta Multipropósito 2025.',
  'Suba tiene más hogares estimados, pero su porcentaje de estrato está reconstruido y sin verificar: por eso no se muestra ni se usa en el segmento inicial.',
]);

/* 9. Demanda: supuestos */
lam('Demanda: lo que no sabemos', `
  ${cab('Mercado', 'Cuántos pagarían: tres escenarios supuestos')}
  <div class="cuerpo alto" style="top:215px">
    <table class="tabla comp">
      <tr><th></th><th class="n">Bajo</th><th class="n">Medio</th><th class="n">Alto</th></tr>
      <tr><td>% de hogares que pagan paseador ${et('S')}</td><td class="n">10 %</td><td class="n">20 %</td><td class="n">30 %</td></tr>
      <tr><td>Paseos al mes por hogar ${et('S')}</td><td class="n">2</td><td class="n">4</td><td class="n">8</td></tr>
      <tr><td>Hogares (sobre 64.906) ${et('C')}</td><td class="n">6.491</td><td class="n">12.981</td><td class="n">19.472</td></tr>
      <tr><td>Paseos al mes ${et('C')}</td><td class="n">12.981</td><td class="n">51.925</td><td class="n">155.774</td></tr>
      <tr><td>Valor bruto anual de los paseos (GMV) ${et('C')}</td><td class="n">$2.718 M</td><td class="n">$10.873 M</td><td class="n">$32.619 M</td></tr>
    </table>
    <p class="aviso" style="margin-top:26px"><b>El GMV es lo que pagan los dueños, no un ingreso de Waggo.</b> Lo que Waggo retiene por paseo es una fracción pequeña (lámina 13). El porcentaje que paga paseador y la frecuencia son el supuesto más importante a medir en el piloto.</p>
  </div>
  ${pie('<b>Fuentes:</b> 02-mercado-y-demanda.md §5. Fórmulas: hogares = 64.906 × %; paseos/mes = hogares × frecuencia; GMV = paseos/mes × 12 × $17.450 (ticket de la mezcla base, Supuesto: 50 % individual 30 min, 30 % individual 60 min, 20 % grupal 60 min; precios del código R1, R5). Sin dato público de penetración del paseo pagado.')}`, [
  'Estos tres escenarios no son pronósticos: son rangos para dimensionar. No hay dato público de cuántos hogares pagan paseador ni con qué frecuencia.',
  'Se omite la comisión bruta anual del estudio para no confundirla con el margen real, que después de pasarela e IVA es mucho menor.',
]);

/* 10. Competencia: matriz */
const SI = '✅'; const NO = '❌'; const ND = '—';
const FILAS = [
  ['El más cercano acepta (tipo Uber)', `${SI} R13`, `${SI} [15]`, ND, `${NO} [24]`],
  ['Seguimiento en vivo', `${SI} R7`, `${SI} [16]`, `${SI} [20]`, ND],
  ['Alertas automáticas (zona, detención)', `${SI} R8`, ND, ND, ND],
  ['Botón de emergencia', `${SI} R9`, ND, ND, ND],
  ['Chat dentro de la app', `${SI} R10`, `${NO} [15]`, `${SI} [20]`, `${SI} [24]`],
  ['Pago retenido hasta terminar', `${SI} R6 (simulado)`, ND, ND, `${SI} 7 días [24]`],
  ['Verificación de antecedentes', `${NO} manual R12`, `${SI} [16]`, ND, `${SI} documento [24]`],
  ['Seguro para la mascota', `${NO}`, `${SI} SURA [18]`, `${SI} SURA [20]`, ND],
  ['Precio individual 30 min', '$15.500 R5', '$13.900 (2024) [22]', '$8.000–10.000 (2024) [22]', '1 h: $39.000 [23]'],
  ['Comisión al paseador', '20 % R1', '15 % / 10 % [17]', ND, ND],
];
lam('Competencia', `
  ${cab('Competencia', 'Qué tiene cada uno, solo lo verificado')}
  <div class="cuerpo alto" style="top:205px">
    <table class="tabla comp">
      <tr><th>Característica</th><th class="c">Waggo (repo)</th><th class="c">Wakypet</th><th class="c">Mywak</th><th class="c">PetBacker</th></tr>
      ${FILAS.map((f) => `<tr><td>${f[0]}</td>${f.slice(1).map((c) => `<td class="c">${c}</td>`).join('')}</tr>`).join('')}
    </table>
    <p class="pequeno suave" style="margin-top:14px">✅ verificado en la fuente · ❌ la fuente dice que no · — no se encontró dato público. Todo ${et('D')}; precios de 2024 pueden haber cambiado.</p>
  </div>
  ${pie('<b>Fuentes:</b> 01-competencia.md §4. [15][16][17] Wakypet (sitio); [18] ficha de Google Play de Wakypet (se omiten sus descargas y calificación: no verificadas de forma independiente); [20][21] Mywak; [22] Pulzo, 2024; [23][24] PetBacker; R = repo de Waggo. Precio de Waggo 11,5 % sobre el de Wakypet 2024 (Cálculo).')}`, [
  'La matriz incluye solo lo que la fuente confirma. «—» significa que no se encontró dato público, no que el competidor no lo tenga.',
  'Se omiten a propósito las descargas y la calificación de Wakypet en Google Play: la cifra no pudo verificarse de forma independiente.',
  'Precio: $15.500 vs $13.900 de Wakypet en 2024 = 11,5 % más (cálculo). La comisión de Waggo (20 %) es mayor que la de Wakypet (10–15 %): es un riesgo para reclutar paseadores.',
]);

/* 11. Diferenciales */
lam('Diferenciales como hipótesis', `
  ${cab('Competencia', 'Tres diferenciales posibles, todos por validar')}
  <div class="cuerpo alto" style="top:215px">
    <div class="tres" style="gap:24px">
      <div class="tarjeta compacta"><span class="etq">Hipótesis 1</span><h3 style="margin-top:8px;font-size:30px">Alertas automáticas</h3><p style="font-size:24px">Salida de zona (1,5 km) y detención (10 min). No encontré que Wakypet ni Mywak las publiquen. Evidencia de que importa: indirecta.</p><p style="font-size:23px;color:var(--suave);margin-top:8px"><b>Medir:</b> repetición a 30 días con y sin alertas.</p></div>
      <div class="tarjeta compacta"><span class="etq">Hipótesis 2</span><h3 style="margin-top:8px;font-size:30px">Emergencia con un toque</h3><p style="font-size:24px">No encontré botón publicado por competidores locales; ellos ofrecen seguro. Hoy <b>no avisa a soporte</b>: sin una persona de guardia no es vendible.</p><p style="font-size:23px;color:var(--suave);margin-top:8px"><b>Medir:</b> paso del primer al segundo paseo.</p></div>
      <div class="tarjeta compacta"><span class="etq">Hipótesis 3</span><h3 style="margin-top:8px;font-size:30px">Pago retenido</h3><p style="font-size:24px">PetBacker libera el pago a los 7 días; Wakypet y Mywak no publican cómo cobran. Pasarela simulada hoy.</p><p style="font-size:23px;color:var(--suave);margin-top:8px"><b>Medir:</b> confirmación en la pantalla de pago.</p></div>
    </div>
    <div class="dos" style="margin-top:26px;gap:30px">
      <div class="tarjeta compacta"><h3 style="font-size:28px">No son diferencial</h3><p style="font-size:25px">Mapa en vivo (Wakypet [16] y Mywak [20] lo anuncian) y asignación por cercanía (Wakypet [15]). Hay que igualarlos con calidad.</p></div>
      <div class="tarjeta compacta" style="border-color:#c97a2b"><h3 style="font-size:28px">Brechas frente a lo local</h3><p style="font-size:25px">Seguro para la mascota (SURA en Wakypet [18] y Mywak [20]) y verificación de antecedentes publicada (Wakypet [16]). Waggo verifica a mano.</p></div>
    </div>
  </div>
  ${pie('<b>Fuentes:</b> 04-diferenciales.md; [15][16][18][20][24]; R6, R8, R9, R12. Posicionamiento propuesto (hipótesis): «el paseo que te avisa si algo sale mal y que solo se cobra cuando termina», siempre que se cierren antes las brechas de seguro y verificación.')}`, [
  'El estudio es explícito: son hipótesis de valor sin evidencia directa de que el cliente pague más por ellas. Cada una trae una métrica para el piloto.',
  'La emergencia hoy solo la ven dueño y paseador en la pantalla del paseo; no hay panel de soporte ni push. Antes de venderla se necesita una persona de guardia.',
]);

/* 12. Modelo de negocio + cascada */
lam('Modelo de negocio', `
  ${cab('Modelo de negocio', 'Waggo cobra comisión y queda poco')}
  <div class="cuerpo alto" style="top:215px">
    ${svg(1700, 380, `
      <g transform="translate(470,0)">
      ${[
        ['Precio al dueño', 0, 1000, '$15.500', 'd-barra'],
        ['Para el paseador (80 %)', 200, 1000, '−$12.400', 'd-barra b2'],
        ['Comisión de Waggo (20 %)', 0, 200, '$3.100', 'd-barra'],
        ['IVA sobre la comisión', 168, 200, '−$495', 'd-barra b3'],
        ['Pasarela + IVA', 83, 168, '−$1.322', 'd-barra b3'],
        ['Margen retenido', 0, 83, '$1.283', 'd-barra b2'],
      ].map(([n, x0, x1, v, c], i) => `<text x="-16" y="${i * 62 + 34}" class="d-s" style="font-size:25px;fill:var(--texto)" text-anchor="end">${n}</text><rect x="${x0}" y="${i * 62 + 6}" width="${x1 - x0}" height="42" rx="6" class="${c}"/><text x="${x1 + 14}" y="${i * 62 + 38}" class="d-t" style="font-size:27px">${v}</text>`).join('')}
      </g>
    `, 'Cascada de un paseo individual de 30 minutos: precio 15.500; paseador 12.400; comisión 3.100; IVA 495; pasarela con IVA 1.322; margen retenido 1.283 pesos.')}
    <ul class="lista" style="gap:10px;margin-top:6px">
      <li><span>Individual 30 min: <b>$15.500</b>; comisión 20 % = $3.100 ${et('D')} (repo R1, R5, provisional R4). Wakypet cobra al paseador <b>10–15 %</b> ${et('D')} [17].</span></li>
      <li><span>Pasarela (Wompi): <b>2,65 % + $700 + impuestos</b> por transacción aprobada ${et('D')} [33][34]. IVA 19 % ${et('D')} [43], aplicado a la pasarela y, si Waggo es responsable de IVA, a la comisión ⚖️.</span></li>
      <li><span>Margen retenido: <b>$1.283 = 8,3 %</b> del precio ${et('C')}. Hoy el código no separa IVA ni costo de pasarela (R2).</span></li>
    </ul>
  </div>
  ${pie('<b>Fuentes:</b> 03-viabilidad-financiera.md, tabla 1. Cálculo: pasarela = (15.500 × 2,65 % + 700) × 1,19 = 1.322; IVA de la comisión = 3.100 − 3.100 / 1,19 = 495; margen = 3.100 − 495 − 1.322 = 1.283. ⚖️ lo debe validar un contador. No incluye retenciones ni ICA.')}`, [
  'Es el gráfico clave de la presentación: de $15.500 que paga el dueño, $12.400 son del paseador y a Waggo le quedan $1.283 después de pasarela e IVA (8,3 %).',
  'El cargo fijo de $700 de la pasarela pesa entre 5 % y 12 % del precio: es la variable de costo más pesada en paseos baratos. No se encontró dato público sobre cobros por autorización liberada ni sobre la dispersión al paseador.',
]);

/* 13. Margen por tipo de paseo */
lam('Margen por tipo de paseo', `
  ${cab('Economía unitaria', 'El margen depende del tipo y la duración')}
  <div class="cuerpo alto" style="top:215px">
    <div class="dos" style="grid-template-columns:1.1fr 1fr;gap:50px">
      <div>
        <span class="rotulo-codigo">Margen retenido por paseo <span>($ COP, después de pasarela e IVA) ${et('C')}</span></span>
        ${barrasH([
          ['Individual 30 min', 1283, 'd-barra b3'], ['Individual 45 min', 1802], ['Individual 60 min', 2307, 'd-barra b2'], ['Individual 90 min', 3331], ['Individual 120 min', 4355],
          ['Grupal 30 min', 464, 'd-barra b3'], ['Grupal 60 min', 1078], ['Grupal 120 min', 2307],
        ], { ancho: 920, alto: 36, sep: 14, etq: 280, maxv: 4355 })}
      </div>
      <div>
        <ul class="lista" style="gap:14px">
          <li><span>El paseo individual de 30 min deja <b>$1.283</b>; el grupal de 30 min, <b>$464</b> ${et('C')}.</span></li>
          <li><span>Un paseo de 60 min deja <b>$2.307</b> (individual) ${et('C')}.</span></li>
          <li><span>Rango: <b>$464 a $4.355</b> según tipo y duración ${et('C')}.</span></li>
          <li><span>El precio <b>no</b> cambia con el número de perros (1 a 3) ${et('D')} (R18).</span></li>
          <li><span>El estudio recomienda evitar el grupal de 30 min como producto de entrada.</span></li>
        </ul>
      </div>
    </div>
  </div>
  ${pie('<b>Fuentes:</b> 03-viabilidad-financiera.md, tabla 1 (neto B: con IVA en la comisión); precios del código R1, R5, R18 (provisionales, R4); pasarela [33][34]; IVA [43]. Soporte (Supuesto $300 por paseo) no está descontado aquí.')}`, [
  'Neto B de la tabla 1 del estudio. El margen de los escenarios (lámina 15) además descuenta $300 de soporte por paseo, que es un supuesto.',
  'Hoy la pasarela la absorbe Waggo: el código reparte el total entre comisión y paseador sin descontar el costo de la pasarela.',
]);

/* 14. Palancas */
lam('Palancas a estudiar', `
  ${cab('Economía unitaria', 'Palancas que el estudio propone evaluar')}
  <div class="cuerpo alto" style="top:215px">
    <table class="tabla comp">
      <tr><th style="width:430px">Palanca</th><th>Efecto por paseo individual de 30 min ${et('C')}</th><th style="width:560px">Riesgo</th></tr>
      <tr><td>Cobrar paquetes de 8 paseos en una sola transacción</td><td>La pasarela baja de $1.322 a $593 por paseo (+$729)</td><td>Choca con la retención por paseo del diseño actual; requiere decisión de producto</td></tr>
      <tr><td>Subir la comisión a 25 %</td><td>+$651 por paseo</td><td>Wakypet cobra 10–15 % [17]: puede costar oferta de paseadores</td></tr>
      <tr><td>Trasladar la pasarela al dueño como tarifa de servicio</td><td>+$1.322; precio final $16.822</td><td>21 % sobre Wakypet 2024 ($13.900 [22])</td></tr>
      <tr><td>Empujar paseos de 60 min</td><td>Margen $2.307 vs $1.283</td><td>Depende de una demanda sin dato</td></tr>
      <tr><td>Evitar el grupal de 30 min</td><td>Solo deja $464</td><td>—</td></tr>
    </table>
    <p class="aviso" style="margin-top:22px">Son opciones a estudiar con datos del piloto, no resultados. Ninguna está probada ni implementada hoy; cualquier cambio de precio es configuración (R1), no desarrollo.</p>
  </div>
  ${pie('<b>Fuentes:</b> 03-viabilidad-financiera.md §4 y 05-plan-de-lanzamiento-bogota.md §5. Cálculos: paquetes = (124.000 × 2,65 % + 700) × 1,19 / 8; comisión 25 % = (15.500 × 25 % / 1,19 − 1.322) − (15.500 × 20 % / 1,19 − 1.322).')}`, [
  'El estudio también propone, como supuesto de piloto, una comisión de lanzamiento de 15 % para los primeros 50 paseadores, que reduciría el margen del individual de 30 min de $1.283 a ~$632 (cálculo). Se muestra en la lámina de riesgos.',
  'No se afirma qué palanca funcionará: la demanda y la sensibilidad al precio se medirán en el piloto.',
]);

/* 15. Supuestos de los escenarios */
lam('Supuestos de los escenarios', `
  ${cab('Escenarios', 'Los supuestos del modelo: todos por validar')}
  <div class="cuerpo alto" style="top:215px">
    <table class="tabla comp">
      <tr><th>Variable ${et('S')}</th><th class="n">Conservador</th><th class="n">Base</th><th class="n">Optimista</th></tr>
      <tr><td>Margen por paseo (después de pasarela, IVA y soporte)</td><td class="n">$1.000</td><td class="n">$1.250</td><td class="n">$1.700</td></tr>
      <tr><td>Paseos al mes al mes 12</td><td class="n">600</td><td class="n">2.500</td><td class="n">6.000</td></tr>
      <tr><td>Crecimiento de los meses 13 a 24</td><td class="n">×1,5</td><td class="n">×2</td><td class="n">×2,5</td></tr>
      <tr><td>Paseos al mes por dueño activo</td><td class="n">4</td><td class="n">6</td><td class="n">8</td></tr>
      <tr><td>Abandono mensual de dueños</td><td class="n">15 %</td><td class="n">10 %</td><td class="n">7 %</td></tr>
      <tr><td>CAC (costo por dueño activo nuevo)</td><td class="n">$80.000</td><td class="n">$40.000</td><td class="n">$20.000</td></tr>
      <tr><td>Costos fijos mensuales</td><td class="n">$3,5 M</td><td class="n">$3,5 M</td><td class="n">$3,5 M</td></tr>
    </table>
    <p class="aviso" style="margin-top:22px"><b>Los costos fijos excluyen salarios de fundadores y del equipo de desarrollo.</b> Incluyen: 1 coordinador de operación y soporte (~$2,6 M con prestaciones), contador y legal externos ($0,5 M), nube ($0,15 M) y herramientas ($0,25 M).</p>
  </div>
  ${pie('<b>Fuentes:</b> 03-viabilidad-financiera.md §2 (todos Supuesto, rango bajo / medio / alto). Referencias: CPC de Meta en Colombia ~US$0,22 ≈ $700 [49] (benchmark privado); SMMLV 2026 $1.750.905 [40]. No hay dato público de frecuencia, abandono ni CAC de apps de paseo en Colombia.')}`, [
  'Ninguna de estas variables tiene dato público: son los rangos del analista para dimensionar. El piloto debe reemplazarlas por datos reales.',
  'El margen del caso base ($1.250) sale de una mezcla de 50 % individual 30 min, 30 % individual 60 min y 20 % grupal 60 min ($1.549) menos $300 de soporte.',
]);

/* 16. Resultados: equilibrio y capital */
lam('Punto de equilibrio y capital', `
  ${cab('Escenarios', 'El caso base no llega al equilibrio en 24 meses')}
  <div class="cuerpo alto" style="top:215px">
    <div class="dos" style="grid-template-columns:1.15fr 1fr;gap:46px">
      <div>
        <table class="tabla comp">
          <tr><th></th><th class="n">Conservador</th><th class="n">Base</th><th class="n">Optimista</th></tr>
          <tr><td>Equilibrio operativo (paseos/mes) ${et('C')}</td><td class="n">3.500</td><td class="n">2.800</td><td class="n">2.059</td></tr>
          <tr><td>Paseos/mes, mes 12 → 24 ${et('S')}</td><td class="n">600 → 900</td><td class="n">2.500 → 5.000</td><td class="n">6.000 → 15.000</td></tr>
          <tr><td>Primer mes con flujo ≥ 0 ${et('C')}</td><td class="n">No llega</td><td class="n">No llega</td><td class="n">Mes 7</td></tr>
          <tr class="dest"><td>Capital de operación a 12 meses ${et('C')}</td><td class="n">$60,0 M</td><td class="n">$47,5 M</td><td class="n">$12,0 M</td></tr>
          <tr class="dest"><td>Capital de operación a 24 meses ${et('C')}</td><td class="n">$125,4 M</td><td class="n">$77,5 M</td><td class="n">Positivo</td></tr>
          <tr><td>LTV / CAC ${et('C')}</td><td class="n">0,33</td><td class="n">1,9</td><td class="n">9,7</td></tr>
        </table>
      </div>
      <div>
        <p class="aviso" style="font-size:27px"><b>Base:</b> equilibrio en 2.800 paseos/mes ≈ 467 dueños activos con 6 paseos al mes. Necesita ≈ $47,5 M a 12 meses y ≈ $77,5 M a 24 meses <b>sin salarios de fundadores ni de desarrollo</b>.</p>
        <p class="texto" style="margin-top:18px;font-size:26px">Una relación LTV/CAC menor que 1 (conservador: 0,33) significa que cada cliente adquirido destruye valor. Optimista: máximo acumulado negativo de $12,0 M y +$139,6 M acumulado a 24 meses ${et('C')}.</p>
      </div>
    </div>
  </div>
  ${pie('<b>Fuentes:</b> 03-viabilidad-financiera.md §3 (modelo mensual de 24 meses sobre los supuestos de la lámina 15). Equilibrio = costos fijos / margen por paseo (3,5 M / 1.250 = 2.800). LTV = margen × frecuencia / abandono. Los resultados son tan buenos como sus supuestos: ninguno tiene dato propio todavía.')}`, [
  'La lectura honesta: con los supuestos del caso base, el negocio no llega al equilibrio operativo en 24 meses y necesita financiación de operación incluso sin pagar salarios de fundadores ni de desarrollo.',
  'El caso optimista llega al equilibrio en el mes 7, pero depende de 6.000 paseos/mes al mes 12 y 8 paseos/mes por dueño, que son supuestos sin dato.',
  'El equilibrio de 2.800 paseos/mes cabe en el tamaño del piloto: 467 dueños activos es menos que los 500 dimensionados (RNF-006), aunque eso solo mide la capacidad del piloto, no la demanda.',
]);

/* 17. Sensibilidad (tornado) */
const TORN = [
  ['Costos fijos', -102.7, -52.3], ['Paseos por dueño al mes', -108.3, -61.0], ['Margen por paseo', -101.0, -54.1],
  ['CAC', -99.0, -56.0], ['Abandono mensual', -89.0, -66.0], ['Volumen (paseos al mes 12)', -79.5, -75.6],
];
const AMP = ['$50,4 M', '$47,3 M', '$46,9 M', '$43,0 M', '$23,0 M', '$3,9 M'];
const xs = (v) => 860 + (v + 77.5) * 11; // base -77,5 en x=640
const tornado = svg(1700, 6 * 70 + 70, `
  <line x1="${xs(-77.5)}" y1="0" x2="${xs(-77.5)}" y2="${6 * 70 + 10}" class="d-eje"/>
  ${TORN.map(([n, peor, mejor], i) => {
    const y = i * 70 + 8;
    return `<text x="0" y="${y + 36}" class="d-s" style="font-size:26px;fill:var(--texto)">${n}</text>
    <rect x="${xs(peor)}" y="${y}" width="${xs(-77.5) - xs(peor)}" height="48" rx="6" class="d-barra b3"/><rect x="${xs(-77.5)}" y="${y}" width="${xs(mejor) - xs(-77.5)}" height="48" rx="6" class="d-barra b2"/>
    <text x="${xs(peor) - 10}" y="${y + 34}" class="d-s" style="font-size:23px;fill:var(--texto)" text-anchor="end">${peor.toString().replace('.', ',').replace('-', '−')}</text>
    <text x="${xs(mejor) + 10}" y="${y + 34}" class="d-s" style="font-size:23px;fill:var(--texto)">${mejor.toString().replace('.', ',').replace('-', '−')}</text>
    <text x="1420" y="${y + 36}" class="d-t" style="font-size:26px">${AMP[i]}</text>`;
  }).join('')}
  <text x="${xs(-77.5)}" y="${6 * 70 + 44}" class="d-s" style="font-size:23px" text-anchor="middle">Base: −77,5 (acumulado a 24 meses, $ millones)</text>
  <text x="1420" y="${6 * 70 + 44}" class="d-s" style="font-size:23px">Amplitud</text>
`, 'Gráfico de sensibilidad: el acumulado a 24 meses del escenario base es −77,5 millones. Costos fijos mueve 50,4; paseos por dueño 47,3; margen por paseo 46,9; CAC 43,0; abandono 23,0; volumen 3,9.');
lam('Sensibilidad', `
  ${cab('Escenarios', 'Lo que mueve el resultado')}
  <div class="cuerpo alto" style="top:205px">
    ${tornado}
    <p class="texto" style="margin-top:8px;font-size:27px">Mover ±30 % el volumen cambia el resultado solo ~$3,9 M; mover los costos fijos, la frecuencia o el margen por paseo, ~$47–50 M ${et('C')}. Crecer en volumen no resuelve un margen que apenas cubre su costo de adquisición.</p>
  </div>
  ${pie('<b>Fuentes:</b> 03-viabilidad-financiera.md §5: cada variable ±30 % con las demás fijas, sobre el escenario base (acumulado a 24 meses −$77,5 M, Cálculo). Naranja: peor caso; verde: mejor caso. Cifras en $ millones.')}`, [
  'Lectura del estudio: lo que define la viabilidad es cuántas veces pasea cada dueño (frecuencia y retención), cuánto queda por paseo y mantener los costos fijos bajos. Eso define qué medir en el piloto.',
  'Las barras salen directamente de la tabla de sensibilidad del estudio; no se agregó ningún cálculo nuevo.',
]);

/* 18. Plan de lanzamiento */
lam('Plan de lanzamiento', `
  ${cab('Lanzamiento', 'Núcleo del piloto: Usaquén sur + Chapinero norte')}
  <div class="cuerpo alto" style="top:215px">
    <div class="dos" style="grid-template-columns:1fr 1fr;gap:46px">
      <ul class="lista" style="gap:12px">
        <li><span>5 UPZ: Santa Bárbara, Usaquén, Country Club, Chicó Lago y El Refugio: <b>101.053 hogares</b> proyectados a 2026 ${et('D')} [6].</span></li>
        <li><span>Hogares con perro en estratos 4–6, Usaquén + Chapinero: <b>64.906</b> ${et('C')}.</span></li>
        <li><span>Piloto cerrado: hasta <b>500 dueños y 50 paseadores</b> ${et('D')} (RNF-006), 12 semanas de operación ${et('S')}.</span></li>
        <li><span>Capacidad de oferta: 50 paseadores × 3 paseos/día × 22 días = 3.300 paseos/mes ${et('C')} (3 paseos/día ${et('S')}).</span></li>
        <li><span>El matching busca a menos de 5 km (R13): un núcleo compacto concentra oferta y demanda.</span></li>
      </ul>
      <table class="tabla comp">
        <tr><th>Fase ${et('S')}</th><th>Duración</th></tr>
        <tr><td><b>F0</b> Preparación (lámina 20)</td><td>6–8 semanas</td></tr>
        <tr><td><b>F1</b> Piloto cerrado, medición semanal</td><td>12 semanas</td></tr>
        <tr><td><b>F2</b> Ampliación: Los Cedros y Teusaquillo, si F1 pasa umbrales</td><td>3 meses</td></tr>
        <tr><td><b>F3</b> Suba, tras validar su estrato</td><td>según F2</td></tr>
      </table>
    </div>
  </div>
  ${pie('<b>Fuentes:</b> 05-plan-de-lanzamiento-bogota.md §1, §2, §7; [6] SDP/DANE hogares por UPZ; [11] Catastro; R13, R16. Tiempos y fases: Supuesto propuesto para que el PO los apruebe. Suba no se usa hasta verificar su porcentaje de estrato en el PDF de Catastro.')}`, [
  'Usaquén es la localidad con más hogares con perro en estratos 4–6 que se pueden estimar con datos confiables (49.457, cálculo); Chapinero aporta 15.449 y la mayor proporción de estrato 6.',
  'Meta de volumen del piloto: 2.800 paseos/mes al cierre (equilibrio operativo base). Es una meta de aprendizaje, no un pronóstico.',
]);

/* 19. Umbrales */
lam('Umbrales de decisión', `
  ${cab('Lanzamiento', 'El piloto decide: seguir, ajustar o parar')}
  <div class="cuerpo alto" style="top:215px">
    <table class="tabla comp">
      <tr><th>Métrica ${et('S')}</th><th>Umbral para seguir</th><th style="width:480px">Si falla</th></tr>
      <tr><td>Solicitudes aceptadas en menos de 10 min</td><td>≥ 85 %</td><td>Más paseadores o zona más pequeña</td></tr>
      <tr><td>Paseos completados / aceptados</td><td>≥ 95 %</td><td>Revisar verificación y penalidades</td></tr>
      <tr><td>Dueños con ≥ 2 paseos en 30 días</td><td>≥ 40 %</td><td>Revisar producto y precio</td></tr>
      <tr><td>Paseos por dueño activo al mes</td><td>≥ 6</td><td>Paquetes o suscripción</td></tr>
      <tr><td>Margen real por paseo (pasarela real)</td><td>≥ $1.250</td><td>Paquetes, duración, comisión</td></tr>
      <tr><td>CAC</td><td>≤ $40.000</td><td>Cambiar de canal</td></tr>
      <tr><td>LTV / CAC</td><td>≥ 1,9; <b>parar si &lt; 1</b></td><td>Rediseñar el modelo</td></tr>
      <tr><td>Emergencias atendidas por una persona en menos de 5 min</td><td>100 %</td><td>No ampliar</td></tr>
    </table>
    <p class="texto" style="margin-top:16px;font-size:26px"><b>Regla:</b> seguir si se cumplen las 3 primeras y LTV/CAC ≥ 1; ajustar si fallan 1–2; parar o rediseñar si LTV/CAC &lt; 1 al cierre.</p>
  </div>
  ${pie('<b>Fuentes:</b> 05-plan-de-lanzamiento-bogota.md §6: todos los umbrales son Supuesto propuesto, a aprobar o ajustar por el PO. Referencia de ingreso del paseador ≥ $8.000/hora [27].')}`, [
  'Los umbrales existen para que el piloto pueda fallar con claridad: si LTV/CAC es menor que 1 al cierre, el modelo se rediseña o se detiene.',
  'La encuesta a la lista de espera (n ≥ 300) se hace antes del piloto para medir el supuesto más importante: cuántos hogares pagarían un paseador.',
]);

/* 20. Qué falta antes de lanzar */
lam('Antes de lanzar', `
  ${cab('Lanzamiento', 'Qué falta antes del primer paseo real')}
  <div class="cuerpo alto" style="top:215px">
    <div class="dos" style="gap:50px">
      <ul class="lista" style="gap:12px">
        <li><span><b>Pasarela real</b> elegida y cotizada (Wompi, Mercado Pago o PayU); hoy simulada (R6).</span></li>
        <li><span><b>Seguro o póliza</b> de responsabilidad: SURA asegura a Wakypet y Mywak [18][20]; sin precio público para paseadores.</span></li>
        <li><span><b>Verificación de antecedentes</b> y <b>certificado de primeros auxilios caninos</b>, que la Ley 2480 de 2025 exigirá [41].</span></li>
        <li><span><b>Emergencias atendidas por una persona de guardia</b> (panel de alertas pendiente, R12; push pendiente, R11).</span></li>
      </ul>
      <ul class="lista" style="gap:12px">
        <li><span><b>Revisión legal:</b> relación con paseadores (Ley 2466 y Decreto 991 de 2026, escritos para reparto [42]), datos personales (Ley 1581 [44]) y consumidor (Ley 1480 [45]) ⚖️.</span></li>
        <li><span><b>Mapas para producción:</b> los tiles públicos de OpenStreetMap son solo para desarrollo y piloto (R7).</span></li>
        <li><span><b>Concepto contable:</b> IVA sobre la comisión, retenciones e ICA ⚖️.</span></li>
        <li><span><b>Lista de espera y encuesta</b> de demanda (n ≥ 300) en el núcleo.</span></li>
      </ul>
    </div>
  </div>
  ${pie('<b>Fuentes:</b> 05-plan-de-lanzamiento-bogota.md §7 (F0) y 04-diferenciales.md; [18][20][41][42][44][45]; R6, R7, R11, R12. ⚖️ = lo debe validar un abogado o contador. Preparación estimada en 6–8 semanas (Supuesto).')}`, [
  'Esta lista es la fase F0 del plan. Sin estos puntos no se recomienda lanzar: sin seguro ni verificación se compite en desventaja frente a lo local, y sin guardia la emergencia no es vendible.',
  'La Ley 2480 de 2025 aplica a los paseadores de perros; si Waggo es prestador o solo plataforma es una pregunta para el abogado.',
]);

/* 21. Uso de fondos: categorías */
lam('Uso de fondos', `
  ${cab('Capital', 'Uso de fondos: categorías, sin montos')}
  <div class="cuerpo alto" style="top:215px">
    <table class="tabla comp">
      <tr><th style="width:360px">Categoría</th><th>Lo que el estudio tiene hoy</th></tr>
      <tr><td><b>Pasarela real</b></td><td>2,65 % + $700 + impuestos por transacción (Wompi) ${et('D')} [33]; autorización liberada y dispersión: sin dato, por cotizar</td></tr>
      <tr><td><b>Seguro / póliza</b></td><td>Sin precio público para paseadores; por cotizar</td></tr>
      <tr><td><b>Verificación y certificado</b></td><td>Antecedentes y primeros auxilios caninos; costo por cotizar</td></tr>
      <tr><td><b>Soporte y guardia de emergencias</b></td><td>1 coordinador ≈ $2,6 M/mes con prestaciones ${et('S')}; soporte $300 por paseo ${et('S')}</td></tr>
      <tr><td><b>Adquisición de dueños</b></td><td>CAC base $40.000 ${et('S')}; CPC de Meta ≈ $700 ${et('D')} [49]</td></tr>
      <tr><td><b>Nube</b></td><td>≈ US$48/mes ≈ $153.000/mes ${et('C')} [36][37][38][39]</td></tr>
      <tr><td><b>Legal, contable y herramientas</b></td><td>$0,5 M + $0,25 M al mes ${et('S')}</td></tr>
    </table>
    <p class="aviso" style="margin-top:20px">Esta presentación <b>no propone un monto de ronda</b>. El único dato de necesidad de caja es la operación del escenario base (lámina 16), que excluye salarios de fundadores y de desarrollo.</p>
  </div>
  ${pie('<b>Fuentes:</b> 03-viabilidad-financiera.md §1–2 y 05-plan-de-lanzamiento-bogota.md. Nube: ECS Fargate US$9,01 + ALB US$22,27 + RDS US$11,68 + ~US$5 = ~US$48 × TRM $3.185,01 [39] (Cálculo con precios públicos de AWS [36][37][38]).')}`, [
  'Es una estructura de categorías: donde el estudio no tiene monto, dice «por cotizar». No se inventó ninguna cifra para completar la tabla.',
  'La nube cuesta ~$61 por paseo a 2.500 paseos/mes: no es una variable relevante a esta escala.',
]);

/* 22. Riesgos */
lam('Riesgos y mitigación', `
  ${cab('Riesgos', 'Los riesgos principales y qué haremos')}
  <div class="cuerpo alto" style="top:205px">
    <table class="tabla comp">
      <tr><th style="width:360px">Riesgo</th><th>Evidencia</th><th style="width:520px">Mitigación propuesta</th></tr>
      <tr><td>Comisión mayor que la de Wakypet</td><td>20 % (R1) vs 10–15 % [17]</td><td>Comisión de lanzamiento de 15 % para los primeros 50 paseadores ${et('S')}: baja el margen del individual 30 min de $1.283 a ~$632 ${et('C')}</td></tr>
      <tr><td>Margen insuficiente</td><td>$464 a $1.283 en paseos cortos</td><td>Paquetes, paseos de 60 min, tarifa de servicio (lámina 14)</td></tr>
      <tr><td>Regulación de paseadores</td><td>Ley 2480: primeros auxilios, registro, multas 5–20 SMMLV [41]</td><td>Incluir el certificado en la verificación desde el piloto</td></tr>
      <tr><td>Régimen laboral de plataformas</td><td>Ley 2466 / Decreto 991, hoy para reparto [42]</td><td>Concepto legal antes de escalar ⚖️</td></tr>
      <tr><td>Incidente grave con una mascota</td><td>Quejas de seguridad en Wag! [29]; competidores aseguran [18][20]</td><td>Póliza y protocolo con persona de guardia</td></tr>
      <tr><td>Demanda menor a la supuesta</td><td>Sin dato público de penetración</td><td>Encuesta previa y lista de espera; sin pauta antes de F1</td></tr>
      <tr><td>Reacción de la competencia</td><td>Wakypet da el primer paseo gratis [18]</td><td>Diferenciar por alertas y pago retenido, no por precio</td></tr>
    </table>
  </div>
  ${pie('<b>Fuentes:</b> 00-resumen.md y 05-plan-de-lanzamiento-bogota.md §8. Cálculo de la comisión de 15 %: 15.500 × 15 % / 1,19 − 1.322 = 632 (neto de pasarela, con IVA en la comisión).')}`, [
  'El primer riesgo es de oferta: con 20 % de comisión será más difícil reclutar paseadores que en Wakypet. La comisión de lanzamiento de 15 % tiene un costo directo en el margen, que ya está calculado.',
  'La relación laboral con los paseadores es una incógnita legal; el régimen de plataformas vigente está escrito para reparto.',
]);

/* 23. Datos que faltan */
lam('Datos que faltan', `
  ${cab('Honestidad', 'Datos que faltan y cómo se conseguirán')}
  <div class="cuerpo alto" style="top:205px">
    <table class="tabla comp">
      <tr><th style="width:600px">Falta</th><th>Cómo conseguirlo</th></tr>
      <tr><td>% de hogares que pagan paseador, frecuencia y precio aceptado</td><td>Encuesta a la lista de espera (n ≥ 300) y datos del piloto</td></tr>
      <tr><td>Tenencia de perro por localidad y estrato (2025)</td><td>Microdatos de la Encuesta Multipropósito 2025</td></tr>
      <tr><td>Retención, frecuencia y CAC reales</td><td>Piloto de 12 semanas (tabla de umbrales)</td></tr>
      <tr><td>Tarifas reales de pasarela (autorización liberada, dispersión)</td><td>Cotización con Wompi, Mercado Pago y PayU</td></tr>
      <tr><td>IVA sobre comisión, retenciones e ICA</td><td>Concepto de contador</td></tr>
      <tr><td>Encaje de los paseadores en la Ley 2466 / relación laboral</td><td>Concepto de abogado laboral</td></tr>
      <tr><td>Costo de póliza de responsabilidad para paseadores</td><td>Cotización con aseguradoras</td></tr>
      <tr><td>Precios y descargas actuales de Mywak</td><td>Cliente incógnito (su sitio no publica precios)</td></tr>
    </table>
  </div>
  ${pie('<b>Fuentes:</b> 00-resumen.md («Datos que faltan») y fuentes.md («No encontré dato público»). Las fuentes de prensa sobre la Encuesta Multipropósito 2025 [3][4] no sustituyen el boletín oficial, que no se encontró.')}`, [
  'Esta lámina es el plan de trabajo previo y durante el piloto. Ninguna de estas incógnitas es menor: la primera (cuántos pagan paseador) define el tamaño real del mercado.',
]);

/* 24. Equipo */
lam('Equipo', `
  ${cab('Equipo', 'Por confirmar por el PO')}
  <div class="cuerpo alto" style="top:260px">
    <p class="aviso" style="font-size:34px">Esta lámina queda como marcador de posición: nombres, cargos y experiencia los define el PO. No se incluyó ninguna persona.</p>
    <p class="texto" style="margin-top:34px">Lo que sí es verificable del equipo hoy es cómo trabaja: desarrollo guiado por especificaciones con TDD y agentes de IA especializados, descrito en la presentación técnica (<code>presentaciones/tecnica</code>).</p>
  </div>
  ${pie('<b>Fuente:</b> presentaciones/tecnica/guion.md. Pendiente de confirmar por el PO: integrantes, roles y dedicación.')}`, [
  'Marcador de posición por decisión de la regla del proyecto: no se inventan nombres ni cargos.',
]);

/* 25. Cierre */
lam('Cierre', `
  <div style="position:absolute;inset:0;background:#3059a4"></div>
  <span class="medalla" style="position:absolute;left:130px;top:150px;width:240px;height:240px"><img src="assets/brand/logo-head.png" alt="Waggo"></span>
  <div style="position:absolute;left:460px;top:0;bottom:0;width:1340px;display:flex;flex-direction:column;justify-content:center;gap:26px;color:#fff">
    <h2 class="titulo-grande" style="font-size:84px;color:#fff">El piloto responde lo que hoy no sabemos</h2>
    <ul class="lista" style="color:#fff;gap:16px">
      <li><span>Producto construido y desplegado; <b>sin usuarios reales medidos</b>.</span></li>
      <li><span>Margen delgado y equilibrio en ~2.800 paseos/mes: <b>depende de la frecuencia</b>, los costos fijos y el margen por paseo.</span></li>
      <li><span>Piloto de 12 semanas en Usaquén sur + Chapinero norte, con umbrales para seguir, ajustar o parar.</span></li>
    </ul>
    <p class="texto" style="color:#e6eefb">Entra a <a href="https://app.mywaggo.com" style="font-weight:700">app.mywaggo.com</a> para ver el producto.</p>
  </div>`, [
  'Cierre: lo que hay (producto), lo que no hay (usuarios, ingresos) y lo que decidirá el piloto. No se propone monto de ronda, valoración ni retorno.',
  'El enlace app.mywaggo.com responde 200 (comprobado el 2026-10-28).',
], { zafiro: true });

/* 26. Fuentes */
const FU = [
  ['1·2', 'DANE, Encuesta Multipropósito 2021 (boletín y comunicado)'], ['3', 'El Tiempo, 2026-10-28: EM 2025 (prensa)'], ['4', 'Región Capital: EM 2025 (prensa)'],
  ['5', 'SDP/DANE: hogares por localidad 2018–2035'], ['6', 'SDP/DANE: hogares por UPZ 2018–2035'], ['11', 'Catastro Bogotá: Censo Inmobiliario 2025'],
  ['12', 'SDDE: Nota editorial 189, Mascotas (antigua)'], ['13', 'Agronegocios, 2026-04-29: mercado de mascotas'], ['14', 'Infobae, 2026-08-05: 34.000 empresas y $6,1 billones'],
  ['15', 'Wakypet: sitio, inicio'], ['16', 'Wakypet: paseadores de perros'], ['17', 'Wakypet: cómo ser paseador (comisión)'],
  ['18', 'Google Play: Wakypet (ficha; descargas y calificación no usadas)'], ['19', 'Google Play: Paseadores Wakypet'], ['20', 'App Store: mywak'], ['21', 'Mywak: sitio'],
  ['22', 'Pulzo, 2024-02-19: cuánto cobra un paseador'], ['23', 'PetBacker: perfil en Chapinero'], ['24', 'Google Play: PetBacker'], ['27', 'CazVid: oferta de Doggy Walker ($8.000/hora)'],
  ['29', 'Trustpilot: reseñas de Wag!'], ['33', 'Bancolombia: Wompi 2,65 % + $700'], ['34', 'Enter.co: tarifa de Wompi (2.ª fuente)'], ['36', 'AWS Fargate: precios'],
  ['37', 'AWS Elastic Load Balancing: precios'], ['38', 'AWS RDS PostgreSQL: lista de precios'], ['39', 'Portafolio, 2026-10-23: TRM $3.185,01'], ['40', 'ConsultorSalud: SMMLV 2026'],
  ['41', 'Ley 2480 de 2025 (Ley Kiara)'], ['42', 'Decreto 991 de 2026 (Ley 2466)'], ['43', 'DIAN: IVA 19 % (Oficio 1902/2017)'], ['44', 'Ley 1581 de 2012: datos personales'],
  ['45', 'Ley 1480 de 2011: consumidor'], ['48', 'Bogotá: condiciones para paseadores (Res. 061/2019)'], ['49', 'Superads: CPC de Facebook Ads en Colombia'],
  ['R', 'Repositorio de Waggo (R1 a R18): precios, specs y código'],
];
const mitad = Math.ceil(FU.length / 2);
const colFu = (a) => `<table class="tabla" style="font-size:21px"><tbody>${a.map(([n, t]) => `<tr><td class="m" style="width:70px;padding:5px 8px">[${n}]</td><td style="padding:5px 8px">${esc(t)}</td></tr>`).join('')}</tbody></table>`;
lam('Fuentes', `
  ${cab('Apéndice', 'Fuentes numeradas usadas en esta presentación')}
  <div class="cuerpo alto" style="top:195px"><div class="dos" style="gap:36px">${colFu(FU.slice(0, mitad))}${colFu(FU.slice(mitad))}</div></div>
  ${pie('Todas consultadas el 2026-10-28 salvo las fechas indicadas. URL completa de cada [n] en negocio/mercado/fuentes.md. Cifras no usadas por no verificadas: descargas, calificación y reseñas de Wakypet en Google Play; % de estratos de Suba.')}`, [
  'Los números corresponden a la lista de negocio/mercado/fuentes.md. Dato = publicado por la fuente; Cálculo = derivado con fórmula; Supuesto = decisión a validar.',
]);

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Waggo para inversionistas</title>
<meta name="description" content="Presentación para inversionistas de Waggo: producto construido, mercado de Bogotá, economía unitaria, escenarios y plan de piloto, con cada cifra etiquetada como Dato, Cálculo o Supuesto.">
<link rel="icon" href="assets/brand/logo-head.png">
<link rel="stylesheet" href="../_motor/motor.css">
<link rel="stylesheet" href="../_motor/tema.css">
<link rel="stylesheet" href="assets/inversionistas.css">
</head>
<body>
<main class="visor" aria-label="Presentación para inversionistas de Waggo">
  <div class="lienzo">
${L.join('\n')}
  </div>
</main>
<script src="../_motor/motor.js"></script>
</body>
</html>
`;
fs.writeFileSync(path.join(destino, 'index.html'), html);
console.log(`index.html: ${(html.length / 1024).toFixed(0)} KB, ${L.length} láminas`);
