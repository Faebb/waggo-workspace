# Guion de la presentación para inversionistas

26 láminas. `index.html` (doble clic) y `presentacion.pdf` (una lámina por página). Usa el motor común sin cambios (`../_motor/`).

**Única fuente de cifras de mercado y finanzas:** `negocio/mercado/` (consulta 2026-10-28). Cada cifra de la presentación lleva su etiqueta —**Dato**, **Cálculo** o **Supuesto**, como en el estudio— y su `[n]` de `fuentes.md`. Los hechos del producto salen del repo (`R1` a `R18` del estudio). Las cifras de ingeniería salen de `presentaciones/tecnica/guion.md`.

## Reglas que se respetaron
- Sin valoración, monto de ronda, retorno esperado ni proyecciones de ingresos fuera de los escenarios del estudio.
- Sin «tracción» de usuarios o paseadores: no hay usuarios reales medidos. La lámina 6 solo muestra lo construido y desplegado y dice qué no existe.
- El margen delgado y el punto de equilibrio se presentan tal como salen del estudio (láminas 2, 12, 13, 15, 16, 17).
- Uso de fondos (lámina 21): solo categorías; los montos que el estudio no tiene dicen «por cotizar».
- Equipo (lámina 24): marcador de posición, sin nombres.
- **No se usan:** descargas, calificación (3,2 ★) y reseñas (464) de Wakypet en Google Play (sin verificación independiente); el % de estratos de Suba (reconstruido, sin verificar); la comisión bruta anual de la tabla SAM (se muestra el GMV con la advertencia de que no es ingreso de Waggo); la frase de `01-competencia.md` §5.3 «Waggo paga menos porcentaje», que parece un error (Waggo cobra 20 % y Wakypet 10–15 %: la presentación dice que la comisión de Waggo es mayor).
- La ficha [18] (Google Play de Wakypet) se cita solo por el seguro SURA y el primer paseo gratis; el analista la leyó descargando el HTML público. Si el PO prefiere no depender de ella, esas dos menciones salen sin afectar las cifras.

## Láminas y fuentes

| # | Lámina | Cifras principales | Etiqueta | Fuente |
|---|---|---|---|---|
| 1 | Portada | — | — | — |
| 2 | Lo esencial | resumen de 12–17 | ver abajo | `00-resumen.md`, `03` |
| 3 | Problema | Ley 2480 (reglamento ~ene-2027, transición ~jul-2027); máx. 8 perros; protocolo no obligatorio; reseña de Wag! 3-oct-2026 | Dato | [41][48][29][16][18][20] |
| 4 | Solución | 6 funciones con spec Implementada; umbrales 1,5 km, 10 min, 5 km | Dato (repo) | R6, R8, R9, R12, R13; specs/ |
| 5 | Producto | capturas reales (mapas difuminados) y 2 marcos de diseño | — | `presentaciones/_capturas`, `design/propuesta/pantallas` |
| 6 | Construido | 44 endpoints, 9 módulos, 21 specs (18 impl.), 626 pruebas API, 466 app, 19 migraciones, 82 commits | Dato (repo) | `tecnica/guion.md` |
| 7 | Mercado | 27,8 % hogares con perro; ~806.200; 868.996; 44 % con mascota; >$6 billones; 80–90 % alimento y veterinaria; 4 % de 402 | Dato / Cálculo | [3][4][5][12][13][14] |
| 8 | Segmento | 806.200 → 188.641 → 64.906; SOM 325 / 974 / 1.947; piloto 500; 80,2 %, 42,9 %; 101.053 hogares en 5 UPZ | Cálculo / Supuesto / Dato | `02`; [1][2][5][6][11]; RNF-006 (R16) |
| 9 | Demanda | 10/20/30 %; 2/4/8 paseos; 6.491 / 12.981 / 19.472 hogares; 12.981 / 51.925 / 155.774 paseos; GMV $2.718 / $10.873 / $32.619 M | Supuesto / Cálculo | `02` §5 |
| 10 | Competencia | matriz; $13.900, $8.000–10.000, $39.000; 15 %/10 % | Dato | `01` §4; [15][16][17][18][20][22][23][24] |
| 11 | Diferenciales | 3 hipótesis, brechas | Hipótesis (no hay evidencia directa) | `04`; [15][16][18][20][24] |
| 12 | Modelo de negocio | $15.500; $3.100; $12.400; IVA $495; pasarela $1.322; margen $1.283 (8,3 %) | Dato / Cálculo | `03` tabla 1; R1, R5; [17][33][34][43] |
| 13 | Margen por tipo | $464 a $4.355 (8 tipos de paseo) | Cálculo | `03` tabla 1 |
| 14 | Palancas | $1.322 → $593; +$651; +$1.322 (precio $16.822, +21 % vs Wakypet 2024); $2.307 vs $1.283 | Cálculo | `03` §4; [17][22] |
| 15 | Supuestos | margen $1.000 / $1.250 / $1.700; 600 / 2.500 / 6.000; ×1,5 / ×2 / ×2,5; 4 / 6 / 8; 15 / 10 / 7 %; CAC $80.000 / $40.000 / $20.000; fijos $3,5 M | Supuesto | `03` §2 |
| 16 | Equilibrio y capital | 3.500 / 2.800 / 2.059; $60,0 / $47,5 / $12,0 M (12 m); $125,4 / $77,5 M (24 m); LTV/CAC 0,33 / 1,9 / 9,7 | Cálculo (sobre Supuestos) | `03` §3 |
| 17 | Sensibilidad | amplitudes $50,4 / 47,3 / 46,9 / 43,0 / 23,0 / 3,9 M; base −$77,5 M | Cálculo | `03` §5 |
| 18 | Plan de lanzamiento | 5 UPZ, 101.053 hogares; 500 dueños / 50 paseadores; 3.300 paseos/mes de capacidad; fases F0–F3 | Dato / Cálculo / Supuesto | `05` §1, §2, §7; [6]; R13, R16 |
| 19 | Umbrales | 8 métricas, regla seguir/ajustar/parar | Supuesto | `05` §6; [27] |
| 20 | Antes de lanzar | pasarela real, seguro, verificación, certificado, guardia, revisión legal | Dato (estado del repo) | `05` §7; [18][20][41][42][44][45]; R6, R7, R11, R12 |
| 21 | Uso de fondos | categorías; $2,6 M, $300, $40.000, $0,5 M, $0,25 M; ≈ US$48 ≈ $153.000/mes; CPC ≈ $700 | Supuesto / Cálculo / Dato | `03` §1–2; [33][36][37][38][39][49] |
| 22 | Riesgos | comisión de lanzamiento 15 % → ~$632 | Supuesto / Cálculo | `00`, `05` §8 |
| 23 | Datos que faltan | — | — | `00`, `fuentes.md` |
| 24 | Equipo | placeholder | — | — |
| 25 | Cierre | — | — | — |
| 26 | Fuentes | lista de [n] usados | — | `fuentes.md` |

## Cifras que son Supuesto (no Dato) — para que el PO las revise
1. **Todas las de los escenarios (láminas 15 y 16):** margen por paseo $1.000 / $1.250 / $1.700 (incluye $300 de soporte); paseos/mes al mes 12 (600 / 2.500 / 6.000); crecimiento de los meses 13–24 (×1,5 / ×2 / ×2,5); paseos por dueño al mes (4 / 6 / 8); abandono mensual (15 / 10 / 7 %); CAC ($80.000 / $40.000 / $20.000); costos fijos de $3,5 M/mes (coordinador ~$2,6 M, legal y contador $0,5 M, nube $0,15 M, herramientas $0,25 M); costo de soporte de $300 por paseo.
2. **Demanda (lámina 9):** 10 / 20 / 30 % de hogares que pagan paseador y 2 / 4 / 8 paseos al mes; el ticket de la mezcla ($17.450: 50 % individual 30 min, 30 % individual 60 min, 20 % grupal 60 min).
3. **SOM (lámina 8):** 0,5 / 1,5 / 3 % del SAM del piloto.
4. **Plan (láminas 18 y 19):** 12 semanas de operación y 6–8 de preparación; 3 paseos por día por paseador; todos los umbrales de la tabla de decisión; comisión de lanzamiento de 15 % para los primeros 50 paseadores; CAC meta ≤ $40.000.
5. **Cálculos que descansan en supuestos del estudio:** el segmento estratos 4–6 (tenencia por localidad de 2021, 65,8 % de perros igual en todas las localidades, estrato del predio = estrato del hogar).
6. **Provisionales del repo (Dato, pero marcados «provisional» en el código):** tarifas, comisión de 20 %, radios y umbrales de alertas.

Los **Cálculo** de equilibrio, capital, LTV/CAC y sensibilidad son derivados de esos supuestos: son tan sólidos como ellos.

## Cómo se verificó
- Capturas headless a 1920×1080 de las láminas clave (2, 5, 6, 8, 10, 11, 12, 13, 16, 17, 21, 22, 26); `?estatico` para estados deterministas.
- PDF: `_herramientas/exportar-pdf.sh inversionistas` → 26 páginas. Sin URL de red en tiempo de ejecución (solo espacios de nombres SVG y el enlace `https://app.mywaggo.com`).
- Cada cifra se copió del estudio y se contrastó con su documento (tablas 1 y de sensibilidad de `03`; `02` §3 y §5; `05` §2 y §6).

## Qué no se pudo verificar
- Las fuentes del estudio no se reabrieron: se confía en la nota de cada una en `fuentes.md` (por ejemplo, [3][4] son prensa sobre la Encuesta Multipropósito 2025; [30], [31], [32] no se usan).
- No se revisaron los cálculos del modelo de 24 meses del estudio con una hoja propia; se reprodujeron solo las identidades simples (margen $1.283, equilibrio 3,5 M / 1.250 = 2.800, SOM, GMV).
- Reproducción fluida de animaciones y otros navegadores: igual que en las otras presentaciones.

## Pendiente de confirmar por el PO
1. Que los umbrales, el piloto de 12 semanas y la comisión de lanzamiento de 15 % sean los que quiere proponer.
2. Quién está en el equipo (lámina 24).
3. Si las capturas reales, con mapas difuminados, pueden mostrarse a inversionistas.
4. Si se mantiene la mención de la ficha [18] de Google Play (seguro SURA y primer paseo gratis de Wakypet).
5. Revisión de abogado y contador de lo marcado ⚖️ (IVA sobre la comisión, retenciones, ICA, relación con paseadores).
