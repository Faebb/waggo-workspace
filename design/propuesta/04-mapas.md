# 04 — Mapas reales

> Decidido: los mapas serán reales (tiles, calles, POIs, GPS del dispositivo).
> **Decisión del PO (2026-10-27): OpenStreetMap.** Implementado en `waggo-mobile` con Leaflet dentro de un WebView (iOS/Android, también Expo Go) y un iframe (web): `src/shared/map/WaggoMap`; búsqueda con Nominatim (`src/features/places`). Borrador de ADR: `specs/_adr-borrador-mapas-openstreetmap.md`. Las secciones de Mapbox y Google de abajo quedan como referencia histórica (§7).
>
> **Consecuencias de diseño de OSM**
> - **Estilo del mapa base no personalizable**: los tiles son ráster con el estilo estándar de OSM. La tabla de §1 (colores por capa, POIs filtrados, avenidas sin azul) **no se aplica**. Tema oscuro = filtro CSS que invierte los tiles (`invert + hue-rotate`); marcadores, ruta y zona sí usan la paleta de cada tema.
> - **Atribución**: "© OpenStreetMap contributors" (enlace a la página de copyright), abajo a la izquierda, siempre visible; los botones flotantes van a la derecha. En la lista de resultados: "Búsqueda: © OpenStreetMap contributors (Nominatim)". No hay logo ni botón (i).
> - **Sin autocompletado**: la política de Nominatim prohíbe buscar en cada tecla. El patrón es campo + botón "Buscar" y lista de resultados (dirección principal y barrio · ciudad). Máximo 1 búsqueda por segundo; resultados en caché.
> - **Calidad de direcciones**: irregular en Colombia; la dirección de la geocodificación inversa queda editable y lo que el dueño escribe nunca se reemplaza al mover el pin.
> - **Ruta y ETA**: no hay servicio de rutas. "Hacia la recogida" es un tramo punteado en **línea recta** con "estás a 450 m en línea recta"; la ETA sigue `nueva — requiere spec`.
> - **Tiles públicos**: solo para desarrollo/piloto ([política](https://operations.osmfoundation.org/policies/tiles/)); antes de lanzar, proveedor de tiles o autoalojarlos (`EXPO_PUBLIC_MAP_TILE_URL`). El diseño no cambia por eso.
> - **Mini mapas** (inicio, confirmar): el mismo componente sin gestos ni botones, decorativo para lectores de pantalla.
> - **Implementado vs. diseño**: el mapa va arriba y el detalle debajo en una sola columna desplazable (no hay aún *bottom sheet* de tres alturas sobre un mapa a pantalla completa); "Ver como lista" da la alternativa accesible; no hay brújula (el mapa no rota).
> Lámina de referencia: [`pantallas/00-sistema-mapa.svg`](pantallas/00-sistema-mapa.svg) (mapa base claro y oscuro, marcadores, ruta y geocerca).

## 1. Estilo del mapa base
Objetivo: que el mapa sea el fondo y que los datos de Waggo (paseador, perro, ruta, zona) sean lo único que resalta.

| Capa | Claro | Oscuro | Regla |
|---|---|---|---|
| Tierra | `#F7EFE9` | `#1A2531` | Derivada de `background`, apenas más neutra |
| Edificios | `#EEE2D8` | `#1F2B38` | Solo desde zoom 16; sin extrusión 3D |
| Parques | `#DDEBD8` | `#1D3330` | Sutil: son útiles para paseos, no deben competir con la ruta |
| Agua | `#CFE2F2` | `#14304A` | Sutil |
| Calles locales | `#FFFFFF` con borde `#E5D3C6` | `#283646` | Visibles desde zoom 14 |
| Avenidas | `#FCE6D8` con borde | `#3B4F63` | Un solo tono cálido; **nunca azul** (el azul es de la ruta) |
| Etiquetas | `#5C6B7A` con halo de tierra (4,8:1) | `#8FA5B8` (6,1:1) | Inter Medium; nombres de calle y parques; números de casa desde zoom 17 |
| POIs | Solo parques, veterinarias, tiendas de mascotas y transporte | igual | Ocultar comercios, restaurantes y publicidad; íconos en `muted` |
| Tráfico, relieve, 3D | Apagado | Apagado | Ruido sin valor para un paseo |

- **Mapbox**: un estilo en Mapbox Studio por tema (`waggo-light`, `waggo-dark`), partiendo de un estilo base y ajustando capas por nombre. Control total por capa y por zoom.
- **Google**: estilo con *cloud-based maps styling* (un Map ID por tema) o JSON de estilo. Control por tipo de elemento (road, poi, landscape…), menos fino por zoom. `sin verificar` en detalle para el SDK móvil (ver fuentes).
- **Tema**: el mapa sigue al `ThemeToggle` de la app, no al sistema.

## 2. Marcadores
Todos con borde blanco (claro) o `background` (oscuro) de 2 px y sombra `shadow.card`, para leerse sobre cualquier tile. Tamaño táctil ≥ 44 aunque el dibujo sea menor.

| Marcador | Forma | Color | Cuándo |
|---|---|---|---|
| Mi ubicación (dispositivo) | Punto de 16 + halo de precisión | `primary`, halo `accuracyHalo` | Cuando hay permiso |
| Recogida / casa | Gota de 36 con casa | `primary` | Al pedir, buscando, aceptado; también es el destino |
| Destino distinto (si el PO lo permite) | Gota con bandera | `secondary` | ⚠️ pregunta RF-007 ("¿la recogida es siempre la dirección del dueño?") |
| Perro(s) | Avatar circular de 32 con inicial o foto | `surface` + borde `primary` | Va pegado al paseador durante el paseo (un solo marcador con el perro, no dos) |
| Paseador en vivo | Avatar de 40 + **cono de rumbo** + halo pulsante | `primary`; cono `primary` al 35 % | En curso; pulso solo si la posición tiene < 30 s |
| Paseador con señal vieja | Avatar en gris + etiqueta "hace 2 min" | `muted` | Última posición > 30 s (decisión del PO, 2026-10-27) |
| Paseador cercano (vista del dueño) | Punto con persona | `secondary` | `nueva — requiere spec` (hoy el dueño no ve paseadores cercanos) |
| Grupo de paseadores o solicitudes | Círculo con número | `secondary` / `primary` | Cuando hay más de 1 en 48 px de pantalla |
| Solicitud (vista del paseador) | Píldora con lo que gana ("$18.400") | `surface` + texto `text`; seleccionada `primary` | Inicio del paseador |
| Alerta en el mapa | Rombo con "!" | `danger` | Punto donde salió de la zona, detención o emergencia |

## 3. Ruta y geocerca
| Elemento | Trazo | Color |
|---|---|---|
| Tramo recorrido | 6 px, sólido, extremos redondos, borde de 2 px | `primary` con borde `routeCasing` |
| Tramo pendiente (paseador hacia la recogida o de regreso) | 4 px, discontinuo 2–8 | `primary` al 60 % |
| Inicio del paseo | Círculo hueco de 12 | borde `primary` |
| Geocerca normal | Círculo discontinuo de 2 px + relleno al 8 % | `secondary` |
| Geocerca en alerta | Sólido de 3 px + relleno al 10 % + rombo en el punto de salida | `danger` |

La geocerca es un círculo de 1,5 km alrededor de la recogida (RF-009, ⚠️ provisional). Si el PO decide que el dueño la dibuje, el patrón de edición es "arrastra el borde"; hoy no se diseña.

## 4. Patrones de pantalla
- **Mapa a pantalla completa + bottom sheet** con tres alturas: colapsado (132: estado + una acción), medio (~45 %: detalle principal) y expandido (deja 84 px de mapa: todo el detalle, pagos, chat). El mapa ajusta su *padding* inferior a la altura del sheet para que el marcador centrado y la atribución nunca queden tapados.
- **Barra superior flotante**: atrás, título corto, y a la derecha avisos o menú. Sobre el mapa, con fondo `surface` y `shadow.fab`.
- **Botones flotantes** (48, a la derecha, sobre el sheet): recentrar (vuelve a seguir al paseador o a mi ubicación; se llena cuando está siguiendo), brújula (solo aparece si el mapa está rotado; toca para volver al norte), y en paseos activos el **SOS** rojo, separado del resto.
- **Búsqueda de dirección**: campo arriba con autocompletado (Mapbox Search / Google Places). Cada sugerencia muestra dirección principal y barrio; "Usar mi ubicación" fija arriba; "Mover el pin en el mapa" al final. El texto de atribución del proveedor de búsqueda va al pie de la lista (Google lo exige para Places).
- **Ajuste del pin**: el pin queda fijo en el centro y el mapa se mueve debajo; al soltar, se hace la geocodificación inversa y se muestra la dirección en la tarjeta ("Cra 7 # 45-10 · Chapinero"). Mientras se mueve: "Suelta para elegir este punto".
- **ETA y distancia**: en el sheet colapsado y en una etiqueta junto al marcador ("A 6 min · 450 m"). Durante el paseo: distancia recorrida, tiempo y hora de la última posición. ETA del paseador hacia la recogida: `nueva — requiere spec` (hoy no se rastrea antes de iniciar).

## 5. Permisos y fallos
| Situación | Qué ve el usuario | Copy |
|---|---|---|
| Ubicación nunca pedida | Pantalla previa antes del diálogo del sistema | "Para encontrar paseadores cerca y mostrar la recogida, Waggo usa tu ubicación mientras usas la app." [Permitir ubicación] [Escribir la dirección] |
| Ubicación denegada (dueño) | Banner `warning` + búsqueda manual | "No tenemos acceso a tu ubicación. Escribe la dirección o actívala en Ajustes." [Abrir Ajustes] |
| Solo "mientras se usa" (paseador en curso) | Banner fijo `warning` en el paseo | "Si bloqueas el teléfono dejaremos de compartir tu ruta. Permite la ubicación 'Siempre' para que el dueño te siga." [Abrir Ajustes] |
| Precisión aproximada (iOS) | Halo grande + banner | "Tu ubicación es aproximada. Activa 'Ubicación precisa' o ajusta el pin." |
| GPS impreciso (> 50 m ⚠️ provisional) | Halo grande en el punto | "Señal GPS débil. La posición puede variar." |
| Sin conexión | Banner `warning` arriba; datos en caché | "Sin conexión. Mostramos lo último que recibimos (hace 2 min)." |
| El mapa no carga (tiles, cuota, llave) | Fondo `surface2` con cuadrícula suave + toda la info en el sheet | "No pudimos cargar el mapa. El paseo sigue y te mostramos los datos aquí." [Reintentar] |
| Pérdida de señal del paseador | Marcador gris + "hace N min" + banner `info` | Dueño: "Bruno perdió la señal. Su teléfono guarda la ruta y la enviará al reconectarse." Paseador: "Sin señal. Guardamos 3 posiciones y las enviaremos al reconectar." |

El envío por lotes y el reintento ya existen (`useTrackingBeacon`, RF-008): el diseño solo los hace visibles.

## 6. Costos, batería y atribución (visibles en diseño)
- **Frecuencia**: el paseador envía cada ~15 s (⚠️ provisional, RF-008) y el dueño consulta cada 5 s. El marcador se interpola 1 s entre posiciones para no "saltar".
- **Batería**: en la pantalla del paseador, chip "Compartiendo ubicación · cada 15 s". **PROPUESTA**: "Ahorro de batería" (cada 30 s) cuando la batería baja de 20 %, con aviso al dueño "Actualización cada 30 s". Rover advierte del consumo del GPS en segundo plano ([App Store](https://apps.apple.com/us/app/rover-pet-sitters/id547320928)).
- **Atribución obligatoria**: siempre visible, nunca tapada por el sheet ni por botones.
  - Mapbox: logo (wordmark) más botón (i) con © Mapbox, © OpenStreetMap e "Improve this map"; se puede mover de esquina pero no ocultar ni alterar; si se quita el botón (i) hay que dar la atribución en texto y una forma de desactivar la telemetría. [Mapbox docs](https://docs.mapbox.com/help/dive-deeper/attribution/).
  - Google: logo de Google y atribución de datos visibles, sin alterar ni tapar, y cerca del mapa (no en un pie lejano). [Google Maps Platform policies](https://developers.google.com/maps/documentation/tile/policies).
  - En las SVG la atribución está en la esquina inferior izquierda, justo encima del sheet, con el botón (i) a la derecha.
- **Mapas pequeños** (mini mapa del inicio, resumen): usar imagen estática o el mismo SDK en modo *lite* sin gestos, para no contar una carga dinámica completa (el costo depende del proveedor, ver abajo).

## 7. Mapbox contra Google Maps (insumo para el PO)
| Criterio | Mapbox | Google Maps |
|---|---|---|
| Control del estilo | Total por capa y zoom (Studio) | Por tipo de elemento; *cloud styling* por Map ID |
| Librería en Expo | `@rnmapbox/maps`, requiere development build (no Expo Go) [repo](https://github.com/rnmapbox/maps) | `react-native-maps` con `PROVIDER_GOOGLE` (claves por plataforma) [Expo docs](https://docs.expo.dev/versions/v57.0.0/sdk/map-view/); `expo-maps` usa Google solo en Android y Apple Maps en iOS, y está en alfa [Expo docs](https://docs.expo.dev/versions/v57.0.0/sdk/maps/) |
| Web (la app también corre en web) | Mapbox GL JS (mismo estilo) | Maps JavaScript API (estilo por Map ID). `react-native-maps` no tiene web: `sin verificar` en Expo 57 |
| Costo móvil | Por usuarios activos al mes (MAU) del SDK; un usuario cuenta al ver un mapa [Mapbox docs](https://docs.mapbox.com/accounts/guides/pricing/). Tamaño del nivel gratis `sin verificar` | Desde 2025-03-01 el SDK móvil es un solo SKU "Maps SDK" [Google FAQ](https://developers.google.com/maps/billing-and-pricing/faq). "Gratis e ilimitado" en móvil: `sin verificar` (solo fuentes de terceros) |
| Costo web | Por cargas de mapa (`sin verificar` el monto) | "Dynamic Maps" por carga, con nivel gratis (`sin verificar` el monto) |
| Búsqueda de direcciones | Mapbox Search (Colombia: calidad `sin verificar`) | Places Autocomplete, muy buena cobertura de direcciones colombianas `sin verificar` |
| Atribución | Wordmark + (i) | Logo de Google + datos |
| Riesgo de diseño | Ninguno: el estilo propuesto se replica 1:1 | Avenidas y POIs: control menos fino; el resultado puede diferir un poco del SVG |

**Lo que cambia en el diseño según el proveedor**: solo el estilo (Studio vs. Map ID), el logo de atribución, el proveedor de autocompletado y su atribución al pie de la lista. Marcadores, ruta, geocerca, sheet y estados son propios de Waggo y no cambian.

Recomendación de diseño (no de negocio): **Mapbox** si el PO prioriza que el mapa luzca como la marca en móvil y web; **Google** si prioriza la calidad de direcciones en Colombia. La decisión de costo queda para el PO con cifras oficiales actualizadas.
