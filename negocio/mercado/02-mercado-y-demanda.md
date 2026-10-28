# 02 — Mercado y demanda en Bogotá

> Consulta: 2026-10-28. Fuentes en [`fuentes.md`](fuentes.md). Etiquetas: **Dato**, **Cálculo** (fórmula visible), **Supuesto** (con rango bajo / medio / alto).

## 1. Hogares y tenencia de perros

| Indicador | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Hogares en Bogotá urbana (EM 2025) | ~2,9 millones | Dato (prensa que reporta la EM 2025) | [3] |
| Hogares proyectados en Bogotá 2026 (SDP/DANE) | 3.125.885 | Dato | [5] |
| Hogares con al menos una mascota (EM 2025) | 44 % (~1,3 millones); en 2021 eran 40,4 % | Dato | [3][4] |
| Hogares con **perro** (EM 2025) | **27,8 %** del total de hogares (2021: 26,6 %) | Dato (dos fuentes de prensa; no encontré el boletín oficial 2025) | [3][4] |
| Hogares con gato (EM 2025) | 22,8 % (2021: 17,7 %) | Dato | [3][4] |
| Hogares con mascota 2021 (fuente oficial) | 40,2 %; de ellos 65,8 % con perro y 43,7 % con gato | Dato | [1][2] |
| **Hogares con perro en Bogotá** | **806.200** (con 2,9 M de hogares) a **868.996** (con la proyección 2026) | Cálculo: 2.900.000 × 27,8 % y 3.125.885 × 27,8 % | [3][5] |
| Tamaño medio del hogar | 2,71 personas (2025); ~3 en 2017 | Dato | [3] |

**Tendencia:** la tenencia de perros subió 1,2 puntos (26,6 % → 27,8 %) y la de gatos 5,1 puntos entre 2021 y 2025 [3]. Los hogares son más pequeños (2,71 personas) [3]. **Lectura (no es dato):** más hogares de una o dos personas que trabajan fuera es el perfil que más necesita paseador; falta un dato que lo confirme (ver "No encontré").

## 2. Población de perros

| Fuente | Perros | Gatos | Año | Nota |
|---|---|---|---|---|
| SDS, proyección (estudios poblacionales 2013 y 2018) | 1.135.387 | 267.803 | 2023 | [8] |
| SDS, denominador de vacunación | **1.192.158** | 281.194 | 2024 | [7] |
| SDS, denominador de vacunación (nueva base "Estimativo poblacional SDS 2023") | **1.832.392** | 905.811 | 2025 | [7]; total 2.738.203 animales [9] |
| IDPYBA (citado por prensa) | "casi 3,5 millones" de perros y gatos (sin separar) | — | 2025 | [10] |

**Las cifras no son consistentes entre sí** (1,19 M vs 1,83 M perros de un año a otro por cambio de base). La propia SDS advierte que las proyecciones "pueden no captar de manera exacta las dinámicas demográficas" [9]. Para este estudio se usa el número de **hogares** con perro (EM), no el de perros, porque Waggo vende a hogares.

## 3. Distribución por localidad

**Lo que hay:** la EM 2021 publica el % de hogares con **alguna mascota** por localidad [1]; no hay % de hogares con **perro** por localidad publicado (No encontré dato público). La SDS reporta que las localidades con más animales vacunados son Suba, Engativá, Kennedy y Fontibón [9]; El Tiempo, citando la EM 2021, dice que Suba, Kennedy y Engativá concentran más perros y gatos [10].

**Estrato:** no hay estrato de los hogares con perro (No encontré dato público). Se usa como aproximación la participación de **predios residenciales en estratos 4, 5 y 6** de cada localidad según el Censo Inmobiliario 2025 de Catastro [11].

| Localidad | Hogares 2026 [5] | % hogares con mascota 2021 [1] | Hogares con perro (est.) | % predios estrato 4–6 (2025) [11] | Hogares con perro en estrato 4–6 (est.) |
|---|---|---|---|---|---|
| Usaquén | 244.699 | 38,3 % | 61.668 | 80,2 % (38,8 + 17,2 + 24,2) | **49.457** |
| Suba | 487.658 | 41,1 % | 131.881 | ~51,9 % (29,6 + 19,8 + 2,5) ⚠️ reconstruido | **68.446** |
| Fontibón | 154.392 | 34,8 % | 35.353 | 53,9 % (48,4 + 5,5 + 0) | 19.055 |
| Teusaquillo | 75.286 | 39,3 % | 19.469 | 83,4 % (74,5 + 8,9 + 0) | 16.237 |
| Chapinero | 82.832 | 36,2 % | 19.730 | 78,3 % (24,4 + 11,0 + 42,9) | **15.449** |
| Engativá | 324.567 | 40,1 % | 85.640 | 13,7 % (12,8 + 0,9 + 0) | 11.733 |
| Barrios Unidos | 58.757 | 37,9 % | 14.653 | 56,4 % (51,7 + 4,7 + 0) | 8.264 |

- **Cálculo** (hogares con perro, est.) = hogares 2026 × % hogares con mascota 2021 × 65,8 % (proporción de hogares con mascota que tienen perro en Bogotá, 2021 [2]).
- **Cálculo** (estrato 4–6) = hogares con perro × % de predios residenciales en estratos 4–6.
- **Supuestos explícitos:** (a) el % de mascota por localidad de 2021 se mantiene (en la ciudad subió de 40,2 % a 44 %, así que esto **subestima**); (b) la proporción de perros (65,8 %) es igual en todas las localidades; (c) el estrato de los predios representa el de los hogares con perro. Los tres deben validarse con los microdatos de la EM 2025.
- ⚠️ **Lectura del PDF de Catastro:** en Usaquén y Chapinero los conteos y porcentajes coinciden. En las demás, las columnas del PDF salen desplazadas una fila al extraer el texto; se usaron los porcentajes de "Participación 2025", que suman 100 %. En **Suba** la columna de porcentajes también sale desordenada: se reconstruyó dividiendo los conteos por el total implícito (15.400 predios "sin estrato" = 3,1 %). Verificar Suba en el PDF original [11] antes de presentarlo.
- Otras localidades (Kennedy, Bosa, Ciudad Bolívar, etc.) tienen más hogares con mascota (hasta 45,5 % en Antonio Nariño [1]) pero casi sin predios en estratos 4–6 [11]; se dejan fuera del segmento inicial por precio, no por demanda.

### Concentración dentro de la zona candidata (UPZ)
Hogares proyectados 2026 por UPZ [6] (Dato): Los Cedros 63.698 · Santa Bárbara 36.806 · Pardo Rubio 25.041 · Chicó Lago 18.714 · Usaquén 18.076 · El Refugio 17.632 · Country Club 9.825. Suma de esas siete UPZ contiguas (Usaquén sur y Chapinero norte): **189.792 hogares** (Cálculo). No hay % de perro ni estrato por UPZ publicados (No encontré dato público).

## 4. Gasto en mascotas y tamaño del sector

| Indicador | Valor | Etiqueta | Fuente |
|---|---|---|---|
| Mercado "pet care" Colombia 2025 (Euromonitor) | US$1.700 M (~$6,04 billones) | Dato (prensa) | [13] |
| Mercado "pet care" Colombia 2025 (Gabrica) | $7,4 billones | Dato (estimación de una empresa) | [13] |
| Ventas del sector 2025 (Registro Mercantil CCB) | "superaron los 6 billones"; ~34.000 empresas; crecimiento >80 % en una década | Dato (prensa citando CCB) | [14] |
| Peso de alimentos y veterinaria | 80 %–90 % de las ventas del sector | Dato (prensa citando CCB) | [14] |
| Gasto mensual en alimento por hogar | ~$147.000 (Kantar) | Dato (prensa) | [13] |
| Hogares que usan servicios de guardería, seguros o adiestramiento (Bogotá) | **4 %** de 402 propietarios encuestados | Dato (encuesta SDDE, ~2018–2019, muestra pequeña) | [12] |
| Gasto mensual en mascotas (Bogotá) | <$100.000: 55 %; $100.001–200.000: 30 %; $200.001–500.000: 12 %; >$500.000: 3 % | Dato (misma encuesta SDDE antigua) | [12] |

**Lectura:** el sector es grande, pero el gasto está concentrado en alimento y veterinaria; los servicios como el paseo son una porción pequeña y **no encontré** una cifra pública de su tamaño en Bogotá. La única señal de penetración de servicios (4 %) es antigua y de muestra pequeña [12].

## 5. TAM / SAM / SOM

Precio de referencia: paseo individual de 30 min = **$15.500** (Waggo, repo: R1, R5). Ticket promedio de la mezcla base = **$17.450** (Supuesto, ver `03-viabilidad-financiera.md`: 50 % individual 30 min, 30 % individual 60 min, 20 % grupal 60 min).

### TAM — techo teórico (Bogotá)
- **Hogares:** 806.200 hogares con perro (Cálculo, sección 1).
- **Valor:** 806.200 × 52 paseos/año × $15.500 = **$649.797 millones/año** (Cálculo). **Supuesto** extremo: todos los hogares con perro compran un paseo por semana. No es una demanda esperada; es un techo.

### SAM — hogares con perro en estrato 4–6 en las localidades candidatas
- 7 localidades de la tabla: **188.641 hogares** (Cálculo, suma de la última columna).
- **Zona del piloto (Usaquén + Chapinero):** 49.457 + 15.449 = **64.906 hogares** (Cálculo).
- Valor anual en la zona del piloto, con dos supuestos sin dato público (proporción que pagaría paseador y frecuencia):

| Escenario | % hogares que pagan paseador (Supuesto) | Paseos/mes por hogar (Supuesto) | Hogares | Paseos/mes | Valor bruto anual (GMV) | Comisión 20 % anual |
|---|---|---|---|---|---|---|
| Bajo | 10 % | 2 | 6.491 | 12.981 | $2.718 M | $544 M |
| Medio | 20 % | 4 | 12.981 | 51.925 | $10.873 M | $2.175 M |
| Alto | 30 % | 8 | 19.472 | 155.774 | $32.619 M | $6.524 M |

Fórmulas: hogares = 64.906 × %; paseos/mes = hogares × frecuencia; GMV = paseos/mes × 12 × $17.450; comisión = GMV × 20 %.
Razón de los rangos: no hay dato público de penetración del paseo pagado; el 4 % de la SDDE [12] mide otros servicios y es antiguo. **Este es el supuesto más importante a medir en el piloto.**

### SOM — lo que Waggo puede capturar en 12–24 meses
| Escenario | % del SAM del piloto (Supuesto) | Hogares activos |
|---|---|---|
| Bajo | 0,5 % | 325 |
| Medio | 1,5 % | 974 |
| Alto | 3,0 % | 1.947 |

Cálculo: 64.906 × %. Referencia interna: el repo dimensiona el piloto para **500 dueños / 50 paseadores** (Waggo, repo: R16). Referencia externa: Wakypet declara 75.000+ usuarios registrados en todo el país [15] (afirmación propia, no auditada).

## 6. Qué falta y cómo conseguirlo
| Dato | Cómo |
|---|---|
| % de hogares que pagan paseador y frecuencia | Encuesta a la lista de espera (n ≥ 300) antes del piloto; luego, datos reales del piloto |
| % de hogares con perro por localidad y estrato (2025) | Microdatos de la EM 2025 (DANE/SDP) cuando estén disponibles |
| Precio que el mercado acepta | Prueba de precio en el piloto (ver `05`) |
| Población canina por localidad | Solicitud formal a la SDS (base del "Estimativo poblacional SDS 2023") |
