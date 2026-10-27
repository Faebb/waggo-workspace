# Guía para armar el archivo de Figma

> **Estado real**: no había herramientas de Figma conectadas en esta sesión (ninguna herramienta con "figma" en el nombre). **No se creó ningún archivo de Figma.** Esto es un paquete para importar a mano: `tokens.json` + 37 SVG en `pantallas/` + esta guía.

## 1. Preparar
1. Instalar en Figma las fuentes **Baloo 2** (Bold) e **Inter** (Regular, Medium, Bold), ambas de Google Fonts. Los SVG las piden por nombre; sin ellas Figma las reemplaza.
2. Instalar el plugin **Tokens Studio for Figma** → *Load from file* → `tokens.json`. Crea los sets `global`, `light`, `dark` y los temas **Claro** y **Oscuro**. Exportar a **Variables** de Figma: colección `color` con modos Claro/Oscuro, colecciones `spacing`, `radius`, `sizing`; estilos de texto desde `typography`; estilos de efecto desde `shadow`.
3. Los roles marcados *PROPUESTA* en `tokens.json` (`dangerText`, `borderStrong`, `warningText`, `scrim`, `map.*`, `sizing.*`, `duration.*`) van en un grupo `proposed/` hasta que el PO los apruebe.

## 2. Importar las pantallas
- Arrastrar cada `pantallas/*.svg` a su página. Cada estado es un `<svg>` anidado con `id` = `<archivo>--<estado>`: Figma lo importa como **un marco de 390×844** (o 820×1480 y 1024×768 en las láminas). Si llega como grupo: seleccionar → *Frame selection* (Ctrl+Alt+G).
- Los rótulos de estado y el título de la lámina quedan fuera de los marcos; se pueden borrar o pasar a una sección.
- Los colores llegan como valores sueltos. Paso siguiente: *Selection colors* → enlazar cada hex a su variable (la tabla de `03-sistema-de-diseno.md` dice qué hex es qué rol; los valores son idénticos a `theme.ts`).
- El mapa base de los SVG es una **ilustración** para diseñar encima. En Figma, dejarlo en una capa `Map/*` bloqueada; para presentaciones se puede reemplazar por una captura del estilo real de Mapbox Studio o del Map ID de Google.

## 3. Estructura de páginas (una por flujo)
| Página | Archivos SVG |
|---|---|
| `00 Cover & README` | — (portada, enlace a esta carpeta, estado de aprobación) |
| `01 Foundations` | `00-sistema-componentes` (paleta, tipografía), `00-sistema-marca` (logo, ícono, splash; ver [08](08-marca.md)) |
| `02 Components` | se construyen a partir de `00-sistema-componentes` (ver §4) |
| `03 Maps` | `00-sistema-mapa` |
| `04 Navigation` | `comun-navegacion-tabs` |
| `10 Onboarding & Auth` | `comun-onboarding-bienvenida`, `comun-auth-login`, `comun-auth-registro`, `comun-auth-confirmar-correo`, `comun-cotizar-tarifa` |
| `20 Owner · Home & Pets` | `dueno-inicio-tab`, `dueno-mascotas-lista`, `dueno-mascotas-agregar`, `dueno-mascotas-detalle` |
| `21 Owner · Request walk` | `dueno-pedir-paseo-donde`, `dueno-pedir-paseo-detalles`, `dueno-pedir-paseo-confirmar` |
| `22 Owner · Walk lifecycle` | `dueno-paseo-buscando`, `dueno-paseo-aceptado`, `dueno-paseo-en-vivo`, `dueno-paseo-alertas`, `dueno-paseo-resumen`, `dueno-paseos-lista` |
| `30 Walker · Onboarding` | `paseador-onboarding-hazte-paseador`, `paseador-onboarding-verificacion` |
| `31 Walker · Work` | `paseador-inicio-solicitudes`, `paseador-paseo-asignado`, `paseador-paseo-en-curso`, `paseador-paseo-terminado`, `paseador-ganancias-tab`, `paseador-paseos-tab` |
| `40 Shared · Safety & Messaging` | `comun-paseo-emergencia`, `comun-paseo-chat`, `comun-avisos-bandeja` |
| `50 Settings` | `comun-configuracion-cuenta` |
| `60 Admin` | `admin-verificacion-cola`, `admin-operacion-mapa`, `admin-operacion-tablet-web` |
| `90 Prototype` | flujos de `05-flujos-y-navegacion.md` conectados |

En cada página: una **Section** por pantalla, con los marcos en el mismo orden que el SVG (por defecto → errores → oscuro).

## 4. Componentes y variantes a armar
Nombres en inglés (como en el código y en las capas del SVG); textos visibles en español.

| Componente | Propiedades / variantes |
|---|---|
| `Button` | `variant`: primary, secondary, danger, dangerOutline, tertiary, surface · `state`: default, pressed, focus, disabled, loading · `size`: md (52), sm (40–44) · `icon`: boolean + instance swap |
| `TextField` | `state`: default, focus, filled, error, disabled · `leading`/`trailing` icon · `multiline` boolean · `help`/`error` text |
| `Chip` | `state`: default, selected, disabled · `avatar` boolean |
| `StatusPill` | `kind`: primary, success, warning, danger, muted · `dot`, `pulse` booleans |
| `Banner` | `kind`: info, warning, danger, success, muted · `solid` boolean · `action` text · `dismiss` boolean |
| `Row` | `leading`: none, icon, avatar · `trailing`: none, chevron, value, pill · `divider` boolean |
| `Avatar` | `size`: 32, 40, 48, 96 · `verified` boolean |
| `TabBar` | `role`: owner, walker · `active`: Inicio, Paseos, Mascotas/Ganancias, Configuración · `badge` |
| `TopBar/floating` | `trailing`: none, bell, bell+badge |
| `BottomSheet` | `state`: collapsed (132), medium (~380), expanded (deja 84 de mapa), dialog |
| `ConfirmSheet` | `kind`: default, destructive, emergency |
| `MapFab` | `icon`: locate (outline / filled = siguiendo), compass, SOS |
| `Marker/*` | Pickup, MyLocation, WalkerLive (`stale` boolean, `heading` rotación), NearbyWalker, Cluster (`count`), Request (`state`: default, selected, taken), Alert (`kind`: danger, warning), RouteStart |
| `Route` | walked, pending, unsent |
| `Geofence` | normal, alert |
| `MapAttribution` | `provider`: mapbox, google |
| `OfferCard`, `WalkCard`, `PaymentSummary`, `MessageBubble` (`mine`, `failed`), `NotificationRow` (`urgent`, `unread`), `EmptyState`, `Toast`, `Skeleton` | según `03` |

Usar **auto layout** en todo lo que no sea mapa; los marcos del SVG tienen posiciones absolutas, sirven de referencia visual para reconstruir con instancias.

## 5. Nombres de capas
- Marcos: `<rol>-<flujo>-<pantalla>--<estado>` (igual al `id` del SVG).
- Grupos principales ya nombrados en el SVG: `StatusBar`, `NavBar`, `TopBar/floating`, `MapView/<tema>` (con `Map/Land`, `Map/Buildings`, `Map/Parks`, `Map/Water`, `Map/Roads`, `Map/POIs`, `Map/Labels`), `Map/Overlays`, `BottomSheet/<estado>`, `SheetContent`, `ActionFooter`, `TabBar/<rol>/<activa>`, `Button/<variante>/<estado>`, `TextField/<estado>`, `Banner/<tipo>`, `Marker/<tipo>`.

## 6. Tamaños extra
- Teléfono: 390×844 (todas las pantallas).
- Tablet y web: la app usa una columna de 480 px centrada (`layout.column`), así que las pantallas de dueño y paseador no necesitan marcos propios; basta un marco 1024×768 de ejemplo con la columna centrada. El panel de **Operación** sí tiene diseño propio (`admin-operacion-tablet-web`).

## 7. Regenerar los SVG
El generador está en `generador/` (Node, sin dependencias): `node design/propuesta/generador/build.js design/propuesta/pantallas` (desde `waggo-workspace`). Los colores salen de `generador/lib.js` (copia de `theme.ts`); si cambia la paleta, actualizar ahí y regenerar.
