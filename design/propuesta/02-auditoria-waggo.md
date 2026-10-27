# 02 — Auditoría de Waggo

> Fuentes: `specs/*.md`, `specs/assets/*.png`, `waggo-mobile/src/app`, `src/features/*/screens`, `src/shared/ui` (leídos el 2026-10-26). El vault **no estaba disponible** (`../../../Vault Waggo` no existe y `WAGGO_VAULT` está vacío): no pude leer ADR-018, ADR-019, el Glosario ni la nota *Sistema de diseño*. Trabajé con `theme.ts`, los comentarios del código y las specs.

## Hallazgo 0 — Las capturas de las specs están desactualizadas
Las imágenes de `specs/assets/` muestran el sistema retirado de ADR-013 (fondo negro, amarillo `#FFC527`, Helvetica). El código ya usa ADR-018 (Seashell & Sapphire, Baloo 2 + Inter, claro por defecto) y la barra de pestañas de ADR-019. Las specs UX-001, RF-013 y RF-014 todavía describen "amarillo", "Helvetica" y "sin íconos (ADR-013)". **Código y specs no coinciden**: lo reporto, no lo corrijo (no edito specs). Las SVG de esta propuesta sirven como capturas nuevas cuando el PO las apruebe.

## Contraste real de los tokens (WCAG 2.2, calculado)
| Par | Claro | Oscuro | Veredicto |
|---|---|---|---|
| `text` sobre `background` | 14,6 | 14,6 | AA ✔ |
| `muted` sobre `background` | 8,2 | 6,4 | AA ✔ |
| `primary` sobre `background` (texto) | 6,1 | 5,5 | AA ✔ |
| `primaryText` sobre `primary` (botón) | 6,8 | 5,5 | AA ✔ |
| `danger` sobre `background` (texto) | 4,7 | 6,4 | AA ✔ |
| **Etiqueta del botón `danger`** (hoy usa `text`) | **3,1** | **2,3** | **✘ falla AA** |
| `info` sobre `background` (texto) | **2,8** | 9,7 | ✘ en claro |
| `warning` sobre `background` (texto) | **3,0** | 8,0 | ✘ en claro para texto normal |
| `border` sobre `surface` (borde de un campo) | **1,5** | 1,3 | ✘ 1.4.11 pide 3:1 para el límite de un control |

**Propuesta** (decisión del PO, no cambia la paleta, solo agrega roles): `dangerText` (`#FFFFFF` claro: 5,3 · `#16212E` oscuro: 6,4), `borderStrong` para el contorno de campos (≥ 3:1), y usar `info`/`warning` en claro solo como relleno o ícono grande, nunca como texto pequeño (para texto, `secondary` y un `warningText` más oscuro). Detalle en `03-sistema-de-diseno.md`.

## Objetivos táctiles
- `TextField`: `paddingVertical: 8` + línea de 24 → ~42 px de alto. Por debajo de 44 pt (Apple HIG) y 48 dp (Material); sí cumple el mínimo AA de 24 px (WCAG 2.2, 2.5.8). Propuesta: 48 px.
- `ChipGroup`: `paddingVertical: 8` + línea de 20 → ~36 px. Propuesta: 44 px de alto (con área táctil extendida si se quiere conservar el aspecto).
- Fuentes: [W3C 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [DAISY KB](https://kb.daisy.org/publishing/docs/wcag/target-size-minimum.html) (24 px AA, 44 px AAA), Apple HIG 44 pt, Material 48 dp.

## Pantalla por pantalla
Heurísticas de Nielsen citadas por número: H1 visibilidad del estado, H2 lenguaje del usuario, H3 control y libertad, H4 consistencia, H5 prevención de errores, H6 reconocer antes que recordar, H8 diseño minimalista, H9 recuperarse de errores.

| Pantalla (ruta) | Lo que funciona | Problemas | Propuesta | ¿Rompe spec? |
|---|---|---|---|---|
| Bienvenida (`/`) | Dos entradas por rol claras; pilares de valor | H4: el aviso "muy pronto podrás crear tu cuenta" ya no aplica (existe el registro) | Entradas "Pedir un paseo" / "Quiero ser paseador" + "Ya tengo cuenta" | Sí: UX-001 ejemplo 3 |
| Login (`/login`) | Mensaje de credenciales igual para ambos casos (OWASP) | Falta "¿Olvidaste tu contraseña?"; faltan Google y Microsoft (spec `Lista`); H9: "Demasiados intentos" sin cuenta regresiva | Botones sociales arriba, enlace de recuperación, temporizador de bloqueo | No (agrega) |
| Registro / Confirmar | Reglas de contraseña claras en el mensaje | H5: las reglas solo aparecen al fallar | Checklist en vivo de las reglas mientras escribe | No |
| Inicio del dueño (`/inicio`) | "¿Quién sale a pasear hoy?" es una gran entrada (patrón de app de viajes) | H1: el paseo en curso es una fila de texto; no se ve el mapa ni al paseador. Sin primer uso guiado (sin perros) | Tarjeta del paseo activo con mini mapa en vivo y estado; primer uso: "Agrega a tu primer perro" | No |
| Mis perros / Agregar perro | Formulario corto, errores de la API tal cual | Sin detalle del perro; sin fecha de nacimiento (falta selector); notas médicas sin indicación de privacidad | Detalle del perro; aviso "Solo tú y tu paseador asignado las ven" (⚠️ pregunta abierta RF-004) | No |
| Pedir paseo (`/paseos/nuevo`) | Precio en vivo, chips | H6/H8: un formulario largo en una sola columna; la dirección es texto libre + botón; **sin mapa ni ajuste de pin**; si el GPS falla no hay ruta alternativa | Flujo en 3 pasos: **¿Dónde?** (mapa + búsqueda + pin) → **¿Quién y cuánto?** → **Confirmar y pagar** | Sí: la estructura de RF-007 dueño cambia (mismos datos y contrato) |
| Estado del paseo (`/paseos/[id]`) | Refresco cada 5 s; cancelar | H1: "Buscando paseador" sin tiempo transcurrido; la ruta es un **dibujo SVG sin calles** (RF-008) | Mapa real a pantalla completa con bottom sheet; estados Buscando → Aceptado → En curso → Terminado en la misma pantalla | Sí: RF-008 "mapa SVG" (ya previsto en su nota) |
| Chat | Solo lectura al terminar | Burbujas amarillas en la spec (ADR-013) | Burbujas `primary`/`surface`; aviso "El chat se cierra al terminar el paseo" | Spec desactualizada |
| Bandeja de avisos | Urgentes marcadas | "Sin íconos" (ADR-013) ya no aplica; "URGENTE" solo en texto | Ícono + color + texto (no solo color, WCAG 1.4.1) | Spec desactualizada |
| Seguridad del paseo (`WalkSafety`) | Confirmación antes de la emergencia (H5) | Etiqueta del botón rojo con contraste 3,1 / 2,3 (✘); la alerta está dentro del scroll, no fija | Botón SOS fijo en el mapa; hoja de confirmación; banner fijo arriba | No |
| Hazte paseador / Verificando | Estados claros (pendiente, rechazado, aprobado) | "Revisar de nuevo" + sondeo cada 30 s sin explicar plazo; rechazado sin acción siguiente | Línea de tiempo de verificación; qué hacer si fue rechazado (⚠️ pregunta RF-002) | No |
| Inicio del paseador (`/paseador`) | Tarjetas "Ganas $…" con Aceptar (patrón de conductor) | Sin mapa; distancia solo si toca "Ver las más cercanas"; H1: refresco cada 10 s invisible | Mapa con solicitudes como marcadores de precio + lista en bottom sheet; distancia y radio de 5 km visibles | No |
| Paseo asignado (paseador) | Dirección exacta e indicaciones | Sin cómo llegar | Ruta hacia la recogida (tramo pendiente) + "Abrir en Maps" | No |
| Ganancias | Total y lista | Escondidas en el inicio | Pestaña propia "Ganancias" | Sí: ADR-019 (pestañas del paseador) |
| Configuración | Tema claro/oscuro accesible | Sin "Cuenta" (perfil en Borrador) | Secciones Cuenta, Preferencias, Ayuda, Cerrar sesión | No |
| Admin (`/admin`) | Rechazo exige motivo (H5) | Solo cola de verificación; diseñada a ancho de teléfono | Cola + Operación (emergencias y paseos en curso, slices 2–3) con versión tablet/web | No |

## Consistencia con el sistema visual
- Bien: todos los colores salen de `theme.ts`; `ActionFooter` deja la acción principal abajo (patrón móvil); `layout.column` de 480 px en web.
- A mejorar: no hay tokens de **elevación**, **movimiento**, **z-index** ni **opacidad**; los mapas necesitarán estilos propios (ver `04-mapas.md`); el ícono del tab de Configuración es un usuario (sirve, pero se llama "Configuración": propuesta "Cuenta").
