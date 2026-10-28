# 00 — Resumen ejecutivo: Waggo en Bogotá

> Estudio con datos públicos consultados el **2026-10-28**. Cada cifra lleva su fuente (`[n]` → [`fuentes.md`](fuentes.md); "R" = hechos del repositorio de Waggo). **Dato** = publicado; **Cálculo** = derivado con fórmula en el documento indicado; **Supuesto** = decisión a validar.

## Conclusiones

1. **Hay mercado grande, pero no sabemos cuánto paga por paseo.** Bogotá tiene ~2,9 millones de hogares y el **27,8 %** tiene perro (EM 2025) [3][4] → **~806.000 hogares con perro** (Cálculo, `02`). El sector de mascotas en Colombia vende más de **$6 billones al año** [13][14], pero el 80–90 % es alimento y veterinaria [14]. **No encontré dato público** de cuántos hogares pagan paseador; la única señal es antigua: 4 % de 402 propietarios usaba guardería, seguros o adiestramiento [12].
2. **El segmento inicial está en el norte.** Usaquén y Chapinero suman **~64.900 hogares con perro en predios de estrato 4–6** (Cálculo, `02`, con hogares 2026 [5], tenencia por localidad 2021 [1] y estratos de Catastro 2025 [11]). Usaquén tiene **80,2 %** de sus predios residenciales en estratos 4–6 y Chapinero **42,9 %** en estrato 6 [11].
3. **El competidor a vencer es Wakypet, y el mapa en vivo no basta para diferenciarse.** Wakypet tiene **100 mil+ descargas y 3,2 ★ (464 reseñas)** [18], ruta en tiempo real, seguro SURA y verificación de antecedentes [16][18], y cobra al paseador **10–15 %** [17]. Mywak también ofrece GPS en tiempo real y seguro SURA [20][21]. Lo que **no** encontré publicado por ellos y Waggo sí tiene en código: **alertas automáticas** de salida de zona (1,5 km) y detención (10 min), **botón de emergencia** y **pago retenido hasta terminar** (R6, R8, R9) — hoy son hipótesis de valor, sin evidencia directa (`04`).
4. **El margen por paseo es delgado.** Con la tarifa real del código (individual 30 min = **$15.500**, comisión **20 %** = $3.100; R1, R5), Waggo retiene **~$1.283** después de pasarela (Wompi 2,65 % + $700 + impuestos [33][34]) e IVA sobre la comisión (Cálculo, `03`). En un grupal de 30 min retiene **$464**. La nube cuesta ~US$48/mes en total, ~$61 por paseo a 2.500 paseos/mes (Cálculo con precios públicos de AWS [36][37][38]).
5. **La viabilidad depende de la frecuencia y los costos fijos, no del volumen.** Escenario base (supuestos en `03`): punto de equilibrio operativo en **2.800 paseos/mes (~467 dueños activos)**, no se alcanza en 24 meses y requiere **~$47,5 M a 12 meses y ~$77,5 M a 24 meses** (sin salarios de fundadores ni desarrollo). En la sensibilidad, ±30 % en costos fijos, frecuencia o margen por paseo mueve el resultado ~$47–50 M; ±30 % en volumen, solo ~$4 M (Cálculo, `03`).

## Cifras clave
| Cifra | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Hogares con perro en Bogotá | 27,8 % / ~806.200 | Dato / Cálculo | [3][4] |
| Perros con propietario (SDS) | 1.192.158 (2024) a 1.832.392 (2025, nueva base) | Dato, inconsistente entre años | [7] |
| Hogares con perro estrato 4–6, Usaquén + Chapinero | 64.906 | Cálculo | `02` |
| Precio Waggo individual 30 / 60 min | $15.500 / $23.000 | Dato (repo, provisional) | R1, R5 |
| Precio Wakypet individual 30 min (2024) | $13.900 | Dato (prensa 2024) | [22] |
| Comisión Waggo vs Wakypet | 20 % vs 10–15 % | Dato | R1, [17] |
| Margen Waggo por paseo individual 30 min | $1.283 | Cálculo | `03` |
| Capital de operación, escenario base | $47,5 M (12 m) / $77,5 M (24 m) | Cálculo con supuestos | `03` |
| Paseadores: referencia de pago informal | $8.000/hora | Dato | [27] |
| Máximo de perros por paseador (ley) | 8 | Dato | [41] |

## Recomendación de lanzamiento
Piloto cerrado de 12 semanas en **Usaquén sur + Chapinero norte** (UPZ Santa Bárbara, Usaquén, Country Club, Chicó Lago, El Refugio: **101.053 hogares** proyectados a 2026 [6]), con hasta **500 dueños y 50 paseadores** (RNF-006, R16). Antes de lanzar: pasarela real, seguro, verificación de antecedentes y **certificado de primeros auxilios caninos** (exigido por la Ley 2480 de 2025 [41]), emergencias atendidas por una persona y revisión legal. Detalle en `05`.

## Riesgos principales
- **Oferta:** la comisión de 20 % (R1) es mayor que la de Wakypet (10–15 % [17]).
- **Regulación:** Ley 2480 de 2025 (reglamento técnico ~ene-2027, transición ~jul-2027, multas de 5–20 SMMLV) [41]; régimen de plataformas de la Ley 2466 de 2025 / Decreto 991 de 2026, hoy escrito para **reparto** [42] — requiere concepto legal.
- **Margen:** el cargo fijo de pasarela pesa entre 5 % y 12 % del precio (Cálculo, `03`).

## Datos que faltan y cómo conseguirlos
| Falta | Cómo conseguirlo |
|---|---|
| % de hogares que pagan paseador, frecuencia y precio aceptado | Encuesta a lista de espera en el núcleo (n ≥ 300) y datos del piloto |
| Tenencia de **perro** por localidad y por estrato (2025) | Microdatos EM 2025 (DANE/SDP) |
| Retención, frecuencia y CAC reales | Piloto (tabla de umbrales en `05`) |
| Tarifas reales de pasarela (autorización liberada, dispersión) | Cotización con Wompi, Mercado Pago y PayU |
| IVA sobre comisión, retenciones, ICA | Concepto de contador (Acuerdo 1084 de 2026 no verificado) |
| Encaje de los paseadores en la Ley 2466 / relación laboral | Concepto de abogado laboral |
| Costo de póliza de responsabilidad para paseadores | Cotización con aseguradoras |
| Precios y descargas actuales de Mywak | Cliente incógnito; su sitio no publica precios [21] |
| Verificación del % de estrato de Suba | Revisar el PDF del Censo Inmobiliario 2025 [11] |

Documentos: [`01-competencia.md`](01-competencia.md) · [`02-mercado-y-demanda.md`](02-mercado-y-demanda.md) · [`03-viabilidad-financiera.md`](03-viabilidad-financiera.md) · [`04-diferenciales.md`](04-diferenciales.md) · [`05-plan-de-lanzamiento-bogota.md`](05-plan-de-lanzamiento-bogota.md) · [`fuentes.md`](fuentes.md)
