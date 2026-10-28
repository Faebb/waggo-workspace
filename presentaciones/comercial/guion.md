# Guion de la presentación comercial

Para dueños de perros y paseadores. 18 láminas. Se abre con doble clic en `index.html` (PDF: `presentacion.pdf`, una lámina por página).

Teclas: flechas, espacio, clic, deslizar en pantallas táctiles, `N` notas del orador, `F` pantalla completa, `Ctrl+P` imprime a PDF. Cada «paso» avanza el teléfono como se navega la app.

## Láminas

| # | Lámina | Teléfono | Pasos | Fuente de lo que dice |
|---|---|---|---|---|
| 1 | Portada: «Paseos seguros para tu perro» | No | 0 | Texto de la bienvenida de la app (UX-001); logo `waggo-mobile/assets/brand/logo-full.png` |
| 2 | El problema: tres preocupaciones y su respuesta | No | 3 | Respuestas = funciones con spec `Implementada` (RF-002/003, RF-008, RF-012). Sin cifras de mercado |
| 3 | Bienvenida | Entra desde abajo | 3 | Pilares de la pantalla de bienvenida (`features/onboarding/model/valuePillars.ts`) |
| 4 | Cuéntanos de tu perro | Inicio → Agregar mi perro → formulario → Mis perros (empuja, toque, vuelve) | 2 | RF-004 (límite de 10 perros, ejemplo 13; notas médicas cifradas, `PetConfiguration.cs`) |
| 5 | Pide un paseo en tres pasos | ¿Dónde? → ¿Quién y cuánto? → Confirma → Buscando (tres empujes con toque) | 3 | RF-007 dueño, RF-019, RF-015 a RF-018 |
| 6 | Un paseador verificado va por tu perro | Buscando → en camino → la hoja de detalles **sube** | 2 | RF-006, RF-002/003 (verificación manual), RF-007 |
| 7 | Míralo pasear, en vivo | El marcador **camina por la ruta** y la ruta se dibuja; la hoja se expande | 2 | RF-008, RF-011 |
| 8 | Alertas | Alerta de zona → campana → Avisos (empuja) | 2 | RF-009, RF-010, RF-014 (sin push) |
| 9 | Emergencia con un toque | SOS → **hoja que sube con velo** → «Sí, es una emergencia» → «Mantén la calma» | 2 | RF-012 |
| 10 | Chat del paseo | Conversación | 2 | RF-013 |
| 11 | Termina y recién ahí se cobra | «En curso» → «Terminado» (el chip cambia de color y texto) | 2 | RF-015 a RF-018 |
| 12 | Precio claro, sin sorpresas | Cotizador público | 2 | RF-019 (valores de ejemplo) |
| 13 | Hazte paseador | Formulario → verificando → aprobado | 2 | RF-002/003 |
| 14 | Elige tus paseos en el mapa | Solicitudes → Aceptar → camino a la recogida → en curso | 2 | RF-007 paseador, RF-006 |
| 15 | Pasea, termina y cobra | En curso (marcador camina) → hoja «¿Terminar el paseo?» → Terminado → Ganancias; chip «En curso → Terminado» | 3 | RF-008, RF-015 a RF-018 |
| 16 | Lo que ya funciona hoy | No | 1 | Seis funciones con spec `Implementada` |
| 17 | Ya funciona en un celular real | No (dos capturas reales) | 1 | `presentaciones/_capturas/01-inicio.png` y `04-ver-paseo.png` (Samsung Galaxy A35); mapas **difuminados** |
| 18 | Pruébala hoy | Bienvenida | 0 | Único enlace: `https://app.mywaggo.com` (responde 200, comprobado el 2026-10-28) |

## De dónde salen las pantallas del teléfono
- 28 marcos de `design/propuesta/pantallas/*.svg` (diseño aprobado «Seashell & Sapphire»), extraídos con `_herramientas/extraer-pantallas.mjs` (lista en `_herramientas/pantallas-comercial.txt`). El archivo `presentaciones/comercial/assets/pantallas/` guarda cada marco.
- Cambios hechos a los marcos, **todos para que digan lo que la app hace hoy**:
  - La atribución del mapa decía «mapbox»; se reemplazó por «© OpenStreetMap contributors» (decisión del PO, 2026-10-27).
  - Se quitó la tarjeta de **calificación** del resumen del paseo (no existe en la app).
  - Se quitó el cálculo de **tiempo de llegada** (ETA) de «Paseo aceptado» del paseador (marcado `nueva — requiere spec`).
  - Se quitó el aviso «¿Cómo recibes los pagos?» de Ganancias (no está en la app).
  - Textos corregidos al de la app: «Avisaremos de inmediato al dueño…», «Escribir al dueño», «Tócalo al entregar a los perros en la recogida.».
- Marcos de login y registro **no se usan**: muestran Google/Microsoft, cuya spec está en estado `Lista` (no implementada en la app).

## Fidelidad: lo que no se pudo igualar al 100 %
Las capturas reales muestran que la app desplegada difiere del diseño en detalles de texto y de estructura (por ejemplo, el botón «Emergencia» es un botón propio y la pantalla del paseo es una tarjeta sobre el mapa, no una hoja inferior; el inicio dice «Hola» sin nombre). El teléfono animado usa el diseño aprobado; la lámina 17 muestra la app real. **Pendiente del PO**: reemplazar los marcos del diseño por capturas reales de cada pantalla cuando haya cuenta de prueba, o confirmar que se acepta el diseño como representación.

## Datos de ejemplo
Nombres (Luna, Max, Bruno), precios ($ 23.000, $ 18.400, comisión $ 4.600), horas y rutas son datos de ejemplo del diseño. Las tarifas de la spec RF-019 son provisionales (⚠️): por eso las láminas 5, 12 y 15 lo dicen en pantalla.

## Lo que NO se promete
Notificaciones push, login con Google o Microsoft, calificaciones, cobro real con tarjeta (la pasarela es simulada), verificación biométrica o de antecedentes, apps de iOS y Android en tiendas, lista de espera.

## Pendiente de confirmar por el PO
1. Canal de contacto o lista de espera (no se inventó ningún enlace).
2. Fecha de las apps de iOS y Android.
3. Si las capturas reales (con mapas difuminados) pueden ser públicas.
4. Tarifas y comisión del piloto (hoy provisionales).
5. Capturas reales de las pantallas del paseador, que no se tomaron.

## Cómo se verificó
- Capturas con Chrome sin interfaz a 1920×1080 (`_herramientas/captura.sh`, con `?estatico` para estados finales deterministas).
- Navegación completa por script: 48 avances seguidos sin errores de JavaScript, con las pantallas, hojas y velos esperados en cada paso.
- PDF: `_herramientas/exportar-pdf.sh comercial` → 18 páginas.
- No se pudo verificar en esta máquina: la reproducción **fluida** de las animaciones a velocidad real (Chrome sin interfaz no avanza los cuadros de animación), el comportamiento en Safari y Firefox, ni el contraste calculado con una herramienta automática (se usan los tokens de contraste de la app).
