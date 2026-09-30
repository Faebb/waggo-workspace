---
rf: UX-001
titulo: Pantalla de bienvenida
estado: Implementada
modulo: Onboarding
sprint: 1
prioridad: Media
repos: [waggo-mobile]
actualizado: 2026-09-30
---

# UX-001 — Pantalla de bienvenida

> Vault: `01 Proyecto/Visión del proyecto.md` · `02 Arquitectura/Frontend - Expo feature-based.md` · Roadmap: sprint 1 (antes del registro RF-001)

Primera vista visual de la app. **No corresponde a un RF del SRS**: es la puerta de entrada que después llevará al registro (RF-001, RF-002) y al inicio de sesión (RF-005). Por eso usa el prefijo `UX-` en lugar de `RF-`. Solo afecta a `waggo-mobile` (no hay contrato de API).

> [!note] Decisiones asumidas por el desarrollador
> El PO no la ha validado todavía. Los textos y el orden de los pilares salen de la *Visión del proyecto*. Se revisan en la demo del sprint.

## Historia de usuario
Como **dueño que abre Waggo por primera vez** quiero **entender en segundos qué ofrece la app** para **decidir si le confío el paseo de mi perro**.

## Criterios de aceptación
- [x] Al abrir la app se ve la marca, un titular y los tres pilares de la propuesta de valor: confianza, paseo en vivo y pago al final.
- [x] Un botón principal lleva al cotizador de tarifa (RF-019), la única función disponible hoy.
- [x] Mientras no exista el registro, se informa que la creación de cuentas llega pronto. No se muestran botones que no hacen nada.
- [x] Es accesible: el titular tiene rol `header` y el botón tiene rol `button` con un nombre claro.

## Tabla de ejemplos
| # | Entrada | Resultado esperado | Tipo |
|---|---|---|---|
| 1 | Abrir la app | Se ven "Waggo", el titular (rol `header`) y los pilares "Paseadores verificados", "Paseo en vivo" y "Pagas al final", cada uno con su descripción | Feliz |
| 2 | Tocar "Cotizar un paseo" | Se abre la ruta `/cotizar` con el cotizador de RF-019 | Feliz |
| 3 | El registro aún no existe | Se ve "Muy pronto podrás crear tu cuenta como dueño o paseador." y ningún botón de registro ni de inicio de sesión | Límite |
| 4 | `Button` compartido deshabilitado | Tocarlo no ejecuta la acción; expone `accessibilityState.disabled` | Error |
| 5 | `Button` compartido, variante `secondary` | Se renderiza con su texto y ejecuta la acción al tocarlo | Feliz |

## Reglas de UI
| Regla | Valor | Origen |
|---|---|---|
| Titular | "Paseos seguros para tu perro" | Visión del proyecto |
| Pilares | Confianza (RF-002, RF-003) · Seguridad en vivo (RF-008 – RF-012) · Pagos (RF-015 – RF-017) | Visión del proyecto |
| Idioma | Español | ADR-008 |
| Colores y espaciados | Tokens de `src/shared/ui/theme.ts`, sin valores sueltos | Convenciones de código |

## Contrato de API
No aplica: la pantalla es estática.

## Diseño
- `src/app/index.tsx` monta la `WelcomeScreen` sin encabezado y navega a `/cotizar` con `router.push`.
- `src/app/cotizar.tsx` monta el `FareQuoteScreen` existente, con el título "Cotizar paseo".
- `features/onboarding`: `WelcomeScreen` es presentacional y recibe `onQuotePress`. `ValueCard` pinta un pilar, y los pilares viven en `model/valuePillars.ts`.
- `shared/ui/Button` tiene variantes `primary` y `secondary` y soporta `disabled`. `theme.ts` suma los tokens `radius` y `typography`, el espaciado `xl` y el color `primarySoft`.
- El contenido se limita a 480 px de ancho y se centra, para que en tablet y web se lea como una columna.

## Plan TDD (mobile)
1. `Button.test.tsx`: ejemplos 4 y 5, más la variante `primary`.
2. `ValueCard.test.tsx`: pinta el título y la descripción de un pilar.
3. `WelcomeScreen.test.tsx`: ejemplos 1, 2 (llama a `onQuotePress`) y 3.

## Preguntas abiertas para el PO
- [ ] ¿Textos definitivos del titular y los pilares?
- [ ] ¿Logo e identidad visual oficiales? Hoy se usa una huella (🐾) sobre los colores del tema.

## Trazabilidad
| Repo | Archivos | Pruebas |
|---|---|---|
| waggo-mobile | `src/app/{index.tsx, cotizar.tsx}`, `src/features/onboarding/{screens/WelcomeScreen.tsx, components/ValueCard.tsx, model/valuePillars.ts, index.ts}`, `src/shared/ui/{Button.tsx, theme.ts}` | `WelcomeScreen.test.tsx` (ejemplos 1–3), `ValueCard.test.tsx`, `Button.test.tsx` (ejemplos 4–5) |
