# 05 — Plan de lanzamiento en Bogotá

> Consulta: 2026-10-28. Fuentes en [`fuentes.md`](fuentes.md). Etiquetas: **Dato**, **Cálculo**, **Supuesto**. Los umbrales y tiempos son supuestos propuestos para que el PO los apruebe o ajuste.

## Recomendación
**Empezar en un solo núcleo contiguo: Usaquén sur + Chapinero norte** (UPZ Santa Bárbara, Usaquén, Country Club, Chicó Lago y El Refugio), y dejar Los Cedros como primera ampliación.

Por qué:
1. **Usaquén** es la localidad con más hogares con perro en estratos 4–6 que se pueden estimar con datos confiables: **49.457** (Cálculo, `02`), con **80,2 %** de predios residenciales en estratos 4–6 [11] y dos zonas caninas oficiales [46].
2. **Chapinero** tiene la mayor proporción de estrato 6 de la ciudad entre las revisadas (**42,9 %** de sus predios residenciales [11]), la zona canina del Parque Chicó Norte [46] y es vecina de Usaquén: juntas suman **64.906** hogares con perro en estratos 4–6 (Cálculo, `02`).
3. El matching de Waggo busca paseadores a **menos de 5 km** (Waggo, repo: R13) y la geocerca es de **1,5 km** (R8): un núcleo compacto concentra oferta y demanda; una reseña de Wakypet dice que es "sencillo que acepten tus paseos, siempre y cuando estés en una zona central" [18].
4. Las 5 UPZ suman **101.053 hogares** proyectados a 2026 [6] (Cálculo: 36.806 + 18.076 + 9.825 + 18.714 + 17.632); con Los Cedros (63.698) llegan a 164.751.

**Suba** tiene el mayor número estimado (68.446) pero con un porcentaje de estrato 4–6 reconstruido (~52 %, ⚠️ ver `02`), un territorio mucho más grande y **ninguna** zona canina en la lista oficial [46]: es la fase 3.

## 1. Ranking de localidades candidatas

| # | Localidad | Hogares con perro estrato 4–6 (Cálculo, `02`) | % predios estrato 4–6 [11] | Zonas caninas oficiales [46][47] | Cercanía al núcleo | Competencia visible | Puntaje |
|---|---|---|---|---|---|---|---|
| 1 | **Usaquén** | 49.457 | 80,2 % | 2 (Villas de Aranjuez, Quintas de La Sabana) | Núcleo | Wakypet/Mywak cubren Bogotá sin detalle por zona [15][20] | 14 |
| 2 | **Chapinero** | 15.449 | 78,3 % (42,9 % estrato 6) | 1 (Chicó Norte) | Núcleo | Perfiles PetBacker y PaseaPerros en Chapinero [23][26] | 12 |
| 3 | Teusaquillo | 16.237 | 83,4 % | 1 estructurante (Simón Bolívar) | Vecina de Chapinero | — | 11 |
| 4 | Suba | 68.446 ⚠️ | ~51,9 % ⚠️ | 0 | Vecina de Usaquén (extensa) | — | 8 |
| 5 | Fontibón | 19.055 | 53,9 % | 0 | Lejos | — | 5 |
| 6 | Barrios Unidos | 8.264 | 56,4 % | 0 | Vecina de Chapinero/Teusaquillo | — | 5 |
| 7 | Engativá | 11.733 | 13,7 % | 1 (San Andrés) | Lejos | — | 5 |

Puntaje (Supuesto de método, para hacer explícito el criterio): volumen estrato 4–6 (≥40 mil = 4, 15–40 mil = 3, 10–15 mil = 2, <10 mil = 1) + % estrato 4–6 (≥75 % = 4, 50–75 % = 2, <50 % = 1) + zonas caninas (2 = 3, 1 = 2, 0 = 0) + cercanía (núcleo = 3, vecina = 2, lejos = 0). La presencia de competidores **no** puntúa porque no encontré dato público por localidad.
Contigüidad de las localidades: observación del mapa de Bogotá, no de una fuente citada; verificar con el mapa de localidades de IDECA.

## 2. Tamaño y duración del piloto
| Parámetro | Propuesta | Etiqueta | Base |
|---|---|---|---|
| Dueños | hasta **500** | Dato del repo | RNF-006 (R16) |
| Paseadores | hasta **50** | Dato del repo | RNF-006 (R16) |
| Duración | 12 semanas de operación + 6–8 de preparación | Supuesto | Tiempo para observar repetición a 30 y 60 días |
| Meta de volumen | 2.800 paseos/mes al cierre del piloto (punto de equilibrio operativo base, `03`) | Cálculo | 3,5 M / 1.250 |
| Dueños activos necesarios | ~467 con 6 paseos/mes | Cálculo | 2.800 / 6 — cabe en los 500 del piloto |
| Capacidad de oferta | 50 paseadores × 3 paseos/día × 22 días = 3.300 paseos/mes | Cálculo con Supuesto (3 paseos/día) | Cubre la meta con 18 % de holgura |

## 3. Oferta de paseadores
**Reclutar:**
- Bolsas de empleo por horas (Doggy Walker paga **$8.000/hora** [27]); Waggo paga **$12.400** por paseo individual de 30 min y **$18.400** por 60 min (R5): mensaje de reclutamiento basado en ingreso por paseo (Dato del repo vs. Dato de mercado).
- Grupos de paseadores informales del núcleo y cursos de primeros auxilios caninos (canal sin costo publicado: No encontré dato público).
- Riesgo: Wakypet cobra 10–15 % [17] y Waggo 20 % (R1). Propuesta (Supuesto): comisión de lanzamiento de 15 % para los primeros 50 paseadores durante el piloto, con su costo visible en `03` (reduce el margen por paseo individual 30 min de $1.283 a ~$632; Cálculo: 15.500 × 15 % / 1,19 − 1.322).

**Verificar (antes del primer paseo):**
1. Lo que ya existe: perfil con documento cifrado y aprobación manual del administrador (R12).
2. Agregar (proceso operativo, sin esperar al proveedor): consulta de antecedentes judiciales y disciplinarios, como publica Wakypet [16]; **certificado de primeros auxilios para perros**, que la Ley 2480 de 2025 exigirá (art. 9 num. 1) [41]; adhesión al protocolo IDPYBA (máx. 8 perros, chaleco, arnés) [48].
3. Paseo de prueba acompañado (Supuesto).

## 4. Canales de adquisición (dueños)
| Canal | Costo de referencia | Etiqueta | Fuente |
|---|---|---|---|
| Anuncios Meta geolocalizados en las 5 UPZ | CPC ~US$0,22 ≈ $700 | Dato (benchmark privado) | [49] |
| Activación en zonas caninas (Chicó Norte, Villas de Aranjuez, Quintas de La Sabana) | No encontré dato público | — | [46] |
| Alianzas con administraciones de conjuntos y veterinarias del núcleo | No encontré dato público | — | — |
| Primer paseo gratis (práctica de Wakypet) | $15.500 por dueño nuevo (precio de 30 min, R5) | Cálculo | [18] |
| Referidos dueño a dueño | No encontré dato público | — | — |
**Meta de CAC del piloto:** ≤ $40.000 (Supuesto base de `03`).

## 5. Precios de lanzamiento
| Opción | Individual 30 min | Margen Waggo (neto B, `03`) | Comentario |
|---|---|---|---|
| A. Tarifa actual del código | $15.500 | $1.283 | 11,5 % sobre Wakypet 2024 ($13.900 [22]) |
| B. Igualar a Wakypet 2024 | $13.900 | ~$1.065 | Cálculo: 13.900 × 20 % / 1,19 − (13.900 × 2,65 % + 700) × 1,19 = 2.336 − 1.271 |
| C. Empujar 60 min | $23.000 | $2.307 | Mejor margen; validar demanda |
**Propuesta (Supuesto):** lanzar con la tarifa actual (A) y el paseo de 60 min destacado (C), con primer paseo gratis como costo de adquisición, y **probar** B en una parte de los dueños para medir sensibilidad al precio. Evitar el grupal de 30 min como producto de entrada (margen $464, `03`). Los precios son "provisional" en el código (R4): cualquier cambio es configuración, no desarrollo (R1).

## 6. Métricas y umbrales (seguir / ajustar / parar)
| Métrica | Umbral para seguir (Supuesto) | Si falla |
|---|---|---|
| Solicitudes aceptadas en < 10 min | ≥ 85 % | Más paseadores o achicar zona |
| Paseos completados / aceptados (sin no-show) | ≥ 95 % | Revisar verificación y penalidades |
| Dueños con ≥ 2 paseos en 30 días | ≥ 40 % | Revisar producto/precio |
| Paseos por dueño activo al mes | ≥ 6 (base `03`) | Paquetes/suscripción |
| Margen real por paseo (con pasarela real) | ≥ $1.250 | Paquetes, duración, comisión |
| CAC | ≤ $40.000 | Cambiar canal |
| LTV / CAC | ≥ 1,9 (base) — **parar** si < 1 | Rediseñar modelo |
| Emergencias atendidas por una persona en < 5 min | 100 % | No ampliar |
| Ingreso del paseador por hora | ≥ $8.000 (referencia [27]) | Ajustar comisión |

Regla (Supuesto): **seguir** si se cumplen las 3 primeras y LTV/CAC ≥ 1; **ajustar** si fallan 1–2; **parar o rediseñar** si LTV/CAC < 1 al cierre.

## 7. Fases e hitos
| Fase | Duración (Supuesto) | Hitos |
|---|---|---|
| **F0 Preparación** | 6–8 semanas | Pasarela real elegida y cotizada (Wompi/Mercado Pago; hoy simulada, R6) · seguro o póliza contratados · verificación de antecedentes + primeros auxilios · panel de emergencias con persona de guardia (slice pendiente, R12) · push (pendiente, R11) · proveedor de mapas para producción (los tiles públicos de OSM son solo para desarrollo/piloto, R7) · términos, privacidad y autorización de datos (Ley 1581 [44], Ley 1480 [45]) revisados por abogado · lista de espera y encuesta de demanda (n ≥ 300) en el núcleo |
| **F1 Piloto cerrado** | 12 semanas | 50 paseadores verificados · hasta 500 dueños en las 5 UPZ · medición semanal de la tabla 6 |
| **F2 Ampliación norte** | 3 meses | Los Cedros (63.698 hogares [6]) y Teusaquillo, si F1 pasa umbrales |
| **F3 Suba** | según F2 | Validar antes el % de estrato de Suba en el PDF de Catastro [11] y la EM 2025 |

## 8. Riesgos y mitigación
| Riesgo | Evidencia | Mitigación |
|---|---|---|
| Pocos paseadores por comisión más alta que Wakypet | 20 % (R1) vs 10–15 % [17] | Comisión de lanzamiento 15 %; comunicar ingreso por paseo |
| Margen por paseo insuficiente | $464–$1.283 en paseos cortos (`03`) | Paquetes (pasarela $593 vs $1.322 por paseo), 60 min, tarifa de servicio |
| Regulación de paseadores (Ley 2480) | Primeros auxilios obligatorios, registro, multas 5–20 SMMLV [41] | Incluir el certificado en la verificación desde el piloto |
| Riesgo laboral/seguridad social de plataformas | Ley 2466/Decreto 991 para reparto [42] | Concepto legal antes de escalar |
| Incidente grave con una mascota | Quejas de seguridad en Wag! [29]; competidores aseguran con SURA [18][20] | Póliza, protocolo de emergencia con persona de guardia |
| Reacción de la competencia | Wakypet da el primer paseo gratis [18] | Diferenciar por alertas y pago retenido (`04`), no por precio |
| Demanda menor a la supuesta | No hay dato público de penetración (`02`) | Encuesta previa y lista de espera; no invertir en pauta antes de F1 |
| Datos de salud y ubicación | Datos sensibles, Ley 1581 [44] | Ya se cifran notas médicas (R14); política de tratamiento |
