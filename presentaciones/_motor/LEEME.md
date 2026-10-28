# Motor de presentaciones de Waggo

CSS y JavaScript propios, sin dependencias ni red. Lo usan `comercial/`, `tecnica/` y lo usará `inversionistas/` sin cambios.

## Archivos
- `motor.css`: visor, láminas de 1920×1080 escaladas, pasos, controles, notas, impresión y movimiento reducido.
- `motor.js`: navegación (flechas, espacio, Enter, Re Pág/Av Pág, Inicio/Fin, clic, deslizamiento táctil, puntos de progreso), notas (`N`), pantalla completa (`F`), impresión a PDF y la API `window.Motor`.
- `tema.css`: tokens Seashell & Sapphire (los de `waggo-mobile/src/shared/ui/theme.ts`), tipografía y componentes base. `.oscuro` activa la paleta oscura y `.zafiro` el fondo de acento.

## Contrato HTML
```html
<link rel="stylesheet" href="../_motor/motor.css">
<link rel="stylesheet" href="../_motor/tema.css">
<!-- @font-face de Baloo 2 700 e Inter 400/500/700 apuntando a assets/fonts/ de la presentación -->
<main class="visor">
  <div class="lienzo">
    <section class="lamina" data-titulo="Título corto" data-pasos="2">
      <div class="contenido-lamina"> ... <p data-paso="1">aparece en el paso 1</p> ... </div>
      <aside class="notas"><p>Notas del orador</p></aside>
    </section>
  </div>
</main>
<script src="../_motor/motor.js"></script>
```
- `data-paso="n"`: el elemento aparece al avanzar `n` veces dentro de la lámina. `data-pasos="N"` fuerza más pasos (por ejemplo, para animar algo propio).
- `.contenido-lamina` es opcional; si existe, la lámina entra con un deslizamiento corto.
- Cada presentación lleva su `assets/fonts/` (los TTF se copian de `waggo-mobile/node_modules/@expo-google-fonts`).

## API
`Motor.ir(indice, paso)`, `siguiente()`, `anterior()`, `alCambiar(fn)` (recibe `{ indice, paso, pasos, cambioLamina, direccion, lamina, reducirMovimiento }`), `Motor.indice`, `paso`, `total`, `laminas`, `reducirMovimiento`. Eventos: `motor:cambio`, `motor:imprimir` (antes de imprimir), `motor:fin-impresion`.

## URL
`#3` abre la lámina 3, `#3-2` la lámina 3 en el paso 2. `?imprimir` muestra el modo de impresión (se usa para exportar el PDF), `?estatico` desactiva transiciones (capturas reproducibles).

## Exportar a PDF y capturar
`_herramientas/exportar-pdf.sh <carpeta>` genera `presentacion.pdf` (una lámina por página). `_herramientas/captura.sh <url> <png> [ancho] [alto]` toma una captura con Chrome sin interfaz y cierra solo el proceso que lanzó.

## Accesibilidad
Láminas inactivas con `inert` y `aria-hidden`; anuncio de la lámina en una región `aria-live`; controles con etiqueta y foco visible; `prefers-reduced-motion` anula transiciones y animaciones (y las del teléfono de la presentación comercial).
