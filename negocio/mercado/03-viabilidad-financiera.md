# 03 — Viabilidad financiera (resumen)

> Consulta: 2026-10-28. Fuentes en [`fuentes.md`](fuentes.md). Etiquetas: **Dato**, **Cálculo**, **Supuesto** (rango bajo / medio / alto). No es asesoría tributaria ni legal: lo marcado ⚖️ lo debe validar un contador o abogado.
> Tasa de cambio usada: **TRM $3.185,01** (vigente 2026-10-23) [39]. No encontré la del 2026-10-28.

## Conclusión corta
- Con la tarifa y la comisión actuales del código (20 %), Waggo **retiene entre $464 y $4.355 por paseo** después de pasarela e IVA sobre la comisión, según tipo y duración (Cálculo, tabla 1). En el paseo más vendido esperado (individual 30 min) retiene **$1.283** de $15.500 (8,3 %).
- La **pasarela con cargo fijo de $700** se come entre el 5 % y el 12 % del precio del paseo (Cálculo, tabla 1): es la variable de costo más pesada en paseos baratos.
- En el escenario base (supuestos abajo) **no se alcanza el punto de equilibrio en 24 meses** y se necesitan **~$78 millones** de capital de operación; el resultado depende sobre todo de **costos fijos, frecuencia de paseos por dueño y margen por paseo**, no del volumen (Cálculo, sección 5).

## 1. Economía unitaria por paseo

**Hechos del repo:** precio = base + por minuto × minutos, redondeado a $100; comisión = 20 % del total; paseador = total − comisión (Waggo, repo: R1, R2). Individual: $8.000 + $250/min; grupal: $5.000 + $150/min; duración 30–120 min (R1, R3). El precio **no** cambia con el número de perros (1–3) (R18). Todos son valores "provisional" (R4).

**Pasarela:** Wompi publica **2,65 % + $700 + impuestos por transacción aprobada** [33], confirmado por Enter.co como plan avanzado "2,65 % + $700 por transacción, más IVA" [34]. Mercado Pago: 3,49 % + IVA en link de pago según un blog (fuente secundaria, validar) [35]. El repo aún no elige pasarela (Stripe o MercadoPago, R6); no encontré tarifa de Stripe para Colombia.
**IVA:** tarifa general 19 % (art. 468 E.T.) [43]. Se aplica al costo de la pasarela ("+ impuestos" [33]) y, ⚖️ si Waggo es responsable de IVA, a su comisión. Hoy el código no separa IVA.

### Tabla 1 — Margen de Waggo por paseo (Cálculo)
Fórmulas: pasarela = (total × 2,65 % + $700) × 1,19 · IVA comisión = comisión − comisión / 1,19 · neto A = comisión − pasarela · neto B = comisión − IVA comisión − pasarela.

| Paseo | Total (R1) | Comisión 20 % | Paseador | Pasarela + IVA | % del total | IVA en comisión | Neto A (sin IVA en comisión) | **Neto B (con IVA)** |
|---|---|---|---|---|---|---|---|---|
| Individual 30 min | 15.500 | 3.100 | 12.400 | 1.322 | 8,5 % | 495 | 1.778 | **1.283** |
| Individual 45 min | 19.300 | 3.860 | 15.440 | 1.442 | 7,5 % | 616 | 2.418 | 1.802 |
| Individual 60 min | 23.000 | 4.600 | 18.400 | 1.558 | 6,8 % | 734 | 3.042 | **2.307** |
| Individual 90 min | 30.500 | 6.100 | 24.400 | 1.795 | 5,9 % | 974 | 4.305 | 3.331 |
| Individual 120 min | 38.000 | 7.600 | 30.400 | 2.031 | 5,3 % | 1.213 | 5.569 | 4.355 |
| Grupal 30 min | 9.500 | 1.900 | 7.600 | 1.133 | 11,9 % | 303 | 767 | **464** |
| Grupal 60 min | 14.000 | 2.800 | 11.200 | 1.274 | 9,1 % | 447 | 1.526 | 1.078 |
| Grupal 120 min | 23.000 | 4.600 | 18.400 | 1.558 | 6,8 % | 734 | 3.042 | 2.307 |

Notas:
- Hoy la pasarela la absorbe Waggo: `FareCalculator` reparte total = comisión + paseador, sin costo de pasarela (R2).
- La retención (escrow) se hace al pedir y se cobra al terminar (R6). **No encontré dato público** de si Wompi o Mercado Pago cobran por una autorización liberada (paseo cancelado) ni de la tarifa de dispersión al paseador; ambas pueden bajar el margen. Cotizar.
- ⚖️ Retenciones en la fuente sobre lo que se dispersa a paseadores (personas naturales) e ICA de Bogotá: no las cuantifico. La tarifa ICA cambia con el Acuerdo 1084 de 2026 (no pude verificar la tarifa aplicable; ver "No encontré" en `fuentes.md`).

### Costo de nube por paseo (AWS, us-east-1, precios públicos)
| Pieza (según INF-001, R15) | Precio público | Mensual (730 h) | Fuente |
|---|---|---|---|
| ECS Fargate 0,25 vCPU / 0,5 GB (x86) | US$0,040478 vCPU-h; US$0,004446 GB-h | US$9,01 | [36] |
| Application Load Balancer | US$0,0225/h + US$0,008/LCU-h (Supuesto: 1 LCU) | US$22,27 | [37] |
| RDS PostgreSQL db.t4g.micro Single-AZ | US$0,016/h | US$11,68 | [38] |
| Almacenamiento RDS, S3, CloudFront, Route 53, Secrets | No extraje precio público; el repo estima ~US$5 | — | R15 |
| **Total** | | **US$42,96 + ~US$5 ≈ US$48** ≈ **$153.000/mes** | Cálculo: 48 × 3.185,01 |

Por paseo, con 2.500 paseos/mes: $153.000 / 2.500 = **$61** (Cálculo). La nube **no** es una variable relevante a esta escala.

### Costo de soporte
No encontré dato público de costo de soporte por paseo en Colombia. **Supuesto:** $300 por paseo (rango $200–$500), equivalente a ~9 minutos de un coordinador con salario mínimo más prestaciones. Referencia: SMMLV 2026 $1.750.905 + auxilio de transporte $249.095 [40].

## 2. Supuestos de los escenarios

| Variable | Conservador | Base | Optimista | Razón |
|---|---|---|---|---|
| Margen por paseo después de pasarela, IVA y soporte | $1.000 | $1.250 | $1.700 | Supuesto. Base = mezcla 50 % ind. 30 min, 30 % ind. 60 min, 20 % grupal 60 min → $1.549 (Cálculo con tabla 1, neto B) − $300 de soporte. Conservador: mezcla más corta (60/20/20 con grupal 30) → $1.324 − $300. Optimista: mezcla más larga (30 % ind. 30, 50 % ind. 60, 20 % ind. 90 → $2.205) − $500 |
| Paseos/mes al mes 12 | 600 | 2.500 | 6.000 | Supuesto. Rampa lineal desde el mes 1 |
| Crecimiento meses 13–24 | ×1,5 | ×2 | ×2,5 | Supuesto |
| Paseos al mes por dueño activo | 4 | 6 | 8 | Supuesto (1 a 2 por semana). No encontré dato público |
| Abandono mensual de dueños | 15 % | 10 % | 7 % | Supuesto. No encontré dato público |
| CAC (costo por dueño activo nuevo) | $80.000 | $40.000 | $20.000 | Supuesto. Referencia: CPC de Meta en Colombia ~US$0,22 ≈ $700 [49]; con 1 %–3,5 % de conversión clic → primer paseo, CAC ≈ $20.000–$70.000 (Cálculo: 700 / 0,035 y 700 / 0,01), más el primer paseo gratis si se copia a Wakypet [18] |
| Costos fijos mensuales | $3,5 M | $3,5 M | $3,5 M | Supuesto: 1 coordinador de operación y soporte (~$2,6 M con prestaciones), contador/legal externo $0,5 M, nube $0,15 M, herramientas $0,25 M. **Excluye salarios de fundadores y del equipo de desarrollo** |

## 3. Resultados (Cálculo, modelo mensual de 24 meses)
Fórmulas por mes *t*: paseos(*t*) = rampa; dueños activos = paseos / frecuencia; dueños nuevos = max(0, Δactivos) + abandono × activos(*t*−1); marketing = nuevos × CAC; flujo = paseos × margen − fijos − marketing.

| Escenario | Paseos/mes (m12 → m24) | Dueños activos (m12 → m24) | Flujo mes 12 | Flujo mes 24 | Primer mes con flujo ≥ 0 | **Necesidad de capital 12 m** | **Necesidad de capital 24 m** |
|---|---|---|---|---|---|---|---|
| Conservador | 600 → 900 | 150 → 225 | −$5,6 M | −$5,7 M | No llega | **$60,0 M** | **$125,4 M** |
| Base | 2.500 → 5.000 | 417 → 833 | −$3,3 M | −$1,8 M | No llega | **$47,5 M** | **$77,5 M** |
| Optimista | 6.000 → 15.000 | 750 → 1.875 | +$4,5 M | +$17,6 M | Mes 7 | $12,0 M (máximo acumulado negativo) | Positivo (+$139,6 M acumulado) |

**Punto de equilibrio operativo** (sin marketing) = costos fijos / margen por paseo: conservador 3.500 paseos/mes, **base 2.800 paseos/mes (~467 dueños activos con 6 paseos/mes)**, optimista 2.059 (Cálculo).

**Valor de vida y CAC (rangos supuestos hasta tener datos del piloto):** LTV = margen × frecuencia / abandono.
| | Conservador | Base | Optimista |
|---|---|---|---|
| LTV | $26.667 | $75.000 | $194.286 |
| LTV / CAC | 0,33 | 1,9 | 9,7 |
Una relación LTV/CAC menor que 1 significa que cada cliente adquirido destruye valor.

## 4. Palancas (Cálculo)
| Palanca | Efecto por paseo individual 30 min | Riesgo |
|---|---|---|
| Cobrar paquetes de 8 paseos en una sola transacción | Pasarela por paseo baja de $1.322 a **$593** (+$729): (124.000 × 2,65 % + 700) × 1,19 / 8 | Choca con la retención por paseo del diseño actual (R6); requiere decisión de producto |
| Subir comisión a 25 % | +$651 por paseo: (15.500 × 25 % / 1,19 − 1.322) − (15.500 × 20 % / 1,19 − 1.322) | Wakypet cobra 10–15 % al paseador [17]; puede costar oferta |
| Trasladar la pasarela al dueño como tarifa de servicio | +$1.322 | Precio final $16.822, 21 % sobre Wakypet 2024 ($13.900 [22]) |
| Empujar paseos de 60 min | Margen $2.307 vs $1.283 | Depende de la demanda real (no hay dato) |
| Grupal 30 min | Solo $464 de margen | Evitar como producto de entrada |

## 5. Sensibilidad (escenario base, acumulado a 24 meses = −$77,5 M)
Cada variable se mueve ±30 % dejando las demás fijas (Cálculo con el mismo modelo):

| Variable | Peor (−30 % o +30 % según el caso) | Mejor | Amplitud |
|---|---|---|---|
| **Costos fijos** | −$102,7 M | −$52,3 M | **$50,4 M** |
| **Paseos por dueño al mes** | −$108,3 M | −$61,0 M | **$47,3 M** |
| **Margen por paseo** | −$101,0 M | −$54,1 M | **$46,9 M** |
| CAC | −$99,0 M | −$56,0 M | $43,0 M |
| Abandono mensual | −$89,0 M | −$66,0 M | $23,0 M |
| Volumen (paseos al mes 12) | −$79,5 M | −$75,6 M | $3,9 M |

**Lectura:** crecer en volumen casi no cambia el resultado porque el margen de cada paseo apenas cubre su costo de adquisición. Lo que mueve la viabilidad es **cuántas veces pasea cada dueño (frecuencia/retención)**, **cuánto queda por paseo** (pasarela, duración, comisión) y **mantener los fijos bajos**. Esto define qué medir en el piloto (`05`).

## 6. Marco legal y regulatorio (⚖️ validar con abogado)
| Tema | Norma / autoridad | Qué implica para Waggo | Qué validar |
|---|---|---|---|
| Servicios a animales de compañía | **Ley 2480 de 2025 "Ley Kiara"** (16-jul-2025) [41] | Aplica a "paseadores de perros" (art. 2); máximo **8 perros por paseador** (art. 9 num. 7); personal "certificado en primeros auxilios para perros" y sin sanciones por maltrato (art. 9 num. 1); registro en plataforma del Ministerio de Ambiente (art. 5); reglamento técnico en 18 meses (art. 4, ~ene-2027); transición de **2 años** (art. 21, ~jul-2027); multas de 5 a 20 SMMLV (art. 13); póliza de responsabilidad **opcional** (art. 18) | Si Waggo es "prestador" o solo plataforma; qué exige el reglamento técnico; cómo verificar el certificado de primeros auxilios en RF-002/003 |
| Protocolo distrital | Resolución 061 de 2019 IDPYBA, protocolo **no obligatorio** [48] | Máx. 8 perros, chaleco, mayoría de edad, arnés | Adoptarlo como estándar de calidad |
| Datos personales | **Ley 1581 de 2012**, vigilada por la SIC [44] | Autorización "previa e informada" (art. 9); datos de salud son **sensibles** (art. 5) — aplica a ubicación de personas y a notas médicas de la mascota (R14) | Política de tratamiento, aviso de privacidad, autorización en el registro; si aplica el Registro Nacional de Bases de Datos |
| Comercio electrónico y consumidor | **Ley 1480 de 2011** [45] | Art. 50: identidad del proveedor, permitir cancelar antes de concluir; art. 51: **reversión del pago** con tarjeta en 5 días hábiles; art. 47: retracto | Términos y condiciones, política de cancelación y cómo convive la reversión con la retención (escrow) |
| Relación con paseadores | **Ley 2466 de 2025** y **Decreto 991 de 2026** (4-ago-2026) [42] | Regula a trabajadores digitales **de reparto**: plataforma paga 60 % de salud y pensión y el 100 % de ARL para ingresos < 1 SMMLV; exigible 12 meses después de que el MinSalud certifique la PILA | Si un paseador de una plataforma tipo Uber puede considerarse en este régimen o en una relación laboral; contrato de prestación de servicios |
| Responsabilidad ante accidentes | Ley 2480 de 2025 art. 18 (póliza opcional) [41] | Competidores ofrecen seguro SURA [18][20] | Cotizar póliza de responsabilidad civil y de la mascota (no encontré precio público para paseadores) |
| Tributario | IVA 19 % (art. 468 E.T.) [43]; ICA Bogotá (Acuerdo 1084 de 2026, no verificado) | Ver tabla 1 | Si la comisión lleva IVA; si Waggo debe retener en la fuente a paseadores; tarifa ICA |
