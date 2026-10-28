# Propuesta de diseño de Waggo: resumen

> Autor: agente `ui-ux-designer` · 2026-10-26 · Estado: **propuesta, pendiente de revisión del PO**. No cambia código, specs ni vault.
> **Figma: no creado.** No había herramientas de Figma conectadas. Se entrega un paquete de importación: [`tokens.json`](tokens.json), 37 SVG en [`pantallas/`](pantallas/) (121 marcos) y [`figma-guia.md`](figma-guia.md).
> **Marca (2026-10-26):** el PO aprobó partir del boceto del corgi con el rótulo **"Waggo"**. La propuesta ya lo usa en bienvenida, login, registro y splash, y suma la lámina `00-sistema-marca`. Detalle y pendientes en [08](08-marca.md).

## Hallazgos clave
1. **El mapa en vivo es lo que diferencia a Waggo.** Wag! y DOGIN lo venden como tranquilidad; Rover dice que su mapa *no* es en vivo. Las quejas que más se repiten son la confiabilidad (cancelaciones de último minuto) y un soporte difícil de alcanzar. ([01](01-investigacion-nicho.md))
2. **Las capturas de las specs están desactualizadas**: muestran ADR-013 (negro y amarillo, Helvetica). El código ya usa ADR-018. Varias specs (UX-001, RF-013, RF-014) describen todavía "amarillo" y "sin íconos". ([02](02-auditoria-waggo.md))
3. **Contraste**: la etiqueta del botón de emergencia no llega a AA (3,1:1 en claro, 2,3:1 en oscuro); `info` y `warning` no sirven como texto en claro; los bordes de los campos dan 1,5:1. Se proponen 3 roles nuevos sin tocar la paleta. ([03](03-sistema-de-diseno.md))
4. **Objetivos táctiles**: campos (~42 px) y chips (~36 px) quedan por debajo de 44 px. Se propone 48 y 44.
5. **El dueño nunca ve que el paseador está verificado**, aunque es el primer pilar de la marca. Se agrega la insignia en el paseo, el chat y el resumen.

## Decisiones de esta propuesta
- **Pedir un paseo en 3 pasos** (¿Dónde? con mapa y pin → ¿Quién y cuánto? → Confirmar y pagar). Usa el mismo contrato de RF-007.
- **Una sola pantalla de paseo** con mapa a pantalla completa y bottom sheet de 3 alturas, que pasa por Buscando, Aceptado, En curso y Resumen.
- **Sistema de mapas propio** (marcadores, ruta recorrida y pendiente, geocerca, permisos, fallos, atribución). **El PO eligió OpenStreetMap (2026-10-27)**: el estilo del mapa base no es personalizable (oscuro = tiles invertidos con filtro), la atribución es "© OpenStreetMap contributors" y la búsqueda (Nominatim) no tiene autocompletado. ([04](04-mapas.md))
- **Emergencia siempre visible** (SOS en el mapa) con hoja de confirmación, banner fijo y anuncio asertivo al lector de pantalla.
- **Paseador con 4 pestañas** (Inicio, Paseos, Ganancias, Configuración) y su inicio como mapa de solicitudes con precio.

## Prioridad
| MVP | Mejora |
|---|---|
| Login + Google/Microsoft, registro, confirmación · Inicio del dueño con paseo activo · Pedir paseo en 3 pasos con mapa · Paseo (buscando, aceptado, en vivo, alertas, resumen) · Emergencia · Chat · Avisos · Hazte paseador + verificación · Solicitudes con mapa · Paseo del paseador · Cola de verificación del admin · Tokens de contraste y tamaños táctiles | Detalle del perro · Cotizador público rediseñado · Cuenta y seguridad (spec en Borrador) · Pestañas Paseos/Ganancias del paseador · Operación del admin (necesita endpoint) · Respuestas rápidas del chat · Ahorro de batería · Calificación |

## Cambios que rompen specs existentes (actualizar si el PO aprueba)
- **UX-001**: ejemplo 3 ("muy pronto podrás crear tu cuenta") y el botón único; capturas y reglas ADR-013.
- **RF-007 dueño**: una pantalla de formulario pasa a tres pasos con mapa (mismos datos y API).
- **RF-008**: la ruta SVG sin calles se reemplaza por el mapa real (ya previsto en su nota).
- **RF-013 / RF-014**: colores y "sin íconos" de ADR-013.
- **ADR-019**: pestañas del paseador (de 2 a 4).

## Pantallas `nueva — requiere spec`
Recuperar contraseña · Reenviar enlace de confirmación · "Nadie aceptó" tras X minutos · Posición y ETA del paseador antes de iniciar · Paseadores cercanos en el mapa del dueño · Calificación del paseador · Estado "Disponible" del paseador · Aviso de "lejos de la recogida" al terminar · Canal de soporte · Registro de quién ve el documento en el admin.

## Preguntas abiertas para el PO
1. ~~**Proveedor de mapas**~~ → **Resuelto: OpenStreetMap** (PO, 2026-10-27; borrador de ADR en `specs/_adr-borrador-mapas-openstreetmap.md`). Queda abierto: proveedor de tiles y geocodificación para producción (los públicos de OSM no sirven para alto tráfico).
2. ¿Aprobar los roles nuevos `dangerText`, `borderStrong` y `warningText`, y los tamaños de 48 px para campos y 44 px para chips?
3. ¿Pasar al paseador a 4 pestañas (cambia ADR-019)?
4. ¿Qué pasa si nadie acepta en X minutos? ¿Cuántos minutos? (abierta en RF-007)
5. ¿El dueño ve la posición del paseador antes de que empiece el paseo? Exige rastrear en `Accepted`, con impacto en batería y privacidad.
6. ¿El dueño puede ver paseadores cercanos en el mapa antes de pedir? (privacidad de los paseadores)
7. ¿Se muestra "Llamar al 123" en la emergencia? ¿Quién más recibe la alerta: soporte o un contacto del dueño? (abierta en RF-012)
8. ¿Calificaciones y reseñas entran en el alcance? No hay RF.
9. ¿Qué ve el paseador antes de aceptar: barrio o dirección exacta? ¿Y las notas médicas después de aceptar? (abiertas en RF-007 y RF-004)
10. Umbrales: geocerca de 1,5 km, detención de 10 min, envío cada 15 s, radio de 5 km, "señal vieja" a los 30 s (decidido por el PO) y "GPS impreciso" a más de 50 m (los dos últimos los propone este diseño). Todos ⚠️ provisionales.
11. ¿"Ahorro de batería" (envío cada 30 s con batería baja)?
12. ¿Cómo registra el paseador la cuenta donde cobra y qué método de pago ve el dueño? (depende de la pasarela)
13. ¿Eliminar la cuenta es un borrado real o una desactivación? ¿Cambiar el correo exige confirmarlo de nuevo? (abiertas en la spec de perfil)
14. ¿Se guarda la ruta después del paseo y por cuánto tiempo? (abierta en RF-008)
15. Logo: hay boceto aprobado (corgi + rótulo "Waggo"). Falta el vector final, la versión simplificada para < 32 px y decidir si el rótulo aparece una o dos veces. ([08](08-marca.md))

## Índice
[01 Investigación](01-investigacion-nicho.md) · [02 Auditoría](02-auditoria-waggo.md) · [03 Sistema de diseño](03-sistema-de-diseno.md) · [04 Mapas](04-mapas.md) · [05 Flujos](05-flujos-y-navegacion.md) · [06 Inventario](06-inventario-de-pantallas.md) · [07 Especificación](07-especificacion-por-pantalla.md) · [Guía de Figma](figma-guia.md)
