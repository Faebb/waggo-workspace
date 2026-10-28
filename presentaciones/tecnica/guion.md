# Guion de la presentación técnica y de metodología

22 láminas. Se abre con doble clic en `index.html`. PDF: `presentacion.pdf`. Las cifras viven en un solo bloque (`CIFRAS`) de `presentaciones/_herramientas/construir-tecnica.mjs`; si cambian los repos, se recuentan con los comandos de abajo y se regenera con `node construir-tecnica.mjs`.

## Láminas
1. Portada
2. Qué es Waggo (tres repos y un vault; cifras clave)
3. Arquitectura general en AWS (diagrama SVG)
4. API: Clean Architecture y su verificación por pruebas (diagrama)
5. Una petición de punta a punta (endpoint → validadores → handler → respuesta) con fragmentos reales
6. Datos y mapas: PostgreSQL + PostGIS, OpenStreetMap
7. App móvil: Expo, features, httpClient + Zod (diagrama)
8. CI/CD (diagrama de dos filas)
9. Decisiones: ADR citados en los repos
10. Calidad: pruebas y líneas (gráficos de barras)
11. Convenciones impuestas por la compilación (`Directory.Build.props`, `.editorconfig`)
12. Desarrollo guiado por especificaciones: el ciclo (diagrama; qué decide el PO y qué hace la IA)
13. De una fila de la spec al código (spec → prueba → catálogo de errores → handler), con 3 pasos
14. Specs en cifras y ciclo de vida
15. Agentes especializados
16. TDD con separación de roles y el hook `tdd-guard.js`
17. Skills, reglas y bóveda
18. Qué hace la IA y qué decide el PO (con la cifra de coautoría)
19. El producto existe: capturas reales (mapas difuminados) y comprobaciones de URL
20. Historial de trabajo (commits por tipo)
21. Lo que falta (pagos simulados, verificación manual, sin push, etc.)
22. Cómo se contaron las cifras

## Cifras y cómo se contaron (2026-10-28, desde `C:\Users\yuter\Desktop\waggo`)

| Cifra | Valor | Comando |
|---|---|---|
| Métodos de prueba de la API | 626 (553 `[Fact]` + 73 `[Theory]`) | `grep -rE --include=*.cs '^\s*\[Fact' waggo-api/Tests \| wc -l` y lo mismo con `\[Theory`; suma por proyecto = 626 |
| Casos `[InlineData]` | 183 | `grep -rE --include=*.cs '^\s*\[(InlineData\|MemberData\|ClassData)' waggo-api/Tests \| wc -l` |
| Pruebas por proyecto | Domain 164, Api.Integration 171, Application 162, Api.Unit 75, Infrastructure 47, Architecture 7 | mismo grep sobre cada carpeta `Tests/<proyecto>` |
| Archivos de prueba de la API | 114 | `grep -rlE --include=*.cs '\[(Fact\|Theory)' waggo-api/Tests \| wc -l` |
| Pruebas de la app | 466 en 95 archivos | `find src -name '*.test.ts*' \| wc -l`; `grep -rE --include=*.test.ts --include=*.test.tsx '^\s*(it\|test)(\.each[^(]*)?\(' src \| wc -l` (10 líneas usan `.each`) |
| Líneas de código | API 11.134, pruebas API 11.024, app 10.907, pruebas app 7.264 | `cat` + `wc -l` de los `.cs` de `Waggo.*` sin `Migrations`, `bin`, `obj` y de `Tests`; `.ts/.tsx` de `src` con y sin `*.test.*` |
| Endpoints | 44 (17 GET, 25 POST, 2 PUT) | `grep -rhoE --include=*.cs '\.Map(Get\|Post\|Put\|Patch\|Delete)\(' waggo-api/Waggo.Api \| sort \| uniq -c` |
| Módulos de endpoints | 9 | `ls waggo-api/Waggo.Api/Endpoints` |
| Features de la app | 14 | `ls waggo-mobile/src/features` |
| Migraciones | 19 | `ls waggo-api/Waggo.Infrastructure/Persistence/Migrations \| grep -v "Designer\|Snapshot" \| wc -l` |
| Specs | 21 (18 Implementada, 1 Lista, 1 En progreso, 1 Borrador) | `ls specs/*.md` sin `_template`, `README`, `_adr-borrador`; `grep -h '^estado:' specs/*.md` |
| Agentes | 13 (7 + 6 en `tdd/`) | `ls .claude/agents .claude/agents/tdd` |
| Skills | 7 | `ls .claude/skills` |
| Checklists | 2 | `ls .claude/rules` |
| Commits | 82 (36 API, 24 app, 22 workspace) | `git -C <repo> rev-list --count HEAD` |
| Commits por tipo | feat 38, docs 23, refactor 6, chore 6, ci 4, fix 2, style 2, build 1 | `git log --format=%s \| sed -E 's/^([a-z]+)(\(.*\))?!?:.*/\1/' \| sort \| uniq -c` por repo, sumados |
| Commits con coautoría de Claude | 68 (31, 21, 16) | `git rev-list --count -i --grep='co-authored-by: Claude' HEAD` por repo |
| ADR citados | 18 identificadores distintos (ADR-001, 002, 005 a 020) | `grep -rhoE 'ADR-0[0-9]{2}'` sobre CLAUDE.md, AGENTS.md, specs, design y código de los tres repos |
| Primer commit | 2026-09-28 (API y app), 2026-09-29 (workspace) | `git log --reverse --format=%ad --date=short \| head -1` |
| URLs | `app.mywaggo.com` 200; `api.mywaggo.com/health/ready` 200 y `/health/live` 200 | `curl -s -o /dev/null -w "%{http_code}"` |

## Fuentes de las láminas
- Arquitectura y despliegue: `specs/INF-001-despliegue-publico-en-aws.md`, `.github/workflows/{ci,deploy,pr-title}.yml` de ambos repos.
- Capas y reglas: `waggo-api/CLAUDE.md`, `Directory.Build.props`, `.editorconfig`, `Tests/Waggo.ArchitectureTests/LayerTests.cs`.
- Fragmentos de código: `RaiseEmergencyHandler.cs`, `AlertErrors.cs`, `AlertEndpointTests.cs`, `.claude/hooks/tdd-guard.js` (reales, abreviados).
- Metodología: `CLAUDE.md` del workspace, `specs/README.md`, `.claude/skills/implement-spec/SKILL.md`, `.claude/agents/**`, `.claude/rules/*.md`, `README.md`.
- Mapas: `specs/_adr-borrador-mapas-openstreetmap.md` (borrador; aún no es ADR numerado en el vault).
- Decisiones del PO con fecha: `design/propuesta/00-resumen.md`, `08-marca.md`, `specs/RF-012-alerta-de-emergencia.md`.

## Qué no se pudo verificar
- **El vault de Obsidian no está disponible** (se buscó en `C:\Users\yuter\Vault Waggo` y rutas cercanas). Los ADR se citan desde `CLAUDE.md`, `AGENTS.md` y las specs: faltan los títulos de ADR-002, 005 y 014 y el total real de ADR del vault. Por eso la lámina 9 dice «ADR citados en los repos» y no «N ADR».
- **No se ejecutaron las suites de prueba ni la cobertura** (RAM limitada y Docker necesario para las de integración): se cuentan métodos definidos, no ejecuciones ni porcentaje de cobertura. Los umbrales de cobertura (80 %/80 %/70 %) son los de `package.json`.
- No se midió el tiempo de CI ni se revisó el estado de los workflows en GitHub.
- La cifra de coautoría mide el trailer `Co-authored-by` de los commits, no la proporción de código escrito por IA.
- El conteo del workspace usa la rama `feature/agentes-mercado-presentaciones` (los agentes `market-analyst` y `presentation-designer` aún no están commiteados).
- La reproducción fluida de animaciones y Safari/Firefox no se probaron (solo Chrome sin interfaz).

## Pendiente de confirmar por el PO
1. Si el vault puede compartirse para completar la lámina de ADR con títulos y total.
2. Si las capturas reales (mapas difuminados) pueden mostrarse a un público externo.
3. Si se pasa el borrador de ADR de mapas al vault.
