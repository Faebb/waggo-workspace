// Genera presentaciones/tecnica/index.html. Uso: node construir-tecnica.mjs
// Todas las cifras de CIFRAS se contaron del repositorio el 2026-10-28; el comando de cada una está en tecnica/guion.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const destino = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../tecnica');

const CIFRAS = {
  specs: 21, specsImpl: 18, specsLista: 1, specsProgreso: 1, specsBorrador: 1,
  agentes: 13, agentesTdd: 6, skills: 7, checklists: 2, hooks: 1,
  endpoints: 44, migraciones: 19, modulos: 9, features: 14,
  pruebasApi: 626, pruebasApiFact: 553, pruebasApiTheory: 73, inlineData: 183, archivosPruebaApi: 114,
  pruebasMovil: 466, archivosPruebaMovil: 95,
  lineasApi: 11134, lineasPruebasApi: 11024, lineasMovil: 10907, lineasPruebasMovil: 7264,
  commits: 82, commitsApi: 36, commitsMovil: 24, commitsWs: 22, conClaude: 68, conClaudeApi: 31, conClaudeMovil: 21, conClaudeWs: 16,
  adrCitados: 18,
};
const PRUEBAS_POR_PROYECTO = [
  ['Domain.UnitTests', 164], ['Api.IntegrationTests', 171], ['Application.UnitTests', 162],
  ['Api.UnitTests', 75], ['Infrastructure.UnitTests', 47], ['ArchitectureTests', 7],
];
const COMMITS_POR_TIPO = [['feat', 38], ['docs', 23], ['refactor', 6], ['chore', 6], ['ci', 4], ['fix', 2], ['style', 2], ['build', 1]];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const notas = (arr) => `<aside class="notas">${arr.map((n) => `<p>${n}</p>`).join('')}</aside>`;
const cab = (eyebrow, titulo) => `<header class="cab"><span class="eyebrow">${eyebrow}</span><h2 class="titulo">${titulo}</h2></header><div class="marca-esq"><span class="medalla"><img src="assets/brand/logo-head.png" alt=""></span>Waggo</div>`;
const pie = (t) => `<p class="pie-fuente">${t}</p>`;

/* ---------- Ayudas de SVG ---------- */
const lin = (x, y, txt, cls, lh = 30) =>
  String(txt).split('\n').map((l, i) => `<text x="${x}" y="${y + i * lh}" class="${cls}" text-anchor="middle">${esc(l)}</text>`).join('');
function caja(x, y, w, h, t, s = '', cls = '') {
  const nt = String(t).split('\n').length;
  const ns = s ? String(s).split('\n').length : 0;
  const total = nt * 32 + ns * 26;
  const y0 = y + (h - total) / 2 + 26;
  return `<g class="d-caja ${cls}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16"/>${lin(x + w / 2, y0, t, 'd-t', 32)}${s ? lin(x + w / 2, y0 + nt * 32 - 2, s, 'd-s', 26) : ''}</g>`;
}
const flecha = (d, cls = '') => `<path d="${d}" class="d-f ${cls}" marker-end="url(#fl)"/>`;
const defs = (n) => `<defs><marker id="fl${n}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="d-marca"/></marker></defs>`;
let nSvg = 0;
const svg = (w, h, inner, desc) => { nSvg++; return `<svg class="diagrama" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(desc)}">${defs(nSvg)}${inner.split('url(#fl)').join(`url(#fl${nSvg})`)}</svg>`; };

function barras(datos, { ancho = 760, alto = 46, sep = 18, clase = 'd-barra', maxv, etqAncho = 330 } = {}) {
  const m = maxv ?? Math.max(...datos.map((d) => d[1]));
  const h = datos.length * (alto + sep);
  const largo = ancho - etqAncho - 90;
  const filas = datos.map(([n, v, c], i) => {
    const y = i * (alto + sep);
    const w = Math.max(6, (v / m) * largo);
    return `<text x="${etqAncho - 14}" y="${y + alto / 2 + 9}" class="d-s" style="font-size:25px;fill:var(--texto)" text-anchor="end">${esc(n)}</text><rect x="${etqAncho}" y="${y}" width="${w}" height="${alto}" rx="8" class="${c || clase}"/><text x="${etqAncho + w + 12}" y="${y + alto / 2 + 10}" class="d-t" style="font-size:28px">${v.toLocaleString('es-CO')}</text>`;
  }).join('');
  return `<svg class="diagrama" viewBox="0 0 ${ancho} ${h}" role="img" aria-label="Gráfico de barras: ${datos.map((d) => `${d[0]} ${d[1]}`).join(', ')}">${filas}</svg>`;
}

const L = [];
const lam = (titulo, cuerpo, notasArr, { oscuro = false, pasos = 0, zafiro = false } = {}) =>
  L.push(`<section class="lamina${oscuro ? ' oscuro' : ''}${zafiro ? ' zafiro' : ''}" data-titulo="${titulo}"${pasos ? ` data-pasos="${pasos}"` : ''}><div class="contenido-lamina">${cuerpo}</div>${notas(notasArr)}</section>`);

/* 1. Portada */
lam('Waggo por dentro', `
  <div style="position:absolute;inset:0;background:#3059a4"></div>
  <span class="medalla" style="position:absolute;left:130px;top:150px;width:300px;height:300px"><img src="assets/brand/logo-head.png" alt="Waggo"></span>
  <div style="position:absolute;left:520px;top:0;bottom:0;width:1300px;display:flex;flex-direction:column;justify-content:center;gap:28px;color:#fff">
    <span class="eyebrow" style="color:#e6eefb">Arquitectura y metodología</span>
    <h1 class="titulo-grande" style="font-size:112px;color:#fff">Waggo por dentro</h1>
    <p class="texto-grande" style="color:#e6eefb;max-width:1100px">Cómo está construido el producto y cómo se trabaja con inteligencia artificial y desarrollo guiado por especificaciones (SDD).</p>
    <p class="pequeno" style="color:#e6eefb">Cifras contadas del repositorio el 28 de octubre de 2026 · cada lámina dice cómo.</p>
  </div>`, [
  'Presentación para un público técnico: arquitectura, decisiones, calidad y la forma de trabajar con IA. Cada cifra se contó con un comando sobre los repositorios; el guion.md de esta carpeta lista el comando de cada una.',
  'Alcance: lo que existe hoy en los tres repositorios (waggo-api, waggo-mobile, waggo-workspace). El vault de Obsidian con los ADR no estaba disponible al preparar esto, así que las decisiones se citan desde specs, CLAUDE.md y AGENTS.md.',
], { zafiro: true });

/* 2. Qué es Waggo */
lam('Qué es Waggo y de qué se compone', `
  ${cab('El producto', 'Un producto, tres repositorios y un vault')}
  <div class="cuerpo">
    <div class="dos" style="gap:60px">
      <div>
        <p class="texto" style="margin-bottom:26px">Waggo conecta dueños de perros con paseadores verificados: el dueño pide el paseo, lo sigue en vivo por GPS y paga cuando termina bien.</p>
        <ul class="lista">
          <li><span><b>waggo-api</b> · .NET 10, Clean Architecture, PostgreSQL + PostGIS</span></li>
          <li><span><b>waggo-mobile</b> · Expo SDK 57 · iOS, Android y web</span></li>
          <li><span><b>waggo-workspace</b> · specs, agentes, skills y reglas (sin código de producto)</span></li>
          <li><span><b>Vault Waggo</b> · Obsidian: requisitos, arquitectura y ADR</span></li>
        </ul>
      </div>
      <div class="tres" style="grid-template-columns:1fr 1fr;gap:34px 28px">
        <div class="dato"><span class="n">${CIFRAS.endpoints}</span><span class="e">endpoints en ${CIFRAS.modulos} módulos</span></div>
        <div class="dato"><span class="n">${CIFRAS.features}</span><span class="e">features en la app móvil</span></div>
        <div class="dato"><span class="n">${CIFRAS.specs}</span><span class="e">specs, ${CIFRAS.specsImpl} ya implementadas</span></div>
        <div class="dato"><span class="n">${CIFRAS.migraciones}</span><span class="e">migraciones de base de datos</span></div>
      </div>
    </div>
  </div>
  ${pie('<b>Cómo se contó:</b> endpoints = llamadas MapGet/MapPost/MapPut en waggo-api/Waggo.Api; módulos = carpetas de Waggo.Api/Endpoints; features = carpetas de waggo-mobile/src/features; specs = archivos de specs/ sin plantilla, README ni borrador de ADR; migraciones = archivos de Migrations sin Designer ni Snapshot.')}`, [
  'Cada repositorio tiene su historial de Git; el workspace los une con specs, agentes y reglas. Esa separación es el ADR-001.',
  'Las cifras de la derecha salen de comandos (grep y ls) sobre los repositorios; están en el guion.',
]);

/* 3. Arquitectura general (diagrama) */
lam('Arquitectura general', `
  ${cab('Arquitectura', 'Cómo se despliega hoy en AWS')}
  <div class="cuerpo alto" style="top:215px">
    ${svg(1700, 700, `
      ${caja(0, 270, 270, 130, 'Usuario', 'navegador o app Expo')}
      ${caja(380, 30, 340, 100, 'CloudFront', 'app.mywaggo.com')}
      ${caja(840, 30, 340, 100, 'S3', 'build web de Expo')}
      ${caja(1300, 30, 340, 100, 'OpenStreetMap', 'tiles y Nominatim', 'sutil')}
      ${caja(380, 250, 340, 170, 'API .NET 10', 'ECS Fargate tras un ALB\napi.mywaggo.com', 'ia')}
      ${caja(840, 250, 340, 170, 'PostgreSQL 17', 'RDS privada + PostGIS', 'ia')}
      ${caja(1300, 230, 340, 90, 'Amazon SES', 'correos de la cuenta')}
      ${caja(1300, 350, 340, 90, 'Secrets Manager', 'secretos fuera del repo')}
      ${caja(380, 540, 340, 110, 'ECR', 'imagen Docker de la API')}
      ${caja(840, 540, 340, 110, 'GitHub Actions', 'OIDC → ECR y S3', 'po')}
      ${flecha('M270 300 C320 300 320 80 380 80')}
      ${flecha('M720 80 L840 80')}
      ${flecha('M270 335 L380 335')}
      ${flecha('M720 335 L840 335')}
      ${flecha('M600 250 C600 190 1240 185 1300 255')}
      ${flecha('M650 420 C650 500 1240 500 1300 395')}
            ${flecha('M840 595 L720 595')}
      ${flecha('M550 540 L550 420')}
      ${flecha('M135 270 L135 6 L1470 6 L1470 30', 'punteada')}
    `, 'Diagrama: el usuario entra por CloudFront y S3 para la web y por un ALB a la API en ECS Fargate; la API usa PostgreSQL con PostGIS, SES y Secrets Manager; GitHub Actions publica la imagen en ECR y la web en S3; la app consulta OpenStreetMap.')}
  </div>
  ${pie('<b>Fuente:</b> specs/INF-001-despliegue-publico-en-aws.md (estado Implementada, ADR-020). Comprobado el 2026-10-28: https://app.mywaggo.com responde 200 y https://api.mywaggo.com/health/ready responde 200.')}`, [
  'Un solo ambiente: producción del piloto. La web se publica como estáticos en S3 detrás de CloudFront; la API corre como contenedor en ECS Fargate con el ALB delante.',
  'La base es RDS PostgreSQL 17 en subred privada con PostGIS. Los secretos viven en Secrets Manager y la autenticación de GitHub a AWS es por OIDC, sin claves guardadas.',
  'Las apps nativas de iOS y Android no están en este despliegue: la spec las deja fuera de alcance (EAS Build, fase CD-3).',
]);

/* 4. API: capas */
lam('API: Clean Architecture', `
  ${cab('waggo-api', 'Clean Architecture con la regla verificada por pruebas')}
  <div class="cuerpo alto" style="top:215px">
    <div class="dos" style="grid-template-columns:900px 1fr;gap:50px">
      ${svg(900, 700, `
        ${caja(0, 0, 640, 140, 'Waggo.Api', 'Endpoints mínimos, middleware, autenticación', 'po')}
        ${caja(0, 190, 640, 140, 'Waggo.Infrastructure', 'EF Core, SES, JWT, repositorios')}
        ${caja(0, 380, 640, 140, 'Waggo.Application', 'Casos de uso, validadores, puertos', 'ia')}
        ${caja(0, 570, 640, 130, 'Waggo.Domain', 'Entidades, errores, reglas. Sin dependencias', 'verde')}
        ${flecha('M320 140 L320 190')}${flecha('M320 330 L320 380')}${flecha('M320 520 L320 570')}
        <text x="680" y="170" class="d-s">depende de</text>
        <text x="680" y="360" class="d-s">depende de</text>
        <text x="680" y="550" class="d-s">depende de</text>
      `, 'Cuatro capas: Api depende de Infrastructure, que depende de Application, que depende de Domain.')}
      <div>
        <p class="texto" style="margin-bottom:22px">La regla <b>Api → Infrastructure → Application → Domain</b> no es solo una convención: la comprueban pruebas de arquitectura (NetArchTest) que fallan si se rompe.</p>
        <ul class="lista">
          <li><span><b>4 proyectos</b> de producción y <b>6</b> de pruebas</span></li>
          <li><span>Cada caso de uso es un <b>Command o Query + Handler + Validator</b>, sin MediatR ni AutoMapper</span></li>
          <li><span>Todo devuelve <b>WaggoResponse&lt;T&gt;</b> con errores, avisos e información</span></li>
          <li><span>Carpetas por tipo y por módulo (ADR-012): ${CIFRAS.modulos} módulos de endpoints</span></li>
        </ul>
      </div>
    </div>
  </div>
  ${pie('<b>Fuente:</b> waggo-api/CLAUDE.md, waggo-api/Tests/Waggo.ArchitectureTests/LayerTests.cs, Directory.Packages.props. Proyectos = carpetas Waggo.* (4) y Tests/* (6).')}`, [
  'LayerTests.cs verifica que Domain no dependa de otras capas ni de EF Core o ASP.NET, que Application no dependa de Infrastructure ni de Api, y que los handlers sean sealed y no públicos. Son 7 pruebas de arquitectura.',
  'La decisión de no usar MediatR, AutoMapper ni FluentAssertions está en ADR-006; las pruebas usan Shouldly y NSubstitute.',
]);

/* 5. Una petición de punta a punta */
lam('Una petición de punta a punta', `
  ${cab('waggo-api', 'Una emergencia, de la petición a la respuesta')}
  <div class="cuerpo alto" style="top:215px">
    ${svg(1700, 190, `
      ${caja(0, 20, 300, 130, 'Endpoint', 'POST …/emergency', 'po')}
      ${caja(350, 20, 280, 130, 'Validador 1', 'del DTO (Request.*)')}
      ${caja(680, 20, 280, 130, 'Handler', 'RaiseEmergencyHandler', 'ia')}
      ${caja(1010, 20, 330, 130, 'Validador 2 y dominio', 'reglas de negocio')}
      ${caja(1390, 20, 310, 130, 'WaggoApiResponse', 'success, data, errors[]', 'verde')}
      ${flecha('M300 85 L350 85')}${flecha('M630 85 L680 85')}${flecha('M960 85 L1010 85')}${flecha('M1340 85 L1390 85')}
    `, 'Flujo de una petición: endpoint, validador del DTO, handler, validador de negocio y dominio, respuesta WaggoApiResponse.')}
    <div class="dos" style="margin-top:34px;gap:40px">
      <div>
        <span class="rotulo-codigo">RaiseEmergencyHandler.cs <span>(fragmento)</span></span>
        <pre class="codigo"><span class="k">if</span> (walk.Status <span class="k">is not</span> (WalkStatus.Accepted
    <span class="k">or</span> WalkStatus.InProgress))
{
    response.AddError(<span class="v">AlertErrors.WalkNotActive</span>);
    <span class="k">return</span> response;
}</pre>
      </div>
      <div>
        <span class="rotulo-codigo">AlertErrors.cs <span>(catálogo de errores del dominio)</span></span>
        <pre class="codigo"><span class="k">public static readonly</span> Error WalkNotActive = <span class="k">new</span>(
    <span class="a">"Alerts.WalkNotActive"</span>,
    <span class="a">"Solo puedes reportar una emergencia en un
     paseo aceptado o en curso."</span>,
    ErrorType.BusinessRule);</pre>
      </div>
    </div>
    <p class="texto" style="margin-top:30px">Un error de negocio esperado se <b>acumula</b> en la respuesta (código <code>Alerts.WalkNotActive</code>, HTTP 422); si la operación no puede seguir, se lanza una excepción propia que el middleware traduce, sin exponer el detalle técnico.</p>
  </div>
  ${pie('<b>Fuente:</b> waggo-api/Waggo.Application/Tracking/Commands/RaiseEmergency/RaiseEmergencyHandler.cs y Waggo.Domain/Errors/Tracking/AlertErrors.cs (fragmentos reales); waggo-api/CLAUDE.md (ADR-007, ADR-009, ADR-010).')}`, [
  'Este es el fragmento real que implementa el ejemplo 5 de la spec RF-012 (levantar una emergencia en un paseo que nadie ha aceptado devuelve 422 Alerts.WalkNotActive).',
  'Validación en dos capas (ADR-009): el DTO se valida en la frontera de la API con códigos Request.Required y Request.InvalidValue; las reglas de negocio se validan en Application con códigos del módulo.',
  'Los mensajes públicos están en español y explican cómo corregir; el código y los comentarios están en inglés.',
]);

/* 6. Datos y mapas */
lam('Datos y mapas', `
  ${cab('Datos', 'PostgreSQL + PostGIS y mapas abiertos')}
  <div class="cuerpo alto" style="top:215px">
    <div class="dos" style="gap:50px">
      <div class="tarjeta"><h3>PostgreSQL + PostGIS</h3>
        <ul class="lista" style="gap:12px">
          <li><span>EF Core con <b>snake_case</b> y un esquema por módulo</span></li>
          <li><span><b>${CIFRAS.migraciones} migraciones</b>; se aplican al iniciar solo en Development y Testing</span></li>
          <li><span>Matching por cercanía en la base: solicitudes a menos de <b>5 km</b>, orden por distancia real y índice GiST (RF-006)</span></li>
          <li><span>Documento del paseador y notas médicas <b>cifrados</b> en la base</span></li>
          <li><span>Pruebas de integración contra <b>PostgreSQL real</b> (Testcontainers), nunca SQLite ni InMemory</span></li>
        </ul>
      </div>
      <div class="tarjeta"><h3>Mapas con OpenStreetMap</h3>
        <ul class="lista" style="gap:12px">
          <li><span>Decisión del PO (2026-10-27): <b>OpenStreetMap</b>, sin claves ni costo de licencia</span></li>
          <li><span>Un componente <b>WaggoMap</b>: Leaflet dentro de WebView (móvil) o iframe (web)</span></li>
          <li><span>Mensajes app ↔ mapa <b>tipados y validados con Zod</b></span></li>
          <li><span>Búsqueda de direcciones con <b>Nominatim</b>: máx. 1 petición por segundo y solo al enviar</span></li>
          <li><span>Atribución «© OpenStreetMap contributors» siempre visible</span></li>
        </ul>
      </div>
    </div>
  </div>
  ${pie('<b>Fuente:</b> waggo-api/CLAUDE.md, specs/RF-006-matching-por-cercania.md, specs/_adr-borrador-mapas-openstreetmap.md (borrador de ADR: aún no pasó al vault), .claude/rules/mobile-checklist.md. Los tiles públicos de OSM son solo para desarrollo y piloto.')}`, [
  'El radio de 5 km y el orden por distancia son de la spec RF-006 y están marcados como provisionales.',
  'El borrador del ADR de mapas documenta las alternativas descartadas: Mapbox, Google Maps y OSM con react-native-maps. Pendiente: pasarlo al vault como ADR numerado.',
]);

/* 7. App móvil */
lam('App móvil', `
  ${cab('waggo-mobile', 'Expo y React Native, organizada por features')}
  <div class="cuerpo alto" style="top:215px">
    <div class="dos" style="grid-template-columns:860px 1fr;gap:50px">
      ${svg(860, 640, `
        ${caja(0, 0, 860, 110, 'src/app', 'Rutas de Expo Router: finas', 'po')}
        ${caja(0, 160, 860, 250, 'src/features/<feature>', 'api · hooks · components · screens · model', 'ia')}
        ${caja(0, 460, 860, 110, 'src/shared', 'api (httpClient + Zod) · ui (theme.ts) · map')}
        ${flecha('M430 110 L430 160')}${flecha('M430 410 L430 460')}
        <text x="20" y="340" class="d-s">admin · auth · home · messaging · notifications · onboarding · payments</text>
        <text x="20" y="370" class="d-s">pets · places · pricing · profile · tracking · walker · walks</text>
      `, 'Capas de la app: rutas finas en src/app, features en src/features y piezas compartidas en src/shared.')}
      <ul class="lista">
        <li><span><b>Expo SDK 57</b>, React Native 0.86, React 19 y TypeScript</span></li>
        <li><span>Una feature solo se importa por su <b>index.ts</b>; ESLint bloquea los atajos</span></li>
        <li><span>Llamadas a la API por <b>httpClient + esquema Zod</b>; los errores llegan como ApiError</span></li>
        <li><span><b>TanStack Query</b> para el estado del servidor</span></li>
        <li><span>Solo tokens de <b>theme.ts</b>: Seashell &amp; Sapphire, Baloo 2 e Inter (ADR-018)</span></li>
        <li><span>${CIFRAS.features} features, una por dominio</span></li>
      </ul>
    </div>
  </div>
  ${pie('<b>Fuente:</b> waggo-mobile/package.json (versiones), waggo-mobile/AGENTS.md y .claude/rules/mobile-checklist.md; features = carpetas de waggo-mobile/src/features.')}`, [
  'Las rutas en src/app son delgadas; la lógica vive en las features. La regla de importar solo por index.ts la hace cumplir ESLint.',
  'El tema claro es el predeterminado y el oscuro se activa con un interruptor (ADR-015). Todos los colores y tamaños salen de theme.ts.',
]);

/* 8. Despliegue y CI/CD */
lam('CI/CD', `
  ${cab('Entrega continua', 'De un pull request a producción, sin pasos manuales')}
  <div class="cuerpo alto" style="top:215px">
    ${svg(1700, 560, `
      <text x="0" y="24" class="d-n">1 · En el pull request (CI)</text>
      ${caja(0, 50, 250, 110, 'Formato', 'dotnet format · Prettier')}
      ${caja(300, 50, 250, 110, 'Compilar', 'advertencias = error')}
      ${caja(600, 50, 250, 110, 'Pruebas', 'unitarias y de arquitectura')}
      ${caja(900, 50, 250, 110, 'Integración', 'PostgreSQL en Docker')}
      ${caja(1200, 50, 250, 110, 'Imagen', 'docker build')}
      ${caja(1500, 50, 200, 110, 'Merge', 'squash a main', 'po')}
      ${flecha('M250 105 L300 105')}${flecha('M550 105 L600 105')}${flecha('M850 105 L900 105')}${flecha('M1150 105 L1200 105')}${flecha('M1450 105 L1500 105')}
      <text x="0" y="274" class="d-n">2 · Al llegar a main (deploy de la API)</text>
      ${caja(0, 300, 250, 110, 'OIDC', 'sin claves en GitHub')}
      ${caja(300, 300, 250, 110, 'ECR', 'imagen con el SHA')}
      ${caja(600, 300, 250, 110, 'Migraciones', 'tarea ECS de un uso')}
      ${caja(900, 300, 250, 110, 'Servicio ECS', 'actualización gradual')}
      ${caja(1200, 300, 250, 110, 'Prueba de humo', 'GET /health/ready')}
      ${caja(1500, 300, 200, 110, 'En línea', 'api.mywaggo.com', 'verde')}
      ${flecha('M250 355 L300 355')}${flecha('M550 355 L600 355')}${flecha('M850 355 L900 355')}${flecha('M1150 355 L1200 355')}${flecha('M1450 355 L1500 355')}
      <text x="0" y="474" class="d-s" style="font-size:25px;fill:var(--texto)">Web: expo export → S3 → invalidación de CloudFront. Reversa de la API: volver a desplegar un SHA anterior (workflow manual).</text>
    `, 'Dos filas: el CI del pull request (formato, compilación, pruebas, integración, imagen, merge) y el deploy al llegar a main (OIDC, ECR, migraciones, ECS, prueba de humo).')}
  </div>
  ${pie('<b>Fuente:</b> waggo-api/.github/workflows/ci.yml y deploy.yml, waggo-mobile/.github/workflows/ci.yml, specs/INF-001. Los workflows de CI existen en los dos repos; el título del PR se valida con pr-title.yml (Conventional Commits).')}`, [
  'CI de la API: restore, dotnet format whitespace --verify-no-changes, build en Release (advertencias como error), pruebas unitarias y de arquitectura con cobertura, pruebas de integración con Testcontainers y docker build.',
  'CI de la app: typecheck, Prettier, ESLint y Jest con cobertura (umbrales 80 % líneas y funciones, 70 % ramas).',
  'El deploy corre en cada merge a main. La migración de base de datos corre como tarea de un solo uso antes de actualizar el servicio.',
]);

/* 9. Decisiones: ADR */
lam('Decisiones de arquitectura', `
  ${cab('Decisiones', 'Las decisiones quedan escritas como ADR')}
  <div class="cuerpo alto" style="top:215px">
    <table class="tabla">
      <tr><th style="width:130px">ADR</th><th>Decisión</th><th style="width:280px">Dónde se aplica</th></tr>
      <tr><td class="m">ADR-001</td><td>Repositorios de producto separados y un workspace de coordinación</td><td>README del workspace</td></tr>
      <tr><td class="m">ADR-006</td><td>Sin MediatR, AutoMapper ni FluentAssertions: handlers propios y Shouldly</td><td>waggo-api</td></tr>
      <tr><td class="m">ADR-007</td><td>Toda operación devuelve WaggoResponse&lt;T&gt;; el endpoint escribe los logs</td><td>waggo-api</td></tr>
      <tr><td class="m">ADR-008</td><td>Convenciones de código, impuestas por la compilación</td><td>.editorconfig</td></tr>
      <tr><td class="m">ADR-009/010</td><td>Validación en dos capas; errores acumulables o excepciones propias</td><td>waggo-api</td></tr>
      <tr><td class="m">ADR-011</td><td>OAuth 2.0 con JWT y roles owner, walker y admin</td><td>waggo-api</td></tr>
      <tr><td class="m">ADR-012</td><td>Dónde va cada archivo (carpetas por tipo y por módulo)</td><td>backend-checklist</td></tr>
      <tr><td class="m">ADR-016/017</td><td>Identidad propia con bcrypt y JWT; login sin 2FA obligatorio y federación OAuth</td><td>specs de identidad</td></tr>
      <tr><td class="m">ADR-018/019</td><td>Seashell &amp; Sapphire (reemplaza ADR-013); pestañas del paseador</td><td>waggo-mobile</td></tr>
      <tr><td class="m">ADR-020</td><td>Despliegue público en AWS</td><td>INF-001</td></tr>
    </table>
  </div>
  ${pie(`<b>Cómo se contó:</b> los repos citan ${CIFRAS.adrCitados} identificadores ADR distintos (ADR-001, 002, 005 a 020). El vault de Obsidian, donde están los textos completos, no estaba disponible al preparar esta presentación: los títulos son los que aparecen en CLAUDE.md, AGENTS.md y las specs; no se verificó cuántos ADR existen en el vault.`)}`, [
  'Regla del proyecto: si una regla falta o está mal, se propone un ADR con /new-adr en lugar de improvisar. Cuando una decisión cambia una regla, se actualizan en el mismo cambio el vault, CLAUDE.md/AGENTS.md y los checklists.',
  'Honestidad: ADR-002, 005 y 014 se citan en los repos pero no se pudo leer su título sin el vault. El de mapas con OpenStreetMap sigue en borrador dentro de specs/.',
]);

/* 10. Calidad: pruebas */
lam('Calidad: pruebas', `
  ${cab('Calidad', 'Casi tanto código de pruebas como de producción')}
  <div class="cuerpo alto" style="top:215px">
    <div class="dos" style="grid-template-columns:1fr 1fr;gap:56px">
      <div>
        <span class="rotulo-codigo">waggo-api · ${CIFRAS.pruebasApi} métodos de prueba <span>(${CIFRAS.pruebasApiFact} [Fact] + ${CIFRAS.pruebasApiTheory} [Theory], ${CIFRAS.inlineData} casos [InlineData])</span></span>
        ${barras(PRUEBAS_POR_PROYECTO.map(([n, v]) => [n, v]), { ancho: 800, alto: 38, sep: 16, etqAncho: 300 })}
      </div>
      <div>
        <div class="tres" style="grid-template-columns:1fr 1fr;gap:22px 24px;margin-bottom:26px">
          <div class="dato"><span class="n">${CIFRAS.pruebasMovil}</span><span class="e">pruebas en la app (Jest + RNTL) en ${CIFRAS.archivosPruebaMovil} archivos</span></div>
          <div class="dato"><span class="n">${CIFRAS.archivosPruebaApi}</span><span class="e">archivos de prueba en la API</span></div>
        </div>
        <span class="rotulo-codigo">Líneas de código <span>(producción vs pruebas)</span></span>
        ${barras([
          ['API producción', CIFRAS.lineasApi], ['API pruebas', CIFRAS.lineasPruebasApi, 'd-barra b2'],
          ['App producción', CIFRAS.lineasMovil], ['App pruebas', CIFRAS.lineasPruebasMovil, 'd-barra b2'],
        ], { ancho: 800, alto: 36, sep: 14, etqAncho: 230 })}
      </div>
    </div>
  </div>
  ${pie('<b>Cómo se contó:</b> API = líneas [Fact]/[Theory] bajo Tests/ (grep); App = llamadas it()/test() en *.test.ts(x) (95 archivos; 10 usan .each, que ejecutan varios casos); líneas = suma de .cs sin Migrations ni bin/obj, y .ts/.tsx de src. No se ejecutó la suite: son métodos de prueba, no ejecuciones.')}`, [
  'Contamos métodos de prueba definidos, no ejecuciones: un [Theory] con varios [InlineData] se ejecuta varias veces, así que las ejecuciones reales de la API son más que 626.',
  'La app exige cobertura mínima en CI: 80 % de líneas y funciones y 70 % de ramas (jest coverageThreshold).',
  'Las pruebas de integración usan Testcontainers con PostgreSQL real y el encabezado X-Dev-Roles para probar los roles.',
]);

/* 11. Convenciones impuestas por la compilación */
lam('Convenciones impuestas', `
  ${cab('Calidad', 'Las reglas no se piden: la compilación las exige')}
  <div class="cuerpo alto" style="top:215px">
    <div class="dos" style="gap:50px">
      <div>
        <span class="rotulo-codigo">Directory.Build.props <span>(fragmento real)</span></span>
        <pre class="codigo">&lt;TreatWarningsAsErrors&gt;<span class="v">true</span>&lt;/TreatWarningsAsErrors&gt;
&lt;AnalysisLevel&gt;latest-recommended&lt;/AnalysisLevel&gt;
&lt;EnforceCodeStyleInBuild&gt;<span class="v">true</span>&lt;/EnforceCodeStyleInBuild&gt;
&lt;Nullable&gt;enable&lt;/Nullable&gt;</pre>
        <span class="rotulo-codigo" style="margin-top:22px">.editorconfig <span>(fragmento real)</span></span>
        <pre class="codigo"><span class="c"># var: nunca</span>
csharp_style_var_elsewhere = false:<span class="r">warning</span>
csharp_prefer_braces = true:<span class="r">warning</span>
dotnet_style_namespace_match_folder = true:<span class="r">warning</span></pre>
      </div>
      <ul class="lista">
        <li><span><b>API:</b> sin <code>var</code>, llaves siempre, namespace = carpeta, un tipo por archivo; si falla, no compila</span></li>
        <li><span><b>CI:</b> <code>dotnet format --verify-no-changes</code> y paquetes con vulnerabilidades rompen el build</span></li>
        <li><span><b>Arquitectura:</b> pruebas NetArchTest vigilan las capas</span></li>
        <li><span><b>App:</b> ESLint (sin <code>any</code>, solo exportaciones con nombre, imports de features por index.ts), Prettier y <code>tsc --noEmit</code></span></li>
        <li><span><b>Commits:</b> título del PR en Conventional Commits, validado por un workflow</span></li>
      </ul>
    </div>
  </div>
  ${pie('<b>Fuente:</b> waggo-api/Directory.Build.props y .editorconfig (fragmentos reales), .github/workflows/ci.yml y pr-title.yml, waggo-mobile/AGENTS.md, .claude/rules/*.md.')}`, [
  'La idea es que ni una persona ni una IA tengan que acordarse de las reglas: si no se cumplen, el build o el CI falla. Por eso las convenciones están en .editorconfig con severidad warning y TreatWarningsAsErrors activado.',
]);

/* 12. SDD: el ciclo */
lam('Desarrollo guiado por especificaciones', `
  ${cab('Metodología', 'Spec → pruebas → código → revisión')}
  <div class="cuerpo alto" style="top:215px">
    ${svg(1700, 520, `
      ${caja(0, 40, 230, 130, 'RF en el vault', 'qué se necesita')}
      ${caja(280, 40, 230, 130, 'Spec', 'ejemplos + contrato', 'ia')}
      ${caja(560, 40, 230, 130, 'PO aprueba', 'estado Lista', 'po')}
      ${caja(840, 40, 230, 130, 'Pruebas', 'rojas, de la tabla', 'roja')}
      ${caja(1120, 40, 230, 130, 'Código', 'mínimo, en verde', 'verde')}
      ${caja(1400, 40, 300, 130, 'Refactor', 'mismo comportamiento', 'ia')}
      ${flecha('M230 105 L280 105')}${flecha('M510 105 L560 105')}${flecha('M790 105 L840 105')}${flecha('M1070 105 L1120 105')}${flecha('M1350 105 L1400 105')}
      ${caja(1400, 280, 300, 130, 'Revisión', 'ADR, capas, DoD', 'ia')}
      ${caja(1050, 280, 300, 130, 'Docs y PR', 'trazabilidad, squash', 'ia')}
      ${caja(700, 280, 300, 130, 'Implementada', 'spec actualizada', 'verde')}
      ${flecha('M1550 170 L1550 280')}${flecha('M1400 345 L1350 345')}${flecha('M1050 345 L1000 345')}
      <g class="d-caja po"><rect x="0" y="300" width="36" height="36" rx="8"/></g><text x="52" y="328" class="d-s" style="fill:var(--texto)">decide el PO</text>
      <g class="d-caja ia"><rect x="260" y="300" width="36" height="36" rx="8"/></g><text x="312" y="328" class="d-s" style="fill:var(--texto)">lo hace la IA</text>
      <text x="0" y="470" class="d-s" style="font-size:25px;fill:var(--texto)">Sin spec en estado Lista no hay código de producto para ese requerimiento.</text>
    `, 'Ciclo: requerimiento en el vault, spec con ejemplos, aprobación del PO, pruebas rojas, código verde, refactor, revisión, documentación y PR, spec implementada.')}
  </div>
  ${pie('<b>Fuente:</b> CLAUDE.md del workspace («How work flows here»), specs/README.md (ciclo de vida), .claude/skills/implement-spec/SKILL.md.')}`, [
  'Tres reglas del workspace: cada feature empieza como spec; la implementación sigue TDD (backend primero, luego móvil) guiada por la tabla de ejemplos; al terminar la spec pasa a Implementada y /sync-docs actualiza el vault.',
  'La aprobación del PO (estado Lista) es el control humano antes de escribir código: ahí se validan los ejemplos y se resuelven las preguntas abiertas.',
]);

/* 13. Anatomía de una spec, trazada */
lam('De un ejemplo de la spec al código', `
  ${cab('Metodología', 'Una fila de la spec, trazada hasta el código')}
  <div class="cuerpo alto" style="top:215px">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:26px 40px">
      <div data-paso="0">
        <span class="rotulo-codigo">① specs/RF-012 · tabla de ejemplos <span>(fila 5)</span></span>
        <pre class="codigo" style="white-space:pre-wrap;font-size:20px"><span class="a">5</span> | Levantarla en un paseo <span class="k">Requested</span>,
  <span class="k">Completed</span> o <span class="k">Cancelled</span>
  → <span class="r">422 Alerts.WalkNotActive</span> | Regla</pre>
      </div>
      <div data-paso="1">
        <span class="rotulo-codigo">② prueba de integración <span>(AlertEndpointTests.cs)</span></span>
        <pre class="codigo" style="font-size:20px">[Fact]
<span class="k">public async</span> Task Emergency_OnAWalkNobodyAcceptedYet_Returns422()
{
    ...
    raised.StatusCode.ShouldBe(HttpStatusCode.UnprocessableEntity);
    <span class="k">await</span> WalkScenario.ShouldHaveSingleErrorAsync(
        raised, <span class="a">"Alerts.WalkNotActive"</span>);
}</pre>
      </div>
      <div data-paso="2">
        <span class="rotulo-codigo">③ catálogo de errores <span>(AlertErrors.cs, dominio)</span></span>
        <pre class="codigo" style="font-size:20px">WalkNotActive = <span class="k">new</span>(<span class="a">"Alerts.WalkNotActive"</span>,
    <span class="a">"Solo puedes reportar una emergencia en un
     paseo aceptado o en curso."</span>, ErrorType.BusinessRule);</pre>
      </div>
      <div data-paso="3">
        <span class="rotulo-codigo">④ código de producción <span>(RaiseEmergencyHandler.cs)</span></span>
        <pre class="codigo" style="font-size:20px"><span class="k">if</span> (walk.Status <span class="k">is not</span> (WalkStatus.Accepted
    <span class="k">or</span> WalkStatus.InProgress))
{ response.AddError(<span class="v">AlertErrors.WalkNotActive</span>); <span class="k">return</span> response; }</pre>
      </div>
    </div>
    <p class="texto" style="margin-top:26px">Cada fila de la tabla es al menos una prueba; el nombre del error es el hilo que une spec, prueba y código. La spec cierra con una tabla de <b>trazabilidad</b> de archivos y pruebas por repo.</p>
  </div>
  ${pie('<b>Fuente:</b> specs/RF-012-alerta-de-emergencia.md; waggo-api/Tests/Waggo.Api.IntegrationTests/Endpoints/Tracking/AlertEndpointTests.cs (también AlertHandlersTests.cs en Application.UnitTests); Waggo.Domain/Errors/Tracking/AlertErrors.cs; Waggo.Application/Tracking/Commands/RaiseEmergency/RaiseEmergencyHandler.cs. Fragmentos reales, abreviados.')}`, [
  'Es el mismo ejemplo de la lámina 5. La spec RF-012 tiene 7 filas de ejemplos (feliz, seguridad, regla, límite y error) y cada una tiene prueba en el backend.',
  'La spec también incluye contrato de API, diseño por capas, plan TDD, preguntas abiertas para el PO y trazabilidad con archivos y pruebas reales.',
], { pasos: 3 });

/* 14. Specs en cifras */
lam('Specs en cifras', `
  ${cab('Metodología', `${CIFRAS.specs} specs, ${CIFRAS.specsImpl} ya implementadas`)}
  <div class="cuerpo alto" style="top:215px">
    <div class="dos" style="gap:60px">
      <div>
        <span class="rotulo-codigo">Estado de las specs</span>
        ${barras([['Implementada', CIFRAS.specsImpl, 'd-barra b2'], ['Lista', CIFRAS.specsLista], ['En progreso', CIFRAS.specsProgreso, 'd-barra b3'], ['Borrador', CIFRAS.specsBorrador, 'd-barra b3']], { ancho: 760, alto: 52, sep: 20, etqAncho: 260 })}
        <p class="texto" style="margin-top:26px">Ciclo de vida: <span class="etq">Borrador</span> → <span class="etq po">Lista</span> (la aprueba el PO) → <span class="etq">En progreso</span> → <span class="etq ok">Implementada</span></p>
      </div>
      <div class="tarjeta"><h3>Qué lleva cada spec</h3>
        <ul class="lista" style="gap:10px">
          <li><span>Historia de usuario y criterios de aceptación</span></li>
          <li><span><b>Tabla de ejemplos</b>: feliz, error, borde, seguridad</span></li>
          <li><span>Reglas de negocio; las sin confirmar se marcan <b>⚠️ provisional</b></span></li>
          <li><span>Contrato de API y diseño por capas</span></li>
          <li><span>Plan TDD por repo y <b>preguntas abiertas</b> para el PO</span></li>
          <li><span>Trazabilidad: archivos y pruebas reales</span></li>
        </ul>
      </div>
    </div>
  </div>
  ${pie('<b>Cómo se contó:</b> archivos de specs/*.md sin _template, README ni _adr-borrador (21); el estado sale de la línea «estado:» de cada archivo (grep). Una spec puede cubrir varios RF y los prefijos UX, DEV e INF cubren pantallas, soporte e infraestructura.')}`, [
  'Estado de las 21 specs: 18 Implementada, 1 Lista (login social con Google y Microsoft), 1 En progreso (panel de administración) y 1 Borrador (perfil de usuario).',
  'Los valores de negocio sin confirmar (tarifas, comisión, radios, tiempos) se marcan como provisionales y generan una pregunta para el PO: no se disfrazan de decisiones.',
]);

/* 15. Agentes */
lam('Agentes especializados', `
  ${cab('IA en el equipo', `${CIFRAS.agentes} agentes, cada uno con un rol y límites`)}
  <div class="cuerpo alto" style="top:215px">
    <div class="tres" style="gap:22px 26px">
      <div class="tarjeta compacta"><span class="etq">Especificación</span><h3 style="margin-top:10px;font-size:30px">requirements-analyst</h3><p>Convierte un RF en spec con ejemplos y preguntas. Solo escribe en specs/.</p></div>
      <div class="tarjeta compacta"><span class="etq">Revisión</span><h3 style="margin-top:10px;font-size:30px">architecture-reviewer</h3><p>Revisa contra ADR, capas y Definition of Done. Solo lectura.</p></div>
      <div class="tarjeta compacta"><span class="etq">Documentación</span><h3 style="margin-top:10px;font-size:30px">docs-keeper</h3><p>Mantiene sincronizados el vault, las specs y los README.</p></div>
      <div class="tarjeta compacta" style="grid-column:span 3"><span class="etq po">Ciclo TDD · ${CIFRAS.agentesTdd} agentes</span>
        <p style="margin-top:10px"><b>tdd-orchestrator</b> coordina · <b>backend-test-writer</b> y <b>mobile-test-writer</b> escriben pruebas rojas · <b>backend-implementer</b> y <b>mobile-implementer</b> hacen el verde y el refactor · <b>tdd-verifier</b> certifica cada fase.</p></div>
      <div class="tarjeta compacta"><span class="etq">Diseño</span><h3 style="margin-top:10px;font-size:30px">ui-ux-designer · design-implementer</h3><p>Propuesta de pantallas y su llegada a la app, sin cambiar contratos.</p></div>
      <div class="tarjeta compacta"><span class="etq">Negocio</span><h3 style="margin-top:10px;font-size:30px">market-analyst</h3><p>Estudio de mercado con fuente y fecha para cada cifra.</p></div>
      <div class="tarjeta compacta"><span class="etq">Comunicación</span><h3 style="margin-top:10px;font-size:30px">presentation-designer</h3><p>Presentaciones HTML con la marca; sin cifras inventadas.</p></div>
    </div>
  </div>
  ${pie('<b>Cómo se contó:</b> archivos .md en waggo-workspace/.claude/agents (7) y .claude/agents/tdd (6) = 13. Los dos últimos (market-analyst y presentation-designer) aún no están commiteados en Git.')}`, [
  'Cada agente es un archivo Markdown con descripción, herramientas permitidas y modelo. La descripción dice cuándo usarlo.',
  'Los agentes de pruebas y los de implementación tienen herramientas de escritura, pero un hook limita qué archivos pueden tocar (siguiente lámina).',
]);

/* 16. TDD con agentes y guardia */
lam('TDD con separación de roles', `
  ${cab('IA en el equipo', 'Quien escribe la prueba no es quien la hace pasar')}
  <div class="cuerpo alto" style="top:215px">
    ${svg(1700, 210, `
      ${caja(0, 40, 250, 130, 'tdd-orchestrator', 'planea los ciclos', 'po')}
      ${caja(290, 40, 250, 130, 'test-writer', '🔴 solo pruebas', 'roja')}
      ${caja(580, 40, 220, 130, 'tdd-verifier', 'rojo correcto')}
      ${caja(840, 40, 260, 130, 'implementer', '🟢 sin tocar pruebas', 'verde')}
      ${caja(1140, 40, 220, 130, 'tdd-verifier', 'verde real')}
      ${caja(1400, 40, 300, 130, 'refactor', '🔵 mismo comportamiento', 'ia')}
      ${flecha('M250 105 L290 105')}${flecha('M540 105 L580 105')}${flecha('M800 105 L840 105')}${flecha('M1100 105 L1140 105')}${flecha('M1360 105 L1400 105')}
    `, 'Flujo: el orquestador llama al agente de pruebas, el verificador certifica el rojo, el implementador hace el verde, el verificador certifica y se hace el refactor.')}
    <div class="dos" style="margin-top:20px;gap:40px">
      <div>
        <span class="rotulo-codigo">.claude/hooks/tdd-guard.js <span>(fragmento real)</span></span>
        <pre class="codigo" style="font-size:19px"><span class="k">if</span> (mode === <span class="a">'tests'</span> &amp;&amp; !isTestFile(path)) {
  console.error(<span class="a">'TDD guard: los agentes de pruebas
    solo escriben pruebas. Bloqueado: '</span> + path);
  process.exit(<span class="r">2</span>);
}</pre>
      </div>
      <ul class="lista" style="gap:12px">
        <li><span>El hook se engancha a <b>Edit y Write</b> de cada agente (PreToolUse)</span></li>
        <li><span>Un agente de pruebas no puede editar código de producción, y al revés</span></li>
        <li><span>Si una prueba parece mal, el implementador <b>lo informa</b>, no la cambia</span></li>
      </ul>
    </div>
  </div>
  ${pie('<b>Fuente:</b> .claude/agents/tdd/*.md (frontmatter con hooks), .claude/hooks/tdd-guard.js (44 líneas), README del workspace. Flujo de commits: test → feat → refactor en la rama; el squash deja uno en main.')}`, [
  'El orquestador trabaja outside-in: primero una prueba de aceptación del endpoint, luego dominio y casos de uso. El verificador corre las pruebas y certifica que cada agente tocó solo los archivos de su rol.',
  'Los commits locales por fase (test, feat, refactor) quedan como evidencia del TDD dentro del PR; al integrar con squash queda un solo commit en main.',
]);

/* 17. Skills, reglas y vault */
lam('Skills, reglas y bóveda', `
  ${cab('IA en el equipo', 'Flujos reutilizables y reglas que los agentes leen')}
  <div class="cuerpo alto" style="top:215px">
    <div class="dos" style="gap:50px">
      <div class="tarjeta"><h3>${CIFRAS.skills} skills (comandos)</h3>
        <table class="tabla" style="font-size:23px">
          <tr><td class="m">/new-spec</td><td>crea la spec de un RF</td></tr>
          <tr><td class="m">/implement-spec</td><td>TDD, revisión, docs y título del PR</td></tr>
          <tr><td class="m">/tdd</td><td>ciclos para un cambio puntual</td></tr>
          <tr><td class="m">/api-contract-change</td><td>cambio coordinado del contrato</td></tr>
          <tr><td class="m">/new-adr</td><td>registra una decisión</td></tr>
          <tr><td class="m">/sync-docs</td><td>vault y README al día</td></tr>
          <tr><td class="m">/workspace-status</td><td>estado de los repos</td></tr>
        </table>
      </div>
      <div class="tarjeta"><h3>Reglas que se leen antes de editar</h3>
        <ul class="lista" style="gap:12px">
          <li><span><b>${CIFRAS.checklists} checklists</b> en .claude/rules: backend y mobile</span></li>
          <li><span><b>CLAUDE.md</b> y <b>AGENTS.md</b> de cada repo: comandos y reglas</span></li>
          <li><span><b>Vault Waggo</b> (Obsidian): requisitos, arquitectura, ADR y glosario</span></li>
          <li><span>«Simplicidad primero»: el código más simple que se entienda de un vistazo</span></li>
          <li><span>Permisos compartidos: <b>git push denegado</b> y .env ilegibles</span></li>
        </ul>
      </div>
    </div>
  </div>
  ${pie('<b>Cómo se contó:</b> directorios dentro de .claude/skills (7) y archivos de .claude/rules (2). Permisos: .claude/settings.json (deny: git push, lectura de .env). El vault no estaba disponible al preparar la presentación.')}`, [
  'El flujo completo de un requerimiento: /new-spec RF-015 → el PO revisa y pasa a Lista → /implement-spec RF-015 → el humano revisa los commits; el push y los PR solo con su aprobación.',
  'Una regla del repo: nunca se hace push sin aprobación explícita del usuario; está en los permisos y en CLAUDE.md.',
]);

/* 18. IA vs PO */
lam('Qué hace la IA y qué decide el PO', `
  ${cab('IA en el equipo', 'La IA propone y construye; el PO decide')}
  <div class="cuerpo alto" style="top:215px">
    <div class="dos" style="gap:50px">
      <div class="tarjeta" style="background:var(--superficie2)"><h3>La IA hace</h3>
        <ul class="lista" style="gap:12px">
          <li><span>Redacta specs con ejemplos, contrato y preguntas</span></li>
          <li><span>Escribe las pruebas rojas y el código mínimo</span></li>
          <li><span>Refactoriza y revisa contra los ADR y las capas</span></li>
          <li><span>Mantiene vault, specs y README sincronizados</span></li>
          <li><span>Propone diseño de pantallas (121 marcos SVG) y estudios</span></li>
        </ul>
      </div>
      <div class="tarjeta" style="border-color:var(--primario)"><h3>El PO decide</h3>
        <ul class="lista" style="gap:12px">
          <li><span>Aprueba cada spec (Borrador → Lista) y resuelve preguntas</span></li>
          <li><span><b>OpenStreetMap</b> como proveedor de mapas (2026-10-27)</span></li>
          <li><span>El <b>123</b> como línea de emergencia (2026-10-27)</span></li>
          <li><span>«Waggo» en el logo, una sola vez (2026-10-26)</span></li>
          <li><span>Qué se publica y cuándo: ningún push sin su aprobación</span></li>
        </ul>
      </div>
    </div>
    <div class="dato" style="margin-top:30px;flex-direction:row;align-items:baseline;gap:20px"><span class="n" style="font-size:72px">${CIFRAS.conClaude} de ${CIFRAS.commits}</span><span class="e">commits de los tres repos llevan un trailer de coautoría de Claude (${CIFRAS.conClaudeApi} de ${CIFRAS.commitsApi} en la API, ${CIFRAS.conClaudeMovil} de ${CIFRAS.commitsMovil} en la app, ${CIFRAS.conClaudeWs} de ${CIFRAS.commitsWs} en el workspace)</span></div>
  </div>
  ${pie('<b>Cómo se contó:</b> git rev-list --count -i --grep="co-authored-by: Claude" HEAD en cada repo (el del workspace, en su rama actual). Mide coautoría declarada, no cuántas líneas escribió la IA. Decisiones del PO: design/propuesta/00-resumen.md, 08-marca.md y specs/RF-012. 121 marcos SVG: inventario de design/propuesta/06-inventario-de-pantallas.md.')}`, [
  'Honestidad sobre la cifra: el trailer indica que hubo participación de Claude en el commit; no mide la proporción de código. Los demás commits no llevan trailer.',
  'Hay 15 preguntas abiertas para el PO registradas en design/propuesta/00-resumen.md (una ya resuelta); varias reglas de negocio siguen marcadas como provisionales.',
]);

/* 19. Evidencia: producto real */
const real = (f, clip, alt) => `<div class="real-marco"><img src="assets/real/${f}" alt="${alt}"><img class="difuminada" src="assets/real/${f}" alt="" aria-hidden="true" style="clip-path:inset(${clip})"></div>`;
lam('El producto existe', `
  ${cab('Evidencia', 'Funciona en un celular real y en línea')}
  <div class="cuerpo alto" style="top:200px">
    <div style="display:flex;gap:56px;align-items:flex-start">
      <div class="reales">
        ${real('01-inicio.png', '20.35% 10.3% 65.15% 10.7% round 12px', 'Inicio de la app con el paseo en camino; mapa difuminado')}
        ${real('04-ver-paseo.png', '14% 6.3% 52.4% 6.3% round 12px', 'Pantalla del paseo con paseador verificado y botón Emergencia; mapa difuminado')}
      </div>
      <ul class="lista" style="margin-top:24px">
        <li><span><b>app.mywaggo.com</b> responde 200 (web de Expo en S3 y CloudFront)</span></li>
        <li><span><b>api.mywaggo.com/health/ready</b> responde 200</span></li>
        <li><span>Capturas de la versión actual en un <b>Samsung Galaxy A35</b></span></li>
        <li><span>Mapas difuminados: muestran la ubicación real de quien probó la app</span></li>
      </ul>
    </div>
  </div>
  ${pie('<b>Fuente:</b> presentaciones/_capturas (capturas del equipo, 2026-10-28); comprobación con curl el 2026-10-28.')}`, [
  'Las capturas son de la app real en un Samsung A35 (la barra de estado se borró). Los mapas se difuminan en la presentación porque muestran la zona de recogida real de quien probó la app.',
]);

/* 20. Historial */
lam('Historial de trabajo', `
  ${cab('Evidencia', `${CIFRAS.commits} commits en 30 días, uno por PR`)}
  <div class="cuerpo alto" style="top:215px">
    <div class="dos" style="gap:60px">
      <div>
        <span class="rotulo-codigo">Commits por tipo <span>(Conventional Commits, tres repos)</span></span>
        ${barras(COMMITS_POR_TIPO, { ancho: 760, alto: 40, sep: 14, etqAncho: 180 })}
      </div>
      <div>
        <div class="tres" style="grid-template-columns:1fr 1fr 1fr;gap:20px"><div class="dato"><span class="n">${CIFRAS.commitsApi}</span><span class="e">waggo-api</span></div><div class="dato"><span class="n">${CIFRAS.commitsMovil}</span><span class="e">waggo-mobile</span></div><div class="dato"><span class="n">${CIFRAS.commitsWs}</span><span class="e">workspace</span></div></div>
        <ul class="lista" style="margin-top:30px;gap:14px">
          <li><span>Primer commit: <b>2026-09-28</b>; último: 2026-10-28</span></li>
          <li><span>Cada PR entra como <b>un solo commit</b> (squash) con título Conventional Commits</span></li>
          <li><span>Commits como <code>feat(identity): sign in with Google via POST /auth/login/google (RF-001, RF-005)</code> enlazan con la spec</span></li>
        </ul>
      </div>
    </div>
  </div>
  ${pie('<b>Cómo se contó:</b> git rev-list --count HEAD por repo (waggo-workspace en su rama feature/agentes-mercado-presentaciones); tipo = prefijo del asunto del commit. Por el squash, un commit equivale a un PR integrado, no a una sesión de trabajo.')}`, [
  'La API y la app tuvieron 36 y 24 commits en main; el workspace 22 en su rama actual. Las cifras cambian con cada merge: son las del 28 de octubre de 2026.',
]);

/* 21. Pendientes y riesgos técnicos */
lam('Lo que falta', `
  ${cab('Honestidad', 'Lo que todavía no está hecho')}
  <div class="cuerpo alto" style="top:215px">
    <table class="tabla">
      <tr><th style="width:430px">Tema</th><th>Estado hoy</th></tr>
      <tr><td>Pagos reales</td><td>Pasarela <b>simulada</b>; el PO aún elige entre Stripe y MercadoPago</td></tr>
      <tr><td>Verificación de paseadores</td><td><b>Manual</b> por un administrador; sin biometría ni antecedentes automáticos</td></tr>
      <tr><td>Notificaciones push</td><td>No existen: los avisos viven dentro de la app</td></tr>
      <tr><td>Login con Google / Microsoft</td><td>API de Google en main; en la app aún no (spec en estado Lista)</td></tr>
      <tr><td>Apps iOS y Android en tiendas</td><td>Fuera del alcance del despliegue actual; solo web en AWS</td></tr>
      <tr><td>Tiles públicos de OSM</td><td>Solo para desarrollo y piloto; producción necesita proveedor propio</td></tr>
      <tr><td>Vault y ADR de mapas</td><td>ADR de mapas en borrador; el vault no está en los repos</td></tr>
    </table>
  </div>
  ${pie('<b>Fuente:</b> specs/RF-015-RF-018, RF-002-RF-003, RF-012, RF-001-RF-005-login-social, INF-001 y specs/_adr-borrador-mapas-openstreetmap.md; git log de waggo-api (commit «sign in with Google», #32).')}`, [
  'Esta lámina es deliberada: una presentación técnica creíble dice qué no está. Cada fila tiene su spec o borrador de ADR como fuente.',
]);

/* 22. Cómo se contaron las cifras */
lam('Cómo se contaron las cifras', `
  ${cab('Apéndice', 'Cada cifra sale de un comando')}
  <div class="cuerpo alto" style="top:215px">
    <table class="tabla" style="font-size:22px">
      <tr><th style="width:360px">Cifra</th><th style="width:130px">Valor</th><th>Cómo se contó (2026-10-28)</th></tr>
      <tr><td>Métodos de prueba de la API</td><td>${CIFRAS.pruebasApi}</td><td class="m">grep -rE "^\\s*\\[(Fact|Theory)" Tests (*.cs)</td></tr>
      <tr><td>Pruebas de la app</td><td>${CIFRAS.pruebasMovil}</td><td class="m">grep -rE "^\\s*(it|test)(\\.each[^(]*)?\\(" src (*.test.ts, *.test.tsx)</td></tr>
      <tr><td>Endpoints</td><td>${CIFRAS.endpoints}</td><td class="m">grep -rhoE "\\.Map(Get|Post|Put|Patch|Delete)\\(" Waggo.Api</td></tr>
      <tr><td>Specs</td><td>${CIFRAS.specs}</td><td class="m">ls specs/*.md sin _template, README ni _adr-borrador</td></tr>
      <tr><td>Agentes · skills</td><td>${CIFRAS.agentes} · ${CIFRAS.skills}</td><td class="m">ls .claude/agents .claude/agents/tdd .claude/skills</td></tr>
      <tr><td>Commits</td><td>${CIFRAS.commits}</td><td class="m">git rev-list --count HEAD (en cada repo)</td></tr>
      <tr><td>Coautoría de Claude</td><td>${CIFRAS.conClaude}</td><td class="m">git rev-list --count -i --grep="co-authored-by: Claude" HEAD</td></tr>
      <tr><td>Migraciones</td><td>${CIFRAS.migraciones}</td><td class="m">ls Migrations | grep -v "Designer|Snapshot"</td></tr>
    </table>
  </div>
  ${pie('No se ejecutaron las suites ni se midió cobertura al preparar esta presentación: se cuentan pruebas definidas. Detalle completo en presentaciones/tecnica/guion.md.')}`, [
  'Todas las cifras se pueden reproducir con los comandos de la tabla desde la carpeta de cada repo. Si cambian los repositorios, el script presentaciones/_herramientas/construir-tecnica.mjs tiene las cifras en un solo bloque para actualizarlas.',
]);

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Waggo por dentro, arquitectura y metodología</title>
<meta name="description" content="Presentación técnica de Waggo: arquitectura, decisiones, calidad y cómo se trabaja con IA y desarrollo guiado por especificaciones.">
<link rel="icon" href="assets/brand/logo-head.png">
<link rel="stylesheet" href="../_motor/motor.css">
<link rel="stylesheet" href="../_motor/tema.css">
<link rel="stylesheet" href="assets/tecnica.css">
</head>
<body>
<main class="visor" aria-label="Presentación técnica de Waggo">
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
