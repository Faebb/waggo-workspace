# Borrador de ADR — Mapas con OpenStreetMap (Leaflet en WebView/iframe) y búsqueda con Nominatim

> Estado: **borrador** (decisión del PO tomada el 2026-10-27; falta pasarlo al vault como ADR numerado con `/new-adr`).
> Autor: agente `design-implementer` · Afecta: RF-006 (vista), RF-007 (dueño y paseador), RF-008, RF-009 (geocerca en el mapa) · Repos: `waggo-mobile` (sin cambios de API).

## Contexto
La propuesta de diseño (`design/propuesta/04-mapas.md`) definió mapas reales (tiles, calles, GPS) y dejó abierta la pregunta "¿Mapbox o Google?". Hasta ahora la ruta del paseo era un dibujo SVG sin calles y el paso "¿Dónde?" de pedir paseo era solo un campo de texto. La app corre en iOS, Android (también en **Expo Go**, sin development build) y **web**.

## Decisión
1. **Proveedor**: **OpenStreetMap** (datos y tiles), por decisión del PO. Vista inicial: Colombia (lat 9.411, lng −73.597, zoom 7); al fijar un punto, zoom 15.
2. **Cómo se dibuja**: un solo componente `src/shared/map/WaggoMap` que carga **Leaflet 1.9.4** (versión fijada, cdnjs, con **SRI**) dentro de:
   - `react-native-webview` en iOS/Android (`MapFrame.native.tsx`; viene en Expo Go, se instaló con `npx expo install`);
   - un `<iframe srcDoc sandbox="allow-scripts …">` en web (`MapFrame.web.tsx`).
   El HTML es el mismo (`buildMapHtml`, función pura) y la app habla con el mapa con mensajes **tipados y validados con Zod** (`protocol.ts`): app→mapa `setView`, `fitBounds`, `setMarkers`, `setRoute`, `setGeofence`, `setTheme`; mapa→app `ready`, `moveStart`, `moveEnd` (centro, zoom, si lo movió el usuario), `markerTap`, `tileError`, `error`.
3. **Tiles**: `EXPO_PUBLIC_MAP_TILE_URL` (plantilla https `{z}/{x}/{y}`); vacía → `https://tile.openstreetmap.org/{z}/{x}/{y}.png`. La página se carga con `baseUrl` `https://waggo.app` (Referer identificable) y en native el User-Agent termina en `Waggo/1.0 (+https://waggo.app)`.
4. **Búsqueda de direcciones**: **Nominatim** (`src/features/places`), con su política: ≤ 1 petición por segundo (cola en el cliente), **sin autocompletar** (se busca al tocar "Buscar"), User-Agent identificable en native (en web el navegador no deja cambiarlo; identifica el Referer), `countrycodes=co`, `accept-language=es`, caché por consulta y por punto (5 decimales). Sin claves ni secretos.
5. **Atribución**: "© OpenStreetMap contributors" con enlace a la página de copyright, siempre visible (abajo a la izquierda; los botones flotantes van a la derecha). En la lista de resultados: "Búsqueda: © OpenStreetMap contributors (Nominatim)".
6. **Tema oscuro**: los tiles de OSM son claros. El tema oscuro aplica un **filtro CSS solo a la capa de tiles** (`invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9) saturate(0.6)`); marcadores, ruta y zona usan la paleta de la app de cada tema.
7. **"Abrir en Maps"** sigue siendo un enlace a Google Maps (no es un mapa embebido ni tiene costo).

## Alternativas consideradas
| Opción | A favor | En contra |
|---|---|---|
| **Mapbox** (`@rnmapbox/maps` + Mapbox GL JS en web) | Estilo de marca por capa y zoom (Studio), vector tiles, buen rendimiento | Requiere development build (no Expo Go); dos librerías (móvil y web); cuenta y token; costo por MAU/cargas (cifras sin verificar) |
| **Google Maps** (`react-native-maps` + Maps JavaScript API) | Mejor cobertura de direcciones en Colombia (Places) | Claves por plataforma, facturación, `react-native-maps` sin web; estilo menos fino; atribución y reglas de Places |
| **OSM con Leaflet en WebView/iframe** (elegida) | Funciona igual en iOS, Android (Expo Go) y web con un solo código; sin claves ni costo de licencia; datos abiertos | Estilo no personalizable (tiles ráster); rendimiento de WebView; tiles públicos con límites de uso; búsqueda menos buena que Places |
| OSM con `react-native-maps` (`UrlTile`) | Mapa nativo | Sin web; en iOS usa Apple Maps debajo; no simplifica |

## Consecuencias
- **Límites de los tiles públicos**: `tile.openstreetmap.org` es para uso ligero; su política ([operations.osmfoundation.org/policies/tiles](https://operations.osmfoundation.org/policies/tiles/)) prohíbe el uso intensivo y puede bloquear la app sin aviso. **Antes de lanzar** hay que pasar a un proveedor de tiles (comercial o autoalojado) cambiando `EXPO_PUBLIC_MAP_TILE_URL`; el código no cambia.
- **Nominatim público**: mismo caso ([política](https://operations.osmfoundation.org/policies/nominatim/)): máximo 1 req/s por aplicación y nada de autocompletar. Con muchos usuarios a la vez el límite se alcanza rápido (es por app, no por usuario): antes de lanzar, un geocodificador propio o de pago. La calidad de direcciones colombianas ("Carrera 7 # 45-10") es irregular; por eso la dirección queda editable y lo escrito por el dueño no se reemplaza.
- **Diseño**: el estilo del mapa base de `04-mapas.md` §1 (colores por capa) **no se puede aplicar**; se ve el estilo estándar de OSM (y su versión invertida en oscuro). La búsqueda pierde el autocompletado. Marcadores, ruta, zona, estados y atribución sí siguen el diseño.
- **WebView + Leaflet, costos**: cada mapa es una página web (memoria y arranque más altos que un mapa nativo; el mini mapa del inicio también es un WebView, sin gestos). Leaflet se baja del CDN la primera vez (sin conexión inicial el mapa muestra "No pudimos cargar el mapa." con "Reintentar" y la pantalla sigue funcionando). Los gestos del mapa dentro de un `ScrollView` pueden competir con el desplazamiento en Android (`nestedScrollEnabled`). Hay que verificarlo en dispositivos reales.
- **Seguridad**: el HTML escapa los datos embebidos, los textos de los marcadores se insertan con `textContent`, la app valida cada mensaje con Zod, el iframe va en *sandbox* y el WebView solo carga la propia página (los enlaces se abren en el navegador). Leaflet va con SRI.
- **Pruebas**: `react-native-webview` se simula en Jest (`__mocks__/react-native-webview.tsx`) y `src/test/mapBridge.ts` permite emitir eventos del mapa y leer los comandos enviados.
- **Sin rastreo en segundo plano**: el envío de posiciones sigue solo con la app abierta (no cambia con esta decisión; el permiso "Siempre" exige development build y TaskManager).

## Pendientes para el PO
- Elegir el proveedor de tiles y de geocodificación para producción (o autoalojarlos) y su presupuesto.
- ¿Rastreo en segundo plano para el paseador (development build)?
- ¿Ruta por calles y ETA del paseador hacia la recogida? Requiere un servicio de rutas (OSRM/GraphHopper/proveedor) y spec.
