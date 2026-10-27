# 06 — Inventario de pantallas

Una fila por pantalla. **Archivo** = `pantallas/<archivo>.svg` (un marco de 390×844 por estado, salvo donde se indica). Prioridad: **MVP** o **Mejora**. **¿Rompe spec?**: el cambio contradice algo escrito en una spec existente (hay que actualizarla si el PO aprueba).

| # | Pantalla | Rol | RF de origen | Ruta hoy | Estados diseñados | Mapa | Archivo | Prioridad | ¿Rompe spec? |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Bienvenida | Todos | UX-001 | `/` | Claro, oscuro | No | `comun-onboarding-bienvenida` | MVP | Sí: UX-001 ej. 3 (aviso "muy pronto"), botón único y cabecera (logo completo en lugar de la pata) |
| 2 | Iniciar sesión (+ Google/Microsoft) | Todos | RF-005, login social | `/login` | Por defecto, credenciales incorrectas, demasiados intentos, cuenta sin confirmar, error del proveedor, sesión expirada, entrando | No | `comun-auth-login` | MVP | No |
| 3 | Crear cuenta | Todos | RF-001, login social | `/registro` | Reglas en vivo, correo ya registrado, enviando | No | `comun-auth-registro` | MVP | No |
| 4 | Confirmar correo | Todos | RF-001 | `/confirmar` | Enviado, confirmada, vencido, inválido | No | `comun-auth-confirmar-correo` | MVP | No |
| 5 | Recuperar contraseña | Todos | — | — | (sin SVG) | No | — | MVP | `nueva — requiere spec` (pregunta abierta en RF-001) |
| 6 | Cotizador público | Todos | RF-019 | `/cotizar` | Con precio, cargando, error | No | `comun-cotizar-tarifa` | Mejora | No |
| 7 | Inicio del dueño | Dueño | RF-007, RF-014 | `/inicio` | Primer uso, con paseo en curso (mini mapa), cargando, oscuro | Mini | `dueno-inicio-tab` | MVP | No |
| 8 | Mis perros | Dueño | RF-004 | `/mascotas` | Con perros, vacía, error | No | `dueno-mascotas-lista` | MVP | No |
| 9 | Agregar perro | Dueño | RF-004 | `/mascotas/nueva` | Formulario, errores, límite | No | `dueno-mascotas-agregar` | MVP | No (agrega fecha de nacimiento, ya prevista) |
| 10 | Detalle del perro | Dueño | RF-004 (`GET /pets/{id}`) | — | Detalle claro/oscuro | No | `dueno-mascotas-detalle` | Mejora | No (ruta nueva sobre endpoint existente) |
| 11 | Pedir paseo 1 · ¿Dónde? | Dueño | RF-007 | `/paseos/nuevo` | Pin en mi ubicación, buscar dirección, moviendo pin, ubicación denegada, aproximada, oscuro | **Sí** | `dueno-pedir-paseo-donde` | MVP | Sí: RF-007 dueño (una pantalla → tres pasos) |
| 12 | Pedir paseo 2 · ¿Quién y cuánto? | Dueño | RF-007, RF-019 | `/paseos/nuevo` | Con precio en vivo, sin perros | No | `dueno-pedir-paseo-detalles` | MVP | Sí (mismo cambio) |
| 13 | Pedir paseo 3 · Confirmar y pagar | Dueño | RF-019, RF-015 | `/paseos/nuevo` | Resumen, pidiendo, pago rechazado | Mini | `dueno-pedir-paseo-confirmar` | MVP | Sí (mismo cambio) |
| 14 | Buscando paseador | Dueño | RF-007, RF-006 | `/paseos/[id]` | Buscando, confirmar cancelación, nadie aceptó | **Sí** | `dueno-paseo-buscando` | MVP | "Nadie aceptó": `nueva — requiere spec` |
| 15 | Paseo aceptado | Dueño | RF-007 | `/paseos/[id]` | Sheet medio, expandido | **Sí** | `dueno-paseo-aceptado` | MVP | No |
| 16 | Paseo en vivo | Dueño | RF-008, RF-011 | `/paseos/[id]` | Sheet medio, colapsado, expandido, señal perdida, mapa no carga, oscuro | **Sí** | `dueno-paseo-en-vivo` | MVP | Sí: RF-008 "ruta SVG sin mapa base" (ya anticipado) |
| 17 | Alertas automáticas | Dueño | RF-009, RF-010 | `/paseos/[id]` | Salió de la zona, detenido, oscuro | **Sí** | `dueno-paseo-alertas` | MVP | No |
| 18 | Resumen del paseo | Dueño | RF-011, RF-016 | `/paseos/[id]` | Terminado y pagado, cancelado | **Sí** | `dueno-paseo-resumen` | MVP | Calificación: `nueva — requiere spec` |
| 19 | Mis paseos | Dueño | RF-007 | `/paseos` | Con paseos, vacía | No | `dueno-paseos-lista` | MVP | No |
| 20 | Chat del paseo | Ambos | RF-013 | `/paseos/[id]/chat`, `/paseador/[id]/chat` | Activa, sin mensajes, no enviado, solo lectura, oscuro | No | `comun-paseo-chat` | MVP | Spec desactualizada (burbujas amarillas); respuestas rápidas = mejora |
| 21 | Emergencia | Ambos | RF-012 | hoja sobre el paseo | Confirmar, enviada, recibida, oscuro | **Sí** | `comun-paseo-emergencia` | MVP | No (tipo "Se soltó/Se lastimó" usa el campo `message`) |
| 22 | Avisos | Ambos | RF-014 | `/notificaciones`, `/paseador/notificaciones` | Con urgentes, vacía, error, oscuro | No | `comun-avisos-bandeja` | MVP | Spec desactualizada ("sin íconos", ADR-013) |
| 23 | Configuración (dueño) | Dueño | RF-001/RF-005 perfil | `/configuracion` | Claro, oscuro | No | `comun-configuracion-cuenta` | MVP | No |
| 24 | Cuenta y seguridad | Ambos | RF-001/RF-005 perfil (Borrador) | — | Cuenta, eliminar cuenta | No | `comun-configuracion-cuenta` | Mejora | Spec en Borrador |
| 25 | Información personal | Ambos | sin RF explícito (existe en código) | `/configuracion/info`, `/editar` | (sin SVG nuevo: se conserva) | No | — | MVP | — |
| 26 | Hazte paseador | Paseador | RF-002 | `/paseador` (sin perfil) | Formulario, errores | No | `paseador-onboarding-hazte-paseador` | MVP | No |
| 27 | Verificación | Paseador | RF-003 | `/paseador` (pendiente/rechazado) | Verificando, rechazado, aprobado | No | `paseador-onboarding-verificacion` | MVP | No |
| 28 | Solicitudes cerca (inicio) | Paseador | RF-007, RF-006 | `/paseador` | Mapa y lista, sin ubicación, sin solicitudes, 409, sin conexión, oscuro | **Sí** | `paseador-inicio-solicitudes` | MVP | No |
| 29 | Paseo aceptado (camino a la recogida) | Paseador | RF-007 | `/paseador/[id]` | Camino a la recogida, dueño canceló | **Sí** | `paseador-paseo-asignado` | MVP | ETA: `nueva — requiere spec` |
| 30 | Paseo en curso | Paseador | RF-008 | `/paseador/[id]` | Compartiendo, permiso solo mientras se usa, sin señal, confirmar terminar, oscuro | **Sí** | `paseador-paseo-en-curso` | MVP | No |
| 31 | Paseo terminado | Paseador | RF-011, RF-017 | `/paseador/[id]` | Pagado | **Sí** | `paseador-paseo-terminado` | MVP | No |
| 32 | Ganancias | Paseador | RF-017 | (dentro de `/paseador`) | Con ganancias, vacía, oscuro | No | `paseador-ganancias-tab` | Mejora | Sí: ADR-019 (pestaña nueva) |
| 33 | Tus paseos | Paseador | RF-007 | (dentro de `/paseador`) | Lista | No | `paseador-paseos-tab` | Mejora | Sí: ADR-019 (pestaña nueva) |
| 34 | Configuración (paseador) | Paseador | RF-001/RF-005 perfil | `/paseador/configuracion` | Por defecto | No | `comun-navegacion-tabs` (3.er marco) | MVP | No |
| 35 | Verificación de paseadores (admin) | Admin | RF-002, RF-003 (panel slice 1) | `/admin` | Pendientes, rechazar con motivo, aprobado, vacía, error | No | `admin-verificacion-cola` | MVP | No |
| 36 | Operación (admin) | Admin | RF-012, panel slices 2–3 | — | Alertas activas, paseos en curso, oscuro; tablet/web 1024×768 | **Sí** | `admin-operacion-mapa`, `admin-operacion-tablet-web` | Mejora | Necesita endpoint global (spec del panel) |
| — | Splash | Todos | — (marca) | arranque | Claro, oscuro | — | `00-sistema-marca` | MVP | `nueva — requiere spec` (hoy es la plantilla de Expo) |
| — | Pestañas de ambos roles | Ambos | ADR-019 | `(tabs)`, `(walker-tabs)` | Variantes claro, oscuro | — | `comun-navegacion-tabs` | MVP | Paseador: sí (ver 32–33) |
| — | Calificar al paseador | Dueño | — | — | Tarjeta dentro del resumen (18) | — | `dueno-paseo-resumen` | Mejora | `nueva — requiere spec` |
| — | Paseadores cercanos en el mapa del dueño | Dueño | — | — | Solo marcador en el sistema de mapas | **Sí** | `00-sistema-mapa` | Mejora | `nueva — requiere spec` (privacidad) |

**Totales**: 34 pantallas con SVG (más 4 láminas de sistema), **121 marcos** en 37 archivos: 111 marcos de pantalla y estado, y 10 de lámina (componentes ×2, mapa ×2, pestañas ×2, marca ×4: tablero claro y oscuro, splash claro y oscuro). 19 marcos en tema oscuro. 16 archivos llevan mapa base estilizado (a pantalla completa o mini mapa).

Láminas de sistema: `00-sistema-marca.svg` (logo, ícono de app, prueba de tamaño, colores y splash; ver [08](08-marca.md)), `00-sistema-componentes.svg` (820×1480, claro y oscuro), `00-sistema-mapa.svg` (mapa base claro y oscuro con leyenda), `comun-navegacion-tabs.svg`.
