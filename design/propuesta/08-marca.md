# 08 · Marca (logo, ícono de app y uso)

> Estado: **propuesta**. El logo parte del boceto del fundador ([`marca/logo-boceto.png`](marca/logo-boceto.png)). Lo que se ve en las pantallas es un recoloreado automático del boceto, no un logo final: hay que **redibujarlo en vector** (ver "Qué falta").
> Decisión del PO (2026-10-26): el rotulado dice **"Waggo"**, no "WAGG". El boceto traía "WAGG" dos veces; la propuesta lo reemplaza por un solo "Waggo" en Baloo 2 700, girado como el rotulado original.

## Qué es la marca
- **Cabeza de corgi** dibujada a mano, sonriente, con la lengua afuera. Transmite cercanía y calidez, justo lo que el producto promete (un paseador de confianza).
- **Rótulo "Waggo"** en Baloo 2 700 (la misma tipografía de los títulos de la app), con un trazo extra para que se vea tan grueso y redondeado como el rotulado del boceto.

## Versiones
| Versión | Cuándo | Cómo se arma |
|---|---|---|
| **Logo completo** (cabeza + rótulo) | Splash, bienvenida, estados vacíos, material de marketing | Tinta `#16212E` + rótulo zafiro `#3059A4` sobre `#FFF0E9` |
| **Cabeza sola** | Encabezados de login y registro, avatar de la app, marcador del perro en el mapa (≥ 32 px) | Tinta `#16212E` sobre claro |
| **Medalla** (cabeza en círculo crema) | Cualquier fondo oscuro o zafiro: tema oscuro, splash oscuro, encabezado azul | Círculo `#FFF0E9` con la cabeza dentro |
| **Ícono de app** | Tienda y pantalla de inicio del teléfono | Cuadrado redondeado zafiro `#3059A4` con la medalla; variante oscura `#16212E`; variante adaptativa circular (Android) |
| **Versión simplificada** (**nueva — pendiente**) | Por debajo de 32 px: pestañas, notificaciones, favicon | Silueta de 2 colores con trazo uniforme; hay que dibujarla |

Roles de color: trazo `#16212E` (token `text`), rótulo `#3059A4` (`primary`), fondo `#FFF0E9` (`background`), collar `#006E87` (`secondary`, opcional en la versión vectorial), interior de orejas `#FBE2D3` (`surface2`). El rojo **no** se usa en la marca: queda reservado para errores y emergencias.

## Dónde se usa (cambios en las pantallas)
| Pantalla | Cambio |
|---|---|
| Bienvenida (UX-001) | Se quita el cuadrado con la pata y el texto "Waggo". Arriba, centrado, va el logo completo (150 px). En oscuro, la medalla. El resto baja 30 px. **Rompe UX-001** (cambia la cabecera). |
| Iniciar sesión y Crear cuenta | Cabeza sola (44 px) arriba a la derecha, en la barra de navegación. En oscuro, la medalla. |
| Splash (nueva) | Logo completo 260 px, "Waggo" en Baloo 2 y el lema "Paseo seguro de perros"; spinner debajo. Claro y oscuro. |
| Ícono de app | Ver lámina `00-sistema-marca`. |
| Encabezado azul de login y registro (código actual) | La medalla crema reemplaza las huellas decorativas del encabezado, en vez de ir sobre el fondo. No está en la propuesta de pantallas porque la propuesta usa barra de navegación simple. |

## Reglas de uso
- **Margen mínimo** alrededor del logo: la altura de una oreja.
- **Tamaño mínimo**: logo completo 96 px de ancho; cabeza sola 32 px de alto. Debajo, usar la versión simplificada.
- En fondo oscuro o zafiro, **siempre** sobre la medalla crema: invertir el trazo deja los ojos blancos y el perro irreconocible.
- No cambiar el color del rótulo ni inclinarlo distinto al del arte; no poner texto encima.
- El rótulo dibujado es parte del logo; **en la interfaz**, "Waggo" se escribe con Baloo 2 700 como texto normal.

## Prueba de tamaño
Con el boceto, 72 y 48 px se leen bien; a 32 px se empasta; a 24 px es una mancha. Por eso la versión simplificada es necesaria antes de usar la marca en pestañas o notificaciones.

## Qué falta
1. **Vectorizar**: redibujar la cabeza con trazo uniforme (y el rotulado) en Figma o Illustrator, o pedir el original a quien lo dibujó. Entregables: `logo-completo.svg`, `logo-cabeza.svg`, `logo-simplificado.svg` (2 colores, ≥ 16 px legible) y las exportaciones del ícono (1024×1024, adaptativo Android con zona segura del 66 %).
2. **Ícono y splash en Expo**: el PO pidió (2026-10-27) poner el perrito en el ícono. Ya están `assets/icon.png`, `android-icon-foreground/monochrome.png`, `splash-icon.png` y `favicon.png` de `waggo-mobile`, hechos a partir del boceto (cuadrado zafiro `#3059A4`, medalla crema y cabeza con los bordes difuminados porque el boceto es un recorte rectangular). **Provisional**: al tener el vector, regenerarlos.
3. **Decisión del PO**: ¿"Waggo" aparece una o dos veces en el logo completo? La propuesta usa una; el boceto traía dos.
4. **Registro de marca** y usos legales: fuera del alcance de este diseño.

## Cómo se generó
- [`marca/generar-marca.html`](marca/generar-marca.html) lee `marca/logo-boceto.png`, borra el rotulado "WAGG" original, recolorea el trazo a tinta (alfa según oscuridad) y dibuja "Waggo" con Baloo 2. [`marca/generar-marca.js`](marca/generar-marca.js) lo ejecuta en Chrome sin interfaz y guarda `generador/brand-assets.json`.
- `generador/lib.js` expone `logoHero`, `logoHead`, `logoBadge` y `appIcon`, y `build.js` los emite como `<symbol>` para no repetir la imagen. Regenerar: `node design/propuesta/marca/generar-marca.js` y `node design/propuesta/generador/build.js design/propuesta/pantallas`.
