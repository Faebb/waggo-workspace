# 04 — Diferenciales de Waggo

> Consulta: 2026-10-28. Fuentes en [`fuentes.md`](fuentes.md). Cada diferencial dice qué es (con RF y pantalla del repo), qué hace la competencia (con fuente) y cuánta evidencia hay de que al cliente le importe. Sin evidencia = **hipótesis a validar en el piloto**.

## Resumen
| # | Diferencial | ¿Lo tiene la competencia local? | Evidencia de que importa | Veredicto |
|---|---|---|---|---|
| 1 | Alertas automáticas: salida de zona y detención prolongada | No encontré que Wakypet ni Mywak lo publiquen | Indirecta (quejas de no-show y de no saber qué pasó) | **Diferencial real, hipótesis de valor** |
| 2 | Botón de emergencia en el paseo | No encontré que lo publiquen | No encontré evidencia directa | **Diferencial, hipótesis** |
| 3 | Pago retenido hasta terminar (escrow) | PetBacker sí; Wakypet y Mywak no lo publican | Indirecta (quejas por cobros anticipados en Rover, R17) | **Diferencial frente a lo local, hipótesis** |
| 4 | Precio transparente con desglose y "lo que gana el paseador" | Wakypet no muestra desglose en lo publicado | No encontré evidencia | Hipótesis |
| 5 | Chat dentro de la app (sin dar el WhatsApp) | Wakypet usa WhatsApp/llamada; Mywak sí tiene chat | No encontré evidencia | Diferencial débil |
| 6 | Mapa en vivo | **No** es diferencial: Wakypet y Mywak lo anuncian | Wakypet y Mywak lo usan como argumento de venta | Requisito de entrada |
| 7 | Asignación tipo Uber por cercanía | **No** es diferencial: Wakypet funciona igual | — | Requisito de entrada |

**Brechas (lo que la competencia tiene y Waggo no):** seguro para la mascota (SURA en Wakypet [18] y Mywak [20]) y verificación de antecedentes publicada (Wakypet: "antecedentes judiciales y procuraduría" [16]); Waggo verifica a mano y el proveedor de antecedentes está por elegir (Waggo, repo: R12). Con la Ley 2480 de 2025 el certificado de primeros auxilios para perros será obligatorio [41]: convertirlo en parte visible de la verificación sería un diferencial de cumplimiento.

## 1. Alertas automáticas de geocerca y detención (RF-009, RF-010)
- **Qué es:** mientras llega la ruta, el servidor crea una alerta si el paseo sale de un círculo de **1,5 km** alrededor de la recogida o si el paseador lleva **10 minutos** sin alejarse más de 30 m; dueño y paseador la ven en la pantalla del paseo (Waggo, repo: R8). Pantallas: `design/propuesta/figma-import/html/dueno-paseo-alertas--salio-de-la-zona.html`, `dueno-paseo-alertas--detenido-10-min.html`.
- **Competencia:** Wakypet ofrece "ver la ruta del paseador" [16]; Mywak "GPS en tiempo real" [20]; Rover ni siquiera tiene mapa en vivo [31]. **No encontré** que ningún competidor local publique alertas automáticas.
- **Evidencia de que importa:** indirecta. Wag! recibe quejas recientes de paseadores que no llegan ("A confirmed walker three days prior never showed up", 3-oct-2026) y de seguridad ("leaving her dog alone", 24-sep-2026) [29]. Un usuario de Wakypet dice que solo ve la ruta "Si el paseador activa el GPS" [18]. No hay dato de que el dueño pague más por alertas.
- **Hipótesis a validar:** "Los dueños que reciben al menos una alerta útil repiten más". Métrica: repetición a 30 días de dueños con y sin alertas; encuesta de 1 pregunta al final del paseo.

## 2. Emergencia con un toque (RF-012)
- **Qué es:** dueño o paseador levantan una emergencia con mensaje y ubicación durante el paseo; queda registrada y la ven los dos (R9). Pantallas: `paseador-paseo-en-curso--*` y `dueno-paseo-en-vivo--*`.
- **Competencia:** no encontré botón de emergencia publicado por Wakypet ni Mywak; ambos ofrecen **seguro SURA** como respuesta a incidentes [18][20].
- **Evidencia:** no encontré evidencia directa. Hoy la emergencia no avisa a soporte (el panel de alertas está pendiente, R12; push pendiente, R11): **sin operación detrás no es un diferencial vendible**.
- **Hipótesis:** "Un protocolo de emergencia con respuesta humana en < 5 min aumenta la confianza en el primer paseo". Medir: conversión del primer al segundo paseo.

## 3. Pago retenido hasta terminar (RF-015 – RF-018)
- **Qué es:** al pedir, se retiene el total; si se cancela antes de empezar se libera; al terminar se cobra y se dispersa al paseador (R6). Pantallas: `dueno-pedir-paseo-confirmar--resumen-y-pago.html`, `dueno-paseo-resumen--terminado-y-pagado.html`, `dueno-paseo-resumen--cancelado-liberado.html`. **Hoy la pasarela es simulada** (R6).
- **Competencia:** PetBacker "Liberamos el pago en un plazo de 7 días una vez completado su trabajo" [24]. Wakypet y Mywak: no encontré dato público de cómo cobran.
- **Evidencia:** en la investigación previa del repo, reseñas de Rover se quejan de cobros anticipados (R17; fuente original Trustpilot citada allí, no reabierta hoy). Para Colombia no encontré evidencia.
- **Hipótesis:** "Mostrar 'Retenido: se cobra al terminar' sube la conversión del primer pedido". Medir: tasa de confirmación en la pantalla de pago.

## 4. Precio transparente con desglose
- **Qué es:** el dueño ve el precio antes de confirmar, con la comisión y lo que recibe el paseador; el paseador ve lo que gana antes de aceptar (R5, R13). Pantalla: `comun-cotizar-tarifa--con-precio.html`.
- **Competencia:** Wakypet publica precios "desde" [15][16] sin desglose; Mywak no publica precios [21].
- **Evidencia:** no encontré. **Hipótesis.**
- **Atención:** mostrar 20 % de comisión puede jugar en contra frente al 10–15 % de Wakypet [17] al reclutar paseadores.

## 5. Chat dentro de la app (RF-013)
- **Qué es:** chat de texto durante el paseo; solo lectura al terminar (R10).
- **Competencia:** Wakypet: el dueño puede "escribirle a Whatsapp o llamarlo" [15]; Mywak tiene "chat en tiempo real" [20]; PetBacker tiene chat [24].
- **Evidencia:** un usuario de Wakypet pide más información del paseador [18], no chat. Diferencial débil (protege datos del paseador frente a Wakypet).

## 6 y 7. Lo que no es diferencial
- **Mapa en vivo** (RF-008): Wakypet [16] y Mywak [20] ya lo anuncian. Waggo debe igualarlo con calidad (que funcione siempre), no venderlo como novedad.
- **Asignación por cercanía** (RF-006/007): Wakypet ya funciona así ("Uno de nuestros aliados cercano a tu ubicación acepta el servicio") [15].

## Propuesta de posicionamiento (hipótesis)
"El paseo que te avisa si algo sale mal, y que solo se cobra cuando termina." Se apoya en 1 + 2 + 3, que son los únicos que no encontré publicados por la competencia local, **siempre que** antes del lanzamiento se cierren las brechas de seguro y verificación de antecedentes.
