// Extrae marcos individuales (390x844) de las láminas de design/propuesta/pantallas/*.svg.
// Uso: node extraer-pantallas.mjs <carpeta-salida> [archivo--marco ...]
//      sin lista de marcos extrae todos los de 390x844.
// Cada marco sale como SVG independiente con los ids prefijados (para poder incrustar varios en un mismo HTML)
// y con la atribución del mapa corregida: la propuesta dibujaba "mapbox", pero el PO eligió OpenStreetMap.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const origen = path.resolve(aqui, '../../design/propuesta/pantallas');
const salida = path.resolve(process.argv[2] ?? path.join(aqui, 'marcos'));
const pedidos = process.argv.slice(3);

fs.mkdirSync(salida, { recursive: true });

/** Devuelve [{ id, xml }] con cada <svg id="..."> anidado de 390x844 (cuenta anidamiento). */
function marcosDe(texto) {
  const resultado = [];
  const abre = /<svg id="([^"]+)" x="[\d.]+" y="[\d.]+" width="390" height="844"[^>]*>/g;
  let m;
  while ((m = abre.exec(texto)) !== null) {
    let profundidad = 1;
    let pos = abre.lastIndex;
    const re = /<svg\b|<\/svg>/g;
    re.lastIndex = pos;
    let t;
    while ((t = re.exec(texto)) !== null) {
      profundidad += t[0] === '</svg>' ? -1 : 1;
      if (profundidad === 0) {
        resultado.push({ id: m[1], xml: texto.slice(m.index, re.lastIndex) });
        abre.lastIndex = re.lastIndex;
        break;
      }
    }
  }
  return resultado;
}

/** Prefija ids y sus referencias para que no choquen entre marcos. */
function prefijar(xml, prefijo) {
  const ids = new Set([...xml.matchAll(/\bid="([^"]+)"/g)].map((x) => x[1]));
  let r = xml;
  for (const id of ids) {
    const esc = id.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
    r = r.replace(new RegExp(`id="${esc}"`, 'g'), `id="${prefijo}${id}"`);
    r = r.replace(new RegExp(`url\\(#${esc}\\)`, 'g'), `url(#${prefijo}${id})`);
    r = r.replace(new RegExp(`(href|xlink:href)="#${esc}"`, 'g'), `$1="#${prefijo}${id}"`);
  }
  return r;
}

/** La propuesta dibujó la marca "mapbox"; la app usa OpenStreetMap (ADR de mapas, decisión del PO 2026-10-27). */
function atribucionOsm(xml) {
  return xml.replace(
    /<rect x="10" y="([\d.]+)" width="64" height="20" rx="4" fill="([^"]+)"\/><text x="18" y="([\d.]+)"([^>]*)>mapbox<\/text>/g,
    (_, y, relleno, ty, atributos) =>
      `<rect x="10" y="${y}" width="176" height="20" rx="4" fill="${relleno}"/><text x="18" y="${ty}"${atributos.replace('font-weight="700"', 'font-weight="500"')}>© OpenStreetMap contributors</text>`,
  );
}

/** Elementos de la propuesta que la app aún no tiene (calificación, ETA, aviso de cuenta de cobro): se quitan. */
const QUITAR = {
  'dueno-paseo-resumen--terminado-y-pagado': ['RatingCard'],
  'paseador-paseo-asignado--camino-a-la-recogida': ['EtaLabel'],
  'paseador-ganancias-tab--con-ganancias': ['Banner/info'],
};

/** Textos de la propuesta que difieren del texto vigente de la app (waggo-mobile/src), corregidos al de la app. */
const TEXTOS = {
  'comun-paseo-emergencia--confirmar-paseador': [['Avisaremos de inmediato a Valentina', 'Avisaremos de inmediato al dueño']],
  'comun-paseo-emergencia--enviada-paseador': [['Escribir a Valentina', 'Escribir al dueño']],
  'paseador-paseo-en-curso--compartiendo-ubicacion': [['Tócalo al entregar a Luna en casa.', 'Tócalo al entregar a los perros en la recogida.']],
  'paseador-paseo-en-curso--confirmar-terminar': [['Tócalo al entregar a Luna en casa.', 'Tócalo al entregar a los perros en la recogida.']],
};

/** Quita un <g id="...sufijo"> completo contando anidamiento. */
function quitarGrupo(xml, sufijo) {
  const pos = xml.indexOf(`${sufijo}"`);
  if (pos < 0) return xml;
  const inicio = xml.lastIndexOf('<g id="', pos);
  let profundidad = 0;
  let i = inicio;
  while (i < xml.length) {
    const cierre = xml.indexOf('</g>', i);
    let apertura = xml.indexOf('<g', i);
    while (apertura >= 0 && !/[ >]/.test(xml[apertura + 2])) apertura = xml.indexOf('<g', apertura + 1);
    if (apertura >= 0 && apertura < cierre) {
      profundidad++;
      i = apertura + 2;
    } else {
      profundidad--;
      i = cierre + 4;
      if (profundidad === 0) return xml.slice(0, inicio) + xml.slice(i);
    }
  }
  return xml;
}

const defsComunes =
  '<defs><filter id="shCard" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#16212E" flood-opacity="0.10"/></filter>' +
  '<filter id="shSheet" x="-10%" y="-20%" width="120%" height="140%"><feDropShadow dx="0" dy="-4" stdDeviation="12" flood-color="#16212E" flood-opacity="0.16"/></filter>' +
  '<filter id="shFab" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#16212E" flood-opacity="0.22"/></filter></defs>';

let escritos = 0;
for (const archivo of fs.readdirSync(origen).filter((f) => f.endsWith('.svg'))) {
  const base = archivo.replace(/\.svg$/, '');
  const texto = fs.readFileSync(path.join(origen, archivo), 'utf8');
  for (const { id, xml } of marcosDe(texto)) {
    if (pedidos.length && !pedidos.includes(id)) continue;
    const prefijo = `${id}__`;
    let interior = xml.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    interior = atribucionOsm(interior);
    for (const sufijo of QUITAR[id] ?? []) interior = quitarGrupo(interior, sufijo);
    for (const [de, a] of TEXTOS[id] ?? []) interior = interior.replace('>' + de + '<', '>' + a + '<');
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 390 844" width="390" height="844" role="img" data-marco="${id}">` +
      prefijar(defsComunes + interior, prefijo) +
      '</svg>';
    fs.writeFileSync(path.join(salida, `${id}.svg`), svg);
    escritos++;
  }
}
console.log(`${escritos} marcos escritos en ${salida}`);
