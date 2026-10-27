# 03 — Sistema de diseño

> Base: `waggo-mobile/src/shared/ui/theme.ts` (ADR-018) y los componentes de `src/shared/ui`. Lo que ya existe se respeta tal cual. Lo nuevo se marca **PROPUESTA** y es una decisión del PO. Variables listas para Figma en [`tokens.json`](tokens.json) (formato Tokens Studio: sets `global`, `light`, `dark` y temas Claro/Oscuro).

## Principios y tono (derivados de la investigación)
1. **Tranquilidad a la vista.** El dueño siempre sabe en qué va el paseo sin buscarlo: estado, mapa y hora de la última posición en la primera pantalla. (Wag! y DOGIN lo venden; Rover no lo tiene. Ver `01`.)
2. **La confianza se muestra, no se promete.** Paseador verificado con insignia, hora de llegada y salida, ruta guardada, pago retenido explicado en una frase.
3. **Un toque para lo urgente.** La emergencia está siempre a la vista durante el paseo, con confirmación y sin menús.
4. **Lo justo en cada paso.** Pedir un paseo en tres pasos cortos, como pedir un viaje.
5. **Cálido, no infantil.** Baloo 2 en títulos y botones, Inter en el texto, formas redondeadas. Sin emojis en la interfaz.

**Tono del copy**: español neutro, tuteo, frases cortas, verbo primero en botones ("Pedir paseo", "Iniciar paseo"). Los errores dicen qué pasó y cómo corregirlo ("No pudimos ubicarte. Escribe la dirección o mueve el pin."). Nunca culpar al usuario. El rojo solo para errores y emergencias.

## Tokens

### Color (de `theme.ts`, sin cambios)
| Rol | Claro | Oscuro | Uso |
|---|---|---|---|
| `primary` | `#3059A4` | `#5B9BD5` | Acción principal, selección, ruta del mapa |
| `primaryText` | `#FFFFFF` | `#16212E` | Texto sobre `primary` |
| `secondary` | `#006E87` | `#3FA3BD` | Acentos secundarios, geocerca, insignia de verificado |
| `info` | `#2E9EC4` | `#7FD4EC` | Avisos informativos (en claro, solo relleno o ícono) |
| `warning` | `#C97A2B` | `#F2A65A` | Avisos de atención: GPS impreciso, sin conexión |
| `text` / `muted` | `#16212E` / `#3A4A5C` | `#FFF0E9` / `#8FA5B8` | Texto principal y secundario |
| `background` / `surface` / `surface2` | `#FFF0E9` / `#FFFFFF` / `#FBE2D3` | `#16212E` / `#1C2733` / `#22303E` | Fondo, tarjetas, zonas destacadas |
| `border` | `#E8D2C3` | `#2A3B4D` | Separadores |
| `danger` / `success` | `#C23B3B` / `#1F7A52` | `#FF7A7A` / `#4CC38A` | Error y emergencia / confirmación y pagado |

### Color — PROPUESTA (agrega roles, no cambia la paleta)
| Rol nuevo | Claro | Oscuro | Por qué (contraste calculado en `02`) |
|---|---|---|---|
| `dangerText` | `#FFFFFF` | `#16212E` | La etiqueta del botón de emergencia hoy da 3,1:1 y 2,3:1; con este rol, 5,3:1 y 6,4:1 |
| `borderStrong` | `#8C7B70` | `#5E7488` | Contorno de campos ≥ 3:1 (WCAG 1.4.11); `border` da 1,5:1 |
| `warningText` | `#9A5A17` | `#F2A65A` | Texto de aviso legible en claro (4,9:1) |
| `scrim` | `#16212E66` | `#0B111899` | Fondo detrás de hojas y diálogos |
| `map.*` | ver `04-mapas.md` | | Estilo del mapa base |

### Tipografía (de `theme.ts`)
| Token | Familia | Tamaño / línea | Uso |
|---|---|---|---|
| `display` | Baloo 2 Bold | 34 / 38, −0,5 | Titular de bienvenida, montos grandes |
| `title` | Baloo 2 Bold | 24 / 30 | Título de pantalla |
| `subtitle` | Baloo 2 Bold | 18 / 24 | Botones, títulos de tarjeta |
| `body` | Inter Regular | 16 / 24 | Texto |
| `caption` | Inter Regular | 14 / 20 | Texto de apoyo, etiquetas de campo |
| `eyebrow` | Inter Bold | 13 / 16, +0,8, MAYÚSCULAS | Antetítulos de sección |
| `micro` | Inter Medium | 12 / 16 | Pestañas, metadatos, atribución |

**Texto escalable**: diseñar con Dynamic Type / escala de fuente hasta 200 %. Reglas: ninguna altura fija en contenedores de texto; las filas pasan de horizontal a vertical cuando el texto no cabe; el bottom sheet del mapa crece antes de truncar.

### Espaciado, radios, tamaños
- Espaciado: `xs 4 · sm 8 · md 16 · lg 24 · xl 32`. Margen lateral de pantalla: `lg` (24).
- Radios: `sm 8 · md 14 · lg 20 · pill 999`. Botones y chips: `pill`. Tarjetas: `md`. Bottom sheet y diálogos: `lg` arriba.
- **PROPUESTA** de tamaños: objetivo táctil mínimo 44; campo 48; chip 44; botón flotante del mapa 48; pestañas 49 + área segura.

### Elevación y movimiento (PROPUESTA: hoy no existen)
| Token | Valor | Uso |
|---|---|---|
| `shadow.card` | 0 2 8, `text` al 8 % | Tarjetas sobre el mapa |
| `shadow.sheet` | 0 −4 24, 16 % | Bottom sheet |
| `shadow.fab` | 0 4 12, 20 % | Botones flotantes del mapa |
| `duration.fast/base/slow` | 120 / 200 / 300 ms | Presionado / banners / hojas y transiciones |
| `duration.markerTween` | 1.000 ms | Interpolar al paseador entre posiciones |
| `easing.standard` | `cubic-bezier(0.2, 0, 0, 1)` | Todo lo que entra |

Con "Reducir movimiento" activado: sin pulsos, el marcador salta sin interpolar y el sheet aparece sin rebote.

## Marca
Logo del corgi con rótulo "Waggo" (boceto del fundador, pendiente de vectorizar). Versiones: logo completo, cabeza sola, medalla crema para fondos oscuros o zafiro, ícono de app y splash. Colores de la marca: trazo `text`, rótulo `primary`, fondo `background`, collar `secondary`. Reglas, tamaños mínimos y pendientes en [08](08-marca.md); láminas en `pantallas/00-sistema-marca.svg`.

## Componentes y estados
Nombre de componente en inglés (como en Figma y en el código), copy en español.

| Componente | Existe | Variantes | Estados |
|---|---|---|---|
| `Button` | ✔ | `primary`, `secondary`, `danger`; **PROPUESTA** `tertiary` (texto) y `size=sm` | default, pressed (opacidad 0,85), focus (anillo 2 px `primary` + 2 px separación), disabled (0,5), loading (spinner + texto "Pidiendo…"), — |
| `TextField` | ✔ | text, email, password (con "Mostrar"), multiline, search (con ícono) | default, focus (borde `primary` 2 px), filled, error (borde `danger` + mensaje debajo con ícono), disabled, readOnly |
| `ChipGroup` | ✔ | single, multi (perros con avatar) | default, selected (`primary`), pressed, disabled, focus |
| `ActionFooter` | ✔ | con total, con dos botones | default, loading |
| `Shortcut` / `DetailRow` | ✔ | con valor, con chevron | default, pressed, focus |
| `Avatar` | ✔ | initial, foto (PROPUESTA), con insignia verificado | — |
| `Skeleton` | ✔ | fila, tarjeta, mapa | loading |
| `ThemeToggle` | ✔ | — | claro, oscuro |
| `TabBar` | ✔ (ADR-019) | dueño (4), paseador (4, PROPUESTA) | active, inactive, badge (contador) |
| `Banner` | PROPUESTA | info, warning, danger, success | visible, dismissible, con acción |
| `EmptyState` | PROPUESTA | con ilustración de línea (pata), sin ilustración | — |
| `ErrorState` | PROPUESTA | carga fallida, sin conexión | con "Intentar de nuevo" |
| `Dialog` / `ConfirmSheet` | PROPUESTA | confirmar, destructivo, emergencia | — |
| `Toast` | PROPUESTA | success, error | entra/sale 200 ms; se anuncia al lector de pantalla |
| `StatusPill` | PROPUESTA | Buscando, Aceptado, En curso, Terminado, Cancelado | con punto pulsante (solo Buscando y En curso) |
| `WalkCard` | PROPUESTA (reemplaza `WalkRow` en inicio) | activo con mini mapa, programado, historial | default, pressed |
| `OfferCard` | ✔ | con distancia, sin distancia | default, accepting, taken (409) |
| `MessageBubble` | ✔ | mine, theirs, system | sent, sending, failed (reintentar) |
| `NotificationRow` | PROPUESTA (hoy en la pantalla) | normal, urgente | unread, read |
| `MapView` + marcadores + `BottomSheet` | PROPUESTA | ver `04-mapas.md` | ver `04-mapas.md` |

## Reglas de accesibilidad comunes
- Contraste AA en todo texto; nunca solo el color para comunicar (urgente = ícono + palabra + color).
- Objetivo táctil ≥ 44 × 44; separación ≥ 8 entre objetivos.
- Cada pantalla tiene un título con rol `header`; el orden de lectura sigue el orden visual; el mapa es un único elemento con una descripción resumida ("Mapa del paseo: Bruno está a 300 m de la recogida, hace 15 s") y una alternativa en lista (métricas y última posición) en el sheet.
- Cambios de estado importantes (aceptado, emergencia, alerta) se anuncian con una región "live" (`accessibilityLiveRegion` / `announceForAccessibility`); la emergencia es asertiva.
- Foco visible en web y con teclado (anillo de 2 px `primary`).
